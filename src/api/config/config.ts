import { getAuthedAxios } from "@/lib/authed-axios";

const CONFIG_DEFAULTS: Config = {
  topN: 3,
  copyAmountUsd: 3.0,
  minAprPercent: 20.0,
  intervalMs: 1800000,
  dryRun: true,
  isActive: false,
  isAutoRebalance: false,
  pools: [],
  autoRechargeTokens: [],
};

export interface ConfigLoadResult {
  config: Config;
  /** 레거시 API 호환 */
  hasPrivateKey: boolean;
  isManaged: boolean;
  hotWalletAddress: string | null;
  /** 풀·토큰·포지션·봇 토글 등에 사용 */
  isManagedWallet: boolean;
}

function resolveManagedWalletReady(data: ConfigResponse): boolean {
  if (data.isManaged === true) return true;
  if (data.isManaged === false) return false;
  const addr =
    typeof data.hotWalletAddress === "string" &&
    data.hotWalletAddress.trim().length > 0;
  if (addr) return true;
  return !!data.hasPrivateKey;
}

export async function getConfig(): Promise<ConfigLoadResult> {
  const { data } = await getAuthedAxios().get<ConfigResponse>("config");

  const hasPrivateKey = !!data.hasPrivateKey;
  const isManaged = data.isManaged === true;
  const hotWalletAddress =
    typeof data.hotWalletAddress === "string" &&
    data.hotWalletAddress.trim().length > 0
      ? data.hotWalletAddress.trim()
      : null;
  const isManagedWallet = resolveManagedWalletReady(data);

  const sanitizeArr = (val: unknown) => {
    let arr = [];
    if (typeof val === "string") {
      try {
        arr = JSON.parse(val);
      } catch {
        arr = [];
      }
    } else if (Array.isArray(val)) {
      arr = val;
    }
    return arr.filter((x: string) => x && x !== "[" && x !== "]");
  };

  const raw = data.config;
  if (!raw) {
    return {
      config: { ...CONFIG_DEFAULTS },
      hasPrivateKey,
      isManaged,
      hotWalletAddress,
      isManagedWallet,
    };
  }

  const config = { ...CONFIG_DEFAULTS, ...raw };
  config.pools = sanitizeArr(config.pools);
  config.autoRechargeTokens = sanitizeArr(config.autoRechargeTokens);
  const rawBot = raw as Config & { isBotActive?: boolean };
  config.isActive =
    typeof raw.isActive === "boolean"
      ? raw.isActive
      : typeof rawBot.isBotActive === "boolean"
        ? rawBot.isBotActive
        : CONFIG_DEFAULTS.isActive;
  config.isAutoRebalance =
    typeof raw.isAutoRebalance === "boolean"
      ? raw.isAutoRebalance
      : CONFIG_DEFAULTS.isAutoRebalance;
  config.dryRun =
    typeof raw.dryRun === "boolean" ? raw.dryRun : CONFIG_DEFAULTS.dryRun;

  return {
    config,
    hasPrivateKey,
    isManaged,
    hotWalletAddress,
    isManagedWallet,
  };
}

/** `POST /api/config` — v2 예시 필드 + 기존 봇 파라미터 병행 전송 */
export async function updateConfig(config: Config): Promise<void> {
  await getAuthedAxios().post("config", {
    pools: config.pools,
    autoRechargeTokens: config.autoRechargeTokens,
    isBotActive: config.isActive,
    isAutoRebalance: config.isAutoRebalance,
    isActive: config.isActive,
    topN: config.topN,
    copyAmountUsd: config.copyAmountUsd,
    minAprPercent: config.minAprPercent,
    intervalMs: config.intervalMs,
    dryRun: config.dryRun,
  });
}
