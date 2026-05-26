import { getAuthedAxios } from "@/lib/authed-axios";

export interface PartialWithdrawBody {
  mint?: string;
  amount?: number;
  amountSol?: number;
}

export interface WithdrawResponse {
  txHash?: string;
}

export interface ClaimFeesResponse {
  success: boolean;
  message: string;
}

export async function postPartialWithdraw(
  body: PartialWithdrawBody,
): Promise<WithdrawResponse> {
  const { data } = await getAuthedAxios().post<WithdrawResponse>(
    "withdraw",
    body,
  );
  return data;
}

export async function postWithdrawAll(): Promise<WithdrawResponse> {
  const { data } = await getAuthedAxios().post<WithdrawResponse>(
    "withdraw-all",
    {},
  );
  return data;
}

export interface ClosePositionResponse {
  success: boolean;
  message: string;
}

export async function postClaimFees(
  nftMints: string[],
): Promise<ClaimFeesResponse> {
  const { data } = await getAuthedAxios().post<ClaimFeesResponse>(
    "positions/claim",
    { nftMints },
  );
  return data;
}

export async function postClosePosition(
  nftMint: string,
): Promise<ClosePositionResponse> {
  const { data } = await getAuthedAxios().post<ClosePositionResponse>(
    "positions/close",
    { nftMint },
  );
  return data;
}

