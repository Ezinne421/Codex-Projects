import test from "node:test";
import assert from "node:assert/strict";
import {
  learningLessons,
  learningPaths,
  currentGuidance,
  lessonResources,
} from "../shared/knowledge/learning";
import { knowledgeTerms } from "../shared/knowledge/catalog";
import {
  calculatePractice,
  recordPractice,
  readLearningProgress,
  dueLessons,
  validStudyDay,
} from "../shared/knowledge/practice";
test("learning paths and lessons have complete, original study material and connected references", () => {
  assert.equal(learningLessons.length, 24);
  assert.equal(new Set(learningLessons.map((l) => l.id)).size, 24);
  assert.equal(
    learningLessons.reduce((n, l) => n + l.questions.length, 0),
    48,
  );
  for (const l of learningLessons) {
    assert.ok(l.explanation.length > 180, l.id);
    assert.ok(l.steps.length >= 3);
    assert.ok(
      l.scenario.context &&
        l.scenario.decision &&
        l.scenario.reason &&
        l.apply &&
        l.pitfall,
    );
    for (const id of l.terms)
      assert.ok(
        knowledgeTerms.some((t) => t.id === id),
        l.id + ":" + id,
      );
    for (const q of l.questions) {
      assert.ok(q.options.length >= 3);
      assert.ok(q.answer >= 0 && q.answer < q.options.length);
      assert.ok(q.explanation.length > 25);
      assert.equal(new Set(q.options).size, q.options.length);
    }
    assert.ok(
      lessonResources(l.id).every((s) => new URL(s.url).protocol === "https:"),
    );
  }
  const included = new Set(learningPaths.flatMap((p) => [...p.lessons]));
  assert.equal(included.size, 24);
  for (const p of learningPaths)
    for (const id of p.lessons)
      assert.ok(learningLessons.some((l) => l.id === id));
  assert.equal(currentGuidance.length, 6);
  for (const g of currentGuidance) {
    assert.ok(new URL(g.url).protocol === "https:");
    for (const id of g.lessons)
      assert.ok(learningLessons.some((l) => l.id === id));
  }
});
test("recall schedules 1, 3, 7, 14, 30 day intervals and does not reward same-day or early retakes", () => {
  let p = recordPractice({}, "value", 2, 2, "2026-11-02");
  assert.equal(p.value.due, "2026-11-03");
  assert.equal(dueLessons(p, "2026-11-02").length, 0);
  assert.equal(dueLessons(p, "2026-11-03")[0].id, "value");
  p = recordPractice(p, "value", 2, 2, "2026-11-02");
  assert.equal(p.value.streak, 1);
  assert.equal(p.value.due, "2026-11-03");
  p = recordPractice(p, "value", 2, 2, "2026-11-03");
  assert.equal(p.value.due, "2026-11-06");
  p = recordPractice(p, "value", 2, 2, "2026-11-04");
  assert.equal(p.value.streak, 2);
  assert.equal(p.value.due, "2026-11-06");
  p = recordPractice(p, "value", 2, 2, "2026-11-06");
  assert.equal(p.value.due, "2026-11-13");
  p = recordPractice(p, "value", 2, 2, "2026-11-13");
  assert.equal(p.value.due, "2026-11-27");
  p = recordPractice(p, "value", 2, 2, "2026-11-27");
  assert.equal(p.value.due, "2026-12-27");
  p = recordPractice(p, "value", 1, 2, "2026-11-28");
  assert.equal(p.value.passed, false);
  assert.equal(p.value.streak, 0);
  assert.equal(p.value.due, "2026-11-29");
  assert.deepEqual(readLearningProgress(JSON.stringify(p)), p);
  assert.deepEqual(readLearningProgress("null"), {});
  assert.deepEqual(readLearningProgress("{broken"), {});
  assert.deepEqual(
    readLearningProgress(
      JSON.stringify({ value: { ...p.value, due: "2026-02-30" } }),
    ),
    {},
  );
  assert.equal(validStudyDay("2026-02-30"), false);
  assert.throws(() => recordPractice({}, "value", 3, 2, "2026-11-02"));
  assert.throws(() => recordPractice({}, "unknown", 2, 2, "2026-11-02"));
  assert.throws(() => recordPractice({}, "value", 2, 2, "not-a-date"));
});
test("practice calculators calculate consistent examples and reject invalid or misleading input", () => {
  const evm = calculatePractice("evm", {
    pv: "100000",
    ev: "80000",
    ac: "100000",
    bac: "200000",
  });
  assert.deepEqual(
    evm.results.map((r) => r[1]),
    [0.8, 0.8, -20000, -20000, 250000, -50000],
  );
  assert.ok(
    calculatePractice("evm", { pv: "0", ev: "0", ac: "100", bac: "200" }).error,
  );
  assert.ok(
    calculatePractice("evm", { pv: "100", ev: "201", ac: "100", bac: "200" })
      .error,
  );
  const zero = calculatePractice("evm", {
    pv: "100",
    ev: "0",
    ac: "100",
    bac: "200",
  });
  assert.equal(zero.results.length, 4);
  assert.ok(zero.results.every((r) => Number.isFinite(r[1])));
  assert.equal(
    calculatePractice("pert", {
      optimistic: "4",
      likely: "7",
      pessimistic: "16",
    }).results[0][1],
    8,
  );
  assert.ok(
    calculatePractice("pert", {
      optimistic: "8",
      likely: "7",
      pessimistic: "16",
    }).error,
  );
  assert.equal(
    calculatePractice("flow", { throughput: "5", time: "4" }).results[0][1],
    20,
  );
  assert.equal(
    calculatePractice("flow", { throughput: "0", time: "4" }).results[0][1],
    0,
  );
  assert.ok(
    Math.abs(
      calculatePractice("oee", {
        availability: "90",
        performance: "95",
        quality: "98",
      }).results[0][1] - 83.79,
    ) < 1e-9,
  );
  assert.ok(
    calculatePractice("oee", {
      availability: "101",
      performance: "95",
      quality: "98",
    }).error,
  );
  for (const bad of ["", "-1", "NaN", "Infinity", "1e999", "abc"])
    assert.ok(
      calculatePractice("flow", { throughput: bad, time: "4" }).error,
      bad,
    );
  assert.ok(
    calculatePractice("flow", { throughput: "1e308", time: "1e308" }).error,
  );
});
