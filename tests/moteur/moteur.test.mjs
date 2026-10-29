import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { creerMoteur } from "../../public/js/brain.js";

const REGLES = [
  { motCle: "été", reponse: "Il fait beau." },
  { motCle: "pause", reponse: "Pause à 10 h." },
];

describe("creerMoteur", () => {
  it("rend un objet avec une méthode repondre qui marche avec des règles quelconques", () => {
    const moteur = creerMoteur(REGLES, "Zorg");
    assert.equal(typeof moteur.repondre, "function");
    assert.equal(moteur.repondre("vive la pause"), "Pause à 10 h.");
  });

  it("ignore les majuscules et les accents (« Été » = « ETE »)", () => {
    const moteur = creerMoteur(REGLES, "Zorg");
    assert.equal(moteur.repondre("ETE"), "Il fait beau.");
    assert.equal(moteur.repondre("un bel Été"), "Il fait beau.");
  });

  it("rend une phrase avec le nom de l'assistant sans règle qui correspond", () => {
    const moteur = creerMoteur(REGLES, "Zorg");
    assert.ok(moteur.repondre("zzz").includes("Zorg"));
    assert.ok(moteur.repondre(undefined).includes("Zorg"));
  });

  it("garde une copie des règles", () => {
    const regles = [{ motCle: "pause", reponse: "Pause à 10 h." }];
    const moteur = creerMoteur(regles, "Zorg");
    regles[0].reponse = "modifiée";
    regles[0].motCle = "autre";
    regles.push({ motCle: "zzz", reponse: "ajoutée" });
    assert.equal(moteur.repondre("pause"), "Pause à 10 h.");
    assert.ok(moteur.repondre("zzz").includes("Zorg"));
  });

  it("lève une TypeError qui nomme la règle fautive", () => {
    assert.throws(
      () => creerMoteur([REGLES[0], { motCle: 1, reponse: "x" }], "Zorg"),
      (erreur) => erreur instanceof TypeError && erreur.message.includes("regles[1]"),
    );
    assert.throws(
      () => creerMoteur([undefined], "Zorg"),
      (erreur) => erreur instanceof TypeError && erreur.message.includes("regles[0]"),
    );
  });

  it("refuse un mot-clé vide, d'espaces ou fait d'un seul accent", () => {
    for (const motCle of ["", "   ", "́"]) {
      assert.throws(
        () => creerMoteur([{ motCle, reponse: "x" }], "Zorg"),
        (erreur) => erreur instanceof TypeError && erreur.message.includes("regles[0]"),
      );
    }
  });

  it("refuse des règles qui ne sont pas un tableau", () => {
    assert.throws(() => creerMoteur("x", "Zorg"), TypeError);
  });
});
