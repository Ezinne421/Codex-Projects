import { api } from "./api";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  learningLessons,
  learningPaths,
  currentGuidance,
  learningReviewed,
  lessonResources,
  type LearningLesson,
} from "../shared/knowledge/learning";
import {
  readLearningProgress,
  recordPractice,
  dueLessons,
  localStudyDay,
  practiceTools,
  calculatePractice,
  type LearningProgress,
  type PracticeTool,
} from "../shared/knowledge/practice";
export type LearningSection = "learn" | "tools" | "updates";
type Props = {
  section: LearningSection;
  serverSync?: boolean;
  onApplyLearning?: (lessonId: string) => void;
  storageKey: string;
  terms: { id: string; name: string }[];
  onOpenTerm: (id: string) => void;
  onSectionChange: (section: LearningSection) => void;
};
function loadProgress(key: string) {
  try {
    return readLearningProgress(localStorage.getItem(key));
  } catch {
    return {};
  }
}
const dateLabel = (day: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(day + "T12:00:00Z"));
function LessonQuiz({
  lesson,
  progress,
  onGrade,
  accountSynced = false,
}: {
  lesson: LearningLesson;
  progress?: LearningProgress[string];
  onGrade: (score: number) => void;
  accountSynced?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({}),
    [graded, setGraded] = useState(false);
  const score = lesson.questions.filter(
    (q, i) => answers[i] === q.answer,
  ).length;
  return (
    <section className="learning-quiz" aria-labelledby="practice-heading">
      <h3 id="practice-heading">Check your understanding</h3>
      <p>
        Answer every question, then review the reasoning. These are original
        practice questions, not official exam questions.
      </p>
      {lesson.questions.map((q, i) => (
        <fieldset key={i}>
          <legend>
            {i + 1}. {q.prompt}
          </legend>
          {q.options.map((option, j) => (
            <label
              key={j}
              className={graded && j === q.answer ? "correct" : ""}
            >
              <input
                type="radio"
                name={`${lesson.id}-${i}`}
                value={j}
                checked={answers[i] === j}
                disabled={graded}
                onChange={() => setAnswers((a) => ({ ...a, [i]: j }))}
              />
              {option}
            </label>
          ))}
          {graded && (
            <p className="learning-feedback">
              <strong>
                {answers[i] === q.answer ? "Correct." : "Review this. "}
              </strong>{" "}
              {q.explanation}
            </p>
          )}
        </fieldset>
      ))}
      {graded ? (
        <div className="learning-score" role="status">
          <strong>
            {score}/{lesson.questions.length} correct —{" "}
            {score === lesson.questions.length
              ? "practice passed"
              : "revisit the explanations and try again"}
            .
          </strong>
          <p>
            {progress
              ? `Next review: ${dateLabel(progress.due)}. ${accountSynced ? "Account sync status is shown above." : "Progress is saved only in this browser."}`
              : "Your result could not be saved in this browser."}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setAnswers({});
              setGraded(false);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <button
          className="button primary"
          disabled={Object.keys(answers).length !== lesson.questions.length}
          onClick={() => {
            onGrade(score);
            setGraded(true);
          }}
        >
          Check answers
        </button>
      )}
    </section>
  );
}
function PracticeLab() {
  const [tool, setTool] = useState<PracticeTool>("evm"),
    [inputs, setInputs] = useState<Record<string, string>>(() =>
      Object.fromEntries(practiceTools[0].fields.map(([k, , v]) => [k, v])),
    ),
    [ran, setRan] = useState(false);
  const definition = practiceTools.find((t) => t.id === tool)!;
  const outcome = ran ? calculatePractice(tool, inputs) : null;
  return (
    <section className="learning-lab">
      <div className="learning-section-heading">
        <h2>Practice lab</h2>
        <p>
          Use illustrative inputs to build confidence with management
          calculations. These exercises do not read or change project records.
        </p>
      </div>
      <div
        className="learning-tool-picker"
        role="group"
        aria-label="Choose a calculation"
      >
        {practiceTools.map((t) => (
          <button
            className={`button ${tool === t.id ? "primary" : "secondary"}`}
            aria-pressed={tool === t.id}
            key={t.id}
            onClick={() => {
              setTool(t.id);
              setInputs(Object.fromEntries(t.fields.map(([k, , v]) => [k, v])));
              setRan(false);
            }}
          >
            {t.title}
          </button>
        ))}
      </div>
      <form
        className="panel learning-tool"
        onSubmit={(e) => {
          e.preventDefault();
          setRan(true);
        }}
      >
        <h3>{definition.title}</h3>
        <div className="learning-tool-fields">
          {definition.fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                min="0"
                step="any"
                required
                value={inputs[key] ?? ""}
                onChange={(e) => {
                  setInputs((s) => ({ ...s, [key]: e.target.value }));
                  setRan(false);
                }}
              />
            </label>
          ))}
        </div>
        <p className="learning-assumption">{definition.assumption}</p>
        <button type="submit" className="button primary">
          Calculate example
        </button>
        {outcome?.error && (
          <p className="learning-feedback" role="alert">
            {outcome.error}
          </p>
        )}
        {outcome && !outcome.error && (
          <div className="learning-calculation" aria-live="polite">
            <h3>Worked result</h3>
            <dl>
              {outcome.results.map(([label, value, unit]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {value.toLocaleString("en-GB", {
                      maximumFractionDigits: 4,
                    })}{" "}
                    <small>{unit}</small>
                  </dd>
                </div>
              ))}
            </dl>
            {tool === "evm" && Number(inputs.ev) === 0 && (
              <p>
                EAC is not calculated when EV is zero because CPI would be zero.
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
export default function LearningHub({
  section,
  storageKey,
  terms,
  onOpenTerm,
  onSectionChange,
  serverSync = false,
  onApplyLearning,
}: Props) {
  const key = storageKey + "-learning-v1";
  type Attempt = {
    lessonId: string;
    correct: number;
    total: number;
    day: string;
  };
  const pending = useRef<Attempt[]>([]),
    syncing = useRef(false),
    loadedAccount = useRef(false);
  const [syncNotice, setSyncNotice] = useState("");
  async function syncProgress() {
    if (!serverSync || syncing.current) return;
    syncing.current = true;
    try {
      let remote = await api("/learning");
      if (storageKey !== "pma-knowledge-saved-" + remote.userId)
        throw new Error("Account changed.");
      if (!loadedAccount.current) {
        let cached: Attempt[] = [];
        try {
          const raw = JSON.parse(
            localStorage.getItem(key + "-pending") || "[]",
          );
          if (Array.isArray(raw))
            cached = raw.filter(
              (a: any) =>
                a &&
                learningLessons.some((l) => l.id === a.lessonId) &&
                typeof a.day === "string" &&
                Number.isInteger(a.correct) &&
                Number.isInteger(a.total),
            );
        } catch {}
        pending.current = [
          ...new Map(
            [...cached, ...pending.current].map((a) => [
              `${a.lessonId}:${a.day}:${a.correct}:${a.total}`,
              a,
            ]),
          ).values(),
        ];
        if (!remote.version && !pending.current.length) {
          const local = loadProgress(key);
          pending.current = Object.entries(local)
            .map(([lessonId, p]) => ({
              lessonId,
              correct: p.correct,
              total: p.total,
              day: p.lastReviewed,
            }))
            .sort((a, b) => a.day.localeCompare(b.day));
        }
        loadedAccount.current = true;
      }
      while (pending.current.length) {
        const attempt = pending.current[0],
          stored = remote.progress[attempt.lessonId];
        if (stored?.lastReviewed > attempt.day) {
          pending.current.shift();
          continue;
        }
        try {
          remote = await api("/learning/" + attempt.lessonId, "PUT", {
            correct: attempt.correct,
            total: attempt.total,
            day: attempt.day,
            version: remote.version,
            expected_user_id: remote.userId,
          });
          pending.current.shift();
        } catch (e) {
          if ((e as Error).message.includes("changed")) {
            remote = await api("/learning");
            continue;
          }
          throw e;
        }
        try {
          localStorage.setItem(
            key + "-pending",
            JSON.stringify(pending.current),
          );
        } catch {}
      }
      setProgress(remote.progress);
      try {
        localStorage.setItem(key, JSON.stringify(remote.progress));
        localStorage.removeItem(key + "-pending");
      } catch {}
      setSyncNotice("Learning progress is saved to your account.");
    } catch {
      setSyncNotice(
        "Account sync is pending. Keep this device copy and retry when connected.",
      );
    } finally {
      syncing.current = false;
    }
  }
  useEffect(() => {
    loadedAccount.current = false;
    pending.current = [];
    syncProgress();
    const online = () => syncProgress();
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [key, serverSync]);

  const [progress, setProgress] = useState<LearningProgress>(() =>
      loadProgress(key),
    ),
    [notice, setNotice] = useState(""),
    [lessonId, setLessonId] = useState(""),
    [path, setPath] = useState("all"),
    [query, setQuery] = useState(""),
    [level, setLevel] = useState("All"),
    [reviewOnly, setReviewOnly] = useState(false);
  useEffect(() => {
    setProgress(loadProgress(key));
    setLessonId("");
    setNotice("");
  }, [key]);
  const today = localStudyDay(),
    due = dueLessons(progress, today),
    passed = learningLessons.filter((l) => progress[l.id]?.passed).length;
  const selected = learningLessons.find((l) => l.id === lessonId),
    chosenPath = learningPaths.find((p) => p.id === path);
  const matching = useMemo(
    () =>
      learningLessons
        .filter(
          (l) =>
            (!chosenPath ||
              (chosenPath.lessons as readonly string[]).includes(l.id)) &&
            (level === "All" || l.level === level) &&
            (!reviewOnly || due.some((d) => d.id === l.id)) &&
            `${l.title} ${l.area} ${l.objective} ${l.explanation}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          chosenPath
            ? (chosenPath.lessons as readonly string[]).indexOf(a.id) -
              (chosenPath.lessons as readonly string[]).indexOf(b.id)
            : 0,
        ),
    [path, query, level, reviewOnly, progress, today],
  );
  function save(
    next: LearningProgress,
    attempt?: { lessonId: string; correct: number; total: number; day: string },
  ) {
    if (serverSync && attempt) {
      pending.current.push(attempt);
      try {
        localStorage.setItem(key + "-pending", JSON.stringify(pending.current));
      } catch {}
      setSyncNotice("Saved on this device; syncing to your account…");
    }
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setProgress(next);
      setNotice("");
    } catch {
      setProgress(next);
      setNotice(
        serverSync
          ? "Device storage is unavailable; checking account sync."
          : "Browser storage is unavailable. You can still study, but this result has not been saved.",
      );
    }
    if (serverSync && attempt) syncProgress();
  }
  const openLesson = (id: string) => {
    setLessonId(id);
    setTimeout(
      () => document.getElementById("learning-lesson-title")?.focus(),
      0,
    );
  };
  if (section === "tools") return <PracticeLab />;
  if (section === "updates") {
    const age = Math.floor(
      (Date.parse(today + "T12:00:00Z") -
        Date.parse(learningReviewed + "T12:00:00Z")) /
        86400000,
    );
    return (
      <section>
        <div className="learning-section-heading">
          <h2>Current guidance & skills radar</h2>
          <p>
            Official reference pages checked {dateLabel(learningReviewed)}. This
            is a curated snapshot, not a live news feed; verify the linked
            source before relying on a change.
          </p>
        </div>
        {age > 90 && (
          <p className="learning-feedback" role="status">
            This snapshot is over 90 days old. Check official sources for later
            editions, deadlines and requirements.
          </p>
        )}
        <div className="learning-radar">
          {currentGuidance.map((item) => (
            <article className="panel" key={item.id}>
              <span className="learning-tag">{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="learning-action">
                <strong>What to refresh</strong>
                <p>{item.action}</p>
              </div>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Check official source · {item.source} ↗
              </a>
              <small>Source checked {dateLabel(learningReviewed)}</small>
              <div className="learning-related">
                {item.lessons.map((id) => (
                  <button
                    className="button secondary"
                    key={id}
                    onClick={() => {
                      setPath("all");
                      onSectionChange("learn");
                      openLesson(id);
                    }}
                  >
                    {learningLessons.find((l) => l.id === id)?.title}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="learning-footnote">
          Independent learning material. No affiliation, endorsement,
          certification, PDUs or training-hour credit is implied. Source links
          may require membership or internet access.
        </p>
      </section>
    );
  }
  return (
    <section className="learning-hub">
      {serverSync && (
        <p className="learning-sync-status" role="status">
          <span>{syncNotice || "Loading account progress…"}</span>{" "}
          <button className="text-link" onClick={syncProgress}>
            Sync now
          </button>
        </p>
      )}
      {notice && (
        <p className="learning-feedback" role="alert">
          {notice}
        </p>
      )}
      <div className="learning-progress">
        <div>
          <span className="eyebrow">BUILD CONFIDENCE THROUGH PRACTICE</span>
          <h2>Your skills refresh</h2>
          <p>
            {learningLessons.length} lessons · {learningPaths.length} learning
            paths ·{" "}
            {learningLessons.reduce((n, l) => n + l.questions.length, 0)}{" "}
            scenario questions
          </p>
        </div>
        <div>
          <strong>
            {passed}/{learningLessons.length}
          </strong>
          <span>lessons currently passed</span>
          <progress
            value={passed}
            max={learningLessons.length}
            aria-label="Lessons passed"
          />
        </div>
      </div>
      <div className="learning-review">
        <div>
          <strong>
            {due.length
              ? `${due.length} ${due.length === 1 ? "lesson is" : "lessons are"} due for review`
              : "Keep knowledge active, a little at a time"}
          </strong>
          <p>
            Pass a lesson, apply one idea and review again after 1, 3, 7, 14 and
            30 days. Retakes on the same day do not accelerate the interval.{" "}
            {serverSync
              ? "Progress syncs to your account when connected."
              : "Progress stays in this browser."}
          </p>
        </div>
        {due.length > 0 && (
          <button
            className="button secondary"
            onClick={() => {
              setLessonId("");
              setReviewOnly(true);
              setPath("all");
              setLevel("All");
              setQuery("");
            }}
          >
            Review due lessons
          </button>
        )}
      </div>
      {selected ? (
        <article className="panel learning-lesson">
          <button className="text-link" onClick={() => setLessonId("")}>
            ← Back to learning paths
          </button>
          <div className="learning-lesson-heading">
            <span className="learning-tag">
              {selected.area} · {selected.level} · about {selected.minutes} min
            </span>
            <h2 id="learning-lesson-title" tabIndex={-1}>
              {selected.title}
            </h2>
            <p>
              <strong>Learning goal:</strong> {selected.objective}
            </p>
          </div>
          <section>
            <h3>Understand the idea</h3>
            <p>{selected.explanation}</p>
          </section>
          <section>
            <h3>Put it into practice</h3>
            <ol>
              {selected.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
          <section className="learning-case">
            <h3>Worked decision</h3>
            <p>{selected.scenario.context}</p>
            <p>
              <strong>Recommended response:</strong>{" "}
              {selected.scenario.decision}
            </p>
            <p>
              <strong>Why:</strong> {selected.scenario.reason}
            </p>
          </section>
          <section>
            <h3>Common mistake</h3>
            <p>{selected.pitfall}</p>
          </section>
          <section className="learning-action">
            <h3>Apply it to your work</h3>
            <p>{selected.apply}</p>
          </section>
          <div className="learning-related">
            <h3>Refresh related definitions</h3>
            {selected.terms.map((id) => {
              const term = terms.find((t) => t.id === id);
              return term ? (
                <button
                  className="button secondary"
                  key={id}
                  onClick={() => onOpenTerm(id)}
                >
                  {term.name} ↗
                </button>
              ) : null;
            })}
          </div>
          <section className="learning-lesson-sources">
            <h3>Further study</h3>
            {lessonResources(selected.id).map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.name} ↗
              </a>
            ))}
            <small>
              Original summary reviewed {dateLabel(learningReviewed)}.
              References support further study and do not imply endorsement.
            </small>
          </section>
          <LessonQuiz
            key={selected.id}
            accountSynced={serverSync}
            lesson={selected}
            progress={progress[selected.id]}
            onGrade={(score) =>
              save(
                recordPractice(
                  progress,
                  selected.id,
                  score,
                  selected.questions.length,
                  today,
                ),
                {
                  lessonId: selected.id,
                  correct: score,
                  total: selected.questions.length,
                  day: today,
                },
              )
            }
          />
          {progress[selected.id]?.passed && (
            <div className="learning-next">
              {onApplyLearning && (
                <button
                  className="button primary"
                  onClick={() => onApplyLearning(selected.id)}
                >
                  Apply this learning with a project template →
                </button>
              )}
              <p>Practice passed. Try the application task before moving on.</p>
              <button
                className="button secondary"
                onClick={() => {
                  const list = chosenPath
                    ? (chosenPath.lessons as readonly string[])
                    : learningLessons.map((l) => l.id);
                  const i = list.indexOf(selected.id);
                  openLesson(list[(i + 1) % list.length]);
                }}
              >
                Next lesson →
              </button>
            </div>
          )}
        </article>
      ) : (
        <>
          <div className="learning-section-heading">
            <h2>Choose a learning path</h2>
            <p>
              Work through a path in order, or search for a specific skill.
              Study in two short sessions each week: learn and apply first, then
              test recall and revisit due lessons.
            </p>
          </div>
          <div className="learning-paths">
            {learningPaths.map((p) => {
              const count = p.lessons.filter(
                (id) => progress[id]?.passed,
              ).length;
              return (
                <article
                  className={`panel ${path === p.id ? "selected" : ""}`}
                  key={p.id}
                >
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <small>
                    {p.lessons.length} lessons · about{" "}
                    {p.lessons.reduce(
                      (n, id) =>
                        n + learningLessons.find((l) => l.id === id)!.minutes,
                      0,
                    )}{" "}
                    min · {count} passed
                  </small>
                  <button
                    className="text-link"
                    onClick={() => {
                      setPath(p.id);
                      setReviewOnly(false);
                      setQuery("");
                      setLevel("All");
                      setTimeout(
                        () =>
                          document
                            .getElementById("learning-catalogue-title")
                            ?.focus(),
                        0,
                      );
                    }}
                  >
                    Explore this path →
                  </button>
                </article>
              );
            })}
          </div>
          <div className="learning-section-heading">
            <h2 id="learning-catalogue-title" tabIndex={-1}>
              {chosenPath
                ? chosenPath.title
                : reviewOnly
                  ? "Due for review"
                  : "Browse practical lessons"}
            </h2>
            {chosenPath && (
              <p>
                Follow these lessons in order. Complete each practice check and
                revisit the topic when its next review is due.
              </p>
            )}
          </div>
          <div className="panel learning-filters">
            <label>
              Search skills
              <input
                aria-label="Search learning lessons"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try AI, procurement, negotiation, forecasting…"
              />
            </label>
            <label>
              Learning path
              <select value={path} onChange={(e) => setPath(e.target.value)}>
                <option value="all">All learning paths</option>
                {learningPaths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Level
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {["All", "Foundation", "Practitioner", "Advanced"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label className="learning-review-toggle">
              <input
                type="checkbox"
                checked={reviewOnly}
                onChange={(e) => setReviewOnly(e.target.checked)}
              />
              Due for review only
            </label>
            <button
              className="text-link"
              onClick={() => {
                setPath("all");
                setQuery("");
                setLevel("All");
                setReviewOnly(false);
              }}
            >
              Reset lesson filters
            </button>
          </div>
          <p className="learning-result-count" role="status">
            {matching.length} lessons found
          </p>
          <div className="learning-lessons">
            {matching.map((l) => (
              <article className="panel" key={l.id}>
                <span className="learning-tag">
                  {l.area} · {l.level}
                </span>
                <h3>{l.title}</h3>
                <p>{l.objective}</p>
                <small>
                  About {l.minutes} min{" "}
                  {progress[l.id]
                    ? `· ${progress[l.id].passed ? "Practice passed" : "Needs review"} · next review ${dateLabel(progress[l.id].due)}`
                    : ""}
                </small>
                <button className="text-link" onClick={() => openLesson(l.id)}>
                  Open lesson →
                </button>
              </article>
            ))}
          </div>
          {matching.length === 0 && (
            <p className="panel learning-empty">
              No lessons match these filters. Try a broader search, reset the
              filters or return when a review is due.
            </p>
          )}
        </>
      )}
      <p className="learning-footnote">
        Content reviewed {dateLabel(learningReviewed)}. Original educational
        summaries and illustrative examples. A practice pass reflects this short
        check, not professional certification or a validated measure of
        competence.
      </p>
    </section>
  );
}
