import { knowledgeTerms, knowledgeTopics, type KnowledgeTerm } from "./catalog";
export const normaliseKnowledge = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export type KnowledgeFilters = {
  query?: string;
  category?: string;
  letter?: string;
  favouritesOnly?: boolean;
  savedIds?: string[];
};
export function searchKnowledge(
  filters: KnowledgeFilters = {},
): KnowledgeTerm[] {
  const query = normaliseKnowledge(filters.query || "");
  const words = query.split(" ").filter(Boolean),
    saved = new Set(filters.savedIds || []);
  const matches = knowledgeTerms.filter((t) => {
    if (
      filters.category &&
      filters.category !== "All" &&
      t.category !== filters.category
    )
      return false;
    if (filters.favouritesOnly && !saved.has(t.id)) return false;
    const initial = /^[0-9]/.test(t.name)
      ? "#"
      : t.name.charAt(0).toUpperCase();
    if (
      filters.letter &&
      filters.letter !== "All" &&
      initial !== filters.letter
    )
      return false;
    const category =
      knowledgeTopics.find((c) => c.id === t.category)?.name || "";
    const text = normaliseKnowledge(
      [t.name, ...t.aliases, t.definition, category, t.formula || ""].join(" "),
    );
    return words.every((w) => text.includes(w));
  });
  const score = (t: KnowledgeTerm) => {
    const name = normaliseKnowledge(t.name);
    if (
      name === query ||
      t.aliases.some((a) => normaliseKnowledge(a) === query)
    )
      return 100;
    if (name.startsWith(query)) return 70;
    if (name.includes(query)) return 50;
    return 0;
  };
  return matches.sort(
    (a, b) =>
      (query ? score(b) - score(a) : 0) ||
      a.name.localeCompare(b.name, "en", { numeric: true }),
  );
}
export function knowledgeCsv(terms: KnowledgeTerm[]) {
  const cell = (value: string) =>
    '"' + (/^[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""') + '"';
  const rows = [
    [
      "Term",
      "Topic",
      "Aliases / acronyms",
      "Definition",
      "Formula",
      "Formula assumptions",
      "Illustrative example",
    ],
    ...terms.map((t) => [
      t.name,
      knowledgeTopics.find((c) => c.id === t.category)?.name || "",
      t.aliases.join("; "),
      t.definition,
      t.formula || "",
      t.assumptions || "",
      t.example || "",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
