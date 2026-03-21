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

import {
  Play,
  Pause,
  Activity,
  Zap,
  DollarSign,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "./Card";
export default function DashboardPanel({ config }: { config: ConfigData }) {
  const { data: pools } = usePools();
  const { data: tokens } = useTokens();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 봇 가동 현황 */}
      <Card
        title="봇 가동 현황"
        rightElement={
          <Link
            href="/positions"
            className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-all duration-200"
          >
            내 포지션 <ChevronRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="space-y-4">
          <CardContent
            icon={Play}
            label="봇 상태"
            value="Background 스캔 중"
            iconBgClass="bg-indigo-500/10"
            iconColorClass="text-indigo-400"
            rightElement={
              <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-green-500" />
            }
          />

          <CardContent
            icon={Pause}
            label="Dry Run 모드"
            value={config.dryRun ? "ON (가상 거래)" : "OFF (실제 거래)"}
            iconBgClass="bg-purple-500/10"
            iconColorClass="text-purple-400"
          />
        </div>
      </Card>

      {/* 설정 스냅샷 (Read Only) */}
      <Card
        title="현재 설정 요약"
        rightElement={
          <Link
            href="/config"
            className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-all duration-200"
          >
            상세 설정 <ChevronRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="space-y-4">
          <CardContent
            icon={Activity}
            label="트래킹 포지션"
            value={`${config.topN} 개`}
          />
          <CardContent
            icon={DollarSign}
            label="카피 금액"
            value={`$${config.copyAmountUsd}`}
          />
          <CardContent
            icon={Zap}
            label="최소 APR 트리거"
            value={`${config.minAprPercent}%`}
          />

          {/* 🌊 카피할 풀 리스트 추가 */}
          <div className="bg-muted/40 border-border/50 flex flex-col gap-2 rounded-2xl border p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Layers size={14} />
              <span className="text-sm">트래킹 대상 풀</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {config.pools && config.pools.length > 0 ? (
                config.pools.map((poolId) => {
                  const pool = pools?.find((p) => p.id === poolId);
                  return (
                    <span
                      key={poolId}
                      className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 font-mono text-xs text-indigo-300"
                    >
                      {pool ? pool.pair : poolId.slice(0, 8)}
                    </span>
                  );
                })
              ) : (
                <span className="text-muted-foreground/60 text-xs">
                  전체 풀 대상 트래킹 중
                </span>
              )}
            </div>
          </div>

          {/* 🪙 자동 리충전 리스트 추가 */}
          <div className="bg-muted/40 border-border/50 flex flex-col gap-2 rounded-2xl border p-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <DollarSign size={14} />
              <span className="text-sm">자동 리충전 대상 토큰</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {config.autoRechargeTokens &&
              config.autoRechargeTokens.length > 0 ? (
                config.autoRechargeTokens.map((mint) => {
                  const token = tokens?.find((t) => t.mint === mint);
                  return (
                    <span
                      key={mint}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-300"
                    >
                      {token ? token.symbol : mint.slice(0, 8)}
                    </span>
                  );
                })
              ) : (
                <span className="text-muted-foreground/60 text-xs">
                  등록된 토큰 없음
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
