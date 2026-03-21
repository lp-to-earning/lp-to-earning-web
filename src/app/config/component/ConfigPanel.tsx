import { Settings, Save } from "lucide-react";
import Button from "../../../components/Button";

interface ConfigData {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
}

interface ConfigPanelProps {
  config: ConfigData;
  setConfig: (config: ConfigData) => void;
  saveConfig: () => void;
  saving: boolean;
}

export default function ConfigPanel({
  config,
  setConfig,
  saveConfig,
  saving,
}: ConfigPanelProps) {
  return (
    <div className="glass ghost-border p-8 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Settings className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-bold">전략적 봇 상세 설정</h2>
        </div>
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
