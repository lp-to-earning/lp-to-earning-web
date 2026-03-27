"use client";

import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { useInfiniteReveal } from "@/hooks/useInfiniteReveal";
import { useTokens } from "@/hooks/useByrealData";
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

  const { data: configData } = useConfig(authToken, !!authToken);
  const serverConfig = configData?.config;
  const updateConfigMutation = useUpdateConfig();

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

  const handleSave = () => {
    if (!authToken || !serverConfig) return;

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
    <main className="text-foreground relative flex h-[100dvh] flex-col items-center overflow-hidden bg-black antialiased">
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="z-10 flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <div className="flex-none space-y-6 px-6 pt-8 pb-4 sm:px-12 sm:pt-12">
          <div className="border-border/10 flex flex-col items-start justify-between gap-6 border-b pb-2 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <Link href="/config">
                <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg transition-all hover:bg-white/10">
                  <ArrowLeft
                    size={20}
                    className="text-white/70 transition-colors group-hover:text-white"
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  토큰 자동 충전 관리
                </h1>
                <p className="mt-1 text-sm font-medium text-white/60 sm:text-base">
                  자동 충전 및 트래킹할 토큰 자산을 검색하고 설정해 보세요.
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full cursor-pointer rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 md:w-auto"
            >
              선택 항목 적용 및 저장
            </button>
          </div>

          {/* 🕵️ 검색 바 및 정렬 */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <SortButtonGroup
              items={sortItems}
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortClick={handleSortClick}
              activeColorClass="bg-emerald-600"
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
                className="bg-muted/30 border-border/30 w-full rounded-2xl border py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <div
          ref={tokenScrollRootRef}
          className="custom-scrollbar mask-image-bottom flex-1 overflow-y-auto px-6 pb-12 sm:px-12"
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
                const isPositive = (token.price_change_24h || 0) >= 0;

                return (
                  <motion.div
                    key={token.mint}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleToggleToken(token.mint)}
                    className={`glass ghost-border group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
                      isSelected
                        ? "bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.05)] ring-2 ring-emerald-500"
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
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
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
                            className="text-emerald-500"
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
                        <div>
                          <p className="text-muted-foreground">Volume 24h</p>
                          <p className="text-foreground mt-0.5 font-bold">
                            $
                            {token.volume_24h_usd
                              ? Math.round(
                                  token.volume_24h_usd,
                                ).toLocaleString()
                              : "N/A"}
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
                          className="drop-shadow-md"
                        >
                          <path
                            d={spark}
                            fill="none"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                          24h Chg
                        </p>
                        <p
                          className={`text-lg font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {isPositive ? "+" : ""}
                          {(token.price_change_24h || 0).toFixed(2)}%
                        </p>
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
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <Loader className="animate-spin" size={32} />
        </div>
      }
    >
      <TokenSelectionContent />
    </Suspense>
  );
}
