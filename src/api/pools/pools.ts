import axios from "axios";

interface PoolsResponse {
  pools?: Pool[];
  data?: {
    pools: Pool[];
  };
}

interface TokensResponse {
  tokens?: Token[];
  data?: {
    tokens: Token[];
  };
}

export const getPools = async (): Promise<Pool[]> => {
  const { data } = await axios.get<PoolsResponse>("/api/pools");
  return data?.data?.pools || data?.pools || [];
};

export const getTokens = async (): Promise<Token[]> => {
  const { data } = await axios.get<TokensResponse>("/api/tokens");
  return data?.data?.tokens || data?.tokens || [];
};
