interface Position {
  positionAddress: string;
  nftMintAddress: string;
  poolAddress: string;
  tickLower: number;
  tickUpper: number;
  status: number;
  liquidityUsd: string;
  earnedUsd: string;
  earnedUsdPercent: string;
  pnlUsd: string;
  pnlUsdPercent: string;
  apr: number | null;
  bonusUsd: string;
  pair: string;
  tokenSymbolA: string;
  tokenSymbolB: string;
  /** 서버가 내려주면 부분 출금 민트 선택에 우선 사용 */
  tokenMintA?: string;
  tokenMintB?: string;
}

interface PositionsResponse {
  positions?: Position[];
  data?: {
    positions: Position[];
  };
}
