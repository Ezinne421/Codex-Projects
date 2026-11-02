/** Error tags only: never log database URLs, passwords, SQL or raw error text. */
export function databaseErrorTag(error: unknown): string {
  const e = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
    cause?: { code?: unknown };
  };
  for (const code of [e?.code, e?.cause?.code])
    if (typeof code === "string" && /^[A-Z0-9_]{2,64}$/.test(code)) return code;
  const text = typeof e?.message === "string" ? e.message.toLowerCase() : "";
  if (/password.*(?:must be|non.empty|required|missing)/.test(text))
    return "DATABASE_PASSWORD_MISSING";
  if (text.includes("tenant or user"))
    return "DATABASE_USER_OR_TENANT_NOT_FOUND";
  if (text.includes("timeout") || text.includes("timed out"))
    return "DATABASE_CONNECTION_TIMEOUT";
  if (
    text.includes("sasl") ||
    text.includes("scram") ||
    text.includes("authentication")
  )
    return "DATABASE_AUTHENTICATION_FAILED";
  if (text.includes("connection terminated"))
    return "DATABASE_CONNECTION_TERMINATED";
  if (text.includes("ssl") || text.includes("certificate"))
    return "DATABASE_TLS_FAILED";
  return "DATABASE_INITIALIZATION_FAILED";
}
