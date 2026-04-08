"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { configKeys } from "@/hooks/useConfig";
import {
  hotWalletBalanceKeys,
  useHotWalletBalances,
} from "@/hooks/useHotWalletBalances";
import { usePools, usePositions, useTokens } from "@/hooks/useByrealData";
import { postPartialWithdraw, postWithdrawAll } from "@/api/remote/withdraw";
import { solscanTxUrl, solscanTokenUrl } from "@/lib/solscan";
import { formatAddressShort } from "@/api/remote/balances";
import Link from "next/link";
import { Card } from "./Card";
import {
  Loader2,
  ArrowDownToLine,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Button from "./Button";

type AssetKind = "sol" | "spl";

function labelForSplWithdrawOption(
  o: { mint: string; label: string },
  catalog: Token[],
): string {
  const t = catalog.find((x) => x.mint === o.mint);
  const sym = t?.symbol?.trim() || o.label;
  const name = t?.name?.trim();
  const head = name && name !== sym ? `${sym} (${name})` : sym;
  return `${head} · ${formatAddressShort(o.mint, 4, 4)}`;
}

interface WithdrawSectionProps {
  authToken: string | null;
  isManagedWallet: boolean;
}

function formatMaxAmount(n: number, maxDecimals: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  const s = n.toFixed(Math.min(maxDecimals, 9));
  return s.replace(/\.?0+$/, "") || "0";
}

export function WithdrawSection({
  authToken,
  isManagedWallet,
}: WithdrawSectionProps) {
  const queryClient = useQueryClient();
  const catalogEnabled = isManagedWallet && !!authToken;

  const { data: balanceData } = useHotWalletBalances(catalogEnabled);

  const { isLoading: positionsLoading } = usePositions(
    authToken,
    1,
    80,
    { enabled: catalogEnabled },
  );
  const { isLoading: poolsLoading } = usePools(authToken, {
    enabled: catalogEnabled,
  });
  const { data: tokens = [], isLoading: tokensLoading } = useTokens({
    enabled: catalogEnabled,
  });

  const [kind, setKind] = useState<AssetKind>("sol");
  const [mint, setMint] = useState("");
  const [amount, setAmount] = useState("");
  const [amountSol, setAmountSol] = useState("");
  const [loading, setLoading] = useState<"partial" | "all" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const splMintOptions = useMemo((): { mint: string; label: string }[] => {
    const walletTokens = balanceData?.tokens ?? [];
    return walletTokens.map((t) => {
      const sym =
        tokens.find((x) => x.mint === t.mint)?.symbol ||
        `${t.mint.slice(0, 4)}…${t.mint.slice(-4)}`;
      return { mint: t.mint, label: sym };
    });
  }, [balanceData?.tokens, tokens]);

  const splCatalogLoading =
    kind === "spl" &&
    catalogEnabled &&
    (positionsLoading || poolsLoading || tokensLoading);

  const solBalance =
    balanceData?.success && typeof balanceData.sol === "number"
      ? balanceData.sol
      : null;

  const splBalanceForMint = useMemo(() => {
    if (!mint.trim() || !balanceData?.tokens?.length) return null;
    const row = balanceData.tokens.find((t) => t.mint === mint);
    return row && typeof row.amount === "number" ? row : null;
  }, [mint, balanceData?.tokens]);

  useEffect(() => {
    if (kind !== "spl") return;
    if (splMintOptions.length === 0) {
      setMint("");
      return;
    }
    if (!splMintOptions.some((o) => o.mint === mint)) {
      setMint(splMintOptions[0].mint);
    }
  }, [kind, splMintOptions, mint]);

  const disabled = !isManagedWallet || !authToken;

  function invalidateAfterWithdraw() {
    void queryClient.invalidateQueries({ queryKey: configKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["positions"] });
    void queryClient.invalidateQueries({ queryKey: hotWalletBalanceKeys.all });
  }

  function handleMaxSol() {
    if (solBalance === null || solBalance <= 0) return;
    setAmountSol(formatMaxAmount(solBalance, 9));
  }

  function handleMaxSpl() {
    if (!splBalanceForMint || splBalanceForMint.amount <= 0) return;
    setAmount(
      formatMaxAmount(splBalanceForMint.amount, splBalanceForMint.decimals),
    );
  }

  async function handlePartialWithdraw() {
    setError(null);
    setLastTxHash(null);
    if (disabled) return;

    if (kind === "sol") {
      const n = parseFloat(amountSol);
      if (!Number.isFinite(n) || n <= 0) {
        setError("출금할 SOL 수량을 올바르게 입력해 주세요.");
        return;
      }
      setLoading("partial");
      try {
        const res = await postPartialWithdraw({ amountSol: n });
        if (res.txHash) {
          setLastTxHash(res.txHash);
          invalidateAfterWithdraw();
        } else setError("응답에 트랜잭션 해시가 없습니다.");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "출금 요청에 실패했습니다.");
      } finally {
        setLoading(null);
      }
      return;
    }

    const m = mint.trim();
    const n = parseFloat(amount);
    if (!m) {
      setError("포지션에서 출금할 토큰을 선택해 주세요.");
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      setError("출금할 토큰 수량을 올바르게 입력해 주세요.");
      return;
    }
    setLoading("partial");
    try {
      const res = await postPartialWithdraw({ mint: m, amount: n });
      if (res.txHash) {
        setLastTxHash(res.txHash);
        invalidateAfterWithdraw();
      } else setError("응답에 트랜잭션 해시가 없습니다.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "출금 요청에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  async function handleWithdrawAll() {
    setError(null);
    setLastTxHash(null);
    if (disabled) return;
    const ok = window.confirm(
      "정말 모든 자산을 회수하고 봇 운영을 중단하시겠습니까? 핫월렛의 SOL과 USDC가 연결 지갑으로 귀환됩니다. 이 작업은 되돌릴 수 없습니다.",
    );
    if (!ok) return;
    setLoading("all");
    try {
      const res = await postWithdrawAll();
      if (res.txHash) {
        setLastTxHash(res.txHash);
        invalidateAfterWithdraw();
      } else setError("응답에 트랜잭션 해시가 없습니다.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "전액 회수에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title={
          <span className="flex items-center gap-2 text-lg font-bold normal-case">
            <ArrowDownToLine className="text-tertiary-400 h-5 w-5" />
            부분 출금
          </span>
        }
        className="p-6 sm:p-8"
      >
        {disabled ? (
          <p className="text-muted-foreground text-sm">
            핫월렛이 준비되고 로그인된 뒤 출금을 사용할 수 있습니다.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setKind("sol")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  kind === "sol"
                    ? "bg-tertiary-600 text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                }`}
              >
                SOL
              </button>
              <button
                type="button"
                onClick={() => setKind("spl")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  kind === "spl"
                    ? "bg-tertiary-600 text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                }`}
              >
                SPL 토큰 (포지션)
              </button>
            </div>

            {kind === "sol" ? (
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  출금 SOL 수량
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amountSol}
                    onChange={(e) => setAmountSol(e.target.value)}
                    placeholder="예: 0.1"
                    className="bg-muted/60 border-border/80 text-foreground min-w-0 flex-1 rounded-xl border px-4 py-3 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleMaxSol}
                    disabled={solBalance === null || solBalance <= 0}
                    className="border-tertiary-500/40 text-tertiary-300 hover:bg-tertiary-500/10 shrink-0 rounded-xl border px-4 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    MAX
                  </button>
                </div>
                {solBalance !== null ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    조회 잔고:{" "}
                    {solBalance.toLocaleString(undefined, {
                      maximumFractionDigits: 9,
                    })}{" "}
                    SOL
                  </p>
                ) : null}
              </div>
            ) : splCatalogLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                포지션·카탈로그를 불러오는 중…
              </div>
            ) : splMintOptions.length === 0 ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                열린 포지션에서 출금할 SPL 민트를 찾지 못했습니다. 포지션이
                있거나 풀/토큰 목록이 로드된 뒤 다시 시도해 주세요.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="withdraw-spl-mint"
                    className="text-foreground mb-2 block text-sm font-medium"
                  >
                    토큰 선택 (보유 포지션 기준)
                  </label>
                  <select
                    id="withdraw-spl-mint"
                    value={mint}
                    onChange={(e) => setMint(e.target.value)}
                    className="bg-muted/60 border-border/80 text-foreground w-full rounded-xl border px-4 py-3 text-sm"
                  >
                    {splMintOptions.map((o) => (
                      <option key={o.mint} value={o.mint}>
                        {labelForSplWithdrawOption(o, tokens)}
                      </option>
                    ))}
                  </select>
                  {mint ? (
                    <Link
                      href={solscanTokenUrl(mint)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 mt-1 inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                    >
                      Solscan에서 토큰 보기
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-medium">
                    출금 수량
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="예: 10.5"
                      className="bg-muted/60 border-border/80 text-foreground min-w-0 flex-1 rounded-xl border px-4 py-3 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleMaxSpl}
                      disabled={
                        !splBalanceForMint || splBalanceForMint.amount <= 0
                      }
                      className="border-tertiary-500/40 text-tertiary-300 hover:bg-tertiary-500/10 shrink-0 rounded-xl border px-4 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      MAX
                    </button>
                  </div>
                  {splBalanceForMint ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      조회 잔고:{" "}
                      {splBalanceForMint.amount.toLocaleString(undefined, {
                        maximumFractionDigits: Math.min(
                          splBalanceForMint.decimals,
                          8,
                        ),
                      })}
                    </p>
                  ) : mint ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      이 민트는 /balances 목록에 없습니다. 수량을 직접 입력해
                      주세요.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={() => void handlePartialWithdraw()}
              isLoading={loading === "partial"}
              disabled={
                loading !== null ||
                (kind === "spl" &&
                  (splCatalogLoading || splMintOptions.length === 0))
              }
            >
              부분 출금 실행
            </Button>
          </div>
        )}
      </Card>

      <Card
        title={
          <span className="text-error-400 flex items-center gap-2 text-lg font-bold normal-case">
            <AlertTriangle className="h-5 w-5" />
            위험 구역
          </span>
        }
        className="border-error-500/30 p-6 sm:p-8"
      >
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          핫월렛의 SOL·USDC를 모두 연결하신 지갑으로 돌려보냅니다. 봇 운영을
          완전히 멈추려는 경우에만 사용하세요.
        </p>
        <button
          type="button"
          onClick={() => void handleWithdrawAll()}
          disabled={disabled || loading !== null}
          className="bg-error-600 shadow-error-500/20 hover:bg-error-500 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "all" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : null}
          {loading === "all" ? "처리 중…" : "긴급 자금 회수 (전액)"}
        </button>
      </Card>

      {error ? (
        <div className="border-error-500/40 bg-error-500/10 text-error-300 rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {lastTxHash ? (
        <div className="border-tertiary-500/30 bg-tertiary-500/10 text-tertiary-200 rounded-xl border px-4 py-3 text-sm">
          <span className="font-medium">트랜잭션 제출됨. </span>
          <Link
            href={solscanTxUrl(lastTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-300 underline-offset-2 hover:underline"
          >
            Solscan에서 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}
