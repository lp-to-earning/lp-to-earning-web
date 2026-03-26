"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import { submitPrivateKey } from "@/api/remote/private-key";
import { markPrivateKeyRegistered } from "@/lib/private-key-registration";

interface PrivateKeyCardProps {
  disabled?: boolean;
}

export function PrivateKeyCard({ disabled }: PrivateKeyCardProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    setLoading(true);
    setMessage(null);
    try {
      await submitPrivateKey(value.trim());
      markPrivateKeyRegistered();
      setValue("");
      setMessage({ ok: true, text: "개인키가 서버에 등록되었습니다." });
    } catch {
      setMessage({
        ok: false,
        text: "등록에 실패했습니다. 네트워크와 권한을 확인해 주세요.",
      });
    } finally {
      setLoading(false);
    }
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
