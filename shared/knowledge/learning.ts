/** Original learning material. Source snapshots verified on 2 November 2026. */
export type PracticeQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type LearningLesson = {
  id: string;
  title: string;
  area: string;
  level: "Foundation" | "Practitioner" | "Advanced";
  minutes: number;
  objective: string;
  explanation: string;
  steps: string[];
  scenario: { context: string; decision: string; reason: string };
  pitfall: string;
  apply: string;
  terms: string[];
  questions: PracticeQuestion[];
};
const q = (
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): PracticeQuestion => {
  const offset =
    [...prompt].reduce((n, c) => n + c.charCodeAt(0), 0) % options.length;
  return {
    prompt,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    answer: (answer - offset + options.length) % options.length,
    explanation,
  };
};
export const learningLessons: LearningLesson[] = [
  {
    id: "value",
    title: "Start with outcomes and a credible business case",
    area: "Strategy & value",
    level: "Foundation",
    minutes: 12,
    objective:
      "Distinguish deliverables, outcomes and benefits; make a defensible investment recommendation.",
    explanation:
      "A deliverable is something produced. An outcome is a change in behaviour or performance. A benefit is a valued, measurable improvement. A complete business case compares credible options, including doing the minimum, and names the assumptions that could invalidate the preferred option. Benefits usually depend on operational adoption after the project finishes.",
    steps: [
      "Describe the problem using a baseline, affected people and a decision deadline.",
      "Compare options using whole-life costs, benefits, risks and affordability; include a do-minimum alternative.",
      "Assign a benefits owner, measurement method, target date and decision points for continuing or stopping.",
    ],
    scenario: {
      context:
        "A cooperative proposes an irrigation dashboard. Installing software is the promised deliverable, but water losses have never been measured.",
      decision:
        "Measure present losses, test a small option and name the operations owner before approving the whole rollout.",
      reason:
        "A dashboard alone cannot demonstrate improved water use. A baseline and operational response are needed to test value.",
    },
    pitfall:
      "Treating all forecast benefits as guaranteed revenue, or confusing project completion with benefit realisation.",
    apply:
      "Write one deliverable, one outcome and one measurable benefit for a current initiative. Add an owner and a baseline.",
    terms: ["business-case", "benefits-realisation", "benefits-owner"],
    questions: [
      q(
        "A portal is delivered on time, but nobody adopts it. What is established?",
        [
          "The intended benefit has been achieved",
          "An output was delivered; the intended outcome still needs evidence",
          "The business case is automatically invalid",
        ],
        1,
        "Delivery establishes an output. Adoption and benefits require separate measures and investigation.",
      ),
      q(
        "Which is the strongest reason to revisit a business case?",
        [
          "A key demand assumption changed materially",
          "The presentation template changed",
          "The project has already spent money",
        ],
        0,
        "Investment decisions depend on current evidence. Sunk costs alone do not justify continuing.",
      ),
    ],
  },
  {
    id: "governance",
    title: "Set decision rights and proportionate governance",
    area: "Leadership & governance",
    level: "Foundation",
    minutes: 10,
    objective: "Clarify who sponsors, owns, approves and escalates decisions.",
    explanation:
      "Governance sets the direction, accountability and boundaries for decisions. Project management coordinates delivery within those boundaries. Small projects still need named authority for funding, acceptance and significant change; large projects need controls that reflect their risk rather than more meetings by default.",
    steps: [
      "Name the sponsor, delivery lead, benefits owner and acceptance authority.",
      "Set delegated thresholds for cost, time, scope and risk; explain the escalation route.",
      "Use stage reviews to consider evidence, remaining value and choices, not merely to report completed activity.",
    ],
    scenario: {
      context:
        "A supplier requests a change beyond the delivery lead’s spending limit during a critical week.",
      decision:
        "Assess the impact, document options and escalate to the authorised decision maker with a decision deadline.",
      reason:
        "Urgency does not create spending authority. Clear escalation allows a timely, accountable choice.",
    },
    pitfall:
      "Using a responsibility chart as a substitute for actual delegated authority or assuming the sponsor manages every task.",
    apply:
      "Create a one-page decision map with authority limits, escalation contacts and review dates.",
    terms: ["governance", "sponsor", "raci-matrix"],
    questions: [
      q(
        "Who should approve expenditure beyond a project lead’s delegated limit?",
        [
          "The person who raised it",
          "The authorised governance role under the agreed rules",
          "Any senior team member",
        ],
        1,
        "Approval follows delegated authority, not who happens to be available.",
      ),
      q(
        "A stage review should primarily decide:",
        [
          "Whether remaining investment is justified and what to do next",
          "Whether all slides use the same font",
          "Whether all expenditure can be recovered",
        ],
        0,
        "A useful gate supports a forward-looking investment decision.",
      ),
    ],
  },
  {
    id: "scope",
    title: "Turn needs into scope and acceptance criteria",
    area: "Planning & control",
    level: "Foundation",
    minutes: 12,
    objective: "Define manageable scope without losing the user need.",
    explanation:
      "Requirements express needs and conditions; scope defines what the initiative will and will not deliver. A work breakdown structure decomposes deliverables into manageable work packages. Acceptance criteria make a decision testable. Detailed task lists cannot compensate for an unclear boundary or an absent acceptance authority.",
    steps: [
      "Interview users and distinguish mandatory requirements from proposed solutions.",
      "Record inclusions, exclusions, interfaces and constraints; decompose deliverables.",
      "Agree observable acceptance criteria and keep traceability from need through test and approval.",
    ],
    scenario: {
      context: "A warehouse system request says “reports must be fast.”",
      decision:
        "Agree a report dataset, load condition and measurable response-time threshold with the business owner.",
      reason:
        "“Fast” is not testable. Performance criteria need a defined operating context and acceptance method.",
    },
    pitfall:
      "Allowing informal requests into delivery without assessing their effect on the agreed scope.",
    apply:
      "Replace three vague requirements with observable acceptance tests and name who accepts them.",
    terms: [
      "scope-baseline",
      "work-breakdown-structure",
      "acceptance-criteria",
    ],
    questions: [
      q(
        "Which is an acceptance criterion?",
        [
          "Users should like the report",
          "Under the agreed test load, the specified report returns within the agreed threshold",
          "The team worked very hard",
        ],
        1,
        "Acceptance criteria specify observable conditions under a defined test.",
      ),
      q(
        "A WBS primarily organises:",
        [
          "Deliverables and work packages",
          "Only individual staff names",
          "Only calendar dates",
        ],
        0,
        "A WBS decomposes the scope; the schedule subsequently sequences its work.",
      ),
    ],
  },
  {
    id: "schedule",
    title: "Build a credible schedule and identify the critical path",
    area: "Planning & control",
    level: "Practitioner",
    minutes: 15,
    objective:
      "Use dependencies, calendars and uncertainty to explain a completion forecast.",
    explanation:
      "A schedule is a model of work, not just a list of desired dates. In a simple unconstrained network, the longest dependency path determines the earliest completion and has zero total float. Calendars, resource limits, lags and imposed dates can change the result; a critical task is not necessarily the most expensive or politically visible task.",
    steps: [
      "Estimate duration with the people doing the work and record dependency logic.",
      "Calculate path lengths, then check calendars, resource conflicts and realistic handoffs.",
      "Assess uncertainty and near-critical paths; update actuals and remaining duration regularly.",
    ],
    scenario: {
      context:
        "Path A is 4 + 6 = 10 days. Path B is 3 + 9 = 12 days. Both start together and must finish before launch.",
      decision:
        "Treat B as the critical path in this simplified network; A has two days of total float.",
      reason:
        "Launch cannot occur before the 12-day path finishes. Reducing A alone does not move the launch date.",
    },
    pitfall:
      "Adding resources without checking dependencies, resource productivity or whether the task is on a constraining path.",
    apply:
      "Draw a six-activity network and explain which assumption would most threaten its forecast.",
    terms: ["critical-path", "total-float", "schedule-baseline"],
    questions: [
      q(
        "In the example, cutting Path A by one day changes the earliest launch to:",
        ["11 days", "12 days", "9 days"],
        1,
        "Path B still takes 12 days and remains the longest path.",
      ),
      q(
        "A resource conflict appears on two parallel tasks. What next?",
        [
          "Ignore it because the network has dates",
          "Recalculate a feasible schedule with the resource constraint",
          "Automatically double every duration",
        ],
        1,
        "A logical network must also be feasible for the available resources.",
      ),
    ],
  },
  {
    id: "estimation",
    title: "Estimate uncertainty and build usable reserves",
    area: "Planning & control",
    level: "Practitioner",
    minutes: 12,
    objective: "Separate estimates, assumptions, confidence and contingency.",
    explanation:
      "An estimate is conditional on scope, productivity, rates and risk assumptions. Ranges communicate uncertainty better than unexplained precision. Three-point PERT estimates use (optimistic + 4 × most likely + pessimistic) / 6 as a modelling convention, not a guarantee. Risk contingency and management reserve serve different governance purposes.",
    steps: [
      "State the estimate basis, exclusions, price date and confidence limitations.",
      "Triangulate historical analogies, parametric rates and bottom-up estimates where appropriate.",
      "Model material uncertainty and obtain approval for reserves and their release rules.",
    ],
    scenario: {
      context:
        "A task has optimistic 4, most likely 7 and pessimistic 16 days.",
      decision:
        "Report the PERT mean as 8 days, explain the range and challenge the assumptions behind 16 days.",
      reason:
        "(4 + 4 × 7 + 16) / 6 = 8. A mean neither removes uncertainty nor supplies a completion probability.",
    },
    pitfall:
      "Adding an arbitrary percentage and presenting it as a quantified confidence level.",
    apply:
      "Document a three-point estimate and identify one source of evidence that would narrow its range.",
    terms: [
      "three-point-estimating",
      "contingency-reserve",
      "management-reserve",
    ],
    questions: [
      q(
        "The PERT mean for 4, 7 and 16 days is:",
        ["7", "8", "9"],
        1,
        "The weighted mean is (4 + 28 + 16) / 6 = 8 days.",
      ),
      q(
        "What does an 8-day PERT mean establish?",
        [
          "A guaranteed finish in 8 days",
          "A model-based mean under stated assumptions",
          "A 95% completion probability",
        ],
        1,
        "A probability claim needs a justified distribution and an appropriate model.",
      ),
    ],
  },
  {
    id: "cost",
    title: "Control costs, cash and changing prices",
    area: "Finance & commercial",
    level: "Practitioner",
    minutes: 14,
    objective: "Distinguish budget, commitment, expenditure and cash need.",
    explanation:
      "A budget is an authorised plan. A commitment is an obligation such as an accepted purchase order. Recorded expenditure and actual cash payments can occur at different times. In contexts with inflation, import exposure or delayed payments, a single currency total can conceal major delivery risks. Always state the rate date, currency and tax treatment.",
    steps: [
      "Build a time-phased cost baseline from quantities and sourced unit rates.",
      "Track commitments, actual costs, invoices and cash timing without double-counting.",
      "Update exchange-rate and inflation scenarios; preserve the approved baseline and explain forecast changes.",
    ],
    scenario: {
      context:
        "An imported pump costs USD 10,000. A planning rate moves from NGN 1,500/USD to NGN 1,650/USD.",
      decision:
        "Show the forecast moving from NGN 15m to NGN 16.5m before other charges, and assess the NGN 1.5m exposure.",
      reason:
        "The foreign-currency price is unchanged, but the local-currency requirement has risen. This is a scenario, not a live exchange-rate quote.",
    },
    pitfall:
      "Counting the purchase order, supplier invoice and payment as three separate costs for the same purchase.",
    apply:
      "Prepare a rolling cash forecast with payment dates, commitments, currency assumptions and an approval trigger.",
    terms: ["cost-baseline", "committed-cost", "cash-flow"],
    questions: [
      q(
        "In the pump example, the local currency increase before other charges is:",
        ["NGN 150,000", "NGN 1,500,000", "USD 1,500"],
        1,
        "10,000 × (1,650 − 1,500) = NGN 1,500,000.",
      ),
      q(
        "Which best preserves a meaningful performance comparison?",
        [
          "Overwrite the original budget every week",
          "Keep the approved baseline and explain the latest forecast separately",
          "Ignore purchase commitments",
        ],
        1,
        "A controlled baseline and an updated forecast answer different management questions.",
      ),
    ],
  },
  {
    id: "evm",
    title: "Interpret earned value and forecast honestly",
    area: "Finance & commercial",
    level: "Advanced",
    minutes: 16,
    objective:
      "Distinguish delivery efficiency from spending and select a defensible forecast.",
    explanation:
      "Planned value (PV) is the budgeted value of scheduled work; earned value (EV) is the budgeted value of completed work; actual cost (AC) is what that work cost. CPI = EV/AC, SPI = EV/PV, CV = EV−AC and SV = EV−PV. Schedule variance is expressed in budget-value units, not elapsed days. EVM depends on a credible baseline and consistent progress measurement.",
    steps: [
      "Use the same scope, currency and status date for PV, EV and AC.",
      "Explain both ratios and absolute variances; challenge unreliable completion percentages.",
      "Choose a forecast method that fits remaining work; BAC/CPI assumes current cost efficiency continues.",
    ],
    scenario: {
      context: "PV = 100,000, EV = 80,000, AC = 100,000 and BAC = 200,000.",
      decision:
        "Report CPI 0.80, SPI 0.80 and both variances −20,000. Conditional EAC is 250,000.",
      reason:
        "The team earned 0.8 budget units per unit spent. A cost forecast of BAC/CPI is conditional; it is not evidence of a specific number of days late.",
    },
    pitfall:
      "Calling unspent budget a saving when the corresponding work has not been completed.",
    apply:
      "Explain a CPI below 1 to a sponsor, then write why a particular EAC method is appropriate.",
    terms: [
      "earned-value",
      "cost-performance-index",
      "schedule-performance-index",
      "estimate-at-completion",
    ],
    questions: [
      q(
        "For EV 80 and AC 100, CPI is:",
        ["1.25", "0.80", "20"],
        1,
        "CPI = EV/AC = 0.80; earned value is below actual cost.",
      ),
      q(
        "SPI of 0.80 means the project is exactly 20% late in calendar days.",
        ["True", "False; SPI is a value-based ratio", "Only if AC equals PV"],
        1,
        "A time forecast needs the schedule model; SPI does not directly measure elapsed-day delay.",
      ),
    ],
  },
  {
    id: "risk",
    title: "Manage risk, assumptions and dependencies",
    area: "Risk & resilience",
    level: "Practitioner",
    minutes: 12,
    objective: "Turn a risk list into owned responses and useful escalation.",
    explanation:
      "A risk is uncertain; an issue has already occurred. An assumption is accepted provisionally and should be tested. Dependencies link delivery to other work or decisions. A useful risk record states cause, uncertain event, consequence, owner, response and trigger. Heat-map scores are screening conventions, not monetary values or probabilities.",
    steps: [
      "Identify threats and opportunities with people who know the work and affected context.",
      "Assess probability and impact on an agreed basis; challenge correlations and assumptions.",
      "Fund and assign responses, monitor triggers and review residual and secondary risks.",
    ],
    scenario: {
      context:
        "A bridge delivery may be delayed by seasonal flooding. Flooding has not yet occurred.",
      decision:
        "Assign a risk owner, monitor access forecasts, agree alternate routes and set a trigger for action.",
      reason:
        "The response connects uncertainty to a decision. If access closes, track the resulting issue as well.",
    },
    pitfall:
      "Treating a probability rating of 4 out of 5 as a measured 80% likelihood.",
    apply:
      "Rewrite one risk as cause → event → consequence, then add a trigger and an owner.",
    terms: ["risk", "issue", "assumption", "risk-score"],
    questions: [
      q(
        "A 4 × 5 ordinal risk score means:",
        [
          "An 80% probability",
          "A screening priority under the chosen scale",
          "A loss of 20 currency units",
        ],
        1,
        "Ordinal scales organise discussion; they do not supply calibrated probabilities or losses.",
      ),
      q(
        "A delayed permit has already stopped work. It is now:",
        [
          "Only a future risk",
          "An issue requiring action, with possible further risks",
          "Automatically closed",
        ],
        1,
        "An occurred event is an issue. Its future consequences may create additional risks.",
      ),
    ],
  },
  {
    id: "quality",
    title: "Build quality into delivery",
    area: "Quality & improvement",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Separate prevention, process assurance and output verification.",
    explanation:
      "Quality means meeting relevant requirements and fitness for intended use. Planning specifies standards and acceptance. Assurance examines whether processes support reliable delivery. Control checks outputs against requirements. Inspection alone cannot undo an incapable process. Rework, defects and failure demand should inform improvement rather than merely a blame list.",
    steps: [
      "Agree critical-to-quality requirements with users and define evidence for acceptance.",
      "Design prevention and process checks into the workflow.",
      "Record defects consistently, investigate causes and verify corrective action.",
    ],
    scenario: {
      context:
        "Five batches fail the same moisture test after final packaging.",
      decision:
        "Contain affected stock, verify the measurement system and investigate the upstream drying process.",
      reason:
        "Repeated end-stage rejection signals a process problem; increasing final inspection alone leaves the cause intact.",
    },
    pitfall:
      "Confusing control limits derived from process behaviour with customer specification limits.",
    apply:
      "Define a quality criterion, preventive control, inspection method and response to failure for one deliverable.",
    terms: ["quality-assurance", "quality-control", "root-cause-analysis"],
    questions: [
      q(
        "Which is primarily quality assurance?",
        [
          "Checking whether the production process follows a capable agreed method",
          "Counting rejected finished units only",
          "Approving any finished item",
        ],
        0,
        "Assurance focuses on process confidence; output inspection is quality control.",
      ),
      q(
        "A process is statistically stable. Does it necessarily meet specifications?",
        [
          "Yes",
          "No; stability and capability are different",
          "Only if there are no charts",
        ],
        1,
        "A stable process can consistently produce results outside the required specification.",
      ),
    ],
  },
  {
    id: "change",
    title: "Control change without blocking adaptation",
    area: "Planning & control",
    level: "Practitioner",
    minutes: 10,
    objective:
      "Make transparent change decisions while keeping work adaptable.",
    explanation:
      "Change control evaluates proposed changes against objectives, constraints and delegated authority. It should be proportionate to the delivery approach. Adaptive backlog decisions can happen within agreed boundaries, while changes to contracts, funding or regulatory obligations may need explicit authorisation. Approved change must reach the people, baselines and documents it affects.",
    steps: [
      "Capture the reason, urgency and expected benefit of a change.",
      "Assess scope, cost, schedule, risk, adoption and contract implications together.",
      "Obtain the right decision, update controlled information and confirm implementation.",
    ],
    scenario: {
      context:
        "A sponsor asks for an additional site after a baseline is agreed.",
      decision:
        "Assess the new site’s value and effects, present options and obtain the required approval before treating it as committed scope.",
      reason:
        "Visibility of trade-offs protects both value and the delivery team’s capacity.",
    },
    pitfall:
      "Equating adaptability with accepting every request without a decision or trade-off.",
    apply:
      "Write a short change recommendation with approve, defer and reject options and their consequences.",
    terms: ["change-request", "change-request", "configuration-management"],
    questions: [
      q(
        "A request is valuable but exceeds current funding. What next?",
        [
          "Silently add it",
          "Evaluate trade-offs and seek the authorised funding or scope decision",
          "Reject every change",
        ],
        1,
        "Value informs the decision but does not remove authority and affordability constraints.",
      ),
      q(
        "After approval, the team should:",
        [
          "Update affected plans and communicate the decision",
          "Keep working from the old baseline",
          "Delete the decision record",
        ],
        0,
        "A decision must be reflected in the controlled delivery information.",
      ),
    ],
  },
  {
    id: "stakeholders",
    title: "Engage stakeholders and negotiate decisions",
    area: "Leadership & governance",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Listen, influence and resolve conflict without hiding trade-offs.",
    explanation:
      "Stakeholder engagement is continuing two-way work, not merely sending updates. Influence, impact and vulnerability all matter: a low-power community can be highly affected by delivery. Negotiation separates interests from positions and makes constraints explicit. Psychological safety allows people to raise uncertainty or failure early without abandoning accountability.",
    steps: [
      "Map who is affected, whose consent or decision is needed and whose voice may be missed.",
      "Agree decision questions, communication channels, language and feedback arrangements.",
      "Explore interests and options, document commitments and check whether engagement changed the decision.",
    ],
    scenario: {
      context:
        "A rural facility location is convenient for the contractor but excludes users during the rainy season.",
      decision:
        "Consult affected users about access, assess alternatives and bring the evidence to the location decision.",
      reason:
        "Delivery convenience alone is an incomplete definition of value and acceptance.",
    },
    pitfall:
      "Assuming silence means consent or ranking stakeholder importance only by formal authority.",
    apply:
      "Plan one conversation with an overlooked group, including the decision it can influence.",
    terms: ["stakeholder-engagement", "negotiation", "psychological-safety"],
    questions: [
      q(
        "A low-power group faces high delivery impact. Should it be engaged?",
        [
          "No, only powerful sponsors matter",
          "Yes, impact and vulnerability matter alongside influence",
          "Only after handover",
        ],
        1,
        "Responsible engagement considers who bears the consequences, not only who controls funds.",
      ),
      q(
        "Two departments argue over the same specialist. First clarify:",
        [
          "Who speaks loudest",
          "Their underlying needs, priorities and constraints",
          "Which department can hide the conflict",
        ],
        1,
        "Interests and evidence create options for negotiation beyond competing positions.",
      ),
    ],
  },
  {
    id: "agile",
    title: "Use Scrum and adaptive delivery with purpose",
    area: "Adaptive & digital delivery",
    level: "Practitioner",
    minutes: 14,
    objective:
      "Explain empiricism, product goals and inspect-and-adapt delivery.",
    explanation:
      "Adaptive delivery uses short feedback cycles when learning can materially improve what is delivered. In Scrum, transparency, inspection and adaptation support empirical decisions. A Sprint is not a miniature fixed-scope contract: scope can be clarified and renegotiated with the Product Owner as more is learned without endangering the Sprint Goal. The Definition of Done supports transparency about usable work.",
    steps: [
      "Define the user problem and desired outcome; connect backlog choices to a Product Goal.",
      "Use short increments and real feedback, with an explicit Definition of Done.",
      "Inspect results and working methods, then adapt priorities and practices from evidence.",
    ],
    scenario: {
      context:
        "Users reject a feature during a Sprint review even though the team built it as requested.",
      decision:
        "Investigate the need, update the Product Backlog and use the evidence to inform future decisions.",
      reason:
        "A review creates learning about product direction; completed work does not prove the original hypothesis was right.",
    },
    pitfall:
      "Equating velocity with customer value or comparing team productivity by story points.",
    apply:
      "Write a product hypothesis, a small usable increment and the user evidence that would change your next step.",
    terms: ["scrum", "product-goal", "definition-of-done"],
    questions: [
      q(
        "What does a team’s higher velocity establish by itself?",
        [
          "More customer value",
          "Only more estimated points completed under that team’s method",
          "A valid comparison with every other team",
        ],
        1,
        "Points are team-specific estimates; value needs evidence of outcomes.",
      ),
      q(
        "During a Sprint, scope clarification should preserve:",
        [
          "Every original task regardless of learning",
          "The Sprint Goal and collaboration with the Product Owner",
          "A ban on all discussion",
        ],
        1,
        "The Scrum Guide allows clarification and renegotiation as learning emerges without endangering the Sprint Goal.",
      ),
    ],
  },
  {
    id: "flow",
    title: "Improve flow with Kanban and useful measures",
    area: "Adaptive & digital delivery",
    level: "Practitioner",
    minutes: 13,
    objective:
      "Use WIP, throughput, work-item age and cycle time to improve decisions.",
    explanation:
      "Flow improvement starts with an explicit definition of the workflow, active management of items and improvement of the workflow. Define start and finish consistently. Work in progress counts started-but-unfinished items; throughput counts completions per period; cycle time measures elapsed start-to-finish time; work-item age measures elapsed time for unfinished work. A service-level expectation is probabilistic, not a guarantee.",
    steps: [
      "Visualise the workflow and make policies and WIP controls explicit.",
      "Review blocked and ageing work before starting more work.",
      "Use historical distributions and the same boundaries when discussing forecasts and experiments.",
    ],
    scenario: {
      context:
        "Average throughput is five items per day and average time in the same stable system is four days.",
      decision:
        "Use Little’s Law to relate average WIP to 20 items, then investigate ageing items and sources of delay.",
      reason:
        "5 × 4 = 20 with consistent units. The relationship does not guarantee the completion time of an individual item.",
    },
    pitfall:
      "Using average cycle time as a promised deadline for every work item.",
    apply:
      "Define a start, finish and blocked-work policy; identify one flow metric your team currently cannot trust.",
    terms: ["kanban", "work-in-progress", "little-s-law", "cycle-time"],
    questions: [
      q(
        "For a stable system, throughput 5/day and average time 4 days imply average WIP:",
        ["1.25", "20", "9"],
        1,
        "Little’s Law gives 5/day × 4 days = 20 items under consistent boundaries.",
      ),
      q(
        "An unfinished item has been in progress for six days. This is its:",
        ["Throughput", "Work-item age", "Final cycle time"],
        1,
        "Age is observable before completion; completed cycle time is known at finish.",
      ),
    ],
  },
  {
    id: "hybrid",
    title: "Tailor predictive, adaptive and hybrid approaches",
    area: "Adaptive & digital delivery",
    level: "Advanced",
    minutes: 12,
    objective:
      "Choose working methods by uncertainty, constraints and feedback cost.",
    explanation:
      "Tailoring adapts governance and delivery to context. Predictive work benefits from stable requirements and costly late changes; adaptive work benefits from frequent usable feedback. A hybrid design deliberately combines approaches at useful boundaries. It should explain interfaces, decision rights and evidence for progress; mixing ceremonies without purpose adds overhead.",
    steps: [
      "Assess uncertainty, compliance obligations, physical dependencies and cost of change.",
      "Choose different cadences where useful while defining shared acceptance and integration points.",
      "Review whether the approach is improving feedback, risk control and outcomes.",
    ],
    scenario: {
      context:
        "A solar installation has regulated civil works and a customer-facing monitoring service whose requirements are evolving.",
      decision:
        "Use controlled engineering gates for physical works and iterative service development, with agreed integration tests and launch authority.",
      reason:
        "The work has different change costs and learning opportunities, yet must function as one service.",
    },
    pitfall:
      "Calling an unplanned mixture of incompatible controls “hybrid” without clear interfaces.",
    apply:
      "Explain why one workstream needs a different cadence and specify how it integrates with the overall delivery.",
    terms: ["hybrid-delivery", "predictive-delivery", "adaptive-delivery"],
    questions: [
      q(
        "What is the strongest basis for tailoring?",
        [
          "Fashionable terminology",
          "Delivery context, uncertainty, constraints and feedback needs",
          "The same template for every project",
        ],
        1,
        "A method should serve the work and its risks rather than a label.",
      ),
      q(
        "In hybrid delivery, integration requires:",
        [
          "No common decisions",
          "Explicit interfaces, acceptance and decision rights",
          "Separate teams that never communicate",
        ],
        1,
        "Different cadences still need coordinated decisions and integration evidence.",
      ),
    ],
  },
  {
    id: "ai",
    title: "Use AI responsibly in project work",
    area: "Adaptive & digital delivery",
    level: "Practitioner",
    minutes: 15,
    objective:
      "Choose useful AI assistance while retaining evidence, privacy and human accountability.",
    explanation:
      "AI can help draft plans, summarise approved material and explore options. Generated text can contain invented facts, biased assumptions and unsupported calculations. A convincing explanation is not verification. Treat the system as an assistant: define the task, permitted data, quality criteria, reviewer and evidence needed before using an output in a decision.",
    steps: [
      "Check organisational policy and approved tools before entering personal, confidential or contractual data.",
      "Provide the minimum authorised context; request assumptions, uncertainty and traceable references.",
      "Verify sources, calculations and omissions independently; record the human review and decision.",
    ],
    scenario: {
      context:
        "An AI draft invents a supplier lead time and presents it as a confirmed quotation.",
      decision:
        "Remove the unsupported claim, obtain supplier evidence and mark any interim assumption explicitly.",
      reason:
        "Fluent text does not establish provenance. Unverified lead times could invalidate procurement and schedule decisions.",
    },
    pitfall:
      "Uploading sensitive project records to an unapproved tool or accepting fabricated references because they look plausible.",
    apply:
      "Draft an AI review checklist covering data permission, factual checks, bias, calculations and the accountable reviewer.",
    terms: ["assumption", "data-quality", "risk"],
    questions: [
      q(
        "An AI produces a detailed cost estimate without sources. You should:",
        [
          "Approve it because it is detailed",
          "Verify quantities, rates and assumptions against authorised evidence",
          "Treat its precision as confidence",
        ],
        1,
        "Precision and fluency do not establish factual accuracy or a valid estimate basis.",
      ),
      q(
        "Who remains accountable for a project decision supported by AI?",
        [
          "The model",
          "The authorised human decision maker",
          "Nobody if a disclaimer is shown",
        ],
        1,
        "AI assistance does not replace governance, professional judgement or accountability.",
      ),
    ],
  },
  {
    id: "data",
    title: "Build dashboards that support decisions",
    area: "Evidence & benefits",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Choose credible indicators, distinguish signals and avoid misleading charts.",
    explanation:
      "A useful metric has a decision purpose, definition, owner, source, refresh cadence and limitations. Leading indicators suggest future conditions; lagging indicators report observed results. Correlation does not establish causation, and a red/amber/green label without a threshold or trend is weak evidence. Segment results when averages conceal materially different experiences.",
    steps: [
      "Start with the management question and the action the measure should inform.",
      "Document units, denominator, status date, source and quality checks.",
      "Present trend, uncertainty and exceptions; investigate changes before making causal claims.",
    ],
    scenario: {
      context:
        "An average response time improves while rural users’ response times worsen.",
      decision:
        "Break out the relevant user groups and examine access, sample size and service mix.",
      reason:
        "An aggregate improvement can conceal a harmful shift for a subgroup.",
    },
    pitfall:
      "Optimising a target while ignoring the behaviour it encourages, such as closing tickets prematurely.",
    apply:
      "Write a metric definition with its decision, denominator, source, owner, cadence and counter-metric.",
    terms: [
      "key-performance-indicator",
      "indicator",
      "key-performance-indicator",
      "data-quality",
    ],
    questions: [
      q(
        "Which makes a KPI most actionable?",
        [
          "A decorative colour",
          "A clear definition, decision threshold, owner and response",
          "A large count with no denominator",
        ],
        1,
        "Actionable evidence links measurement to responsibility and a decision.",
      ),
      q(
        "Two indicators move together. Does this prove causation?",
        [
          "Yes",
          "No; alternative explanations need investigation",
          "Only if the chart is green",
        ],
        1,
        "Correlation may reflect confounding, chance or reverse causality.",
      ),
    ],
  },
  {
    id: "benefits",
    title: "Evaluate outcomes and sustain benefits",
    area: "Evidence & benefits",
    level: "Advanced",
    minutes: 14,
    objective: "Use a theory of change and credible evaluation evidence.",
    explanation:
      "A theory of change explains how activities and outputs are expected to contribute to outcomes and impact, including assumptions and context. Monitoring tracks defined measures; evaluation investigates relevance, effectiveness and other explicit questions. Attribution asks what an intervention caused; contribution examines its plausible role among other influences. Baselines alone do not establish a counterfactual.",
    steps: [
      "Map the causal logic and assumptions with stakeholders.",
      "Choose feasible indicators and an evaluation design proportionate to the claim and resources.",
      "Assign post-handover ownership, review unintended effects and adapt based on evidence.",
    ],
    scenario: {
      context:
        "Farm yields rise after training, but rainfall also improves and new seed is introduced.",
      decision:
        "Investigate these influences and use an appropriate comparison or contribution approach before claiming the training caused the whole increase.",
      reason:
        "Before-and-after change alone cannot separate the programme’s effect from other causes.",
    },
    pitfall:
      "Calling every observed positive change “impact” without a defensible causal explanation.",
    apply:
      "Draw a short theory of change with two assumptions, one unintended effect and an evaluation question.",
    terms: [
      "theory-of-change",
      "baseline",
      "contribution-analysis",
      "evaluation",
    ],
    questions: [
      q(
        "A before-and-after increase by itself establishes:",
        [
          "The project caused all the change",
          "An observed change requiring further causal investigation",
          "A valid counterfactual",
        ],
        1,
        "Other influences may explain some or all of the difference.",
      ),
      q(
        "Who should own benefit tracking after project closure?",
        [
          "Nobody",
          "The assigned operational or benefits owner",
          "Only the supplier forever",
        ],
        1,
        "Benefits often emerge after delivery and need explicit continuing ownership.",
      ),
    ],
  },
  {
    id: "procurement",
    title: "Procure for value and manage suppliers",
    area: "Finance & commercial",
    level: "Practitioner",
    minutes: 14,
    objective: "Evaluate whole-life value and manage contract performance.",
    explanation:
      "Procurement converts a business need into an appropriate sourcing and contracting decision. Evaluation criteria should be clear before bids are assessed. Whole-life value includes relevant acquisition, operating, maintenance, risk and disposal costs. The cheapest bid can be poor value when assumptions, service levels or delivery risk differ. Contract terms and governing rules determine actual rights and remedies.",
    steps: [
      "Define outcomes, specifications, market constraints and a transparent evaluation approach.",
      "Assess compliant offers using declared criteria, due diligence and whole-life assumptions.",
      "Assign contract management, monitor obligations and document changes through authorised channels.",
    ],
    scenario: {
      context:
        "A pump costs less upfront but requires expensive imported parts with long delivery times.",
      decision:
        "Compare lifecycle cost, reliability, service support and supply exposure using stated assumptions.",
      reason:
        "The investment affects recurring operating cost and availability, not only the purchase price.",
    },
    pitfall:
      "Changing bid criteria after seeing offers or assuming an Incoterm covers every ownership and payment question.",
    apply:
      "Create a supplier scorecard with delivery, quality, service, risk and cost measures.",
    terms: [
      "total-cost-of-ownership",
      "supplier-performance-management",
      "contract-management",
    ],
    questions: [
      q(
        "Which comparison best supports value for money?",
        [
          "Purchase price alone",
          "Relevant lifecycle costs, performance and risk under stated assumptions",
          "Whichever offer is received first",
        ],
        1,
        "A defensible evaluation considers the full requirement and declared criteria.",
      ),
      q(
        "A requested contract change should be:",
        [
          "Handled by informal verbal agreement only",
          "Assessed and authorised under the contract and governance rules",
          "Assumed to be free",
        ],
        1,
        "Contract changes can affect price, time, obligations and rights.",
      ),
    ],
  },
  {
    id: "operations",
    title: "Design operations around demand and constraints",
    area: "Operations & resilience",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Balance capacity, queues and bottlenecks across a service or process.",
    explanation:
      "Operations management coordinates recurring value delivery. Design capacity is a theoretical ceiling; effective capacity reflects practical conditions. A bottleneck constrains system throughput. Raising local utilisation can increase queues and delays without increasing total output. Variability and unreliable handoffs make maximum utilisation a risky service target.",
    steps: [
      "Map demand, process steps, rework loops and resource capacity in compatible units.",
      "Locate the current constraint and protect its productive time.",
      "Test changes using end-to-end throughput, service time, quality and cost rather than one team’s utilisation.",
    ],
    scenario: {
      context:
        "A clinic has consultation capacity of 60 patients/day but laboratory capacity of 35 for the required pathway.",
      decision:
        "Investigate and improve the laboratory constraint before increasing consultation bookings indiscriminately.",
      reason:
        "Extra arrivals can grow the queue without increasing completed end-to-end service.",
    },
    pitfall:
      "Declaring every resource should be 100% busy regardless of variability, service targets and downstream capacity.",
    apply:
      "Map one recurring service and estimate its demand, effective capacity and constraining step.",
    terms: ["bottleneck", "effective-capacity", "capacity-utilisation"],
    questions: [
      q(
        "Improving a non-constraining step always increases system throughput.",
        [
          "True",
          "False; the system constraint may remain unchanged",
          "Only when local utilisation exceeds 90%",
        ],
        1,
        "Local speed does not necessarily increase end-to-end output.",
      ),
      q(
        "Queues are growing while completions stay constant. Investigate:",
        [
          "Only presentation design",
          "Demand, variability, capacity and the current constraint",
          "Whether everyone has more tasks",
        ],
        1,
        "Flow depends on the balance of arrivals, service and system constraints.",
      ),
    ],
  },
  {
    id: "inventory",
    title: "Set inventory policies and manage supply exposure",
    area: "Operations & resilience",
    level: "Practitioner",
    minutes: 14,
    objective:
      "Choose replenishment rules using demand, lead time and service trade-offs.",
    explanation:
      "Inventory protects service against mismatches in timing and uncertainty but ties up cash and creates obsolescence and storage risks. Reorder point equals expected demand during lead time plus safety stock under the stated policy. Safety stock depends on variability, service objectives and replenishment assumptions. ABC classification is a prioritisation tool, not a complete measure of criticality.",
    steps: [
      "Segment items by value, demand behaviour, criticality and supply risk.",
      "Define lead times, inventory position, service target and replenishment rules.",
      "Review stockouts, expiry, carrying cost and supplier variation together.",
    ],
    scenario: {
      context:
        "Demand is 20 units/day, lead time is 5 days and the chosen safety stock is 30 units.",
      decision:
        "Under this simple policy, use a reorder point of 130 units and review whether the lead-time and demand assumptions hold.",
      reason:
        "20 × 5 + 30 = 130. This is not an order quantity or a universal optimal stock level.",
    },
    pitfall:
      "Applying the basic EOQ formula when demand is highly variable or quantity discounts and constraints dominate.",
    apply:
      "Write a replenishment rule for one critical item, including its review trigger and service trade-off.",
    terms: [
      "reorder-point",
      "safety-stock",
      "inventory-position",
      "economic-order-quantity",
    ],
    questions: [
      q(
        "For demand 20/day, lead time 5 days and safety stock 30, reorder point is:",
        ["100", "130", "150"],
        1,
        "Expected lead-time demand is 100; adding 30 gives 130 units.",
      ),
      q(
        "A low-value item can still be operationally critical.",
        ["True", "False", "Only if imported"],
        0,
        "Financial ABC value alone does not capture downtime, safety or service consequences.",
      ),
    ],
  },
  {
    id: "lean",
    title: "Solve problems with Lean and evidence",
    area: "Quality & improvement",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Test countermeasures against root causes and sustain improvements.",
    explanation:
      "Lean focuses on value and the flow of work while reducing waste. Structured problem solving begins with an observed gap and a credible understanding of the current condition. A root-cause hypothesis needs evidence; asking “why” five times does not make it true. PDCA and small experiments reduce the risk of implementing a persuasive but ineffective solution.",
    steps: [
      "Describe the problem and current condition at the place where work happens.",
      "Investigate causes with evidence and choose a testable countermeasure.",
      "Check the result, standardise what works and define monitoring to prevent recurrence.",
    ],
    scenario: {
      context:
        "Late dispatches are blamed on slow staff, but timestamps show most delay occurs waiting for approval.",
      decision:
        "Observe the approval queue, test a proportionate change to decision rules and measure dispatch time and error rates.",
      reason:
        "Evidence points toward a system delay; blaming effort would miss the mechanism.",
    },
    pitfall:
      "Treating a proposed solution as the problem statement or changing many factors without learning which mattered.",
    apply:
      "Create a one-page A3 with the gap, evidence, cause hypothesis, experiment and check date.",
    terms: ["lean", "pdca-cycle", "a3-problem-solving", "root-cause-analysis"],
    questions: [
      q(
        "Which is a problem statement?",
        [
          "Buy a new approval system",
          "Dispatch lead time exceeds the agreed target in the measured period",
          "Staff need to work harder",
        ],
        1,
        "A problem statement describes the observed gap before choosing a solution.",
      ),
      q(
        "After a successful pilot, what supports sustained improvement?",
        [
          "No further observation",
          "Standard work, ownership and continuing checks",
          "Deleting all baseline data",
        ],
        1,
        "A successful test needs adoption and monitoring to persist.",
      ),
    ],
  },
  {
    id: "reliability",
    title: "Manage reliability, maintenance and continuity",
    area: "Operations & resilience",
    level: "Advanced",
    minutes: 14,
    objective:
      "Connect failure measures to maintenance and service recovery decisions.",
    explanation:
      "Reliability, availability and maintainability answer different questions. Under a suitable repairable-system model, availability can be approximated by MTBF/(MTBF+MTTR). State which failures, repair times and operating periods are included. Business continuity prepares priority activities to continue or recover after disruption; a backup alone is not a tested recovery capability.",
    steps: [
      "Identify critical assets, failure modes and service consequences.",
      "Choose preventive, condition-based or other maintenance using failure behaviour and cost of failure.",
      "Test recovery roles, dependencies, communications and evidence against agreed objectives.",
    ],
    scenario: {
      context:
        "A service has MTBF 90 hours and MTTR 10 hours under the selected measurement definitions.",
      decision:
        "Estimate model availability at 90%, then investigate whether the model and downtime exclusions match the service decision.",
      reason:
        "90/(90+10) = 0.90. Reducing repair time or failures can improve availability, but the operational evidence must support the choice.",
    },
    pitfall:
      "Reporting availability while excluding major downtime without explaining the measurement boundary.",
    apply:
      "Document one failure mode, preventive action, recovery owner and a practical continuity test.",
    terms: [
      "availability",
      "mean-time-between-failures",
      "mean-time-to-repair",
      "business-continuity",
    ],
    questions: [
      q(
        "MTBF 90 hours and MTTR 10 hours give model availability:",
        ["10%", "90%", "99%"],
        1,
        "90 divided by 100 equals 90% under the stated model.",
      ),
      q(
        "A backup is enough to establish recovery capability.",
        [
          "True",
          "False; restoration, roles and dependencies need testing",
          "Only if stored offsite",
        ],
        1,
        "Recovery requires usable data, systems, people, access and a demonstrated restoration process.",
      ),
    ],
  },
  {
    id: "sustainability",
    title: "Include sustainability and responsible delivery",
    area: "Strategy & value",
    level: "Practitioner",
    minutes: 12,
    objective:
      "Translate environmental and social considerations into evidenced decisions.",
    explanation:
      "Responsible delivery examines lifecycle effects on people, environment and economic value. An SDG label does not establish a contribution. Define relevant impacts, measurement boundaries, trade-offs and affected stakeholders. Procurement, working conditions, accessibility, waste and long-term operating cost can materially change which option is appropriate.",
    steps: [
      "Identify material impacts and applicable organisational or legal obligations.",
      "Compare options over their lifecycle, including social and environmental effects and data limitations.",
      "Assign owners and measures, engage affected people and report evidenced progress and trade-offs.",
    ],
    scenario: {
      context:
        "A cheaper generator has higher fuel use and creates noise close to a school.",
      decision:
        "Compare feasible alternatives across lifecycle cost, reliability, emissions, noise and stakeholder effects.",
      reason:
        "An upfront price comparison excludes significant operating and community consequences.",
    },
    pitfall:
      "Claiming a project is sustainable merely because it mentions an SDG or uses one environmental metric.",
    apply:
      "Add one material social and one environmental criterion to an upcoming decision, with a credible evidence source.",
    terms: [
      "sustainable-procurement",
      "social-value",
      "sustainable-development-goals",
    ],
    questions: [
      q(
        "Which supports a credible sustainability claim?",
        [
          "A green icon",
          "Defined boundaries, measures and evidence of relevant effects",
          "An SDG number without analysis",
        ],
        1,
        "A claim needs a specific scope and evidence rather than a label.",
      ),
      q(
        "Lifecycle decisions should consider:",
        [
          "Only purchase cost",
          "Relevant operating, disposal, environmental and social effects as well as acquisition",
          "Only the supplier’s marketing",
        ],
        1,
        "Consequences extend beyond the initial purchase and project closure.",
      ),
    ],
  },
  {
    id: "handover",
    title: "Close delivery and enable operational adoption",
    area: "Leadership & governance",
    level: "Practitioner",
    minutes: 12,
    objective: "Hand over a usable capability with ownership and learning.",
    explanation:
      "Closure confirms the agreed completion status and resolves or transfers remaining obligations. Operational readiness includes trained people, support, procedures, access, maintenance and funding. Acceptance and handover are related but distinct decisions. Lessons become useful when a named owner changes future practice, not merely when a report is archived.",
    steps: [
      "Confirm acceptance evidence, contract obligations and treatment of open items.",
      "Verify operational readiness, support arrangements, ownership and benefit measurement.",
      "Capture lessons with context, evidence and an action owner; close access and records appropriately.",
    ],
    scenario: {
      context:
        "A facility passes construction inspection, but operators have no maintenance training or operating budget.",
      decision:
        "Escalate readiness gaps and agree accountable actions before treating the service as fully operational.",
      reason:
        "Physical completion does not establish a sustainable operating capability.",
    },
    pitfall:
      "Declaring success at technical completion while leaving support and benefit ownership undefined.",
    apply:
      "Write a handover checklist covering acceptance, people, procedures, support, open issues and benefits.",
    terms: [
      "handover",
      "change-readiness",
      "lessons-learned-register",
      "project-closure-report",
    ],
    questions: [
      q(
        "Technical acceptance alone establishes full operational readiness.",
        [
          "True",
          "False; people, processes, support and funding may still be missing",
          "Only for software",
        ],
        1,
        "A usable service requires an operating capability beyond the accepted asset.",
      ),
      q(
        "Which lesson is most actionable?",
        [
          "Communication was poor",
          "For the next rollout, the operations lead will validate site readiness two weeks before mobilisation",
          "Everything went well",
        ],
        1,
        "An actionable lesson identifies a concrete change, owner and context.",
      ),
    ],
  },
];
export const learningPaths = [
  {
    id: "restart",
    title: "Refresh the essentials",
    description: "Rebuild the core habits from business case to handover.",
    lessons: ["value", "governance", "scope", "schedule", "risk", "handover"],
  },
  {
    id: "control",
    title: "Planning, cost & control",
    description:
      "Practise estimates, forecasts and defensible change decisions.",
    lessons: ["scope", "schedule", "estimation", "cost", "evm", "change"],
  },
  {
    id: "adaptive",
    title: "Modern adaptive delivery",
    description: "Use feedback, flow, tailoring and responsible AI.",
    lessons: ["agile", "flow", "hybrid", "ai", "data"],
  },
  {
    id: "leadership",
    title: "Lead people & decisions",
    description: "Connect authority, engagement, adoption and lasting value.",
    lessons: ["governance", "stakeholders", "change", "benefits", "handover"],
  },
  {
    id: "ops",
    title: "Operations & supply resilience",
    description: "Improve recurring work, supply, quality and recovery.",
    lessons: [
      "operations",
      "inventory",
      "procurement",
      "lean",
      "reliability",
      "quality",
    ],
  },
  {
    id: "value-impact",
    title: "Evidence, impact & sustainability",
    description: "Make outcome and sustainability claims you can support.",
    lessons: ["value", "data", "benefits", "sustainability", "ai"],
  },
] as const;
export const learningReviewed = "2026-11-02";
export const currentGuidance = [
  {
    id: "pmbok8",
    title: "PMBOK Guide — Eighth Edition",
    status: "Published guidance",
    detail:
      "PMI lists the Eighth Edition as published in November 2025, with a second-printing errata update in April 2026. Use the current guide and errata when comparing approaches; this hub provides original learning summaries, not the standard text.",
    action:
      "Refresh value delivery and tailoring, then compare your organisation’s methods with the official guide.",
    lessons: ["value", "hybrid"],
    url: "https://www.pmi.org/standards/pmbok",
    source: "Project Management Institute",
  },
  {
    id: "pmp2026",
    title: "PMP exam update — July 2026",
    status: "Current exam guidance",
    detail:
      "PMI’s update page describes a July 2026 exam change, including attention to AI, sustainability and stakeholder engagement. Use its 2026 Exam Content Outline to check the actual assessment requirements.",
    action:
      "Refresh responsible AI, stakeholder engagement and sustainability. These practice questions are original and are not official exam questions or a complete exam preparation course.",
    lessons: ["ai", "stakeholders", "sustainability"],
    url: "https://www.pmi.org/certifications/project-management-pmp/new-exam",
    source: "Project Management Institute",
  },
  {
    id: "training",
    title: "Upcoming PMP live-training eligibility change",
    status: "Announced change · effective 1 December 2026",
    detail:
      "PMI’s page announces a change to eligible live training from 1 December 2026 and explains treatment of training completed earlier. Check the official details and your dates before choosing a provider. This knowledge hub does not award eligible training hours or PDUs.",
    action:
      "If you are pursuing PMP certification, verify current eligibility and training rules directly with PMI.",
    lessons: ["governance"],
    url: "https://www.pmi.org/certifications/project-management-pmp/new-exam",
    source: "Project Management Institute",
  },
  {
    id: "kanban2025",
    title: "Kanban references — distinguish the two guides",
    status: "Published guidance",
    detail:
      "Kanban Guides identifies The Kanban Guide (May 2025) and the expanded Open Guide to Kanban (July 2025) as separate publications. Choose and name the reference your team uses rather than treating them as identical.",
    action:
      "Refresh workflow definitions, WIP, throughput, work-item age and cycle time.",
    lessons: ["flow", "operations"],
    url: "https://kanbanguides.org/",
    source: "Kanban Guides",
  },
  {
    id: "scrum2020",
    title: "Scrum — use the official November 2020 guide",
    status: "Official reference checked",
    detail:
      "The official HTML guide identifies itself as the November 2020 Scrum Guide. A recent blog or course date does not itself establish a new edition of Scrum.",
    action:
      "Revisit the Product Goal, Sprint Goal, Definition of Done and empiricism using the official reference.",
    lessons: ["agile", "hybrid"],
    url: "https://scrumguides.org/scrum-guide.html",
    source: "Scrum Guides",
  },
  {
    id: "ai-rmf",
    title: "Generative AI risk management",
    status: "Official resource checked",
    detail:
      "NIST’s AI Risk Management Framework page links the Generative AI Profile released on 26 July 2024. Use it to structure questions about AI-specific risks alongside organisational policy and human oversight.",
    action:
      "Practise verifying AI claims, controlling sensitive data and documenting accountable decisions.",
    lessons: ["ai", "risk", "data"],
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    source: "National Institute of Standards and Technology",
  },
];

const studySources = {
  pmi: {
    name: "PMI — project management standards",
    url: "https://www.pmi.org/standards",
  },
  apm: {
    name: "APM — professional glossary",
    url: "https://www.apm.org.uk/resources/glossary/",
  },
  scrum: {
    name: "The Scrum Guide",
    url: "https://scrumguides.org/scrum-guide.html",
  },
  kanban: { name: "Kanban Guides", url: "https://kanbanguides.org/" },
  quality: {
    name: "ASQ — quality resources",
    url: "https://asq.org/quality-resources/quality-glossary",
  },
  lean: {
    name: "Lean Enterprise Institute — lexicon",
    url: "https://www.lean.org/explore-lean/lexicon-terms/",
  },
  supply: {
    name: "Association for Supply Chain Management",
    url: "https://www.ascm.org/",
  },
  cips: {
    name: "Chartered Institute of Procurement & Supply",
    url: "https://www.cips.org/",
  },
  oecd: {
    name: "OECD — evaluation criteria",
    url: "https://www.oecd.org/en/topics/sub-issues/development-co-operation-evaluation-and-effectiveness/evaluation-criteria.html",
  },
  nist: {
    name: "NIST — AI Risk Management Framework",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  sdg: {
    name: "UN — Sustainable Development Goals",
    url: "https://sdgs.un.org/goals",
  },
  sre: {
    name: "Google — Site Reliability Engineering",
    url: "https://sre.google/sre-book/table-of-contents/",
  },
};
export function lessonResources(id: string) {
  const keys: Record<string, (keyof typeof studySources)[]> = {
    agile: ["scrum", "pmi"],
    flow: ["kanban", "lean"],
    hybrid: ["pmi", "scrum"],
    ai: ["nist", "pmi"],
    quality: ["quality"],
    lean: ["lean", "quality"],
    procurement: ["cips", "supply"],
    inventory: ["supply", "lean"],
    operations: ["supply", "lean"],
    reliability: ["sre", "quality"],
    benefits: ["oecd", "pmi"],
    data: ["oecd", "quality"],
    sustainability: ["sdg", "pmi"],
  };
  return (keys[id] || ["pmi", "apm"]).map((key) => studySources[key]);
}
