"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useConfig, useUpdateConfig } from "@/hooks/useConfig";
import { Config } from "@/api/config/config";
import Header from "@/components/Header";
import ConfigPanel from "@/app/config/component/ConfigPanel";
import Link from "next/link";

export default function ConfigPage() {
  const { connected } = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<Config | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) setToken(savedToken);
    }
  }, []);

  const { data: serverConfig } = useConfig(token, connected);
  const updateConfigMutation = useUpdateConfig();

  const config: Config = {
    topN: 3,
    copyAmountUsd: 3.0,
    minAprPercent: 20.0,
    intervalMs: 1800000,
    dryRun: true,
    pools: [],
    autoRechargeTokens: [],
    ...(serverConfig || {}),
    ...(localConfig || {}),
  };

  const setConfig = (newConfig: Config) => {
    setLocalConfig(newConfig);
  };

  const saveConfig = () => {
    if (!token) return;
    setMessage(null);

    updateConfigMutation.mutate(
      { token, config },
      {
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
      },
    );
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  if (!connected || !token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl">
          <Header token={token} connected={connected} logout={logout} />
          <div className="bg-muted/40 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center backdrop-blur-sm">
            <h2 className="mb-2 text-xl font-bold">권한 없음</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              설정 페이지에 접근하려면 먼저 홈페이지에서 로그인해주세요.
            </p>
            <Link
              href="/"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/10 transition-all hover:bg-indigo-700"
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
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
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
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
