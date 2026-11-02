import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeTerms,
  knowledgeTopics,
  knowledgeSources,
} from "../shared/knowledge/catalog";
import { searchKnowledge, knowledgeCsv } from "../shared/knowledge/search";
test("knowledge catalogue has consistent topics, sources, unique IDs and valid related terms", () => {
  assert.ok(knowledgeTerms.length >= 500);
  assert.equal(knowledgeTopics.length, 21);
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
