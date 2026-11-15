// Q&A chat over a curated knowledge base. No LLM: every answer is an approved text with its source.
(() => {
  "use strict";

  const { buildIndex, search, isEmergency, MIN_SCORE } = window.KBSearch;
  const SUGGESTED = ["agua-beber", "caixa-dagua", "alimentos-enchente", "limpar-casa", "leptospirose", "doar-alimentos"];

  const $ = (sel) => document.querySelector(sel);
  let kb = null;
  let index = [];
  const byId = (id) => kb.itens.find((i) => i.id === id);

  function paragraphs(text, container) {
    for (const line of text.split("\n")) {
      const p = document.createElement("p");
      p.textContent = line;
      container.appendChild(p);
    }
  }

  function addMessage(kind, build) {
    const div = document.createElement("div");
    div.className = `msg ${kind}`;
    build(div);
    $("#messages").appendChild(div);
    div.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function source(item, container) {
    const src = document.createElement("p");
    src.className = "src";
    src.textContent = `Fonte: ${item.fonte}`;
    container.appendChild(src);
  }

  function answerCard(item, container) {
    const q = document.createElement("p");
    q.className = "q";
    q.textContent = item.pergunta;
    container.appendChild(q);
    paragraphs(item.resposta, container);
    source(item, container);
  }

  function chips(items) {
    const box = $("#suggestions");
    box.replaceChildren();
    for (const item of items) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = item.pergunta;
      b.addEventListener("click", () => ask(item.pergunta, item));
      box.appendChild(b);
    }
  }

  function ask(question, forced) {
    addMessage("msg-user", (d) => { d.textContent = question; });
    if (isEmergency(question)) {
      addMessage("msg-bot msg-alert", (d) => paragraphs(
        "Se há risco de vida, ligue agora: Defesa Civil 199, Bombeiros 193, SAMU 192.", d));
    }
    const results = forced ? [{ item: forced, score: 99 }] : search(index, question);
    const best = results[0];
    if (best && best.score >= MIN_SCORE) {
      addMessage("msg-bot", (d) => answerCard(best.item, d));
      chips(results.slice(1, 4).filter((r) => r.score >= MIN_SCORE - 1).map((r) => r.item));
    } else {
      addMessage("msg-bot", (d) => paragraphs(
        "Não encontrei essa resposta na base da Vigilância Sanitária. Tente com outras palavras, " +
        "escolha uma das perguntas abaixo ou fale com a Vigilância Sanitária de Poá.", d));
      chips(results.length ? results.slice(0, 4).map((r) => r.item) : SUGGESTED.map(byId));
    }
  }

  function renderFaq() {
    const faq = $("#faq");
    for (const [key, title] of Object.entries(kb.temas)) {
      const items = kb.itens.filter((i) => i.tema === key);
      if (!items.length) continue;
      const group = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = title;
      group.appendChild(h);
      for (const item of items) {
        const det = document.createElement("details");
        const sum = document.createElement("summary");
        sum.textContent = item.pergunta;
        const body = document.createElement("div");
        paragraphs(item.resposta, body);
        source(item, body);
        det.append(sum, body);
        group.appendChild(det);
      }
      faq.appendChild(group);
    }
  }

  async function init() {
    try {
      kb = await (await fetch("data/kb.json", { cache: "no-cache" })).json();
    } catch (err) {
      addMessage("msg-bot", (d) => paragraphs("Não foi possível carregar a base de orientações. Tente recarregar a página.", d));
      return;
    }
    index = buildIndex(kb.itens);
    $("#kb-version").textContent = `Base de orientações: versão ${kb.versao}. ${kb.status}`;
    addMessage("msg-bot", (d) => paragraphs(
      "Olá! Pergunte sobre água, alimentos, limpeza depois da enchente, abrigos, doações ou saúde. " +
      "Em caso de emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).", d));
    chips(SUGGESTED.map(byId));
    renderFaq();
    $("#ask").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const input = $("#question");
      const q = input.value.trim();
      if (q) ask(q);
      input.value = "";
    });
  }

  init();
})();
