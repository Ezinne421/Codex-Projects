import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function ScheduleWorkspace({
  bundle,
  onRefresh,
}: {
  bundle: any;
  onRefresh: () => Promise<void>;
}) {
  const id = bundle.project.id,
    [schedule, setSchedule] = useState<any>(null),
    [baselines, setBaselines] = useState<any[]>([]),
    [selectedBaseline, setSelectedBaseline] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [s, b] = await Promise.all([
        api(`/projects/${id}/schedule`),
        api(`/projects/${id}/baselines`),
      ]);
      setSchedule(s);
      setBaselines(b);
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    load();
  }, [id, bundle.project.revision]);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
      await onRefresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const baseline = baselines.find((b) => b.id === selectedBaseline);
  return (
    <section className="workspace-tools">
      {error && <Notice>{error}</Notice>}
      <section className="panel tool-panel">
        <div className="tool-title-row">
          <div>
            <h2>Schedule logic & forecast</h2>
            <p>
              {bundle.project.working_week === "0,1,2,3,4,5,6"
                ? "Seven-day calendar"
                : "Monday–Friday calendar"}{" "}
              · finish-to-start, start-to-start, finish-to-finish and
              start-to-finish links.
            </p>
          </div>
          <button className="button secondary" onClick={load}>
            Refresh preview
          </button>
        </div>
        {schedule && (
          <>
            <div className="tool-schedule-summary">
              <div>
                <small>Calculated finish</small>
                <strong>{schedule.finish}</strong>
              </div>
              <div>
                <small>Against project finish</small>
                <strong>
                  {schedule.varianceDays > 0 ? "+" : ""}
                  {schedule.varianceDays} working days
                </strong>
              </div>
              <div>
                <small>Weighted task progress</small>
                <strong>
                  {schedule.progress === null
                    ? "No tasks"
                    : schedule.progress + "%"}
                </strong>
              </div>
            </div>
            <p className="tool-method">
              {schedule.method} The preview preserves completed and fixed-date
              work. Applying the preview changes planned task dates.
            </p>
            {schedule.issues.map((i: string) => (
              <Notice key={i}>{i}</Notice>
            ))}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Preview start</th>
                    <th>Preview finish</th>
                    <th>Duration</th>
                    <th>Total float</th>
                    <th>Path</th>
                    {baseline && <th>Finish versus baseline</th>}
                  </tr>
                </thead>
                <tbody>
                  {schedule.tasks.map((t: any) => {
                    const b = baseline?.record.tasks.find(
                      (x: any) => x.id === t.id,
                    );
                    return (
                      <tr key={t.id}>
                        <td>
                          {t.milestone ? "◆ " : ""}
                          {t.title}
                          {t.changed && <small>Dates will change</small>}
                        </td>
                        <td>{t.start_date}</td>
                        <td>{t.end_date}</td>
                        <td>{t.duration} workdays</td>
                        <td>{t.totalFloat} workdays</td>
                        <td>
                          {t.critical ? (
                            <span className="badge amber">Critical</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        {baseline && (
                          <td>
                            {b
                              ? `${b.end_date} → ${t.end_date}`
                              : "Not in baseline"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bundle.permissions.canEdit && (
              <button
                className="button primary"
                disabled={
                  busy || !schedule.tasks.length || schedule.issues.length > 0
                }
                onClick={() =>
                  act(async () => {
                    await api(`/projects/${id}/schedule/apply`, "POST", {
                      fingerprint: schedule.fingerprint,
                    });
                  })
                }
              >
                Apply preview to planned tasks
              </button>
            )}
          </>
        )}
      </section>
      <section className="panel tool-panel">
        <h2>Activity dependencies</h2>
        <div className="tool-dependencies">
          {schedule?.dependencies.map((d: Dependency) => (
            <div key={d.task_id + d.predecessor_id}>
              <span>
                {
                  bundle.tasks.find((t: any) => t.id === d.predecessor_id)
                    ?.title
                }{" "}
                → {bundle.tasks.find((t: any) => t.id === d.task_id)?.title}
                <small>
                  {d.relationship} · lag {d.lag_days} working days
                </small>
              </span>
              {bundle.permissions.canEdit && (
                <button
                  disabled={busy}
                  className="text-link"
                  onClick={() =>
                    act(async () => {
                      await api(`/projects/${id}/dependencies`, "PUT", {
                        dependencies: schedule.dependencies.filter(
                          (x: Dependency) =>
                            x.task_id !== d.task_id ||
                            x.predecessor_id !== d.predecessor_id,
                        ),
                      });
                    })
                  }
                >
                  Remove link
                </button>
              )}
            </div>
          ))}
        </div>
        {bundle.permissions.canEdit && bundle.tasks.length > 1 && (
          <form
            className="tool-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              act(async () => {
                await api(`/projects/${id}/dependencies`, "PUT", {
                  dependencies: [
                    ...schedule.dependencies,
                    {
                      predecessor_id: f.get("predecessor_id"),
                      task_id: f.get("task_id"),
                      relationship: f.get("relationship"),
                      lag_days: Number(f.get("lag_days")),
                    },
                  ],
                });
              });
            }}
          >
            <label>
              Predecessor
              <select name="predecessor_id" aria-label="Predecessor">
                {bundle.tasks.map((t: any) => (
                  <option value={t.id} key={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Successor
              <select
                aria-label="Successor"
                name="task_id"
                defaultValue={bundle.tasks[1]?.id}
              >
                {bundle.tasks.map((t: any) => (
                  <option value={t.id} key={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Relationship
              <select name="relationship" aria-label="Relationship">
                {["FS", "SS", "FF", "SF"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Lag (workdays)
              <input
                name="lag_days"
                type="number"
                min="-365"
                max="365"
                defaultValue="0"
                required
              />
            </label>
            <button className="button secondary" disabled={busy || !schedule}>
              Add dependency
            </button>
          </form>
        )}
      </section>
      <section className="panel tool-panel">
        <h2>Approved planning baselines</h2>
        <p>
          Each baseline is an immutable snapshot of the saved task dates,
          dependencies, project assumptions and budget lines. Capture one after
          approving the current plan.
        </p>
        <label>
          Compare with
          <select
            aria-label="Compare with"
            value={selectedBaseline}
            onChange={(e) => setSelectedBaseline(e.target.value)}
          >
            <option value="">No baseline selected</option>
            {baselines.map((b) => (
              <option value={b.id} key={b.id}>
                {b.title} · {date(b.created_at)}
              </option>
            ))}
          </select>
        </label>
        {baseline && (
          <p className="tool-method">
            Approved by {baseline.record.approvedBy}. The schedule table
            compares this saved plan with the current calculated preview.
          </p>
        )}
        {bundle.permissions.canManage && (
          <form
            className="tool-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              act(async () => {
                await api(`/projects/${id}/baselines`, "POST", {
                  title: f.get("title"),
                });
              });
            }}
          >
            <label>
              Baseline name
              <input
                name="title"
                maxLength={150}
                required
                placeholder="Approved delivery plan — revision 1"
              />
            </label>
            <button className="button primary" disabled={busy}>
              Approve and capture baseline
            </button>
          </form>
        )}
      </section>
      <section className="panel tool-panel">
        <h2>Assigned workload</h2>
        <p>
          Saved planned effort is spread over each task's working days. Capacity
          comes from workspace membership; this view reports load and does not
          automatically level resources.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Week of</th>
                <th>Planned hours</th>
                <th>Capacity</th>
                <th>Capacity check</th>
              </tr>
            </thead>
            <tbody>
              {schedule?.workload.map((w: any) => (
                <tr key={w.userId + w.week}>
                  <td>{w.name}</td>
                  <td>{w.week}</td>
                  <td>{w.hours.toFixed(1)}</td>
                  <td>{w.capacity}</td>
                  <td>
                    {w.hours > w.capacity ? (
                      <span className="badge amber">Over capacity</span>
                    ) : (
                      "Within capacity"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {schedule?.workload.length === 0 && (
          <p className="muted">
            Assign workspace members and planned hours to tasks to see their
            workload.
          </p>
        )}
      </section>
    </section>
  );
}
