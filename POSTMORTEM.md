# Postmortem de l'incident

## Résumé

Le 28 octobre, un commit « perf » poussé sur `main` par le bot a réécrit `public/js/brain.js` et cassé l'assistant Prisme. Après cela, un message comme « dis-moi quand la pause commence » ne déclenchait plus aucune règle, et l'assistant répondait par une phrase de repli qui n'était pas la nôtre. Le correcteur a signalé J3-03 en rouge, et le service a été rétabli en annulant ce commit avec `git revert`.

## Chronologie

- 12:58 : le bot pousse sur `main` le commit `df5e678` « perf: accélère la recherche des mots-clés », qui remplace le contenu de `brain.js`.
- 14:26 : la fusion de `main` dans notre travail (commit `5af28a8`) ramène ce commit dans notre dépôt, et le tout est poussé.
- 14:30 environ : le tableau de correction affiche J3-03 en rouge, avec la réponse de repli du bot au lieu de la réponse de la règle `pause`.
- 15:33 : on récupère l'état de `main` (fusion `f918090`) et on lit l'historique pour retrouver le commit fautif.
- 15:36 : `git revert df5e678` crée le commit d'annulation `ae25bac`, qui est poussé sur `main`.
- 15:53 : on ajoute des tests unitaires (`01297f8`) qui deviennent rouges sur la version fautive de `brain.js`.

## Cause

Le commit « perf » a remplacé la recherche du mot-clé dans le message (`includes`) par une égalité stricte (`message === regle.motCle`). Il a aussi supprimé la normalisation des accents et des majuscules ainsi que la fonction `creerMoteur`. Notre dépôt ne comportait alors aucun test automatique de `brain.js` ni de pipeline qui s'exécute à chaque push, donc rien n'a signalé que le comportement avait changé. La fusion de `main` a été faite sans relire d'abord ce que le commit modifiait, ce qui a laissé passer la régression.

## Résolution

On a retrouvé le commit fautif avec `git log --oneline`, puis on l'a annulé avec `git revert df5e678`, en gardant le message proposé par Git. L'historique conserve ainsi le commit fautif et le commit d'annulation, sans `git reset` ni `git push --force`. Après le revert, `brain.js` est redevenu identique à sa version d'avant l'incident, les règles ont de nouveau répondu et le test `npm test` s'est exécuté en environ une seconde.

## Leçons

Il faut des tests unitaires qui vérifient chaque règle et les cas limites, par exemple un mot-clé au milieu du message, pour qu'une régression devienne rouge tout de suite. Une intégration continue qui lance le lint, les tests et les tests de bout en bout à chaque push et à chaque pull request permet de voir le problème avant la fusion. Avant de fusionner `main` dans sa branche, on relit le résultat de `git diff` pour repérer un fichier central qui change en profondeur. Enfin, on répare toujours avec `git revert`, qui garde la trace de ce qui s'est passé, plutôt qu'en réécrivant l'historique.
