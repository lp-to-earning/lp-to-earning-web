"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface PositionsResult {
  positions: Position[];
  total: number;
}

export const getPositions = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<PositionsResult> => {
  try {
    const { stdout } = await execAsync(
      `byreal-cli -o json positions list --page ${page} --page-size ${pageSize}`,
    );
    const parsedData = JSON.parse(stdout);
    return {
      positions: parsedData?.data?.positions || [],
      total: parsedData?.data?.total || 0,
    };
  } catch (error) {
    console.error("Failed to execute byreal-cli positions:", error);
    return { positions: [], total: 0 };
  }
};
