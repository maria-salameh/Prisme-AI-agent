// Contrôles visibles de J2-04 pour l'étudiant.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("J2-04 — Contrôles publics", () => {
  it("version.js ne contient aucune marque de conflit", () => {
    const code = fs.readFileSync(path.join(RACINE, "public", "js", "version.js"), "utf8");
    assert.equal(/^(<{7}|={7}|>{7})/m.test(code), false);
    assert.match(code, /export const VERSION = "[^"]+";/);
  });

  it("je ne suis plus sur main au moment de travailler (branche feat/…)", () => {
    const branche = execFileSync("git", ["branch", "--show-current"], { cwd: RACINE, encoding: "utf8" }).trim();
    assert.ok(branche === "main" || branche.startsWith("feat/"), `branche : ${branche}`);
  });
});
