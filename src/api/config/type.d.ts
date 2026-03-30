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
  /** 레거시: 서버에 사용자 개인키 저장 여부 (핫월렛 전환 전 API) */
  hasPrivateKey?: boolean;
  /** 서버 관리 핫월렛 사용 여부 */
  isManaged?: boolean;
  /** 입금용 봇 전용 지갑 주소 */
  hotWalletAddress?: string | null;
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
