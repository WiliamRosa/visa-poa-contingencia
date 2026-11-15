// Keyword search over the knowledge base. Works in the browser (window.KBSearch) and in Node (tests).
(function (root) {
  "use strict";

  const STOPWORDS = new Set(("a o os as um uma uns umas de do da dos das em no na nos nas por para pra com sem " +
    "e ou que se eu meu minha meus minhas voce vc tem ter tenho ja foi esta estou estao isso esse essa este " +
    "como qual quais quando onde porque pq ao aos sao ser pode posso devo fazer faco faz mais muito " +
    "depois apos antes sobre ate me te lhe nao sim la aqui ai ficou").split(" "));
  const EMERGENCY = ["socorro", "afogando", "afogado", "soterrad", "desabou", "desabando", "ilhado", "preso",
    "presa", "deslizamento", "desmoronou", "arrastad", "inconsciente", "sangrando"];

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const tokens = (s) => normalize(s).split(" ").filter((t) => t.length > 1 && !STOPWORDS.has(t));
  // Light stemming: two words match when they share a long enough prefix (alimento/alimentos, limpar/limpeza).
  const sameRoot = (a, b) => {
    if (a === b) return true;
    const n = Math.min(a.length, b.length);
    if (n < 4) return false;
    const need = n <= 5 ? n : Math.max(5, n - 2);
    return a.slice(0, need) === b.slice(0, need);
  };

  function buildIndex(items) {
    return items.map((item) => ({
      item,
      strong: [...new Set([...tokens(item.pergunta), ...item.termos.flatMap(tokens)])],
      phrases: item.termos.map(normalize).filter((t) => t.includes(" ")),
      weak: [...new Set(tokens(item.resposta))],
    }));
  }

  function score(query, entry) {
    const nq = normalize(query);
    let total = 0;
    for (const t of new Set(tokens(query))) {
      if (entry.strong.some((s) => sameRoot(t, s))) total += 3;
      else if (entry.weak.some((s) => sameRoot(t, s))) total += 0.5;
    }
    for (const p of entry.phrases) if (nq.includes(p)) total += 4;
    return total;
  }

  function search(index, query) {
    return index.map((e) => ({ item: e.item, score: score(query, e) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  const isEmergency = (query) => EMERGENCY.some((w) => normalize(query).includes(w));

  const api = { normalize, buildIndex, search, isEmergency, MIN_SCORE: 3 };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.KBSearch = api;
})(this);
