import React, { useEffect, useState, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Wallet,
  CalendarDays,
  ShieldAlert,
  FileText,
  Users,
  Layers,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  MoreHorizontal,
  Check,
  Download,
  Pencil,
  Trash2,
  Copy,
  Leaf,
  Building2,
  Globe2,
  CheckCircle2,
  LoaderCircle,
  Target,
  TrendingUp,
  Clock,
  HelpCircle,
} from "lucide-react";
const FinanceChart = lazy(() => import("./FinanceChart"));
import { api, today, money, type Bundle, type Project } from "./api";
import "./styles.css";
import Templates from "./Templates";
import { documentTypes } from "../shared/templates";
const industries = [
  "Agriculture",
  "Construction",
  "NGO & development",
  "Consulting",
  "Logistics",
  "Technology",
  "Other",
];
const currencies = ["NGN", "USD", "GHS", "KES"];
const nav = [
  ["Dashboard", LayoutDashboard],
  ["My Projects", FolderKanban],
  ["AI Project Planner", Sparkles],
  ["Budget & Finance", Wallet],
  ["Schedule", CalendarDays],
  ["Risk Management", ShieldAlert],
  ["Reports & Documents", FileText],
  ["Templates", Layers],
] as const;
type Field = {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  help?: string;
};
type Modal = {
  title: string;
  fields: Field[];
  initial?: any;
  save: (data: any) => Promise<void>;
  submit?: string;
};
const projectFields: Field[] = [
  { name: "title", label: "Project name", required: true },
  {
    name: "description",
    label: "What are you working towards?",
    type: "textarea",
  },
  { name: "industry", label: "Industry", options: industries },
  { name: "location", label: "Location" },
  {
    name: "currency",
    label: "Project currency",
    options: currencies,
    help: "Budgets remain in this currency. No exchange-rate assumptions.",
  },
  { name: "start_date", label: "Start date", type: "date", required: true },
  { name: "end_date", label: "End date", type: "date", required: true },
  {
    name: "status",
    label: "Status",
    options: ["Active", "On hold", "Completed"],
  },
  {
    name: "contingency",
    label: "Contingency (%)",
    type: "number",
    min: 0,
    max: 100,
  },
  {
    name: "tax",
    label: "Tax (%)",
    type: "number",
    min: 0,
    max: 100,
    help: "Applied to subtotal + contingency. Set your applicable rate.",
  },
];
function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <Layers size={22} />
      </span>
      <span>
        ProjectManager
        <span className="logo-sub">
          AI AFRICA <i />
        </span>
      </span>
    </span>
  );
}
function App() {
  const [user, setUser] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [publicPage, setPublicPage] = useState("Home"),
    [authMode, setAuthMode] = useState(""),
    [view, setView] = useState("Dashboard"),
    [projects, setProjects] = useState<Bundle[]>([]),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState<Modal | null>(null),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(""),
    [config, setConfig] = useState({
      aiConfigured: false,
      recoveryConfigured: false,
    }),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("Overview"),
    [currency, setCurrency] = useState("NGN");
  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 4500);
  };
  const refresh = async () => {
    const p = await api("/projects");
    setProjects(p);
  };
  async function load() {
    setLoading(true);
    try {
      const u = await api("/me");
      setUser(u);
      setCurrency(u.currency);
      setView("Dashboard");
      setSelected("");
      await refresh();
    } catch (e) {
      if ((e as Error).message !== "Please sign in to continue")
        setError((e as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    api("/config")
      .then(setConfig)
      .catch(() => {});
    if (new URLSearchParams(location.search).has("reset")) setAuthMode("reset");
  }, []);
  const active = projects.find((p) => p.project.id === selected);
  const filtered = projects.filter((p) =>
    `${p.project.title} ${p.project.industry} ${p.project.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const currencyProjects = projects.filter(
    (p) => p.project.currency === currency,
  );
  const total = currencyProjects.reduce((s, p) => s + p.finance.total, 0),
    spent = currencyProjects.reduce((s, p) => s + p.finance.spent, 0);
  const tasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({
      ...t,
      project: p.project.title,
      projectId: p.project.id,
    })),
  );
  const risks = projects.flatMap((p) =>
    p.risks.map((t) => ({
      ...t,
      project: p.project.title,
      projectId: p.project.id,
    })),
  );
  const overdue = tasks.filter(
    (t) => t.end_date < today() && t.status !== "Done",
  );
  const progress = tasks.length
    ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)
    : null;
  const navigate = (name: string) => {
    setView(name);
    setSelected("");
    setSearch("");
    setMobile(false);
  };
  const open = (p: Bundle, t = "Overview") => {
    setSelected(p.project.id);
    setView("My Projects");
    setTab(t);
  };
  function createProject(existing?: Project) {
    setModal({
      title: existing ? "Edit project" : "Create a new project",
      fields: projectFields,
      initial: existing || {
        industry: user.industry,
        currency: user.currency,
        start_date: today(),
        end_date: today(),
        status: "Active",
        contingency: 0,
        tax: 0,
      },
      save: async (values) => {
        const saved = await api(
          "/projects" + (existing ? "/" + existing.id : ""),
          existing ? "PUT" : "POST",
          values,
        );
        await refresh();
        setSelected(saved.project.id);
        setView("My Projects");
        setTab("Overview");
        notify(
          existing ? "Project updated" : "Your project workspace is ready",
        );
      },
    });
  }
  const resourceFields = (resource: string): Field[] =>
    (
      ({
        tasks: [
          { name: "title", label: "Task name", required: true },
          {
            name: "owner",
            label: "Responsible person",
            help: "A name for tracking; invitations arrive in Phase 2.",
          },
          {
            name: "start_date",
            label: "Start date",
            type: "date",
            required: true,
          },
          { name: "end_date", label: "Due date", type: "date", required: true },
          {
            name: "status",
            label: "Status",
            options: ["To do", "In progress", "Done"],
          },
          {
            name: "progress",
            label: "Progress (%)",
            type: "number",
            min: 0,
            max: 100,
            required: true,
          },
        ],
        budget_items: [
          { name: "title", label: "Budget item", required: true },
          {
            name: "category",
            label: "Category",
            options: [
              "Labour",
              "Equipment",
              "Materials",
              "Transport",
              "Fuel & energy",
              "Accommodation",
              "Professional fees",
              "Administration",
              "Other",
            ],
          },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            min: 0.001,
            step: "0.001",
            required: true,
          },
          {
            name: "rate",
            label: `Unit cost (${active?.project.currency})`,
            type: "number",
            min: 0,
            step: "0.01",
            required: true,
            help: "Enter a sourced estimate. Budget lines are estimates, expenses are recorded actuals.",
          },
        ],
        expenses: [
          { name: "title", label: "Expense description", required: true },
          {
            name: "amount",
            label: `Amount (${active?.project.currency})`,
            type: "number",
            min: 0.01,
            step: "0.01",
            required: true,
          },
          { name: "date", label: "Expense date", type: "date", required: true },
        ],
        risks: [
          { name: "title", label: "Risk description", required: true },
          {
            name: "category",
            label: "Category",
            options: [
              "Financial",
              "Operational",
              "Technical",
              "Environmental",
              "Regulatory",
              "Security",
              "Procurement",
              "Stakeholder",
            ],
          },
          {
            name: "probability",
            label: "Probability (1–5)",
            type: "number",
            min: 1,
            max: 5,
            required: true,
          },
          {
            name: "impact",
            label: "Impact (1–5)",
            type: "number",
            min: 1,
            max: 5,
            required: true,
          },
          {
            name: "warning",
            label: "Early warning indicators",
            type: "textarea",
          },
          {
            name: "mitigation",
            label: "Mitigation measures",
            type: "textarea",
          },
          {
            name: "contingency",
            label: "Contingency actions",
            type: "textarea",
          },
          { name: "owner", label: "Risk owner" },
          {
            name: "review_date",
            label: "Review date",
            type: "date",
            required: true,
          },
          {
            name: "status",
            label: "Status",
            options: ["Open", "Mitigating", "Closed"],
          },
        ],
        updates: [
          {
            name: "date",
            label: "Reporting date",
            type: "date",
            required: true,
          },
          {
            name: "content",
            label: "Recorded progress, issues and decisions",
            type: "textarea",
            required: true,
            help: "Include only information you can substantiate. AI reports use these records.",
          },
        ],
        documents: [
          { name: "title", label: "Document title", required: true },
          {
            name: "type",
            label: "Document type",
            options: [...documentTypes],
          },
          { name: "content", label: "Document content", type: "textarea" },
        ],
      }) as Record<string, Field[]>
    )[resource];
  function editResource(resource: string, row?: any, projectId?: string) {
    const id = projectId || selected;
    setModal({
      title: `${row ? "Edit" : "Add"} ${{ tasks: "task", budget_items: "budget item", expenses: "expense", risks: "risk", updates: "progress update", documents: "document" }[resource as "tasks"] || resource}`,
      fields: resourceFields(resource),
      initial: row
        ? { ...row, rate: row.rateMinor / 100, amount: row.amountMinor / 100 }
        : {
            start_date: active?.project.start_date || today(),
            end_date: active?.project.end_date || today(),
            date: today(),
            review_date: today(),
            status: resource === "tasks" ? "To do" : "Open",
            progress: 0,
            quantity: 1,
            probability: 3,
            impact: 3,
          },
      save: async (values) => {
        const data = { ...values };
        if (resource === "budget_items") {
          data.rateMinor = Math.round(data.rate * 100);
          delete data.rate;
        }
        if (resource === "expenses") {
          data.amountMinor = Math.round(data.amount * 100);
          delete data.amount;
        }
        await api(
          `/projects/${id}/${resource}${row ? "/" + row.id : ""}`,
          row ? "PUT" : "POST",
          data,
        );
        await refresh();
        notify("Saved successfully");
      },
    });
  }
  async function removeResource(resource: string, row: any) {
    if (!confirm(`Delete this ${resource.replace("_", " ")} record?`)) return;
    try {
      await api(`/projects/${selected}/${resource}/${row.id}`, "DELETE");
      await refresh();
      notify("Record deleted");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function generate(kind: string, prompt = "") {
    if (!active) return;
    setBusy(true);
    setError("");
    try {
      await api(`/projects/${selected}/ai`, "POST", { kind, prompt });
      await refresh();
      setTab("Documents");
      notify("AI draft saved. Review the content before sharing.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const exportProject = async (format: string, docId?: string) => {
    try {
      const response = await fetch(
        `/api/projects/${selected}/export/${format}${docId ? "?document=" + docId : ""}`,
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${selected}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      notify("Your export is ready");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const actionIcons = (resource: string, row: any) => (
    <div className="row-actions">
      <button
        className="icon-button"
        aria-label={`Edit ${row.title || "update"}`}
        onClick={() => editResource(resource, row)}
      >
        <Pencil size={15} />
      </button>
      <button
        className="icon-button danger"
        aria-label={`Delete ${row.title || "update"}`}
        onClick={() => removeResource(resource, row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
  function ProjectTable({ items }: { items: Bundle[] }) {
    return items.length ? (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Project name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Due date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const done = p.tasks.length
                ? Math.round(
                    p.tasks.reduce((s, t) => s + t.progress, 0) /
                      p.tasks.length,
                  )
                : null;
              return (
                <tr key={p.project.id}>
                  <td>
                    <button className="project-name" onClick={() => open(p)}>
                      <span
                        className={`project-icon ${p.project.industry === "Agriculture" ? "green" : ""}`}
                      >
                        {p.project.industry === "Agriculture" ? (
                          <Leaf size={19} />
                        ) : (
                          <Building2 size={19} />
                        )}
                      </span>
                      <span>
                        {p.project.title}
                        <small>
                          {p.project.industry} ·{" "}
                          {p.project.location || "Location not set"}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <Badge value={p.project.status} />
                  </td>
                  <td>
                    <div className="table-progress">
                      <span>{done === null ? "No tasks" : done + "%"}</span>
                      <div className="track">
                        <i style={{ width: (done || 0) + "%" }} />
                      </div>
                    </div>
                  </td>
                  <td>{money(p.finance.total, p.project.currency)}</td>
                  <td>{displayDate(p.project.end_date)}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${p.project.title}`}
                      onClick={() => open(p)}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty
        icon={<FolderKanban size={26} />}
        title="Your next project starts here"
        text="Create a project to bring its plan, people and numbers into one place."
        action="Create your first project"
        onClick={() => createProject()}
      />
    );
  }
  if (loading)
    return (
      <div className="loading-page">
        <Logo />
        <LoaderCircle className="spin" />
        <p>Opening your workspace…</p>
      </div>
    );
  return (
    <>
      {!user ? (
        <>
          <header className="public-header">
            <button
              className="unstyled"
              onClick={() => {
                setAuthMode("");
                setPublicPage("Home");
              }}
            >
              <Logo />
            </button>
            <nav>
              {["Features", "Industries", "Pricing", "About", "FAQ"].map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPublicPage(p);
                      setAuthMode("");
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
            </nav>
            <div className="button-group">
              <button
                className="button quiet"
                onClick={() => setAuthMode("login")}
              >
                Sign in
              </button>
              <button
                className="button primary"
                onClick={() => setAuthMode("register")}
              >
                Get started <ArrowUpRight size={16} />
              </button>
            </div>
          </header>
          {authMode ? (
            <Auth mode={authMode} setMode={setAuthMode} onSuccess={load} />
          ) : publicPage === "Home" ? (
            <main className="landing">
              <span className="eyebrow">
                <i /> BUILT FOR AFRICAN AMBITION
              </span>
              <h1>
                Big ideas.
                <br />
                Better plans.
                <br />
                <em>Real progress.</em>
              </h1>
              <p className="hero-tagline">
                Plan Smarter. Control Costs.
                <br />
                Deliver Projects Successfully.
              </p>
              <p className="hero-description">
                Your AI-powered project management partner for planning,
                budgeting, monitoring, and reporting projects across Africa and
                beyond.
              </p>
              <div className="button-group">
                <button
                  className="button primary large"
                  onClick={() => setAuthMode("register")}
                >
                  Start your first project <ArrowUpRight size={18} />
                </button>
                <button
                  className="button secondary large"
                  onClick={() => setPublicPage("Features")}
                >
                  Explore features <ArrowRight size={17} />
                </button>
              </div>
              <div className="hero-trust">
                <span>
                  <Check size={15} /> No credit card required
                </span>
                <span>
                  <Check size={15} /> Your data, your workspace
                </span>
              </div>
              <div className="hero-art">
                <div className="art-top">
                  <span className="dot" />
                  <span>FROM IDEA TO IMPACT</span>
                  <span>01 — 03</span>
                </div>
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <Globe2 className="globe" size={280} strokeWidth={0.6} />
                <div className="art-card card-plan">
                  <span className="art-icon">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    Clarity from day one
                    <small>Ideas become actionable plans</small>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
                <div className="art-card card-budget">
                  <span className="art-icon">
                    <Wallet size={20} />
                  </span>
                  <div>
                    Every cost accounted for
                    <small>Transparent budgets. Better decisions.</small>
                  </div>
                </div>
                <div className="art-bottom">
                  <span>
                    ROOTED IN AFRICA.
                    <br />
                    BUILT FOR WHAT’S NEXT.
                  </span>
                  <ArrowUpRight size={40} />
                </div>
              </div>
              <section className="landing-features">
                {[
                  [
                    FolderKanban,
                    "A plan with purpose",
                    "Bring your scope, tasks and milestones together.",
                  ],
                  [
                    Wallet,
                    "Confidence in every cost",
                    "Track estimates, spending and budget variance.",
                  ],
                  [
                    FileText,
                    "Ready for the next conversation",
                    "Turn recorded progress into professional reports.",
                  ],
                ].map(([Icon, title, text]: any) => (
                  <article key={title}>
                    <Icon size={22} />
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </section>
            </main>
          ) : (
            <PublicPage
              page={publicPage}
              register={() => setAuthMode("register")}
            />
          )}
          <footer>
            <span>© {new Date().getFullYear()} ProjectManager AI Africa</span>
            <div>
              {["Contact", "Privacy", "Terms"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setAuthMode("");
                    setPublicPage(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </footer>
        </>
      ) : (
        <div className="app-shell">
          <aside className={`sidebar ${mobile ? "open" : ""}`}>
            <Logo />
            <div className="workspace-switch">
              <span className="workspace-avatar">
                {user.organisation?.slice(0, 1)}
              </span>
              <span>
                {user.organisation}
                <small>Your organisation</small>
              </span>
              <span className="workspace-badge">MVP</span>
            </div>
            <span className="nav-label">WORKSPACE</span>
            <nav>
              {nav.map(([name, Icon]) => (
                <button
                  key={name}
                  className={view === name ? "active" : ""}
                  onClick={() => navigate(name)}
                >
                  <Icon size={19} />
                  <span>{name}</span>
                  {name === "AI Project Planner" && (
                    <span className="ai-tag">AI</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-guide">
              <span className="art-icon">
                <Leaf size={19} />
              </span>
              <h4>Built for your next big idea.</h4>
              <p>A clear plan is the first step towards lasting impact.</p>
              <button onClick={() => createProject()}>
                Let’s get started <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="sidebar-bottom">
              <button
                onClick={() => navigate("Settings")}
                className={view === "Settings" ? "active" : ""}
              >
                <Settings size={18} /> Settings & account
              </button>
              <button onClick={() => navigate("Help")}>
                <HelpCircle size={18} /> Help & resources
              </button>
            </div>
          </aside>
          {mobile && (
            <button
              className="mobile-shade"
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            />
          )}
          <div className="main-shell">
            <header className="app-header">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMobile(true)}
              >
                <Menu size={21} />
              </button>
              <div className="breadcrumb">
                Workspace <ChevronRight size={13} />{" "}
                <strong>{active ? active.project.title : view}</strong>
              </div>
              <div className="header-right">
                <span className="local-date">
                  {new Intl.DateTimeFormat("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  }).format(new Date())}
                </span>
                <button
                  className="icon-button"
                  aria-label="View upcoming tasks and risks"
                  onClick={() => navigate("Schedule")}
                >
                  <Bell size={19} />
                  {overdue.length > 0 && <i className="notification-dot" />}
                </button>
                <span className="header-divider" />
                <span className="avatar">
                  {user.name
                    .split(" ")
                    .map((x: string) => x[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="user-label">
                  {user.name}
                  <small>Organisation owner</small>
                </div>
              </div>
            </header>
            <main className="workspace-main">
              {error && (
                <div className="alert error" role="alert">
                  {error}
                  <button
                    aria-label="Dismiss error"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {active ? (
                <>
                  <button className="back-link" onClick={() => setSelected("")}>
                    <ChevronLeft size={15} /> All projects
                  </button>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">
                        {active.project.industry} · {active.project.currency}
                      </div>
                      <h1>{active.project.title}</h1>
                      <p>
                        {active.project.location || "Location not set"} ·{" "}
                        {displayDate(active.project.start_date)} –{" "}
                        {displayDate(active.project.end_date)}
                      </p>
                    </div>
                    <div className="button-group">
                      <button
                        className="button secondary"
                        onClick={() => createProject(active.project)}
                      >
                        <Pencil size={15} /> Edit project
                      </button>
                      <button
                        className="button primary"
                        onClick={() => exportProject("pdf")}
                      >
                        <Download size={16} /> Export
                      </button>
                    </div>
                  </div>
                  <div className="tabs">
                    {[
                      "Overview",
                      "Budget",
                      "Tasks",
                      "Risks",
                      "Updates",
                      "Documents",
                      "Templates",
                      "AI Planner",
                    ].map((t) => (
                      <button
                        className={tab === t ? "active" : ""}
                        onClick={() => setTab(t)}
                        key={t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {tab === "Overview" && (
                    <>
                      <div className="stats-grid">
                        <Stat
                          label="Approved / estimated budget"
                          value={money(
                            active.finance.total,
                            active.project.currency,
                          )}
                          icon={<Wallet />}
                          foot="From your budget line items"
                        />
                        <Stat
                          label="Actual expenditure"
                          value={money(
                            active.finance.spent,
                            active.project.currency,
                          )}
                          icon={<TrendingUp />}
                          foot="From recorded expenses"
                        />
                        <Stat
                          label="Remaining budget"
                          value={money(
                            active.finance.remaining,
                            active.project.currency,
                          )}
                          icon={<Target />}
                          foot="Budget less actual expenditure"
                        />
                        <Stat
                          label="Open risks"
                          value={String(
                            active.risks.filter((r) => r.status !== "Closed")
                              .length,
                          )}
                          icon={<ShieldAlert />}
                          foot="Review and assign owners"
                        />
                      </div>
                      <div className="two-columns">
                        <section className="panel">
                          <PanelHead title="Project brief" />
                          <p className="brief">
                            {active.project.description ||
                              "Add a description to capture your objectives, scope and intended impact."}
                          </p>
                          <dl className="details">
                            <div>
                              <dt>Status</dt>
                              <dd>
                                <Badge value={active.project.status} />
                              </dd>
                            </div>
                            <div>
                              <dt>Tasks completed</dt>
                              <dd>
                                {
                                  active.tasks.filter(
                                    (t) => t.status === "Done",
                                  ).length
                                }{" "}
                                / {active.tasks.length}
                              </dd>
                            </div>
                            <div>
                              <dt>Contingency / tax</dt>
                              <dd>
                                {active.project.contingency}% /{" "}
                                {active.project.tax}%
                              </dd>
                            </div>
                          </dl>
                          <div className="panel-footer">
                            <button
                              className="text-link"
                              onClick={() => setTab("AI Planner")}
                            >
                              Develop your project plan <ArrowRight size={15} />
                            </button>
                          </div>
                        </section>
                        <section className="panel">
                          <PanelHead title="Project controls" />
                          <div className="controls-note">
                            <ShieldAlert size={24} />
                            <h3>Make decisions from evidence</h3>
                            <p>
                              Task progress is a simple average of recorded task
                              percentages. CPI, SPI and completion forecasts
                              need an approved baseline and earned-value data,
                              which this MVP does not collect.
                            </p>
                            <p>
                              Budget variance:{" "}
                              <strong>
                                {money(
                                  active.finance.variance,
                                  active.project.currency,
                                )}
                              </strong>{" "}
                              (budget − actual).
                            </p>
                          </div>
                        </section>
                      </div>
                      <section className="panel">
                        <PanelHead title="Workspace actions" />
                        <div className="button-group action-pad">
                          <button
                            className="button secondary"
                            onClick={async () => {
                              try {
                                const result = await api(
                                  `/projects/${selected}/duplicate`,
                                  "POST",
                                );
                                await refresh();
                                setSelected(result.project.id);
                                notify(
                                  "Plan duplicated. Expenses and progress updates were not copied.",
                                );
                              } catch (e) {
                                setError((e as Error).message);
                              }
                            }}
                          >
                            <Copy size={16} /> Duplicate plan
                          </button>
                          <button
                            className="button danger-outline"
                            onClick={async () => {
                              if (
                                confirm(
                                  "Permanently delete this project and all its records?",
                                )
                              ) {
                                try {
                                  await api(`/projects/${selected}`, "DELETE");
                                  await refresh();
                                  setSelected("");
                                  notify("Project deleted");
                                } catch (e) {
                                  setError((e as Error).message);
                                }
                              }
                            }}
                          >
                            <Trash2 size={16} /> Delete project
                          </button>
                        </div>
                      </section>
                    </>
                  )}
                  {tab === "Budget" && (
                    <>
                      <div className="stats-grid">
                        <Stat
                          label="Budget subtotal"
                          value={money(
                            active.finance.subtotal,
                            active.project.currency,
                          )}
                          icon={<Wallet />}
                          foot="Quantity × unit rate"
                        />
                        <Stat
                          label="Contingency & tax"
                          value={money(
                            active.finance.contingency + active.finance.tax,
                            active.project.currency,
                          )}
                          icon={<Layers />}
                          foot="Edit rates in project settings"
                        />
                        <Stat
                          label="Actual spend"
                          value={money(
                            active.finance.spent,
                            active.project.currency,
                          )}
                          icon={<TrendingUp />}
                          foot={
                            active.finance.utilisation === null
                              ? "No budget recorded"
                              : active.finance.utilisation.toFixed(1) +
                                "% budget utilisation"
                          }
                        />
                        <Stat
                          label="Budget remaining"
                          value={money(
                            active.finance.remaining,
                            active.project.currency,
                          )}
                          icon={<Target />}
                          foot="Negative indicates overspend"
                        />
                      </div>
                      <section className="panel">
                        <PanelHead
                          title="Budget line items"
                          action="Add budget item"
                          onClick={() => editResource("budget_items")}
                        />
                        {active.budget_items.length ? (
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Category</th>
                                  <th>Quantity</th>
                                  <th>Unit rate</th>
                                  <th>Total</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {active.budget_items.map((b) => (
                                  <tr key={b.id}>
                                    <td>{b.title}</td>
                                    <td>{b.category}</td>
                                    <td>{b.quantity}</td>
                                    <td>
                                      {money(
                                        b.rateMinor,
                                        active.project.currency,
                                      )}
                                    </td>
                                    <td>
                                      {money(
                                        Math.round(b.quantity * b.rateMinor),
                                        active.project.currency,
                                      )}
                                    </td>
                                    <td>{actionIcons("budget_items", b)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <Empty
                            title="Build a transparent budget"
                            text="Add your own sourced cost estimates. We never invent market prices."
                          />
                        )}
                        <div className="panel-footer">
                          Total including contingency and tax{" "}
                          <strong>
                            {money(
                              active.finance.total,
                              active.project.currency,
                            )}
                          </strong>
                        </div>
                      </section>
                      <section className="panel">
                        <PanelHead
                          title="Recorded expenses"
                          action="Record expense"
                          onClick={() => editResource("expenses")}
                        />
                        {active.expenses.length ? (
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>Description</th>
                                  <th>Date</th>
                                  <th>Amount</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {active.expenses.map((e) => (
                                  <tr key={e.id}>
                                    <td>{e.title}</td>
                                    <td>{displayDate(e.date)}</td>
                                    <td>
                                      {money(
                                        e.amountMinor,
                                        active.project.currency,
                                      )}
                                    </td>
                                    <td>{actionIcons("expenses", e)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <Empty
                            title="No expenses yet"
                            text="Record actual expenditure as it happens to track your remaining budget."
                          />
                        )}
                      </section>
                      <section className="panel scenario">
                        <PanelHead title="What-if scenario" />
                        <Scenario bundle={active} />
                      </section>
                    </>
                  )}
                  {tab === "Tasks" && (
                    <section className="panel">
                      <PanelHead
                        title="Tasks & schedule"
                        action="Add task"
                        onClick={() => editResource("tasks")}
                      />
                      {active.tasks.length ? (
                        <>
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>Task</th>
                                  <th>Owner</th>
                                  <th>Schedule</th>
                                  <th>Status</th>
                                  <th>Progress</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {active.tasks.map((t) => (
                                  <tr key={t.id}>
                                    <td>
                                      {t.title}
                                      {t.end_date < today() &&
                                        t.status !== "Done" && (
                                          <small className="overdue-text">
                                            Overdue
                                          </small>
                                        )}
                                    </td>
                                    <td>{t.owner || "Unassigned"}</td>
                                    <td>
                                      {displayDate(t.start_date)} –{" "}
                                      {displayDate(t.end_date)}
                                    </td>
                                    <td>
                                      <Badge value={t.status} />
                                    </td>
                                    <td>{t.progress}%</td>
                                    <td>{actionIcons("tasks", t)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Gantt tasks={active.tasks} />
                        </>
                      ) : (
                        <Empty
                          title="Break the work into clear steps"
                          text="Add tasks, assign responsible people and track deadlines."
                        />
                      )}
                    </section>
                  )}
                  {tab === "Risks" && (
                    <section className="panel">
                      <PanelHead
                        title="Risk register"
                        action="Add risk"
                        onClick={() => editResource("risks")}
                      />
                      {active.risks.length ? (
                        <div className="risk-list">
                          {active.risks.map((r) => (
                            <article className="risk-card" key={r.id}>
                              <div
                                className={`risk-score ${r.probability * r.impact >= 15 ? "high" : ""}`}
                              >
                                {r.probability * r.impact}
                                <small>/ 25</small>
                              </div>
                              <div className="risk-body">
                                <div className="risk-heading">
                                  <h3>{r.title}</h3>
                                  <Badge value={r.status} />
                                </div>
                                <p>
                                  {r.category} · {r.owner || "Unassigned"} ·
                                  Review {displayDate(r.review_date)}
                                </p>
                                <dl>
                                  <div>
                                    <dt>Early warning</dt>
                                    <dd>{r.warning || "Not recorded"}</dd>
                                  </div>
                                  <div>
                                    <dt>Mitigation</dt>
                                    <dd>{r.mitigation || "Not recorded"}</dd>
                                  </div>
                                  <div>
                                    <dt>Contingency</dt>
                                    <dd>{r.contingency || "Not recorded"}</dd>
                                  </div>
                                </dl>
                              </div>
                              {actionIcons("risks", r)}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <Empty
                          title="Spot the risks. Plan the response."
                          text="Record probability and impact (1–5), early warnings and mitigation actions."
                        />
                      )}
                    </section>
                  )}
                  {tab === "Updates" && (
                    <section className="panel">
                      <PanelHead
                        title="Progress updates"
                        action="Record update"
                        onClick={() => editResource("updates")}
                      />
                      {active.updates.length ? (
                        <div className="update-list">
                          {active.updates.map((u) => (
                            <article key={u.id}>
                              <span className="update-dot" />
                              <div>
                                <small>
                                  {displayDate(u.date)} · Recorded update
                                </small>
                                <p>{u.content}</p>
                              </div>
                              {actionIcons("updates", u)}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <Empty
                          title="A reliable record of progress"
                          text="Capture completed activities, evidence, challenges and decisions for your next report."
                        />
                      )}
                      <div className="panel-footer">
                        <button
                          disabled={
                            busy ||
                            !config.aiConfigured ||
                            !active.updates.length
                          }
                          className="button primary"
                          onClick={() => generate("report")}
                        >
                          {busy ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <Sparkles size={16} />
                          )}{" "}
                          Draft progress report
                        </button>
                        <small>
                          {!config.aiConfigured
                            ? "Server AI configuration is required."
                            : "AI uses your saved project records. Review every draft."}
                        </small>
                      </div>
                    </section>
                  )}
                  {tab === "Templates" && (
                    <Templates
                      projects={projects}
                      fixedProject={active}
                      onCreateProject={() => createProject()}
                      onSaved={async () => {
                        await refresh();
                        notify(
                          "Template saved. Open Documents to export PDF or Word.",
                        );
                      }}
                    />
                  )}
                  {tab === "Documents" && (
                    <>
                      <div className="planner-intro">
                        <Layers size={25} />
                        <div>
                          <h3>Start from a project management template</h3>
                          <p>
                            Generate a charter, proposal, WBS, work plan, report
                            and more. No AI key required.
                          </p>
                          <button
                            className="button secondary"
                            onClick={() => setTab("Templates")}
                          >
                            Browse templates
                          </button>
                        </div>
                      </div>
                      <section className="panel">
                        <PanelHead
                          title="Reports & documents"
                          action="Create document"
                          onClick={() => editResource("documents")}
                        />
                        {active.documents.length ? (
                          <div className="document-list">
                            {active.documents.map((d) => (
                              <article key={d.id}>
                                <div className="document-heading">
                                  <span className="project-icon">
                                    <FileText size={20} />
                                  </span>
                                  <div>
                                    <h3>{d.title}</h3>
                                    <small>
                                      {d.type} · {d.source}
                                    </small>
                                  </div>
                                  {actionIcons("documents", d)}
                                </div>
                                <details>
                                  <summary>Read document</summary>
                                  <pre>
                                    {d.content ||
                                      "This document is empty. Edit it to add content."}
                                  </pre>
                                </details>
                                <div className="document-exports">
                                  {["pdf", "docx"].map((f) => (
                                    <button
                                      className="button secondary small"
                                      onClick={() => exportProject(f, d.id)}
                                      key={f}
                                    >
                                      <Download size={13} />
                                      {f.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <Empty
                            title="From project records to professional documents"
                            text="Write a document or use the AI planner to generate an editable first draft."
                          />
                        )}
                      </section>
                      <section className="panel">
                        <PanelHead title="Export project records" />
                        <div className="action-pad">
                          <p>
                            Download the current project summary, tasks, risks
                            and recorded updates. Excel includes all budget
                            lines, expenses and documents.
                          </p>
                          <div className="button-group">
                            {["pdf", "docx", "xlsx"].map((f) => (
                              <button
                                key={f}
                                className="button secondary"
                                onClick={() => exportProject(f)}
                              >
                                <Download size={16} />
                                {f.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                  {tab === "AI Planner" && (
                    <section className="panel ai-workspace">
                      <div className="planner-mark">
                        <Sparkles size={28} />
                      </div>
                      <span className="eyebrow">
                        YOUR PROJECT, WITH A CLEARER PATH
                      </span>
                      <h2>Turn your brief into a plan.</h2>
                      <p>
                        Generate an editable project plan from your saved
                        description, budget, tasks and risks. Missing
                        information is flagged; estimates require your review.
                      </p>
                      <div
                        className={`alert ${config.aiConfigured ? "success" : ""}`}
                      >
                        <strong>
                          {config.aiConfigured
                            ? "AI connection configured"
                            : "AI integration needs configuration"}
                        </strong>
                        <span>
                          {config.aiConfigured
                            ? "Generation uses the server-side provider. Credentials and quota are checked when you generate."
                            : "Set AI_API_KEY on the server to enable generation. You can create and edit project documents manually now."}
                        </span>
                      </div>
                      <div className="button-group">
                        <button
                          className="button primary"
                          disabled={busy || !config.aiConfigured}
                          onClick={() => generate("plan")}
                        >
                          {busy ? (
                            <LoaderCircle className="spin" size={17} />
                          ) : (
                            <Sparkles size={17} />
                          )}{" "}
                          Generate project plan
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => editResource("documents")}
                        >
                          Write a plan manually
                        </button>
                      </div>
                      <form
                        className="adviser"
                        onSubmit={(e) => {
                          e.preventDefault();
                          generate(
                            "advice",
                            new FormData(e.currentTarget).get(
                              "question",
                            ) as string,
                          );
                        }}
                      >
                        <h3>Ask your project adviser</h3>
                        <label htmlFor="question">
                          What would you like to understand?
                        </label>
                        <textarea
                          id="question"
                          name="question"
                          required
                          maxLength={4000}
                          placeholder="Which risks need attention this week?"
                        />
                        <button
                          className="button secondary"
                          disabled={busy || !config.aiConfigured}
                        >
                          Ask about this project <ArrowRight size={15} />
                        </button>
                      </form>
                    </section>
                  )}
                </>
              ) : view === "Dashboard" ? (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">YOUR WORK, MOVING FORWARD</div>
                      <h1>
                        Welcome back, {user.name.split(" ")[0]}{" "}
                        <span className="wave">✦</span>
                      </h1>
                      <p>Here’s the bigger picture of your projects today.</p>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => createProject()}
                    >
                      <Plus size={18} /> Create new project
                    </button>
                  </div>
                  <div className="dashboard-toolbar">
                    <span className="section-label">
                      <span className="status-dot" /> Workspace overview
                    </span>
                    <label className="currency-filter">
                      Financial currency{" "}
                      <select
                        aria-label="Dashboard currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        {currencies.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="stats-grid">
                    <Stat
                      label="Active projects"
                      value={String(
                        projects.filter((p) => p.project.status === "Active")
                          .length,
                      ).padStart(2, "0")}
                      icon={<FolderKanban />}
                      foot={`${projects.length} projects in your workspace`}
                      accent
                    />
                    <Stat
                      label="Total project budgets"
                      value={money(total, currency)}
                      icon={<Wallet />}
                      foot={`${currencyProjects.length} projects in ${currency}`}
                    />
                    <Stat
                      label="Actual expenditure"
                      value={money(spent, currency)}
                      icon={<TrendingUp />}
                      foot={
                        total
                          ? `${((spent / total) * 100).toFixed(1)}% of recorded budget`
                          : "Add a budget to track utilisation"
                      }
                    />
                    <Stat
                      label="Overall task progress"
                      value={progress === null ? "—" : progress + "%"}
                      icon={<Target />}
                      foot={
                        tasks.length
                          ? `Average across ${tasks.length} recorded tasks`
                          : "No task progress recorded yet"
                      }
                    />
                  </div>
                  <div className="dashboard-columns">
                    <section className="panel performance">
                      <PanelHead
                        title="Budget & expenditure"
                        subtitle={`Your recorded project finances · ${currency}`}
                        extra={<span className="subtle-pill">By project</span>}
                      />
                      {currencyProjects.some(
                        (p) => p.finance.total || p.finance.spent,
                      ) ? (
                        <>
                          <div className="chart-legend">
                            <span>
                              <i />
                              Budget
                            </span>
                            <span>
                              <i />
                              Actual spend
                            </span>
                          </div>
                          <div className="chart">
                            <Suspense
                              fallback={<p className="muted">Loading chart…</p>}
                            >
                              <FinanceChart
                                projects={currencyProjects}
                                currency={currency}
                              />
                            </Suspense>
                          </div>
                        </>
                      ) : (
                        <div className="chart-empty">
                          <div className="empty-bars">
                            {[35, 62, 47, 85, 61, 100, 76].map((h, i) => (
                              <span key={i} style={{ height: h }} />
                            ))}
                          </div>
                          <h3>Make every number count</h3>
                          <p>
                            Your budget and actual expenditure chart will appear
                            <br />
                            when you add financial records.
                          </p>
                          <button
                            className="text-link"
                            onClick={() => navigate("Budget & Finance")}
                          >
                            Manage project budgets <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </section>
                    <section className="panel attention">
                      <PanelHead
                        title="Needs your attention"
                        extra={
                          <span className="count-badge">
                            {overdue.length +
                              risks.filter(
                                (r) =>
                                  r.status !== "Closed" &&
                                  r.probability * r.impact >= 15,
                              ).length}
                          </span>
                        }
                      />
                      {overdue.length ||
                      risks.some(
                        (r) =>
                          r.status !== "Closed" &&
                          r.probability * r.impact >= 15,
                      ) ? (
                        <div className="attention-list">
                          {overdue.slice(0, 3).map((t) => (
                            <button
                              key={t.id}
                              onClick={() =>
                                open(
                                  projects.find(
                                    (p) => p.project.id === t.projectId,
                                  )!,
                                  "Tasks",
                                )
                              }
                            >
                              <span className="attention-icon">
                                <Clock size={17} />
                              </span>
                              <span>
                                <strong>{t.title}</strong>
                                <small>
                                  {t.project} · Overdue{" "}
                                  {displayDate(t.end_date)}
                                </small>
                              </span>
                              <ArrowUpRight size={16} />
                            </button>
                          ))}
                          {risks
                            .filter(
                              (r) =>
                                r.status !== "Closed" &&
                                r.probability * r.impact >= 15,
                            )
                            .slice(0, 2)
                            .map((r) => (
                              <button
                                key={r.id}
                                onClick={() =>
                                  open(
                                    projects.find(
                                      (p) => p.project.id === r.projectId,
                                    )!,
                                    "Risks",
                                  )
                                }
                              >
                                <span className="attention-icon amber">
                                  <ShieldAlert size={17} />
                                </span>
                                <span>
                                  <strong>{r.title}</strong>
                                  <small>
                                    High risk · {r.probability * r.impact}/25
                                  </small>
                                </span>
                                <ArrowUpRight size={16} />
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="attention-clear">
                          <span>
                            <CheckCircle2 size={29} />
                          </span>
                          <h3>A little clarity goes a long way.</h3>
                          <p>
                            {projects.length
                              ? "No overdue tasks or high-scoring open risks in your records."
                              : "As you add tasks and risks, we’ll highlight what needs your attention here."}
                          </p>
                          <div className="attention-line">
                            <span>Overdue activities</span>
                            <strong>{overdue.length}</strong>
                          </div>
                          <div className="attention-line">
                            <span>Open risks</span>
                            <strong>
                              {
                                risks.filter((r) => r.status !== "Closed")
                                  .length
                              }
                            </strong>
                          </div>
                        </div>
                      )}
                      <div className="panel-footer">
                        <button
                          className="text-link"
                          onClick={() => navigate("Risk Management")}
                        >
                          View risk register <ArrowRight size={14} />
                        </button>
                      </div>
                    </section>
                  </div>
                  <section className="panel">
                    <PanelHead
                      title="Your projects"
                      subtitle="A clear view of the work that matters."
                      action="View all projects"
                      onClick={() => navigate("My Projects")}
                    />
                    <ProjectTable items={projects.slice(0, 5)} />
                  </section>
                  <div className="insight-banner">
                    <div className="insight-icon">
                      <Sparkles size={23} />
                    </div>
                    <div>
                      <span className="eyebrow">LESS ADMIN. MORE IMPACT.</span>
                      <h3>A great project starts with a clear plan.</h3>
                      <p>
                        Turn your next idea into a structured, editable project
                        plan.
                      </p>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => navigate("AI Project Planner")}
                    >
                      Meet your AI planner <ArrowUpRight size={16} />
                    </button>
                  </div>
                </>
              ) : view === "Templates" ? (
                <Templates
                  projects={projects}
                  onCreateProject={() => createProject()}
                  onSaved={async () => {
                    await refresh();
                    notify("Template saved to project documents.");
                  }}
                />
              ) : view === "Settings" ? (
                <>
                  <PageTitle
                    title="Settings & account"
                    text="Your workspace, your preferences."
                  />
                  <section className="panel settings-panel">
                    <h2>{user.organisation}</h2>
                    <dl className="details">
                      {[
                        ["Name", user.name],
                        ["Email", user.email],
                        ["Country", user.country],
                        ["Industry", user.industry],
                        ["Preferred currency", user.currency],
                        ["Role", "Organisation owner"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="muted">
                      Account and organisation editing, invitations and
                      subscriptions are planned for later phases. No payment
                      information is collected in this MVP.
                    </p>
                    <button
                      className="button secondary"
                      onClick={async () => {
                        try {
                          await api("/auth/logout", "POST");
                          setUser(null);
                          setProjects([]);
                          setSelected("");
                          setAuthMode("login");
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </section>
                </>
              ) : view === "Help" ? (
                <>
                  <PageTitle
                    title="A little guidance, a lot of progress."
                    text="Get more from your workspace."
                  />
                  <section className="panel help-panel">
                    <h2>Your first project, step by step</h2>
                    <ol>
                      <li>
                        Create a project with its currency, dates and project
                        brief.
                      </li>
                      <li>
                        Add sourced budget estimates and record actual expenses.
                      </li>
                      <li>
                        Break work into tasks, set owners and track progress.
                      </li>
                      <li>
                        Record risks and progress updates as work unfolds.
                      </li>
                      <li>
                        Write or generate a plan, review it, and export your
                        documents.
                      </li>
                    </ol>
                    <h3>How the numbers work</h3>
                    <p>
                      Budget = subtotal + contingency + tax. Tax applies after
                      contingency. Remaining budget and variance = budget −
                      actual spend. Task progress is a simple average, not a
                      forecast. Different currencies are never combined.
                    </p>
                    <h3>AI and data</h3>
                    <p>
                      AI generation sends the selected project’s records to the
                      configured model provider. Only use it with data you are
                      authorised to share. Drafts require review. AI and email
                      recovery require server configuration; see the repository
                      README.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <PageTitle
                    title={view}
                    text={
                      {
                        "My Projects":
                          "From your first idea to your next milestone.",
                        "AI Project Planner":
                          "Turn project ideas into a clear path forward.",
                        "Budget & Finance":
                          "Every cost visible. Every decision informed.",
                        Schedule:
                          "Keep the right work moving at the right time.",
                        "Risk Management":
                          "See what could go wrong. Decide what to do next.",
                        "Reports & Documents":
                          "Professional documents, grounded in your records.",
                      }[view] || ""
                    }
                    action="Create new project"
                    onClick={() => createProject()}
                  />
                  {view === "AI Project Planner" && (
                    <div className="planner-intro">
                      <Sparkles size={27} />
                      <div>
                        <h3>Start with the project, then build the plan.</h3>
                        <p>
                          Choose a project below. Your saved brief and records
                          give the AI context, and you can review and edit every
                          draft.
                        </p>
                        <small>
                          {config.aiConfigured
                            ? "Server AI integration configured."
                            : "AI is not configured yet. Manual planning and documents are available."}
                        </small>
                      </div>
                    </div>
                  )}
                  <section className="panel">
                    <div className="list-toolbar">
                      <h2>
                        {view === "My Projects"
                          ? "All projects"
                          : "Choose a project"}
                      </h2>
                      <label className="search-box">
                        <Search size={17} />
                        <input
                          placeholder="Search projects…"
                          aria-label="Search projects"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                    </div>
                    {filtered.length ? (
                      view === "My Projects" ? (
                        <ProjectTable items={filtered} />
                      ) : (
                        <div className="project-grid">
                          {filtered.map((p) => (
                            <button
                              key={p.project.id}
                              className="project-tile"
                              onClick={() =>
                                open(
                                  p,
                                  {
                                    "AI Project Planner": "AI Planner",
                                    "Budget & Finance": "Budget",
                                    Schedule: "Tasks",
                                    "Risk Management": "Risks",
                                    "Reports & Documents": "Documents",
                                  }[view],
                                )
                              }
                            >
                              <span className="project-icon">
                                <FolderKanban size={21} />
                              </span>
                              <ArrowUpRight className="tile-arrow" size={18} />
                              <h3>{p.project.title}</h3>
                              <p>
                                {p.project.industry} · {p.project.currency}
                              </p>
                              <Badge value={p.project.status} />
                              <div className="tile-meta">
                                {view === "Budget & Finance"
                                  ? money(p.finance.total, p.project.currency)
                                  : view === "Schedule"
                                    ? `${p.tasks.length} tasks`
                                    : view === "Risk Management"
                                      ? `${p.risks.filter((r) => r.status !== "Closed").length} open risks`
                                      : view === "Reports & Documents"
                                        ? `${p.documents.length} documents`
                                        : "Open planning workspace"}
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    ) : search ? (
                      <Empty
                        title="No projects match your search"
                        text="Try another name, industry or location."
                      />
                    ) : (
                      <Empty
                        title="Make room for your next big idea"
                        text="Create your first project to get started."
                        action="Create new project"
                        onClick={() => createProject()}
                      />
                    )}
                  </section>
                </>
              )}
              <div className="workspace-footer">
                <span>
                  <span className="status-dot" /> A little structure. A lot of
                  possibility.
                </span>
                <span>Made for Africa. Built for impact.</span>
              </div>
            </main>
          </div>
        </div>
      )}
      {modal && <FormModal modal={modal} close={() => setModal(null)} />}{" "}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}
function Badge({ value }: { value: string }) {
  return (
    <span
      className={`badge ${["Completed", "Done", "Closed"].includes(value) ? "complete" : ["On hold", "Mitigating", "In progress"].includes(value) ? "amber" : "green"}`}
    >
      <i />
      {value}
    </span>
  );
}
function Stat({
  label,
  value,
  icon,
  foot,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  foot: string;
  accent?: boolean;
}) {
  return (
    <section className={`stat ${accent ? "accent" : ""}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <p>
        {accent && <span className="status-dot" />}
        {foot}
      </p>
    </section>
  );
}
function PanelHead({
  title,
  subtitle,
  action,
  onClick,
  extra,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onClick?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {extra}
      {action && (
        <button className="text-link" onClick={onClick}>
          {action}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
function Empty({
  title,
  text,
  action,
  onClick,
  icon,
}: {
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="empty">
      {icon && <span className="empty-icon">{icon}</span>}
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="button secondary" onClick={onClick}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
function PageTitle({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">PROJECTMANAGER AI AFRICA</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action && (
        <button className="button primary" onClick={onClick}>
          <Plus size={17} />
          {action}
        </button>
      )}
    </div>
  );
}
function FormModal({ modal, close }: { modal: Modal; close: () => void }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) close();
    };
    document.addEventListener("keydown", key);
    const previous = document.activeElement as HTMLElement;
    const dialog = document.getElementById("form-dialog") as HTMLDialogElement;
    dialog.showModal();
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      id="form-dialog"
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) close();
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          const form = new FormData(e.currentTarget);
          const data: Record<string, any> = {};
          modal.fields.forEach((f) => {
            const v = form.get(f.name);
            data[f.name] = f.type === "number" ? Number(v) : v || "";
          });
          try {
            await modal.save(data);
            close();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">LET’S MOVE FORWARD</span>
            <h2 id="modal-title">{modal.title}</h2>
          </div>
          <button
            disabled={busy}
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        <div className="form-grid">
          {modal.fields.map((f, i) => (
            <label key={f.name} className={f.type === "textarea" ? "full" : ""}>
              {f.label}
              {f.required && <span className="required"> *</span>}
              {f.options ? (
                <select
                  aria-label={f.label}
                  name={f.name}
                  defaultValue={modal.initial?.[f.name] || f.options[0]}
                >
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  aria-label={f.label}
                  name={f.name}
                  defaultValue={modal.initial?.[f.name] || ""}
                  required={f.required}
                  maxLength={30000}
                  rows={f.name === "content" ? 12 : 3}
                />
              ) : (
                <input
                  aria-label={f.label}
                  autoFocus={i === 0}
                  name={f.name}
                  type={f.type || "text"}
                  defaultValue={modal.initial?.[f.name] ?? ""}
                  required={f.required}
                  min={f.min}
                  max={f.max}
                  step={f.step || "any"}
                  maxLength={f.type === "number" ? undefined : 200}
                />
              )}{" "}
              {f.help && <small>{f.help}</small>}
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <button
            disabled={busy}
            type="button"
            className="button secondary"
            onClick={close}
          >
            Cancel
          </button>
          <button disabled={busy} className="button primary">
            {busy ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Check size={16} />
            )}{" "}
            {modal.submit || "Save changes"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
function Auth({
  mode,
  setMode,
  onSuccess,
}: {
  mode: string;
  setMode: (m: string) => void;
  onSuccess: () => Promise<void>;
}) {
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setError("");
    setMessage("");
  }, [mode]);
  const register = mode === "register";
  return (
    <main className="auth-wrap">
      <div className="auth-aside">
        <span className="eyebrow">IDEAS INTO IMPACT</span>
        <h1>
          Your next chapter
          <br />
          starts with a plan.
        </h1>
        <p>
          A focused workspace for the people moving projects — and Africa —
          forward.
        </p>
        <Globe2 size={200} strokeWidth={0.7} />
      </div>
      <section className="auth-card">
        <span className="eyebrow">PROJECTMANAGER AI AFRICA</span>
        <h1>
          {register
            ? "Make space for great work."
            : mode === "forgot"
              ? "Let’s get you back in."
              : mode === "reset"
                ? "Choose a new password."
                : "Good to have you back."}
        </h1>
        <p>
          {register
            ? "Set up your organisation and create your first project."
            : mode === "login"
              ? "Sign in to your project workspace."
              : "Securely recover access to your account."}
        </p>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="alert success" role="status">
            {message}
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setMessage("");
            const data = Object.fromEntries(new FormData(e.currentTarget));
            try {
              if (mode === "forgot") {
                const r = await api("/auth/forgot", "POST", data);
                setMessage(r.message);
              } else if (mode === "reset") {
                await api("/auth/reset", "POST", {
                  password: data.password,
                  token: new URLSearchParams(location.search).get("reset"),
                });
                history.replaceState({}, "", location.pathname);
                setMode("login");
                setMessage("Password updated. Sign in with your new password.");
              } else {
                await api("/auth/" + mode, "POST", data);
                await onSuccess();
              }
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <>
              <label>
                Your name
                <input
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label>
                Organisation
                <input
                  name="organisation"
                  required
                  maxLength={150}
                  autoComplete="organization"
                />
              </label>
            </>
          )}
          {mode !== "reset" && (
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              Password
              <input
                aria-label="Password"
                name="password"
                type="password"
                required
                minLength={mode === "login" ? 1 : 12}
                maxLength={128}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              {mode !== "login" && <small>Use at least 12 characters.</small>}
            </label>
          )}
          {register && (
            <div className="form-grid">
              <label>
                Country
                <input
                  name="country"
                  defaultValue="Nigeria"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Preferred currency
                <select name="currency">
                  {currencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="full">
                Industry
                <select name="industry">
                  {industries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <button className="button primary large" disabled={busy}>
            {busy ? <LoaderCircle size={17} className="spin" /> : null}
            {register
              ? "Create your workspace"
              : mode === "forgot"
                ? "Send recovery email"
                : mode === "reset"
                  ? "Update password"
                  : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-links">
          {mode === "login" ? (
            <>
              <button onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
              <span>
                New here?{" "}
                <button onClick={() => setMode("register")}>
                  Create an account
                </button>
              </span>
            </>
          ) : (
            <button onClick={() => setMode("login")}>Back to sign in</button>
          )}
        </div>
        <p className="auth-note">
          Your project data stays within your organisation’s workspace. AI
          generation shares selected project records with the configured
          provider.
        </p>
      </section>
    </main>
  );
}
function Scenario({ bundle }: { bundle: Bundle }) {
  const [change, setChange] = useState(10);
  const adjusted = Math.round(bundle.finance.total * (1 + change / 100));
  return (
    <div className="scenario-body">
      <p>Explore a uniform cost change without modifying your saved budget.</p>
      <label>
        Cost change: {change}%
        <input
          type="range"
          min="-50"
          max="100"
          value={change}
          onChange={(e) => setChange(Number(e.target.value))}
        />
      </label>
      <div>
        <span>Scenario budget</span>
        <strong>{money(adjusted, bundle.project.currency)}</strong>
        <small>
          Difference:{" "}
          {money(adjusted - bundle.finance.total, bundle.project.currency)} ·
          Scenario only
        </small>
      </div>
    </div>
  );
}
function Gantt({ tasks }: { tasks: any[] }) {
  const day = 86400000;
  const start = Math.min(...tasks.map((t) => Date.parse(t.start_date))),
    end = Math.max(...tasks.map((t) => Date.parse(t.end_date))) + day;
  const span = end - start;
  return (
    <div className="gantt">
      <h3>Schedule at a glance</h3>
      <p>
        {displayDate(new Date(start).toISOString().slice(0, 10))} —{" "}
        {displayDate(new Date(end - day).toISOString().slice(0, 10))} · Edit
        dates using the task controls.
      </p>
      {tasks.map((t) => (
        <div className="gantt-row" key={t.id}>
          <span>{t.title}</span>
          <div>
            <i
              title={`${t.start_date} to ${t.end_date} · ${t.progress}%`}
              style={{
                left: ((Date.parse(t.start_date) - start) / span) * 100 + "%",
                width:
                  ((Date.parse(t.end_date) + day - Date.parse(t.start_date)) /
                    span) *
                    100 +
                  "%",
              }}
            >
              <b style={{ width: t.progress + "%" }} />
              {t.progress}%
            </i>
          </div>
        </div>
      ))}
    </div>
  );
}
function PublicPage({
  page,
  register,
}: {
  page: string;
  register: () => void;
}) {
  const content: Record<string, [string, string[]]> = {
    Features: [
      "A clearer path from idea to delivery.",
      [
        "Plan with context: create editable AI drafts grounded in your saved records.",
        "Budget with confidence: quantities, rates, contingency, tax and actual spending.",
        "Track the work: tasks, responsible people, due dates and recorded progress.",
        "See the risks: probability, impact, early warnings and mitigation.",
        "Report with evidence: progress updates and editable documents with PDF, Word and Excel exports.",
      ],
    ],
    Industries: [
      "Built around the work you do.",
      [
        "Agriculture: plan land preparation, planting, resources and seasonal activities.",
        "Construction: track work packages, procurement costs and site risks.",
        "NGOs and development: connect activities, delivery evidence and stakeholder reports.",
        "Consulting, logistics and technology: a flexible project structure for your own operating context.",
      ],
    ],
    Pricing: [
      "Start with the functional MVP.",
      [
        "The current release does not collect payments or enforce paid subscriptions.",
        "Free, Professional and Business tiers are planned. Prices and market availability have not been set.",
        "Team invitations, expanded permissions and payment integration are later-phase features.",
      ],
    ],
    About: [
      "Rooted in Africa. Built for impact.",
      [
        "ProjectManager AI Africa brings project planning, cost control and practical reporting into one focused workspace.",
        "The product is being developed in stages, with functionality and accountable records at its centre.",
      ],
    ],
    FAQ: [
      "A few things you might be wondering.",
      [
        "Does AI invent market prices? No. AI is instructed to flag missing data and label estimates. Always review its drafts.",
        "Which currencies are supported? NGN, USD, GHS and KES. Each project keeps its own currency; this MVP does not convert currencies.",
        "Can my team join? This release supports one owner per organisation. Collaborative roles and invitations are planned.",
        "Is AI required? No. You can manage budgets, tasks, risks and documents manually. AI requires a server-side API key.",
      ],
    ],
    Contact: [
      "Let’s connect.",
      [
        "A public support address has not yet been configured by the deployment owner.",
        "For account access, data requests or product questions, contact the organisation that provided this deployment.",
      ],
    ],
    Privacy: [
      "Your project information matters.",
      [
        "This MVP stores account details, organisation records and project data in the deployment’s database. Session cookies keep you signed in and expire after seven days. No advertising trackers are included.",
        "If you choose AI generation, your selected project records are sent to the configured AI provider. Do not include information you are not authorised to share.",
        "Project deletion removes its associated records from the live database. Backups may retain older records under the operator’s retention policy.",
        "Before public launch, the deployment owner must provide a legal entity, privacy contact, retention schedule, processor agreements and jurisdiction-specific notice. This text is a product disclosure, not a completed legal policy.",
      ],
    ],
    Terms: [
      "A practical workspace, with clear boundaries.",
      [
        "ProjectManager AI Africa helps organise project information. AI drafts and estimates require human review; they are not verified professional advice.",
        "You are responsible for the accuracy of recorded information and permission to share it with the configured services.",
        "The current MVP has no paid subscription or payment processing.",
        "The deployment owner must supply final terms, service commitments and legal contact details before commercial launch.",
      ],
    ],
  };
  const [heading, items] = content[page] || content.Features;
  return (
    <main className="public-page">
      <span className="eyebrow">{page.toUpperCase()}</span>
      <h1>{heading}</h1>
      <div className="public-cards">
        {items.map((text, i) => (
          <article key={text}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <button className="button primary large" onClick={register}>
        Start your first project <ArrowUpRight size={17} />
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
