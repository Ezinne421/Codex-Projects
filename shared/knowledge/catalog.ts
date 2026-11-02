/** Original plain-language summaries; references are further reading, not quotations. */
export type KnowledgeTerm = {
  id: string;
  name: string;
  category: string;
  definition: string;
  aliases: string[];
  formula?: string;
  assumptions?: string;
  example?: string;
  related: string[];
  sources: string[];
};
export const knowledgeSources = {
  apm: {
    name: "Association for Project Management — glossary",
    url: "https://www.apm.org.uk/resources/glossary/",
  },
  pmi: {
    name: "Project Management Institute — standards",
    url: "https://www.pmi.org/standards",
  },
  scrum: {
    name: "The Scrum Guide",
    url: "https://scrumguides.org/scrum-guide.html",
  },
  kanban: { name: "The Kanban Guide", url: "https://kanbanguides.org/" },
  asq: {
    name: "American Society for Quality — glossary",
    url: "https://asq.org/quality-resources/quality-glossary",
  },
  lean: {
    name: "Lean Enterprise Institute — lexicon",
    url: "https://www.lean.org/explore-lean/lexicon-terms/",
  },
  ascm: {
    name: "Association for Supply Chain Management",
    url: "https://www.ascm.org/",
  },
  cips: {
    name: "Chartered Institute of Procurement & Supply",
    url: "https://www.cips.org/",
  },
  iso: {
    name: "International Organization for Standardization — standards",
    url: "https://www.iso.org/standards.html",
  },
  oecd: {
    name: "OECD — evaluation criteria",
    url: "https://www.oecd.org/en/topics/sub-issues/development-co-operation-evaluation-and-effectiveness/evaluation-criteria.html",
  },
  sre: {
    name: "Google — Site Reliability Engineering",
    url: "https://sre.google/sre-book/table-of-contents/",
  },
  nist: {
    name: "NIST — computer security glossary",
    url: "https://csrc.nist.gov/glossary",
  },
  sdg: {
    name: "United Nations — Sustainable Development Goals",
    url: "https://sdgs.un.org/goals",
  },
  ifrs: {
    name: "IFRS Foundation — standards",
    url: "https://www.ifrs.org/issued-standards/",
  },
  ilo: {
    name: "International Labour Organization",
    url: "https://www.ilo.org/",
  },
  iiba: {
    name: "International Institute of Business Analysis",
    url: "https://www.iiba.org/",
  },
} satisfies Record<string, { name: string; url: string }>;

type Topic = {
  id: string;
  name: string;
  description: string;
  sources: (keyof typeof knowledgeSources)[];
  entries: string;
};
export const knowledgeTopics: Topic[] = [
  {
    id: "foundations",
    name: "Foundations & strategy",
    description:
      "Projects, programmes, business value and organisational direction.",
    sources: ["apm", "pmi"],
    entries: `
Project|A temporary effort undertaken to produce a defined change, output or outcome, with boundaries for time, resources and responsibility.
Project management|The coordinated use of people, methods and controls to guide a project from its initial purpose through delivery and closure.|PM
Operations management|The design, coordination and improvement of the recurring work that produces goods or delivers services.|OM
Programme|A coordinated group of related projects and change activities managed together to achieve benefits that separate management would not deliver.|Program
Portfolio|A collection of projects, programmes and other investments selected and governed to advance an organisation's strategic priorities.
Strategy|A set of choices about objectives, priorities and how resources will be used to achieve a desired position or outcome.
Strategic alignment|The degree to which an initiative's purpose, spending and expected benefits support the organisation's chosen direction.
Business value|The usefulness or advantage created for an organisation and its stakeholders; it can include financial, social, service or environmental benefits.
Benefit|A positive, measurable change that a stakeholder or organisation expects to gain from an initiative's outcomes.
Output|A product, service or other result directly produced by work, such as a completed facility, report or training session.
Outcome|A change in behaviour, capability or conditions arising from the use of project outputs.
Impact|A broader or longer-term effect associated with an intervention, including intended and unintended positive or negative changes.
Objective|A specific result that an organisation or project intends to achieve; useful objectives can be assessed against stated measures.
Goal|A broad statement of the desired future condition that gives direction to more specific objectives and activities.
SMART objective|An objective framed to be specific, measurable, achievable, relevant and time-bound; the acronym is a drafting aid rather than proof of feasibility.|SMART
Success criteria|The agreed conditions used to judge whether an initiative has achieved acceptable results, including delivery quality and desired outcomes.
Project life cycle|The phases through which a project progresses, from initial consideration and authorisation to delivery, handover and closure.
Product life cycle|The evolution of a product from conception and introduction through operation, development and eventual retirement.
Baseline|An agreed reference against which later performance or changes are compared; its scope, date and approval status should be recorded.
Business as usual|The ongoing activities required to operate an organisation, distinct from temporary initiatives that change how it operates.|BAU
`,
  },
  {
    id: "governance",
    name: "Governance & stakeholders",
    description:
      "Authority, accountability, sponsorship and stakeholder relationships.",
    sources: ["apm", "pmi"],
    entries: `
Governance|The arrangements for directing an initiative, authorising decisions, maintaining accountability and checking that objectives and controls remain appropriate.
Sponsor|The person or body that champions an initiative, secures support and funding, and is accountable for its business justification.
Project manager|The person responsible for coordinating project work and managing delivery within the authority granted by the organisation.|PM role
Project management office|An organisational function that supports or governs projects through shared methods, reporting, assurance, tools or specialist services.|PMO
Steering committee|A group with defined authority to review direction, resolve escalated matters and make significant decisions about an initiative.
Stakeholder|A person, group or organisation that can affect, is affected by, or has an interest in an initiative or operation.
Stakeholder analysis|A structured assessment of stakeholders' interests, influence, needs and likely responses to help plan appropriate engagement.
Stakeholder engagement|The deliberate work of involving stakeholders, listening to concerns and maintaining relationships that support informed decisions and delivery.
Power-interest grid|A stakeholder-mapping tool that compares influence with level of interest to help tailor engagement; positions should be reviewed as circumstances change.
Accountability|The obligation to explain and answer for a decision or result; assigning work does not necessarily transfer accountability.
Responsibility|The duty to perform or contribute to a task, activity or control; responsibilities should be explicit and understood.
RACI matrix|A responsibility map identifying who is responsible, accountable, consulted and informed for each activity or decision.|RACI;Responsibility assignment matrix
Delegation of authority|A documented transfer of defined decision-making powers, with limits, conditions and escalation requirements.
Stage gate|A formal decision point at which evidence is reviewed to decide whether work should continue, change direction, pause or stop.|Phase gate
Assurance|Independent or suitably separated checks that an initiative's governance, plans, controls and results provide confidence to decision-makers.
Escalation|Referring an issue or decision to a person or body with the authority or resources needed to resolve it.
Decision rights|The rules specifying who may make particular decisions, who must be consulted and who must approve implementation.
Benefits owner|The person accountable for ensuring a particular benefit is pursued, measured and sustained after the related outputs are delivered.
Change control board|A group authorised to assess and decide specified change requests against agreed criteria and authority limits.|CCB
Business justification|The documented reasoning that an initiative is worth undertaking and should remain funded, considering benefits, costs, risks and alternatives.
`,
  },
  {
    id: "scope",
    name: "Scope & requirements",
    description: "Define the work, requirements, boundaries and acceptance.",
    sources: ["apm", "iiba"],
    entries: `
Scope|The boundaries of what an initiative will deliver and the work it includes; exclusions are as important as inclusions.
Scope statement|A written description of the intended outputs, boundaries, exclusions, assumptions and acceptance conditions for a project.
Scope baseline|The approved reference for project scope, commonly bringing together the scope statement, work breakdown structure and supporting descriptions.
Scope creep|Uncontrolled growth in requirements or work without the corresponding assessment and approval of its effects on resources and commitments.
Deliverable|An identifiable output or result that must be produced and can be checked against agreed acceptance conditions.
Work breakdown structure|A hierarchical decomposition of the project's scope into manageable deliverables and work packages; it is not simply a dated task list.|WBS
Work package|A manageable part of a work breakdown structure for which scope, responsibility, estimates and completion conditions can be defined.
WBS dictionary|Supporting descriptions that explain each work package's boundaries, responsibilities, assumptions and acceptance conditions.|Work breakdown dictionary
Requirement|A stated capability, condition or characteristic needed by a stakeholder or required for an output to be acceptable.
Functional requirement|A requirement describing what a system, product or service must do, such as processing a payment or producing a report.
Non-functional requirement|A requirement concerning qualities or constraints such as performance, accessibility, security, reliability or maintainability.|NFR
Acceptance criteria|Specific, testable conditions that an authorised stakeholder uses to decide whether a deliverable meets agreed requirements.
Acceptance test|A planned check against acceptance criteria that provides evidence for an authorised acceptance decision.
Requirements traceability|The ability to follow a requirement from its source through design, implementation, verification and related change decisions.
Assumption|A condition treated as true for planning despite incomplete confirmation; important assumptions need owners, validation and review.
Constraint|A limit within which work must be planned or performed, such as funding, a deadline, a regulation or resource availability.
Exclusion|A clearly stated item of work or outcome that is outside the agreed scope, helping prevent conflicting expectations.
Interface|A boundary where systems, organisations, teams or work packages exchange information, materials or responsibilities.
Configuration management|The identification and control of approved versions and relationships among products, documents and other managed items.
Change request|A recorded proposal to alter an approved requirement, baseline, deliverable or working arrangement, with its reasons and expected effects.
`,
  },
  {
    id: "scheduling",
    name: "Scheduling & delivery",
    description:
      "Activities, dependencies, estimates, dates and completion forecasts.",
    sources: ["apm", "pmi"],
    entries: `
Activity|A defined piece of work with an intended result, resources and an estimated duration or effort.
Milestone|A significant event or decision in a schedule, usually represented as having no work duration of its own.
Dependency|A relationship that constrains when work can occur relative to another activity, deliverable or external event.
Finish-to-start dependency|A relationship in which a successor cannot start until its predecessor finishes, subject to any stated lag.|FS
Start-to-start dependency|A relationship in which a successor cannot start until its predecessor starts, subject to any stated lag.|SS
Finish-to-finish dependency|A relationship in which a successor cannot finish until its predecessor finishes, subject to any stated lag.|FF
Start-to-finish dependency|A relationship in which a successor cannot finish until its predecessor starts; it is less common than other dependency types.|SF
Lag|A planned waiting interval between linked schedule events; the reason for the waiting time should be documented.
Schedule lead|An intentional overlap that allows a successor to begin before a predecessor reaches the normally required point; overlap can introduce rework risk.
Duration|The elapsed working or calendar time from an activity's start to finish under a stated calendar; it differs from total person-hours of effort.
Effort|The amount of labour needed to perform work, measured in units such as person-hours or person-days.
Critical path|A longest-duration path through the schedule network that determines the earliest modelled finish under the current assumptions.
Total float|The time an activity can be delayed without delaying the modelled project finish or violating a governing schedule constraint.|Total slack
Free float|The time an activity can be delayed without delaying the early start of its immediate successor activities.
Gantt chart|A time-scaled display of activities and milestones that helps show dates, durations and sometimes dependencies and progress.
Critical path method|A network-based scheduling technique used to calculate early and late dates, float and critical paths from activity relationships and durations.|CPM
Resource levelling|Adjusting scheduled work to address resource limits or conflicts, potentially changing the project finish date or critical path.
Resource smoothing|Adjusting activities within available schedule flexibility to reduce resource fluctuations while keeping specified schedule limits unchanged.
Fast tracking|Shortening a schedule by overlapping work that would normally be sequential; coordination and rework risks often increase.
Crashing|Reducing duration by adding resources or paying for a faster method where the activity can actually benefit; additional cost must be assessed.
`,
  },
  {
    id: "finance",
    name: "Finance & budgeting",
    description:
      "Cost structures, estimates, funding, returns and financial assumptions.",
    sources: ["apm", "ifrs"],
    entries: `
Budget|An agreed allocation or plan for spending over a defined scope and period; an estimate is not automatically an approved budget.
Cost estimate|An assessment of likely resource costs based on specified quantities, rates, assumptions, evidence and uncertainty.
Cost baseline|The approved, time-phased budget used to assess cost performance, with changes governed through the relevant approval process.
Direct cost|A cost that can be attributed specifically to a defined activity, product, service or project on a consistent accounting basis.
Indirect cost|A shared cost allocated across activities or outputs using an agreed basis, such as administration or shared facilities.
Fixed cost|A cost that remains broadly unchanged over a specified activity range and time period; fixed does not mean permanent.
Variable cost|A cost that changes with activity or output volume over a specified operating range.
Capital expenditure|Spending to acquire or improve assets expected to provide value over more than the current reporting period, subject to applicable accounting rules.|CAPEX
Operating expenditure|Spending associated with running an operation during a period, subject to the organisation's accounting policies.|OPEX
Cash flow|The timing and amount of cash entering and leaving an activity or organisation; profit and cash availability are different measures.
Working capital|A measure of short-term operating resources, commonly current assets less current liabilities, interpreted alongside liquidity and business conditions.
Contingency reserve|Budget or schedule allowance for identified uncertainty and planned risk responses, usually managed within an approved baseline.
Management reserve|An additional allowance held under management authority for unforeseen work or uncertainty, typically outside the performance baseline.
Tax assumption|A recorded basis for estimated tax treatment and timing; applicable rates and obligations depend on jurisdiction and should be confirmed by qualified advice.
Return on investment|A measure comparing the net gain from an investment with its cost; state the period and what is included in the gain and cost.|ROI
Net present value|The value today of a series of future net cash flows discounted at a stated rate, including the initial investment.|NPV
Internal rate of return|A discount rate at which a cash-flow series has a net present value of zero; some cash-flow patterns have multiple rates or no useful solution.|IRR
Payback period|The time needed for cumulative net cash inflows to recover an initial investment; basic payback does not account for the time value of money.
Profit margin|Profit expressed as a proportion of revenue, with the profit basis specified, such as gross or operating profit.
Markup|An amount added to cost to set a price, often expressed as a proportion of cost; it differs from a margin calculated on revenue.
`,
  },
  {
    id: "earned-value",
    name: "Earned value & performance",
    description: "Baselines, progress measures, cost and schedule performance.",
    sources: ["apm", "pmi"],
    entries: `
Earned value management|An approach that integrates scope, schedule and budget to assess performance against an approved baseline; reliable progress measurement is essential.|EVM
Planned value|The budgeted value of the work scheduled to be completed by a stated date; it is not actual cash expenditure.|PV;BCWS;Budgeted cost of work scheduled
Earned value|The budgeted value of work actually completed by a stated date using an agreed progress measurement method.|EV;BCWP;Budgeted cost of work performed
Actual cost|The recorded cost incurred for the work being measured by a stated date, on a consistent and reconciled accounting basis.|AC;ACWP;Actual cost of work performed
Budget at completion|The total approved baseline budget for the work being measured, used as a reference for earned-value forecasts.|BAC
Cost variance|In earned value, the difference between earned value and actual cost. This differs from a simple budget-minus-spend balance.|CV
Schedule variance|In earned value, the difference between earned and planned value, measured in budget units rather than days.|SV
Cost performance index|The ratio of earned value to actual cost; it describes cost efficiency against the earned-value baseline, not project profitability.|CPI
Schedule performance index|The ratio of earned value to planned value; it indicates progress against a value-based plan and is not a direct measure of days late.|SPI
Estimate at completion|A forecast of the total cost at completion based on the forecasting method and assumptions selected.|EAC
Estimate to complete|A forecast of the remaining cost of the unfinished work, updated using current evidence and assumptions.|ETC
Variance at completion|The difference between the baseline budget and forecast total completion cost; the sign convention should be stated.|VAC
To-complete performance index|The cost-efficiency ratio required on remaining work to meet a specified budget or forecast target.|TCPI
Performance measurement baseline|The integrated scope, schedule and cost reference used to assess delivery performance, including agreed measurement methods.|PMB
Percent complete|A stated proportion of work completed according to a defined measurement basis; task-count averages may not reflect effort, cost or delivered value.
Weighted milestone method|A progress measurement approach that awards agreed portions of value when defined milestones are objectively achieved.
Level of effort|Support work measured mainly by the passage of time rather than distinct deliverables; its value treatment can mask delivery problems if overused.|LOE
Forecast|An updated assessment of a future result using current information and stated assumptions; it is not the same as an approved baseline.
Trend analysis|Examining how comparable measures change over time to identify patterns, emerging problems or the likely direction of performance.
Budget utilisation|The proportion of a defined budget consumed by recorded expenditure; it does not establish whether the expected work or benefits have been delivered.
`,
  },
  {
    id: "agile",
    name: "Agile & product management",
    description: "Adaptive delivery, Scrum, Kanban and product decisions.",
    sources: ["scrum", "kanban"],
    entries: `
Agile|An approach to handling uncertainty through short feedback cycles, collaboration and adaptation while maintaining a clear focus on useful outcomes.
Scrum|A lightweight framework in which a Scrum Team works toward goals through Sprints, inspection and adaptation using defined accountabilities, events and artifacts.
Sprint|A fixed-length Scrum event of one month or less in which the team pursues a Sprint Goal and creates useful product increments.
Product Owner|The Scrum accountability responsible for maximising product value and managing the Product Backlog effectively.|PO
Scrum Master|The Scrum accountability responsible for establishing Scrum and improving the team's effectiveness by coaching and helping remove impediments.|SM
Product Backlog|An evolving, ordered list of what is needed to improve a product; it is the source of work undertaken by the Scrum Team.
Sprint Backlog|The Sprint Goal, selected Product Backlog items and the team's actionable delivery plan, updated as learning occurs during the Sprint.
Increment|A usable addition to a product that meets the Definition of Done and works with previous increments.
Definition of Done|A shared description of the quality conditions an increment must satisfy to be considered complete in the relevant delivery context.|DoD
User story|A short description of a user need used to support discussion and delivery; it normally needs acceptance details and is not a full specification by itself.
Epic|A large grouping of related needs or work that is usually broken into smaller, more manageable items; usage varies across organisations and tools.
Story points|A team's relative estimate of an item's size, uncertainty or complexity; points are not universal units of time and should not be compared between teams.
Velocity|The amount of estimated work a team completes in a period using its own estimation basis; it is a planning aid, not a universal productivity target.
Kanban|A strategy for improving the flow of value through a visual, pull-based system with explicit policies and management of work in progress.
Work-in-progress limit|An explicit cap on the amount of started but unfinished work allowed in a workflow or stage, intended to improve focus and flow.|WIP limit
Product roadmap|A revisable communication of product direction and intended outcomes over time; it should distinguish commitments from tentative options.
Minimum viable product|A small product or experiment designed to test important assumptions with real users; viable does not mean abandoning essential safety or quality.|MVP
Retrospective|A structured opportunity for a team to inspect how it works and agree practical improvements.
Backlog refinement|The ongoing clarification, splitting, ordering and sizing of backlog items so they are better understood for future work.
Sprint Goal|A single objective for a Sprint that provides focus while allowing flexibility in the detailed work required to achieve it.
`,
  },
  {
    id: "risk",
    name: "Risk, resilience & compliance",
    description: "Uncertainty, responses, controls and continuity.",
    sources: ["apm", "iso"],
    entries: `
Risk|An uncertainty that could affect objectives if it occurs, with negative effects, positive effects or both depending on the context.
Issue|A situation that has already occurred and needs action or a decision; it is distinct from an uncertain future risk.
Risk register|A maintained record of identified risks, their causes, possible effects, assessment, ownership and planned responses.
Risk owner|The person accountable for monitoring a specific risk and ensuring appropriate responses are considered and implemented.
Probability|An estimate of how likely an event is within a defined period and set of conditions; a rating scale is not automatically a statistical probability.
Risk impact|The effect an uncertain event could have on objectives, described using suitable consequences such as cost, time, safety or service disruption.
Risk score|A prioritisation result derived from a chosen assessment method; multiplying ordinal ratings does not create a precise probability or monetary loss estimate.
Risk appetite|The broad amount and type of uncertainty an organisation is willing to take in pursuing its objectives.
Risk tolerance|The acceptable variation or exposure around a particular objective, measure or boundary, defined to guide action and escalation.
Risk mitigation|Action intended to reduce the likelihood or negative impact of a risk; it may not eliminate the risk completely.
Risk avoidance|Changing objectives, scope or methods so that a particular threat or its relevant exposure is removed.
Risk transfer|Arranging for another party to carry specified financial or contractual consequences, while recognising that some responsibilities and residual exposure remain.
Risk acceptance|An informed decision to retain an exposure, with monitoring and, where appropriate, a contingency plan or reserve.
Residual risk|The exposure that remains after planned risk responses or controls have been applied.
Secondary risk|A new uncertainty introduced as a result of implementing a risk response or change.
Expected monetary value|A probability-weighted financial estimate across defined possible outcomes, using consistent signs, units and credible assumptions.|EMV
Risk trigger|An observable event or condition that indicates a risk may be occurring or that a response should be activated.
Business continuity|The capability to maintain or restore priority activities during disruption within agreed levels and time requirements.|BC
Compliance|Meeting applicable obligations such as laws, regulations, contracts and internal policies; obligations depend on the activity and jurisdiction.
Internal control|A designed measure that helps prevent, detect or correct failures, protect resources and support reliable operation and reporting.
`,
  },
  {
    id: "quality",
    name: "Quality & assurance",
    description: "Requirements, verification, variation and problem solving.",
    sources: ["asq", "iso"],
    entries: `
Quality|The degree to which a product, service or process meets relevant requirements and stakeholder needs in its intended context.
Quality assurance|Planned activities that provide confidence that appropriate processes and controls are in place to achieve quality requirements.|QA
Quality control|Operational checks and measurements used to determine whether outputs meet specified requirements and to address nonconformities.|QC
Quality management system|The connected policies, processes, responsibilities and records used to direct and control an organisation with regard to quality.|QMS
Nonconformity|A failure to meet a stated requirement; its evidence, significance and disposition should be recorded.
Defect|An imperfection or failure that makes an output fall short of specified or intended use requirements, according to the applicable definition.
Corrective action|Action to address the cause of an identified nonconformity so it is less likely to recur, rather than only correcting the immediate symptom.
Preventive control|A measure designed to stop an unwanted event or nonconformity from happening, rather than detecting it after it occurs.
Root cause analysis|A structured investigation into the underlying factors that produced a problem, supporting corrective action based on evidence.|RCA
Five Whys|A questioning technique that follows successive causes behind a problem; the number five is a prompt, not a rule or proof of causation.|5 Whys
Fishbone diagram|A visual way to organise possible causes of a problem into categories, supporting investigation rather than proving which cause is correct.|Ishikawa diagram;Cause-and-effect diagram
Pareto analysis|Ranking categories by measured contribution to a problem to focus attention; the familiar 80/20 pattern is a heuristic, not a required ratio.
Control chart|A time-ordered chart with statistically derived limits used to distinguish common process variation from signals that warrant investigation.|SPC chart
Common-cause variation|Variation inherent in the current process system; improvement generally requires changing the system rather than reacting to every fluctuation.
Special-cause variation|Variation arising from a specific, unusual influence that is not part of the process's normal operating pattern.
Process capability|An assessment of whether a stable process can meet specification limits; it depends on valid measurement and suitable distribution assumptions.
First-pass yield|The proportion of units or transactions that meet requirements on their first attempt without rework, using a stated counting basis.|FPY
Cost of quality|The combined cost of preventing and assessing problems plus the cost of failures; it is not simply the cost of the quality department.|COQ
Rework|Additional effort needed to correct work that failed requirements; its cost and schedule effects should be distinguished from planned delivery.
Quality audit|A systematic, evidence-based examination of whether quality arrangements meet defined criteria and are being followed effectively.
`,
  },
  {
    id: "lean",
    name: "Lean & continuous improvement",
    description:
      "Flow, waste, workplace organisation and structured improvement.",
    sources: ["lean", "asq"],
    entries: `
Lean|A management approach focused on understanding customer value, improving flow and reducing waste while developing people and problem-solving capability.
Customer value|The usefulness that customers recognise in a product or service, judged against their needs rather than solely the producer's activity or cost.
Value stream|The connected activities and information flows required to deliver a product or service from request through fulfilment.
Value stream mapping|A visual analysis of current and desired flows of material and information that helps identify delays, waste and improvement opportunities.|VSM
Waste|Consumption of time or resources that does not add required value in a defined process context; safety and necessary controls should not be removed carelessly.|Muda
Kaizen|Ongoing improvement through practical changes and learning, commonly involving the people who perform the work.
5S|A workplace organisation approach commonly expressed as sort, set in order, shine, standardise and sustain; effectiveness requires continued use rather than a one-off tidy-up.
Standard work|The current agreed method and conditions for performing a task reliably, used as a baseline for training and improvement rather than an unchangeable rule.
Gemba|The actual place where work happens and value is created, where managers can observe conditions and learn from people doing the work.
Poka-yoke|A design feature or control that helps prevent a mistake or makes it immediately detectable before further consequences occur.|Mistake proofing
Just-in-time|An approach that supplies work or materials when needed in the needed quantity, supported by reliable flow and suitable buffers rather than indiscriminate stock removal.|JIT
Pull system|A system in which downstream demand or available capacity authorises upstream work, helping control excess work and inventory.
Push system|A system in which work is released according to a schedule or forecast, even if downstream demand or capacity has not yet signalled readiness.
Heijunka|A production-levelling approach that smooths work mix and volume over time to reduce disruptive fluctuations.
Jidoka|Building the ability to detect abnormal conditions and stop or prevent continued defective work, enabling prompt problem resolution.
PDCA cycle|An improvement cycle of plan, do, check and act that uses results to refine the next action.|PDCA;Plan-do-check-act
DMAIC|A structured improvement sequence of define, measure, analyse, improve and control, often used for existing processes.|Define-measure-analyse-improve-control
Six Sigma|A data-informed improvement approach that seeks to reduce defects and unwanted variation; the statistical meaning of sigma should not be confused with a guarantee of perfection.
A3 problem solving|A concise, structured way to explain a problem, evidence, analysis, countermeasures and follow-up, often organised on a single A3-sized page.
Single-minute exchange of dies|An approach for reducing changeover time by separating tasks that require stopped equipment from those that can be prepared externally.|SMED
`,
  },
  {
    id: "operations",
    name: "Operations, flow & capacity",
    description: "Resources, constraints, operating models and throughput.",
    sources: ["ascm", "lean"],
    entries: `
Process|A connected set of activities that transforms inputs into outputs for a customer or other recipient.
Operating model|The arrangement of processes, people, technology, information and governance through which an organisation delivers its strategy and services.
Capacity|The amount of work or output a resource or system can support in a specified period under stated conditions.
Design capacity|The theoretical or rated output level used as a reference under defined design conditions; it may not reflect practical operating losses.
Effective capacity|The sustainable output expected under realistic operating conditions, allowing for planned limitations such as breaks, maintenance and work mix.
Capacity utilisation|Actual output or resource use relative to a specified capacity measure over the same period; the denominator must be stated.
Operational efficiency|A comparison of useful output or earned work with resources used or effective capacity; the exact basis must be defined before comparisons are made.
Throughput|The rate at which completed units or work items leave a defined process over a stated period.
Cycle time|Elapsed time from an agreed start point to completion in a process; whether waiting is included must be documented and used consistently.
Lead time|Elapsed time from a defined request or commitment to fulfilment, often including queueing, processing and delivery.
Takt time|The available production time per unit of customer demand during the same period; it expresses the pace required by demand.
Bottleneck|A resource or process stage whose limited capability restricts the output or flow of the wider system.
Constraint management|Identifying and managing the factor that currently limits a system's achievement of its objective, while checking for shifting constraints.|Theory of constraints;TOC
Work in progress|Items that have entered a defined process but have not yet reached its completion boundary.|WIP;Work in process
Little's Law|A relationship linking average work in a stable system, average throughput and average time spent within the same system boundaries.
Queueing|The accumulation of work awaiting a resource or decision; waiting generally increases as variability and resource loading become harder to absorb.
Batch processing|Performing work on a group of similar items together; batch size affects setup efficiency, waiting, inventory and responsiveness.
Changeover|The transition of a resource from producing one item or configuration to another, including the preparation needed for acceptable output.
Overall equipment effectiveness|A combined measure of availability, performance and quality for a defined production resource and time basis.|OEE
Service productivity|A measure of useful service output relative to resources consumed, interpreted alongside quality, complexity and customer outcomes.
`,
  },
  {
    id: "inventory",
    name: "Inventory & warehousing",
    description: "Stock policies, storage, replenishment and fulfilment.",
    sources: ["ascm", "cips"],
    entries: `
Inventory|Materials, goods or other stocked items held for future use or sale, recorded on a defined quantity and valuation basis.
Stock keeping unit|A distinct identifier for an inventory item or variation used for ordering, storage and tracking.|SKU
Safety stock|Additional inventory held to absorb selected uncertainty in demand or replenishment; the appropriate buffer depends on service targets and variability.
Reorder point|The inventory position at which replenishment should be triggered, considering demand during lead time and any planned safety stock.|ROP
Economic order quantity|An order-size model that balances ordering and holding costs under simplifying assumptions such as steady demand and stable costs.|EOQ
Inventory turnover|The rate at which inventory is consumed or sold over a period, commonly measured using cost of goods sold and average inventory value.
Days inventory outstanding|An estimate of how many days of inventory are held on the selected accounting and period basis.|DIO;Days inventory on hand
ABC inventory analysis|Grouping stock by a chosen importance measure, often annual consumption value, to focus different levels of control and attention.
Cycle counting|Regularly counting selected inventory items to verify records and investigate discrepancies without waiting for one complete annual stocktake.
Stockout|A situation in which the required item is unavailable when demanded; its service impact depends on alternatives and replenishment time.
Backorder|A customer requirement accepted for later fulfilment because stock or capacity is not currently available.
Fill rate|The proportion of demand fulfilled immediately or as specified, using a stated basis such as units, order lines or complete orders.
Inventory carrying cost|The cost of holding stock, including relevant financing, storage, handling, insurance, deterioration and obsolescence costs.
Inventory obsolescence|Loss of usefulness or saleability because an item is outdated, expired, superseded or no longer required.
First in, first out|A physical rotation or accounting convention in which the earliest receipts are used or costed first; physical and accounting practices can differ.|FIFO
First expired, first out|A stock-rotation method that prioritises items with the earliest expiry date to reduce expiry-related waste.|FEFO
Inventory position|The amount available for replenishment decisions after considering on-hand stock, outstanding supply and committed or backordered demand.
Warehouse slotting|Assigning storage locations to items using factors such as demand, size, handling needs, compatibility and travel time.
Order picking|Selecting the required items and quantities from storage to fulfil an order or internal request.
Warehouse management system|A system that supports stock location, receiving, storage, picking, dispatch and inventory-record control.|WMS
`,
  },
  {
    id: "procurement",
    name: "Procurement & contracts",
    description:
      "Sourcing, supplier decisions, commercial terms and obligations.",
    sources: ["cips", "apm"],
    entries: `
Procurement|The process of defining a need and obtaining suitable goods, works or services, including sourcing, contracting and managing supplier performance.
Sourcing|Identifying and evaluating supply options and deciding how a requirement should be supplied.
Supplier qualification|Assessing whether a potential supplier meets relevant capability, financial, technical, ethical and compliance requirements before selection.
Request for information|A document used to gather information about market capabilities or possible solutions before deciding how to procure.|RFI
Request for quotation|An invitation for suppliers to price a sufficiently defined requirement and provide relevant commercial conditions.|RFQ
Request for proposal|An invitation for suppliers to propose a solution and commercial approach where the buying decision requires more than a simple price comparison.|RFP
Invitation to tender|A formal request for suppliers to submit bids against stated requirements, rules and evaluation criteria.|ITT
Statement of work|A description of the work to be performed, deliverables, boundaries and relevant performance or acceptance requirements.|SOW
Purchase order|A purchasing document that identifies requested goods or services and relevant quantities, prices and terms; its contractual effect depends on the agreement and law.|PO document
Fixed-price contract|An arrangement in which an agreed price applies to a defined scope, subject to the specific contract's adjustment and change provisions.
Cost-reimbursable contract|An arrangement under which allowable costs are reimbursed according to agreed rules, often with a separate fee and appropriate cost controls.
Time-and-materials contract|An arrangement that pays for specified labour time and materials at agreed rates, requiring controls over scope, effort and ceilings.|T&M
Contract variation|An authorised change to a contract's requirements, price, timing or other terms, recorded through the applicable contractual procedure.
Liquidated damages|A contractual provision specifying an amount or calculation for particular breaches; enforceability and limits depend on the contract and applicable law.
Retention|An amount withheld from payment under agreed terms, often pending completion or correction of defects; release conditions must be clear.
Supplier due diligence|Checks undertaken to understand a supplier's suitability, ownership, financial standing, compliance and relevant operational or ethical risks.
Supplier performance management|Monitoring and improving supplier delivery against agreed obligations, measures and relationship objectives.
Make-or-buy analysis|Comparing internal provision with external supply using costs, capabilities, control, risks, capacity and strategic considerations.
Total cost of ownership|The relevant acquisition, use, maintenance, support and disposal costs of an asset or service over a stated life-cycle boundary.|TCO
Value for money|An assessment of benefits, quality, costs and risks over a suitable time horizon; the lowest initial price is not necessarily the best result.|VfM
`,
  },
  {
    id: "supply-chain",
    name: "Supply chain & logistics",
    description: "Planning, movement, networks and customer delivery.",
    sources: ["ascm", "cips"],
    entries: `
Supply chain|The connected organisations, resources and processes involved in obtaining inputs and delivering goods or services to end users.
Supply chain management|Coordinating demand, supply, operations and relationships across a supply chain to achieve defined service, cost and resilience objectives.|SCM
Logistics|Planning and controlling the movement, storage and related information flows of goods to meet requirements.
Demand planning|Developing a considered view of future demand using evidence, assumptions and cross-functional input to support supply and capacity decisions.
Sales and operations planning|A recurring cross-functional process that reconciles demand, supply, capacity and financial plans at an agreed aggregate level.|S&OP
Material requirements planning|Calculating time-phased material needs from a production plan, bills of material, inventory records and supply assumptions.|MRP
Bill of materials|A structured description of the components and quantities required to make a product or assembly.|BOM
Master production schedule|A time-phased plan for producing specified finished goods or key items that guides detailed material and capacity planning.|MPS
Bullwhip effect|Amplification of demand variability upstream in a supply chain, often influenced by forecasting, order batching, incentives and information delays.
Demand variability|The extent to which demand changes across periods, products or locations; its pattern and predictability influence appropriate supply policies.
Order fulfilment|The coordinated activities from accepting an order through allocation, preparation, delivery and confirmation against the customer's requirements.
On-time in-full delivery|Delivery performance measured by orders meeting both agreed timing and completeness conditions, using clearly defined tolerances and exclusions.|OTIF
Last-mile delivery|The final movement of an order to its recipient or point of use, where access, routing and customer coordination can be significant.
Reverse logistics|Managing the return or onward recovery of goods, packaging or materials for repair, reuse, recycling, credit or disposal.
Cold chain|A temperature-controlled supply chain designed to keep specified conditions within acceptable limits throughout handling and transport.
Cross-docking|Moving incoming goods to outbound dispatch with little or no storage, supported by coordinated timing and information.
Third-party logistics|Logistics services performed by an external specialist under agreed scope and service conditions.|3PL
Incoterms|International Chamber of Commerce trade rules defining selected buyer and seller responsibilities for delivery, risk and costs; they do not replace the whole sales contract.
Freight consolidation|Combining shipments to improve transport use or economics while considering delivery timing, handling and compatibility.
Supply chain resilience|The capability to prepare for, respond to and recover from disruptions while maintaining priority supply and service requirements.
`,
  },
  {
    id: "maintenance",
    name: "Maintenance & reliability",
    description: "Asset performance, failure prevention and restoration.",
    sources: ["asq", "iso"],
    entries: `
Maintenance|Activities used to retain an asset in, or restore it to, a condition that enables its required function.
Preventive maintenance|Planned maintenance performed at defined intervals or conditions to reduce the likelihood of failure or deterioration.|PM maintenance
Predictive maintenance|Using condition data and analysis to anticipate deterioration and decide when maintenance is likely to be needed.|PdM
Condition-based maintenance|Maintenance initiated by observed or measured asset condition rather than only by fixed elapsed time or usage.|CBM
Corrective maintenance|Maintenance undertaken after a fault is detected to restore the required function; it can be planned or urgent.
Reliability|The probability or demonstrated ability of an item to perform its required function for a stated period under stated conditions.
Availability|The proportion of a defined period in which a resource or service is capable of performing its required function, using an agreed uptime boundary.
Maintainability|The degree to which an asset can be retained in or restored to the required condition using specified procedures, skills and resources.
Mean time between failures|Average operating time between failures of a repairable item over a stated observation basis; it is not a guaranteed time until the next failure.|MTBF
Mean time to repair|Average time spent repairing failures under a stated timing definition; some organisations use MTTR for restoration time instead, so confirm the boundary.|MTTR
Mean time to failure|Average operating life before failure for non-repairable items or a defined population, under specified conditions.|MTTF
Downtime|Time during which an asset or service is unable to perform its required function; planned and unplanned categories should be distinguished.
Failure mode|The way an item, process or service fails to perform a required function.
Failure modes and effects analysis|A structured examination of possible failures, their effects and causes, existing controls and appropriate risk-reduction actions.|FMEA
Risk priority number|A screening score used in some FMEA methods by multiplying selected severity, occurrence and detection ratings; it is not a precise probability or universal decision rule.|RPN
Reliability-centred maintenance|A structured approach to choosing maintenance policies based on required functions, failure consequences and suitable preventive or corrective options.|RCM
Total productive maintenance|An approach that involves operators and maintenance specialists in improving equipment effectiveness and preventing losses.|TPM
Asset life-cycle management|Managing an asset from initial need and acquisition through operation, maintenance and eventual renewal or disposal.
Maintenance backlog|Identified maintenance work that has not yet been completed, classified by urgency, readiness, resources and risk.
Spare-parts criticality|The importance of a spare item based on failure consequences, availability, lead time, substitution and the effect of not having it when needed.
`,
  },
  {
    id: "people",
    name: "People, leadership & change",
    description:
      "Teams, communication, capability and organisational adoption.",
    sources: ["apm", "ilo"],
    entries: `
Leadership|Influencing and supporting people toward shared objectives, including establishing direction, enabling action and responding to changing conditions.
Team|People with connected responsibilities who coordinate their work toward a shared purpose or result.
Competence|The demonstrated ability to apply relevant knowledge and skills effectively in a particular role or situation.
Skills matrix|A structured view of required capabilities and available proficiency that helps identify coverage, development and assignment needs.
Resource allocation|Assigning available people, equipment or funding to work according to priorities, capacity and constraints.
Resource calendar|A record of when a person or resource is available, including working time, holidays, commitments and other limits.
Communication plan|A description of what information stakeholders need, who provides it, when it is shared and through which channels.
Communication channel|A medium or route through which information is exchanged, selected to suit urgency, sensitivity, accessibility and feedback needs.
Conflict resolution|Addressing disagreements by understanding interests and evidence and choosing a suitable method for reaching a workable outcome.
Negotiation|A structured exchange through which parties seek an acceptable agreement while considering interests, alternatives and authority limits.
Facilitation|Guiding a group process so participants can contribute effectively, explore issues and reach useful outcomes without the facilitator taking over the decision.
Delegation|Assigning work and appropriate decision authority while clarifying expectations, support, boundaries and accountability.
Psychological safety|A shared sense that people can raise concerns, questions and mistakes without inappropriate interpersonal punishment; it does not remove accountability.
Organisational change management|Preparing, supporting and reinforcing the human and organisational adjustments needed for a change to be adopted and sustained.|OCM
Change readiness|The extent to which people and the organisation understand, support and are equipped to undertake a proposed change.
Resistance to change|Responses that slow or oppose adoption, which can reflect legitimate concerns, unclear value, competing incentives or lack of capacity.
Training needs analysis|Identifying gaps between required and existing capability to determine suitable learning and support actions.|TNA
Knowledge transfer|The deliberate sharing and application of experience, information and practical understanding so another person or group can use it effectively.
Succession planning|Preparing suitable people and transition arrangements for roles that are important to organisational continuity.
Workforce planning|Assessing the number, mix, skills and availability of people required to meet future operational and strategic needs.
`,
  },
  {
    id: "monitoring",
    name: "Monitoring, evaluation & learning",
    description: "Indicators, evidence, results and accountability for impact.",
    sources: ["oecd", "apm"],
    entries: `
Monitoring|Routine collection and review of information to understand implementation and performance and support timely management action.
Evaluation|A systematic assessment of an intervention's design, implementation or results using explicit questions, evidence and criteria.
Monitoring and evaluation framework|A structured description of results, indicators, evidence sources, collection responsibilities and review arrangements.|M&E framework
Key performance indicator|A selected measure used to assess progress or performance against an important objective; its definition, owner and interpretation should be clear.|KPI
Indicator|An observable or measurable sign used to assess a condition, change or aspect of performance.
Baseline measurement|The initial or reference observation used to assess subsequent change, with a documented population, timing and method.
Target|A stated desired value or condition to be achieved by a specified time on a defined measurement basis.
Theory of change|An explanation of how activities are expected to produce outcomes and impact, including assumptions and the context needed for the causal links to hold.|ToC
Logical framework|A structured presentation of an intervention's results hierarchy, indicators, evidence sources and assumptions; formats vary by organisation.|Logframe
Results chain|A sequence linking inputs, activities, outputs, outcomes and impact, used to clarify expected pathways and assess the supporting evidence.
Input|A resource used to carry out work, such as funding, staff time, equipment, materials or information.
Means of verification|The evidence sources and collection methods used to assess an indicator or confirm a result, including quality and access requirements.|MoV
Data quality|The fitness of information for its intended purpose, considering factors such as accuracy, completeness, consistency, timeliness and reliability.
Attribution|The extent to which an observed change can credibly be assigned to a particular intervention rather than other influences.
Contribution analysis|Examining how an intervention plausibly helped produce a result, using evidence about its theory of change and other influencing factors.
Counterfactual|A credible account or estimate of what would have happened without the intervention, used to assess causal effects.
Relevance|The extent to which an intervention responds to the needs and priorities of its intended stakeholders and changing context.
Effectiveness|The extent to which an intervention achieves or is expected to achieve its objectives and intended results.
Evaluation efficiency|The relationship between an intervention's results and the resources and time used, considering credible alternatives and context.
Sustainability of benefits|The likelihood that an intervention's positive results will continue, considering financial, institutional, social and environmental conditions.
`,
  },
  {
    id: "services",
    name: "Services & digital operations",
    description:
      "Service commitments, incidents, reliability and information controls.",
    sources: ["sre", "nist"],
    entries: `
Service level agreement|An agreement defining service commitments, measures, responsibilities and relevant remedies or escalation arrangements.|SLA
Service level objective|A specific target for a service measure over a defined period, used to guide reliability and improvement decisions.|SLO
Service level indicator|A defined measure of a service attribute, such as successful request proportion, response time or availability.|SLI
Incident|An event that interrupts or degrades an agreed service or requires a coordinated operational response.
Problem management|Investigating and managing underlying causes of incidents to reduce recurrence and the impact of unresolved weaknesses.
Service request|A routine request for a predefined service action, information or access, handled through an agreed fulfilment process.
Change enablement|Assessing and authorising service changes using appropriate controls so useful changes can proceed with understood risks.
Release management|Planning and coordinating the introduction of new or changed service components into the intended operating environment.
Deployment|Moving or activating a change in an environment; deployment alone does not establish that the change is functioning correctly for users.
Configuration item|A component or record selected for management because its identity, relationships or state matter to delivery and support.|CI
Configuration management database|A repository of selected configuration items and relationships used to support operational understanding and control.|CMDB
Runbook|Documented instructions for carrying out an operational task, check or response, including preconditions and escalation points.
Observability|The ability to understand a system's internal condition from its outputs, such as logs, metrics and traces, in a way that supports investigation.
Error budget|The amount of unreliability permitted by a defined service objective over its measurement period; it helps balance change and reliability priorities.
Recovery time objective|The targeted time for restoring an activity or service after disruption, based on business needs and an agreed recovery scope.|RTO
Recovery point objective|The targeted maximum acceptable amount of data loss, commonly expressed as the time between the latest recoverable data and disruption.|RPO
Disaster recovery|The arrangements for restoring affected technology, information and related services after a major disruption.|DR
Access control|Controls that determine which identities may access which resources and perform which actions.
Role-based access control|Assigning permissions to defined roles and granting users appropriate roles rather than managing every permission independently.|RBAC
Audit trail|A chronological record of relevant actions or changes that supports accountability and investigation; sensitive information should be protected and logging gaps understood.
`,
  },
  {
    id: "analysis",
    name: "Analysis & decision-making",
    description:
      "Understand needs, evaluate options and use evidence responsibly.",
    sources: ["iiba", "asq"],
    entries: `
Business analysis|Understanding needs, assessing change options and recommending solutions that can deliver value within a specific context.|BA
Business process modelling|Representing how work is performed, including activities, decisions, roles and information flows, to support understanding and improvement.
SIPOC|A high-level view of suppliers, inputs, process, outputs and customers used to clarify a process's scope and relationships.
Swimlane diagram|A process diagram that groups activities by responsible role or organisation to make handoffs and responsibilities visible.
BPMN|A standardised notation for representing business processes, including events, activities, gateways and interactions.|Business Process Model and Notation
SWOT analysis|An assessment of internal strengths and weaknesses alongside external opportunities and threats, used to inform strategic choices.
PESTLE analysis|A structured consideration of political, economic, social, technological, legal and environmental influences on a decision or organisation.|PESTEL
Gap analysis|Comparing a current condition with a desired condition to identify the changes, capabilities or actions required.
Benchmarking|Comparing defined practices or measures with suitable internal or external references to identify improvement opportunities and relevant differences.
Feasibility study|An investigation into whether a proposed option is workable and worthwhile under relevant technical, financial, operational, legal and time constraints.
Cost-benefit analysis|Comparing relevant costs and benefits of options over an agreed period, stating valuation methods, uncertainty and important effects that cannot be monetised reliably.|CBA
Sensitivity analysis|Assessing how an outcome changes when selected assumptions or input values are varied.
Scenario analysis|Examining coherent sets of assumptions about possible future conditions to understand implications and prepare options.
Decision matrix|A structured comparison of options against stated criteria and, where appropriate, weights; scores require evidence and do not remove judgement.
Monte Carlo simulation|Repeatedly sampling defined uncertain inputs to estimate a distribution of possible outcomes; results depend on valid models and input assumptions.
Correlation|A measure of how variables move together; association alone does not establish that one variable causes another.
Regression analysis|Modelling a relationship between an outcome and explanatory variables to support estimation or investigation, subject to assumptions and limits.
Forecast bias|A persistent tendency for forecasts to be above or below observed results over a defined set of comparable observations.
Forecast accuracy|The closeness of forecasts to observed results using a stated error measure, period and aggregation level; different measures can rank forecasts differently.
Sampling|Selecting observations from a defined population to support measurement or inference, with attention to representativeness, uncertainty and potential bias.
`,
  },
  {
    id: "context",
    name: "Sustainability & business context",
    description:
      "Responsible delivery, local participation and regional financial considerations.",
    sources: ["sdg", "iso", "cips"],
    entries: `
Environmental, social and governance|A grouping of environmental, social and governance considerations used to assess responsibilities, risks and performance; specific reporting requirements vary.|ESG
Sustainable Development Goals|The United Nations' set of global goals for sustainable development; a project should explain its evidenced contribution rather than merely attaching a goal label.|SDGs
Environmental impact assessment|A structured assessment of likely environmental effects and suitable responses before relevant decisions; legal requirements depend on jurisdiction and activity.|EIA
Social impact assessment|Assessing likely effects on people and communities and planning responses, participation and monitoring appropriate to the context.|SIA
Safeguards|Policies and measures intended to prevent or reduce harm to people or the environment during planning, delivery and operation.
Community engagement|Meaningful involvement of affected communities in understanding needs, discussing decisions, raising concerns and reviewing relevant outcomes.
Grievance mechanism|An accessible process through which people can raise concerns and seek a response or remedy, with protection from inappropriate retaliation.
Local content|The use and development of local labour, suppliers, skills or resources under defined objectives or obligations; definitions and legal requirements vary by country and sector.
Social inclusion|Designing participation and access so that people facing disadvantages or barriers can meaningfully benefit and contribute.
Gender-responsive planning|Planning that examines different needs, opportunities and effects across genders and uses evidence to address relevant inequalities.
Climate adaptation|Adjusting systems and practices to current or expected climate effects in order to reduce harm or make use of appropriate opportunities.
Climate mitigation|Actions intended to limit climate change by reducing greenhouse-gas emissions or increasing their removal, using a defined accounting basis.
Carbon footprint|A quantified estimate of greenhouse-gas emissions associated with a stated activity, organisation or life-cycle boundary, usually expressed as carbon-dioxide equivalents.
Circular economy|An approach that seeks to retain product and material value through better design, maintenance, reuse, repair and recovery rather than relying mainly on disposal.
Waste hierarchy|A prioritisation approach that generally favours prevention and reuse ahead of recycling, other recovery and disposal, subject to safety and applicable rules.
Exchange rate|The price of one currency in terms of another, identified by its source, quotation direction and observation date.
Foreign-exchange exposure|The extent to which currency movements can affect costs, cash flows, assets or obligations; exposure depends on the amounts, currencies and timing involved.|FX exposure
Value added tax|A tax mechanism applied to taxable supplies with rules for collection and input credits that vary by jurisdiction; confirm current local treatment and rates.|VAT
Withholding tax|A mechanism requiring a payer to deduct and remit specified tax from eligible payments; scope, rates and credit treatment depend on applicable law.|WHT
Import duty|A charge applied to eligible imported goods under relevant customs rules; classification, origin, valuation and current law affect the amount.
`,
  },
  {
    id: "documents",
    name: "Documents & project controls",
    description: "Plans, registers, reporting and orderly handover.",
    sources: ["apm", "pmi"],
    entries: `
Project proposal|A document explaining an intended initiative, its justification, proposed approach, benefits, resources and the decision or funding being sought.
Project charter|A document that formally authorises an initiative and records its high-level purpose, scope, objectives, governance and authority arrangements.
Project management plan|The integrated description of how project work will be delivered, monitored, controlled and closed, including relevant subsidiary plans.|Project plan
Business case|A documented assessment of whether an initiative remains justified, considering needs, options, benefits, costs, risks and feasibility.
Terms of Reference|A document defining an assignment's purpose, boundaries, deliverables, responsibilities, reporting and relevant acceptance conditions.|ToR
Work plan|A practical arrangement of activities, timing, responsibilities and outputs for a defined period or scope.
Procurement plan|A record of intended sourcing packages, methods, responsibilities, timing, budget references and approval requirements.
Risk management plan|A description of how uncertainty will be identified, assessed, assigned, responded to, monitored and reported.
Issue log|A maintained record of current problems, decisions or actions needing resolution, including owners, priority, due dates and status.
Assumption log|A record of planning assumptions, their evidence, validation responsibilities and the effects of changes or invalidation.
Decision log|A record of significant decisions, their rationale, authority, timing and relevant conditions or follow-up actions.
Change log|A record of proposed and approved changes, their assessment, status, authority and effects on relevant commitments or versions.
RAID log|A combined record of risks, assumptions, issues and dependencies; some organisations use different expansions, so define the intended categories.|RAID
Status report|A concise account of the current state of work against relevant commitments, highlighting exceptions, decisions and required actions.
Progress report|A report describing completed work, performance evidence, issues and next steps over a defined period; recorded claims should be substantiated.
Meeting minutes|An agreed record of a meeting's attendance, key discussion, decisions and actions, distinguishing proposals from confirmed decisions.
Lessons-learned register|A maintained record of observations, evidence, lessons and recommended actions that can improve current and future work.
Handover|The controlled transfer of outputs, information and operational responsibilities to the people who will own or use them.
Project closure report|A record of final delivery and acceptance status, financial reconciliation, unresolved matters, handover and required approvals; it does not by itself certify completion.|Closure report
Document control|Managing document identity, ownership, version, approval, access and retention so people use appropriate and reliable information.
`,
  },
];

const additionalEntries: Record<string, string> = {
  foundations:
    "Predictive delivery|An approach that plans substantial scope and delivery detail in advance and manages execution against agreed baselines, with controlled changes.|Waterfall approach\nAdaptive delivery|An approach that adjusts detailed plans through frequent feedback and learning when requirements or solutions are uncertain.\nHybrid delivery|An intentional combination of predictive and adaptive practices chosen to suit the work rather than applying one approach uniformly.\nProjectification|Organising a growing proportion of an organisation's work through temporary projects, with implications for governance, capability and resource allocation.\nBenefits realisation|The process of planning, enabling, measuring and sustaining expected benefits, often extending beyond project closure.|Benefits realization",
  governance:
    "Portfolio prioritisation|Comparing candidate and ongoing investments against agreed strategic, value, risk and resource criteria to decide their relative priority.\nProject authorisation|A formal decision allowing a project or stage to proceed within defined objectives, authority and resource limits.|Project authorization\nTolerances|Defined limits of acceptable deviation within which delegated managers can act without further escalation.\nGate review|An evidence-based assessment supporting a decision about whether a stage or initiative should proceed and under what conditions.",
  scope:
    "Scope validation|Obtaining an authorised acceptance decision for completed deliverables by checking evidence against agreed requirements and acceptance conditions.\nVerification|Checking whether an output meets specified requirements or design conditions; it should be distinguished from checking whether it meets the intended user need.\nValidation|Checking whether a product, service or approach satisfies the intended use and stakeholder need in its relevant context.\nGold plating|Adding features or work beyond agreed requirements without a justified, authorised change; extra work can create cost and support obligations.\nRequirements prioritisation|Ordering requirements by agreed factors such as value, urgency, dependencies, risk and feasibility so constrained resources can be used deliberately.\nMoSCoW prioritisation|A requirement-prioritisation method using must have, should have, could have and won't have for the defined period; categories need clear rules.|MoSCoW",
  scheduling:
    "Three-point estimating|Using optimistic, most-likely and pessimistic estimates to describe uncertainty; the method for combining them must be stated.\nProgram evaluation and review technique|A scheduling technique associated with uncertain activity durations and three-point estimates; model assumptions determine how estimates and probabilities are interpreted.|PERT;Programme evaluation and review technique\nRolling-wave planning|Planning near-term work in detail while keeping later work at a higher level until sufficient information becomes available.\nPrecedence diagramming method|Representing activities as nodes linked by logical relationships to model the sequence and constraints of work.|PDM\nEarliest start|The earliest modelled time an activity can begin after considering its predecessors, calendar and relevant constraints.|ES\nEarliest finish|The earliest modelled time an activity can finish using its early start, duration and applicable calendar.|EF\nLatest start|The latest modelled time an activity can begin without violating the governing finish or other schedule constraint.|LS\nLatest finish|The latest modelled time an activity can finish without violating the governing finish or other schedule constraint.|LF\nCritical chain|A scheduling approach that considers resource constraints and uses buffers to protect important delivery commitments from uncertainty.\nSchedule buffer|A planned allowance of time placed in a schedule to absorb selected uncertainty; its ownership and consumption rules should be explicit.\nTimebox|A fixed maximum period allocated to an activity or event, used to maintain focus and make timing expectations clear.\nSchedule baseline|The approved schedule reference used to compare actual dates and progress and assess the effect of changes.",
  finance:
    "Discount rate|The rate used to translate future cash flows into present values, consistent with the period, currency, inflation treatment and valuation purpose.\nCost of goods sold|The cost assigned to goods or services recognised as sold in the selected accounting period, under the applicable accounting policy.|COGS\nDepreciation|The systematic allocation of an asset's depreciable amount over its useful life under the selected accounting method; it is not necessarily a current cash payment.\nBreak-even point|The sales or output level at which defined revenues equal defined costs for the period and cost model used.\nContribution margin|Revenue less the variable costs included in a specified model, expressed as a total, per unit or ratio; state which costs are treated as variable.\nCommitted cost|An amount an organisation has obligated itself to pay under an order or agreement, even if it is not yet invoiced or recorded as an expense.\nAccrual|Recognition of an economic event in the period it relates to rather than solely when cash is paid or received, under applicable accounting policies.\nLife-cycle costing|Assessing relevant costs over an asset or service's chosen life-cycle boundary, including acquisition, use, support and end-of-life activities.|LCC",
  "earned-value":
    "Control account|A management control point that integrates scope, schedule and budget for specified work and assigns responsibility for performance.\nEarned schedule|A schedule-performance approach that interprets earned value in time units using the time-phased planned-value curve; its assumptions and data quality must be checked.|ES earned schedule\nSchedule performance baseline|The approved schedule reference and measurement rules used to assess progress and forecast delivery; keep it consistent with the scope and cost baselines.",
  agile:
    "Daily Scrum|A short Scrum event in which Developers inspect progress toward the Sprint Goal and adapt their upcoming work; it is not simply a status report to a manager.\nSprint Planning|The Scrum event that establishes why the Sprint is valuable, what can be done and how the selected work will be approached.\nSprint Review|The Scrum event for inspecting the Sprint's outcome with stakeholders and discussing useful adaptations and future work.\nProduct Goal|A longer-term objective for the product that helps the Scrum Team direct its planning and progress.\nSprint Retrospective|The Scrum event in which the team inspects how the last Sprint went and plans ways to improve quality and effectiveness.\nBurndown chart|A chart of remaining work against time under a defined measurement basis; changes in scope and measurement can affect interpretation.\nBurnup chart|A chart showing completed work over time, often alongside total scope so progress and scope changes can be distinguished.\nService level expectation|A probabilistic forecast for how long work is expected to take through a defined workflow, based on suitable historical evidence.|SLE\nDefinition of Ready|A team's optional agreement about the preparation needed before selecting work; it is not a required Scrum artifact or a substitute for collaboration.|DoR",
  risk: "Opportunity|An uncertainty that could have a positive effect on objectives if realised; exploiting it may still involve costs and other risks.\nRisk response plan|The selected actions, owners, triggers, resources and follow-up arrangements for addressing a particular uncertainty.\nRisk breakdown structure|A hierarchical organisation of risk sources or categories used to support systematic identification and analysis.|RBS\nRisk proximity|How soon a risk could affect objectives, considered alongside probability, impact and the time needed to respond.\nDisaster recovery exercise|A planned test of restoration procedures and responsibilities against agreed recovery objectives, with results and corrective actions recorded.\nForce majeure|A contractual or legal concept concerning specified exceptional events beyond a party's control; applicability and consequences depend on the contract and law.",
  quality:
    "Specification limit|A requirement boundary defining acceptable output; it differs from a control limit calculated from process behaviour.\nControl limit|A statistically derived boundary used to interpret process behaviour on a control chart; it is not automatically an acceptance specification.\nCp|A capability index comparing specification width with estimated process spread for a suitably stable process; it does not account for an off-centre process mean.\nCpk|A capability index that also considers how close the process mean is to either specification boundary, under appropriate process and distribution assumptions.\nMeasurement system analysis|Assessing whether a measurement process is sufficiently accurate, consistent and suitable for the decisions it supports.|MSA\nGauge repeatability and reproducibility|Assessing measurement variation arising from the measurement device or method and from different operators under a defined study design.|Gauge R&R;Gage R&R\nQuality function deployment|A structured approach to translating customer needs into design and delivery requirements and examining the relationships among them.|QFD",
  lean: "Andon|A visual or audible signal indicating an abnormal condition or a request for assistance, supporting prompt response and problem solving.\nEight wastes|A common Lean grouping of defects, overproduction, waiting, unused talent, transport, inventory, motion and excess processing; classifications can vary.|DOWNTIME wastes\nContinuous improvement|Repeated, evidence-informed efforts to make processes and outcomes better, supported by learning, ownership and follow-through.\nProcess ownership|Assigning accountability for a process's performance, coordination, controls and improvement across its functional boundaries.\nHoshin Kanri|A strategy-deployment approach that aligns organisational priorities, local plans and review cycles through structured dialogue and learning.",
  operations:
    "Line balancing|Distributing work across process stages or workstations to support a desired flow rate while considering skills, variation and constraints.\nEconomies of scale|Reductions in average unit cost associated with larger operating scale under stated conditions; complexity and constraints can eventually offset them.\nCapacity cushion|The difference between available capacity and expected demand, maintained to absorb uncertainty or support service responsiveness.\nAggregate planning|Planning overall output, capacity, workforce and inventory levels over a medium-term horizon before detailed item-level scheduling.\nFinite scheduling|Scheduling work while explicitly respecting the selected resource-capacity limits, rather than assuming unlimited availability.\nService blueprint|A representation of a service showing customer interactions, visible delivery activities and supporting work and systems.",
  inventory:
    "Last in, first out|A convention in which the latest receipts are treated as issued first; accounting acceptability depends on applicable standards and jurisdiction.|LIFO\nXYZ inventory analysis|Classifying inventory according to the variability or predictability of demand to tailor forecasting and replenishment policies.\nVED inventory analysis|Grouping items as vital, essential or desirable according to the operational consequences of unavailability.|VED\nMin-max inventory policy|A replenishment policy that triggers action at a defined minimum position and aims to restore inventory to a defined maximum.\nPeriodic review system|A stock-control approach in which inventory is reviewed at set intervals and replenishment decisions account for the review and delivery periods.\nPerpetual inventory|Continuously updated stock records that reflect receipts, issues and adjustments, supported by checks on physical quantities.",
  procurement:
    "Bid bond|A financial assurance related to a bidder's stated obligations, such as maintaining its offer or entering an awarded contract, under the bond's terms.\nPerformance bond|A financial assurance supporting specified contractual performance obligations; its triggers, limits and issuer responsibilities depend on its wording and law.\nContract management|Managing obligations, changes, performance, payments and relationships through a contract's life cycle to achieve the intended outcomes.\nCompetitive bidding|A sourcing process that invites eligible suppliers to compete under stated rules and evaluation criteria.\nSingle sourcing|Choosing one supplier for a requirement even though other supply options may exist; distinguish this from a market with only one capable source.\nSole sourcing|Obtaining a requirement from the only available or capable source under the defined conditions, with evidence and approvals appropriate to the context.",
  "supply-chain":
    "Integrated business planning|A cross-functional planning approach that connects operational demand and supply decisions with financial and strategic objectives.|IBP\nDistribution requirements planning|Calculating time-phased replenishment needs across a distribution network using demand, stock and supply information.|DRP\nLanded cost|The relevant cost of bringing goods to a defined receiving point, including specified transport, handling, insurance, duties and other charges.\nPerfect order|An order meeting all defined delivery and documentation requirements without specified errors; the definition and counting basis must be explicit.\nDecoupling point|A point in a supply chain where one planning or fulfilment approach changes to another, such as forecast-driven stocking becoming customer-order-driven work.",
  maintenance:
    "Failure rate|A measure of failures over an operating exposure or a time-dependent rate under a specified reliability model; constant-rate assumptions are not always appropriate.\nBathtub curve|A conceptual failure-rate pattern describing early failures, a useful-life region and wear-out; actual assets do not always follow this pattern.\nPlanned maintenance percentage|The proportion of defined maintenance work that was planned in advance, measured on an explicit basis such as labour hours or work orders.|PMP maintenance\nComputerised maintenance management system|A system for managing maintenance records, work orders, schedules, assets, spare parts and related performance information.|CMMS",
  people:
    "Span of control|The number and range of people or activities directly supervised by a manager, interpreted in light of complexity and support needs.\nCross-functional team|A team combining people from different specialisms or functions to coordinate connected work and decisions.\nMatrix organisation|An organisational arrangement in which people work across more than one line of authority, requiring clear priorities and decision rights.\nPerformance management|Setting expectations, reviewing evidence, providing feedback and supporting improvement in individual or organisational performance.",
  monitoring:
    "Coherence|The extent to which an intervention is compatible with other relevant policies or interventions, including whether it reinforces or undermines them.\nData disaggregation|Separating data into meaningful subgroups to examine differences that an overall average may hide, while protecting privacy and respecting statistical limits.\nTriangulation|Comparing evidence from different methods, sources or perspectives to assess consistency and investigate differences.\nQualitative data|Information about meaning, experience, characteristics or context that is commonly expressed in words, observations or categories rather than only numerical measures.\nQuantitative data|Information expressed numerically using defined measurement rules, units and relevant quality checks.",
  services:
    "Service catalogue|A maintained description of available services, their intended users, request routes and relevant service conditions.\nService desk|A coordinated point of contact for users to request services, report incidents and obtain support.\nBackup|A protected copy of selected data or configuration intended to support recovery; its usefulness depends on successful restoration and appropriate retention.\nRestore test|A controlled exercise confirming that backups can recover usable information within relevant recovery requirements.\nIdempotency|A property in which repeating the same operation has the same intended effect as performing it once, useful when handling retries and uncertain delivery.",
  analysis:
    "Decision tree|A representation of choices, uncertain events and potential outcomes used to structure analysis and compare options under stated assumptions.\nOpportunity cost|The value of the best relevant alternative forgone when a resource or choice is committed to one option.\nBusiness process re-engineering|A substantial redesign of how work is performed to seek major improvement, requiring careful attention to evidence, people and implementation risk.|BPR\nDesign thinking|An iterative approach that explores user needs, frames problems and tests possible solutions through research and experimentation.",
  context:
    "Materiality|The significance of an issue or information to a defined decision or reporting purpose; financial and sustainability frameworks may apply different perspectives.\nSustainable procurement|Considering relevant environmental, social and economic effects across procurement and life-cycle decisions, alongside required performance and value.\nResponsible sourcing|Managing supply decisions and relationships to address relevant ethical, human-rights, environmental and governance responsibilities.\nSocial value|The wider positive effects an activity can create for people and communities, assessed with an explicit scope and credible evidence rather than assumed from spending alone.",
  documents:
    "Project initiation documentation|A structured set of information used to establish a project's purpose, governance, approach and controls; exact contents depend on the delivery framework.|PID\nBenefits management plan|A record of expected benefits, measures, owners, dependencies, timing and arrangements for realisation and review.\nStakeholder register|A maintained record of relevant stakeholders and the information needed to plan appropriate involvement and communication.\nCompletion certificate|A formal record of a specified completion or acceptance decision under a contract or governance arrangement; authority and legal effect depend on the applicable terms.",
};
for (const topic of knowledgeTopics)
  if (additionalEntries[topic.id])
    topic.entries += "\n" + additionalEntries[topic.id];

export const knowledgeSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const knowledgeTerms: KnowledgeTerm[] = knowledgeTopics.flatMap(
  (topic) =>
    topic.entries
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, definition, aliases = ""] = line.split("|");
        return {
          id: knowledgeSlug(name),
          name,
          category: topic.id,
          definition,
          aliases: aliases ? aliases.split(";") : [],
          sources: [...topic.sources],
          related: [],
        };
      }),
);
const enhancements: Record<string, Partial<KnowledgeTerm>> = {
  "program-evaluation-and-review-technique": {
    formula:
      "A common PERT duration estimate = (optimistic + 4 × most likely + pessimistic) ÷ 6",
    assumptions:
      "This weighting is one three-point model, not a universal duration law. Network completion uncertainty also depends on dependencies and correlations.",
    related: [
      "three-point-estimating",
      "critical-path-method",
      "monte-carlo-simulation",
    ],
  },
  "break-even-point": {
    formula:
      "Break-even units = fixed costs ÷ (unit selling price − unit variable cost)",
    assumptions:
      "The unit contribution must be positive. This simple model assumes a stable price, cost structure, relevant output range and product mix.",
    related: ["contribution-margin", "fixed-cost", "variable-cost"],
  },
  "contribution-margin": {
    formula: "Unit contribution = unit selling price − unit variable cost",
    assumptions:
      "State which costs are variable, the output range and the accounting period. Total contribution is revenue less relevant total variable costs.",
    related: ["break-even-point", "profit-margin", "variable-cost"],
  },
  cp: {
    formula:
      "Cp = (upper specification limit − lower specification limit) ÷ (6 × estimated within-process standard deviation)",
    assumptions:
      "Needs a stable process, valid measurement and suitable distribution assumptions. Specification limits are not control limits, and Cp does not account for off-centre operation.",
    related: ["cpk", "process-capability", "specification-limit"],
  },
  cpk: {
    formula:
      "Cpk = minimum of [(upper specification limit − mean) ÷ (3σ)] and [(mean − lower specification limit) ÷ (3σ)]",
    assumptions:
      "Use a suitable within-process standard deviation, a stable process and appropriate distribution assumptions. Measurement error and non-normal data can invalidate a naive interpretation.",
    related: ["cp", "process-capability", "measurement-system-analysis"],
  },
  "planned-value": {
    example:
      "Illustrative: if approved baseline work worth NGN 200,000 was scheduled by the review date, PV is NGN 200,000. This is not a spending record.",
    related: ["earned-value", "actual-cost", "schedule-variance"],
  },
  "earned-value": {
    example:
      "Illustrative: a work package has a baseline budget of NGN 100,000 and an agreed measurement method confirms 40% completion. EV is NGN 40,000.",
    related: ["planned-value", "actual-cost", "earned-value-management"],
  },
  "cost-variance": {
    formula: "CV = EV − AC",
    assumptions:
      "Use the same scope, cutoff date, currency and accounting basis. Positive CV means earned value exceeds actual cost; it is not the same as budget remaining.",
    example:
      "Illustrative: EV of 120,000 and AC of 150,000 produce CV of −30,000.",
    related: ["earned-value", "actual-cost", "cost-performance-index"],
  },
  "schedule-variance": {
    formula: "SV = EV − PV",
    assumptions:
      "Use a valid time-phased earned-value baseline. Negative SV indicates less value completed than planned; it does not directly measure days late.",
    related: ["earned-value", "planned-value", "schedule-performance-index"],
  },
  "cost-performance-index": {
    formula: "CPI = EV ÷ AC",
    assumptions:
      "AC must be greater than zero and EV must be credibly measured against an approved baseline. Above 1 indicates favourable cost efficiency on that basis.",
    example: "Illustrative: EV 80,000 ÷ AC 100,000 gives CPI 0.80.",
    related: ["earned-value", "actual-cost", "estimate-at-completion"],
  },
  "schedule-performance-index": {
    formula: "SPI = EV ÷ PV",
    assumptions:
      "PV must be greater than zero. SPI is value-based; it can approach 1 at completion even when a project finishes late.",
    related: ["planned-value", "earned-value", "schedule-variance"],
  },
  "estimate-at-completion": {
    formula: "EAC = AC + ETC; a common conditional forecast is EAC = BAC ÷ CPI",
    assumptions:
      "The BAC/CPI forecast assumes current cost efficiency continues and CPI is positive. Select a forecasting method that matches the evidence.",
    related: [
      "estimate-to-complete",
      "budget-at-completion",
      "cost-performance-index",
    ],
  },
  "estimate-to-complete": {
    formula: "ETC = EAC − AC",
    assumptions:
      "Use a consistent cost scope, period and currency; independently estimate remaining work when past performance is not representative.",
    related: ["estimate-at-completion", "actual-cost", "forecast"],
  },
  "variance-at-completion": {
    formula: "VAC = BAC − EAC",
    assumptions:
      "On this convention, positive VAC forecasts spending below the baseline budget and negative VAC forecasts spending above it.",
    related: [
      "budget-at-completion",
      "estimate-at-completion",
      "cost-variance",
    ],
  },
  "to-complete-performance-index": {
    formula: "TCPI to meet BAC = (BAC − EV) ÷ (BAC − AC)",
    assumptions:
      "The remaining-budget denominator must be positive. A different target, such as EAC, requires the corresponding denominator; the result is a required efficiency, not a guarantee.",
    related: ["budget-at-completion", "earned-value", "cost-performance-index"],
  },
  "budget-utilisation": {
    formula:
      "Budget utilisation (%) = recorded expenditure ÷ defined budget × 100",
    assumptions:
      "The budget must be positive. Use comparable scope, currency and accounting treatment; this does not measure earned value.",
    related: ["budget", "actual-cost", "cost-performance-index"],
  },
  "return-on-investment": {
    formula: "ROI (%) = net investment gain ÷ investment cost × 100",
    assumptions:
      "Investment cost must be positive. Define net gain, time period, taxes and the treatment of ongoing costs; simple ROI does not capture timing of cash flows.",
    related: ["net-present-value", "internal-rate-of-return", "payback-period"],
  },
  "net-present-value": {
    formula: "NPV = Σ from t = 0 to T of CFₜ ÷ (1 + r)ᵗ",
    assumptions:
      "CF₀ normally includes the initial cash outflow. Discount rate and cash-flow periods must match; document inflation, currency and risk assumptions.",
    related: ["cash-flow", "internal-rate-of-return", "cost-benefit-analysis"],
  },
  "payback-period": {
    formula:
      "For equal periodic net inflows: payback = initial investment ÷ net inflow per period",
    assumptions:
      "The shortcut assumes positive, equal inflows. Otherwise accumulate the actual projected flows until the investment is recovered.",
    related: ["cash-flow", "net-present-value", "return-on-investment"],
  },
  "profit-margin": {
    formula: "Margin (%) = specified profit ÷ revenue × 100",
    assumptions:
      "Revenue must be positive and the profit definition must be stated. Gross, operating and net margins are different measures.",
    related: ["markup", "direct-cost", "return-on-investment"],
  },
  markup: {
    formula: "Markup (%) = (selling price − cost) ÷ cost × 100",
    assumptions:
      "Cost must be positive. Markup uses cost as the denominator, whereas margin uses revenue.",
    example:
      "Illustrative: cost 100 and price 125 give 25% markup but 20% gross margin.",
    related: ["profit-margin", "cost-estimate", "total-cost-of-ownership"],
  },
  "total-float": {
    formula:
      "Total float = late start − early start = late finish − early finish",
    assumptions:
      "Use the same schedule calendar and consistent network calculations. Constraints can produce negative float.",
    related: ["critical-path", "free-float", "critical-path-method"],
  },
  "expected-monetary-value": {
    formula: "EMV = Σ (outcome probability × financial effect)",
    assumptions:
      "Use credible probabilities and a consistent sign convention. Ordinal risk ratings such as 1–5 cannot be substituted for probabilities.",
    related: ["probability", "risk-score", "contingency-reserve"],
  },
  "risk-score": {
    formula:
      "One common screening method: score = probability rating × impact rating",
    assumptions:
      "Ratings such as 1–5 are ordinal screening categories. A score of 20/25 does not mean an 80% likelihood or a quantified loss.",
    related: ["probability", "risk-impact", "expected-monetary-value"],
  },
  "first-pass-yield": {
    formula:
      "FPY (%) = acceptable units without rework ÷ units entering the process × 100",
    assumptions:
      "Use a positive input count and consistent first-attempt boundaries; account for scrapped units explicitly.",
    related: ["rework", "quality-control", "overall-equipment-effectiveness"],
  },
  "capacity-utilisation": {
    formula:
      "One output-based measure: utilisation (%) = actual output ÷ design capacity × 100",
    assumptions:
      "Capacity must be positive and stated for the same period, product mix and unit basis. Other utilisation definitions use resource hours.",
    related: [
      "design-capacity",
      "effective-capacity",
      "operational-efficiency",
    ],
  },
  "operational-efficiency": {
    formula:
      "One capacity measure: efficiency (%) = actual output ÷ effective capacity × 100",
    assumptions:
      "Effective capacity must be positive. Labour, energy and service-efficiency measures use other denominators; label the selected definition.",
    related: [
      "effective-capacity",
      "capacity-utilisation",
      "service-productivity",
    ],
  },
  "takt-time": {
    formula: "Takt time = available production time ÷ customer demand",
    assumptions:
      "Demand must be positive and measured for the same period as available time. Use compatible time and unit quantities.",
    related: ["cycle-time", "throughput", "bottleneck"],
  },
  "little-s-law": {
    formula: "Average WIP = average throughput × average time in the system",
    assumptions:
      "Use a stable observation period, consistent units and the same system boundary. The time may be called lead time or cycle time in different contexts.",
    example:
      "Illustrative: throughput of 5 items/day and average time of 4 days imply average WIP of 20 items.",
    related: ["work-in-progress", "throughput", "cycle-time"],
  },
  "overall-equipment-effectiveness": {
    formula: "OEE = availability × performance × quality",
    assumptions:
      "Use fractions, not whole percentages, in multiplication. Availability = run time/planned production time; performance = ideal cycle time × total count/run time; quality = good count/total count. Keep definitions and denominators consistent.",
    example: "Illustrative: 0.90 × 0.95 × 0.98 = 0.8379, or 83.79%.",
    related: [
      "availability",
      "first-pass-yield",
      "total-productive-maintenance",
    ],
  },
  "economic-order-quantity": {
    formula: "EOQ = √(2 × D × S ÷ H)",
    assumptions:
      "D is demand per period, S is cost per order, H is holding cost per unit for that period. The basic model assumes steady demand, stable costs, replenishment certainty and no shortages.",
    related: ["reorder-point", "inventory-carrying-cost", "safety-stock"],
  },
  "reorder-point": {
    formula:
      "ROP = expected demand during replenishment lead time + safety stock",
    assumptions:
      "Use consistent units and a realistic replenishment lead time. Review the policy when demand or supply variability changes.",
    related: ["safety-stock", "lead-time", "inventory-position"],
  },
  "safety-stock": {
    formula:
      "One statistical model: safety stock = z × standard deviation of lead-time demand",
    assumptions:
      "This model needs an appropriate distribution, a defined service target and a credible estimate of lead-time-demand variability. It is not a universal stock rule.",
    related: ["reorder-point", "stockout", "fill-rate"],
  },
  "inventory-turnover": {
    formula:
      "Inventory turnover = cost of goods sold ÷ average inventory at cost",
    assumptions:
      "Use the same period and compatible valuation; average inventory must be positive. Sales revenue is not a substitute for cost of goods sold.",
    related: [
      "days-inventory-outstanding",
      "inventory-carrying-cost",
      "inventory",
    ],
  },
  "days-inventory-outstanding": {
    formula:
      "DIO = average inventory at cost ÷ cost of goods sold × days in period",
    assumptions:
      "Use positive cost of goods sold and a consistent accounting period. This is an aggregate estimate, not the age of every stocked item.",
    related: [
      "inventory-turnover",
      "inventory-obsolescence",
      "working-capital",
    ],
  },
  "fill-rate": {
    formula:
      "Unit fill rate (%) = units fulfilled immediately ÷ total units demanded × 100",
    assumptions:
      "Use a positive demand count. Order-fill and line-fill rates use different counting bases and should not be mixed.",
    related: ["stockout", "backorder", "on-time-in-full-delivery"],
  },
  "on-time-in-full-delivery": {
    formula:
      "OTIF (%) = orders meeting both timing and completeness criteria ÷ eligible orders × 100",
    assumptions:
      "Define promised dates, delivery windows, exclusions and what counts as complete before measuring. Denominator must be positive.",
    related: ["order-fulfilment", "fill-rate", "service-level-agreement"],
  },
  "mean-time-between-failures": {
    formula: "MTBF = total operating time ÷ number of failures",
    assumptions:
      "Applies to a defined repairable system and observation basis. A period with zero failures does not provide a finite observed MTBF by this formula.",
    related: ["mean-time-to-repair", "reliability", "availability"],
  },
  "mean-time-to-repair": {
    formula: "Mean repair time = total defined repair time ÷ number of repairs",
    assumptions:
      "Specify whether detection, waiting, logistics and testing are included. MTTR can instead mean mean time to restore in some organisations.",
    related: ["mean-time-between-failures", "downtime", "maintainability"],
  },
  availability: {
    formula:
      "Observed availability = available time ÷ defined required-service time; a steady-state model is MTBF ÷ (MTBF + MTTR)",
    assumptions:
      "The MTBF/MTTR model assumes compatible uptime and restoration boundaries and representative averages. State how planned downtime is treated.",
    related: [
      "mean-time-between-failures",
      "mean-time-to-repair",
      "overall-equipment-effectiveness",
    ],
  },
  "risk-priority-number": {
    formula:
      "Traditional FMEA RPN = severity rating × occurrence rating × detection rating",
    assumptions:
      "Use the rating convention of the selected method. Different combinations can produce the same RPN; serious safety consequences require judgement beyond the number.",
    related: [
      "failure-modes-and-effects-analysis",
      "failure-mode",
      "risk-score",
    ],
  },
  "error-budget": {
    formula: "Error-budget fraction = 1 − SLO target fraction",
    assumptions:
      "Apply the budget to the same service indicator, event population and observation window. Request-based budgets and time-based budgets are different.",
    example:
      "Illustrative: a 99.9% request-success objective permits a 0.1% unsuccessful-request budget within the defined window.",
    related: ["service-level-objective", "service-level-indicator", "incident"],
  },
  baseline: {
    related: [
      "scope-baseline",
      "cost-baseline",
      "performance-measurement-baseline",
    ],
  },
  "cycle-time": { related: ["lead-time", "takt-time", "little-s-law"] },
  "lead-time": { related: ["cycle-time", "reorder-point", "little-s-law"] },
  "work-breakdown-structure": {
    example:
      "Illustrative: an irrigation project could group scope into survey, design, installation and handover deliverables, then decompose each into owned work packages.",
    related: ["work-package", "wbs-dictionary", "scope-baseline"],
  },
  "raci-matrix": {
    example:
      "Illustrative: for a budget approval, finance may be responsible for preparation, the sponsor accountable, the project manager consulted and the team informed.",
    related: ["accountability", "responsibility", "delegation-of-authority"],
  },
  output: {
    example:
      "Illustrative: delivering farmer training is an output; applying improved practices is an outcome. Neither should be claimed without evidence.",
    related: ["outcome", "impact", "results-chain"],
  },
  outcome: { related: ["output", "impact", "theory-of-change"] },
  "project-charter": {
    related: ["sponsor", "project-management-plan", "business-case"],
  },
};
for (const term of knowledgeTerms) {
  Object.assign(term, enhancements[term.id] || {});
  if (!term.related.length)
    term.related = knowledgeTerms
      .filter((t) => t.category === term.category && t.id !== term.id)
      .slice(0, 3)
      .map((t) => t.id);
}
export const knowledgeEdition = "2026-11";
