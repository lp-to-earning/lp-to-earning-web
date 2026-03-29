"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

interface PrivateKeyRequiredModalProps {
  /** 설정 화면에서 설명 문구만 다르게 쓸 때 */
  description?: string;
}

/**
 * 봇 개인키 미등록 시 풀·토큰 설정 등에서 표시하는 전면 안내.
 */
export function PrivateKeyRequiredModal({
  description = "풀·토큰 목록 조회 및 자동 리충전 설정을 사용하려면, 먼저 설정 페이지에서 봇 지갑 개인키를 등록해 주세요.",
}: PrivateKeyRequiredModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-key-required-title"
    >
      <div
        className="bg-surface-lowest/80 absolute inset-0 backdrop-blur-md"
        aria-hidden
      />
      <div className="border-border/50 bg-surface-high ghost-border relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-2xl">
        <div className="bg-primary-500/15 text-primary-400 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
          <KeyRound className="h-7 w-7" aria-hidden />
        </div>
        <h2
          id="private-key-required-title"
          className="text-foreground text-center text-xl font-bold tracking-tight"
        >
          개인키 등록이 필요합니다
        </h2>
        <p className="text-muted-foreground mt-3 text-center text-sm leading-relaxed">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/config"
            className="bg-primary-600 hover:bg-primary-500 shadow-primary-500/20 rounded-2xl px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-colors"
          >
            설정에서 개인키 등록하기
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
