/**
 * NEXT_PUBLIC_API_HOST should include the `/api` prefix, e.g.
 * `http://x.xx.xxx:port/api`
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_HOST?.trim() || "";
  return raw.replace(/\/$/, "");
}
