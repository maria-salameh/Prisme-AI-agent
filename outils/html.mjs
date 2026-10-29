// Analyseur HTML tolérant en un seul passage linéaire, sans dépendance externe.

const ELEMENTS_VIDES = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

const ELEMENTS_TEXTE_BRUT = new Set(["script", "style"]);

function estEspace(code) {
  return code === 32 || code === 9 || code === 10 || code === 13 || code === 12;
}

function estLettreAscii(code) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function estCaractereNomBalise(code) {
  return (
    estLettreAscii(code) ||
    (code >= 48 && code <= 57) ||
    code === 45 || // -
    code === 58 // :
  );
}

function creerNoeudElement(tag, attrs, parent) {
  const pieces = [];
  const enfants = [];
  const noeud = {
    tag,
    attrs,
    parent,
    enfants,
    texte() {
      let out = "";
      for (const piece of pieces) {
        out += typeof piece === "string" ? piece : piece.texte();
      }
      return out;
    }
  };
  return { noeud, pieces };
}

export function analyser(entree) {
  const source = typeof entree === "string" ? entree : String(entree ?? "");
  const n = source.length;

  const mapPieces = new WeakMap();
  const racineInfo = creerNoeudElement("#document", {}, null);
  const racine = racineInfo.noeud;
  mapPieces.set(racine, racineInfo.pieces);

  const tous = [];
  const textes = [];
  const pile = [racine];

  function ajouterTexte(txt) {
    if (!txt) return;
    textes.push(txt);
    const parentCourant = pile[pile.length - 1];
    mapPieces.get(parentCourant).push(txt);
  }

  let i = 0;
  let debutTexte = 0;

  while (i < n) {
    if (source.charCodeAt(i) !== 60) {
      // Caractère différent de '<'
      i++;
      continue;
    }

    // Commentaire <!-- ... -->
    if (
      i + 3 < n &&
      source.charCodeAt(i + 1) === 33 &&
      source.charCodeAt(i + 2) === 45 &&
      source.charCodeAt(i + 3) === 45
    ) {
      if (i > debutTexte) {
        ajouterTexte(source.slice(debutTexte, i));
      }
      const finComm = source.indexOf("-->", i + 4);
      if (finComm === -1) {
        i = n;
      } else {
        i = finComm + 3;
      }
      debutTexte = i;
      continue;
    }

    // Déclaration <!doctype ...> ou instruction <?...?>
    if (
      i + 1 < n &&
      (source.charCodeAt(i + 1) === 33 || source.charCodeAt(i + 1) === 63)
    ) {
      if (i > debutTexte) {
        ajouterTexte(source.slice(debutTexte, i));
      }
      const finDecl = source.indexOf(">", i + 2);
      if (finDecl === -1) {
        i = n;
      } else {
        i = finDecl + 1;
      }
      debutTexte = i;
      continue;
    }

    // Balise fermante </nom...>
    if (i + 2 < n && source.charCodeAt(i + 1) === 47 && estLettreAscii(source.charCodeAt(i + 2))) {
      if (i > debutTexte) {
        ajouterTexte(source.slice(debutTexte, i));
      }
      let p = i + 2;
      while (p < n && estCaractereNomBalise(source.charCodeAt(p))) {
        p++;
      }
      const tagFerme = source.slice(i + 2, p).toLowerCase();
      const finChevron = source.indexOf(">", p);
      i = finChevron === -1 ? n : finChevron + 1;
      debutTexte = i;

      for (let k = pile.length - 1; k >= 1; k--) {
        if (pile[k].tag === tagFerme) {
          pile.length = k;
          break;
        }
      }
      continue;
    }

    // Balise ouvrante <nom...
    if (i + 1 < n && estLettreAscii(source.charCodeAt(i + 1))) {
      if (i > debutTexte) {
        ajouterTexte(source.slice(debutTexte, i));
      }

      let p = i + 1;
      while (p < n && estCaractereNomBalise(source.charCodeAt(p))) {
        p++;
      }
      const tag = source.slice(i + 1, p).toLowerCase();
      const attrs = {};
      let autoFermante = false;

      while (p < n) {
        while (p < n && estEspace(source.charCodeAt(p))) {
          p++;
        }
        if (p >= n) break;

        const c = source.charCodeAt(p);
        if (c === 62) {
          // '>'
          p++;
          break;
        }
        if (c === 47) {
          // '/'
          p++;
          if (p < n && source.charCodeAt(p) === 62) {
            autoFermante = true;
            p++;
            break;
          }
          continue;
        }

        // Lecture du nom d'attribut
        const debAttr = p;
        while (p < n) {
          const ca = source.charCodeAt(p);
          if (
            estEspace(ca) ||
            ca === 61 || // '='
            ca === 62 || // '>'
            ca === 47 || // '/'
            ca === 34 || // '"'
            ca === 39 // "'"
          ) {
            break;
          }
          p++;
        }

        if (p === debAttr) {
          p++;
          continue;
        }

        const nomAttr = source.slice(debAttr, p).toLowerCase();
        while (p < n && estEspace(source.charCodeAt(p))) {
          p++;
        }

        let valAttr = "";
        if (p < n && source.charCodeAt(p) === 61) {
          // '='
          p++;
          while (p < n && estEspace(source.charCodeAt(p))) {
            p++;
          }
          if (p < n) {
            const quote = source.charCodeAt(p);
            if (quote === 34 || quote === 39) {
              p++;
              const debVal = p;
              const carQuote = quote === 34 ? '"' : "'";
              const posFinQuote = source.indexOf(carQuote, p);
              if (posFinQuote === -1) {
                valAttr = source.slice(debVal);
                p = n;
              } else {
                valAttr = source.slice(debVal, posFinQuote);
                p = posFinQuote + 1;
              }
            } else {
              const debVal = p;
              while (p < n) {
                const cv = source.charCodeAt(p);
                if (estEspace(cv) || cv === 62) break;
                p++;
              }
              valAttr = source.slice(debVal, p);
            }
          }
        }

        attrs[nomAttr] = valAttr;
      }

      const parentCourant = pile[pile.length - 1];
      const infoEl = creerNoeudElement(tag, attrs, parentCourant === racine ? null : parentCourant);
      const el = infoEl.noeud;
      mapPieces.set(el, infoEl.pieces);

      parentCourant.enfants.push(el);
      mapPieces.get(parentCourant).push(el);
      tous.push(el);

      i = p;
      debutTexte = i;

      if (ELEMENTS_TEXTE_BRUT.has(tag) && !autoFermante) {
        const motifFin = `</${tag}`;
        let curseur = i;
        let posFermeture = -1;
        let finBaliseFermante = -1;

        while (curseur < n) {
          const cand = source.toLowerCase().indexOf(motifFin, curseur);
          if (cand === -1) break;
          const apres = cand + motifFin.length;
          if (
            apres >= n ||
            estEspace(source.charCodeAt(apres)) ||
            source.charCodeAt(apres) === 62 ||
            source.charCodeAt(apres) === 47
          ) {
            posFermeture = cand;
            const chev = source.indexOf(">", apres);
            finBaliseFermante = chev === -1 ? n : chev + 1;
            break;
          }
          curseur = apres;
        }

        if (posFermeture === -1) {
          const contenuBrut = source.slice(i);
          if (contenuBrut) infoEl.pieces.push(contenuBrut);
          i = n;
        } else {
          const contenuBrut = source.slice(i, posFermeture);
          if (contenuBrut) infoEl.pieces.push(contenuBrut);
          i = finBaliseFermante;
        }
        debutTexte = i;
        continue;
      }

      if (!autoFermante && !ELEMENTS_VIDES.has(tag)) {
        pile.push(el);
      }
      continue;
    }

    // '<' isolé : simple caractère de texte
    i++;
  }

  if (debutTexte < n) {
    ajouterTexte(source.slice(debutTexte));
  }

  function parTag(nomTag) {
    const cible = String(nomTag ?? "").toLowerCase();
    return tous.filter((el) => el.tag === cible);
  }

  function parId(idCible) {
    const idStr = String(idCible ?? "");
    return tous.find((el) => el.attrs.id === idStr) ?? null;
  }

  function premier(nomTag) {
    const cible = String(nomTag ?? "").toLowerCase();
    return tous.find((el) => el.tag === cible) ?? null;
  }

  return {
    racine,
    tous,
    parTag,
    parId,
    premier,
    textes
  };
}
