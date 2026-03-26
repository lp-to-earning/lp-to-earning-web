import { getAuthedAxios } from "@/lib/authed-axios";

function unwrapPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
    return d.data as Record<string, unknown>;
  }
  return d;
}

function normalizePool(entry: unknown): Pool {
  if (entry && typeof entry === "object" && "token_a" in entry) {
    return entry as Pool;
  }

  const p = entry as Record<string, unknown>;
  const id = String(p.id ?? p.address ?? p.poolAddress ?? "");
  const emptyToken = (): Token => ({
    mint: "",
    symbol: "",
    name: "",
    decimals: 9,
    price_usd: 0,
  });

  return {
    id,
    pair: String(
      p.pair ?? p.name ?? p.pair_symbol ?? (id ? id.slice(0, 8) : "Pool"),
    ),
    token_a: emptyToken(),
    token_b: emptyToken(),
    tvl_usd: Number(p.tvl_usd ?? p.tvlUsd ?? 0),
    volume_24h_usd: Number(p.volume_24h_usd ?? p.volume24hUsd ?? 0),
    volume_7d_usd: Number(p.volume_7d_usd ?? 0),
    fee_rate_bps: Number(p.fee_rate_bps ?? 0),
    fee_24h_usd: Number(p.fee_24h_usd ?? 0),
    apr: Number(p.apr ?? 0),
    current_price: Number(p.current_price ?? 0),
    created_at: String(p.created_at ?? ""),
  };
}

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

  return list.map(normalizePool);
}
