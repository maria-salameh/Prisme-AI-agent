// Départ J2-02 : les règles de base de Cap Web pour le navigateur.
const navigateur = Object.fromEntries(
  ["window", "document", "localStorage", "console", "fetch", "setTimeout"].map((nom) => [nom, "readonly"])
);

export default [
  {
    files: ["public/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: navigateur },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      // Sécurité : pas de HTML injecté depuis une chaîne, pas de clé secrète écrite dans le code.
      "no-restricted-syntax": [
        "error",
        {
          selector: "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]",
          message: "Interdit : innerHTML / outerHTML (risque XSS). Utilisez textContent."
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: "Interdit : insertAdjacentHTML (risque XSS). Utilisez textContent."
        },
        {
          selector: "Literal[value=/(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{4,}/]",
          message: "Interdit : clé secrète écrite dans le code."
        },
        {
          selector: "TemplateElement[value.raw=/(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{4,}/]",
          message: "Interdit : clé secrète écrite dans le code."
        }
      ]
    }
  }
];
