import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getPools, getTokens } from "@/api/pools/pools";
import { getPositions, PositionsResult } from "@/api/positions/positions";

export const usePools = () => {
  return useQuery<Pool[]>({
    queryKey: ["pools"],
    queryFn: getPools,
    staleTime: 5 * 60 * 1000, // 5분
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



export const usePositions = (page: number = 1, pageSize: number = 20) => {
  return useQuery<PositionsResult>({
    queryKey: ["positions", page, pageSize],
    queryFn: () => getPositions(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
  });
};

export const useInfinitePositions = (pageSize: number = 12) => {
  return useInfiniteQuery<PositionsResult>({
    queryKey: ["infinitePositions", pageSize],
    queryFn: ({ pageParam }) => getPositions(pageParam as number, pageSize),
    initialPageParam: 1,
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
