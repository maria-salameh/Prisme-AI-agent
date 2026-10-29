// Contrôles visibles de J2-03 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const variante = fs.readFileSync(path.join(RACINE, "VARIANTE.md"), "utf8");
const cle = /clé de stockage local est `([^`]+)`/.exec(variante)?.[1];
const code = ["app.js", "stockage.js"].map((n) => (fs.existsSync(path.join(RACINE, "public", "js", n)) ? fs.readFileSync(path.join(RACINE, "public", "js", n), "utf8") : "")).join("\n");

describe("J2-03 — Contrôles publics", () => {
  it("le code écrit et lit sous la clé de ma variante", () => {
    assert.ok(cle);
    assert.ok(code.includes(cle));
    assert.match(code, /localStorage\.setItem/);
    assert.match(code, /localStorage\.getItem/);
  });

  it("JSON.parse est protégé par un try", () => {
    assert.match(code, /try\s*\{[\s\S]*JSON\.parse/);
  });
});
