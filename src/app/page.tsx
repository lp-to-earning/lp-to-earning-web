"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import {
  useSetAuthToken,
  useStoredAuthToken,
} from "@/hooks/useStoredAuthToken";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import bs58 from "bs58";
import Header from "@/components/Header";
import Button from "@/components/Button";
import DashboardPanel from "@/components/DashboardPanel";
import { HotWalletCard } from "@/components/HotWalletCard";
import { HotWalletBalancesCard } from "@/components/HotWalletBalancesCard";
import { createPublicApi } from "@/lib/authed-axios";
import {
  getConfig,
  updateConfig,
  type ConfigLoadResult,
} from "@/api/config/config";

export default function Home() {
  const { publicKey, signMessage, connected } = useWallet();
  const token = useStoredAuthToken();
  const setAuthToken = useSetAuthToken();
  const [loading, setLoading] = useState(false);
  const [botToggleLoading, setBotToggleLoading] = useState(false);
  const [configLoad, setConfigLoad] = useState<ConfigLoadResult | null>(null);
  const [configReady, setConfigReady] = useState(false);

  const [config, setConfig] = useState<Config>({
    topN: 3,
    copyAmountUsd: 3.0,
    minAprPercent: 20.0,
    intervalMs: 1800000,
    dryRun: true,
    isActive: false,
    isAutoRebalance: false,
    pools: [],
    autoRechargeTokens: [],
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchConfig = useCallback(async () => {
    setConfigReady(false);
    try {
      const next = await getConfig();
      setConfig(next.config);
      setConfigLoad(next);
    } catch (error) {
      console.error("Failed to fetch config", error);
      setConfigLoad(null);
    } finally {
      setConfigReady(true);
    }
  }, []);

  const isManagedWallet =
    configReady && configLoad ? configLoad.isManagedWallet : false;

  const handleLogin = async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    setMessage(null);

    try {
      const walletAddress = publicKey.toString();
      const api = createPublicApi();

      const { data: nonceData } = await api.post<{ nonce: string }>(
        "auth/nonce",
        { walletAddress },
      );
      const nonce = nonceData.nonce;

      const messageBytes = new TextEncoder().encode(
        `Sign this message to authenticate dashboard: ${nonce}`,
      );
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const { data: loginData } = await api.post<{ token?: string }>(
        "auth/login",
        { walletAddress, signature },
      );

      if (loginData.token) {
        setAuthToken(loginData.token, walletAddress);
        await fetchConfig();
        setMessage({
          type: "success",
          text: "환영합니다! 지갑 인증에 성공했습니다.",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "인증에 실패했습니다. API 서버를 확인해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && connected) {
      void fetchConfig();
    }
  }, [token, connected, fetchConfig]);

  useEffect(() => {
    if (!token) {
      setConfigLoad(null);
      setConfigReady(false);
    }
  }, [token]);

  useEffect(() => {
    function onWalletMismatch() {
      setMessage({
        type: "error",
        text: "연결된 지갑 계정이 바뀌었습니다. 새 계정으로 다시 서명 로그인해 주세요.",
      });
    }
    window.addEventListener("lp-auth-wallet-mismatch", onWalletMismatch);
    return () =>
      window.removeEventListener("lp-auth-wallet-mismatch", onWalletMismatch);
  }, []);

  const logout = () => {
    setAuthToken(null);
    setMessage(null);
  };

  const toggleBotActive = async () => {
    if (!isManagedWallet) return;
    setBotToggleLoading(true);
    setMessage(null);
    const next = { ...config, isActive: !config.isActive };
    try {
      await updateConfig(next);
      setConfig(next);
      setMessage({
        type: "success",
        text: next.isActive
          ? "봇이 활성화되었습니다. 다음 주기부터 실행됩니다."
          : "봇이 비활성화되었습니다.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "봇 상태 변경에 실패했습니다.",
      });
    } finally {
      setBotToggleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        <Header token={token} connected={connected} logout={logout} />

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
                message.type === "success"
                  ? "border-tertiary-500/30 bg-tertiary-500/10 text-tertiary-300"
                  : "border-error-500/30 bg-error-500/10 text-error-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!connected ? (
          <div className="bg-muted/55 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center">
            <div className="bg-muted/80 text-muted-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-3xl">
              <Settings size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold">지갑 연결 필요</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              시스템의 설정을 변경하려면 상단의 [Select Wallet] 을 눌러 지갑을
              먼저 연결해주세요.
            </p>
          </div>
        ) : connected && !token ? (
          <div className="bg-muted/55 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center">
            <h2 className="mb-2 text-xl font-bold">보안 로그인 인증</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              주소 증명을 위해 메시지 고유 서명이 필요합니다. 아래 검증 버튼을
              클릭하세요.
            </p>
            <Button
              onClick={handleLogin}
              isLoading={loading}
              variant="secondary"
            >
              {loading ? "서명 요청 중..." : "서명 후 로그인 🔑"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HotWalletCard
                hotWalletAddress={configLoad?.hotWalletAddress ?? null}
                isManagedWallet={configLoad?.isManagedWallet ?? false}
                configReady={configReady}
                onAfterProvision={() => void fetchConfig()}
              />
            </motion.div>
            {configLoad?.hotWalletAddress && configReady ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HotWalletBalancesCard
                  enabled={!!token && !!configLoad?.isManagedWallet}
                  variant="compact"
                />
              </motion.div>
            ) : null}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardPanel
                config={config}
                token={token}
                isManagedWallet={isManagedWallet}
                botToggleLoading={botToggleLoading}
                onToggleBotActive={() => void toggleBotActive()}
              />
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
