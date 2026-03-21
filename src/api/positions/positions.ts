import axios from "axios";

export const getPositions = async (): Promise<Position[]> => {
  const { data } = await axios.get<PositionsResponse>("/api/positions");
  return data?.data?.positions || data?.positions || [];
};
