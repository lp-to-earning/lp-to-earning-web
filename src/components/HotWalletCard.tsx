"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Wallet } from "lucide-react";
import { Card } from "./Card";
import {
  postCreateHotWallet,
  parseHotWalletCreateError,
} from "@/api/remote/hot-wallet";
import { configKeys } from "@/hooks/useConfig";
import Button from "./Button";

interface HotWalletCardProps {
  hotWalletAddress: string | null;
  /** 서버 핫월렛(또는 레거시 개인키) 준비 여부 — 주소 없어도 true일 수 있음 */
  isManagedWallet: boolean;
  configReady: boolean;
  /** 생성 성공 후 config 등 갱신 */
  onAfterProvision?: () => void | Promise<void>;
}

export function HotWalletCard({
  hotWalletAddress,
  isManagedWallet,
  configReady,
  onAfterProvision,
}: HotWalletCardProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  /** 응답 직후 즉시 표시, 이어서 GET config와 동기화 */
  const [optimisticAddress, setOptimisticAddress] = useState<string | null>(
    null,
  );

  const displayAddress = hotWalletAddress ?? optimisticAddress;

  useEffect(() => {
    if (hotWalletAddress) setOptimisticAddress(null);
  }, [hotWalletAddress]);

  async function copyAddress() {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleCreateWallet() {
    setCreateError(null);
    setCreating(true);
    try {
      const data = await postCreateHotWallet();
      if (data.success && data.address?.trim()) {
        setOptimisticAddress(data.address.trim());
        void queryClient.invalidateQueries({ queryKey: configKeys.all });
        await onAfterProvision?.();
      } else {
        setCreateError(
          typeof data.error === "string" && data.error
            ? data.error
            : "핫월렛 발급에 실패했습니다.",
        );
      }
    } catch (err) {
      setCreateError(parseHotWalletCreateError(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card
      title={
        <span className="flex items-center gap-2 text-lg font-bold normal-case">
          <Wallet className="text-primary-400 h-5 w-5 shrink-0" />
          봇 전용 핫월렛
        </span>
      }
      className="p-6 sm:p-8"
    >
      {!configReady ? (
        <p className="text-muted-foreground text-sm">지갑 정보를 불러오는 중…</p>
      ) : displayAddress ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="border-border/50 bg-background/40 flex shrink-0 items-center justify-center rounded-2xl border p-3">
            <QRCodeSVG
              value={displayAddress}
              size={160}
              level="M"
              className="rounded-lg"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              이 주소는 회원님 전용 봇 핫월렛입니다. 여기에 SOL(가스비)과
              USDC(투자금)를 입금하면 봇이 자동으로 운용을 시작합니다.
            </p>
            <p className="text-muted-foreground/90 text-xs leading-relaxed">
              이 지갑의 비밀키는 서버에서 마스터 키로 암호화되어 보관됩니다.
            </p>
            <div className="bg-muted/40 border-border/50 flex items-center gap-2 rounded-xl border px-3 py-2.5 font-mono text-xs break-all sm:text-sm">
              <span className="min-w-0 flex-1">{displayAddress}</span>
              <button
                type="button"
                onClick={() => void copyAddress()}
                className="text-primary-400 hover:text-primary-300 shrink-0 rounded-lg p-2 transition-colors"
                aria-label="주소 복사"
                title="주소 복사"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            아직 봇 전용 입금 주소가 없습니다. 아래에서 핫월렛을 생성하면 이
            카드에 QR과 주소가 표시됩니다.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            봇 전용 지갑을 생성합니다. 생성 후 이 주소로 가스비(SOL)를
            보내 주세요.
          </p>
          <p className="text-muted-foreground/90 text-xs leading-relaxed">
            이 지갑의 개인키는 서버 마스터 키로 암호화되어 안전하게
            보호됩니다.
          </p>
          {isManagedWallet && !hotWalletAddress ? (
            <p className="text-warning-300/90 text-xs">
              서버에는 이미 관리 모드로 표시되어 있으나 주소가 비어 있습니다.
              생성을 시도하거나 잠시 후 새로고침해 보세요.
            </p>
          ) : null}
          {createError ? (
            <div className="border-error-500/40 bg-error-500/10 text-error-300 rounded-xl border px-4 py-3 text-sm">
              {createError}
            </div>
          ) : null}
          <Button
            variant="primary"
            onClick={() => void handleCreateWallet()}
            isLoading={creating}
            disabled={creating}
            icon={
              !creating ? <Wallet className="h-4 w-4" aria-hidden /> : undefined
            }
          >
            {creating ? "생성 중…" : "봇 전용 핫월렛 생성하기"}
          </Button>
        </div>
      )}
    </Card>
  );
}
