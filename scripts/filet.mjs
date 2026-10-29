// Le filet : si vous n'avez pas fini un checkpoint, vous repartez du départ propre du suivant.
//   npm run filet -- j1-02
// Votre travail n'est pas perdu : il reste dans la branche archive/<checkpoint précédent>.
import { execFileSync } from "node:child_process";

const cp = process.argv[2];
const ORDRE = Array.from({ length: 16 }, (_, i) => `j${Math.floor(i / 4) + 1}-0${(i % 4) + 1}`);

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function arreter(message) {
  console.error(message);
  process.exit(1);
}

if (!ORDRE.includes(cp)) arreter("Je ne connais pas ce checkpoint. Exemple : npm run filet -- j1-02");
const precedent = ORDRE[ORDRE.indexOf(cp) - 1];
if (!precedent) arreter("Il n'y a pas de filet pour le premier checkpoint : il n'y a rien avant.");

try {
  if (git("branch", "--show-current") !== "main") arreter("Je travaille sur main : tapez d'abord git switch main.");
  if (git("status", "--porcelain")) arreter("Vous avez des changements non enregistrés. Faites un commit d'abord, puis relancez.");
  try {
    git("fetch", "origin", `refs/heads/filet/${cp}:refs/remotes/origin/filet/${cp}`);
  } catch {
    arreter(`Le filet de ${cp} n'est pas encore publié. Attendez la fin du debrief.`);
  }
  try {
    git("rev-parse", "--verify", `refs/heads/archive/${precedent}`);
    arreter(`La branche archive/${precedent} existe déjà : le filet a déjà été utilisé.`);
  } catch (e) {
    if (e.status === undefined) throw e;
  }
  git("branch", `archive/${precedent}`, "HEAD");
  git("read-tree", "--reset", "-u", `origin/filet/${cp}`);
  git("commit", "-q", "-m", `chore: départ propre de ${cp} (filet)`);
  console.log(`Fait. Votre travail est gardé dans la branche archive/${precedent}.`);
  console.log("Vous êtes sur main, au départ propre. Poussez : git push");
} catch (e) {
  arreter(`Le filet a échoué : ${String(e.stderr ?? e.message).trim()}`);
}
