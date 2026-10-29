// Contrôles visibles de J3-03 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const serveur = fs.readFileSync(path.join(RACINE, "server", "serveur.mjs"), "utf8");

describe("J3-03 — Contrôles publics", () => {
  it("le serveur déclare la route /api/chat et /version.json", () => {
    assert.match(serveur, /\/api\/chat/);
    assert.match(serveur, /\/version\.json/);
  });

  it("le serveur ne répond plus 501", () => {
    assert.equal(/501/.test(serveur.replace(/\/\/.*$/gm, "")), false);
  });

  it("le serveur exporte demarrer", () => {
    assert.match(serveur, /export\s+(async\s+)?function\s+demarrer/);
  });
});
