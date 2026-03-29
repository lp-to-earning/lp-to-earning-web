import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { fetchAllPools, fetchAllTokens } from "@/api/remote/catalog";
import {
  fetchUserPositions,
  type UserPositionsResult,
} from "@/api/remote/positions";

/** `useInfiniteQuery` 한 페이지 — positions 패턴과 동일 */
export interface PoolsCatalogPage {
  pools: Pool[];
  total: number;
}

export interface TokensCatalogPage {
  tokens: Token[];
  total: number;
}

async function slicePoolsPage(
  queryClient: QueryClient,
  page: number,
  pageSize: number,
): Promise<PoolsCatalogPage> {
  const all = await queryClient.ensureQueryData({
    queryKey: ["pools", "catalog", "full"],
    queryFn: fetchAllPools,
    staleTime: 5 * 60 * 1000,
  });
  const start = (page - 1) * pageSize;
  return {
    pools: all.slice(start, start + pageSize),
    total: all.length,
  };
}

async function sliceTokensPage(
  queryClient: QueryClient,
  page: number,
  pageSize: number,
): Promise<TokensCatalogPage> {
  const all = await queryClient.ensureQueryData({
    queryKey: ["tokens", "catalog", "full"],
    queryFn: fetchAllTokens,
    staleTime: 5 * 60 * 1000,
  });
  const start = (page - 1) * pageSize;
  return {
    tokens: all.slice(start, start + pageSize),
    total: all.length,
  };
}

/**
 * 공개 `GET /api/pools/all` — `useInfinitePositions`와 같은 infinite 패턴.
 * 네트워크는 `catalog/full` 캐시로 1회, 이후 페이지는 클라이언트 슬라이스.
 * `data`는 로드된 페이지를 합친 `Pool[]` (남은 페이지는 마운트 시 자동 fetch).
 */
export const usePools = (
  _token: string | null,
  options?: { pageSize?: number; enabled?: boolean },
) => {
  const pageSize = options?.pageSize ?? 60;
  const catalogEnabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const q = useInfiniteQuery({
    queryKey: ["pools", "infinite", pageSize],
    queryFn: ({ pageParam }) =>
      slicePoolsPage(queryClient, pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.pools.length, 0);
      if (loaded < lastPage.total) return allPages.length + 1;
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: catalogEnabled,
  });

  const data = useMemo(
    () => q.data?.pages.flatMap((p) => p.pools) ?? [],
    [q.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = q;

  useEffect(() => {
    if (!catalogEnabled) return;
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [catalogEnabled, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
  };
};

/** 공개 `GET /api/tokens/all` — pools와 동일 infinite + flatten */
export const useTokens = (options?: { pageSize?: number; enabled?: boolean }) => {
  const pageSize = options?.pageSize ?? 60;
  const catalogEnabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const q = useInfiniteQuery({
    queryKey: ["tokens", "infinite", pageSize],
    queryFn: ({ pageParam }) =>
      sliceTokensPage(queryClient, pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.tokens.length, 0);
      if (loaded < lastPage.total) return allPages.length + 1;
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: catalogEnabled,
  });

  const data = useMemo(
    () => q.data?.pages.flatMap((p) => p.tokens) ?? [],
    [q.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = q;

  useEffect(() => {
    if (!catalogEnabled) return;
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [catalogEnabled, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
  };
};

export const usePositions = (
  token: string | null,
  page: number = 1,
  pageSize: number = 20,
  options?: { enabled?: boolean },
) => {
  const queryEnabled = options?.enabled ?? true;
  return useQuery<UserPositionsResult>({
    queryKey: ["positions", token, page, pageSize],
    queryFn: () => fetchUserPositions(page, pageSize),
    enabled: !!token && queryEnabled,
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
