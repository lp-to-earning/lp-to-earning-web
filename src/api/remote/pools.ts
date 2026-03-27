import { getAuthedAxios } from "@/lib/authed-axios";
import { normalizePoolEntry } from "@/api/remote/catalog";

function unwrapPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
    return d.data as Record<string, unknown>;
  }
  return d;
}

/** `GET /api/pools` — v2 `{ data: { pools: [...] } }`, 행은 catalog와 동일 정규화 */
export async function fetchUserPools(): Promise<Pool[]> {
  const { data } = await getAuthedAxios().get<unknown>("pools");
  const root = unwrapPayload(data) ?? (data as Record<string, unknown>) ?? {};
  let list: unknown[] = [];

  if (Array.isArray(root.pools)) list = root.pools;
  else if (
    root.pools &&
    typeof root.pools === "object" &&
    Array.isArray((root.pools as { data?: unknown[] }).data)
  ) {
    list = (root.pools as { data: unknown[] }).data;
  }

  return list.map((entry, index) => normalizePoolEntry(entry, index));
}
