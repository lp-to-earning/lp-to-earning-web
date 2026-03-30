export function solscanTxUrl(txHash: string): string {
  const h = txHash.trim();
  return `https://solscan.io/tx/${encodeURIComponent(h)}`;
}

export function solscanTokenUrl(mint: string): string {
  const m = mint.trim();
  return `https://solscan.io/token/${encodeURIComponent(m)}`;
}
