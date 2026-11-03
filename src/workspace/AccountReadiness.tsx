import { useEffect, useState } from "react";
import { api, today } from "../api";
import type { Dependency } from "../../shared/scheduling";
import { Notice, message, date } from "./common";
export function AccountReadiness({ config, user }: { config: any; user: any }) {
  const [password, setPassword] = useState(""),
    [codes, setCodes] = useState<string[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="workspace-tools">
      <section className="panel tool-panel">
        <h2>Account recovery kit</h2>
        <p>
          Create one-time recovery codes before you need them. Each is valid for
          one year. Using a code resets your password, signs out all sessions
          and invalidates the remaining codes. Generating a new kit replaces the
          previous one.
        </p>
        {error && <Notice>{error}</Notice>}
        <form
          className="tool-inline-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const r = await api("/auth/recovery-codes", "POST", { password });
              setCodes(r.codes);
              setPassword("");
            } catch (e) {
              setError(message(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={128}
            />
          </label>
          <button disabled={busy} className="button secondary">
            Generate recovery codes
          </button>
        </form>
        {codes.length > 0 && (
          <div className="tool-recovery-kit">
            <strong>
              Save these codes somewhere private, outside this app.
            </strong>
            <pre>{codes.join("\n")}</pre>
            <button
              className="button primary"
              onClick={() => {
                const blob = new Blob(
                    [
                      `ProjectManager Africa recovery codes\nAccount: ${user.email}\nGenerated: ${new Date().toISOString()}\nEach code expires in one year. Keep private.\n\n` +
                        codes.join("\n"),
                    ],
                    { type: "text/plain" },
                  ),
                  url = URL.createObjectURL(blob),
                  a = document.createElement("a");
                a.href = url;
                a.download = "projectmanager-recovery-codes.txt";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              }}
            >
              Download private recovery kit
            </button>
            <button className="text-link" onClick={() => setCodes([])}>
              Hide codes
            </button>
          </div>
        )}
      </section>
      <section className="panel tool-panel">
        <h2>Service availability</h2>
        <dl className="tool-readiness">
          <div>
            <dt>AI generation</dt>
            <dd>
              {config.aiConfigured
                ? "Configured — provider availability and quota still apply"
                : "Not configured. Templates and manual planning are available."}
            </dd>
          </div>
          <div>
            <dt>Email password recovery</dt>
            <dd>
              {config.recoveryConfigured
                ? "Configured — delivery depends on your email provider"
                : "Not configured. Use a previously saved one-time recovery code."}
            </dd>
          </div>
          <div>
            <dt>Support contact</dt>
            <dd>
              {config.supportEmail ? (
                <a href={"mailto:" + config.supportEmail}>
                  {config.supportEmail}
                </a>
              ) : (
                "The deployment operator has not supplied a support address."
              )}
            </dd>
          </div>
          <div>
            <dt>Learning progress</dt>
            <dd>
              Saved to your account when connected. A local copy supports
              pending attempts on this device.
            </dd>
          </div>
        </dl>
        {["owner", "admin"].includes(user.role) && (
          <p className="tool-method">
            Operator setup: connect the AI and email providers through secure
            hosting settings. Keep credentials out of project records. Confirm
            backup restoration, service monitoring and your legal/support
            details before inviting external customers. See the deployment
            operations guide in the repository.
          </p>
        )}
      </section>
    </section>
  );
}
