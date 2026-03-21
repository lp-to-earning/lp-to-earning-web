import { usePools, useTokens } from "@/hooks/useByrealData";

interface ConfigData {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
  pools?: string[];
  autoRechargeTokens?: string[];
}

import { Play, Pause, Activity, Zap, DollarSign, Layers, ChevronRight } from "lucide-react";
import Link from "next/link";
export default function DashboardPanel({ config }: { config: ConfigData }) {
  const { data: pools } = usePools();
  const { data: tokens } = useTokens();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 봇 가동 현황 */}
      <div className="glass ghost-border p-6 rounded-3xl flex flex-col">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          봇 가동 현황
        </h3>
        <div className="space-y-4">
          <div className="glass ghost-border p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <Play size={18} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">봇 상태</p>
                <p className="text-indigo-300 font-bold text-sm">
                  Background 스캔 중
                </p>
              </div>
            </div>
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </div>

          <div className="bg-muted/40 p-4 rounded-2xl flex items-center justify-between border border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                <Pause size={18} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Dry Run 모드</p>
                <p className="text-purple-300 font-bold text-sm">
                  {config.dryRun ? "ON (가상 거래)" : "OFF (실제 거래)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 설정 스냅샷 (Read Only) */}
      <div className="glass ghost-border p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            현재 설정 요약
          </h3>
          <Link
            href="/config"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            상세 설정 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          <div className="bg-muted/40 p-4 rounded-2xl flex items-center gap-4 border border-border/50">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Activity size={16} />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">트래킹 포지션</span>
              <span className="text-white font-bold">{config.topN} 개</span>
            </div>
          </div>
          <div className="bg-muted/40 p-4 rounded-2xl flex items-center gap-4 border border-border/50">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <DollarSign size={16} />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">카피 금액</span>
              <span className="text-white font-bold">
                ${config.copyAmountUsd}
              </span>
            </div>
          </div>
          <div className="bg-muted/40 p-4 rounded-2xl flex items-center gap-4 border border-border/50">
            <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Zap size={16} />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">최소 APR 트리거</span>
              <span className="text-white font-bold">
                {config.minAprPercent}%
              </span>
            </div>
          </div>

          {/* 🌊 카피할 풀 리스트 추가 */}
          <div className="bg-muted/40 p-4 rounded-2xl flex flex-col gap-2 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers size={14} />
              <span className="text-sm">트래킹 대상 풀</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {config.pools && config.pools.length > 0 ? (
                config.pools.map((poolId) => {
                  const pool = pools?.find((p) => p.id === poolId);
                  return (
                    <span
                      key={poolId}
                      className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-lg text-xs font-mono"
                    >
                      {pool ? pool.pair : poolId.slice(0, 8)}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  전체 풀 대상 트래킹 중
                </span>
              )}
            </div>
          </div>

          {/* 🪙 자동 리충전 리스트 추가 */}
          <div className="bg-muted/40 p-4 rounded-2xl flex flex-col gap-2 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign size={14} />
              <span className="text-sm">자동 리충전 대상 토큰</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {config.autoRechargeTokens && config.autoRechargeTokens.length > 0 ? (
                config.autoRechargeTokens.map((mint) => {
                  const token = tokens?.find((t) => t.mint === mint);
                  return (
                    <span
                      key={mint}
                      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded-lg text-xs font-mono"
                    >
                      {token ? token.symbol : mint.slice(0, 8)}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  등록된 토큰 없음
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
