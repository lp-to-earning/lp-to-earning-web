import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchAllPools, fetchAllTokens } from "@/api/remote/discovery";
import {
  fetchUserPositions,
  type UserPositionsResult,
} from "@/api/remote/positions";

/** Discovery `GET /api/pools/all` — 인증 불필요. `_token`은 기존 호출부 호환용. */
export const usePools = (_token: string | null) => {
  return useQuery<Pool[]>({
    queryKey: ["pools", "discovery", "all"],
    queryFn: fetchAllPools,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/** Discovery `GET /api/tokens/all` — 인증 불필요 */
export const useTokens = () => {
  return useQuery<Token[]>({
    queryKey: ["tokens", "discovery", "all"],
    queryFn: fetchAllTokens,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};



export const usePositions = (
  token: string | null,
  page: number = 1,
  pageSize: number = 20,
) => {
  return useQuery<UserPositionsResult>({
    queryKey: ["positions", token, page, pageSize],
    queryFn: () => fetchUserPositions(page, pageSize),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/** fetchUserPositions는 현재 전체 목록을 한 번에 반환합니다. 중복 페이징이 필요하면 서버 offset API와 맞춰 조정하세요. */
export const useInfinitePositions = (
  token: string | null,
  pageSize: number = 12,
) => {
  return useInfiniteQuery<UserPositionsResult>({
    queryKey: ["infinitePositions", token, pageSize],
    queryFn: ({ pageParam }) =>
      fetchUserPositions(pageParam as number, pageSize),
    initialPageParam: 1,
    enabled: !!token,
    getNextPageParam: (lastPage, allPages) => {
      const currentTotal = allPages.flatMap((p) => p.positions).length;
      if (currentTotal < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
