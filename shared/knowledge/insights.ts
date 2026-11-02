/** Original practical guidance for existing entries, plus explicit concept distinctions. */
type Insight = {
  example: string;
  practicalUse: string;
  pitfall: string;
  reviewed?: string;
  formula?: string;
  assumptions?: string;
};
const insight = (
  example: string,
  practicalUse: string,
  pitfall: string,
): Insight => ({ example, practicalUse, pitfall, reviewed: "2026-11-02" });
export const termInsights: Record<string, Insight> = {
  project: insight(
    "A time-limited warehouse relocation is a project; the continuing dispatch operation is not.",
    "Define the intended change, boundaries, authority and transition to operations.",
    "Temporary does not mean short, and unique does not mean every activity is novel.",
  ),
  programme: insight(
    "A rural health programme coordinates facilities, staffing and operating changes to improve access.",
    "Manage cross-project dependencies and the organisational changes needed for benefits.",
    "A group of unrelated projects is not automatically a programme.",
  ),
  portfolio: insight(
    "A portfolio combines service improvements and capital investments selected against shared strategic priorities.",
    "Reassess the mix against strategy, capacity, risk and changing evidence.",
    "Project-level success does not automatically create the best overall investment mix.",
  ),
  output: insight(
    "A completed training session is an output; changed practice is an outcome requiring separate evidence.",
    "Track delivery and separately test whether the intended change occurs.",
    "Do not claim an outcome merely because a deliverable was accepted.",
  ),
  outcome: insight(
    "Faster case processing follows adoption of a new workflow; software installation alone is an output.",
    "Define a baseline, measure, timeframe and owner for the intended change.",
    "Observed change does not by itself establish that the project caused it.",
  ),
  impact: insight(
    "A livelihood intervention investigates longer-term household effects alongside other contributing factors.",
    "Use a credible causal explanation and evaluation design appropriate to the claim.",
    "Longer-term impact cannot be inferred from attendance or spending alone.",
  ),
  "business-case": insight(
    "A board compares refurbishment, replacement and a do-minimum option with lifecycle assumptions.",
    "Revisit whether the remaining investment is justified when critical assumptions change.",
    "Sunk spending is not a sufficient reason to continue.",
  ),
  "benefits-realisation": insight(
    "An operations owner tracks whether a new process actually reduces verified turnaround times.",
    "Assign benefit ownership and measurement beyond the delivery team's closure date.",
    "A benefit forecast is not evidence of realised value.",
  ),
  risk: insight(
    "Possible seasonal flooding threatens site access before mobilisation.",
    "Record cause, uncertain event, consequence, owner, response and trigger.",
    "An event that has already occurred also needs issue management.",
  ),
  issue: insight(
    "A permit refusal has already stopped the planned site work.",
    "Assign a response, owner and escalation deadline while considering further risks.",
    "Renaming an occurred problem as a risk can defer necessary action.",
  ),
  assumption: insight(
    "A plan assumes a supplier can deliver in six weeks pending actual confirmation.",
    "Name an owner, evidence needed and a date for testing important assumptions.",
    "An assumption is not a verified fact or an imposed constraint.",
  ),
  constraint: insight(
    "A fixed possession window restricts when railway work can be performed.",
    "Model its real effect and identify who can authorise a change if it is negotiable.",
    "Distinguish a genuine external limit from an untested planning preference.",
  ),
  "quality-assurance": insight(
    "An assurance review checks whether the process and responsibilities support reliable inspection evidence.",
    "Examine process design and operation before relying solely on end-stage testing.",
    "Assurance does not mean every output has been inspected or is defect-free.",
  ),
  "quality-control": insight(
    "A batch is tested against agreed acceptance criteria before release.",
    "Specify checks, evidence, competent responsibility and treatment of failures.",
    "Inspection alone cannot correct an incapable underlying process.",
  ),
  verification: insight(
    "Testing confirms a pump achieves its specified flow under the agreed conditions.",
    "Trace requirements to test evidence and address any nonconformities.",
    "Meeting a specification does not prove the specification addresses the user's need.",
  ),
  validation: insight(
    "Users test whether the installed service actually works for the intended operating situation.",
    "Test relevant use conditions and obtain appropriate user or acceptance evidence.",
    "A successful technical test alone may not establish fitness for intended use.",
  ),
  "critical-path": insight(
    "With parallel paths of 10 and 12 days, the 12-day path governs earliest finish in a simple unconstrained network.",
    "Assess feasible acceleration and near-critical paths using an up-to-date network.",
    "The most expensive or visible activity is not necessarily critical.",
  ),
  "critical-chain": insight(
    "Two tasks share a specialist, so resource constraints change the feasible chain and buffer strategy.",
    "State resource assumptions and the method used to govern shared buffers.",
    "Critical-chain practice is more than renaming the critical path.",
  ),
  "resource-levelling": insight(
    "One crane serves two logically parallel tasks, so work is resequenced and completion may move.",
    "Resolve resource overloads and communicate the resulting dates and trade-offs.",
    "Levelling can change the critical path and project finish.",
  ),
  "resource-smoothing": insight(
    "Work is shifted within available float to reduce peaks while preserving the governing completion constraint.",
    "Check resource improvements against float, logic and the scheduling method.",
    "Smoothing cannot always eliminate all resource shortages.",
  ),
  duration: insight(
    "A task lasts three working days even though only one person-day of effort is needed.",
    "State calendar, working-time assumptions and resource availability.",
    "Elapsed duration and labour effort are different quantities.",
  ),
  effort: insight(
    "Two people each working four hours contribute eight person-hours of effort.",
    "Estimate work content separately from duration and productivity assumptions.",
    "Doubling people does not necessarily halve elapsed time.",
  ),
  "cycle-time": insight(
    "A case enters active processing on Monday and reaches the defined completion event on Thursday.",
    "Define start and finish consistently before comparing items or forecasting.",
    "Different teams may use cycle time for different boundaries.",
  ),
  "lead-time": insight(
    "A customer waits from request submission through the queue until the defined delivered result.",
    "Measure the full boundary relevant to the customer or decision.",
    "A shorter internal processing time may leave total waiting unchanged.",
  ),
  budget: insight(
    "An approved cost plan remains the reference while the current forecast predicts a higher final cost.",
    "Separate authorisation, baseline comparison, actuals and the latest expectation.",
    "Changing the forecast does not automatically authorise a budget change.",
  ),
  forecast: insight(
    "Current procurement evidence changes the expected completion cost without changing the approved baseline.",
    "Explain assumptions, status date and the reasons for changes since the previous forecast.",
    "A forecast is an estimate, not a new approval or a guarantee.",
  ),
  "cost-performance-index": insight(
    "Earned value 80,000 and actual cost 100,000 produce CPI 0.80.",
    "Use comparable scope, currency and status dates and challenge unreliable progress measures.",
    "Cost efficiency against budgeted work is not profit margin.",
  ),
  "schedule-performance-index": insight(
    "Earned value 80,000 against planned value 100,000 gives SPI 0.80.",
    "Use the schedule network to investigate actual time consequences and remaining work.",
    "SPI 0.80 does not establish an exact 20% calendar delay.",
  ),
  "estimate-at-completion": insight(
    "BAC 200,000 divided by CPI 0.80 yields a conditional forecast of 250,000.",
    "Choose a forecasting method matching the expected conditions of remaining work.",
    "BAC divided by CPI assumes current efficiency continues.",
  ),
  "cost-variance": insight(
    "EV 80,000 minus AC 100,000 gives an earned-value cost variance of −20,000.",
    "Explain the work actually earned alongside actual spending.",
    "Unspent budget is not necessarily a saving when planned work is incomplete.",
  ),
  procurement: insight(
    "A programme moves from a defined need through sourcing, award and contract performance oversight.",
    "Connect requirements, market analysis, transparent evaluation and contract management.",
    "Procurement is broader than placing an order or obtaining quotations.",
  ),
  sourcing: insight(
    "A team researches potential supply options and decides how to approach the market.",
    "Consider capability, competition, risk and relevant purchasing rules before selection.",
    "Sourcing alone does not cover every post-award obligation.",
  ),
  "contract-variation": insight(
    "An authorised change adds a site and requires assessment under the contract's valuation and time provisions.",
    "Check instruction authority, scope, notices and the commercial consequences.",
    "A variation and a claim are related but different concepts.",
  ),
  "fixed-price-contract": insight(
    "A supplier agrees a defined price for defined scope while specific change provisions still apply.",
    "Clarify scope, assumptions, allocation of risk and permitted adjustments.",
    "Fixed price does not mean no possible changes or no buyer risk.",
  ),
  "cost-reimbursable-contract": insight(
    "A buyer reimburses eligible documented costs with a defined fee under agreed controls.",
    "Define allowable costs, evidence, fee rules and appropriate oversight.",
    "Reimbursement is not necessarily unlimited payment for every cost incurred.",
  ),
  "local-content": insight(
    "A project checks applicable country and sector requirements for local participation and auditable evidence.",
    "Identify the actual obligations before setting supplier or workforce targets.",
    "There is no universal local-content rule for all African jurisdictions.",
  ),
  "community-engagement": insight(
    "Affected residents help identify access impacts before a site layout is selected.",
    "Provide accessible two-way engagement and record how evidence informs decisions.",
    "Consultation, representation and legally required consent are not interchangeable.",
  ),
  "exchange-rate": insight(
    "USD 10,000 costs NGN 15m at an illustrative 1,500 rate and NGN 16.5m at 1,650.",
    "State source, date, currency direction and scenario assumptions in forecasts.",
    "Illustrative rates are not current market quotations.",
  ),
  "safety-stock": insight(
    "A replenishment policy includes a defined buffer for uncertainty beyond expected lead-time demand.",
    "Connect the quantity to service objectives, variability and the policy model.",
    "One standard-deviation formula is not a universal stock rule.",
  ),
  "reorder-point": insight(
    "Demand of 20 units/day for five days plus safety stock of 30 gives a reorder point of 130 units.",
    "Use consistent units and specify whether the policy observes inventory position.",
    "A reorder trigger is not the order quantity.",
  ),
  "economic-order-quantity": insight(
    "A buyer explores the basic cost-balancing quantity under steady demand and stated holding and ordering costs.",
    "Test the model against constraints, discounts, variability and actual service needs.",
    "The basic EOQ model does not automatically optimise a complex supply chain.",
  ),
  "mean-time-to-repair": insight(
    "A team measures elapsed repair time under a stated start and restoration boundary.",
    "Define the population, included waiting and time boundary before comparing performance.",
    "MTTR can stand for different recovery or repair measures; specify the intended definition.",
  ),
  "overall-equipment-effectiveness": insight(
    "Availability 90%, performance 95% and quality 98% give OEE 83.79%.",
    "Use consistent component definitions and investigate the actual sources of loss.",
    "Multiply fractions, not whole percentages, when calculating the combined ratio.",
  ),
  "organisational-change-management": insight(
    "A workflow rollout includes role changes, engagement, training, support and evidence of adoption.",
    "Assess impacts and readiness and reinforce workable new behaviours after launch.",
    "Project delivery and course attendance do not alone establish adoption.",
  ),
  "change-readiness": insight(
    "A team assesses whether staff, supervisors and support processes can implement a proposed change.",
    "Investigate practical barriers, capacity and willingness before relying on a launch date.",
    "Readiness before launch is not proof of subsequent adoption.",
  ),
  "key-performance-indicator": insight(
    "A service tracks a defined response-time measure with an owner, threshold and agreed action.",
    "Specify denominator, source, refresh cadence, quality checks and decision purpose.",
    "A measure can be easy to count without being useful for a decision.",
  ),
  "monte-carlo-simulation": insight(
    "A schedule model samples uncertain durations repeatedly to explore a distribution of completion dates.",
    "Validate logic and input assumptions and explain correlation and excluded risks.",
    "More iterations do not correct a biased or incomplete model.",
  ),
  "business-continuity": insight(
    "A provider tests how priority services continue or recover during a major power or site disruption.",
    "Define priorities, dependencies, roles, communication and practical tests.",
    "A backup file or a generator alone is not a complete continuity capability.",
  ),
  "landed-cost": insight(
    "An importer includes relevant purchase, freight, duty and handling costs under the defined valuation boundary.",
    "Check actual contractual allocation, applicable charges and current country requirements.",
    "Incoterms do not determine every tax, title or payment obligation.",
  ),
  handover: insight(
    "A facility transfers with acceptance evidence, trained operators, support arrangements and tracked open items.",
    "Confirm operational ownership, readiness, records and ongoing benefits responsibilities.",
    "Technical completion alone does not establish a sustainable operating service.",
  ),
};
export const comparisonPairs: [string, string, string][] = [
  [
    "project",
    "programme",
    "A project delivers a bounded change; a programme coordinates related projects and organisational change to pursue benefits requiring joint management.",
  ],
  [
    "programme",
    "portfolio",
    "A programme coordinates related change and benefits. A portfolio selects and governs an investment mix for strategic objectives; its components need not share a delivery outcome.",
  ],
  [
    "output",
    "outcome",
    "An output is produced or delivered. An outcome is a resulting change in behaviour or performance and needs separate evidence.",
  ],
  [
    "outcome",
    "impact",
    "An outcome is a defined change associated with an intervention. Impact concerns broader or higher-level effects; causal claims need an appropriate evaluation basis.",
  ],
  [
    "risk",
    "issue",
    "A risk concerns uncertainty. An issue is a condition or event that has occurred and needs management; it can also create further risks.",
  ],
  [
    "assumption",
    "constraint",
    "An assumption is accepted provisionally and should be tested. A constraint is a limit affecting choices; check whether an apparent limit is genuine or negotiable.",
  ],
  [
    "quality-assurance",
    "quality-control",
    "Quality assurance examines confidence in processes and controls. Quality control checks outputs against requirements; one does not replace the other.",
  ],
  [
    "verification",
    "validation",
    "Verification asks whether specified requirements were met. Validation asks whether the result is fit for its intended use in context.",
  ],
  [
    "critical-path",
    "critical-chain",
    "A conventional critical path follows governing schedule logic and calendars. Critical-chain practice explicitly considers resource constraints and shared buffer management.",
  ],
  [
    "resource-levelling",
    "resource-smoothing",
    "Levelling adjusts work to resolve resource constraints and may move the finish date. Smoothing seeks improvements within available scheduling flexibility and constraints.",
  ],
  [
    "duration",
    "effort",
    "Duration measures elapsed or working time under a calendar. Effort measures resource work such as person-hours; resources and productivity connect them without a universal fixed ratio.",
  ],
  [
    "cycle-time",
    "lead-time",
    "Both are elapsed-time measures with context-dependent boundaries. Lead time often begins at a request; cycle time often begins when work starts. Define both before comparing.",
  ],
  [
    "takt-time",
    "cycle-time",
    "Takt time expresses the production pace required by demand. Cycle time measures elapsed processing or workflow time under the chosen boundary.",
  ],
  [
    "budget",
    "forecast",
    "A budget is an authorised plan or reference. A forecast is the current expectation based on evidence; it does not itself change spending authority.",
  ],
  [
    "cost-performance-index",
    "return-on-investment",
    "CPI compares earned value with actual cost against a baseline. ROI compares investment gain with investment cost under a stated model; CPI is not a profitability measure.",
  ],
  [
    "estimate-at-completion",
    "budget-at-completion",
    "BAC is the approved total budget for the defined work. EAC forecasts its final cost and can differ from the budget without changing that authorisation.",
  ],
  [
    "procurement",
    "sourcing",
    "Sourcing investigates and selects supply approaches. Procurement covers a broader lifecycle of meeting a purchasing need, including award and relevant contract oversight.",
  ],
  [
    "fixed-price-contract",
    "cost-reimbursable-contract",
    "Fixed-price arrangements establish a price basis for defined scope. Cost-reimbursable arrangements pay eligible costs under agreed rules; both can include important limits and adjustments.",
  ],
  [
    "construction-claim",
    "contract-variation",
    "A variation changes contractual work or requirements through an applicable mechanism. A claim requests an entitlement or remedy; it may arise from events beyond variations.",
  ],
  [
    "extension-of-time",
    "loss-and-expense",
    "An extension of time adjusts a completion obligation. Additional payment is a separate entitlement question governed by the contract and law; time relief does not automatically establish cost recovery.",
  ],
  [
    "interim-payment-certificate",
    "final-account",
    "An interim certificate concerns a payment assessment during the contract. A final account reconciles the defined overall financial position, including adjustments and unresolved matters.",
  ],
  [
    "practical-completion",
    "taking-over-certificate",
    "Practical completion is a status under certain frameworks. A taking-over certificate is a particular contractual record with defined effects; the applicable terms determine any relationship.",
  ],
  [
    "arbitration",
    "mediation",
    "An arbitral tribunal decides matters through an award under its legal framework. A mediator helps parties seek agreement and does not automatically impose an award.",
  ],
  [
    "adjudication",
    "arbitration",
    "These are different dispute-decision processes. Availability, procedure, enforceability and whether a decision is interim or final depend on the agreement and governing law.",
  ],
  [
    "portfolio-prioritisation",
    "portfolio-balancing",
    "Prioritisation compares relative importance or order. Balancing examines the combined mix across dimensions such as risk, timing and scarce capacity.",
  ],
  [
    "weighted-scoring-model",
    "portfolio-optimisation",
    "A scoring model ranks or evaluates against weighted criteria. Optimisation selects a combination under explicit objectives and constraints; neither removes judgement or weak evidence.",
  ],
  [
    "coaching",
    "mentoring",
    "Coaching commonly supports reflection and performance through questions and feedback. Mentoring commonly shares experience and perspective; real relationships can combine both.",
  ],
  [
    "change-readiness",
    "change-adoption",
    "Readiness assesses conditions for implementing change. Adoption concerns actual use and sustained behaviour after implementation.",
  ],
  [
    "change-adoption",
    "learning-transfer",
    "Adoption concerns use of a changed process or capability. Learning transfer concerns applying learning in work; training can support adoption but does not establish it.",
  ],
  [
    "continuous-integration",
    "continuous-delivery",
    "Continuous integration frequently merges and checks changes. Continuous delivery extends practices toward a reliably releasable state, with production release still potentially a separate decision.",
  ],
  [
    "continuous-delivery",
    "continuous-deployment",
    "Continuous delivery maintains release readiness. Continuous deployment automatically sends qualifying changes to production without a separate manual release decision.",
  ],
  [
    "change-lead-time",
    "lead-time",
    "DORA-style change lead time uses a defined code-change-to-production boundary. General lead time may span a customer request, purchasing process or other system boundary.",
  ],
  [
    "failed-deployment-recovery-time",
    "mean-time-to-repair",
    "Failed deployment recovery time focuses on recovery from failed production changes. MTTR is used for different repair or recovery populations and boundaries; define it before comparison.",
  ],
  [
    "retrieval-augmented-generation",
    "model-hallucination",
    "RAG supplies retrieved material to a generative model. It can support grounding but does not eliminate hallucination, stale sources or unsupported interpretation.",
  ],
  [
    "digital-twin",
    "building-information-modelling",
    "BIM concerns structured built-asset information and collaboration. A digital twin represents a physical system with relevant maintained data for defined decisions; implementations may overlap.",
  ],
  [
    "ai-governance",
    "human-in-the-loop-review",
    "AI governance defines policies, accountability and lifecycle oversight. Human review is one possible control and needs clear authority, competence and evidence.",
  ],
  [
    "process-batch",
    "transfer-batch",
    "A process batch is handled together before a production boundary such as a setup. A transfer batch moves onward together and can be smaller to reduce waiting.",
  ],
  [
    "available-to-promise",
    "capable-to-promise",
    "ATP considers supply available for commitment under a policy. CTP additionally evaluates relevant production and resource capability for a proposed commitment.",
  ],
  [
    "material-requirements-planning",
    "manufacturing-resource-planning",
    "MRP calculates time-phased material needs. MRP II integrates broader manufacturing resources and related planning information.",
  ],
  [
    "balking",
    "reneging",
    "Balking means not joining the queue. Reneging means joining and then leaving before receiving the intended service.",
  ],
  [
    "gross-margin-per-hectare",
    "profit-margin",
    "Agricultural gross margin per hectare subtracts specified variable costs and divides by land area. Profit margin uses a stated profit measure divided by revenue; cost coverage and units differ.",
  ],
  [
    "health-technology-assessment",
    "life-cycle-costing",
    "Lifecycle costing assesses relevant costs across a chosen boundary. HTA additionally evaluates appropriate clinical, organisational, ethical and other evidence for a health-technology decision.",
  ],
  [
    "post-harvest-loss",
    "inventory-obsolescence",
    "Post-harvest loss concerns quantity or quality reduction within a defined agricultural chain. Obsolescence concerns inventory losing usefulness or value, which need not involve physical loss.",
  ],
  [
    "local-content",
    "supplier-localisation",
    "Local content concerns participation or value under specified definitions and obligations. Supplier localisation is a sourcing strategy; using a nearby supplier does not automatically demonstrate compliance.",
  ],
  [
    "rules-of-origin",
    "preferential-tariff-treatment",
    "Origin rules help establish eligibility under a trade arrangement. Preferential treatment also depends on the relevant tariff schedule, implementation and required evidence.",
  ],
  [
    "community-engagement",
    "free-prior-and-informed-consent",
    "Engagement is continuing involvement and dialogue. FPIC is a particular consent-related standard applicable in defined contexts; general consultation does not automatically satisfy it.",
  ],
  [
    "land-tenure-due-diligence",
    "customary-land-rights",
    "Due diligence investigates the applicable rights and constraints. Customary rights are one possible category of interests requiring competent assessment under local law and context.",
  ],
  [
    "arrival-rate",
    "service-rate",
    "Arrival rate measures incoming workload per unit time. Service rate describes completion capability per server or resource under stated conditions; match units and populations.",
  ],
  [
    "rough-cut-capacity-planning",
    "capacity-requirements-planning",
    "Rough-cut planning checks critical capacity at a higher level. Capacity requirements planning calculates more detailed time-phased load using orders and routings; neither automatically resolves overloads.",
  ],
  [
    "optimism-bias",
    "planning-fallacy",
    "Optimism bias covers systematically favourable expectations. The planning fallacy specifically concerns underestimated work or time when the inside plan displaces relevant experience.",
  ],
];

export const metricInsights: Record<
  string,
  { formula: string; assumptions: string; example: string }
> = {
  "traffic-intensity": {
    formula: "For a basic identical-server queue: ρ = λ ÷ (c × μ)",
    assumptions:
      "λ is arrivals per unit time, μ is services per server per the same time unit, and c is the number of servers. Basic stable infinite-waiting models require λ < cμ; variability still creates waiting.",
    example:
      "Illustrative: 8 arrivals/hour and one server able to handle 10/hour give ρ = 0.8, or 80% average offered load.",
  },
  "single-server-queue": {
    formula: "For a stable M/M/1 model: mean queue wait Wq = λ ÷ [μ × (μ − λ)]",
    assumptions:
      "This formula assumes Poisson arrivals, independent exponential service times, one server, first-come-first-served service, unlimited waiting space and λ < μ. It is not valid for every single-server process.",
    example:
      "Illustrative: λ = 8/hour and μ = 10/hour give mean queue wait 0.4 hours, or 24 minutes, under the stated M/M/1 assumptions.",
  },
  "arrival-rate": {
    formula:
      "Observed average arrival rate = arrivals counted ÷ observation time",
    assumptions:
      "Use a positive observation period and a defined system boundary. A period average does not identify the arrival distribution, peak demand or time variation.",
    example:
      "Illustrative: 24 arrivals in two hours give an observed average of 12 arrivals/hour.",
  },
  "criticality-index": {
    formula:
      "Criticality index (%) = iterations in which activity is critical ÷ evaluated iterations × 100",
    assumptions:
      "Use a positive number of evaluated iterations and a consistent criticality definition. This is a model statistic, not a guarantee or a complete measure of delay consequence.",
    example:
      "Illustrative: an activity is critical in 600 of 1,000 simulated iterations, giving a criticality index of 60%.",
  },
  "buffer-penetration": {
    formula:
      "One measure: buffer penetration (%) = time buffer consumed ÷ original time buffer × 100",
    assumptions:
      "The original buffer must be positive and the management method must define consumption consistently. Values above 100% indicate use beyond the original allowance.",
    example:
      "Illustrative: consuming three days of a six-day buffer gives 50% penetration; interpret it alongside progress on the protected work.",
  },
  "weighted-scoring-model": {
    formula:
      "One additive model: total score = Σ (criterion weight × criterion score)",
    assumptions:
      "Use compatible score scales and stated weights. If weights sum to one, the weighted result remains on the common score scale. Test sensitivity and avoid double-counting criteria.",
    example:
      "Illustrative: value score 4 at weight 0.6 and deliverability score 3 at weight 0.4 produce a weighted score of 3.6 on the common scale.",
  },
  "gross-margin-per-hectare": {
    formula:
      "Gross margin/ha = (enterprise revenue − specified variable costs) ÷ relevant hectares",
    assumptions:
      "Use a positive area, a consistent crop period and currency, and explicit included costs. Fixed costs, finance and other excluded charges mean this is not necessarily net profit.",
    example:
      "Illustrative: revenue 230,000 less specified variable costs 150,000 across two hectares gives gross margin 40,000 per hectare.",
  },
  "deployment-frequency": {
    formula:
      "One period measure: deployment frequency = production deployments ÷ observation time",
    assumptions:
      "Define the service, environment, deployment event and time unit. Compare like contexts and interpret frequency alongside stability, value and other delivery measures.",
    example:
      "Illustrative: ten qualifying production deployments over five elapsed days give an average of two deployments/day.",
  },
  "change-fail-rate": {
    formula:
      "Change fail rate (%) = deployments requiring immediate intervention ÷ total deployments × 100",
    assumptions:
      "Use a positive denominator, the same service and observation period, and a consistent intervention definition. This measure does not capture every kind of service failure.",
    example:
      "Illustrative: three of 20 deployments require immediate intervention, giving a change fail rate of 15%.",
  },
  "deployment-rework-rate": {
    formula:
      "Deployment rework rate (%) = qualifying unplanned incident-related deployments ÷ total deployments × 100",
    assumptions:
      "Use a positive denominator, consistent event classification and the same service and period. Identify unplanned deployments arising from production incidents rather than classifying all maintenance as rework.",
    example:
      "Illustrative: two of 20 deployments are qualifying unplanned incident-related rework, giving a rate of 10%.",
  },
  "tax-gross-up": {
    formula:
      "For one flat deduction on the gross amount: gross payment = required net payment ÷ (1 − deduction rate)",
    assumptions:
      "This simplified calculation assumes a single applicable rate from zero up to but not including one, and a contractual requirement to preserve the net payment. Actual tax rules, treaties, deductibility and multiple taxes may change the analysis.",
    example:
      "Illustrative only: net 100 with a hypothetical single 10% deduction gives gross 111.11 before rounding reconciliation. This is not a country-specific tax rate or advice.",
  },
};
