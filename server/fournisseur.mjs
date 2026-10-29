// Le fournisseur simulé : une fausse API, déterministe, que le serveur de développement monte devant
// votre page. Le correcteur utilise la même pour rejouer, à l'identique, une panne ou une lenteur.
//   GET  <route de suggestions de votre variante>   ->  { suggestions: [...] }
//   POST /api/chat   { message }                    ->  { reply }
// Pour essayer une panne chez vous : CAPWEB_SCENARIO=500 npm start (ou coupure, lent, tres-lent).

import fs from "node:fs";
import path from "node:path";

export const SUGGESTIONS = [
  "Quels sont les horaires ?",
  "Comment poser une question ?",
  "Où trouver mes consignes ?",
  "À quoi sert cet assistant ?"
];
export const DELAI_LENT_MS = 1200;
export const DELAI_TRES_LENT_MS = 4000;

export function lireRouteDepuisFiche(racine) {
  try {
    const fiche = fs.readFileSync(path.join(racine, "VARIANTE.md"), "utf8");
    return /route de suggestions est `([^`]+)`/.exec(fiche)?.[1] ?? null;
  } catch {
    return null;
  }
}

function lireCorps(req) {
  return new Promise((resolve) => {
    const morceaux = [];
    req.on("data", (m) => morceaux.push(m));
    req.on("end", () => resolve(Buffer.concat(morceaux).toString("utf8")));
    req.on("error", () => resolve(""));
  });
}

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// scenario : { suggestions: "normal"|"500"|"lent"|"vide", chat: "normal"|"500"|"coupure"|"lent"|"tres-lent" }
export function creerFournisseur({ routeSuggestions, scenario = {} } = {}) {
  const etat = { suggestions: "normal", chat: "normal", ...scenario };
  const requetes = [];

  function repondreJson(res, code, objet) {
    res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(objet));
  }

  // Rend true quand la requête est pour l'API (et qu'elle est traitée).
  async function gerer(req, res) {
    const chemin = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
    const suggestions = req.method === "GET" && routeSuggestions && chemin === routeSuggestions;
    const chat = chemin === "/api/chat";
    if (!suggestions && !chat) return false;
    const corps = req.method === "POST" ? await lireCorps(req) : "";
    requetes.push({ methode: req.method, chemin, corps, contentType: req.headers["content-type"] ?? "", a: Date.now() });

    if (suggestions) {
      if (etat.suggestions === "500") return repondreJson(res, 500, { erreur: "panne simulée" }), true;
      if (etat.suggestions === "lent") await attendre(DELAI_LENT_MS);
      return repondreJson(res, 200, { suggestions: etat.suggestions === "vide" ? [] : SUGGESTIONS }), true;
    }
    if (req.method !== "POST") return repondreJson(res, 405, { erreur: "POST attendu" }), true;
    if (etat.chat === "500") return repondreJson(res, 500, { erreur: "panne simulée" }), true;
    if (etat.chat === "coupure") return req.socket.destroy(), true;
    if (etat.chat === "lent") await attendre(DELAI_LENT_MS);
    if (etat.chat === "tres-lent") await attendre(DELAI_TRES_LENT_MS);
    let message = "";
    try {
      message = String(JSON.parse(corps).message ?? "");
    } catch {
      return repondreJson(res, 400, { erreur: "JSON illisible" }), true;
    }
    if (res.writableEnded || res.destroyed) return true;
    return repondreJson(res, 200, { reply: `Réponse distante : ${message}` }), true;
  }

  return {
    gerer,
    requetes,
    definir(changement) {
      Object.assign(etat, changement);
    },
    scenario: () => ({ ...etat })
  };
}
