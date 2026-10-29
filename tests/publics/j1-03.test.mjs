// Contrôles visibles de J1-03 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const variante = fs.readFileSync(path.join(RACINE, "VARIANTE.md"), "utf8");
const limite = Number(/\*\*(\d+)\*\* caractères/.exec(variante)?.[1]);
const brain = await import(pathToFileURL(path.join(RACINE, "public", "js", "brain.js")).href);

describe("J1-03 — Contrôles publics", () => {
  it("un message vide ou fait d'espaces est refusé", () => {
    assert.equal(brain.validerMessage("", limite).ok, false);
    assert.equal(brain.validerMessage("   ", limite).ok, false);
  });

  it("un message de la limite exacte est accepté, un caractère de plus est refusé", () => {
    assert.ok(limite > 0);
    assert.equal(brain.validerMessage("a".repeat(limite), limite).ok, true);
    assert.equal(brain.validerMessage("a".repeat(limite + 1), limite).ok, false);
  });

  it("repondre rend toujours une phrase", () => {
    const phrase = brain.repondre("zzz", [], "Assistant");
    assert.equal(typeof phrase, "string");
    assert.ok(phrase.length > 0);
  });
});
