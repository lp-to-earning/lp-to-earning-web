"use server";

import { botFetch } from "@/api/botClient";

interface BotPositionsResponse {
  success: boolean;
  data: {
    summary: {
      count: number;
      totalLiquidityUsd: number;
      totalEarnedUsd: number;
      totalPnlUsd: number;
    };
    positions: Position[];
  };
}

export interface PositionsResult {
  positions: Position[];
  total: number;
}

export const getPositions = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<PositionsResult> => {
  try {
    const res = await botFetch<BotPositionsResponse>("/api/positions");
    const positions = res.data?.positions || [];

    // 클라이언트 사이드 페이지네이션
    const start = (page - 1) * pageSize;
    const paged = positions.slice(start, start + pageSize);

    return {
      positions: paged,
      total: positions.length,
    };
  } catch (error) {
    console.error("Failed to fetch positions from bot API:", error);
    return { positions: [], total: 0 };
  }
};
