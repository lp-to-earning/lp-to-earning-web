"use client";

import { Power } from "lucide-react";

interface BotActiveSwitchProps {
  isActive: boolean;
  disabled: boolean;
  loading: boolean;
  onToggle: () => void;
}

export function BotActiveSwitch({
  isActive,
  disabled,
  loading,
  onToggle,
}: BotActiveSwitchProps) {
  return (
    <div className="border-border/50 bg-muted/30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <Power
          className={`h-5 w-5 shrink-0 ${isActive ? "text-tertiary-400" : "text-muted-foreground"}`}
        />
        <div>
          <p className="text-sm font-medium">봇 자동 실행</p>
          <p className="text-muted-foreground text-xs">
            {disabled
              ? "개인키를 먼저 등록한 뒤 켤 수 있습니다."
              : isActive
                ? "다음 1분 주기부터 봇 루프에 포함됩니다."
                : "비활성 시 루프에서 이 지갑을 건너뜁니다."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? "border-tertiary-500/40 bg-tertiary-500/15 text-tertiary-300 border"
              : "border-muted-500/40 bg-muted-600/15 text-muted-400 border"
          }`}
        >
          {isActive ? "Running" : "Stopped"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-busy={loading}
          disabled={disabled || loading}
          onClick={onToggle}
          className={`focus-visible:ring-primary-500 relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 ${
            isActive ? "bg-tertiary-600" : "bg-muted-600"
          }`}
        >
          <span
            className={`bg-muted-100 pointer-events-none inline-block h-7 w-7 translate-y-0.5 rounded-full shadow transition-transform ${
              isActive ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
