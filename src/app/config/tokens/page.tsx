"use client";

import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { useTokens } from "@/hooks/useByrealData";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, CheckCircle2, Loader } from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function TokenSelectionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  const [showSavedToast, setShowSavedToast] = useState(false);

  // 데이터 훅 조회
  const { data: tokens, isLoading: isTokensLoading } = useTokens();
  const [hasInitialized, setHasInitialized] = useState(false);

  // 기존 컨피그 조회 및 가공
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { data: serverConfig } = useConfig(token, !!token);
  const updateConfigMutation = useUpdateConfig();

  useEffect(() => {
    if (serverConfig && !hasInitialized) {
      setSelectedTokens(serverConfig.autoRechargeTokens || []);
      setHasInitialized(true);
    }
  }, [serverConfig, hasInitialized]);

  const filteredTokens = useMemo(() => {
    return tokens?.filter(
      (t) =>
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tokens, searchQuery]);

  const generateSparkline = (id: string) => {
    const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(5 + Math.abs(Math.sin(seed + i) * 30));
    }
    return `M 0 ${points[0]} ${points.map((p, i) => `L ${(i / 9) * 100} ${p}`).join(" ")}`;
  };

  const handleToggleToken = (mint: string) => {
    setSelectedTokens((prev) =>
      prev.includes(mint) ? prev.filter((m) => m !== mint) : [...prev, mint],
    );
  };

  const handleSave = () => {
    if (!token || !serverConfig) return;

    updateConfigMutation.mutate(
      {
        token,
        config: {
          ...serverConfig,
          autoRechargeTokens: selectedTokens,
        },
      },
      {
        onSuccess: () => {
          setShowSavedToast(true);
        },
      },
    );
  };

  return (
    <main className="h-[100dvh] bg-black text-foreground antialiased relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl z-10 flex-1 flex flex-col min-h-0">
        <div className="flex-none pt-8 px-6 sm:px-12 sm:pt-12 pb-4 space-y-6">
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  토큰 자동 충전 관리
                </h1>
                <p className="text-white/60 text-sm sm:text-base mt-1 font-medium">
                  자동 충전 및 트래킹할 토큰 자산을 검색하고 설정해 보세요.
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer text-sm tracking-wide"
            >
              선택 항목 적용 및 저장
            </button>
          </div>

          <div className="flex justify-end">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="토큰 검색 (예: USDC, BONK)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/30 border border-border/30 rounded-2xl pl-10 pr-4 py-2.5 w-full text-sm outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-12 pb-12 custom-scrollbar mask-image-bottom">
          {isTokensLoading ? (
            <div className="w-full h-full flex items-center justify-center flex-col text-muted-foreground gap-2">
              <Loader className="animate-spin" size={32} />
              <p className="text-sm font-medium">
                실시간 토큰 목록 조회 및 불러오는 중...
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredTokens?.map((token) => {
                const isSelected = selectedTokens.includes(token.mint);
                const spark = generateSparkline(token.mint);
                const isPositive = (token.price_change_24h || 0) >= 0;

                return (
                  <motion.div
                    key={token.mint}
                    layoutId={token.mint}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleToggleToken(token.mint)}
                    className={`glass ghost-border p-5 rounded-3xl relative cursor-pointer group transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.05)] bg-emerald-500/5"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {token.logo_uri ? (
                            <img
                              src={token.logo_uri}
                              className="w-8 h-8 rounded-full border border-border"
                              alt=""
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                              {token.symbol.slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {token.symbol}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
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
                          <p className="font-bold text-foreground mt-0.5">
                            $
                            {token.price_usd?.toFixed(
                              token.price_usd < 1 ? 5 : 2,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume 24h</p>
                          <p className="font-bold text-foreground mt-0.5">
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
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          24h Chg
                        </p>
                        <p
                          className={`font-bold text-lg ${isPositive ? "text-emerald-400" : "text-red-400"}`}
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
