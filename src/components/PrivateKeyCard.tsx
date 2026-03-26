"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, KeyRound, Loader } from "lucide-react";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import { submitPrivateKey } from "@/api/remote/private-key";
import { markPrivateKeyRegistered } from "@/lib/private-key-registration";
import { configKeys } from "@/hooks/useConfig";

const MASKED_KEY_PLACEHOLDER = "•••••••••••••••••••••••••••••••••••••••••••";

interface PrivateKeyCardProps {
  disabled?: boolean;
  /**
   * 서버 GET /config 의 hasPrivateKey.
   * - true: 등록됨(마스킹)
   * - false: 미등록(입력 폼)
   * - undefined: 아직 서버 확인 전 — localStorage 등으로 추측하지 않음
   */
  hasPrivateKey?: boolean | undefined;
  onPrivateKeySaved?: () => void;
}

export function PrivateKeyCard({
  disabled,
  hasPrivateKey,
  onPrivateKeySaved,
}: PrivateKeyCardProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled || hasPrivateKey !== false) return;
    setLoading(true);
    setMessage(null);
    try {
      await submitPrivateKey(value.trim());
      markPrivateKeyRegistered();
      setValue("");
      setMessage({ ok: true, text: "개인키가 서버에 등록되었습니다." });
      await queryClient.invalidateQueries({ queryKey: configKeys.all });
      onPrivateKeySaved?.();
    } catch {
      setMessage({
        ok: false,
        text: "등록에 실패했습니다. 네트워크와 권한을 확인해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (hasPrivateKey === true) {
    return (
      <Card
        title={
          <>
            <KeyRound className="text-muted-foreground h-5 w-5" />
            <span className="text-lg font-bold normal-case">
              봇 지갑 개인키
            </span>
          </>
        }
        className="p-6"
      >
        <div className="border-emerald-500/30 bg-emerald-500/5 mb-4 flex gap-3 rounded-xl border p-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-foreground/90 text-sm leading-relaxed">
            서버에 개인키가 <strong className="text-foreground">암호화되어 등록</strong>
            된 상태입니다. 보안을 위해 값은 다시 보이지 않습니다.
          </p>
        </div>

        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            등록된 개인키
          </label>
          <input
            type="text"
            readOnly
            aria-readonly
            value={MASKED_KEY_PLACEHOLDER}
            className="bg-muted/40 border-border/80 text-muted-foreground w-full cursor-not-allowed rounded-xl border px-4 py-3 font-mono text-sm tracking-wider"
          />
          <p className="text-muted-foreground mt-2 text-xs">
            변경이 필요하면 백엔드에서 키를 초기화한 뒤 다시 등록해 주세요.
          </p>
        </div>
      </Card>
    );
  }

  if (hasPrivateKey === undefined) {
    return (
      <Card
        title={
          <>
            <KeyRound className="text-muted-foreground h-5 w-5" />
            <span className="text-lg font-bold normal-case">
              봇 지갑 개인키 등록
            </span>
          </>
        }
        className="p-6"
      >
        <div className="text-muted-foreground flex items-center gap-3 py-8 text-sm">
          <Loader className="h-5 w-5 shrink-0 animate-spin" />
          서버에서 개인키 등록 여부를 확인하는 중입니다…
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <>
          <KeyRound className="text-muted-foreground h-5 w-5" />
          <span className="text-lg font-bold normal-case">
            봇 지갑 개인키 등록
          </span>
        </>
      }
      className="p-6"
    >
      <div className="border-amber-500/25 bg-amber-500/5 mb-4 flex gap-3 rounded-xl border p-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-foreground/90 text-sm leading-relaxed">
          개인키는 서버에 암호화되어 안전하게 보관됩니다. 반드시 소액만
          들어있는 <strong className="text-foreground">핫월렛(Hot Wallet)</strong>
          사용을 권장합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            개인키 (Secret Key)
          </label>
          <input
            type="password"
            name="private-key"
            autoComplete="off"
            spellCheck={false}
            placeholder="입력 내용은 화면에 표시되지 않습니다"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled || loading}
            className="bg-muted/60 border-border/80 text-foreground placeholder:text-muted-foreground/50 w-full rounded-xl border px-4 py-3 font-mono text-sm transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        {message && (
          <p
            className={
              message.ok ? "text-sm text-emerald-400" : "text-sm text-red-400"
            }
          >
            {message.text}
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          isLoading={loading}
          disabled={disabled || !value.trim()}
        >
          서버에 안전하게 등록
        </Button>
      </form>
    </Card>
  );
}
