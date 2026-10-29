import { validerMessage, repondre } from "./brain.js";
import { afficher } from "./view.js";

const LIMITE = 235;
const MAX_MESSAGES = 20;
const CLE = "capweb.prisme.v1";
const etat = [];
window.etat = etat;
const ASSISTANT = "Prisme";
const REGLES = [
  {
    motCle: "pause",
    reponse:
      "Prisme : une pause de 10 minutes est prévue au milieu de chaque demi-journée.",
  },
  {
    motCle: "objectif",
    reponse:
      "Prisme vous accompagne pour valider chaque palier dans les temps.",
  },
  {
    motCle: "clavier",
    reponse:
      "Prisme : utilisez Tab puis Entrée pour envoyer votre message sans souris.",
  },
];

function normaliserEtat(message) {
  if (typeof message === "string") {
    return { role: "user", text: message };
  }
  if (message && typeof message.text === "string") {
    return message;
  }
  return null;
}

function sauvegarderEtatCle() {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
    document.querySelector("#statut").textContent = "";
  } catch {
    document.querySelector("#statut").textContent =
      "Conversation non sauvegardée.";
  }
}

function chargerEtatCle() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE));
    if (!Array.isArray(donnees)) return;
    const donneespropres = donnees
      .map(normaliserEtat)
      .filter((m) => m !== null);
    etat.push(...donneespropres);
  } catch {
    // Si les données sont corrompues ou non valides, on ignore l'erreur et on ne charge rien.
  }
}

window.addEventListener("storage", (evenement) => {
  if (evenement.key === CLE) {
    etat.length = 0;
    chargerEtatCle();
    afficher(etat);
  }
});

chargerEtatCle();
afficher(etat);

let enCours = false;

document
  .querySelector("#formulaire")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    if (enCours) return;
    const messageInput = document.querySelector("#message");
    const message = messageInput.value;

    const validation = validerMessage(message, LIMITE);
    if (!validation.ok) {
      const raison = validation.raison;
      const statut = document.querySelector("#statut");
      if (raison === "vide") {
        statut.textContent = "Le message est vide.";
      } else if (raison === "trop-long") {
        statut.textContent = "Le message est trop long.";
      }
      return;
    }

    // vider le statut si le message est valide
    document.querySelector("#statut").textContent = "";

    // const regles = [
    //   {
    //     motCle: "pause",
    //     reponse:
    //       "Prisme : une pause de 10 minutes est prévue au milieu de chaque demi-journée.",
    //   },
    //   {
    //     motCle: "objectif",
    //     reponse:
    //       "Prisme vous accompagne pour valider chaque palier dans les temps.",
    //   },
    //   {
    //     motCle: "clavier",
    //     reponse:
    //       "Prisme : utilisez Tab puis Entrée pour envoyer votre message sans souris.",
    //   },
    // ];

    //const assistant = "Prisme";
    //const moteur = creerMoteur(regles, assistant);
    //const reponse = moteur.repondre(message);
    const buttonEnvoyer = document.querySelector("#envoyer");
    enCours = true;
    buttonEnvoyer.disabled = true;
    document.querySelector("#statut").textContent = "Envoi en cours…";

    try {
      const reply = await obtenirReponse(message);

      etat.push({ text: message, role: "user" });
      etat.push({ text: reply, role: "bot" });
      while (etat.length > MAX_MESSAGES) {
        etat.shift();
      }

      sauvegarderEtatCle();
      afficher(etat);

      document.querySelector("#statut").textContent = "Message envoyé.";
      document.querySelector("#message").value = "";
      document.querySelector("#message").focus();
      document.querySelector("#compteur").textContent = `0 / ${LIMITE}`;
    } catch (erreur) {
      document.querySelector("#statut").textContent =
        erreur.message || "Une erreur est survenue.";
    } finally {
      enCours = false;
      buttonEnvoyer.disabled = false;
    }
  });

const message = document.querySelector("#message");
const compteur = document.querySelector("#compteur");
const suggestions = document.querySelector("#suggestions");

function majCompteur() {
  compteur.textContent = `${message.value.length} / ${LIMITE}`;
}

message.addEventListener("input", majCompteur);

document.querySelector("#effacer").addEventListener("click", () => {
  etat.length = 0;
  sauvegarderEtatCle();
  afficher(etat);
});

function ajouterBouton(texte) {
  const bouton = document.createElement("button");
  bouton.type = "button"; // ne pas envoyer le formulaire
  bouton.textContent = texte;
  bouton.addEventListener("click", () => {
    message.value = texte; // copier la suggestion dans le champ
    majCompteur(); // changer value par code ne déclenche pas l'événement input
    message.focus();
  });
  suggestions.append(bouton);
}

function afficherErreur() {
  suggestions.replaceChildren();
  const phrase = document.createElement("p");
  phrase.textContent =
    "Une erreur est survenue : impossible de charger les suggestions.";
  const reessayer = document.createElement("button");
  reessayer.type = "button";
  reessayer.textContent = "Réessayer";
  reessayer.addEventListener("click", chargerSuggestions); // relance la demande
  suggestions.append(phrase, reessayer);
}

async function chargerSuggestions() {
  suggestions.setAttribute("aria-busy", "true");
  suggestions.textContent = "Chargement…";
  try {
    const reponse = await fetch("/api/guides");
    if (!reponse.ok) {
      throw new Error("statut " + reponse.status);
    }
    const donnees = await reponse.json();
    suggestions.replaceChildren();
    if (donnees.suggestions.length === 0) {
      suggestions.textContent = "Aucune suggestion disponible.";
    } else {
      donnees.suggestions.forEach(ajouterBouton);
    }
  } catch {
    afficherErreur();
  } finally {
    suggestions.setAttribute("aria-busy", "false");
  }
}

chargerSuggestions();

async function envoyerMessage(texte) {
  const controleur = new window.AbortController();
  const minuteur = setTimeout(() => controleur.abort(), 3000);
  try {
    const reponse = await fetch("/api/chat", {
      signal: controleur.signal,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: texte }),
    });
    if (!reponse.ok) {
      throw new Error("statut " + reponse.status);
    }
    const donnees = await reponse.json();
    if (typeof donnees.reply !== "string") {
      throw new Error("réponse invalide");
    }
    return donnees.reply;
  } catch (erreur) {
    if (erreur.name === "AbortError") {
      throw new Error("Le serveur a mis trop de temps à répondre.");
    }
    throw erreur;
  } finally {
    window.clearTimeout(minuteur);
  }
}

async function obtenirReponse(message) {
  try {
    const reponse = await envoyerMessage(message);
    document.querySelector("#mode").textContent = "";
    return reponse;
  } catch {
    document.querySelector("#mode").textContent = "réponse locale";
    return repondre(message, REGLES, ASSISTANT);
  }
}
