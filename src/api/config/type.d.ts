interface Config {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
  /** 서버 봇 루프에서 이 지갑을 처리할지 여부 (`POST` 시 `isBotActive`로도 전송) */
  isActive: boolean;
  /** API v2 `POST /config` — 자동 리밸런스 */
  isAutoRebalance: boolean;
  pools: string[];
  autoRechargeTokens: string[];
}

interface ConfigResponse {
  config: Config | null;
  /** 서버: User.encryptedPrivateKey 존재 여부 */
  hasPrivateKey?: boolean;
}

interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logo_uri?: string;
  price_usd: number;
  price_change_24h?: number;
  volume_24h_usd?: number;
}

interface Pool {
  name: string;
  address: string;
  symbolA: string;
  symbolB: string;
  logoA: string;
  logoB: string;
  price: number;
  apr: number;
  tvl: number;
  volume24h: number;
}

interface PoolsResponse {
  pools: {
    data: Pool[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface TokensResponse {
  tokens: {
    data: Token[];
    total: number;
    page: number;
    pageSize: number;
  };
}
