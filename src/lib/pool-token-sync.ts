/** 풀 페어 심볼 정규화 (카탈로그 매칭용) */
export function normalizePoolSymbol(raw: string): string {
  return raw.trim().toUpperCase();
}

const DEFAULT_EXCLUDED = new Set<string>(["USDC"]);

/**
 * `config.pools` 주소에 해당하는 풀에서 토큰 심볼을 모은 뒤,
 * 토큰 카탈로그로 민트를 찾습니다. 동일 심볼이 여러 개면 카탈로그 순서상 첫 항목을 씁니다.
 */
export function mintsFromTrackedPools(
  poolAddresses: readonly string[],
  poolsCatalog: readonly Pool[],
  tokensCatalog: readonly Token[],
  options?: { excludeSymbols?: Set<string> },
): { mints: string[]; skippedSymbols: string[] } {
  const exclude = options?.excludeSymbols ?? DEFAULT_EXCLUDED;
  const poolMap = new Map(poolsCatalog.map((p) => [p.address, p]));
  const wanted = new Set<string>();

  for (const addr of poolAddresses) {
    const pool = poolMap.get(addr);
    if (!pool) continue;
    for (const raw of [pool.symbolA, pool.symbolB]) {
      const sym = normalizePoolSymbol(raw);
      if (!sym || exclude.has(sym)) continue;
      wanted.add(sym);
    }
  }

  const mintBySymbol = new Map<string, string>();
  for (const t of tokensCatalog) {
    const key = normalizePoolSymbol(t.symbol);
    if (key && t.mint && !mintBySymbol.has(key)) mintBySymbol.set(key, t.mint);
  }

  const mints: string[] = [];
  const skippedSymbols: string[] = [];
  for (const sym of wanted) {
    const mint = mintBySymbol.get(sym);
    if (mint) mints.push(mint);
    else skippedSymbols.push(sym);
  }

  return { mints, skippedSymbols };
}
