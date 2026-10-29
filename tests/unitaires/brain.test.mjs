import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validerMessage, repondre } from "../../public/js/brain.js";

// Les trois règles de VARIANTE.md
const ASSISTANT = "Prisme";
const REGLES = [
  {
    motCle: "pause",
    reponse:
      "Prisme : une pause de 10 minutes est prévue au milieu de chaque demi-journée.",
  },
  {
    motCle: "objectif",
    reponse: "Prisme vous accompagne pour valider chaque palier dans les temps.",
  },
  {
    motCle: "clavier",
    reponse:
      "Prisme : utilisez Tab puis Entrée pour envoyer votre message sans souris.",
  },
];

describe("validerMessage", () => {
  it("refuse un message vide avec la raison vide", () => {
    const resultat = validerMessage("", 10);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "vide");
  });

  it("refuse un message fait seulement d'espaces avec la raison vide", () => {
    const resultat = validerMessage("     ", 10);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "vide");
  });

  it("accepte un message de exactement la limite", () => {
    assert.equal(validerMessage("abcdefghij", 10).ok, true);
  });

  it("refuse un message de la limite + 1 avec la raison trop-long", () => {
    const resultat = validerMessage("abcdefghijk", 10);
    assert.equal(resultat.ok, false);
    assert.equal(resultat.raison, "trop-long");
  });

  it("ne compte pas les espaces au début et à la fin dans la limite", () => {
    assert.equal(validerMessage("  abcdefghij  ", 10).ok, true);
    assert.equal(validerMessage("abcdefghij ", 10).ok, true);
    assert.equal(validerMessage(" abcdefghij", 10).ok, true);
  });

  it("rend le texte sans les espaces des deux côtés", () => {
    assert.equal(validerMessage("  abc  ", 10).texte, "abc");
    assert.equal(validerMessage("   abc", 10).texte, "abc");
    assert.equal(validerMessage("abc   ", 10).texte, "abc");
  });

  it("garde les espaces au milieu du message", () => {
    assert.equal(validerMessage(" a b ", 10).texte, "a b");
  });

  it("traite un message absent (undefined ou null) comme vide", () => {
    assert.equal(validerMessage(undefined, 10).ok, false);
    assert.equal(validerMessage(undefined, 10).raison, "vide");
    assert.equal(validerMessage(null, 10).ok, false);
    assert.equal(validerMessage(null, 10).raison, "vide");
  });

  it("accepte un message normal", () => {
    const resultat = validerMessage("bonjour", 10);
    assert.equal(resultat.ok, true);
    assert.equal(resultat.raison, undefined);
  });
});

describe("repondre", () => {
  it("rend la réponse de la première règle", () => {
    assert.equal(repondre("pause", REGLES, ASSISTANT), REGLES[0].reponse);
  });

  it("rend la réponse de la deuxième règle", () => {
    assert.equal(repondre("objectif", REGLES, ASSISTANT), REGLES[1].reponse);
  });

  it("rend la réponse de la troisième règle", () => {
    assert.equal(repondre("clavier", REGLES, ASSISTANT), REGLES[2].reponse);
  });

  it("trouve un mot-clé au milieu ou à la fin du message", () => {
    assert.equal(
      repondre("dis-moi quand la pause commence", REGLES, ASSISTANT),
      REGLES[0].reponse,
    );
    assert.equal(
      repondre("comment utiliser le clavier", REGLES, ASSISTANT),
      REGLES[2].reponse,
    );
    assert.equal(
      repondre("quel est mon objectif ?", REGLES, ASSISTANT),
      REGLES[1].reponse,
    );
  });

  it("rend la réponse de la règle et jamais le mot-clé", () => {
    for (const regle of REGLES) {
      const reponse = repondre(regle.motCle, REGLES, ASSISTANT);
      assert.equal(reponse, regle.reponse);
      assert.notEqual(reponse, regle.motCle);
    }
  });

  it("donne la première règle du tableau quand deux mots-clés sont présents", () => {
    assert.equal(
      repondre("clavier puis pause", REGLES, ASSISTANT),
      REGLES[0].reponse,
    );
    assert.equal(
      repondre("clavier et objectif", REGLES, ASSISTANT),
      REGLES[1].reponse,
    );
  });

  it("utilise les règles reçues et pas des règles écrites en dur", () => {
    const autres = [{ motCle: "salut", reponse: "Coucou !" }];
    assert.equal(repondre("salut tout le monde", autres, "Zorg"), "Coucou !");
  });

  it("met le nom de l'assistant dans la phrase de repli", () => {
    const reponse = repondre("zzz inconnu", REGLES, ASSISTANT);
    assert.ok(reponse.includes("Prisme"));
    assert.ok(repondre("zzz inconnu", REGLES, "Zorg").includes("Zorg"));
  });

  it("ne rend pas la réponse d'une règle quand aucun mot-clé n'est présent", () => {
    const reponse = repondre("zzz inconnu", REGLES, ASSISTANT);
    for (const regle of REGLES) {
      assert.notEqual(reponse, regle.reponse);
    }
  });

  it("rend la phrase de repli avec le nom de l'assistant pour un message absent", () => {
    assert.ok(repondre(undefined, REGLES, ASSISTANT).includes("Prisme"));
    assert.ok(repondre(null, REGLES, ASSISTANT).includes("Prisme"));
  });

  it("rend la phrase de repli quand il n'y a aucune règle", () => {
    assert.ok(repondre("pause", [], "Zorg").includes("Zorg"));
  });
});
