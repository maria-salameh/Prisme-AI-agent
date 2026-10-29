// Contrôles visibles de J2-01 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const app = fs.readFileSync(path.join(RACINE, "public", "js", "app.js"), "utf8");

describe("J2-01 — Contrôles publics", () => {
  it("app.js expose l'état avec window.etat", () => {
    assert.match(app, /window\.etat\s*=/);
  });

  it("app.js n'utilise pas innerHTML", () => {
    assert.equal(/innerHTML/.test(app), false);
  });
});
