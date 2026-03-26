import axios from "axios";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://16.171.21.155:3001";

export const getConfig = async (token: string): Promise<Config> => {
  const { data } = await axios.get<ConfigResponse>(`${API_HOST}/api/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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

export const updateConfig = async ({
  token,
  config,
}: {
  token: string;
  config: Config;
}): Promise<void> => {
  await axios.post(`${API_HOST}/api/config`, config, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
