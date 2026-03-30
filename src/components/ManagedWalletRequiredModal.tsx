"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";

interface ManagedWalletRequiredModalProps {
  title?: string;
  description?: string;
}

/**
 * 서버 핫월렛(`isManaged`) 미준비 시 풀·토큰·포지션 등에서 표시.
 */
export function ManagedWalletRequiredModal({
  title = "봇 핫월렛 준비가 필요합니다",
  description = "풀·토큰·포지션 기능은 서버에서 전용 핫월렛이 연결된 뒤 사용할 수 있습니다. 잠시 후 다시 시도하거나 설정을 확인해 주세요.",
}: ManagedWalletRequiredModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="managed-wallet-required-title"
    >
      <div
        className="bg-surface-lowest/80 absolute inset-0 backdrop-blur-md"
        aria-hidden
      />
      <div className="border-border/50 bg-surface-high ghost-border relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-2xl">
        <div className="bg-primary-500/15 text-primary-400 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Wallet className="h-7 w-7" aria-hidden />
        </div>
        <h2
          id="managed-wallet-required-title"
          className="text-foreground text-center text-xl font-bold tracking-tight"
        >
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 text-center text-sm leading-relaxed">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/config"
            className="bg-primary-600 hover:bg-primary-500 shadow-primary-500/20 rounded-2xl px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-colors"
          >
            설정으로 이동
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted/30 rounded-2xl border px-6 py-3.5 text-center text-sm font-medium transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
