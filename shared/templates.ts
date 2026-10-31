/** Shared by the server application and generated single-file local edition. */
export type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: { key: string; label: string; hint: string }[];
  sections: {
    heading: string;
    body: string;
    record?: "tasks" | "budget" | "risks" | "updates";
  }[];
};
const f = (key: string, label: string, hint: string) => ({ key, label, hint });
const s = (
  heading: string,
  body: string,
  record?: Template["sections"][number]["record"],
) => ({ heading, body, record });
export const templateCatalog: Template[] = [
  {
    id: "plan",
    name: "Project plan",
    category: "Planning",
    description:
      "Scope, objectives, activities, resources, controls and delivery recommendations.",
    fields: [
      f(
        "objectives",
        "Objectives & targets",
        "What outcomes will you achieve, and how will they be measured?",
      ),
      f(
        "scope",
        "Scope & deliverables",
        "What is included, excluded and to be delivered?",
      ),
    ],
    sections: [
      s("Background & justification", "{{brief}}"),
      s("Objectives & measurable targets", "{{objectives}}"),
      s("Scope & deliverables", "{{scope}}"),
      s(
        "Work breakdown & implementation schedule",
        "Confirm dependencies, resources and milestones for each activity.",
        "tasks",
      ),
      s(
        "Personnel & equipment",
        "[Add required roles, capacity, equipment and availability.]",
      ),
      s(
        "Budget & assumptions",
        "Validate quantities and rates against dated supplier quotations.",
        "budget",
      ),
      s(
        "Risk management",
        "Confirm owners, review dates and response actions.",
        "risks",
      ),
      s(
        "Monitoring, evaluation & KPIs",
        "Indicator | Baseline | Target | Evidence source | Frequency | Owner\n[Complete the monitoring framework.]",
      ),
      s(
        "Assumptions, constraints & recommendations",
        "[Record constraints, assumptions requiring validation and recommended actions.]",
      ),
    ],
  },
  {
    id: "proposal",
    name: "Proposal",
    category: "Planning",
    description:
      "Explain the problem, proposed solution, beneficiaries, delivery and funding request.",
    fields: [
      f(
        "problem",
        "Problem statement",
        "What need or problem does this project address?",
      ),
      f(
        "beneficiaries",
        "Beneficiaries",
        "Who benefits, where, and how will they be involved?",
      ),
      f(
        "objectives",
        "Proposed outcomes",
        "State measurable intended outcomes, not verified achievements.",
      ),
    ],
    sections: [
      s("Executive summary", "{{brief}}"),
      s("Problem & justification", "{{problem}}"),
      s("Beneficiaries & stakeholder engagement", "{{beneficiaries}}"),
      s("Objectives & expected outcomes", "{{objectives}}"),
      s(
        "Approach & deliverables",
        "[Describe the delivery approach and tangible outputs.]",
      ),
      s(
        "Implementation work plan",
        "[Confirm milestones and responsibilities.]",
        "tasks",
      ),
      s(
        "Funding request & cost assumptions",
        "[Specify the amount requested, funding sources and estimate basis.]",
        "budget",
      ),
      s(
        "Risk & sustainability",
        "[Explain how benefits will be sustained after delivery.]",
        "risks",
      ),
      s(
        "Monitoring & reporting",
        "[Define indicators, evidence collection and reporting commitments.]",
      ),
      s(
        "Approval & supporting evidence",
        "[Add authorised signatories and verified supporting sources.]",
      ),
    ],
  },
  {
    id: "charter",
    name: "Project charter",
    category: "Planning",
    description:
      "Define the mandate, sponsor, objectives, boundaries and approval authority.",
    fields: [
      f(
        "sponsor",
        "Sponsor / authorising body",
        "Who can approve and fund this project?",
      ),
      f(
        "objectives",
        "Success criteria",
        "How will the sponsor judge success?",
      ),
      f("scope", "Scope boundaries", "List in-scope and out-of-scope work."),
    ],
    sections: [
      s("Purpose & business need", "{{brief}}"),
      s(
        "Sponsor & project authority",
        "{{sponsor}}\n[Name the project manager and delegated authority limits.]",
      ),
      s("Objectives & success criteria", "{{objectives}}"),
      s("High-level scope", "{{scope}}"),
      s("Milestones & delivery window", "[Confirm key milestones.]", "tasks"),
      s(
        "Budget envelope & funding",
        "[Confirm authorised funding; estimates below are not approval.]",
        "budget",
      ),
      s(
        "High-level risks & constraints",
        "[Identify assumptions and constraints.]",
        "risks",
      ),
      s(
        "Governance & approval",
        "Sponsor | Project manager | Approval date | Signature\n[Obtain formal approval; no approval is inferred from this template.]",
      ),
    ],
  },
  {
    id: "tor",
    name: "Terms of Reference",
    category: "Planning",
    description:
      "Set objectives, assignment scope, deliverables, selection criteria and acceptance terms.",
    fields: [
      f(
        "scope",
        "Assignment scope",
        "Describe the services or assignment required.",
      ),
      f(
        "qualifications",
        "Required qualifications",
        "Specify capabilities, experience and selection criteria.",
      ),
    ],
    sections: [
      s("Background", "{{brief}}"),
      s("Assignment objectives & scope", "{{scope}}"),
      s(
        "Deliverables & acceptance criteria",
        "Deliverable | Acceptance evidence | Reviewer | Due date\n[Define each deliverable and approval criteria.]",
      ),
      s(
        "Schedule & reporting",
        "[State contract milestones, reporting line and review frequency.]",
        "tasks",
      ),
      s("Required qualifications & evaluation", "{{qualifications}}"),
      s(
        "Budget & payment terms",
        "[Set payment milestones and applicable taxes; confirm with finance/procurement.]",
        "budget",
      ),
      s(
        "Responsibilities, confidentiality & ownership",
        "[Record client inputs, confidentiality requirements and intellectual-property terms for legal review.]",
      ),
      s(
        "Approval & change control",
        "[Identify approving authority and how scope changes are authorised.]",
      ),
    ],
  },
  {
    id: "wbs",
    name: "Work Breakdown Structure",
    category: "Delivery",
    description:
      "Break deliverables into work packages, acceptance criteria and responsible owners.",
    fields: [
      f(
        "scope",
        "Deliverables / scope",
        "List the outputs to break down into work packages.",
      ),
    ],
    sections: [
      s("Scope baseline", "{{scope}}"),
      s(
        "WBS hierarchy",
        "WBS code | Deliverable / work package | Owner | Acceptance criteria\n1.0 | [Project deliverable] | [Owner] | [Evidence]\n1.1 | [Work package] | [Owner] | [Acceptance criteria]\n1.2 | [Work package] | [Owner] | [Acceptance criteria]",
      ),
      s(
        "Recorded activities",
        "These tasks are records, not an automatically approved WBS.",
        "tasks",
      ),
      s(
        "Work-package dictionary",
        "Code | Description | Exclusions | Dependencies | Resources | Completion evidence\n[Complete a dictionary entry for each work package.]",
      ),
      s(
        "Baseline approval & changes",
        "[Record reviewer, version, approval date and change-control process.]",
      ),
    ],
  },
  {
    id: "workplan",
    name: "Work plan",
    category: "Delivery",
    description:
      "Translate objectives into timed activities, owners, dependencies and outputs.",
    fields: [
      f(
        "objectives",
        "Work-plan objectives",
        "What must be delivered in this work period?",
      ),
    ],
    sections: [
      s(
        "Objectives & planning period",
        "{{objectives}}\nReporting / planning period: {{period}}",
      ),
      s(
        "Implementation schedule",
        "[Confirm dependencies and realistic dates.]",
        "tasks",
      ),
      s(
        "Resources & coordination",
        "Activity | People / equipment | Dependency | Expected output\n[Complete resource and dependency requirements.]",
      ),
      s(
        "Budget & resource assumptions",
        "[Identify the budget assigned to each activity.]",
        "budget",
      ),
      s(
        "Milestones & review cadence",
        "Milestone | Target date | Acceptance evidence | Reviewer\n[Record milestone reviews and escalation triggers.]",
      ),
    ],
  },
  {
    id: "business-case",
    name: "Business case",
    category: "Planning",
    description:
      "Compare options, benefits, costs, feasibility and investment decisions.",
    fields: [
      f(
        "problem",
        "Business need",
        "What problem or opportunity requires an investment?",
      ),
      f(
        "options",
        "Options to compare",
        "Include a do-nothing option and viable alternatives.",
      ),
    ],
    sections: [
      s("Strategic need & justification", "{{problem}}\n{{brief}}"),
      s(
        "Options appraisal",
        "{{options}}\nOption | Benefits | Costs | Risks | Evidence\n[Compare alternatives without inventing returns.]",
      ),
      s(
        "Benefits & measurement",
        "Benefit | Baseline | Target | Owner | Realisation date\n[Add measurable benefits and evidence sources.]",
      ),
      s(
        "Cost & funding assessment",
        "[Validate estimates, funding availability and lifecycle costs.]",
        "budget",
      ),
      s(
        "Feasibility & risks",
        "[Assess technical, operational, regulatory and commercial feasibility.]",
        "risks",
      ),
      s(
        "Recommendation & decision",
        "[State preferred option, supporting evidence, conditions and approving authority. Financial returns require validated cash-flow data.]",
      ),
    ],
  },
  {
    id: "budget",
    name: "Budget",
    category: "Finance & controls",
    description:
      "Document quantities, rates, contingency, tax, actual costs and estimate assumptions.",
    fields: [
      f(
        "assumptions",
        "Estimate assumptions & sources",
        "List supplier quotations, dates, exclusions and assumptions.",
      ),
    ],
    sections: [
      s("Estimate basis & assumptions", "{{assumptions}}"),
      s(
        "Budget & recorded expenditure",
        "All amounts remain in the project currency. No currency conversion is applied.",
        "budget",
      ),
      s(
        "Allocation by phase / activity",
        "Phase | Activity | Planned amount | Funding source | Period\n[Allocate the estimate; reconcile allocations to the total.]",
      ),
      s(
        "Cash-flow requirements",
        "Period | Planned outflow | Funding inflow | Funding gap\n[Complete from a validated spending schedule.]",
      ),
      s(
        "Review & authorisation",
        "[Confirm applicable tax treatment, estimate date, finance reviewer and approval. Recorded estimates are not authorised expenditure.]",
      ),
    ],
  },
  {
    id: "risk",
    name: "Risk register",
    category: "Finance & controls",
    description:
      "Assess probability and impact, assign owners and plan mitigation and contingency.",
    fields: [
      f(
        "riskScope",
        "Risk review scope",
        "Define the review period and project areas assessed.",
      ),
    ],
    sections: [
      s(
        "Review scope & scoring",
        "{{riskScope}}\nProbability and impact each use a 1–5 scale; score = probability × impact (1–25). A score is a prioritisation aid, not a verified probability.",
      ),
      s(
        "Recorded risk register",
        "[Review each risk with its owner.]",
        "risks",
      ),
      s(
        "Additional risk assessment",
        "Risk | Category | Cause | Warning | Probability | Impact | Mitigation | Contingency | Owner | Review date\n[Add newly identified risks; do not infer that an empty register means no risks exist.]",
      ),
      s(
        "Escalation & review",
        "[Define thresholds, escalation contacts, action deadlines and the next review date.]",
      ),
    ],
  },
  {
    id: "procurement",
    name: "Procurement plan",
    category: "Finance & controls",
    description:
      "Plan sourcing packages, evaluation, delivery dates and procurement approvals.",
    fields: [
      f(
        "scope",
        "Procurement scope",
        "What goods, works or services must be sourced?",
      ),
    ],
    sections: [
      s("Procurement objectives & scope", "{{scope}}"),
      s(
        "Procurement schedule",
        "Package | Specification | Quantity | Method | Budget | Lead time | Required date | Owner\n[Define packages from approved requirements. Do not invent suppliers or prices.]",
      ),
      s(
        "Budget reference",
        "Validate estimates with supplier evidence before making commitments.",
        "budget",
      ),
      s(
        "Evaluation & due diligence",
        "[Define technical criteria, commercial evaluation, supplier checks and conflict-of-interest controls.]",
      ),
      s(
        "Contract, delivery & acceptance",
        "[Specify approvals, payment milestones, inspection evidence, warranties and acceptance responsibilities.]",
      ),
      s(
        "Procurement risks",
        "[Address lead times, logistics, compliance and supplier performance.]",
        "risks",
      ),
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring & evaluation plan",
    category: "Finance & controls",
    description:
      "Connect objectives to indicators, targets, evidence, reporting and learning.",
    fields: [
      f(
        "objectives",
        "Results to measure",
        "State project outputs and intended outcomes.",
      ),
    ],
    sections: [
      s("Results framework", "{{objectives}}"),
      s(
        "Indicator matrix",
        "Objective | Indicator | Baseline | Target | Data source | Collection method | Frequency | Owner\n[Complete with verified baselines. Mark unknown baselines as not yet measured.]",
      ),
      s(
        "Data quality & verification",
        "[Define evidence standards, quality checks, consent, storage and reviewer responsibilities.]",
      ),
      s(
        "Monitoring schedule",
        "[Connect monitoring activities to the implementation schedule.]",
        "tasks",
      ),
      s(
        "Evaluation & learning",
        "[Set evaluation questions, methodology, review dates and how lessons will inform decisions.]",
      ),
      s(
        "Reporting & resources",
        "[Identify reporting audiences, reporting cadence, collection resources and budget.]",
      ),
    ],
  },
  {
    id: "minutes",
    name: "Meeting minutes",
    category: "Reporting",
    description:
      "Record attendance, discussion, decisions and accountable follow-up actions.",
    fields: [
      f(
        "meetingDate",
        "Meeting date & location",
        "Enter the date, time and venue or call details.",
      ),
      f(
        "attendees",
        "Attendees & apologies",
        "List actual attendees and apologies.",
      ),
      f(
        "discussion",
        "Discussion notes",
        "Record verified discussion and decisions; leave unknown details blank.",
      ),
    ],
    sections: [
      s(
        "Meeting details",
        "{{meetingDate}}\nChair: [Name]\nMinute taker: {{author}}",
      ),
      s("Attendance & apologies", "{{attendees}}"),
      s("Agenda & discussion", "{{discussion}}"),
      s(
        "Decisions",
        "Decision | Rationale | Approving person | Date\n[Record confirmed decisions only.]",
      ),
      s(
        "Action log",
        "Action | Owner | Due date | Status\n[Assign follow-up actions.]",
      ),
      s(
        "Next meeting & approval",
        "[Record the next meeting date and minutes approval process.]",
      ),
    ],
  },
  {
    id: "weekly",
    name: "Weekly report",
    category: "Reporting",
    description:
      "Summarise a chosen week using recorded updates, finances, tasks and decisions.",
    fields: [
      f(
        "summary",
        "Management summary",
        "Summarise only substantiated achievements and issues.",
      ),
      f("priorities", "Next-week priorities", "What should happen next week?"),
    ],
    sections: [
      s("Executive summary", "{{summary}}\nReporting period: {{period}}"),
      s(
        "Recorded progress updates",
        "Only updates dated within the selected period are included.",
        "updates",
      ),
      s(
        "Task status at generation",
        "Task progress is the current record, not a historical baseline.",
        "tasks",
      ),
      s(
        "Financial position at generation",
        "Totals are cumulative current records, not period-specific spending.",
        "budget",
      ),
      s(
        "Risks & corrective actions",
        "Review recorded risks and outstanding actions.",
        "risks",
      ),
      s(
        "Decisions required",
        "[Record decisions, decision owner and deadline.]",
      ),
      s("Next-week priorities", "{{priorities}}"),
    ],
  },
  {
    id: "monthly",
    name: "Monthly report",
    category: "Reporting",
    description:
      "Prepare a management-ready monthly review with evidence and next-period priorities.",
    fields: [
      f(
        "summary",
        "Management summary",
        "Describe evidenced outcomes, issues and required intervention.",
      ),
      f(
        "priorities",
        "Next-month priorities",
        "List planned priorities and responsible people.",
      ),
    ],
    sections: [
      s("Executive summary", "{{summary}}\nReporting period: {{period}}"),
      s(
        "Recorded progress updates",
        "Only updates dated within the selected period are included.",
        "updates",
      ),
      s(
        "Activities & deliverables",
        "Current task records; planned-versus-actual analysis needs an approved baseline.",
        "tasks",
      ),
      s(
        "Financial performance",
        "Current cumulative figures. Monthly variance, CPI and SPI require additional baseline and period data.",
        "budget",
      ),
      s(
        "Resources & quality",
        "[Record verified resource utilisation, quality evidence and gaps.]",
      ),
      s(
        "Risks, issues & actions",
        "Review risks, issue owners and corrective-action deadlines.",
        "risks",
      ),
      s(
        "Management decisions",
        "[List decisions needed, supporting evidence and deadlines.]",
      ),
      s("Next-month priorities", "{{priorities}}"),
    ],
  },
  {
    id: "lessons",
    name: "Lessons-learned report",
    category: "Reporting",
    description:
      "Capture evidence, causes, lessons and actions that improve the next project.",
    fields: [
      f(
        "lessons",
        "Observations & evidence",
        "What worked, what did not, and what evidence supports this?",
      ),
    ],
    sections: [
      s(
        "Review scope & participants",
        "[Record review dates, participants and scope.]\n{{brief}}",
      ),
      s("Observations & evidence", "{{lessons}}"),
      s(
        "Root-cause analysis",
        "Observation | Evidence | Contributing cause | Impact\n[Separate verified causes from hypotheses.]",
      ),
      s(
        "Lessons & recommendations",
        "Lesson | Recommendation | Owner | Due date | Reuse location\n[Identify actions and where the lesson will be applied.]",
      ),
      s(
        "Follow-up & approval",
        "[Record management review, action tracking and knowledge-sharing arrangements.]",
      ),
    ],
  },
  {
    id: "closure",
    name: "Closure report",
    category: "Reporting",
    description:
      "Assess acceptance, costs, unresolved issues, handover and final approvals.",
    fields: [
      f(
        "acceptance",
        "Acceptance & completion evidence",
        "List deliverables and actual acceptance evidence. Do not assume completion.",
      ),
      f(
        "handover",
        "Handover arrangements",
        "Who takes ownership, and what remains open?",
      ),
    ],
    sections: [
      s("Project overview", "{{brief}}"),
      s("Deliverable acceptance", "{{acceptance}}"),
      s(
        "Final recorded activity status",
        "Unfinished tasks remain visible; this template does not certify completion.",
        "tasks",
      ),
      s(
        "Financial reconciliation",
        "[Reconcile final invoices, commitments and funding balances. Recorded totals are not audited final accounts.]",
        "budget",
      ),
      s(
        "Outstanding risks & obligations",
        "[Identify unresolved liabilities, risks and action owners.]",
        "risks",
      ),
      s("Handover & operational ownership", "{{handover}}"),
      s(
        "Lessons & benefit realisation",
        "[Document lessons, post-project review dates and responsibility for measuring benefits.]",
      ),
      s(
        "Closure approval",
        "Sponsor | Acceptance evidence | Conditions | Signature | Date\n[Obtain formal approval before declaring the project closed.]",
      ),
    ],
  },
];
export const documentTypes = [
  "Project plan",
  "Progress report",
  "Proposal",
  "Project charter",
  "Risk register",
  "Procurement plan",
  "Meeting minutes",
  "Closure report",
  "Terms of Reference",
  "Work Breakdown Structure",
  "Work plan",
  "Business case",
  "Budget",
  "Monitoring & evaluation plan",
  "Weekly report",
  "Monthly report",
  "Lessons-learned report",
] as const;
export type TemplateContext = {
  project?: {
    title?: string;
    description?: string;
    industry?: string;
    location?: string;
    currency?: string;
    start_date?: string;
    end_date?: string;
  };
  tasks?: Record<string, any>[];
  budget?: Record<string, any>[];
  expenses?: Record<string, any>[];
  risks?: Record<string, any>[];
  updates?: Record<string, any>[];
  finance?: {
    subtotal: number;
    contingency: number;
    tax: number;
    total: number;
    spent: number;
    remaining: number;
  };
};
export type TemplateAnswers = Record<string, string>;
export function generateManagementTemplate(
  id: string,
  context: TemplateContext = {},
  answers: TemplateAnswers = {},
  generatedDate = new Date().toISOString().slice(0, 10),
) {
  const template = templateCatalog.find((t) => t.id === id);
  if (!template) throw new Error("Unknown project management template");
  const p = context.project || {};
  const name =
    answers.projectName?.trim() || p.title || "[Project name required]";
  const values: TemplateAnswers = {
    ...answers,
    brief:
      p.description || "[Add project background, justification and scope.]",
    period: answers.period || "[Reporting / planning period required]",
    author: answers.author || "[Prepared by]",
  };
  for (const field of template.fields)
    if (!values[field.key]?.trim())
      values[field.key] =
        `[Required information: ${field.label}. ${field.hint}]`;
  const fill = (text: string) =>
    text.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => values[key] || `[${key} required]`,
    );
  const cell = (v: unknown) =>
    String(v ?? "Not recorded")
      .replace(/[\n\r|]/g, " ")
      .slice(0, 800) || "Not recorded";
  const rows = (
    header: string,
    records: Record<string, any>[] | undefined,
    format: (r: Record<string, any>) => unknown[],
  ) =>
    !records?.length
      ? "No records available. [Complete this section with verified information.]"
      : header +
        "\n" +
        records
          .slice(0, 50)
          .map((r) => format(r).map(cell).join(" | "))
          .join("\n") +
        (records.length > 50
          ? `\n[Showing 50 of ${records.length} records. Review the full register before sharing.]`
          : "");
  const amount = (n: number) =>
    `${p.currency || "[Currency]"} ${(n / 100).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const records = (
    kind: NonNullable<Template["sections"][number]["record"]>,
  ) => {
    if (kind === "tasks")
      return rows(
        "Activity | Owner | Start | Due | Status | Recorded progress",
        context.tasks,
        (t) => [
          t.title,
          t.owner,
          t.start_date,
          t.end_date,
          t.status,
          t.progress + "%",
        ],
      );
    if (kind === "risks")
      return rows(
        "Risk | Category | Probability | Impact | Score /25 | Warning | Mitigation | Contingency | Owner | Review date | Status",
        context.risks,
        (r) => [
          r.title,
          r.category,
          r.probability,
          r.impact,
          r.probability * r.impact,
          r.warning,
          r.mitigation,
          r.contingency ?? r.response,
          r.owner,
          r.review_date,
          r.status,
        ],
      );
    if (kind === "updates") {
      const start = answers.periodStart,
        end = answers.periodEnd;
      const updates = (context.updates || []).filter(
        (u) => (!start || u.date >= start) && (!end || u.date <= end),
      );
      return rows("Date | Recorded update", updates, (u) => [
        u.date,
        u.content,
      ]);
    }
    const finance = context.finance;
    return (
      rows(
        "Estimate item | Category | Quantity | Unit rate | Estimated amount",
        context.budget,
        (b) => [
          b.title,
          b.category,
          b.quantity,
          amount(b.rateMinor),
          amount(Math.round(b.quantity * b.rateMinor)),
        ],
      ) +
      (finance
        ? `\n\nBudget subtotal: ${amount(finance.subtotal)}\nContingency: ${amount(finance.contingency)}\nTax: ${amount(finance.tax)}\nTotal recorded budget: ${amount(finance.total)}\nActual recorded expenditure: ${amount(finance.spent)}\nRemaining / budget variance (budget − actual): ${amount(finance.remaining)}\nAmounts are current cumulative records as of generation. Validate the estimate basis and expense evidence.`
        : "\n[Budget totals not supplied. Add a validated estimate; no prices have been invented.]")
    );
  };
  if (
    answers.periodStart &&
    answers.periodEnd &&
    answers.periodEnd < answers.periodStart
  )
    throw new Error("Reporting end date must follow start date");
  const title = `${name} — ${template.name}`.slice(0, 200);
  const content = [
    template.name.toUpperCase() + " — TEMPLATE DRAFT",
    `Project: ${name}\nIndustry: ${p.industry || "[Industry]"}\nLocation: ${p.location || "[Location]"}\nProject dates: ${p.start_date || "[Start]"} to ${p.end_date || "[End]"}\nPrepared by: ${values.author}\nPrepared for: ${answers.recipient || "[Recipient / approving authority]"}\nGenerated: ${generatedDate}\nReporting / planning period: ${values.period}`,
    "This is a rule-based template populated from the selected project records and your inputs, not an AI assessment. Bracketed sections identify missing information. Review facts, sources, approvals and estimates before sharing.",
    ...template.sections.map(
      (section, i) =>
        `${i + 1}. ${section.heading.toUpperCase()}\n${fill(section.body)}${section.record ? "\n\n" + records(section.record) : ""}`,
    ),
  ].join("\n\n");
  return {
    title,
    type: template.name,
    content,
    source: "Project management template — review required",
  };
}
