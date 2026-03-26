interface Config {
  topN: number;
  copyAmountUsd: number;
  minAprPercent: number;
  intervalMs: number;
  dryRun: boolean;
  /** 서버 봇 루프에서 이 지갑을 처리할지 여부 */
  isActive: boolean;
  pools: string[];
  autoRechargeTokens: string[];
}

interface ConfigResponse {
  config: Config;
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
  id: string;
  pair: string;
  token_a: Token;
  token_b: Token;
  tvl_usd: number;
  volume_24h_usd: number;
  volume_7d_usd: number;
  fee_rate_bps: number;
  fee_24h_usd: number;
  apr: number;
  current_price: number;
  created_at: string;
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
