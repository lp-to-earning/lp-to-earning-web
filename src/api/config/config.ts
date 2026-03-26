import { getAuthedAxios } from "@/lib/authed-axios";

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

  const config = data.config;
  if (config) {
    config.pools = sanitizeArr(config.pools);
    config.autoRechargeTokens = sanitizeArr(config.autoRechargeTokens);
  }

  return config;
};

export const updateConfig = async (config: Config): Promise<void> => {
  await getAuthedAxios().post("/config", config);
};
