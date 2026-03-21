"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const getPositions = async (): Promise<Position[]> => {
  try {
    const { stdout } = await execAsync(
      "byreal-cli positions list -o json --non-interactive",
    );
    const parsedData = JSON.parse(stdout);
    return parsedData?.data?.positions || parsedData?.positions || [];
  } catch (error) {
    console.error("Failed to execute byreal-cli positions:", error);
    return [];
  }
};
