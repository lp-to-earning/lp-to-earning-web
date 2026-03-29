"use client";

import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { useInfiniteReveal } from "@/hooks/useInfiniteReveal";
import { usePools, useTokens } from "@/hooks/useByrealData";
import { mintsFromTrackedPools } from "@/lib/pool-token-sync";
import { useStoredAuthToken } from "@/hooks/useStoredAuthToken";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Loader,
  TrendingUp,
  DollarSign,
  Percent,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import SortButtonGroup from "@/components/SortButtonGroup";

import { Suspense } from "react";

function TokenSelectionContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "default";
  const currentOrder = searchParams.get("order") || "desc";

  const [tokenSelectionOverride, setTokenSelectionOverride] = useState<
    string[] | null
  >(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState("");

  const handleSortClick = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === "default") {
      params.delete("sort");
      params.delete("order");
    } else if (currentSort === sortValue) {
      const nextOrder = currentOrder === "desc" ? "asc" : "desc";
      params.set("order", nextOrder);
    } else {
      params.set("sort", sortValue);
      params.set("order", "desc");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "default" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const sortItems = [
    { value: "default", label: "기본 정렬" },
    { value: "price", label: "가격", icon: DollarSign },
    { value: "volume", label: "24h 거래량", icon: TrendingUp },
    { value: "change", label: "변동률", icon: Percent },
  ];

  // 데이터 훅 조회
  const {
    data: tokens,
    isLoading: isTokensLoading,
    isError: isTokensError,
    error: tokensQueryError,
  } = useTokens();
  const authToken = useStoredAuthToken();
  const {
    data: pools,
    isLoading: isPoolsLoading,
    isError: isPoolsError,
    hasNextPage: poolsHasNextPage,
    isFetchingNextPage: isPoolsFetchingNextPage,
  } = usePools(authToken);

  const poolsCatalogReady =
    !isPoolsError &&
    !isPoolsLoading &&
    !isPoolsFetchingNextPage &&
    !poolsHasNextPage;

  const { data: configData } = useConfig(authToken, !!authToken);
  const serverConfig = configData?.config;
  const updateConfigMutation = useUpdateConfig();
  const isSavingConfig = updateConfigMutation.isPending;

  const selectedTokenMints =
    tokenSelectionOverride ?? serverConfig?.autoRechargeTokens ?? [];

  const displayTokens = useMemo(() => {
    const q = searchQuery.trim();
    const ql = q.toLowerCase();
    const base = tokens ?? [];
    const filtered = !q
      ? base
      : base.filter((t) => {
          if (
            t.symbol.toLowerCase().includes(ql) ||
            t.name.toLowerCase().includes(ql)
          )
            return true;
          if (t.mint && t.mint.toLowerCase().includes(ql)) return true;
          return false;
        });

    const isDesc = currentOrder === "desc";
    const list = [...filtered];

    if (currentSort === "price") {
      list.sort((a, b) =>
        isDesc
          ? (b.price_usd || 0) - (a.price_usd || 0)
          : (a.price_usd || 0) - (b.price_usd || 0),
      );
    } else if (currentSort === "volume") {
      list.sort((a, b) =>
        isDesc
          ? (b.volume_24h_usd || 0) - (a.volume_24h_usd || 0)
          : (a.volume_24h_usd || 0) - (b.volume_24h_usd || 0),
      );
    } else if (currentSort === "change") {
      list.sort((a, b) =>
        isDesc
          ? (b.price_change_24h || 0) - (a.price_change_24h || 0)
          : (a.price_change_24h || 0) - (b.price_change_24h || 0),
      );
    } else {
      list.sort(
        (a, b) =>
          a.symbol.localeCompare(b.symbol, undefined, {
            sensitivity: "base",
          }) || a.mint.localeCompare(b.mint),
      );
    }

    return list;
  }, [tokens, searchQuery, currentSort, currentOrder]);

  const listResetKey = `${searchQuery}|${currentSort}|${currentOrder}`;
  const {
    visible: visibleTokens,
    hasMore: hasMoreTokens,
    sentinelRef: tokenSentinelRef,
    scrollRootRef: tokenScrollRootRef,
  } = useInfiniteReveal(displayTokens, {
    batchSize: 20,
    resetKey: listResetKey,
  });

  const generateSparkline = (id: string) => {
    const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(5 + Math.abs(Math.sin(seed + i) * 30));
    }
    return `M 0 ${points[0]} ${points.map((p, i) => `L ${(i / 9) * 100} ${p}`).join(" ")}`;
  };

  const handleToggleToken = (mint: string) => {
    setTokenSelectionOverride((prev) => {
      const base = prev ?? serverConfig?.autoRechargeTokens ?? [];
      return base.includes(mint)
        ? base.filter((m) => m !== mint)
        : [...base, mint];
    });
  };

  const handleSyncFromPools = () => {
    if (!serverConfig || !tokens?.length || !poolsCatalogReady) {
      setSyncToastMessage(
        "풀·토큰 목록을 모두 불러온 뒤 다시 시도해 주세요.",
      );
      setShowSyncToast(true);
      return;
    }

    const poolAddrs = serverConfig.pools ?? [];
    if (poolAddrs.length === 0) {
      setSyncToastMessage(
        "추적 중인 풀이 없습니다. 설정 → 풀에서 먼저 선택해 주세요.",
      );
      setShowSyncToast(true);
      return;
    }

    const { mints, skippedSymbols } = mintsFromTrackedPools(
      poolAddrs,
      pools,
      tokens,
    );

    const base = tokenSelectionOverride ?? serverConfig.autoRechargeTokens ?? [];
    const merged = [...new Set([...base, ...mints])];
    setTokenSelectionOverride(merged);

    const newlyAdded = mints.filter((m) => !base.includes(m)).length;
    let msg =
      newlyAdded > 0
        ? `풀 페어에서 ${newlyAdded}개 토큰을 자동 리충전 목록에 추가했습니다.`
        : "추가할 새 토큰이 없습니다. (이미 선택됨 또는 USDC만 페어)";
    if (skippedSymbols.length > 0) {
      msg += ` 카탈로그에 없는 심볼: ${skippedSymbols.join(", ")}`;
    }
    setSyncToastMessage(msg);
    setShowSyncToast(true);
  };

  const syncFromPoolsDisabled =
    !serverConfig ||
    isSavingConfig ||
    isTokensLoading ||
    isPoolsError ||
    !poolsCatalogReady ||
    !tokens?.length;

  const handleSave = () => {
    if (!authToken || !serverConfig || isSavingConfig) return;

    updateConfigMutation.mutate(
      {
        ...serverConfig,
        autoRechargeTokens: selectedTokenMints,
      },
      {
        onSuccess: () => {
          setTokenSelectionOverride(null);
          setShowSavedToast(true);
        },
      },
    );
  };

  return (
    <main className="text-foreground bg-surface-lowest relative flex h-[100dvh] flex-col items-center overflow-hidden antialiased">
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-tertiary-500/10 blur-[120px]" />

      <div className="z-10 flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <div className="flex-none space-y-6 px-6 pt-8 pb-4 sm:px-12 sm:pt-12">
          <div className="border-border/10 flex flex-col items-start justify-between gap-6 border-b pb-2 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <Link href="/config">
                <div className="group border-muted-100/15 bg-muted-100/10 hover:bg-muted-100/15 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border shadow-lg transition-all">
                  <ArrowLeft
                    size={20}
                    className="text-muted-100/70 group-hover:text-muted-100 transition-colors"
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-muted-100 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  토큰 자동 충전 관리
                </h1>
                <p className="text-muted-100/65 mt-1 text-sm font-medium sm:text-base">
                  자동 충전 및 트래킹할 토큰 자산을 검색하고 설정해 보세요.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={syncFromPoolsDisabled}
                onClick={handleSyncFromPools}
                title="설정에 저장된 추적 풀의 페어 토큰을 USDC 제외하고 목록에 합칩니다"
                className="border-tertiary-500/40 bg-tertiary-500/10 text-tertiary-300 hover:bg-tertiary-500/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
                풀에서 동기화
              </button>
              <button
                type="button"
                disabled={isSavingConfig}
                onClick={handleSave}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-tertiary-600 px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_0_20px_color-mix(in_srgb,var(--color-tertiary-500)_35%,transparent)] transition-all hover:bg-tertiary-500 hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-tertiary-500)_50%,transparent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSavingConfig ? (
                  <Loader className="h-5 w-5 animate-spin" aria-hidden />
                ) : null}
                {isSavingConfig ? "저장 중..." : "선택 항목 적용 및 저장"}
              </button>
            </div>
          </div>

          {/* 🕵️ 검색 바 및 정렬 */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <SortButtonGroup
              items={sortItems}
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortClick={handleSortClick}
              activeColorClass="bg-tertiary-600"
            />

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="심볼·이름 또는 민트 주소"
                value={searchQuery}
                onChange={(e) => updateUrl("q", e.target.value)}
                className="bg-muted/30 border-border/30 focus:border-tertiary-500/50 w-full rounded-2xl border py-2.5 pr-4 pl-10 text-sm transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div
          ref={tokenScrollRootRef}
          className="custom-scrollbar mask-image-bottom min-h-0 flex-1 overflow-y-auto px-6 pb-12 sm:px-12"
        >
          {isTokensLoading ? (
            <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
              <Loader className="animate-spin" size={32} />
              <p className="text-sm font-medium">
                실시간 토큰 목록 조회 및 불러오는 중...
              </p>
            </div>
          ) : isTokensError ? (
            <div className="text-destructive flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center text-sm">
              <p className="font-medium">토큰 목록을 불러오지 못했습니다.</p>
              <p className="text-muted-foreground max-w-md text-xs">
                {tokensQueryError instanceof Error
                  ? tokensQueryError.message
                  : String(tokensQueryError)}
              </p>
            </div>
          ) : displayTokens.length === 0 ? (
            <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center text-sm">
              조건에 맞는 토큰이 없습니다.
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 p-2 md:grid-cols-2 lg:grid-cols-3"
              >
                {visibleTokens.map((token) => {
                  const isSelected = selectedTokenMints.includes(token.mint);
                  const spark = generateSparkline(token.mint);

                  return (
                    <motion.div
                      key={token.mint}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleToggleToken(token.mint)}
                      className={`glass ghost-border group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
                        isSelected
                          ? "bg-tertiary-500/5 shadow-[0_0_50px_color-mix(in_srgb,var(--color-tertiary-500)_8%,transparent)] ring-tertiary-500 ring-2"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {token.logo_uri ? (
                              <Image
                                src={token.logo_uri}
                                className="border-border h-8 w-8 rounded-full border"
                                alt=""
                                width={32}
                                height={32}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="bg-muted-800 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                                {token.symbol.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-foreground text-sm font-bold">
                                {token.symbol}
                              </h3>
                              <p className="text-muted-foreground max-w-[120px] truncate font-mono text-[10px]">
                                {token.name}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2
                              size={18}
                              className="text-tertiary-500"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="text-foreground mt-0.5 font-bold">
                              $
                              {token.price_usd?.toFixed(
                                token.price_usd < 1 ? 5 : 2,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              <div
                ref={tokenSentinelRef}
                className="flex min-h-14 items-center justify-center py-4"
              >
                {hasMoreTokens && (
                  <Loader className="text-muted-foreground/70 h-6 w-6 animate-spin" />
                )}
              </div>
            </>
          )}
        </div>
        <Toast
          show={isSavingConfig}
          message="설정을 저장하는 중..."
          type="loading"
          onClose={() => {}}
        />
        <Toast
          show={showSyncToast}
          message={syncToastMessage}
          type="info"
          duration={4500}
          onClose={() => setShowSyncToast(false)}
        />
        <Toast
          show={showSavedToast}
          message="토큰 설정이 성공적으로 저장되었습니다!"
          type="success"
          onClose={() => setShowSavedToast(false)}
        />
      </div>
    </main>
  );
}

export default function TokenSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-lowest text-muted-100 flex h-screen items-center justify-center">
          <Loader className="animate-spin" size={32} />
        </div>
      }
    >
      <TokenSelectionContent />
    </Suspense>
  );
}
