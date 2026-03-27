import { createPublicApi } from "@/lib/authed-axios";

/**
 * 공개 풀·토큰 전체 목록 (`GET /api/pools/all`, `GET /api/tokens/all`).
 * 인증 없이 호출. 선택 화면에서는 이 목록과 `config.pools` / `config.autoRechargeTokens`를
 * 풀 주소·민트로 비교해 체크 여부만 나누면 됩니다.
 */

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data;
    if (d.success === true && Array.isArray(d.data)) return d.data;
    for (const key of [
      "tokens",
      "pools",
      "items",
      "results",
      "list",
      "result",
      "rows",
    ] as const) {
      const v = d[key];
      if (Array.isArray(v)) return v;
    }
    if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
      const inner = d.data as Record<string, unknown>;
      for (const key of [
        "tokens",
        "pools",
        "items",
        "data",
        "rows",
        "list",
      ] as const) {
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
  options?: { skipObjects?: boolean },
): string {
  const skipObjects = options?.skipObjects ?? false;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) {
      if (skipObjects && typeof v === "object") continue;
      const s = String(v).trim();
      if (s !== "" && s !== "[object Object]") return s;
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
  "mintAddress",
  "mint_address",
  "tokenMint",
  "token_mint",
  "tokenAddress",
  "token_address",
  "splMint",
  "spl_mint",
  "address",
  "pubkey",
  "publicKey",
  "public_key",
  "contractAddress",
  "contract_address",
  "id",
] as const;

function asObjectRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function normalizeTokenEntry(entry: unknown): Token {
  const p = asObjectRecord(entry) ?? {};
  const nested =
    asObjectRecord(p.token) ??
    asObjectRecord(p.tokenInfo) ??
    asObjectRecord(p.asset) ??
    asObjectRecord(p.meta);
  const merged: Record<string, unknown> = nested ? { ...nested, ...p } : p;

  const logo =
    merged.logo ??
    merged.logo_uri ??
    merged.logoUri ??
    merged.image ??
    merged.icon ??
    merged.uri;

  const mint = firstStringField(merged, TOKEN_MINT_KEYS, {
    skipObjects: true,
  });

  return {
    mint,
    symbol: String(merged.symbol ?? merged.ticker ?? ""),
    name: String(merged.name ?? merged.title ?? ""),
    decimals: Number(merged.decimals ?? 9),
    logo_uri: logo !== undefined && logo !== null ? String(logo) : undefined,
    price_usd: Number(merged.price ?? merged.price_usd ?? 0),
    price_change_24h:
      merged.price_change_24h !== undefined
        ? Number(merged.price_change_24h)
        : undefined,
    volume_24h_usd:
      merged.volume_24h_usd !== undefined
        ? Number(merged.volume_24h_usd)
        : merged.volume24h !== undefined
          ? Number(merged.volume24h)
          : undefined,
  };
}

export async function fetchAllPools(): Promise<Pool[]> {
  const { data } = await createPublicApi().get<unknown>("pools/all");
  return unwrapList(data)
    .map(normalizePoolEntry)
    .filter((pool) => pool.id.length > 0);
}

export async function fetchAllTokens(): Promise<Token[]> {
  const { data } = await createPublicApi().get<unknown>("tokens/all");
  return unwrapList(data)
    .map(normalizeTokenEntry)
    .filter((t) => t.mint.length > 0);
}
