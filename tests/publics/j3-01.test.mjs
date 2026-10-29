// Contrôles visibles de J3-01 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const code = ["app.js", "api.js"].map((n) => (fs.existsSync(path.join(RACINE, "public", "js", n)) ? fs.readFileSync(path.join(RACINE, "public", "js", n), "utf8") : "")).join("\n");
const route = /route de suggestions est `([^`]+)`/.exec(fs.readFileSync(path.join(RACINE, "VARIANTE.md"), "utf8"))?.[1];

describe("J3-01 — Contrôles publics", () => {
  it("le code appelle la route de ma variante avec fetch", () => {
    assert.ok(route);
    assert.ok(code.includes(route));
    assert.match(code, /fetch\(/);
  });

  it("le code gère l'attente et l'erreur", () => {
    assert.match(code, /aria-busy/);
    assert.match(code, /catch/);
  });
});
