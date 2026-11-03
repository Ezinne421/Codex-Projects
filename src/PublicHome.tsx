import { ArrowUpRight, ArrowRight } from "lucide-react";
export default function PublicHome({
  onStart,
  onLearn,
  onTemplates,
}: {
  onStart: () => void;
  onLearn: () => void;
  onTemplates: () => void;
}) {
  return (
    <main className="editorial-home">
      <section className="editorial-hero">
        <div className="hero-copy">
          <div className="editorial-kicker">
            <span className="editorial-square" /> NEXT MILE / PROJECTS & PEOPLE
          </div>
          <h1>
            Turn plans into
            <br />
            <em>progress.</em>
          </h1>
          <p>
            A professional home for ambitious projects. Bring the plan, the
            people and the decisions together — and keep getting better at the
            work.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={onStart}>
              Start your first project
              <ArrowUpRight size={18} />
            </button>
            <button className="editorial-link" onClick={onLearn}>
              Explore the knowledge centre
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="hero-index">
            <span>01 / PLAN WITH INTENT</span>
            <span>02 / DELIVER TOGETHER</span>
            <span>03 / KEEP LEARNING</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/assets/project-fieldwork.jpg"
            alt="A construction team coordinating work on a building site"
            width="780"
            height="1000"
            fetchPriority="high"
          />
          <div className="hero-image-caption">
            <span>
              ON THE GROUND.
              <br />
              MOVING FORWARD.
            </span>
            <span className="editorial-asterisk" aria-hidden="true">
              <svg
                viewBox="0 0 36 42"
                width="48"
                height="52"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M5 34V8h7l12 17V8h7v26h-7L12 17v17z"
                />
              </svg>
            </span>
          </div>
          <div className="hero-photo-index">
            THE PRACTICE OF PROGRESS — VOL. 01
          </div>
        </div>
      </section>
      <section className="editorial-facts" aria-label="Resources available">
        <div>
          <strong>738</strong>
          <span>management definitions</span>
        </div>
        <div>
          <strong>16</strong>
          <span>editable project templates</span>
        </div>
        <div>
          <strong>24</strong>
          <span>practical learning lessons</span>
        </div>
        <p>
          A working toolkit.
          <br />
          <em>A lasting capability.</em>
        </p>
      </section>
      <section className="editorial-capabilities">
        <header>
          <span className="editorial-kicker">BUILT AROUND THE REAL WORK</span>
          <h2>
            From a good idea
            <br />
            to a well-run project.
          </h2>
          <p>
            The foundations to plan clearly, work responsibly and make decisions
            you can explain.
          </p>
        </header>
        <div className="editorial-capability-list">
          {[
            [
              "01",
              "Give the plan a backbone.",
              "Connect activities, clarify responsibilities, compare a schedule preview and capture the approved baseline.",
            ],
            [
              "02",
              "Put people in the picture.",
              "Invite your team, set project access and keep assignments, discussion and decisions close to the work.",
            ],
            [
              "03",
              "Keep an honest record.",
              "Track estimated and actual costs. Review documents, retain revisions and follow the history behind the decisions.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ArrowUpRight size={22} />
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-learning">
        <div className="learning-cover">
          <span>
            THE NEXT MILE
            <br />
            FIELD GUIDE
          </span>
          <strong>
            Know more.
            <br />
            Do better.
          </strong>
          <div className="cover-lines" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span>PROJECTS · OPERATIONS · PEOPLE</span>
        </div>
        <div className="learning-editorial-copy">
          <span className="editorial-kicker">
            A CAREER IS A CONTINUING PRACTICE
          </span>
          <h2>
            Keep your
            <br />
            <em>edge.</em>
          </h2>
          <p>
            Refresh the fundamentals. Untangle unfamiliar concepts. Work through
            practical decisions, then bring what you learn into your next
            project.
          </p>
          <button className="editorial-link" onClick={onLearn}>
            Open the knowledge centre
            <ArrowUpRight size={19} />
          </button>
          <div className="editorial-resource-row">
            <span>29 specialist topics</span>
            <span>6 learning paths</span>
            <span>48 scenario questions</span>
          </div>
        </div>
      </section>
      <section className="editorial-template-strip">
        <span className="editorial-kicker">START WITH STRUCTURE</span>
        <h2>
          A blank page.
          <br />
          <em>A better starting point.</em>
        </h2>
        <p>
          Charters, work plans, budgets, risk registers and reports. Choose a
          structured template, add your context and make it your own.
        </p>
        <button className="button dark" onClick={onTemplates}>
          Browse the templates
          <ArrowUpRight size={18} />
        </button>
      </section>
      <section className="editorial-closing">
        <span>YOUR NEXT CHAPTER STARTS WITH THE WORK.</span>
        <h2>
          Build something
          <br />
          <em>worth delivering.</em>
        </h2>
        <button className="button citrus" onClick={onStart}>
          Create your workspace
          <ArrowUpRight size={18} />
        </button>
      </section>
    </main>
  );
}
