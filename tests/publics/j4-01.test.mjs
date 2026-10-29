// Contrôles visibles de J4-01 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dossier = path.join(RACINE, "tests", "unitaires");
const fichiers = fs.existsSync(dossier) ? fs.readdirSync(dossier).filter((n) => n.endsWith(".test.mjs")) : [];
const code = fichiers.map((n) => fs.readFileSync(path.join(dossier, n), "utf8")).join("\n");

describe("J4-01 — Contrôles publics", () => {
  it("il y a des fichiers de tests dans tests/unitaires", () => {
    assert.ok(fichiers.length >= 1);
  });

  it("les tests importent brain.js", () => {
    assert.match(code, /public\/js\/brain\.js/);
  });

  it("il y a au moins six tests", () => {
    assert.ok((code.match(/\bit\(/g) ?? []).length >= 6);
  });
});
