// Contrôles visibles de J3-04 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const code = ["app.js", "api.js"].map((n) => (fs.existsSync(path.join(RACINE, "public", "js", n)) ? fs.readFileSync(path.join(RACINE, "public", "js", n), "utf8") : "")).join("\n");

describe("J3-04 — Contrôles publics", () => {
  it("le code prévoit un repli local avec #mode", () => {
    assert.match(code, /#mode/);
    assert.match(code, /réponse locale/);
    assert.match(code, /repondre\(/);
  });

  it("le code limite la durée de la demande", () => {
    assert.match(code, /AbortController/);
    assert.match(code, /setTimeout/);
  });
});
