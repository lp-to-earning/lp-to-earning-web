import { getAuthedAxios } from "@/lib/authed-axios";

const CONFIG_DEFAULTS: Config = {
  topN: 3,
  copyAmountUsd: 3.0,
  minAprPercent: 20.0,
  intervalMs: 1800000,
  dryRun: true,
  isActive: false,
  pools: [],
  autoRechargeTokens: [],
};

export interface ConfigLoadResult {
  config: Config;
  hasPrivateKey: boolean;
}

export async function getConfig(): Promise<ConfigLoadResult> {
  const { data } = await getAuthedAxios().get<ConfigResponse>("/config");

  const hasPrivateKey = !!data.hasPrivateKey;

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
    return { config: { ...CONFIG_DEFAULTS }, hasPrivateKey };
  }

  const config = { ...CONFIG_DEFAULTS, ...raw };
  config.pools = sanitizeArr(config.pools);
  config.autoRechargeTokens = sanitizeArr(config.autoRechargeTokens);
  config.isActive =
    typeof raw.isActive === "boolean" ? raw.isActive : CONFIG_DEFAULTS.isActive;
  config.dryRun =
    typeof raw.dryRun === "boolean" ? raw.dryRun : CONFIG_DEFAULTS.dryRun;

  return { config, hasPrivateKey };
}

/** 서버 `POST /api/config`가 받는 필드만 전송 (Prisma/스키마와 불일치 필드 제거) */
export async function updateConfig(config: Config): Promise<void> {
  await getAuthedAxios().post("/config", {
    isActive: config.isActive,
    topN: config.topN,
    copyAmountUsd: config.copyAmountUsd,
    minAprPercent: config.minAprPercent,
    intervalMs: config.intervalMs,
    dryRun: config.dryRun,
    pools: config.pools,
    autoRechargeTokens: config.autoRechargeTokens,
  });
}
