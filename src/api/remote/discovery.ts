import { createPublicApi } from "@/lib/authed-axios";

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data;
    if (d.success === true && Array.isArray(d.data)) return d.data;
    for (const key of ["tokens", "pools", "items", "results", "list"] as const) {
      const v = d[key];
      if (Array.isArray(v)) return v;
    }
    if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
      const inner = d.data as Record<string, unknown>;
      for (const key of ["tokens", "pools", "items", "data"] as const) {
        const v = inner[key];
        if (Array.isArray(v)) return v;
      }
    }
  }
  return [];
}

function firstStringField(
  obj: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s !== "") return s;
    }
  }
  return "";
}

function emptyToken(): Token {
  return { mint: "", symbol: "", name: "", decimals: 9, price_usd: 0 };
}

const POOL_ADDRESS_KEYS = [
  "address",
  "poolAddress",
  "pool_address",
  "poolId",
  "pool_id",
  "id",
  "pubkey",
  "publicKey",
  "public_key",
] as const;

/** Discovery `GET /api/pools/all` — 가이드 스키마 및 기존 Pool 형태 모두 수용 */
function normalizePoolEntry(entry: unknown): Pool {
  if (entry && typeof entry === "object" && "token_a" in entry) {
    const pool = entry as Pool;
    const p = entry as Record<string, unknown>;
    const id =
      (pool.id && String(pool.id).trim()) ||
      firstStringField(p, POOL_ADDRESS_KEYS);
    return { ...pool, id };
  }

  const p = entry as Record<string, unknown>;
  const id = firstStringField(p, POOL_ADDRESS_KEYS);

  return {
    id,
    pair: String(
      p.name ??
        p.pair ??
        p.pair_symbol ??
        (id ? `${id.slice(0, 4)}…${id.slice(-4)}` : "Pool"),
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

const TOKEN_MINT_KEYS = [
  "mint",
  "address",
  "tokenMint",
  "token_mint",
  "tokenAddress",
  "token_address",
  "mintAddress",
  "mint_address",
] as const;

/** Discovery `GET /api/tokens/all` — 가이드 스키마 (logo, price 등) */
function normalizeTokenEntry(entry: unknown): Token {
  const p = entry as Record<string, unknown>;
  const logo =
    p.logo ?? p.logo_uri ?? p.logoUri ?? p.image ?? p.icon;
  const mint = firstStringField(p, TOKEN_MINT_KEYS);
  return {
    mint,
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
  return unwrapList(data)
    .map(normalizePoolEntry)
    .filter((pool) => pool.id.length > 0);
}

const TOKEN_DISCOVERY_PATHS = [
  "tokens/all",
  "token/all",
  "tokens",
] as const;

export async function fetchAllTokens(): Promise<Token[]> {
  let lastError: unknown;
  for (const path of TOKEN_DISCOVERY_PATHS) {
    try {
      const { data } = await createPublicApi().get<unknown>(path);
      const list = unwrapList(data);
      const normalized = list.map(normalizeTokenEntry).filter((t) => t.mint.length > 0);
      if (normalized.length > 0) return normalized;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError) throw lastError;
  return [];
}
