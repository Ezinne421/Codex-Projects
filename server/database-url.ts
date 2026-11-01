/** Keep network database traffic encrypted and verify the provider certificate. */
export function verifiedDatabaseUrl(value: string) {
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("DATABASE_URL must be a PostgreSQL connection URI");
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
