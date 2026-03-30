import { mintsFromTrackedPools } from "@/lib/pool-token-sync";

function shortMint(m: string): string {
  const t = m.trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

export interface WithdrawSplMintOption {
  mint: string;
  label: string;
}

/**
 * 부분 출금용 SPL 목록: 포지션에 실린 민트 우선, 없으면 포지션 풀 주소로
 * 풀·토큰 카탈로그에서 페어 민트를 추론합니다.
 */
export function buildWithdrawSplMintOptions(
  positions: readonly Position[],
  poolsCatalog: readonly Pool[],
  tokensCatalog: readonly Token[],
): WithdrawSplMintOption[] {
  const byMint = new Map<string, string>();

  for (const pos of positions) {
    const a = pos.tokenMintA?.trim();
    const b = pos.tokenMintB?.trim();
    if (a)
      byMint.set(a, pos.tokenSymbolA?.trim() || shortMint(a));
    if (b)
      byMint.set(b, pos.tokenSymbolB?.trim() || shortMint(b));
  }

  if (byMint.size > 0) {
    return [...byMint.entries()].map(([mint, label]) => ({ mint, label }));
  }

  const poolAddrs = [
    ...new Set(
      positions
        .map((p) => String(p.poolAddress ?? "").trim())
        .filter((x) => x.length > 0),
    ),
  ];

  const { mints } = mintsFromTrackedPools(
    poolAddrs,
    poolsCatalog,
    tokensCatalog,
    { excludeSymbols: new Set<string>() },
  );

  const tokenByMint = new Map(tokensCatalog.map((t) => [t.mint, t]));
  return mints.map((mint) => ({
    mint,
    label: tokenByMint.get(mint)?.symbol?.trim() || shortMint(mint),
  }));
}
