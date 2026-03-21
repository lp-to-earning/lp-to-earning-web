import { useQuery } from "@tanstack/react-query";
import { getPools, getTokens } from "@/api/pools/pools";
import { getPositions } from "@/api/positions/positions";

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

export const usePositions = () => {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: getPositions,
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
  });
};
