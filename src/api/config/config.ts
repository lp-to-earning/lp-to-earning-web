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

export const getConfig = async (): Promise<Config> => {
  const { data } = await getAuthedAxios().get<ConfigResponse>("/config");

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
    return { ...CONFIG_DEFAULTS };
  }

  const config = { ...CONFIG_DEFAULTS, ...raw };
  config.pools = sanitizeArr(config.pools);
  config.autoRechargeTokens = sanitizeArr(config.autoRechargeTokens);
  config.isActive =
    typeof raw.isActive === "boolean" ? raw.isActive : CONFIG_DEFAULTS.isActive;

  return config;
};

export const updateConfig = async (config: Config): Promise<void> => {
  await getAuthedAxios().post("/config", config);
};
