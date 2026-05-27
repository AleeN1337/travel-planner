/**
 * pg v8 traktuje require/prefer/verify-ca jak verify-full z ostrzeżeniem.
 * Jawne sslmode=verify-full usuwa warning i zachowuje obecne zachowanie (Neon).
 */
export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const ssl = url.searchParams.get("sslmode");
    if (ssl === "require" || ssl === "prefer" || ssl === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}
