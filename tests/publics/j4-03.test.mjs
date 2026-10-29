// Contrôles visibles de J4-03 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("J4-03 — Contrôles publics", () => {
  it("le workflow existe et déclare les trois étapes", () => {
    const yaml = fs.readFileSync(path.join(RACINE, ".github", "workflows", "ci.yml"), "utf8");
    assert.match(yaml, /npm run lint/);
    assert.match(yaml, /npm (run )?test/);
    assert.match(yaml, /npm run e2e/);
  });

  it("package.json a les scripts lint, test et e2e", () => {
    const { scripts } = JSON.parse(fs.readFileSync(path.join(RACINE, "package.json"), "utf8"));
    for (const nom of ["lint", "test", "e2e"]) assert.ok(scripts[nom], nom);
  });

  it("le README a ses six sections", () => {
    const readme = fs.readFileSync(path.join(RACINE, "README.md"), "utf8").toLowerCase();
    for (const titre of ["objectif", "installer", "lancer", "tester", "modules", "api"]) assert.ok(readme.includes(`## ${titre}`), titre);
  });
});
