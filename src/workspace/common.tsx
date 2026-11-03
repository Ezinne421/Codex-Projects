import type { ReactNode } from "react";
export const message = (e: unknown) =>
  e instanceof Error ? e.message : "The action could not be completed.";
export const date = (s: string) =>
  new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleString(
    "en-GB",
    { dateStyle: "medium", timeStyle: "short" },
  );
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="tool-notice" role="status">
      {children}
    </div>
  );
}
