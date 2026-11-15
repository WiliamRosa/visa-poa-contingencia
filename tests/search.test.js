// Run with: node tests/search.test.js
// Checks that typical citizen questions reach the expected answer and that unrelated ones do not.
const assert = require("assert");
const path = require("path");
const kb = require(path.join(__dirname, "..", "site", "data", "kb.json"));
const { buildIndex, search, isEmergency, MIN_SCORE } = require(path.join(__dirname, "..", "site", "assets", "search.js"));

const index = buildIndex(kb.itens);
const top = (q) => {
  const r = search(index, q)[0];
  return r && r.score >= MIN_SCORE ? r.item.id : null;
};

const CASES = [
  ["como deixo a água boa pra beber?", "agua-beber"],
  ["quantas gotas de hipoclorito por litro", "agua-beber"],
  ["como lavar a caixa dagua", "caixa-dagua"],
  ["limpeza do reservatório depois da enchente", "caixa-dagua"],
  ["a comida molhou na enchente posso comer", "alimentos-enchente"],
  ["a geladeira ficou sem luz", "geladeira-sem-energia"],
  ["como limpar a casa cheia de lama", "limpar-casa"],
  ["posso misturar água sanitária com outro produto?", "protecao-limpeza"],
  ["o que faço com o colchão molhado", "moveis-colchoes"],
  ["quais os sintomas da leptospirose", "leptospirose"],
  ["apareceu um escorpião em casa", "peconhentos"],
  ["meu remédio molhou", "remedio-molhado"],
  ["insulina sem geladeira", "remedio-geladeira"],
  ["o que a vigilância verifica no abrigo", "abrigo-visa"],
  ["posso levar meu cachorro pro abrigo", "abrigo-animais"],
  ["quero doar comida", "doar-alimentos"],
  ["vou cozinhar no abrigo como voluntário", "voluntario-cozinha"],
  ["meu restaurante alagou quando posso reabrir", "comercio-reabrir"],
  ["telefone dos bombeiros", "emergencia"],
  ["como receber alerta por sms", "alertas-sms"],
  ["quero denunciar venda de comida estragada", "compra-alimentos"],
  ["água da torneira está barrenta", "agua-cor-cheiro"],
];

let failed = 0;
for (const [q, expected] of CASES) {
  const got = top(q);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${q} -> ${got} ${ok ? "" : `(expected ${expected})`}`);
}

for (const q of ["qual o resultado do jogo de futebol", "receita de bolo de chocolate"]) {
  const got = top(q);
  if (got) failed++;
  console.log(`${got ? "FAIL" : "ok  "} off-topic: ${q} -> ${got}`);
}

assert.ok(isEmergency("socorro tem gente ilhada"));
assert.ok(!isEmergency("como limpar a casa"));
const ids = kb.itens.map((i) => i.id);
assert.strictEqual(new Set(ids).size, ids.length, "duplicate ids in kb.json");
for (const i of kb.itens) assert.ok(kb.temas[i.tema], `unknown tema ${i.tema} in ${i.id}`);

console.log(failed ? `\n${failed} failing` : "\nall passed");
process.exit(failed ? 1 : 0);
