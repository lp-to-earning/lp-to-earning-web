import { Settings, Save, ArrowLeft, X, Layers } from "lucide-react";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";
import { usePools, useTokens } from "@/hooks/useByrealData";
import Link from "next/link";

interface ConfigPanelProps {
  config: Config;
  setConfig: (config: Config) => void;
  saveConfig: () => void;
  saving: boolean;
}

export default function ConfigPanel({
  config,
  setConfig,
  saveConfig,
  saving,
}: ConfigPanelProps) {
  const router = useRouter();
  const { data: pools } = usePools();
  const { data: tokens } = useTokens();

  return (
    <div className="glass ghost-border p-8 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Settings className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-bold">전략적 봇 상세 설정</h2>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> 뒤로가기
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            상위 포지션 트래킹 수 (Top N)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.topN}
            onChange={(e) =>
              setConfig({ ...config, topN: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1개</span>
            <span>{config.topN}개</span>
            <span>10개</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
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
              className="bg-muted/60 border border-border/80 rounded-xl px-4 py-3 w-full text-foreground placeholder-muted-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
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
              className="bg-muted/60 border border-border/80 rounded-xl px-4 py-3 w-full text-foreground placeholder-muted-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            스캔 주기 (간격 - ms)
          </label>
          <input
            type="number"
            step="60000"
            value={config.intervalMs}
            onChange={(e) =>
              setConfig({
                ...config,
                intervalMs: parseInt(e.target.value),
              })
            }
            className="bg-muted/60 border border-border/80 rounded-xl px-4 py-3 w-full text-foreground placeholder-muted-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono"
          />
          <span className="text-muted-foreground text-xs mt-1 block">
            {(config.intervalMs / 60000).toFixed(1)} 분 마다 전체 봇 검증 진행
          </span>
        </div>

        {/* 🌊 검증 대상 유동성 풀 관리 */}
        <div className="pt-4 border-t border-border/50">
          <label className="block text-sm font-medium text-foreground mb-2">
            트래킹 유동성 풀 (Pools) 설정
          </label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {Array.isArray(config.pools) && config.pools.length > 0 ? (
              config.pools.map((poolId) => {
                const pool = pools?.find((p) => p.id === poolId);
                return (
                  <div
                    key={poolId}
                    className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    <span>{pool ? pool.pair : poolId.slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          pools: config.pools.filter((p) => p !== poolId),
                        })
                      }
                      className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-muted-foreground">
                선택된 풀이 없습니다. 전체 풀을 대상으로 트래킹합니다.
              </span>
            )}
          </div>
          <Link href="/config/pools">
            <button
              type="button"
              className="mt-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl px-4 py-3 w-full text-indigo-400 hover:text-indigo-300 transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/5"
            >
              <Layers size={16} /> 설정 대상 풀 목록 조회 및 선택하기
            </button>
          </Link>
        </div>

        {/* 🪙 자동 리충전 토큰 관리 */}
        <div className="pt-4 border-t border-border/50">
          <label className="block text-sm font-medium text-foreground mb-2">
            자동 리충전 대상 토큰 (Auto Recharge) 설정
          </label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {Array.isArray(config.autoRechargeTokens) &&
            config.autoRechargeTokens.length > 0 ? (
              config.autoRechargeTokens.map((mint) => {
                const token = tokens?.find((t) => t.mint === mint);
                return (
                  <div
                    key={mint}
                    className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5"
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
                      className="text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-muted-foreground">
                자동 리충전하도록 목록에 추가할 토큰이 없습니다.
              </span>
            )}
          </div>
          <Link href="/config/tokens">
            <button
              type="button"
              className="mt-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl px-4 py-3 w-full text-emerald-400 hover:text-emerald-300 transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/5"
            >
              <Layers size={16} /> 설정 대상 토큰 목록 조회 및 선택하기
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/80 mt-4">
          <input
            type="checkbox"
            checked={config.dryRun}
            onChange={(e) => setConfig({ ...config, dryRun: e.target.checked })}
            className="rounded h-4 w-4 bg-muted border-border text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm font-medium text-foreground">
            Dry Run 봇 구동 (실제 지갑 트랜잭션 수수료만 청구, 가상 포지션 수립)
          </label>
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
    </div>
  );
}
