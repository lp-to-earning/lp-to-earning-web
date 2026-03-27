"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import {
  AUTH_TOKEN_BOUND_WALLET_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  notifyAuthTokenChanged,
} from "@/lib/authed-axios";
import { clearPrivateKeyRegistered } from "@/lib/private-key-registration";

const WALLET_MISMATCH_FLAG = "lp-auth-wallet-mismatch";

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_BOUND_WALLET_KEY);
  clearPrivateKeyRegistered();
  notifyAuthTokenChanged();
}

/**
 * 팬텀 등에서 지갑 계정만 바꾸면 `connected`는 유지되고 `publicKey`만 바뀝니다.
 * 이전 계정으로 발급된 JWT는 무효화하고, 홈에서 nonce 기반 로그인을 다시 하도록 합니다.
 */
export function WalletSessionSync() {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!connected) return;

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token || !address) return;

    const bound = localStorage.getItem(AUTH_TOKEN_BOUND_WALLET_KEY);

    if (!bound) {
      localStorage.setItem(AUTH_TOKEN_BOUND_WALLET_KEY, address);
      return;
    }

    if (bound !== address) {
      sessionStorage.setItem(WALLET_MISMATCH_FLAG, "1");
      clearAuthSession();
      window.dispatchEvent(
        new CustomEvent("lp-auth-wallet-mismatch", {
          detail: { reason: "wallet-changed" as const },
        }),
      );
    }
  }, [connected, address]);

  return null;
}

export function consumeWalletMismatchHint(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(WALLET_MISMATCH_FLAG) !== "1") return false;
  sessionStorage.removeItem(WALLET_MISMATCH_FLAG);
  return true;
}
