// The offline interface uses the same catalogue and search engine as the hosted app.
let knowledgeOpen = false;
let knowledgeSection = "learn";
function knowledgeSectionNavigation() {
  return `<p class="knowledge-depth-note">${PMKnowledge.knowledgeStats.practical} entries with examples, practical applications and common mistakes · ${PMKnowledge.knowledgeStats.comparisons} concept comparisons. Use the Glossary depth filters to find them.</p><nav class="knowledge-sections" aria-label="Knowledge Centre sections">${[
    ["learn", "Learn & refresh"],
    ["glossary", "Glossary"],
    ["tools", "Practice lab"],
    ["updates", "Current guidance"],
  ]
    .map(
      ([id, label]) =>
        `<button data-action="knowledge-section" data-id="${id}" class="${knowledgeSection === id ? "active" : ""}" aria-pressed="${knowledgeSection === id}">${label}</button>`,
    )
    .join("")}</nav>`;
}
function setOfflineLearningSection(section) {
  knowledgeSection = section;
  renderKnowledge();
}

const knowledgeKey = "pma-local-knowledge-saved";
let knowledgeFilters = {
    query: "",
    category: "All",
    letter: "All",
    favouritesOnly: false,
    practicalOnly: false,
    comparisonsOnly: false,
  },
  knowledgeLimit = 24,
  knowledgeSaved = [];
try {
  const saved = JSON.parse(localStorage.getItem(knowledgeKey) || "[]");
  if (Array.isArray(saved))
    knowledgeSaved = saved.filter((id) =>
      PMKnowledge.knowledgeTerms.some((t) => t.id === id),
    );
} catch {}
const knowledgeTopic = (id) =>
  PMKnowledge.knowledgeTopics.find((t) => t.id === id)?.name || id;
const knowledgeResults = () =>
  PMKnowledge.searchKnowledge({
    ...knowledgeFilters,
    savedIds: knowledgeSaved,
  });
function knowledgeSaveButton(t) {
  const saved = knowledgeSaved.includes(t.id);
  return `<button class="knowledge-save ${saved ? "saved" : ""}" aria-label="${saved ? "Unsave" : "Save"} ${escape(t.name)}" aria-pressed="${saved}" data-action="knowledge-save" data-id="${t.id}">${saved ? "★" : "☆"}</button>`;
}
function renderKnowledge() {
  const results = knowledgeResults();
  if (knowledgeSection !== "glossary") {
    if (document.getElementById("offline-learning-root")) {
      const replacement = document.createElement("div");
      replacement.innerHTML = knowledgeSectionNavigation();
      document
        .querySelector(".knowledge-sections")
        .replaceWith(replacement.querySelector("nav"));
      PMLearning.showSection(knowledgeSection);
      return;
    }
    PMLearning.unmount();
    $("app").innerHTML =
      `<button class="back" data-action="exit-knowledge">‹ Back to workspace</button><section class="knowledge-centre"><div class="page-heading"><div><div class="eyebrow">KEEP LEARNING. KEEP MOVING FORWARD.</div><h1>Knowledge Centre</h1><p>Build, practise and refresh your project and operations management skills.</p></div></div><div class="knowledge-intro"><div><h2>Your management reference, always within reach.</h2><p><strong>${PMKnowledge.knowledgeTerms.length} definitions</strong> across <strong>${PMKnowledge.knowledgeTopics.length} topics</strong>, plus practical lessons, learning paths and worked exercises.</p><small>Original learning summaries. Progress stays in this browser. External references require internet access.</small></div></div>${knowledgeSectionNavigation()}<div id="offline-learning-root"></div></section>`;
    PMLearning.mount($("offline-learning-root"), {
      section: knowledgeSection,
      storageKey: knowledgeKey,
      terms: PMKnowledge.knowledgeTerms,
      onOpenTerm: openKnowledgeTerm,
      onSectionChange: setOfflineLearningSection,
    });
    return;
  }
  PMLearning.unmount();
  $("app").innerHTML =
    `<button class="back" data-action="exit-knowledge">‹ Back to workspace</button><section class="knowledge-centre"><div class="page-heading"><div><div class="eyebrow">A LITTLE KNOWLEDGE. A CLEARER WAY FORWARD.</div><h1>Knowledge Centre</h1><p>Project and operations management, in plain language.</p></div>${button("knowledge-csv", "Export glossary CSV", results.length ? "" : "disabled")}</div><div class="knowledge-intro"><div><h2>Your management reference, always within reach.</h2><p><strong>${PMKnowledge.knowledgeTerms.length} definitions</strong> across <strong>${PMKnowledge.knowledgeTopics.length} topics</strong> — from project charters and critical paths to inventory, maintenance and service operations.</p><small>Original summaries of common practice. Terminology varies by context and framework. Formula assumptions are provided; metric definitions do not imply every metric is implemented in this app.</small></div></div>${knowledgeSectionNavigation()}<div class="panel knowledge-controls"><label class="knowledge-search"><input id="knowledge-search" aria-label="Search definitions" placeholder="Search a term, acronym or concept…" value="${escape(knowledgeFilters.query)}"></label><div class="knowledge-filter-row"><label>Topic<select id="knowledge-topic" aria-label="Knowledge topic"><option value="All">All topics (${PMKnowledge.knowledgeTerms.length})</option>${PMKnowledge.knowledgeTopics.map((t) => `<option value="${t.id}" ${knowledgeFilters.category === t.id ? "selected" : ""}>${escape(t.name)} (${PMKnowledge.knowledgeTerms.filter((k) => k.category === t.id).length})</option>`).join("")}</select></label><div class="knowledge-switch"><button data-action="knowledge-all" aria-pressed="${!knowledgeFilters.favouritesOnly}" class="${knowledgeFilters.favouritesOnly ? "" : "active"}">All terms</button><button data-action="knowledge-saved" aria-pressed="${knowledgeFilters.favouritesOnly}" class="${knowledgeFilters.favouritesOnly ? "active" : ""}">Saved (${knowledgeSaved.length})</button></div><button class="text-link" data-action="knowledge-clear">Clear filters</button></div><div class="knowledge-depth-filters"><label><input id="knowledge-practical" type="checkbox" ${knowledgeFilters.practicalOnly ? "checked" : ""}>With examples &amp; applications</label><label><input id="knowledge-comparisons" type="checkbox" ${knowledgeFilters.comparisonsOnly ? "checked" : ""}>With comparisons</label></div><div class="knowledge-alphabet" role="group" aria-label="Filter terms by first letter">${["All", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((l) => `<button data-action="knowledge-letter" data-id="${l}" aria-label="${l === "All" ? "All first letters" : l === "#" ? "Terms starting with a number" : "Terms starting with " + l}" aria-pressed="${l === knowledgeFilters.letter}" class="${l === knowledgeFilters.letter ? "active" : ""}">${l}</button>`).join("")}</div></div><div class="knowledge-results-heading"><p role="status">${results.length} ${results.length === 1 ? "definition" : "definitions"} found</p><small>Saved terms stay in this browser. Edition ${PMKnowledge.knowledgeEdition}.</small></div>${
      results.length
        ? `<div class="knowledge-grid">${results
            .slice(0, knowledgeLimit)
            .map(
              (t) =>
                `<article class="knowledge-card"><div class="knowledge-card-top"><span>${escape(knowledgeTopic(t.category))}</span>${knowledgeSaveButton(t)}</div><h2><button data-action="knowledge-detail" data-id="${t.id}">${escape(t.name)}</button></h2>${t.aliases.length ? `<div class="knowledge-aliases">${t.aliases.map((a) => `<span>${escape(a)}</span>`).join("")}</div>` : ""}<p>${escape(t.definition)}</p><button class="text-link" data-action="knowledge-detail" data-id="${t.id}">Explore definition ${t.formula ? '<span class="knowledge-formula-badge">Formula</span>' : ""} →</button></article>`,
            )
            .join(
              "",
            )}</div>${results.length > knowledgeLimit ? `<div class="knowledge-load"><p>Showing ${Math.min(knowledgeLimit, results.length)} of ${results.length} definitions</p>${button("knowledge-more", "Show more definitions")}</div>` : ""}`
        : `<div class="panel empty"><h3>${knowledgeFilters.favouritesOnly && !knowledgeSaved.length ? "Build your own reference list" : "No matching definitions"}</h3><p>Save terms using their bookmark button, or try a broader search and different filters.</p>${button("knowledge-clear", "Clear filters")}</div>`
    }<div class="knowledge-editorial"><strong>How to use this reference</strong><p>Use the definition required by your organisation, contract or professional framework when making formal decisions. Examples are illustrative, not verified project records. Linked organisations provide further reading; they have not endorsed this app. All definitions work offline; external references require internet access.</p><details><summary>Sources & further reading</summary><div class="knowledge-source-list">${Object.values(
      PMKnowledge.knowledgeSources,
    )
      .map(
        (s) =>
          `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)} ↗</a>`,
      )
      .join("")}</div></details></div></section>`;
}
function openKnowledgeTerm(id) {
  const t = PMKnowledge.knowledgeTerms.find((t) => t.id === id);
  if (!t) return;
  const modal = $("knowledge-dialog");
  modal.innerHTML = `<div class="knowledge-dialog-header"><div><div class="eyebrow">${escape(knowledgeTopic(t.category))}</div><h2 id="knowledge-detail-title" tabindex="-1">${escape(t.name)}</h2></div><button class="icon-button" aria-label="Close definition" data-action="knowledge-close">×</button></div><div class="knowledge-dialog-content">${t.aliases.length ? `<p class="knowledge-detail-aliases"><strong>Also called / abbreviated:</strong> ${escape(t.aliases.join(" · "))}</p>` : ""}<p class="knowledge-definition">${escape(t.definition)}</p>${t.practicalUse ? `<section class="knowledge-application"><h3>Apply in practice</h3><p>${escape(t.practicalUse)}</p></section>` : ""}${t.pitfall ? `<section class="knowledge-pitfall"><h3>Common mistake</h3><p>${escape(t.pitfall)}</p></section>` : ""}${
    t.comparisons?.length
      ? `<section class="knowledge-comparisons"><h3>Compare related concepts</h3>${t.comparisons
          .map((c) => {
            const other = PMKnowledge.knowledgeTerms.find(
              (x) => x.id === c.termId,
            );
            return other
              ? `<article><button class="text-link" data-action="knowledge-detail" data-id="${other.id}">${escape(other.name)} →</button><p>${escape(c.distinction)}</p></article>`
              : "";
          })
          .join("")}</section>`
      : ""
  }${t.formula ? `<section class="knowledge-formula"><h3>Formula</h3><p>${escape(t.formula)}</p><h4>Conditions & interpretation</h4><p>${escape(t.assumptions || "")}</p></section>` : ""}${t.example ? `<section class="knowledge-example"><h3>Illustrative example</h3><p>${escape(t.example.replace(/^Illustrative: /, ""))}</p></section>` : ""}<div class="knowledge-related"><h3>Related terms</h3><div>${t.related
    .map((id) => {
      const related = PMKnowledge.knowledgeTerms.find((x) => x.id === id);
      return related
        ? button(
            "knowledge-detail",
            escape(related.name) + " →",
            `data-id="${id}"`,
          )
        : "";
    })
    .join(
      "",
    )}</div></div><div class="knowledge-detail-sources"><h3>Further reading</h3>${t.sources
    .map((id) => {
      const s = PMKnowledge.knowledgeSources[id];
      return s
        ? `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)} ↗</a>`
        : "";
    })
    .join(
      "",
    )}${t.reviewed ? `<small>Summary reviewed ${escape(t.reviewed)}.</small>` : ""}<small>Original plain-language summary; the links are references for further study, not attributed quotations.</small></div><button class="button" data-action="knowledge-save" data-id="${t.id}" aria-pressed="${knowledgeSaved.includes(id)}">${knowledgeSaved.includes(id) ? "Remove from saved terms" : "Save this term"}</button></div>`;
  modal.dataset.term = id;
  if (!modal.open) modal.showModal();
  $("knowledge-detail-title").focus();
}
document.addEventListener("click", (event) => {
  const b = event.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action,
    id = b.dataset.id;
  if (
    a !== "knowledge" &&
    !a.startsWith("knowledge-") &&
    a !== "exit-knowledge"
  )
    return;
  try {
    if (a === "knowledge") {
      knowledgeOpen = true;
      libraryOpen = false;
      render();
    } else if (a === "exit-knowledge") {
      knowledgeOpen = false;
      render();
    } else if (a === "knowledge-section") {
      knowledgeSection = id;
      renderKnowledge();
    } else if (a === "knowledge-detail") {
      openKnowledgeTerm(id);
    } else if (a === "knowledge-close") {
      $("knowledge-dialog").close();
    } else if (a === "knowledge-save") {
      const next = knowledgeSaved.includes(id)
        ? knowledgeSaved.filter((x) => x !== id)
        : [...knowledgeSaved, id];
      localStorage.setItem(knowledgeKey, JSON.stringify(next));
      knowledgeSaved = next;
      renderKnowledge();
      if ($("knowledge-dialog").open)
        openKnowledgeTerm($("knowledge-dialog").dataset.term);
    } else if (a === "knowledge-csv") {
      download(
        PMKnowledge.knowledgeCsv(knowledgeResults()),
        "project-operations-glossary.csv",
        "text/csv;charset=utf-8",
      );
    } else {
      if (a === "knowledge-all") knowledgeFilters.favouritesOnly = false;
      if (a === "knowledge-saved") knowledgeFilters.favouritesOnly = true;
      if (a === "knowledge-letter") knowledgeFilters.letter = id;
      if (a === "knowledge-clear")
        knowledgeFilters = {
          query: "",
          category: "All",
          letter: "All",
          favouritesOnly: false,
          practicalOnly: false,
          comparisonsOnly: false,
        };
      knowledgeLimit = a === "knowledge-more" ? knowledgeLimit + 24 : 24;
      renderKnowledge();
    }
  } catch (e) {
    error(e);
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id !== "knowledge-search") return;
  knowledgeFilters.query = event.target.value;
  const position = event.target.selectionStart;
  knowledgeLimit = 24;
  renderKnowledge();
  $("knowledge-search").focus();
  $("knowledge-search").setSelectionRange(position, position);
});
document.addEventListener("change", (event) => {
  if (event.target.id !== "knowledge-topic") return;
  knowledgeFilters.category = event.target.value;
  knowledgeFilters.letter = "All";
  knowledgeLimit = 24;
  renderKnowledge();
});

document.addEventListener("change", (event) => {
  const id = event.target.id;
  if (id !== "knowledge-practical" && id !== "knowledge-comparisons") return;
  knowledgeFilters[
    id === "knowledge-practical" ? "practicalOnly" : "comparisonsOnly"
  ] = event.target.checked;
  knowledgeLimit = 24;
  renderKnowledge();
});
