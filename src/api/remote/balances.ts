import { getAuthedAxios } from "@/lib/authed-axios";

export interface HotWalletTokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

export interface HotWalletBalancesResponse {
  success: boolean;
  address?: string;
  sol?: number;
  tokens?: HotWalletTokenBalance[];
  error?: string;
}

function unwrapBalances(data: unknown): HotWalletBalancesResponse {
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid response" };
  }
  const d = data as Record<string, unknown>;
  const inner =
    d.data && typeof d.data === "object" && !Array.isArray(d.data)
      ? (d.data as Record<string, unknown>)
      : d;

  const rawSol = inner.sol;
  const solN =
    typeof rawSol === "number"
      ? rawSol
      : rawSol !== undefined && rawSol !== null
        ? Number(rawSol)
        : NaN;
  const sol = Number.isFinite(solN) ? solN : 0;

  const tokens: HotWalletTokenBalance[] = Array.isArray(inner.tokens)
    ? (inner.tokens as unknown[]).map((row) => {
        const t = row as Record<string, unknown>;
        const amt = Number(t.amount ?? 0);
        return {
          mint: String(t.mint ?? ""),
          amount: Number.isFinite(amt) ? amt : 0,
          decimals: Number(t.decimals ?? 0) || 0,
        };
      })
    : [];

  return {
    success: inner.success === true,
    address: typeof inner.address === "string" ? inner.address : undefined,
    sol,
    tokens: tokens.filter((t) => t.mint.length > 0),
    error: typeof inner.error === "string" ? inner.error : undefined,
  };
}

/** GET /api/balances — 핫월렛 SOL·SPL 잔고 */
export async function fetchHotWalletBalances(): Promise<HotWalletBalancesResponse> {
  const { data } = await getAuthedAxios().get<unknown>("balances");
  return unwrapBalances(data);
}

export function formatAddressShort(addr: string, head = 4, tail = 4): string {
  const t = addr.trim();
  if (t.length <= head + tail + 1) return t;
  return `${t.slice(0, head)}…${t.slice(-tail)}`;
}
