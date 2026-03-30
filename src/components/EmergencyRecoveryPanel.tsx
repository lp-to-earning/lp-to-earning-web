"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, LifeBuoy } from "lucide-react";

/**
 * 서버/API 장애 시 운영자·유저 대비 안내 (비상 복구 가이드 요약).
 * 개인키 추출은 서버 호스트에서만 수행 — UI에는 팬텀 임포트 절차만 노출.
 */
export function EmergencyRecoveryPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-border/50 bg-muted/20 rounded-2xl border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-foreground flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <LifeBuoy className="text-warning-300 h-4 w-4 shrink-0" />
          비상 복구 안내 (API·봇 장애 시)
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </button>
      {open ? (
        <div className="text-muted-foreground space-y-3 border-t border-border/40 px-4 py-4 text-sm leading-relaxed">
          <p>
            서버가 오래 응답하지 않아 출금 API를 쓸 수 없을 때는,{" "}
            <strong className="text-foreground">서버 관리자</strong>에게 DB·
            마스터 키 환경에서 비상 복구 스크립트 실행을 요청해 암호화된 핫월렛
            키를 복호화받을 수 있습니다.
          </p>
          <p className="text-foreground font-medium">
            관리자로부터 Base58 개인키를 안전하게 전달받은 뒤, 팬텀에서:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>팬텀 앱 → 설정 → 계정 추가/연결</li>
            <li>「프라이빗 키 가져오기」선택</li>
            <li>키를 붙여넣어 핫월렛 계정을 추가</li>
            <li>자산을 본인 메인 지갑으로 전송</li>
            <li>임포트한 계정은 사용 후 제거하고 키 문자열은 즉시 폐기</li>
          </ol>
          <p className="text-warning-300/90 text-xs">
            마스터 키·DB 백업은 운영 측에서 오프라인으로 보관하는 것이
            안전합니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
