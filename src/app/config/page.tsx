"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { configKeys, useConfig, useUpdateConfig } from "@/hooks/useConfig";
import {
  useSetAuthToken,
  useStoredAuthToken,
} from "@/hooks/useStoredAuthToken";
import Header from "@/components/Header";
import { consumeWalletMismatchHint } from "@/components/WalletSessionSync";
import ConfigPanel from "@/app/config/component/ConfigPanel";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function ConfigPage() {
  const { connected } = useWallet();
  const token = useStoredAuthToken();
  const setAuthToken = useSetAuthToken();
  const [localConfig, setLocalConfig] = useState<Config | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showWalletSwitchHint, setShowWalletSwitchHint] = useState(false);
  const [chipToast, setChipToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      if (consumeWalletMismatchHint()) setShowWalletSwitchHint(true);
    } else {
      setShowWalletSwitchHint(false);
    }
  }, [token]);

  const { data: configData } = useConfig(token, connected);
  const updateConfigMutation = useUpdateConfig();

  const serverConfigPart = configData?.config;

  const config: Config = {
    topN: 3,
    copyAmountUsd: 3.0,
    minAprPercent: 20.0,
    intervalMs: 1800000,
    dryRun: true,
    isActive: false,
    isAutoRebalance: false,
    pools: [],
    autoRechargeTokens: [],
    ...(serverConfigPart || {}),
    ...(localConfig || {}),
  };

  const setConfig = (newConfig: Config) => {
    setLocalConfig(newConfig);
  };

  const saveConfig = () => {
    if (!token) return;
    setMessage(null);

    updateConfigMutation.mutate(config, {
        onSuccess: () => {
          setLocalConfig(null);
          setMessage({
            type: "success",
            text: "설정이 안전하게 저장되었습니다!",
          });
        },
        onError: () => {
          setMessage({ type: "error", text: "설정 저장에 실패했습니다." });
        },
    });
  };

  const persistConfigImmediately = useCallback(
    (next: Config, removed: "pool" | "token") => {
      if (!token) return;
      updateConfigMutation.mutate(next, {
        onSuccess: () => {
          setLocalConfig(null);
          setChipToast({
            show: true,
            type: "success",
            message:
              removed === "pool"
                ? "풀을 목록에서 제거해 저장했습니다."
                : "토큰을 목록에서 제거해 저장했습니다.",
          });
        },
        onError: () => {
          setLocalConfig(null);
          void queryClient.invalidateQueries({ queryKey: configKeys.all });
          setChipToast({
            show: true,
            type: "error",
            message: "제거 저장에 실패했습니다. 다시 시도해 주세요.",
          });
        },
      });
    },
    [token, updateConfigMutation, queryClient],
  );

  const logout = () => {
    setAuthToken(null);
  };

  if (!connected || !token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl">
          <Header token={token} connected={connected} logout={logout} />
          <div className="bg-muted/55 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center">
            <h2 className="mb-2 text-xl font-bold">권한 없음</h2>
            {showWalletSwitchHint && connected ? (
              <p className="text-warning-300/90 mb-4 max-w-sm text-sm">
                지갑 계정이 바뀌어 로그인 세션이 초기화되었습니다. 홈에서 새
                계정으로 서명 로그인해 주세요.
              </p>
            ) : null}
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              설정 페이지에 접근하려면 먼저 홈페이지에서 로그인해주세요.
            </p>
            <Link
              href="/"
              className="bg-primary-600 hover:bg-primary-700 shadow-primary-500/10 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

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

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ConfigPanel
              config={config}
              setConfig={setConfig}
              saveConfig={saveConfig}
              saving={updateConfigMutation.isPending}
              authToken={token}
              persistConfigImmediately={persistConfigImmediately}
            />
          </motion.div>
        </div>

        <Toast
          show={updateConfigMutation.isPending}
          message="설정을 저장하는 중..."
          type="loading"
          onClose={() => {}}
        />
        <Toast
          show={chipToast.show}
          message={chipToast.message}
          type={chipToast.type}
          duration={2500}
          onClose={() =>
            setChipToast((s) => ({ ...s, show: false }))
          }
        />
      </div>
    </main>
  );
}
