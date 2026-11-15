// Renders the public summary of the sanitary surveillance actions per scenario.
(async () => {
  "use strict";
  const phases = document.getElementById("phases");
  const plan = document.getElementById("plan");
  let data;
  try {
    data = await (await fetch("data/plano.json", { cache: "no-cache" })).json();
  } catch (err) {
    plan.textContent = "Não foi possível carregar o plano. Tente recarregar a página.";
    return;
  }
  data.cenarios.forEach((s, i) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = `${i + 1}. ${s.cenario}`;
    const p = document.createElement("span");
    p.textContent = s.descricao;
    li.append(strong, p);
    phases.appendChild(li);

    const sec = document.createElement("section");
    sec.className = "scenario";
    const h = document.createElement("h2");
    h.textContent = s.cenario;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `${s.acoes.length} ações`;
    h.appendChild(count);
    sec.appendChild(h);
    for (const a of s.acoes) {
      const card = document.createElement("div");
      card.className = "action";
      const text = document.createElement("p");
      text.textContent = a.acao;
      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = `Com: ${a.parceiros} · Frequência: ${a.frequencia}`;
      card.append(text, meta);
      sec.appendChild(card);
    }
    plan.appendChild(sec);
  });
})();
