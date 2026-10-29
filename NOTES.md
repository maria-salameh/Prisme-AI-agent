1. Pourquoi brain.js ne doit-il jamais toucher à document ?

brain.js contient seulement la logique : valider un message et choisir une réponse. Ce sont des fonctions pures, qui reçoivent des valeurs et renvoient un résultat. Si elles touchaient à document, elles dépendraient de la page et ne marcheraient plus dans un test avec Node, où il n’y a pas de navigateur. En gardant le DOM dans app.js, je peux tester brain.js seul et le réutiliser ailleurs.

2. Chemin d’un message quand j’appuie sur Entrée

Entrée déclenche l’événement submit du formulaire #formulaire. Mon écouteur dans app.js appelle preventDefault() pour éviter le rechargement de la page. Je lis la valeur de #message et je la passe à validerMessage. Si elle est refusée, j’écris la raison dans #statut et je m’arrête. Sinon, j’appelle repondre avec mes règles. ajouterMessage crée ensuite deux li dans #historique : mon message (data-role="user"), puis la réponse (data-role="bot"). Enfin, je vide le champ et je lui redonne le focus.

3. Quel test m’a le plus aidé ?

les tests publics de J1-01, car ils m’ont dit tout de suite si ma structure HTML (main, un seul h1, form#formulaire) était bonne. Pour brain.js, ce qui m’a le plus aidé, c’est d’essayer repondre("BÔNJOUR", …) à la main avec node. Ça m’a montré le plantage dû à const, que je n’avais pas vu en relisant.
