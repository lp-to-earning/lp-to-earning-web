"use client";

import { usePools, useTokens } from "@/hooks/useByrealData";

interface ConfigData {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
  isActive: boolean;
  pools?: string[];
  autoRechargeTokens?: string[];
}

import {
  Pause,
  Activity,
  Zap,
  DollarSign,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "./Card";
import { BotActiveSwitch } from "./BotActiveSwitch";

export default function DashboardPanel({
  config,
  token,
  isManagedWallet,
  botToggleLoading,
  onToggleBotActive,
}: {
  config: ConfigData;
  token: string | null;
  isManagedWallet: boolean;
  botToggleLoading: boolean;
  onToggleBotActive: () => void;
}) {
  const { data: pools } = usePools(token);
  const { data: tokens } = useTokens();
  const positionsNavBase =
    "text-muted-foreground flex items-center gap-1 text-sm font-medium transition-all duration-200";
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 봇 가동 현황 */}
      <Card
        title="봇 가동 현황"
        rightElement={
          isManagedWallet ? (
            <Link
              href="/positions"
              className={`${positionsNavBase} hover:text-foreground cursor-pointer`}
            >
              내 포지션 <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <span
              className={`${positionsNavBase} text-muted-foreground/50 cursor-not-allowed`}
              title="서버 핫월렛이 준비된 뒤 이용할 수 있습니다."
              aria-disabled="true"
            >
              내 포지션 <ChevronRight className="h-4 w-4 shrink-0" />
            </span>
          )
        }
      >
        <div className="space-y-4">
          <BotActiveSwitch
            isActive={config.isActive}
            disabled={!isManagedWallet}
            loading={botToggleLoading}
            onToggle={onToggleBotActive}
          />

          <CardContent
            icon={Pause}
            label="Dry Run 모드"
            value={config.dryRun ? "ON (가상 거래)" : "OFF (실제 거래)"}
            iconBgClass="bg-primary-500/10"
            iconColorClass="text-primary-400"
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
                  const pool = pools?.find((p) => p.address === poolId);
                  return (
                    <span
                      key={poolId}
                      className="border-primary-500/30 bg-primary-500/10 text-primary-300 rounded-lg border px-2 py-1 font-mono text-xs"
                    >
                      {pool ? pool.name : poolId.slice(0, 8)}
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
                      className="border-tertiary-500/30 bg-tertiary-500/10 text-tertiary-300 rounded-lg border px-2 py-1 font-mono text-xs"
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
