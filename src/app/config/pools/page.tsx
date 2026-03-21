"use client";

import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { usePools } from "@/hooks/useByrealData";
import { useState, useMemo, useEffect } from "react";
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

export default function PoolSelectionPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "default";
  const currentOrder = searchParams.get("order") || "desc";

  const [selectedPools, setSelectedPools] = useState<string[]>([]);
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

  // 데이터 훅 조회
  const { data: pools, isLoading: isPoolsLoading } = usePools();
  const [hasInitialized, setHasInitialized] = useState(false);

  // 기존 컨피그 조회 및 가공
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { data: serverConfig } = useConfig(token, !!token);
  const updateConfigMutation = useUpdateConfig();

  useEffect(() => {
    if (serverConfig && !hasInitialized) {
      setSelectedPools(serverConfig.pools || []);
      setHasInitialized(true);
    }
  }, [serverConfig, hasInitialized]);

  // 검색 데이터 필터링 및 정렬
  const filteredPools = useMemo(() => {
    let list =
      pools?.filter((pool) =>
        pool.pair.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [];

    const isDesc = currentOrder === "desc";

    if (currentSort === "apr") {
      list = [...list].sort((a, b) => (isDesc ? b.apr - a.apr : a.apr - b.apr));
    } else if (currentSort === "tvl") {
      list = [...list].sort((a, b) =>
        isDesc ? b.tvl_usd - a.tvl_usd : a.tvl_usd - b.tvl_usd,
      );
    }

    return list;
  }, [pools, searchQuery, currentSort, currentOrder]);

  // 스파클라인 시뮬레이션 랜덤 데이터 생성기용 패스 드로잉
  const generateSparkline = (id: string) => {
    // ID 시드를 통해 항상 동일한 랜덤 노이즈 값 생성
    const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(5 + Math.abs(Math.sin(seed + i) * 30));
    }
    return `M 0 ${points[0]} ${points.map((p, i) => `L ${(i / 9) * 100} ${p}`).join(" ")}`;
  };

  const handleTogglePool = (poolId: string) => {
    setSelectedPools((prev) =>
      prev.includes(poolId)
        ? prev.filter((id) => id !== poolId)
        : [...prev, poolId],
    );
  };

  const handleSave = () => {
    if (!token || !serverConfig) return;

    updateConfigMutation.mutate(
      {
        token,
        config: {
          ...serverConfig,
          pools: selectedPools,
        },
      },
      {
        onSuccess: () => {
          setShowSavedToast(true);
        },
      },
    );
  };

  const highestApr =
    pools?.reduce((max, p) => (p.apr > max ? p.apr : max), 0) || 0;
  const totalVolume =
    pools?.reduce((sum, p) => sum + (p.volume_24h_usd || 0), 0) || 0;

  return (
    <main className="h-[100dvh] bg-black text-foreground antialiased relative overflow-hidden flex flex-col items-center">
      {/* 🔮 뒷배경 글로우 조명 */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl z-10 flex-1 flex flex-col min-h-0">
        {/* 상단 고정 영역 (스크롤 무관) */}
        <div className="flex-none pt-8 px-6 sm:px-12 sm:pt-12 pb-4 space-y-6">
          {/* 🧭 헤더 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-border/10">
            <div className="flex items-center gap-5">
              <Link href="/config">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center group shadow-lg">
                  <ArrowLeft
                    size={20}
                    className="text-white/70 group-hover:text-white transition-colors"
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  유동성 풀 모니터링
                </h1>
                <p className="text-white/60 text-sm sm:text-base mt-1 font-medium">
                  트래킹할 Liquidity Pool을 검색하고 설정해 보세요.
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 cursor-pointer text-sm tracking-wide"
            >
              선택 항목 적용 및 저장
            </button>
          </div>

          {/* 📊 한눈에 보는 데이터 대시보드 배너 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass ghost-border p-5 rounded-3xl flex items-center gap-4"
            >
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Waves size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  총 제공 유동성 풀
                </p>
                <h4 className="text-xl font-bold font-mono text-foreground mt-1">
                  {pools?.length || 0} 개
                </h4>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass ghost-border p-5 rounded-3xl flex items-center gap-4"
            >
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  최대 지원 APR 범위
                </p>
                <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {highestApr.toFixed(1)}%
                </h4>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass ghost-border p-5 rounded-3xl flex items-center gap-4"
            >
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  24h 전체 거래량
                </p>
                <h4 className="text-xl font-bold font-mono text-foreground mt-1">
                  ${Math.round(totalVolume).toLocaleString()}
                </h4>
              </div>
            </motion.div>
          </div>

          {/* 🕵️ 검색 바 및 정렬 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SortButtonGroup
              items={sortItems}
              currentSort={currentSort}
              currentOrder={currentOrder}
              onSortClick={handleSortClick}
              activeColorClass="bg-indigo-600"
            />

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="풀 이름 검색 (예: SOL/USDC)"
                value={searchQuery}
                onChange={(e) => updateUrl("q", e.target.value)}
                className="bg-muted/30 border border-border/30 rounded-2xl pl-10 pr-4 py-2.5 w-full text-sm outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 📋 카드 그리드 렌더링 섹션 (이곳만 스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 pb-12 custom-scrollbar mask-image-bottom">
          {isPoolsLoading ? (
            <div className="w-full h-full flex items-center justify-center flex-col text-muted-foreground gap-2">
              <Loader className="animate-spin" size={32} />
              <p className="text-sm font-medium">
                실시간 풀 목록 조회 및 불러오는 중...
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredPools?.map((pool) => {
                const isSelected = selectedPools.includes(pool.id);
                const spark = generateSparkline(pool.id);
                return (
                  <motion.div
                    key={pool.id}
                    layoutId={pool.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleTogglePool(pool.id)}
                    className={`glass ghost-border !border-opacity-50 hover:bg-muted/10 p-5 rounded-3xl relative cursor-pointer group transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.05)] bg-indigo-500/5"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 flex items-center">
                            {pool.token_a.logo_uri ? (
                              <Image
                                src={pool.token_a.logo_uri}
                                className="w-6 h-6 rounded-full border border-black absolute left-0"
                                alt=""
                                width={24}
                                height={24}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-700 absolute left-0" />
                            )}
                            {pool.token_b.logo_uri ? (
                              <Image
                                src={pool.token_b.logo_uri}
                                className="w-6 h-6 rounded-full border border-black absolute left-3.5 z-10"
                                alt=""
                                width={24}
                                height={24}
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-400 absolute left-3.5 z-10" />
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-foreground font-mono">
                            {pool.pair}
                          </h3>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-indigo-500" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-bold text-foreground mt-0.5">
                            ${Math.round(pool.tvl_usd).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume 24h</p>
                          <p className="font-bold text-foreground mt-0.5">
                            ${Math.round(pool.volume_24h_usd).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-4">
                      <div className="flex-1 max-w-[120px] h-[40px] opacity-70 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-300">
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 -5 100 50"
                          className="drop-shadow-md"
                        >
                          <path
                            d={spark}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          Est. APR
                        </p>
                        <p className="font-extrabold text-emerald-400 text-lg drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                          {pool.apr.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
        <Toast
          show={showSavedToast}
          message="풀 설정이 성공적으로 저장되었습니다!"
          onClose={() => setShowSavedToast(false)}
        />
      </div>
    </main>
  );
}
