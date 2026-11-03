import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function DocumentReviews({
  bundle,
  user,
  onRefresh,
}: {
  bundle: any;
  user: any;
  onRefresh: () => Promise<void>;
}) {
  const id = bundle.project.id,
    [selected, setSelected] = useState(""),
    [versions, setVersions] = useState<any[]>([]),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [comment, setComment] = useState("");
  const doc = bundle.documents.find((d: any) => d.id === selected);
  async function history(docId: string) {
    try {
      setVersions(await api(`/projects/${id}/documents/${docId}/versions`));
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    if (selected) history(selected);
  }, [selected, bundle.documents]);
  async function review(action: string) {
    setBusy(true);
    setError("");
    try {
      await api(`/projects/${id}/documents/${doc.id}/review`, "POST", {
        action,
        revision: doc.revision,
        comment,
      });
      setComment("");
      await onRefresh();
      await history(doc.id);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const snapshot = versions.find((v) => v.revision === version);
  return (
    <section className="panel tool-panel workspace-tools">
      <h2>Document control</h2>
      <p>
        Review the current revision, retain earlier content, and record approval
        decisions. Editing a document creates a new draft revision.
      </p>
      {error && <Notice>{error}</Notice>}
      <label>
        Document
        <select
          aria-label="Document"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setVersion(0);
            setError("");
          }}
        >
          <option value="">Choose a document</option>
          {bundle.documents.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.title} · v{d.revision} ·{" "}
              {d.approval_status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      {doc && (
        <>
          <div className="tool-title-row">
            <strong>Revision {doc.revision}</strong>
            <span className="badge">
              {doc.approval_status.replaceAll("_", " ")}
            </span>
          </div>
          <pre className="tool-document-preview">{doc.content}</pre>
          {doc.approved_at && <p>Approval recorded {date(doc.approved_at)}.</p>}
          <div className="tool-review-actions">
            {bundle.permissions.canEdit &&
              ["draft", "changes_requested"].includes(doc.approval_status) && (
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => review("submit")}
                >
                  Submit for review
                </button>
              )}
            {bundle.permissions.canManage &&
              doc.approval_status === "in_review" && (
                <>
                  <label>
                    Review note
                    <textarea
                      aria-label="Document review note"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={2000}
                    />
                  </label>
                  {doc.last_editor === user.id && (
                    <small>
                      Your approval will record you as both the latest editor
                      and the approver.
                    </small>
                  )}
                  <div className="button-group">
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={() => review("approve")}
                    >
                      Approve this revision
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy || !comment.trim()}
                      onClick={() => review("request_changes")}
                    >
                      Request changes
                    </button>
                  </div>
                </>
              )}
          </div>
          <label>
            Earlier revisions
            <select
              value={version}
              onChange={(e) => setVersion(Number(e.target.value))}
            >
              <option value="0">Select a saved revision</option>
              {versions.map((v) => (
                <option key={v.id} value={v.revision}>
                  Revision {v.revision} ·{" "}
                  {v.approval_status.replaceAll("_", " ")} ·{" "}
                  {date(v.created_at)}
                </option>
              ))}
            </select>
          </label>
          {snapshot && (
            <details open className="tool-version">
              <summary>
                {snapshot.title} — revision {snapshot.revision}
              </summary>
              <pre>{snapshot.content}</pre>
            </details>
          )}
        </>
      )}
    </section>
  );
}
