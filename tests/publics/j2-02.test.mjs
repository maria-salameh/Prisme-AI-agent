// Contrôles visibles de J2-02 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lire = (nom) => fs.readFileSync(path.join(RACINE, "public", "js", nom), "utf8");

describe("J2-02 — Contrôles publics", () => {
  it("les trois modules existent", () => {
    for (const nom of ["app.js", "brain.js", "view.js"]) assert.ok(lire(nom).trim().length > 0, nom);
  });

  it("app.js importe brain.js et view.js", () => {
    const app = lire("app.js");
    assert.match(app, /from\s+["']\.\/brain\.js["']/);
    assert.match(app, /from\s+["']\.\/view\.js["']/);
  });

  it("view.js exporte quelque chose", () => {
    assert.match(lire("view.js"), /export\s/);
  });
});
