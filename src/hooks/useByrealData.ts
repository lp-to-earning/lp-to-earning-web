import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getTokens } from "@/api/pools/pools";
import { fetchUserPools } from "@/api/remote/pools";
import {
  fetchUserPositions,
  type UserPositionsResult,
} from "@/api/remote/positions";

export const usePools = (token: string | null) => {
  return useQuery<Pool[]>({
    queryKey: ["pools", token],
    queryFn: fetchUserPools,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTokens = () => {
  return useQuery<Token[]>({
    queryKey: ["tokens"],
    queryFn: getTokens,
    staleTime: 5 * 60 * 1000, // 5분
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
