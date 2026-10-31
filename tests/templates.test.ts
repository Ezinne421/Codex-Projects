import { test } from "node:test";
import assert from "node:assert/strict";
import {
  templateCatalog,
  generateManagementTemplate,
  documentTypes,
} from "../shared/templates.js";
import { schemas } from "../server/schemas.js";
test("all 16 templates generate editable drafts accepted by document validation", () => {
  assert.equal(templateCatalog.length, 16);
  assert.equal(new Set(templateCatalog.map((t) => t.id)).size, 16);
  for (const t of templateCatalog) {
    const draft = generateManagementTemplate(t.id, {}, {});
    assert.ok(documentTypes.includes(draft.type as any));
    assert.ok(schemas.documents.safeParse(draft).success);
    assert.match(draft.content, /TEMPLATE DRAFT/);
    assert.match(draft.content, /\[/);
    assert.doesNotMatch(draft.content, /\{\{/);
  }
});
test("budget template copies minor-unit totals and risk evidence without fabricated rates", () => {
  const draft = generateManagementTemplate(
    "budget",
    {
      project: { title: "Maize", currency: "NGN" },
      budget: [
        {
          title: "Seeds",
          category: "Materials",
          quantity: 2,
          rateMinor: 125000,
        },
      ],
      finance: {
        subtotal: 250000,
        contingency: 25000,
        tax: 0,
        total: 275000,
        spent: 50000,
        remaining: 225000,
      },
    },
    { assumptions: "Supplier quotation dated 2026-10-31" },
    "2026-11-01",
  );
  assert.match(draft.content, /NGN 2,750.00/);
  assert.match(draft.content, /NGN 2,250.00/);
  assert.match(draft.content, /Supplier quotation dated 2026-10-31/);
  assert.doesNotMatch(draft.content, /market price/i);
  const risk = generateManagementTemplate("risk", {
    risks: [
      {
        title: "Rainfall delay",
        probability: 4,
        impact: 5,
        mitigation: "Review forecast",
        response: "Change planting date",
        owner: "Ada",
      },
    ],
  });
  assert.match(risk.content, /20/);
  assert.match(risk.content, /Change planting date/);
});
test("period reports filter update dates and identify cumulative financial data", () => {
  const draft = generateManagementTemplate(
    "weekly",
    {
      updates: [
        { date: "2026-10-01", content: "Outside the selected week" },
        { date: "2026-11-01", content: "Verified seed delivery" },
        { date: "2026-11-08", content: "Future record" },
      ],
    },
    {
      periodStart: "2026-11-01",
      periodEnd: "2026-11-07",
      period: "1–7 November",
    },
  );
  assert.match(draft.content, /Verified seed delivery/);
  assert.doesNotMatch(draft.content, /Outside the selected week|Future record/);
  assert.match(draft.content, /cumulative/);
  assert.throws(() =>
    generateManagementTemplate(
      "weekly",
      {},
      { periodStart: "2026-11-07", periodEnd: "2026-11-01" },
    ),
  );
});
