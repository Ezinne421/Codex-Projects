import "./knowledge.css";
import LearningHub, { type LearningSection } from "./LearningHub";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Search,
  Download,
  ArrowRight,
  X,
  ExternalLink,
} from "lucide-react";
import {
  knowledgeTerms,
  knowledgeStats,
  knowledgeTopics,
  knowledgeSources,
  knowledgeEdition,
  type KnowledgeTerm,
} from "../shared/knowledge/catalog";
import { searchKnowledge, knowledgeCsv } from "../shared/knowledge/search";
const alphabet = ["All", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const perPage = 24;
function readSaved(key: string): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved)
      ? saved.filter(
          (id: unknown) =>
            typeof id === "string" && knowledgeTerms.some((t) => t.id === id),
        )
      : [];
  } catch {
    return [];
  }
}
export default function KnowledgeCentre({
  storageKey = "pma-knowledge-saved-public",
}: {
  storageKey?: string;
}) {
  const [section, setSection] = useState<LearningSection | "glossary">("learn");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [letter, setLetter] = useState("All"),
    [favouritesOnly, setFavouritesOnly] = useState(false),
    [practicalOnly, setPracticalOnly] = useState(false),
    [comparisonsOnly, setComparisonsOnly] = useState(false),
    [limit, setLimit] = useState(perPage),
    [saved, setSaved] = useState<string[]>(() => readSaved(storageKey)),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null),
    dialogTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => setSaved(readSaved(storageKey)), [storageKey]);
  useEffect(
    () => setLimit(perPage),
    [query, category, letter, favouritesOnly, practicalOnly, comparisonsOnly],
  );
  const results = useMemo(
    () =>
      searchKnowledge({
        query,
        category,
        letter,
        favouritesOnly,
        practicalOnly,
        comparisonsOnly,
        savedIds: saved,
      }),
    [
      query,
      category,
      letter,
      favouritesOnly,
      saved,
      practicalOnly,
      comparisonsOnly,
    ],
  );
  const selected = knowledgeTerms.find((t) => t.id === selectedId);
  useEffect(() => {
    if (selected) {
      if (!dialog.current?.open) dialog.current?.showModal();
      dialogTitle.current?.focus();
    } else if (dialog.current?.open) dialog.current.close();
  }, [selectedId]);
  function bookmark(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setNotice("");
    } catch {
      setNotice(
        "This browser could not save your terms. Browser storage may be disabled or full.",
      );
    }
  }
  function reset() {
    setQuery("");
    setCategory("All");
    setLetter("All");
    setFavouritesOnly(false);
    setPracticalOnly(false);
    setComparisonsOnly(false);
    setLimit(perPage);
  }
  function exportCsv() {
    const url = URL.createObjectURL(
      new Blob([knowledgeCsv(results)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-operations-glossary.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  const categoryName = (id: string) =>
    knowledgeTopics.find((t) => t.id === id)?.name || id;
  const saveButton = (t: KnowledgeTerm) => (
    <button
      type="button"
      className={`knowledge-save ${saved.includes(t.id) ? "saved" : ""}`}
      aria-label={`${saved.includes(t.id) ? "Unsave" : "Save"} ${t.name}`}
      aria-pressed={saved.includes(t.id)}
      onClick={() => bookmark(t.id)}
    >
      <Bookmark
        size={17}
        fill={saved.includes(t.id) ? "currentColor" : "none"}
      />
    </button>
  );
  return (
    <section className="knowledge-centre">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            A LITTLE KNOWLEDGE. A CLEARER WAY FORWARD.
          </span>
          <h1>Knowledge Centre</h1>
          <p>
            Learn, practise and refresh your project and operations management
            skills.
          </p>
        </div>
        {section === "glossary" && (
          <button
            className="button secondary"
            onClick={exportCsv}
            disabled={!results.length}
          >
            <Download size={16} /> Export glossary CSV
          </button>
        )}
      </div>
      <div className="knowledge-intro">
        <div className="knowledge-mark">
          <BookOpen size={28} />
        </div>
        <div>
          <h2>Your management reference, always within reach.</h2>
          <p>
            <strong>{knowledgeTerms.length} definitions</strong> across{" "}
            <strong>{knowledgeTopics.length} topics</strong> — from project
            charters and critical paths to inventory, maintenance and service
            operations — plus practical lessons, learning paths and worked
            exercises.
          </p>
          <small>
            Original summaries of common practice. Terminology varies by context
            and framework. Formula assumptions are provided; metric definitions
            do not imply that every metric is implemented in this app.
          </small>
        </div>
      </div>
      <p className="knowledge-depth-note">
        {knowledgeStats.practical} entries with examples, practical applications
        and common mistakes · {knowledgeStats.comparisons} concept comparisons.
        Use the Glossary depth filters to find them.
      </p>
      <nav
        className="knowledge-sections"
        aria-label="Knowledge Centre sections"
      >
        {[
          ["learn", "Learn & refresh"],
          ["glossary", "Glossary"],
          ["tools", "Practice lab"],
          ["updates", "Current guidance"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={section === id}
            className={section === id ? "active" : ""}
            onClick={() => setSection(id as typeof section)}
          >
            {label}
          </button>
        ))}
      </nav>
      {section !== "glossary" ? (
        <LearningHub
          section={section}
          storageKey={storageKey}
          terms={knowledgeTerms}
          onOpenTerm={setSelectedId}
          onSectionChange={setSection}
        />
      ) : (
        <>
          {notice && (
            <div className="alert" role="status">
              {notice}
            </div>
          )}
          <div className="panel knowledge-controls">
            <label className="knowledge-search">
              <Search size={20} />
              <span className="sr-only">Search definitions</span>
              <input
                aria-label="Search definitions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a term, acronym or concept — e.g. CPI, procurement, lead time…"
              />
            </label>
            <div className="knowledge-filter-row">
              <label>
                Topic
                <select
                  aria-label="Knowledge topic"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLetter("All");
                  }}
                >
                  <option value="All">
                    All topics ({knowledgeTerms.length})
                  </option>
                  {knowledgeTopics.map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.name} (
                      {knowledgeTerms.filter((k) => k.category === t.id).length}
                      )
                    </option>
                  ))}
                </select>
              </label>
              <div
                className="knowledge-switch"
                aria-label="Choose glossary view"
              >
                <button
                  type="button"
                  aria-pressed={!favouritesOnly}
                  className={!favouritesOnly ? "active" : ""}
                  onClick={() => setFavouritesOnly(false)}
                >
                  All terms
                </button>
                <button
                  type="button"
                  aria-pressed={favouritesOnly}
                  className={favouritesOnly ? "active" : ""}
                  onClick={() => setFavouritesOnly(true)}
                >
                  <Bookmark size={13} /> Saved ({saved.length})
                </button>
              </div>
              <button className="text-link" onClick={reset}>
                Clear filters
              </button>
            </div>
            <div className="knowledge-depth-filters">
              <label>
                <input
                  type="checkbox"
                  checked={practicalOnly}
                  onChange={(e) => setPracticalOnly(e.target.checked)}
                />
                With examples & applications
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={comparisonsOnly}
                  onChange={(e) => setComparisonsOnly(e.target.checked)}
                />
                With comparisons
              </label>
            </div>
            <div
              className="knowledge-alphabet"
              role="group"
              aria-label="Filter terms by first letter"
            >
              {alphabet.map((l) => (
                <button
                  type="button"
                  key={l}
                  aria-label={
                    l === "All"
                      ? "All first letters"
                      : l === "#"
                        ? "Terms starting with a number"
                        : `Terms starting with ${l}`
                  }
                  aria-pressed={letter === l}
                  className={letter === l ? "active" : ""}
                  onClick={() => setLetter(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="knowledge-results-heading">
            <p role="status">
              {results.length}{" "}
              {results.length === 1 ? "definition" : "definitions"} found
              {category !== "All" ? ` in ${categoryName(category)}` : ""}
            </p>
            <small>
              Saved terms stay in this browser. Edition {knowledgeEdition}.
            </small>
          </div>
          {results.length ? (
            <>
              <div className="knowledge-grid">
                {results.slice(0, limit).map((t) => (
                  <article className="knowledge-card" key={t.id}>
                    <div className="knowledge-card-top">
                      <span>{categoryName(t.category)}</span>
                      {saveButton(t)}
                    </div>
                    <h2>
                      <button onClick={() => setSelectedId(t.id)}>
                        {t.name}
                      </button>
                    </h2>
                    {t.aliases.length > 0 && (
                      <div className="knowledge-aliases">
                        {t.aliases.map((alias) => (
                          <span key={alias}>{alias}</span>
                        ))}
                      </div>
                    )}
                    <p>{t.definition}</p>
                    <button
                      className="text-link"
                      onClick={() => setSelectedId(t.id)}
                    >
                      Explore definition{" "}
                      {t.formula && (
                        <span className="knowledge-formula-badge">Formula</span>
                      )}
                      <ArrowRight size={14} />
                    </button>
                  </article>
                ))}
              </div>
              {results.length > limit && (
                <div className="knowledge-load">
                  <p>
                    Showing {Math.min(limit, results.length)} of{" "}
                    {results.length} definitions
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => setLimit((n) => n + perPage)}
                  >
                    Show more definitions
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="panel empty">
              <BookOpen size={28} />
              <h3>
                {favouritesOnly && !saved.length
                  ? "Build your own reference list"
                  : "No matching definitions"}
              </h3>
              <p>
                {favouritesOnly && !saved.length
                  ? "Save any term using its bookmark button, then find it here."
                  : "Try a broader search, another topic or a different first letter."}
              </p>
              <button className="button secondary" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
          <div className="knowledge-editorial">
            <strong>How to use this reference</strong>
            <p>
              These definitions support learning and discussion. Use the
              definition required by your organisation, contract or professional
              framework when making formal decisions. Examples are illustrative,
              not verified project records. Linked organisations provide further
              reading; they have not endorsed this app.
            </p>
            <details>
              <summary>Sources & further reading</summary>
              <div className="knowledge-source-list">
                {Object.values(knowledgeSources).map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.name}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </details>
          </div>
        </>
      )}
      <dialog
        ref={dialog}
        className="knowledge-dialog"
        aria-labelledby="knowledge-detail-title"
        onCancel={(e) => {
          e.preventDefault();
          setSelectedId(null);
        }}
      >
        {selected && (
          <>
            <div className="knowledge-dialog-header">
              <div>
                <span className="eyebrow">
                  {categoryName(selected.category)}
                </span>
                <h2 id="knowledge-detail-title" ref={dialogTitle} tabIndex={-1}>
                  {selected.name}
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close definition"
                onClick={() => setSelectedId(null)}
              >
                <X size={21} />
              </button>
            </div>
            <div className="knowledge-dialog-content">
              {selected.aliases.length > 0 && (
                <p className="knowledge-detail-aliases">
                  <strong>Also called / abbreviated:</strong>{" "}
                  {selected.aliases.join(" · ")}
                </p>
              )}
              <p className="knowledge-definition">{selected.definition}</p>
              {selected.practicalUse && (
                <section className="knowledge-application">
                  <h3>Apply in practice</h3>
                  <p>{selected.practicalUse}</p>
                </section>
              )}
              {selected.pitfall && (
                <section className="knowledge-pitfall">
                  <h3>Common mistake</h3>
                  <p>{selected.pitfall}</p>
                </section>
              )}
              {!!selected.comparisons?.length && (
                <section className="knowledge-comparisons">
                  <h3>Compare related concepts</h3>
                  {selected.comparisons.map((c) => {
                    const other = knowledgeTerms.find((t) => t.id === c.termId);
                    return other ? (
                      <article key={c.termId}>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => setSelectedId(c.termId)}
                        >
                          {other.name}
                          <ArrowRight size={14} />
                        </button>
                        <p>{c.distinction}</p>
                      </article>
                    ) : null;
                  })}
                </section>
              )}

              {selected.formula && (
                <section className="knowledge-formula">
                  <h3>Formula</h3>
                  <p>{selected.formula}</p>
                  {selected.assumptions && (
                    <>
                      <h4>Conditions & interpretation</h4>
                      <p>{selected.assumptions}</p>
                    </>
                  )}
                </section>
              )}
              {selected.example && (
                <section className="knowledge-example">
                  <h3>Illustrative example</h3>
                  <p>{selected.example.replace(/^Illustrative: /, "")}</p>
                </section>
              )}
              <div className="knowledge-related">
                <h3>Related terms</h3>
                <div>
                  {selected.related.map((id) => {
                    const term = knowledgeTerms.find((t) => t.id === id);
                    return term ? (
                      <button
                        key={id}
                        className="button secondary small"
                        onClick={() => setSelectedId(id)}
                      >
                        {term.name}
                        <ArrowRight size={12} />
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="knowledge-detail-sources">
                <h3>Further reading</h3>
                {selected.sources.map((id) => {
                  const source =
                    knowledgeSources[id as keyof typeof knowledgeSources];
                  return source ? (
                    <a
                      key={id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.name}
                      <ExternalLink size={12} />
                    </a>
                  ) : null;
                })}
                {selected.reviewed && (
                  <small>Summary reviewed {selected.reviewed}.</small>
                )}
                <small>
                  Original plain-language summary; the links are references for
                  further study, not attributed quotations.
                </small>
              </div>
              <button
                className="button secondary"
                aria-pressed={saved.includes(selected.id)}
                onClick={() => bookmark(selected.id)}
              >
                <Bookmark size={15} />
                {saved.includes(selected.id)
                  ? "Remove from saved terms"
                  : "Save this term"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
