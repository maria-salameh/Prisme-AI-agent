// Serveur statique officiel du squelette étudiant.

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { creerFournisseur, lireRouteDepuisFiche } from "./fournisseur.mjs";
import { repondre } from "../public/js/brain.js";
import { execFileSync } from "node:child_process";

const TYPES_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
const ASSISTANT = "Prisme";
const REGLES = [
  {
    motCle: "pause",
    reponse:
      "Prisme : une pause de 10 minutes est prévue au milieu de chaque demi-journée.",
  },
  {
    motCle: "objectif",
    reponse:
      "Prisme vous accompagne pour valider chaque palier dans les temps.",
  },
  {
    motCle: "clavier",
    reponse:
      "Prisme : utilisez Tab puis Entrée pour envoyer votre message sans souris.",
  },
];

// api : une fonction async (req, res) qui rend true quand elle a traité la requête (le fournisseur simulé).
export function demarrer({ port = 0, racine, api = null } = {}) {
  const dossierServeur = path.dirname(fileURLToPath(import.meta.url));
  const base = racine
    ? path.resolve(racine)
    : path.resolve(dossierServeur, "..");
  const dossierPublic = fs.existsSync(path.join(base, "public"))
    ? path.join(base, "public")
    : base;

  const serveur = http.createServer(async (req, res) => {
    if (api && (await api(req, res))) return;

    const urlObj = new URL(req.url ?? "/", "http://127.0.0.1");

    if (urlObj.pathname === "/version.json" && req.method === "GET") {
      const sha = execFileSync("git", ["rev-parse", "HEAD"]).toString().trim();
      repondreJson(res, 200, { sha });
      return;
    }

    if (urlObj.pathname === "/api/health" && req.method === "GET") {
      repondreJson(res, 200, { status: "ok" });
      return;
    }

    if (urlObj.pathname === "/api/chat") {
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        repondreJson(res, 405, { erreur: "POST attendu" });
        return;
      }

      let corps;
      try {
        corps = JSON.parse(await lireCorps(req));
      } catch {
        repondreJson(res, 400, { erreur: "JSON illisible" });
        return;
      }

      if (corps === null || typeof corps !== "object" || Array.isArray(corps)) {
        repondreJson(res, 400, { erreur: "corps invalide" });
        return;
      }

      const message = corps.message;
      if (
        typeof message !== "string" ||
        message.trim() === "" ||
        message.length > 235
      ) {
        repondreJson(res, 400, { erreur: "message invalide" });
        return;
      }
      repondreJson(res, 200, {
        reply: repondre(message, REGLES, ASSISTANT),
      });
      return;
    }

    const cheminDemande =
      urlObj.pathname === "/" ? "/index.html" : urlObj.pathname;
    const relatif = cheminDemande.replace(/^\/+/, "");
    const cible = path.resolve(dossierPublic, relatif);
    const relVerif = path.relative(dossierPublic, cible);

    if (relVerif.startsWith("..") || path.isAbsolute(relVerif)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Accès interdit");
      return;
    }

    if (!fs.existsSync(cible) || !fs.statSync(cible).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Introuvable");
      return;
    }

    const ext = path.extname(cible).toLowerCase();
    const mime = TYPES_MIME[ext] ?? "application/octet-stream";
    const contenu = fs.readFileSync(cible);
    res.writeHead(200, { "Content-Type": mime });
    res.end(contenu);
  });

  return new Promise((resolve, reject) => {
    serveur.once("error", reject);
    serveur.listen(port, "127.0.0.1", () => {
      const adresse = serveur.address();
      const portReel =
        typeof adresse === "object" && adresse ? adresse.port : port;
      const url = `http://127.0.0.1:${portReel}`;
      const fermer = () =>
        new Promise((res) => {
          serveur.closeAllConnections?.();
          serveur.close(() => res());
        });
      resolve({ url, port: portReel, fermer });
    });
  });
}

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    let texte = "";
    req.on("data", (morceau) => {
      texte += morceau;
    });
    req.on("end", () => resolve(texte));
    req.on("error", reject);
  });
}

function repondreJson(res, statut, objet) {
  res.writeHead(statut, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(objet));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT ?? 3000);
  const racine = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const fournisseur = creerFournisseur({
    routeSuggestions: lireRouteDepuisFiche(racine),
    scenario: {
      chat: process.env.CAPWEB_SCENARIO ?? "normal",
      suggestions: process.env.CAPWEB_SCENARIO === "500" ? "500" : "normal",
    },
  });
  const { url } = await demarrer({ port, racine, api: fournisseur.gerer });
  console.log(`Serveur Cap Web démarré sur ${url}`);
}


