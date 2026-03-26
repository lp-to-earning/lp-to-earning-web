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

export async function fetchUserPositions(
  page: number,
  pageSize: number,
): Promise<UserPositionsResult> {
  const { data } = await getAuthedAxios().get<unknown>("/positions");
  const root = unwrapPayload(data) ?? (data as Record<string, unknown>) ?? {};
  const rawList = Array.isArray(root.positions)
    ? (root.positions as Position[])
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
