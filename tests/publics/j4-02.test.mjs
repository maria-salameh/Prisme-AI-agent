// Contrôles visibles de J4-02 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("J4-02 — Contrôles publics", () => {
  it("brain.js retire les espaces des deux côtés", () => {
    const code = fs.readFileSync(path.join(RACINE, "public", "js", "brain.js"), "utf8");
    assert.equal(/trimStart\(\)/.test(code), false);
  });

  it("un test de non-régression existe dans tests/unitaires", () => {
    const dossier = path.join(RACINE, "tests", "unitaires");
    const fichiers = fs.existsSync(dossier) ? fs.readdirSync(dossier).filter((n) => n.endsWith(".test.mjs")) : [];
    assert.ok(fichiers.length >= 2, "ajoutez un fichier de test pour la régression");
  });
});
