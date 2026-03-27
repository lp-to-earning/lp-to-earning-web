import { createPublicApi } from "@/lib/authed-axios";

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data;
    if (d.success === true && Array.isArray(d.data)) return d.data;
  }
  return [];
}

function emptyToken(): Token {
  return { mint: "", symbol: "", name: "", decimals: 9, price_usd: 0 };
}

/** Discovery `GET /api/pools/all` — 가이드 스키마 및 기존 Pool 형태 모두 수용 */
function normalizePoolEntry(entry: unknown): Pool {
  if (entry && typeof entry === "object" && "token_a" in entry) {
    return entry as Pool;
  }

  const p = entry as Record<string, unknown>;
  const id = String(p.address ?? p.id ?? p.poolAddress ?? "");

  return {
    id,
    pair: String(
      p.name ?? p.pair ?? p.pair_symbol ?? (id ? `${id.slice(0, 4)}…${id.slice(-4)}` : "Pool"),
    ),
    token_a: emptyToken(),
    token_b: emptyToken(),
    tvl_usd: Number(p.tvl ?? p.tvlUsd ?? p.tvl_usd ?? 0),
    volume_24h_usd: Number(
      p.volume24h ?? p.volume_24h_usd ?? p.volume24hUsd ?? 0,
    ),
    volume_7d_usd: Number(p.volume_7d_usd ?? 0),
    fee_rate_bps: Number(p.fee_rate_bps ?? 0),
    fee_24h_usd: Number(p.fee_24h_usd ?? 0),
    apr: Number(p.apr ?? 0),
    current_price: Number(p.current_price ?? p.price ?? 0),
    created_at: String(p.created_at ?? ""),
  };
}

/** Discovery `GET /api/tokens/all` — 가이드 스키마 (logo, price 등) */
function normalizeTokenEntry(entry: unknown): Token {
  const p = entry as Record<string, unknown>;
  const logo =
    p.logo ?? p.logo_uri ?? p.logoUri ?? p.image ?? p.icon;
  return {
    mint: String(p.mint ?? ""),
    symbol: String(p.symbol ?? ""),
    name: String(p.name ?? ""),
    decimals: Number(p.decimals ?? 9),
    logo_uri: logo !== undefined && logo !== null ? String(logo) : undefined,
    price_usd: Number(p.price ?? p.price_usd ?? 0),
    price_change_24h:
      p.price_change_24h !== undefined
        ? Number(p.price_change_24h)
        : undefined,
    volume_24h_usd:
      p.volume_24h_usd !== undefined
        ? Number(p.volume_24h_usd)
        : p.volume24h !== undefined
          ? Number(p.volume24h)
          : undefined,
  };
}

export async function fetchAllPools(): Promise<Pool[]> {
  const { data } = await createPublicApi().get<unknown>("pools/all");
  return unwrapList(data).map(normalizePoolEntry);
}

export async function fetchAllTokens(): Promise<Token[]> {
  const { data } = await createPublicApi().get<unknown>("tokens/all");
  return unwrapList(data).map(normalizeTokenEntry);
}
