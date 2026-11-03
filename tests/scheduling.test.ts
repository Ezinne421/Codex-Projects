import test from "node:test";
import assert from "node:assert/strict";
import {
  analyseSchedule,
  addWorkingDays,
  workingDistance,
  weightedProgress,
  type ScheduledTask,
} from "../shared/scheduling";
const project = {
  start_date: "2026-11-02",
  end_date: "2026-11-20",
  working_week: "1,2,3,4,5",
};
const task = (
  id: string,
  start = "2026-11-02",
  end = "2026-11-03",
): ScheduledTask => ({
  id,
  title: id,
  start_date: start,
  end_date: end,
  status: "To do",
  progress: 0,
});
test("working calendar crosses weekends in both directions and counts consistently", () => {
  assert.equal(addWorkingDays("2026-11-06", 1), "2026-11-09");
  assert.equal(addWorkingDays("2026-11-09", -1), "2026-11-06");
  assert.equal(addWorkingDays("2026-11-07", 0), "2026-11-09");
  assert.equal(workingDistance("2026-11-02", "2026-11-09"), 5);
  assert.equal(addWorkingDays("2026-11-06", 1, "0,1,2,3,4,5,6"), "2026-11-07");
  assert.throws(() => addWorkingDays("2026-11-02", 2, ""));
});
test("dependency scheduling calculates parallel-path float and a valid critical path", () => {
  const result = analyseSchedule(
    project,
    [task("a"), task("b", "2026-11-02", "2026-11-04"), task("c")],
    [
      { predecessor_id: "a", task_id: "c", relationship: "FS", lag_days: 0 },
      { predecessor_id: "b", task_id: "c", relationship: "FS", lag_days: 0 },
    ],
  );
  const a = result.tasks.find((t) => t.id === "a")!,
    b = result.tasks.find((t) => t.id === "b")!,
    c = result.tasks.find((t) => t.id === "c")!;
  assert.equal(a.totalFloat, 1);
  assert.equal(b.critical, true);
  assert.equal(c.start_date, "2026-11-05");
  assert.equal(c.end_date, "2026-11-06");
  assert.equal(result.finish, "2026-11-06");
  assert.equal(result.workingDays, 5);
});
test("all four relationship types, leads and milestone timing follow declared constraints", () => {
  const tasks = [task("a", "2026-11-02", "2026-11-06"), task("b")];
  const start = (relationship: "FS" | "SS" | "FF" | "SF", lag_days = 0) =>
    analyseSchedule(project, tasks, [
      { predecessor_id: "a", task_id: "b", relationship, lag_days },
    ]).tasks.find((t) => t.id === "b")!.start_date;
  assert.equal(start("FS"), "2026-11-09");
  assert.equal(start("SS", 1), "2026-11-03");
  assert.equal(start("FF"), "2026-11-05");
  assert.equal(start("SF", 3), "2026-11-03");
  assert.equal(start("FS", -1), "2026-11-06");
  const r = analyseSchedule(
    project,
    [task("a"), { ...task("m"), milestone: 1 }],
    [{ predecessor_id: "a", task_id: "m", relationship: "FS", lag_days: 0 }],
  );
  assert.equal(r.tasks[1].duration, 0);
  assert.equal(r.tasks[1].start_date, r.tasks[1].end_date);
});
test("cycles and foreign tasks are rejected; completed or fixed conflicts are reported", () => {
  const tasks = [task("a"), { ...task("b"), fixed_start: 1 }];
  assert.throws(
    () =>
      analyseSchedule(project, tasks, [
        { predecessor_id: "a", task_id: "b", relationship: "FS", lag_days: 0 },
        { predecessor_id: "b", task_id: "a", relationship: "FS", lag_days: 0 },
      ]),
    /cycle/,
  );
  assert.throws(
    () =>
      analyseSchedule(project, tasks, [
        {
          predecessor_id: "external",
          task_id: "b",
          relationship: "FS",
          lag_days: 0,
        },
      ]),
    /this project/,
  );
  assert.equal(
    analyseSchedule(project, tasks, [
      { predecessor_id: "a", task_id: "b", relationship: "FS", lag_days: 0 },
    ]).issues.length,
    1,
  );
  assert.equal(
    weightedProgress([
      { progress: 100, weight: 1 },
      { progress: 0, weight: 3 },
    ]),
    25,
  );
});

test("weekend end dates do not add a phantom workday, completed actuals remain unchanged, and final milestones govern finish", () => {
  const friday = analyseSchedule(
    project,
    [task("a", "2026-11-05", "2026-11-07")],
    [],
  );
  assert.equal(friday.tasks[0].duration, 2);
  assert.equal(friday.tasks[0].end_date, "2026-11-03");
  const completed = {
    ...task("done", "2026-11-07", "2026-11-08"),
    status: "Done",
    progress: 100,
  };
  const actual = analyseSchedule(project, [completed], []).tasks[0];
  assert.equal(actual.start_date, "2026-11-07");
  assert.equal(actual.end_date, "2026-11-08");
  assert.equal(actual.changed, false);
  const result = analyseSchedule(
    project,
    [task("a"), { ...task("m"), milestone: 1 }],
    [{ predecessor_id: "a", task_id: "m", relationship: "FS", lag_days: 0 }],
  );
  assert.equal(result.finish, "2026-11-04");
});
