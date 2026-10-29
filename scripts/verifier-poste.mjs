// La veille au soir : npm run verifier-poste
// Je contrôle votre poste ; si tout est bon, j'écris J0.md, je le commite et je le pousse.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function evaluerNode(version) {
  const major = Number(String(version).replace(/^v/, "").split(".")[0]);
  return major >= 24
    ? { ok: true }
    : { ok: false, conseil: "Installez Node 24 ou plus : https://nodejs.org (prenez la version LTS la plus récente), puis rouvrez le terminal." };
}

export function evaluerGit(version) {
  const [maj, min] = String(version).split(".").map(Number);
  return maj > 2 || (maj === 2 && min >= 30)
    ? { ok: true }
    : { ok: false, conseil: "Mettez Git à jour : https://git-scm.com/downloads" };
}

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export function verifier({ cwd = process.cwd(), nodeVersion = process.version } = {}) {
  const lignes = [];
  let tout = true;
  const noter = (ok, texte, conseil) => {
    lignes.push(`${ok ? "✔" : "✗"} ${texte}`);
    if (!ok) {
      tout = false;
      lignes.push(`    ${conseil}`);
    }
  };

  const node = evaluerNode(nodeVersion);
  noter(node.ok, `Node ${nodeVersion}`, node.conseil);

  let versionGit = null;
  try {
    versionGit = git(cwd, "--version").replace(/^git version\s+/, "").split(" ")[0];
  } catch {
    // git absent
  }
  if (!versionGit) {
    noter(false, "Git introuvable", "Installez Git : https://git-scm.com/downloads, puis rouvrez le terminal.");
    return { ok: false, lignes };
  }
  const g = evaluerGit(versionGit);
  noter(g.ok, `Git ${versionGit}`, g.conseil);

  let auteur = "";
  let email = "";
  try { auteur = git(cwd, "config", "user.name"); } catch { /* absent */ }
  try { email = git(cwd, "config", "user.email"); } catch { /* absent */ }
  noter(auteur.length > 0, `Nom pour Git : ${auteur || "absent"}`, 'Tapez : git config --global user.name "Prénom Nom"');
  noter(/.+@.+/.test(email), `E-mail pour Git : ${email || "absent"}`, 'Tapez : git config --global user.email "vous@exemple.fr"');

  let racine = null;
  try {
    racine = git(cwd, "rev-parse", "--show-toplevel");
  } catch {
    // pas dans un dépôt
  }
  noter(racine !== null, "Vous êtes dans le dossier de votre dépôt", "Placez-vous dans le dossier cloné : cd cap-web-<votre-identifiant>");
  if (racine === null) return { ok: false, lignes };

  let origine = null;
  try { origine = git(racine, "remote", "get-url", "origin"); } catch { /* absent */ }
  noter(origine !== null, "Le dépôt a une adresse distante (origin)", "Clonez votre dépôt avec git clone <adresse>, ne le copiez pas à la main.");
  if (origine === null) return { ok: false, lignes };

  let joignable = false;
  try {
    git(racine, "ls-remote", "--heads", "origin");
    joignable = true;
  } catch {
    // injoignable
  }
  noter(joignable, "Je joins votre dépôt", "Vérifiez votre connexion et vos accès. Si GitHub vous demande de vous connecter, faites-le, puis relancez.");

  let pseudo = null;
  try {
    pseudo = JSON.parse(fs.readFileSync(path.join(racine, "capweb.json"), "utf8")).pseudo ?? null;
  } catch {
    // absent
  }
  noter(pseudo !== null, `Votre pseudo : ${pseudo ?? "absent"}`, "Le fichier capweb.json manque : ne l'effacez pas, refaites un git pull.");
  if (!tout) return { ok: false, lignes };

  const contenu = [
    "# J0 : mon poste est prêt",
    "",
    `pseudo : ${pseudo}`,
    `node : ${nodeVersion}`,
    `git : ${versionGit}`,
    `auteur : ${auteur}`,
    `email : ${email}`,
    `systeme : ${os.platform()}`,
    ""
  ].join("\n");
  const chemin = path.join(racine, "J0.md");
  const avant = fs.existsSync(chemin) ? fs.readFileSync(chemin, "utf8") : null;
  fs.writeFileSync(chemin, contenu, "utf8");
  try {
    git(racine, "add", "--", "J0.md");
    if (git(racine, "status", "--porcelain", "--", "J0.md")) {
      git(racine, "commit", "-q", "-m", "J0 : poste vérifié");
    }
    git(racine, "push", "-q", "origin", "HEAD");
    noter(true, "J0.md envoyé : ma case passe au vert", "");
  } catch (e) {
    if (avant === null) fs.rmSync(chemin, { force: true });
    noter(false, "Je n'ai pas réussi à envoyer J0.md", `Faites d'abord git pull, puis relancez. Détail : ${String(e.stderr ?? e.message).trim().split("\n")[0]}`);
    return { ok: false, lignes };
  }
  return { ok: true, lignes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { ok, lignes } = verifier();
  console.log(lignes.join("\n"));
  console.log(ok ? "\nTout est bon. À demain 9 h 00." : "\nIl reste une croix. Corrigez-la, relancez, ou écrivez-moi ce soir.");
  process.exit(ok ? 0 : 1);
}
