// Contrôles visibles de J4-04 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("J4-04 — Contrôles publics", () => {
  it("POSTMORTEM.md existe avec cinq sections", () => {
    const texte = fs.readFileSync(path.join(RACINE, "POSTMORTEM.md"), "utf8");
    assert.ok((texte.match(/^## /gm) ?? []).length >= 5);
  });

  it("brain.js ne compare plus le message au mot-clé avec ===", () => {
    const code = fs.readFileSync(path.join(RACINE, "public", "js", "brain.js"), "utf8");
    assert.equal(/message === regle\.motCle/.test(code), false);
  });
});
