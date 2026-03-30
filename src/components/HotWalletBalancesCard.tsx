"use client";

import Link from "next/link";
import { RefreshCw, Wallet, AlertTriangle, ExternalLink } from "lucide-react";
import { Card } from "./Card";
import { useHotWalletBalances } from "@/hooks/useHotWalletBalances";
import { useTokens } from "@/hooks/useByrealData";
import { formatAddressShort } from "@/api/remote/balances";
import { solscanTokenUrl } from "@/lib/solscan";

const GAS_WARNING_SOL = 0.05;

interface HotWalletBalancesCardProps {
  enabled: boolean;
  /** `compact`는 홈 등 좁은 영역용 */
  variant?: "default" | "compact";
}

export function HotWalletBalancesCard({
  enabled,
  variant = "default",
}: HotWalletBalancesCardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useHotWalletBalances(enabled);
  const { data: tokenCatalog = [] } = useTokens({ enabled });

  const sol = typeof data?.sol === "number" ? data.sol : 0;

  function tokenLabel(mint: string): string {
    const t = tokenCatalog.find((x) => x.mint === mint);
    if (!t) return "알 수 없는 토큰";
    const sym = t.symbol?.trim();
    const name = t.name?.trim();
    if (sym && name && name !== sym) return `${sym} · ${name}`;
    if (sym) return sym;
    if (name) return name;
    return "알 수 없는 토큰";
  }
  const lowGas = enabled && data?.success && sol < GAS_WARNING_SOL;

  return (
    <Card
      title={
        <span className="flex items-center gap-2 text-lg font-bold normal-case">
          <Wallet className="text-tertiary-400 h-5 w-5 shrink-0" />
          봇 핫월렛 잔고
        </span>
      }
      rightElement={
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={!enabled || isFetching}
          className="text-muted-foreground hover:text-foreground rounded-xl p-2 transition-colors disabled:opacity-50"
          title="잔고 새로고침"
          aria-label="잔고 새로고침"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            aria-hidden
          />
        </button>
      }
      className={variant === "compact" ? "p-5" : "p-6 sm:p-8"}
    >
      {!enabled ? (
        <p className="text-muted-foreground text-sm">
          핫월렛이 준비된 뒤 잔고를 조회할 수 있습니다.
        </p>
      ) : isLoading ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          잔고를 불러오는 중…
        </p>
      ) : isError ? (
        <p className="text-error-300 text-sm">
          {error instanceof Error ? error.message : "잔고 조회에 실패했습니다."}
        </p>
      ) : !data?.success ? (
        <p className="text-muted-foreground text-sm">
          {data?.error ?? "잔고 정보를 가져오지 못했습니다."}
        </p>
      ) : (
        <div className="space-y-4">
          {data.address ? (
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              <span className="text-muted-foreground/80">주소 </span>
              {formatAddressShort(data.address)}
            </p>
          ) : null}

          {lowGas ? (
            <div className="border-error-500/40 bg-error-500/10 text-error-200 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                가스비 위험: SOL이 {GAS_WARNING_SOL} 미만입니다. 봇 거래 전에
                SOL을 보충해 주세요.
              </span>
            </div>
          ) : null}

          <div>
            <span className="text-muted-foreground text-xs font-medium uppercase">
              SOL
            </span>
            <p className="text-foreground mt-0.5 text-xl font-bold tabular-nums">
              {sol.toLocaleString(undefined, {
                maximumFractionDigits: 9,
              })}
            </p>
          </div>

          {data.tokens && data.tokens.length > 0 ? (
            <div className="space-y-2">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                SPL 토큰
              </span>
              <ul
                className={`divide-border/40 max-h-56 divide-y overflow-y-auto rounded-xl border border-border/40 ${variant === "compact" ? "text-xs" : "text-sm"}`}
              >
                {data.tokens.map((t) => (
                  <li
                    key={t.mint}
                    className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-foreground font-semibold">
                        {tokenLabel(t.mint)}
                      </p>
                      <Link
                        href={solscanTokenUrl(t.mint)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${tokenLabel(t.mint)} 민트 Solscan에서 열기`}
                        className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 font-mono text-xs underline-offset-2 hover:underline"
                      >
                        {formatAddressShort(t.mint, 6, 6)}
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                      </Link>
                    </div>
                    <span className="text-foreground shrink-0 self-end font-mono tabular-nums sm:self-center">
                      {t.amount.toLocaleString(undefined, {
                        maximumFractionDigits: Math.min(t.decimals, 8),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              SPL 토큰 잔고가 없거나 아직 동기화되지 않았습니다.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
