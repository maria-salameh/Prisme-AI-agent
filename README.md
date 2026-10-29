# Assistant Prisme

## Objectif

Prisme est un petit assistant de chat qui répond aux questions de la formation (pauses, objectifs, clavier). La page affiche la conversation, propose des suggestions et répond grâce à un serveur, avec une réponse locale de secours si le serveur tombe en panne.

## Installer

Il faut Node.js 24 : clonez le dépôt, entrez dans le dossier, puis installez les dépendances.

```bash
git clone https://github.com/capweb-essai-2026/cap-web-maria-salameh.git
cd cap-web-maria-salameh
npm install
```

## Lancer

```bash
npm start
```

Le serveur démarre sur http://127.0.0.1:3000.

## Tester

```bash
npm test
npm run e2e
```

`npm test` lance les tests unitaires de `brain.js` et `npm run e2e` démarre le serveur pour tester l'API de bout en bout.

## Modules

- `public/js/app.js` : branche la page, garde l'état de la conversation, envoie les messages au serveur et sauvegarde dans le navigateur.
- `public/js/brain.js` : valide un message (vide ou trop long) et choisit la réponse selon les règles, sans jamais toucher à la page.
- `public/js/view.js` : dessine l'historique de la conversation à partir de l'état.
- `server/serveur.mjs` : sert la page et expose l'API du serveur.

## API

- `POST /api/chat` reçoit `{ "message": "..." }` et répond `{ "reply": "..." }` (400 si le message est vide, trop long ou illisible, 405 si la méthode n'est pas POST).
- `GET /version.json` répond `{ "sha": "..." }` avec le commit en cours.
- `GET /api/health` répond `{ "status": "ok" }`.
