import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function ProjectDiscussion({
  bundle,
  user,
  onRefresh,
}: {
  bundle: any;
  user: any;
  onRefresh: () => Promise<void>;
}) {
  const id = bundle.project.id,
    [people, setPeople] = useState<any[]>([]),
    [comments, setComments] = useState<any[]>([]),
    [error, setError] = useState(""),
    [mentions, setMentions] = useState<string[]>([]),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [p, c] = await Promise.all([
        api(`/projects/${id}/people`),
        api(`/projects/${id}/comments`),
      ]);
      setPeople(p);
      setComments(c);
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  async function access(person: any, role: string) {
    setError("");
    try {
      await api(
        `/projects/${id}/people/${person.id}`,
        role ? "PUT" : "DELETE",
        role ? { role } : undefined,
      );
      await load();
      await onRefresh();
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <section className="workspace-tools">
      {error && <Notice>{error}</Notice>}
      <section className="panel tool-panel">
        <h2>Project access</h2>
        <p>
          Project managers manage access and approvals. Editors update delivery
          records. Viewers can read and export.
        </p>
        <div className="tool-people">
          {people.map((p) => (
            <div key={p.id}>
              <span>
                <strong>{p.name}</strong>
                <small>
                  {p.email} · {p.role}
                </small>
              </span>
              {bundle.permissions.canManage &&
              !["owner", "admin"].includes(p.role) ? (
                <select
                  aria-label={`Project access for ${p.name}`}
                  value={p.projectRole || ""}
                  onChange={(e) => access(p, e.target.value)}
                >
                  <option value="">No project access</option>
                  <option value="manager">Project manager</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <span className="badge">{p.projectRole || "No access"}</span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="panel tool-panel">
        <h2>Project discussion</h2>
        {comments.length === 0 && (
          <p className="muted">
            Start a decision, ask a question, or record an important handoff.
          </p>
        )}
        <div className="tool-comments">
          {comments.map((c) => (
            <article key={c.id}>
              <header>
                <strong>{c.author_name}</strong>
                <time>{date(c.created_at)}</time>
              </header>
              {c.entity_type !== "project" && (
                <small>Linked to {c.entity_type}</small>
              )}
              <p>{c.content}</p>
            </article>
          ))}
        </div>
        {bundle.permissions.canEdit && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget,
                content = String(new FormData(form).get("content"));
              setBusy(true);
              setError("");
              try {
                await api(`/projects/${id}/comments`, "POST", {
                  content,
                  mention_ids: mentions,
                });
                form.reset();
                setMentions([]);
                await load();
              } catch (e) {
                setError(message(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Your message
              <textarea
                name="content"
                aria-label="Project discussion message"
                required
                maxLength={6000}
                rows={4}
              />
            </label>
            <fieldset className="tool-mentions">
              <legend>Notify people in this discussion</legend>
              {people
                .filter((p) => p.projectRole && p.id !== user.id)
                .map((p) => (
                  <label key={p.id}>
                    <input
                      type="checkbox"
                      checked={mentions.includes(p.id)}
                      onChange={(e) =>
                        setMentions((a) =>
                          e.target.checked
                            ? [...a, p.id]
                            : a.filter((x) => x !== p.id),
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
            </fieldset>
            <button disabled={busy} className="button primary">
              Post message
            </button>
          </form>
        )}
      </section>
    </section>
  );
}
