import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeTerms,
  knowledgeTopics,
  knowledgeSources,
} from "../shared/knowledge/catalog";
import { searchKnowledge, knowledgeCsv } from "../shared/knowledge/search";
test("knowledge catalogue has consistent topics, sources, unique IDs and valid related terms", () => {
  assert.ok(knowledgeTerms.length >= 738);
  assert.ok(knowledgeTopics.length >= 29);
  const ids = new Set(knowledgeTerms.map((t) => t.id));
  assert.equal(ids.size, knowledgeTerms.length);
  for (const topic of knowledgeTopics)
    assert.ok(
      knowledgeTerms.filter((t) => t.category === topic.id).length >= 20,
    );
  for (const term of knowledgeTerms) {
    assert.ok(term.definition.length > 25, term.id);
    assert.ok(knowledgeTopics.some((t) => t.id === term.category));
    assert.ok(term.sources.length);
    for (const s of term.sources) assert.ok(s in knowledgeSources);
    for (const id of term.related) {
      assert.ok(ids.has(id), id);
      assert.notEqual(id, term.id);
    }
    if (term.formula) assert.ok(term.assumptions, term.id);
  }
  for (const s of Object.values(knowledgeSources))
    assert.equal(new URL(s.url).protocol, "https:");
});
test("search ranks acronyms and combines text, topic, alphabet and saved filters", () => {
  const original = knowledgeTerms.map((t) => t.id);
  assert.equal(
    searchKnowledge({ query: "CPI" })[0].id,
    "cost-performance-index",
  );
  assert.equal(searchKnowledge({ query: "BCWP" })[0].id, "earned-value");
  assert.ok(
    searchKnowledge({ query: "just in time" }).some(
      (t) => t.id === "just-in-time",
    ),
  );
  assert.ok(
    searchKnowledge({ query: "work breakdown" }).some(
      (t) => t.id === "work-breakdown-structure",
    ),
  );
  assert.ok(searchKnowledge({ letter: "#" }).some((t) => t.name === "5S"));
  const inventory = searchKnowledge({ category: "inventory", letter: "S" });
  assert.ok(inventory.length);
  assert.ok(
    inventory.every(
      (t) => t.category === "inventory" && t.name.startsWith("S"),
    ),
  );
  assert.deepEqual(
    searchKnowledge({
      favouritesOnly: true,
      savedIds: ["cost-performance-index"],
    }).map((t) => t.id),
    ["cost-performance-index"],
  );
  assert.equal(searchKnowledge({ query: "zzzzunknownterm" }).length, 0);
  assert.equal(searchKnowledge({ favouritesOnly: true }).length, 0);
  assert.deepEqual(
    knowledgeTerms.map((t) => t.id),
    original,
  );
});
test("metric entries include interpretation conditions and CSV exports only selected results", () => {
  const cpi = knowledgeTerms.find((t) => t.id === "cost-performance-index")!;
  assert.match(cpi.formula!, /EV.*AC/);
  assert.match(cpi.assumptions!, /positive|zero|greater/i);
  const risk = knowledgeTerms.find((t) => t.id === "risk-score")!;
  assert.match(risk.assumptions!, /ordinal/);
  assert.match(risk.assumptions!, /does not mean/);
  const csv = knowledgeCsv([cpi]);
  assert.ok(csv.startsWith('\uFEFF"Term"'));
  assert.match(csv, /Cost performance index/);
  assert.equal(csv.split("\r\n").length, 2);
  assert.match(
    knowledgeCsv([
      { ...cpi, name: "=1+2", definition: 'A "quoted" definition' },
    ]),
    /"'=1\+2"/,
  );
  assert.match(
    knowledgeCsv([{ ...cpi, definition: 'A "quoted" definition' }]),
    /""quoted""/,
  );
});

test("expansion entries have actionable detail and valid reciprocal concept comparisons", () => {
  const extra = knowledgeTerms.filter((t) =>
    [
      "advanced-planning",
      "commercial-advanced",
      "programme-portfolio",
      "leadership-change",
      "digital-delivery",
      "advanced-operations",
      "sector-delivery",
      "african-delivery",
    ].includes(t.category),
  );
  assert.equal(extra.length, 200);
  for (const t of extra) {
    assert.ok(t.practicalUse && t.practicalUse.length > 20, t.id);
    assert.ok(t.example && t.example.length > 20, t.id);
    assert.ok(t.pitfall && t.pitfall.length > 20, t.id);
    assert.equal(t.reviewed, "2026-11-02");
  }
  const comparisons = knowledgeTerms.flatMap((t) =>
    (t.comparisons || []).map((c) => ({ t, c })),
  );
  assert.equal(comparisons.length, 100);
  for (const { t, c } of comparisons) {
    const other = knowledgeTerms.find((x) => x.id === c.termId)!;
    assert.ok(other);
    assert.notEqual(t.id, other.id);
    assert.ok(c.distinction.length > 60);
    assert.ok(
      other.comparisons?.some(
        (back) => back.termId === t.id && back.distinction === c.distinction,
      ),
    );
    assert.ok(t.related.includes(other.id));
  }
  assert.equal(searchKnowledge({ practicalOnly: true }).length, 250);
  assert.ok(
    searchKnowledge({ comparisonsOnly: true }).every(
      (t) => t.comparisons?.length,
    ),
  );
  assert.equal(
    searchKnowledge({ query: "RAG" })[0].id,
    "retrieval-augmented-generation",
  );
  assert.equal(
    searchKnowledge({ query: "AfCFTA trade in goods" })[0].id,
    "afcfta-trade-in-goods",
  );
  assert.equal(searchKnowledge({ query: "Erlang C" })[0].id, "erlang-c-model");
  const queue = knowledgeTerms.find((t) => t.id === "clinical-pathway")!;
  assert.ok(queue.related.includes("patient-flow"));
  assert.ok(!queue.related.includes("building-information-modelling"));
  const csv = knowledgeCsv([
    knowledgeTerms.find((t) => t.id === "continuous-delivery")!,
  ]);
  assert.match(csv, /Practical application/);
  assert.match(csv, /Concept comparisons/);
  assert.match(csv, /Continuous deployment/);
  assert.match(csv, /https:\/\//);
});

test("advanced metric entries state model boundaries and local-law conditions", () => {
  const queue = knowledgeTerms.find((t) => t.id === "single-server-queue")!;
  assert.match(queue.formula!, /Wq/);
  assert.match(queue.assumptions!, /Poisson/);
  assert.match(queue.assumptions!, /λ < μ/);
  assert.match(queue.example!, /24 minutes/);
  const tax = knowledgeTerms.find((t) => t.id === "tax-gross-up")!;
  assert.match(tax.assumptions!, /single applicable rate/);
  assert.match(tax.example!, /hypothetical/);
  assert.match(tax.pitfall!, /not automatically/);
  const trade = knowledgeTerms.find(
    (t) => t.id === "preferential-tariff-treatment",
  )!;
  assert.match(trade.pitfall!, /not make every shipment duty-free/);
  const dora = knowledgeTerms.find((t) => t.id === "deployment-rework-rate")!;
  assert.ok(dora.sources.includes("dora"));
  assert.match(dora.formula!, /unplanned incident-related/);
});
