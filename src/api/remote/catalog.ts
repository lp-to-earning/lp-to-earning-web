import { createPublicApi } from "@/lib/authed-axios";

/**
 * 공개 풀·토큰 전체 목록 (`GET /api/pools/all`, `GET /api/tokens/all`).
 * API v2 풀 행: `address`, `name`, `symbolA`/`symbolB`, `logoA`/`logoB`, `tvl`, `volume24h`, …
 * `GET /api/pools`(인증) 응답도 동일 스키마에 가깝게 `normalizePoolEntry`로 맞춤.
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

const POOL_ADDRESS_KEYS = [
  "address",
  "poolAddress",
  "pool_address",
  "poolPubkey",
  "pool_pubkey",
  "poolId",
  "pool_id",
  "id",
  "pubkey",
  "publicKey",
  "public_key",
] as const;

function isRichPoolRecord(entry: object): boolean {
  if (!("token_a" in entry)) return false;
  const ta = (entry as Record<string, unknown>).token_a;
  return ta !== null && typeof ta === "object";
}

function asObjectRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

/**
 * `address` 가 없을 때만 UI·키용 placeholder (`name#index`).
 * `POST /config` 의 `pools` 는 가능한 한 실제 풀 주소를 넣는 것이 안전함.
 */
function ensurePoolAddress(
  parsed: string,
  p: Record<string, unknown>,
  index: number,
): string {
  const t = parsed.trim();
  if (t) return t;
  const label = String(p.name ?? p.pair ?? p.pair_symbol ?? "").trim();
  if (label) return `${label}#${index}`;
  return `pool#${index}`;
}

/** API `Pool` 한 행과 동일한 평면 스키마로 정규화 */
function normalizeDiscoveryPoolRow(
  p: Record<string, unknown>,
  index: number,
): Pool {
  const fromAddress = String(p.address ?? "").trim();
  const rawAddr = fromAddress || firstStringField(p, POOL_ADDRESS_KEYS);
  const address = ensurePoolAddress(rawAddr, p, index);

  const name =
    String(p.name ?? p.pair ?? p.pair_symbol ?? "").trim() ||
    (address.length > 8
      ? `${address.slice(0, 4)}…${address.slice(-4)}`
      : address || "Pool");

  return {
    name,
    address,
    symbolA: String(p.symbolA ?? p.tokenSymbolA ?? p.symbol_a ?? "").trim(),
    symbolB: String(p.symbolB ?? p.tokenSymbolB ?? p.symbol_b ?? "").trim(),
    logoA: String(p.logoA ?? p.logo_a ?? "").trim(),
    logoB: String(p.logoB ?? p.logo_b ?? "").trim(),
    price: Number(p.price ?? p.current_price ?? 0),
    apr: Number(p.apr ?? 0),
    tvl: Number(p.tvl ?? p.tvlUsd ?? p.tvl_usd ?? 0),
    volume24h: Number(
      p.volume24h ?? p.volume_24h_usd ?? p.volume24hUsd ?? p.volume24H ?? 0,
    ),
  };
}

/** 구형 `token_a` / `token_b` 중첩 응답 → 평면 필드로 합침 */
function richPoolRecordToPlain(p: Record<string, unknown>): Record<string, unknown> {
  const ta = asObjectRecord(p.token_a) ?? {};
  const tb = asObjectRecord(p.token_b) ?? {};
  return {
    ...p,
    name: p.pair ?? p.name,
    address: p.id ?? p.address,
    symbolA: ta.symbol ?? p.symbolA,
    symbolB: tb.symbol ?? p.symbolB,
    logoA: ta.logo_uri ?? ta.logoUri ?? p.logoA,
    logoB: tb.logo_uri ?? tb.logoUri ?? p.logoB,
    tvl: p.tvl_usd ?? p.tvl,
    volume24h: p.volume_24h_usd ?? p.volume24h,
    price: p.current_price ?? p.price,
    apr: p.apr,
  };
}

export function normalizePoolEntry(entry: unknown, index: number): Pool {
  if (entry && typeof entry === "object" && isRichPoolRecord(entry)) {
    return normalizeDiscoveryPoolRow(
      richPoolRecordToPlain(entry as Record<string, unknown>),
      index,
    );
  }
  return normalizeDiscoveryPoolRow(entry as Record<string, unknown>, index);
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
  return unwrapList(data).map((entry, index) =>
    normalizePoolEntry(entry, index),
  );
}

export async function fetchAllTokens(): Promise<Token[]> {
  const { data } = await createPublicApi().get<unknown>("tokens/all");
  return unwrapList(data)
    .map(normalizeTokenEntry)
    .filter((t) => t.mint.length > 0);
}
