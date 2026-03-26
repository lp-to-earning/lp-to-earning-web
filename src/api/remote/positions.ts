import { getAuthedAxios } from "@/lib/authed-axios";

export interface PositionsSummary {
  count?: number;
  totalLiquidityUsd?: number;
  totalEarnedUsd?: number;
  totalPnlUsd?: number;
  totalBonusUsd?: number;
}

export interface UserPositionsResult {
  positions: Position[];
  total: number;
  summary: PositionsSummary | null;
}

function unwrapPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
    return d.data as Record<string, unknown>;
  }
  return d;
}

function numToAmountString(value: unknown): string {
  if (value === null || value === undefined) return "0";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value;
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "0";
}

/** lp-to-earning-server: 숫자 필드 위주 → UI Position(문자 금액)으로 맞춤 */
function normalizePosition(entry: unknown): Position {
  if (
    entry &&
    typeof entry === "object" &&
    typeof (entry as Position).liquidityUsd === "string" &&
    "nftMintAddress" in (entry as object)
  ) {
    return entry as Position;
  }

  const p = entry as Record<string, unknown>;
  const pair = String(p.pair ?? "");
  const poolAddress = String(p.poolAddress ?? "");

  return {
    positionAddress: String(p.positionAddress ?? ""),
    nftMintAddress: String(p.nftMintAddress ?? ""),
    poolAddress: poolAddress || pair,
    tickLower: Number(p.tickLower ?? 0),
    tickUpper: Number(p.tickUpper ?? 0),
    status: Number(p.status ?? 0),
    liquidityUsd: numToAmountString(p.liquidityUsd),
    earnedUsd: numToAmountString(p.earnedUsd),
    earnedUsdPercent: numToAmountString(p.earnedUsdPercent),
    pnlUsd: numToAmountString(p.pnlUsd),
    pnlUsdPercent: numToAmountString(p.pnlUsdPercent),
    apr: (() => {
      if (p.apr === null || p.apr === undefined) return null;
      const n = typeof p.apr === "number" ? p.apr : Number(p.apr);
      return Number.isFinite(n) ? n : null;
    })(),
    bonusUsd: numToAmountString(p.bonusUsd),
    pair,
    tokenSymbolA: String(p.tokenSymbolA ?? ""),
    tokenSymbolB: String(p.tokenSymbolB ?? ""),
  };
}

export async function fetchUserPositions(
  page: number,
  pageSize: number,
): Promise<UserPositionsResult> {
  const { data } = await getAuthedAxios().get<unknown>("/positions");
  const root = unwrapPayload(data) ?? (data as Record<string, unknown>) ?? {};
  const rawList = Array.isArray(root.positions)
    ? (root.positions as unknown[]).map(normalizePosition)
    : [];
  const summary =
    root.summary && typeof root.summary === "object"
      ? (root.summary as PositionsSummary)
      : null;

  const start = (page - 1) * pageSize;
  const paged = rawList.slice(start, start + pageSize);

  return {
    positions: paged,
    total: rawList.length,
    summary,
  };
}
