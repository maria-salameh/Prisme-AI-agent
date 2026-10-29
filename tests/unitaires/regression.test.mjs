import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validerMessage } from "../../public/js/brain.js";

// Régression : les espaces doivent être retirés des deux côtés (trim, pas trimStart).
describe("régression : espaces autour du message", () => {
  it('" abc " donne ok: true et texte: "abc"', () => {
    const resultat = validerMessage(" abc ", 10);
    assert.equal(resultat.ok, true);
    assert.equal(resultat.texte, "abc");
  });

  it("les espaces de la fin ne restent pas dans le texte", () => {
    assert.equal(validerMessage("abc   ", 10).texte, "abc");
  });

  it("les espaces de la fin ne comptent pas dans la limite", () => {
    assert.equal(validerMessage("abcde     ", 5).ok, true);
  });
});
