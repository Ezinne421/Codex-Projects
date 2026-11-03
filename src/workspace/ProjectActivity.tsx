import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function ProjectActivity({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    api(`/projects/${projectId}/activity`)
      .then(setRows)
      .catch((e) => setError(message(e)));
  }, [projectId]);
  return (
    <section className="panel tool-panel workspace-tools">
      <h2>Project activity</h2>
      <p>
        Recent recorded changes and decisions. Detailed event records begin with
        this workspace upgrade.
      </p>
      {error && <Notice>{error}</Notice>}
      <ol className="tool-activity">
        {rows.map((r) => (
          <li key={r.id}>
            <time>{date(r.created_at)}</time>
            <div>
              <strong>
                {r.action.replaceAll(".", " · ").replaceAll("_", " ")}
              </strong>
              <p>
                {r.actor_name || "Recorded actor"} · record {r.record_id}
              </p>
              {r.details !== "{}" && (
                <pre>{JSON.stringify(JSON.parse(r.details), null, 2)}</pre>
              )}
            </div>
          </li>
        ))}
      </ol>
      {rows.length === 0 && (
        <p className="muted">Changes and review decisions will appear here.</p>
      )}
    </section>
  );
}
