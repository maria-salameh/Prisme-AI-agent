/**
 * Crée un moteur de réponse à partir d'un ensemble de règles.
 * @param {{ motCle: string, reponse: string }[]} regles - les règles
 * @param {string} assistant - le nom de l'assistant
 * @returns {{ repondre: (texte: string) => string }} le moteur de réponse
 */
export function creerMoteur(regles, assistant) {
  if (!Array.isArray(regles)) {
    throw new TypeError("Les règles doivent être un tableau.");
  }

  regles.forEach((regle, i) => {
    if (
      regle === null ||
      typeof regle !== "object" ||
      typeof regle.motCle !== "string" ||
      typeof regle.reponse !== "string" ||
      simplifierTexte(regle.motCle) === "" ||
      regle.reponse.trim() === ""
    ) {
      throw new TypeError(`regles[${i}] est invalide`);
    }
  });

  const copie = regles.map((regle) => ({
    motCle: simplifierTexte(regle.motCle),
    reponse: regle.reponse,
  }));

  return {
    repondre: (_texte) => {
      const texte = simplifierTexte(String(_texte ?? ""));
      for (const regle of copie) {
        if (texte.includes(regle.motCle)) {
          return regle.reponse;
        }
      }
      return `${assistant}: Je ne comprends pas votre question.`;
    },
  };
}

/** Test un message pour vérifier s'il est vide ou trop long.
 * @param {string} texte - le message à tester
 * @param {number} limite - la longueur maximale autorisée
 * @returns {{ ok: boolean, raison?: string, texte?: string }} le résultat de la validation (texte sans espaces autour si ok)
 */
export function validerMessage(_texte, _limite) {
  const texte = String(_texte ?? "").trim();
  if (texte.length === 0) {
    return { ok: false, raison: "vide" };
  }

  if (texte.length > _limite) {
    return {
      ok: false,
      raison: "trop-long",
    };
  }

  return { ok: true, texte };
}

function simplifierTexte(_texte) {
  let texte = _texte.toLowerCase().trim();
  texte = texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return texte;
}

/**
 * Génère une réponse à partir d'un message, d'un ensemble de règles et d'un assistant.
 * @param {string} _texte - le message à traiter
 * @param {{ motCle: string, reponse: string }[]} _regles - les règles
 * @param {string} _assistant - le nom de l'assistant
 * @returns {string} la réponse générée
 */
export function repondre(_texte, _regles, _assistant) {
  const texte = simplifierTexte(String(_texte ?? ""));

  for (const regle of _regles) {
    const regleTexte = simplifierTexte(regle.motCle);
    if (texte.includes(regleTexte)) {
      return regle.reponse;
    }
  }

  return `${_assistant}: Je ne comprends pas votre question.`;
}


