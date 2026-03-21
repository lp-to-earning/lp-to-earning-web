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
}

interface PositionsResponse {
  positions?: Position[];
  data?: {
    positions: Position[];
  };
}
