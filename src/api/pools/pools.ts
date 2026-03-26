"use server";

import { botFetch } from "@/api/botClient";

interface BotPoolsResponse {
  success: boolean;
  data: {
    pools: Pool[];
  };
}

export const getPools = async (): Promise<Pool[]> => {
  try {
    const res = await botFetch<BotPoolsResponse>("/api/pools");
    return res.data?.pools || [];
  } catch (error) {
    console.error("Failed to fetch pools from bot API:", error);
    return [];
  }
};

export const getTokens = async (): Promise<Token[]> => {
  try {
    // 봇 API에 tokens 엔드포인트가 없으므로 빈 배열 반환
    // 필요 시 봇 API에 /api/tokens 추가 가능
    return [];
  } catch (error) {
    console.error("Failed to fetch tokens:", error);
    return [];
  }
};
