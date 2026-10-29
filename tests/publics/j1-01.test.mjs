// Contrôles visibles de J1-01 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyser } from "../../outils/html.mjs";

const DOSSIER_TEST = path.dirname(fileURLToPath(import.meta.url));
const CHEMIN_INDEX = path.resolve(DOSSIER_TEST, "..", "..", "public", "index.html");

function chargerDocument() {
  const html = fs.readFileSync(CHEMIN_INDEX, "utf8");
  return analyser(html);
}

describe("J1-01 — Contrôles publics de structure HTML", () => {
  it("contient un élément main", () => {
    const doc = chargerDocument();
    assert.equal(doc.parTag("main").length, 1);
  });

  it("contient un seul élément h1 non vide", () => {
    const doc = chargerDocument();
    const h1s = doc.parTag("h1");
    assert.equal(h1s.length, 1);
    assert.ok(h1s[0].texte().trim().length > 0);
  });

  it("contient un formulaire form#formulaire", () => {
    const doc = chargerDocument();
    const form = doc.parId("formulaire");
    assert.ok(form);
    assert.equal(form.tag, "form");
  });
});
