import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function TeamWorkspace({
  user,
  onSwitch,
}: {
  user: any;
  onSwitch: () => Promise<void>;
}) {
  const [members, setMembers] = useState<any[]>([]),
    [invites, setInvites] = useState<any[]>([]),
    [workspaces, setWorkspaces] = useState<any[]>([]),
    [error, setError] = useState(""),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false);
  const admin = ["owner", "admin"].includes(user.role);
  async function load() {
    try {
      const [m, w, i] = await Promise.all([
        api("/workspace/members"),
        api("/workspaces"),
        admin ? api("/workspace/invitations") : Promise.resolve([]),
      ]);
      setMembers(m);
      setWorkspaces(w);
      setInvites(i);
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    load();
  }, [user.org_id]);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="workspace-tools">
      <header className="tool-heading">
        <span className="eyebrow">PEOPLE / WORKSPACE</span>
        <h1>A team, with clear responsibilities.</h1>
        <p>
          Workspace membership opens the door. Project access determines who can
          see and change each project.
        </p>
      </header>
      {error && <Notice>{error}</Notice>}
      <section className="panel tool-panel">
        <h2>Your workspaces</h2>
        <div className="tool-workspaces">
          {workspaces.map((w) => (
            <button
              className={`button ${w.id === user.org_id ? "primary" : "secondary"}`}
              key={w.id}
              disabled={busy || w.id === user.org_id}
              onClick={() =>
                act(async () => {
                  await api("/workspaces/switch", "POST", { org_id: w.id });
                  await onSwitch();
                })
              }
            >
              {w.name} · {w.role}
            </button>
          ))}
        </div>
      </section>
      <section className="panel tool-panel">
        <h2>
          Members <span className="tool-count">{members.length}</span>
        </h2>
        <p className="muted">
          Owners and admins manage the workspace and can access every project.
          Members and viewers need explicit project access. Weekly capacity
          supports workload checks.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Workspace role</th>
                <th>Hours / week</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                    <small>{m.email}</small>
                  </td>
                  <td>
                    {admin && m.role !== "owner" ? (
                      <select
                        aria-label={`Role for ${m.name}`}
                        value={m.role}
                        onChange={(e) =>
                          setMembers((a) =>
                            a.map((x) =>
                              x.id === m.id
                                ? { ...x, role: e.target.value }
                                : x,
                            ),
                          )
                        }
                      >
                        {["admin", "member", "viewer"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      m.role
                    )}
                  </td>
                  <td>
                    {admin && (m.role !== "owner" || m.id === user.id) ? (
                      <input
                        type="number"
                        min="0"
                        max="168"
                        aria-label={`Weekly hours for ${m.name}`}
                        value={m.weekly_capacity}
                        onChange={(e) =>
                          setMembers((a) =>
                            a.map((x) =>
                              x.id === m.id
                                ? {
                                    ...x,
                                    weekly_capacity: Number(e.target.value),
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                    ) : (
                      m.weekly_capacity
                    )}
                  </td>
                  <td>
                    {admin && (m.role !== "owner" || m.id === user.id) && (
                      <div className="button-group">
                        <button
                          disabled={busy}
                          className="text-link"
                          onClick={() =>
                            act(async () => {
                              await api("/workspace/members/" + m.id, "PUT", {
                                role: m.role,
                                weekly_capacity: m.weekly_capacity,
                              });
                            })
                          }
                        >
                          Save
                        </button>
                        <button
                          disabled={busy}
                          className="text-link danger"
                          hidden={m.role === "owner"}
                          onClick={() => {
                            if (
                              confirm(`Remove ${m.name} from this workspace?`)
                            )
                              act(async () => {
                                await api(
                                  "/workspace/members/" + m.id,
                                  "DELETE",
                                );
                              });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {admin && (
        <section className="panel tool-panel">
          <h2>Invite someone to the work</h2>
          <p>
            Invite links expire after seven days and can be used once, by an
            account with the named email. Share the link through your trusted
            channel.
          </p>
          <form
            className="tool-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              act(async () => {
                const r = await api("/workspace/invitations", "POST", {
                  email: f.get("email"),
                  role: f.get("role"),
                });
                setLink(r.url);
              });
            }}
          >
            <label>
              Email address
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label>
              Workspace role
              <select name="role" aria-label="Workspace role">
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="button primary" disabled={busy}>
              Create invitation link
            </button>
          </form>
          {link && (
            <div className="tool-invite-link">
              <label>
                New invitation link
                <input readOnly value={link} />
              </label>
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                  } catch {
                    setError("Select and copy the invitation link manually.");
                  }
                }}
              >
                Copy link
              </button>
              <small>
                This link grants access to the named account. It is shown only
                here; create another link if it is lost.
              </small>
            </div>
          )}
          <div className="tool-invites">
            {invites.map((i) => (
              <div key={i.id}>
                <span>
                  {i.email}{" "}
                  <small>
                    {i.role} ·{" "}
                    {i.status === "pending" && i.expires_at < Date.now()
                      ? "expired"
                      : i.status}
                  </small>
                </span>
                {i.status === "pending" && (
                  <button
                    disabled={busy}
                    className="text-link"
                    onClick={() =>
                      act(async () => {
                        await api("/workspace/invitations/" + i.id, "DELETE");
                      })
                    }
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
