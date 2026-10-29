const MESSAGES = new WeakMap();

export function afficher(etat) {
  const historique = document.querySelector("#historique");
  const nouvelleLignes = [];
  for (const message of etat) {
    let msg = MESSAGES.get(message);
    if (!msg) {
      msg = document.createElement("li");
      msg.classList.add("msg");
      msg.dataset.role = message.role;
      msg.textContent = message.text;
      MESSAGES.set(message, msg);
    }
    nouvelleLignes.push(msg);
  }

  historique.replaceChildren(...nouvelleLignes);
  historique.scrollTop = historique.scrollHeight; // descend jusqu'au dernier message
}
