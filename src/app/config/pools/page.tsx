"use client";

import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { useInfiniteReveal } from "@/hooks/useInfiniteReveal";
import { usePools } from "@/hooks/useByrealData";
import { useStoredAuthToken } from "@/hooks/useStoredAuthToken";
import { useState, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Waves,
  Loader,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";
import Image from "next/image";
import SortButtonGroup from "@/components/SortButtonGroup";
import { ManagedWalletRequiredModal } from "@/components/ManagedWalletRequiredModal";

import { Suspense } from "react";

function PoolSelectionContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "default";
  const currentOrder = searchParams.get("order") || "desc";

  const [poolSelectionOverride, setPoolSelectionOverride] = useState<
    string[] | null
  >(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "default" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

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

  const sortItems = [
    { value: "default", label: "기본 정렬" },
    { value: "apr", label: "APR", icon: TrendingUp },
    { value: "tvl", label: "TVL", icon: Waves },
  ];

  const authToken = useStoredAuthToken();

  const {
    data: configData,
    isPending: isConfigPending,
    isError: isConfigError,
    isSuccess: isConfigSuccess,
    error: configQueryError,
  } = useConfig(authToken, !!authToken);
  const walletReady =
    isConfigSuccess && configData?.isManagedWallet === true;

  const {
    data: pools,
    isLoading: isPoolsLoading,
    isError: isPoolsError,
    error: poolsQueryError,
  } = usePools(authToken, { enabled: walletReady });
  const serverConfig = configData?.config;
  const updateConfigMutation = useUpdateConfig();
  const isSavingConfig = updateConfigMutation.isPending;

  const selectedPools = poolSelectionOverride ?? serverConfig?.pools ?? [];

  const totalPoolCount = pools?.length ?? 0;

  /** 검색(페어·주소) → 정렬. 그리드·요약 숫자 모두 이 배열 기준으로 맞춤 */
  const displayPools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = pools ?? [];
    const filtered = !q
      ? base
      : base.filter((pool) => {
          const label = String(pool.name ?? "").toLowerCase();
          const addr = String(pool.address ?? "").toLowerCase();
          const sym = `${pool.symbolA}/${pool.symbolB}`.toLowerCase();
          return label.includes(q) || addr.includes(q) || sym.includes(q);
        });

    const isDesc = currentOrder === "desc";
    const list = [...filtered];

    if (currentSort === "apr") {
      list.sort((a, b) => (isDesc ? b.apr - a.apr : a.apr - b.apr));
    } else if (currentSort === "tvl") {
      list.sort((a, b) => (isDesc ? b.tvl - a.tvl : a.tvl - b.tvl));
    } else {
      list.sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) ||
          a.address.localeCompare(b.address),
      );
    }

    return list;
  }, [pools, searchQuery, currentSort, currentOrder]);

  const summaryFromDisplay = useMemo(() => {
    if (displayPools.length === 0) {
      return { highestApr: 0, totalVolume: 0 };
    }
    return {
      highestApr: displayPools.reduce((m, p) => Math.max(m, p.apr), 0),
      totalVolume: displayPools.reduce((s, p) => s + (p.volume24h || 0), 0),
    };
  }, [displayPools]);

  const listResetKey = `${searchQuery}|${currentSort}|${currentOrder}`;
  const {
    visible: visiblePools,
    hasMore: hasMorePools,
    sentinelRef: poolSentinelRef,
    scrollRootRef: poolScrollRootRef,
  } = useInfiniteReveal(displayPools, {
    batchSize: 20,
    resetKey: listResetKey,
  });

  // 스파클라인 시뮬레이션 랜덤 데이터 생성기용 패스 드로잉
  const generateSparkline = (id: string) => {
    // ID 시드를 통해 항상 동일한 랜덤 노이즈 값 생성
    const seed = id.charCodeAt(0) + (id.charCodeAt(1) ?? 0);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(5 + Math.abs(Math.sin(seed + i) * 30));
    }
    return `M 0 ${points[0]} ${points.map((p, i) => `L ${(i / 9) * 100} ${p}`).join(" ")}`;
  };

  const handleTogglePool = (poolId: string) => {
    setPoolSelectionOverride((prev) => {
      const base = prev ?? serverConfig?.pools ?? [];
      return base.includes(poolId)
        ? base.filter((id) => id !== poolId)
        : [...base, poolId];
    });
  };

  const handleSave = () => {
    if (!authToken || !serverConfig || isSavingConfig) return;

    updateConfigMutation.mutate(
      {
        ...serverConfig,
        pools: selectedPools,
      },
      {
        onSuccess: () => {
          setPoolSelectionOverride(null);
          setShowSavedToast(true);
        },
      },
    );
  };

  if (!authToken) {
    return (
      <main className="bg-surface-lowest text-muted-100 flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-8 antialiased">
        <p className="text-muted-foreground text-center text-sm">
          로그인이 필요합니다.
        </p>
        <Link
          href="/"
          className="text-primary-400 text-sm font-semibold underline-offset-2 hover:underline"
        >
          홈으로 이동
        </Link>
      </main>
    );
  }

  if (isConfigPending) {
    return (
      <main className="bg-surface-lowest flex min-h-[100dvh] flex-col items-center justify-center antialiased">
        <Loader className="text-primary-400 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground mt-4 text-sm">설정을 불러오는 중…</p>
      </main>
    );
  }

  if (isConfigError) {
    return (
      <main className="bg-surface-lowest flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-8 antialiased">
        <p className="text-error-400 text-center text-sm font-medium">
          설정을 불러오지 못했습니다.
        </p>
        <p className="text-muted-foreground max-w-md text-center text-xs">
          {configQueryError instanceof Error
            ? configQueryError.message
            : String(configQueryError)}
        </p>
        <Link
          href="/config"
          className="text-primary-400 text-sm font-semibold underline-offset-2 hover:underline"
        >
          설정으로
        </Link>
      </main>
    );
  }

  if (configData && !configData.isManagedWallet) {
    return (
      <main className="bg-surface-lowest relative min-h-[100dvh] antialiased">
        <ManagedWalletRequiredModal />
      </main>
    );
  }

  return (
    <main className="text-foreground bg-surface-lowest relative flex h-[100dvh] flex-col items-center overflow-hidden antialiased">
      {/* 🔮 뒷배경 글로우 조명 */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-[120px]" />

      <div className="z-10 flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        {/* 상단 고정 영역 (스크롤 무관) */}
        <div className="flex-none space-y-6 px-6 pt-8 pb-4 sm:px-12 sm:pt-12">
          {/* 🧭 헤더 */}
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
                <h1 className="text-muted-100 text-2xl font-extrabold tracking-tight drop-shadow-sm sm:text-3xl">
                  유동성 풀 모니터링
                </h1>
                <p className="text-muted-100/65 mt-1 text-sm font-medium sm:text-base">
                  트래킹할 Liquidity Pool을 검색하고 설정해 보세요.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSavingConfig}
              onClick={handleSave}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500)_35%,transparent)] transition-all hover:bg-primary-500 hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary-500)_50%,transparent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {isSavingConfig ? (
                <Loader className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {isSavingConfig ? "저장 중..." : "선택 항목 적용 및 저장"}
            </button>
          </div>

          {/* 📊 한눈에 보는 데이터 대시보드 배너 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass ghost-border flex items-center gap-4 rounded-3xl p-5"
            >
              <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-400">
                <Waves size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  목록에 맞는 풀
                </p>
                <h4 className="text-foreground mt-1 font-mono text-xl font-bold">
                  {displayPools.length} 개
                </h4>
                {searchQuery.trim() ? (
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    전체 {totalPoolCount}개 중
                  </p>
                ) : null}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass ghost-border flex items-center gap-4 rounded-3xl p-5"
            >
              <div className="rounded-2xl bg-tertiary-500/10 p-3 text-tertiary-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  목록 중 최대 APR
                </p>
                <h4 className="text-tertiary-400 mt-1 font-mono text-xl font-bold">
                  {summaryFromDisplay.highestApr.toFixed(1)}%
                </h4>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass ghost-border flex items-center gap-4 rounded-3xl p-5"
            >
              <div className="rounded-2xl bg-warning-500/10 p-3 text-warning-400">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  24h 거래량 (목록 기준)
                </p>
                <h4 className="text-foreground mt-1 font-mono text-xl font-bold">
                  ${Math.round(summaryFromDisplay.totalVolume).toLocaleString()}
                </h4>
              </div>
            </motion.div>
          </div>

          {/* 🕵️ 검색 바 및 정렬 */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <SortButtonGroup
              items={sortItems}
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortClick={handleSortClick}
              activeColorClass="bg-primary-600"
            />

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="페어 또는 풀 주소 검색"
                value={searchQuery}
                onChange={(e) => updateUrl("q", e.target.value)}
                className="bg-muted/30 border-border/30 focus:border-primary-500/50 w-full rounded-2xl border py-2.5 pr-4 pl-10 text-sm transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* 📋 카드 그리드 렌더링 섹션 (이곳만 스크롤) */}
        <div
          ref={poolScrollRootRef}
          className="custom-scrollbar mask-image-bottom min-h-0 flex-1 overflow-y-auto px-6 pb-12 sm:px-12"
        >
          {isPoolsLoading ? (
            <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
              <Loader className="animate-spin" size={32} />
              <p className="text-sm font-medium">
                실시간 풀 목록 조회 및 불러오는 중...
              </p>
            </div>
          ) : isPoolsError ? (
            <div className="text-destructive flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center text-sm">
              <p className="font-medium">풀 목록을 불러오지 못했습니다.</p>
              <p className="text-muted-foreground max-w-md text-xs">
                {poolsQueryError instanceof Error
                  ? poolsQueryError.message
                  : String(poolsQueryError)}
              </p>
            </div>
          ) : displayPools.length === 0 ? (
            <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center text-sm">
              조건에 맞는 풀이 없습니다.
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 p-2 md:grid-cols-2 lg:grid-cols-3"
              >
                {visiblePools.map((pool) => {
                  const isSelected = selectedPools.includes(pool.address);
                  const spark = generateSparkline(pool.address);
                  return (
                    <motion.div
                      key={pool.address}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleTogglePool(pool.address)}
                      className={`glass ghost-border !border-opacity-50 hover:bg-muted/10 group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
                        isSelected
                          ? "bg-primary-500/5 shadow-[0_0_50px_color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] ring-primary-500 ring-2"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative flex h-8 w-8 items-center">
                              {pool.logoA ? (
                                <Image
                                  src={pool.logoA}
                                  className="absolute left-0 h-6 w-6 rounded-full border border-black"
                                  alt=""
                                  width={24}
                                  height={24}
                                  unoptimized={true}
                                />
                              ) : (
                                <div className="bg-muted-800 absolute left-0 h-6 w-6 rounded-full" />
                              )}
                              {pool.logoB ? (
                                <Image
                                  src={pool.logoB}
                                  className="absolute left-3.5 z-10 h-6 w-6 rounded-full border border-black"
                                  alt=""
                                  width={24}
                                  height={24}
                                  unoptimized={true}
                                />
                              ) : (
                                <div className="bg-muted-500 absolute left-3.5 z-10 h-6 w-6 rounded-full" />
                              )}
                            </div>
                            <h3 className="text-foreground font-mono text-sm font-bold">
                              {pool.name}
                            </h3>
                          </div>
                          {isSelected && (
                            <CheckCircle2
                              size={18}
                              className="text-primary-500"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">TVL</p>
                            <p className="text-foreground mt-0.5 font-bold">
                              ${Math.round(pool.tvl).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume 24h</p>
                            <p className="text-foreground mt-0.5 font-bold">
                              ${Math.round(pool.volume24h).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-border/20 mt-4 flex items-center justify-between border-t pt-4">
                        <div className="h-[40px] max-w-[120px] flex-1 opacity-70 transition-all duration-300 group-hover:scale-[1.05] group-hover:opacity-100">
                          <svg
                            width="100%"
                            height="100%"
                            viewBox="0 -5 100 50"
                            className="text-primary-500 drop-shadow-md"
                          >
                            <path
                              d={spark}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                            Est. APR
                          </p>
                          <p className="text-tertiary-400 drop-shadow-[0_0_8px_color-mix(in_srgb,var(--color-tertiary-400)_35%,transparent)] text-lg font-extrabold">
                            {pool.apr.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              <div
                ref={poolSentinelRef}
                className="flex min-h-14 items-center justify-center py-4"
              >
                {hasMorePools && (
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
          show={showSavedToast}
          message="풀 설정이 성공적으로 저장되었습니다!"
          onClose={() => setShowSavedToast(false)}
        />
      </div>
    </main>
  );
}

export default function PoolSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-lowest text-muted-100 flex h-screen items-center justify-center">
          <Loader className="animate-spin" size={32} />
        </div>
      }
    >
      <PoolSelectionContent />
    </Suspense>
  );
}
