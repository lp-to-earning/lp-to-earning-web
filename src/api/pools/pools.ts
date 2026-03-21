"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const getPools = async (): Promise<Pool[]> => {
  try {
    const { stdout } = await execAsync(
      "byreal-cli pools -o json --non-interactive",
    );
    const parsedData = JSON.parse(stdout);
    return parsedData?.data?.pools || parsedData?.pools || [];
  } catch (error) {
    console.error("Failed to execute byreal-cli pools:", error);
    return [];
  }
};

export const getTokens = async (): Promise<Token[]> => {
  try {
    const { stdout } = await execAsync(
      "byreal-cli tokens -o json --non-interactive",
    );
    const parsedData = JSON.parse(stdout);
    return parsedData?.data?.tokens || parsedData?.tokens || [];
  } catch (error) {
    console.error("Failed to execute byreal-cli tokens:", error);
    return [];
  }
};
