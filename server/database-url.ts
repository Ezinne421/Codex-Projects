import { parseIntoClientConfig } from "pg-connection-string";
import { getCACertificates, checkServerIdentity } from "node:tls";
import { supabaseCertificateAuthority } from "./supabase-ca.js";
/** Keep network database traffic encrypted and verify the provider certificate. */
export function verifiedDatabaseUrl(value: string) {
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("DATABASE_URL must be a PostgreSQL connection URI");
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

/** Merge provider trust after parsing the URI, so sslmode cannot discard the CA. */
export function verifiedDatabaseConfig(value: string) {
  const config = parseIntoClientConfig(verifiedDatabaseUrl(value));
  delete config.connectionString;
  const ssl =
    typeof config.ssl === "object" && config.ssl ? { ...config.ssl } : {};
  if (
    /\.(?:pooler\.supabase\.com|supabase\.co)$/i.test(config.host || "") &&
    !ssl.ca
  ) {
    ssl.ca = [...getCACertificates("default"), supabaseCertificateAuthority];
  }
  ssl.rejectUnauthorized = true;
  ssl.checkServerIdentity = checkServerIdentity;
  return { ...config, ssl };
}
