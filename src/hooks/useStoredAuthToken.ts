import { useCallback, useSyncExternalStore } from "react";
import {
  AUTH_TOKEN_BOUND_WALLET_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  notifyAuthTokenChanged,
} from "@/lib/authed-axios";
import { clearPrivateKeyRegistered } from "@/lib/private-key-registration";

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === AUTH_TOKEN_STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("lp-auth-token-changed", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("lp-auth-token-changed", onChange);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function getServerSnapshot(): null {
  return null;
}

export function useStoredAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSetAuthToken() {
  return useCallback((next: string | null, boundWalletAddress?: string | null) => {
    if (next) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, next);
      if (boundWalletAddress)
        localStorage.setItem(AUTH_TOKEN_BOUND_WALLET_KEY, boundWalletAddress);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_BOUND_WALLET_KEY);
      clearPrivateKeyRegistered();
    }
    notifyAuthTokenChanged();
  }, []);
}
