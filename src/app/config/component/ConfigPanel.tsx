import { Settings, Save, ArrowLeft, X, Layers, Power } from "lucide-react";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";
import { usePools, useTokens } from "@/hooks/useByrealData";
import Link from "next/link";
import { Card } from "../../../components/Card";

interface ConfigPanelProps {
  config: Config;
  setConfig: (config: Config) => void;
  saveConfig: () => void;
  saving: boolean;
  authToken: string | null;
  hasPrivateKeyRegistered: boolean;
}

export default function ConfigPanel({
  config,
  setConfig,
  saveConfig,
  saving,
  authToken,
  hasPrivateKeyRegistered,
}: ConfigPanelProps) {
  const router = useRouter();
  const { data: pools } = usePools(authToken);
  const { data: tokens } = useTokens();

  return (
    <Card
      title={
        <>
          <Settings className="text-muted-foreground h-5 w-5" />
          <span className="text-lg font-bold normal-case">
            전략적 봇 상세 설정
          </span>
        </>
      }
      rightElement={
        <button
          onClick={() => router.push("/")}
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> 뒤로가기
        </button>
      }
      className="p-8"
    >
      <div className="space-y-6">
        <div className="border-border/50 bg-muted/20 rounded-2xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
                <Power
                  className={`h-5 w-5 ${config.isActive ? "text-tertiary-400" : "text-muted-foreground"}`}
                />
              </div>
              <div>
                <label className="text-foreground block text-sm font-medium">
                  봇 자동 실행 (isActive)
                </label>
                <p className="text-muted-foreground mt-1 max-w-md text-xs">
                  {hasPrivateKeyRegistered
                    ? "저장 시 서버에 반영됩니다. 대시보드에서 즉시 토글할 수도 있습니다."
                    : "개인키를 먼저 등록한 뒤 활성화할 수 있습니다."}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                config.isActive
                  ? "border-tertiary-500/40 bg-tertiary-500/15 text-tertiary-300 border"
                  : "border-muted-500/40 bg-muted-600/15 text-muted-400 border"
              }`}
            >
              {config.isActive ? "Running" : "Stopped"}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="config-is-active"
              checked={config.isActive}
              disabled={!hasPrivateKeyRegistered}
              onChange={(e) =>
                setConfig({ ...config, isActive: e.target.checked })
              }
              className="bg-muted border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded disabled:opacity-40"
            />
            <label
              htmlFor="config-is-active"
              className={`text-sm font-medium ${!hasPrivateKeyRegistered ? "text-muted-foreground" : "text-foreground"}`}
            >
              봇 켜기
            </label>
          </div>
        </div>

        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            상위 포지션 트래킹 수 (Top N)
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={config.topN}
            onChange={(e) =>
              setConfig({ ...config, topN: parseInt(e.target.value) })
            }
            className="bg-muted/60 border-border/80 text-foreground placeholder-muted-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border px-4 py-3 font-mono text-sm transition-all focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              진입 거래금액 (USD)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.copyAmountUsd}
              onChange={(e) =>
                setConfig({
                  ...config,
                  copyAmountUsd: parseFloat(e.target.value),
                })
              }
              className="bg-muted/60 border-border/80 text-foreground placeholder-muted-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border px-4 py-3 font-mono text-sm transition-all focus:ring-1 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              최소 APR 기준 (%)
            </label>
            <input
              type="number"
              step="1"
              value={config.minAprPercent}
              onChange={(e) =>
                setConfig({
                  ...config,
                  minAprPercent: parseFloat(e.target.value),
                })
              }
              className="bg-muted/60 border-border/80 text-foreground placeholder-muted-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border px-4 py-3 font-mono text-sm transition-all focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            스캔 주기 (간격 - 분)
          </label>
          <input
            type="number"
            step="1"
            value={config.intervalMs / 60000}
            onChange={(e) =>
              setConfig({
                ...config,
                intervalMs: parseInt(e.target.value) * 60000,
              })
            }
            className="bg-muted/60 border-border/80 text-foreground placeholder-muted-500 focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border px-4 py-3 font-mono text-sm transition-all focus:ring-1 focus:outline-none"
          />
          <span className="text-muted-foreground mt-1 block text-xs">
            {config.intervalMs / 60000} 분 마다 전체 봇 검증 진행
          </span>
        </div>

        {/* 🌊 검증 대상 유동성 풀 관리 */}
        <div className="border-border/50 border-t pt-4">
          <label className="text-foreground mb-2 block text-sm font-medium">
            트래킹 유동성 풀 (Pools) 설정
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {Array.isArray(config.pools) && config.pools.length > 0 ? (
              config.pools.map((poolId) => {
                const pool = pools?.find((p) => p.address === poolId);
                return (
                  <div
                    key={poolId}
                    className="border-primary-500/30 bg-primary-500/10 text-primary-400 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                  >
                    <span>{pool ? pool.name : poolId.slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          pools: config.pools.filter((p) => p !== poolId),
                        })
                      }
                      className="text-primary-400 hover:text-primary-300 cursor-pointer transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-muted-foreground text-xs">
                선택된 풀이 없습니다. 전체 풀을 대상으로 트래킹합니다.
              </span>
            )}
          </div>
          <Link href="/config/pools">
            <button
              type="button"
              className="border-primary-500/30 bg-primary-500/10 text-primary-400 shadow-primary-500/5 hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-300 mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-lg transition-all"
            >
              <Layers size={16} /> 설정 대상 풀 목록 조회 및 선택하기
            </button>
          </Link>
        </div>

        {/* 🪙 자동 리충전 토큰 관리 */}
        <div className="border-border/50 border-t pt-4">
          <label className="text-foreground mb-2 block text-sm font-medium">
            자동 리충전 대상 토큰 (Auto Recharge) 설정
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {Array.isArray(config.autoRechargeTokens) &&
            config.autoRechargeTokens.length > 0 ? (
              config.autoRechargeTokens.map((mint) => {
                const token = tokens?.find((t) => t.mint === mint);
                return (
                  <div
                    key={mint}
                    className="border-tertiary-500/30 bg-tertiary-500/10 text-tertiary-400 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                  >
                    <span>{token ? token.symbol : mint.slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          autoRechargeTokens: config.autoRechargeTokens.filter(
                            (t) => t !== mint,
                          ),
                        })
                      }
                      className="text-tertiary-400 hover:text-tertiary-300 cursor-pointer transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-muted-foreground text-xs">
                자동 리충전하도록 목록에 추가할 토큰이 없습니다.
              </span>
            )}
          </div>
          <Link href="/config/tokens">
            <button
              type="button"
              className="border-tertiary-500/30 bg-tertiary-500/10 text-tertiary-400 shadow-tertiary-500/5 hover:border-tertiary-500/50 hover:bg-tertiary-500/20 hover:text-tertiary-300 mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-lg transition-all"
            >
              <Layers size={16} /> 설정 대상 토큰 목록 조회 및 선택하기
            </button>
          </Link>
        </div>

        <div className="border-border/80 mt-4 flex flex-col gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="config-auto-rebalance"
              checked={config.isAutoRebalance}
              onChange={(e) =>
                setConfig({ ...config, isAutoRebalance: e.target.checked })
              }
              className="bg-muted border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
            />
            <label
              htmlFor="config-auto-rebalance"
              className="text-foreground text-sm font-medium"
            >
              자동 리밸런스 (isAutoRebalance)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.dryRun}
              onChange={(e) =>
                setConfig({ ...config, dryRun: e.target.checked })
              }
              className="bg-muted border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
            />
            <label className="text-foreground text-sm font-medium">
              Dry Run 봇 구동 (실제 지갑 트랜잭션 수수료만 청구, 가상 포지션 수립)
            </label>
          </div>
        </div>

        <Button
          onClick={saveConfig}
          isLoading={saving}
          variant="primary"
          className="mt-6"
          fullWidth
          icon={!saving && <Save size={18} />}
        >
          {saving ? "저장 중..." : "변경 사항 저장 및 가동"}
        </Button>
      </div>
    </Card>
  );
}
