import { useState } from "react";
import {
  FileText,
  ArrowRight,
  Download,
  Check,
  LoaderCircle,
} from "lucide-react";
import {
  templateCatalog,
  generateManagementTemplate,
  type TemplateContext,
} from "../shared/templates";
import { api, type Bundle } from "./api";
export default function Templates({
  projects,
  fixedProject,
  onSaved,
  onCreateProject,
  initialTemplateId = "plan",
}: {
  projects: Bundle[];
  initialTemplateId?: string;
  fixedProject?: Bundle;
  onSaved: (id: string) => Promise<void>;
  onCreateProject: () => void;
}) {
  const [templateId, setTemplateId] = useState(
      templateCatalog.some((t) => t.id === initialTemplateId)
        ? initialTemplateId
        : "plan",
    ),
    [projectId, setProjectId] = useState(fixedProject?.project.id || ""),
    [filter, setFilter] = useState("All"),
    [search, setSearch] = useState(""),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [draft, setDraft] = useState<{
      title: string;
      type: string;
      content: string;
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  const template = templateCatalog.find((t) => t.id === templateId)!;
  const project =
    fixedProject || projects.find((p) => p.project.id === projectId);
  const list = templateCatalog.filter(
    (t) =>
      (filter === "All" || t.category === filter) &&
      (t.name + " " + t.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const change = (fn: () => void) => {
    if (
      draft &&
      !saved &&
      !confirm(
        "Replace the unsaved preview? Download or save it first if you need to keep it.",
      )
    )
      return;
    fn();
    setDraft(null);
    setSaved(false);
    setError("");
  };
  const context: TemplateContext = project
    ? {
        project: project.project,
        tasks: project.tasks,
        budget: project.budget_items,
        expenses: project.expenses,
        risks: project.risks,
        updates: project.updates,
        finance: project.finance,
      }
    : {};
  const input = (key: string, label: string, type = "text", hint?: string) => (
    <label key={key}>
      {label}
      {type === "textarea" ? (
        <textarea
          value={answers[key] || ""}
          onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
          maxLength={4000}
          placeholder={hint}
        />
      ) : (
        <input
          type={type}
          value={answers[key] || ""}
          onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
          maxLength={200}
        />
      )}
    </label>
  );
  const download = (format: "txt" | "html") => {
    if (!draft) return;
    const escape = (s: string) =>
      s.replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]!,
      );
    const text =
      format === "txt"
        ? draft.content
        : `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escape(draft.title)}</title><style>body{font:15px/1.8 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#19343d}pre{font:inherit;white-space:pre-wrap}</style><h1>${escape(draft.title)}</h1><pre>${escape(draft.content)}</pre></html>`;
    const url = URL.createObjectURL(
      new Blob([text], {
        type:
          format === "txt"
            ? "text/plain;charset=utf-8"
            : "text/html;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}-template.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return (
    <div className="template-centre">
      <div className="page-heading">
        <div>
          <div className="eyebrow">FROM A BLANK PAGE TO A CLEAR START</div>
          <h1>Project management templates</h1>
          <p>
            Choose a template, add context, then generate an editable draft. No
            AI key needed.
          </p>
        </div>
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <div className="template-layout">
        <section className="panel template-library">
          <div className="panel-head">
            <h2>Template library · {templateCatalog.length}</h2>
          </div>
          <div className="template-filters">
            <input
              aria-label="Search templates"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Template category"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "All",
                "Planning",
                "Delivery",
                "Finance & controls",
                "Reporting",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="template-options">
            {list.length ? (
              list.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={t.id === templateId}
                  className={t.id === templateId ? "selected" : ""}
                  onClick={() =>
                    change(() => {
                      setTemplateId(t.id);
                      setAnswers({});
                    })
                  }
                >
                  <FileText size={18} />
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.description}</small>
                  </span>
                  <ArrowRight size={14} />
                </button>
              ))
            ) : (
              <p className="muted">
                No matching templates. Try another search.
              </p>
            )}
          </div>
        </section>
        <section className="panel template-builder">
          <div className="panel-head">
            <div>
              <h2>{template.name}</h2>
              <p>
                {template.category} · {template.sections.length} structured
                sections
              </p>
            </div>
          </div>
          <form
            className="template-form"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const period =
                  answers.periodStart || answers.periodEnd
                    ? `${answers.periodStart || "[Start]"} to ${answers.periodEnd || "[End]"}`
                    : answers.period;
                setDraft(
                  generateManagementTemplate(templateId, context, {
                    ...answers,
                    period,
                  }),
                );
                setSaved(false);
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            {fixedProject ? (
              <p className="muted">
                Using records from <strong>{fixedProject.project.title}</strong>
                .
              </p>
            ) : (
              <label>
                Populate from project (optional)
                <select
                  value={projectId}
                  onChange={(e) => change(() => setProjectId(e.target.value))}
                >
                  <option value="">Blank template — no project records</option>
                  {projects.map((p) => (
                    <option key={p.project.id} value={p.project.id}>
                      {p.project.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {!project && input("projectName", "Project name (optional)")}
            <div className="form-grid">
              {input("author", "Prepared by")}
              {input("recipient", "Prepared for")}
              {input("periodStart", "Reporting / planning start", "date")}
              {input("periodEnd", "Reporting / planning end", "date")}
            </div>
            {template.fields.map((f) =>
              input(f.key, f.label, "textarea", f.hint),
            )}
            <div className="template-section-list">
              <strong>Your draft includes</strong>
              <p>{template.sections.map((s) => s.heading).join(" · ")}</p>
            </div>
            <small>
              Recorded data is copied, not verified. Unknown details stay in
              brackets. Reporting dates filter progress updates; task and
              financial records are current cumulative data.
            </small>
            <button className="button primary">
              <FileText size={16} /> Generate template
            </button>
          </form>
        </section>
      </div>
      {draft && (
        <section className="panel template-preview">
          <div className="panel-head">
            <div>
              <h2>Edit your generated template</h2>
              <p>Review and complete the bracketed sections before sharing.</p>
            </div>
            {saved && <span className="badge">Saved to project documents</span>}
          </div>
          <div className="template-form">
            <label>
              Generated document title
              <input
                value={draft.title}
                maxLength={200}
                onChange={(e) => {
                  setDraft({ ...draft, title: e.target.value });
                  setSaved(false);
                }}
              />
            </label>
            <label>
              Editable template content
              <textarea
                rows={22}
                value={draft.content}
                maxLength={30000}
                onChange={(e) => {
                  setDraft({ ...draft, content: e.target.value });
                  setSaved(false);
                }}
              />
            </label>
            <div className="button-group">
              <button
                className="button primary"
                disabled={
                  !project ||
                  project.permissions?.canEdit === false ||
                  busy ||
                  saved ||
                  !draft.title.trim()
                }
                onClick={async () => {
                  if (!project) return;
                  setBusy(true);
                  try {
                    await api(
                      `/projects/${project.project.id}/documents`,
                      "POST",
                      draft,
                    );
                    setSaved(true);
                    setError("");
                    await onSaved(project.project.id);
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? (
                  <LoaderCircle size={16} className="spin" />
                ) : (
                  <Check size={16} />
                )}{" "}
                Save to project documents
              </button>
              <button
                className="button secondary"
                onClick={() => download("html")}
              >
                <Download size={16} /> Download HTML
              </button>
              <button
                className="button secondary"
                onClick={() => download("txt")}
              >
                Download text
              </button>
            </div>
            <p className="muted">
              {project ? (
                "After saving, open the project’s Documents tab for PDF and Word exports."
              ) : (
                <>
                  Download the blank template now, or{" "}
                  <button className="text-link" onClick={onCreateProject}>
                    create a project
                  </button>{" "}
                  to save documents to your workspace.
                </>
              )}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
