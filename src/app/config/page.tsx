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
      <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl">
          <Header token={token} connected={connected} logout={logout} />
          <div className="bg-muted/40 border border-border p-12 rounded-3xl text-center flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-2">권한 없음</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              설정 페이지에 접근하려면 먼저 홈페이지에서 로그인해주세요.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/10"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        <Header token={token} connected={connected} logout={logout} />

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border mb-6 flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
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
