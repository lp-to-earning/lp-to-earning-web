"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";
import bs58 from "bs58";
import Header from "@/components/Header";
import Button from "@/components/Button";
import DashboardPanel from "@/components/DashboardPanel";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

export default function Home() {
  const { publicKey, signMessage, connected } = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Configuration State
  const [config, setConfig] = useState<any>({
    topN: 3,
    copyAmountUsd: 3.0,
    minAprPercent: 20.0,
    intervalMs: 1800000,
    dryRun: true,
  });

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

  // 1. Auth Flow: Sign Message Login
  const handleLogin = async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    setMessage(null);

    try {
      const walletAddress = publicKey.toString();

      // Step A: Get Nonce
      const { data: nonceData } = await axios.post(`${API_HOST}/auth/nonce`, {
        walletAddress,
      });
      const nonce = nonceData.nonce;

      // Step B: Sign the Nonce
      const messageBytes = new TextEncoder().encode(
        `Sign this message to authenticate dashboard: ${nonce}`,
      );
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Step C: Verify & Login
      const { data: loginData } = await axios.post(`${API_HOST}/auth/login`, {
        walletAddress,
        signature,
      });

      if (loginData.token) {
        setToken(loginData.token);
        localStorage.setItem("auth_token", loginData.token);
        setMessage({
          type: "success",
          text: "환영합니다! 지갑 인증에 성공했습니다.",
        });
        fetchConfig(loginData.token);
      }
    } catch (error: any) {
      console.error(error);
      setMessage({
        type: "error",
        text: "인증에 실패했습니다. API 서버를 확인해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Config
  const fetchConfig = async (authToken: string) => {
    try {
      const { data } = await axios.get(`${API_HOST}/config`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch config", error);
    }
  };

  // Fetch config on initial mount or login change
  useEffect(() => {
    if (token && connected) {
      fetchConfig(token);
    }
  }, [token, connected]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("auth_token");
    setMessage(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        {/* Header Header */}
        <Header token={token} connected={connected} logout={logout} />

        {/* Status Prompt Banner */}
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

        {/* Configuration Layout */}
        {!connected ? (
          <div className="bg-muted/40 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center backdrop-blur-sm">
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
          <div className="bg-muted/40 border-border flex flex-col items-center justify-center rounded-3xl border p-12 text-center backdrop-blur-sm">
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
              <DashboardPanel config={config} />
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
