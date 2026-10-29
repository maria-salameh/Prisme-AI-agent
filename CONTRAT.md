# Contrat DOM — Cap Web

| Élément | Sélecteur |
|---|---|
| champ | `#message` (avec un `label for="message"`) |
| bouton d'envoi | `#envoyer` (un vrai `button type="submit"`) |
| formulaire | `#formulaire` |
| historique | `#historique`, avec chaque message en `li.msg` et `data-role` valant `"user"` ou `"bot"` |
| statut | `#statut` (`aria-live="polite"`) |
| compteur | `#compteur` |
| effacer | `#effacer` |
| suggestions | `#suggestions` |
| indicateur local | `#mode` (contient « réponse locale » quand on est en repli) |

Un test navigateur ne trouve que ces sélecteurs.
Un changement de `id` donne zéro.
`#mode` contient « réponse locale » quand le repli est actif.

## L'API, à partir de J3

| Appel | Réponse |
|---|---|
| `GET` sur la route de suggestions de votre variante | `200` et `{ "suggestions": ["…", "…"] }` |
| `POST /api/chat` avec `{ "message": "…" }` en JSON | `200` et `{ "reply": "…" }` |
| `GET /version.json` (votre serveur, J3-03) | `200` et `{ "sha": "<git rev-parse HEAD>" }` |

Pendant le chargement des suggestions, `#suggestions` porte `aria-busy="true"`. Je simule les pannes (500, coupure, lenteur) avec la même fausse API que celle de `npm start` : `CAPWEB_SCENARIO=500 npm start`.
