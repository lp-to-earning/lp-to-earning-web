"use client";

import { useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useInfiniteReveal } from "@/hooks/useInfiniteReveal";
import { usePositions } from "@/hooks/useByrealData";
import { useStoredAuthToken } from "@/hooks/useStoredAuthToken";
import { Card, CardContent } from "@/components/Card";
import SortButtonGroup from "@/components/SortButtonGroup";
import {
  ArrowLeft,
  RefreshCw,
  Layers,
  DollarSign,
  TrendingUp,
  Search,
  Waves,
  LineChart,
  Gift,
  Activity,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";

import { Suspense } from "react";

function PositionsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const authToken = useStoredAuthToken();

  const search = searchParams.get("q") || "";
  const sortField = searchParams.get("sort") || "default";
  const sortType = (searchParams.get("order") || "desc") as "asc" | "desc";

  const { data, isLoading, refetch, isRefetching } = usePositions(
    authToken,
    1,
    1,
  );
  const positions = useMemo(
    () => data?.positions ?? [],
    [data?.positions],
  );
  const summary = useMemo(() => {
    const s = data?.summary;
    if (s) {
      return {
        totalLiquidity: s.totalLiquidityUsd ?? 0,
        totalEarned: s.totalEarnedUsd ?? 0,
        totalPnL: s.totalPnlUsd ?? 0,
        totalBonus: s.totalBonusUsd ?? 0,
      };
    }
    return positions.reduce(
      (
        acc: {
          totalLiquidity: number;
          totalEarned: number;
          totalPnL: number;
          totalBonus: number;
        },
        pos: Position,
      ) => {
        acc.totalLiquidity += parseFloat(pos.liquidityUsd || "0");
        acc.totalEarned += parseFloat(pos.earnedUsd || "0");
        acc.totalPnL += parseFloat(pos.pnlUsd || "0");
        acc.totalBonus += parseFloat(pos.bonusUsd || "0");
        return acc;
      },
      { totalLiquidity: 0, totalEarned: 0, totalPnL: 0, totalBonus: 0 },
    );
  }, [data?.summary, positions]);

  const sortItems = [
    { value: "default", label: "기본 정렬" },
    { value: "liquidityUsd", label: "유동성", icon: Waves },
    { value: "earnedUsd", label: "수익", icon: DollarSign },
  ];

  const handleSortClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "default") {
      params.delete("sort");
      params.delete("order");
    } else if (sortField === value) {
      params.set("order", sortType === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", value);
      params.set("order", "desc");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...positions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (pos: Position) =>
          pos.pair.toLowerCase().includes(q) ||
          pos.nftMintAddress.toLowerCase().includes(q) ||
          pos.poolAddress.toLowerCase().includes(q),
      );
    }

    if (sortField !== "default") {
      list.sort((a: Position, b: Position) => {
        const valA = parseFloat(
          String(a[sortField as keyof Position] ?? "0") || "0",
        );
        const valB = parseFloat(
          String(b[sortField as keyof Position] ?? "0") || "0",
        );
        return sortType === "desc" ? valB - valA : valA - valB;
      });
    }

    return list;
  }, [positions, search, sortField, sortType]);

  const positionsResetKey = `${search}|${sortField}|${sortType}`;
  const {
    visible: visiblePositions,
    hasMore: hasMorePositions,
    sentinelRef: positionsSentinelRef,
  } = useInfiniteReveal(filteredAndSorted, {
    batchSize: 20,
    resetKey: positionsResetKey,
  });

  const revealBatchSize = 20;

  if (!authToken) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
        <div className="glass ghost-border w-full max-w-md rounded-3xl p-10 text-center">
          <h1 className="text-xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            포지션 목록은 JWT 인증 후에 조회할 수 있습니다. 홈에서 지갑 연결 후
            서명 로그인을 완료해 주세요.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500"
          >
            홈으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="glass ghost-border mb-8 flex items-center justify-between rounded-3xl p-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" /> 대시보드
          </Link>
          <h1 className="text-xl font-bold">내 유동성 포지션</h1>
          <button
            onClick={() => refetch()}
            className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl p-2 transition-all disabled:opacity-50"
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Summary Aggregates */}
        {!isLoading && positions.length > 0 && (
          <div className="mb-6">
            <Card
              title={
                <div className="flex items-center gap-1.5 text-sm">
                  <Activity className="h-4 w-4 text-indigo-400" /> 포지션 종합
                  요약
                </div>
              }
            >
              <div className="divide-border/30 mt-1 grid grid-cols-2 gap-4 md:grid-cols-4 md:divide-x">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">
                    총 예치 유동성
                  </span>
                  <span className="mt-1 text-xl font-bold text-indigo-400">
                    ${summary.totalLiquidity.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col md:pl-4">
                  <span className="text-muted-foreground text-xs">
                    총 누적 수익
                  </span>
                  <span className="mt-1 text-xl font-bold text-emerald-400">
                    ${summary.totalEarned.toFixed(4)}
                  </span>
                </div>
                <div className="flex flex-col md:pl-4">
                  <span className="text-muted-foreground text-xs">
                    총 손익 (PnL)
                  </span>
                  <span
                    className={`mt-1 text-xl font-bold ${
                      summary.totalPnL >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    ${summary.totalPnL.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col md:pl-4">
                  <span className="text-muted-foreground text-xs">
                    총 보너스 수익
                  </span>
                  <span className="mt-1 text-xl font-bold text-yellow-400">
                    ${summary.totalBonus.toFixed(4)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search & Sort Panel */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="페어 검색 (ex: MNT, USDC)"
              value={search}
              onChange={(e) => {
                const q = e.target.value;
                const params = new URLSearchParams(searchParams.toString());
                if (!q) params.delete("q");
                else params.set("q", q);
                replace(`${pathname}?${params.toString()}`);
              }}
              className="bg-muted/60 border-border/80 text-foreground placeholder-muted-foreground/60 w-full rounded-xl border py-2 pr-4 pl-9 text-xs font-medium transition-all focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <SortButtonGroup
            items={sortItems}
            currentSort={sortField}
            currentOrder={sortType}
            onSortClick={handleSortClick}
          />
        </div>

        {isLoading ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center p-12">
            <RefreshCw className="mb-4 h-8 w-8 animate-spin" />
            <span>포지션을 불러오는 중...</span>
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visiblePositions.map((pos: Position, idx: number) => (
                <motion.div
                  key={pos.nftMintAddress || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % revealBatchSize) * 0.05 }}
                >
                  <Card
                    title={
                      <>
                        <Layers size={16} /> {pos.pair || "알 수 없는 페어"}
                      </>
                    }
                  >
                    <div className="mt-1 space-y-3">
                      <CardContent
                        icon={DollarSign}
                        label="담보 유동성 (Liquidity)"
                        value={`$${parseFloat(pos.liquidityUsd || "0").toFixed(2)}`}
                        iconBgClass="bg-indigo-500/10"
                        iconColorClass="text-indigo-400"
                      />
                      <CardContent
                        icon={TrendingUp}
                        label="누적 수익 (Earned)"
                        value={`$${parseFloat(pos.earnedUsd || "0").toFixed(4)}`}
                        iconBgClass="bg-emerald-500/10"
                        iconColorClass="text-emerald-400"
                      />
                      <CardContent
                        icon={LineChart}
                        label="손익 (PnL)"
                        value={`$${parseFloat(pos.pnlUsd || "0").toFixed(2)} (${(parseFloat(pos.pnlUsdPercent || "0") * 100).toFixed(2)}%)`}
                        iconBgClass={
                          parseFloat(pos.pnlUsd || "0") >= 0
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        }
                        iconColorClass={
                          parseFloat(pos.pnlUsd || "0") >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      />
                      <CardContent
                        icon={Gift}
                        label="보너스 수익 (Bonus)"
                        value={`$${parseFloat(pos.bonusUsd || "0").toFixed(4)}`}
                        iconBgClass="bg-yellow-500/10"
                        iconColorClass="text-yellow-400"
                      />


                      <div className="border-border/40 mt-3 flex items-center justify-between border-t pt-2 text-xs">
                        <span className="text-muted-foreground font-mono">
                          #
                          {pos.nftMintAddress
                            ? pos.nftMintAddress.slice(0, 8)
                            : "ID-none"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            pos.status === 0
                              ? "border border-green-500/30 bg-green-500/10 text-green-400"
                              : "border border-red-500/30 bg-red-500/10 text-red-400"
                          }`}
                        >
                          {pos.status === 0 ? "Active" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Infinite scroll trigger (viewport 기준) */}
            <div
              ref={positionsSentinelRef}
              className="mt-6 flex h-10 items-center justify-center"
            >
              {hasMorePositions && (
                <RefreshCw className="text-muted-foreground/60 h-5 w-5 animate-spin" />
              )}
            </div>
          </div>
        ) : (
          <div className="glass ghost-border rounded-3xl p-12 text-center">
            <h2 className="text-lg font-bold">
              {search ? "검색 결과가 없습니다." : "보유한 포지션이 없습니다."}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {search
                ? "다른 검색어로 다시 시도해 보세요."
                : "유동성을 먼저 공급하거나 봇 스캔을 가동해 보세요!"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PositionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <Loader className="animate-spin" size={32} />
        </div>
      }
    >
      <PositionsContent />
    </Suspense>
  );
}
