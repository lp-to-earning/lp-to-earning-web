import { Play, Pause, Activity, Zap, DollarSign } from "lucide-react";
import Link from "next/link";

interface ConfigData {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
}

export default function DashboardPanel({ config }: { config: ConfigData }) {
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
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            상세 설정
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
        </div>
      </div>
    </div>
  );
}
