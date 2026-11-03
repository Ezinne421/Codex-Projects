import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function Inbox({
  tasks,
  user,
  onOpen,
  onUnreadCount,
}: {
  tasks: any[];
  user: any;
  onOpen: (id: string) => void;
  onUnreadCount?: (count: number) => void;
}) {
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState("");
  async function load() {
    try {
      const incoming = await api("/notifications");
      setRows(incoming);
      onUnreadCount?.(incoming.filter((n: any) => !n.read_at).length);
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    load();
  }, [user.org_id]);
  return (
    <section className="workspace-tools">
      <header className="tool-heading">
        <span className="eyebrow">YOUR WORK / INBOX</span>
        <h1>What needs your attention.</h1>
        <p>
          Assignments, mentions and review decisions for projects you can
          access.
        </p>
      </header>
      {error && <Notice>{error}</Notice>}
      <section className="panel tool-panel">
        <h2>Updates</h2>
        {rows.length === 0 && <p className="muted">No notifications yet.</p>}
        {rows.map((n) => (
          <article
            className={`tool-notification ${n.read_at ? "" : "unread"}`}
            key={n.id}
          >
            <button onClick={() => onOpen(n.project_id)}>
              <strong>{n.title}</strong>
              <small>{date(n.created_at)}</small>
            </button>
            {!n.read_at && (
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await api("/notifications/" + n.id + "/read", "PUT");
                    await load();
                  } catch (e) {
                    setError(message(e));
                  }
                }}
              >
                Mark read
              </button>
            )}
          </article>
        ))}
      </section>
      <section className="panel tool-panel">
        <h2>Your open assignments</h2>
        {tasks
          .filter((t) => t.assignee_id === user.id && t.status !== "Done")
          .map((t) => (
            <button
              className="tool-assignment"
              key={t.id}
              onClick={() => onOpen(t.projectId)}
            >
              <strong>{t.title}</strong>
              <span>
                {t.project} · due {t.end_date}{" "}
                {t.end_date < today() ? "· Overdue" : ""}
              </span>
            </button>
          ))}
      </section>
    </section>
  );
}
