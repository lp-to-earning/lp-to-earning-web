import { useQuery } from "@tanstack/react-query";
import { fetchHotWalletBalances } from "@/api/remote/balances";

export const hotWalletBalanceKeys = {
  all: ["balances", "hot-wallet"] as const,
};

export function useHotWalletBalances(enabled: boolean) {
  return useQuery({
    queryKey: hotWalletBalanceKeys.all,
    queryFn: fetchHotWalletBalances,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
