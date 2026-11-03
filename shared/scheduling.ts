export type ScheduledTask = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  milestone?: number;
  fixed_start?: number;
  weight?: number;
  effort_hours?: number;
  assignee_id?: string | null;
};
export type Dependency = {
  task_id: string;
  predecessor_id: string;
  relationship: "FS" | "SS" | "FF" | "SF";
  lag_days: number;
};
const day = 86400000;
const dayNumber = (iso: string) => {
  const n = Date.parse(iso + "T00:00:00Z") / day;
  if (!Number.isFinite(n)) throw Error("Invalid schedule date.");
  return n;
};
const iso = (n: number) => new Date(n * day).toISOString().slice(0, 10);
const weekday = (n: number) => (((n + 4) % 7) + 7) % 7;
export function workingDays(calendar: string) {
  if (!/^[0-6](,[0-6])*$/.test(calendar))
    throw Error("Choose a valid working week.");
  const days = new Set(calendar.split(",").map(Number));
  if (
    !days.size ||
    [...days].some((n) => !Number.isInteger(n) || n < 0 || n > 6)
  )
    throw Error("Choose a valid working week.");
  return days;
}
function nextWorking(n: number, days: Set<number>) {
  for (let i = 0; i < 7; i++, n++) if (days.has(weekday(n))) return n;
  throw Error("No working days.");
}
function ordinal(n: number, days: Set<number>) {
  const weeks = Math.floor(n / 7),
    rest = n - weeks * 7;
  let count = weeks * days.size;
  for (let i = 0; i < rest; i++) if (days.has((i + 4) % 7)) count++;
  return count;
}
export function addWorkingDays(
  date: string,
  amount: number,
  calendar = "1,2,3,4,5",
) {
  const days = workingDays(calendar);
  if (!Number.isInteger(amount) || Math.abs(amount) > 100000)
    throw Error("Schedule duration is outside the supported range.");
  let n =
    nextWorking(dayNumber(date), days) + Math.floor(amount / days.size) * 7;
  let rest = amount - Math.floor(amount / days.size) * days.size;
  while (rest-- > 0) n = nextWorking(n + 1, days);
  return iso(n);
}
export function workingDistance(
  start: string,
  end: string,
  calendar = "1,2,3,4,5",
) {
  const days = workingDays(calendar);
  return (
    ordinal(nextWorking(dayNumber(end), days), days) -
    ordinal(nextWorking(dayNumber(start), days), days)
  );
}
export function workingSpan(
  start: string,
  end: string,
  calendar = "1,2,3,4,5",
) {
  const days = workingDays(calendar);
  return Math.max(
    0,
    ordinal(dayNumber(end) + 1, days) - ordinal(dayNumber(start), days),
  );
}
export function weightedProgress(
  tasks: { progress: number; weight?: number }[],
) {
  if (!tasks.length) return null;
  const weight = tasks.reduce((n, t) => n + (t.weight || 1), 0);
  return Math.round(
    tasks.reduce((n, t) => n + t.progress * (t.weight || 1), 0) / weight,
  );
}
export function analyseSchedule(
  project: { start_date: string; end_date: string; working_week?: string },
  tasks: ScheduledTask[],
  dependencies: Dependency[],
) {
  if (tasks.length > 2000)
    throw Error(
      "This scheduling view supports up to 2,000 activities per project.",
    );
  const calendar = project.working_week || "1,2,3,4,5",
    start = addWorkingDays(project.start_date, 0, calendar),
    map = new Map(tasks.map((t) => [t.id, t]));
  const incoming = new Map(tasks.map((t) => [t.id, [] as Dependency[]])),
    outgoing = new Map(tasks.map((t) => [t.id, [] as Dependency[]]));
  for (const d of dependencies) {
    if (
      !map.has(d.task_id) ||
      !map.has(d.predecessor_id) ||
      d.task_id === d.predecessor_id
    )
      throw Error("Dependencies must connect different tasks in this project.");
    incoming.get(d.task_id)!.push(d);
    outgoing.get(d.predecessor_id)!.push(d);
  }
  const remaining = new Map(
      tasks.map((t) => [t.id, incoming.get(t.id)!.length]),
    ),
    queue = tasks.filter((t) => !remaining.get(t.id)).map((t) => t.id),
    order: string[] = [];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    order.push(id);
    for (const edge of outgoing.get(id)!) {
      const n = remaining.get(edge.task_id)! - 1;
      remaining.set(edge.task_id, n);
      if (n === 0) queue.push(edge.task_id);
    }
  }
  if (order.length !== tasks.length)
    throw Error(
      "These dependencies create a cycle. Remove a circular link before scheduling.",
    );
  const duration = new Map(
    tasks.map((t) => [
      t.id,
      t.milestone
        ? 0
        : Math.max(
            t.status === "Done" ? 0 : 1,
            workingSpan(t.start_date, t.end_date, calendar),
          ),
    ]),
  );
  const offset = (edge: Dependency) => {
    const a = duration.get(edge.predecessor_id)!,
      b = duration.get(edge.task_id)!;
    return (
      edge.lag_days + { FS: a, SS: 0, FF: a - b, SF: -b }[edge.relationship]
    );
  };
  const early = new Map<string, number>(),
    late = new Map<string, number>(),
    issues: string[] = [];
  for (const id of order) {
    const t = map.get(id)!,
      fixed = t.fixed_start || t.status === "Done";
    const anchor = workingDistance(start, t.start_date, calendar);
    let earliest = 0;
    for (const d of incoming.get(id)!)
      earliest = Math.max(earliest, early.get(d.predecessor_id)! + offset(d));
    if (fixed) {
      if (
        t.fixed_start &&
        t.status !== "Done" &&
        addWorkingDays(t.start_date, 0, calendar) !== t.start_date
      )
        issues.push(
          `${t.title}: its fixed start falls outside the working week.`,
        );
      if (anchor < earliest)
        issues.push(
          `${t.title}: its fixed or completed date conflicts with predecessor logic.`,
        );
      earliest = anchor;
    }
    early.set(id, earliest);
  }
  const horizon = Math.max(
    0,
    ...order.map((id) => early.get(id)! + duration.get(id)!),
  );
  for (const id of [...order].reverse()) {
    let latest = horizon - duration.get(id)!;
    for (const d of outgoing.get(id)!)
      latest = Math.min(latest, late.get(d.task_id)! - offset(d));
    const t = map.get(id)!;
    if (t.fixed_start || t.status === "Done")
      latest = Math.min(latest, early.get(id)!);
    late.set(id, latest);
  }
  const scheduled = order.map((id) => {
    const t = map.get(id)!,
      s = early.get(id)!,
      d = duration.get(id)!,
      start_date = addWorkingDays(start, s, calendar),
      end_date = addWorkingDays(start, s + Math.max(0, d - 1), calendar),
      totalFloat = late.get(id)! - s;
    return {
      ...t,
      start_date: t.status === "Done" ? t.start_date : start_date,
      end_date: t.status === "Done" ? t.end_date : end_date,
      duration: d,
      totalFloat,
      critical: totalFloat === 0,
      changed:
        t.status !== "Done" &&
        (start_date !== t.start_date || end_date !== t.end_date),
    };
  });
  const finish = scheduled.length
    ? scheduled
        .map((t) => t.end_date)
        .sort()
        .at(-1)!
    : start;
  return {
    tasks: scheduled,
    finish,
    workingDays: horizon,
    varianceDays: workingDistance(project.end_date, finish, calendar),
    issues,
    progress: weightedProgress(tasks),
    method:
      "Dependency-based critical path with the selected working week. Resources are reported separately; this is not resource levelling.",
  };
}
