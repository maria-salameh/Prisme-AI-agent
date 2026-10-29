// Contrôles visibles de J3-02 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const code = ["app.js", "api.js"].map((n) => (fs.existsSync(path.join(RACINE, "public", "js", n)) ? fs.readFileSync(path.join(RACINE, "public", "js", n), "utf8") : "")).join("\n");

describe("J3-02 — Contrôles publics", () => {
  it("le code poste du JSON sur /api/chat", () => {
    assert.match(code, /\/api\/chat/);
    assert.match(code, /method:\s*["']POST["']/);
    assert.match(code, /JSON\.stringify/);
  });

  it("le code désactive le bouton pendant l'attente", () => {
    assert.match(code, /disabled\s*=\s*true/);
    assert.match(code, /disabled\s*=\s*false/);
  });
});
