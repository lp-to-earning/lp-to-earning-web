import { getAuthedAxios } from "@/lib/authed-axios";

export interface PartialWithdrawBody {
  mint?: string;
  amount?: number;
  amountSol?: number;
}

export interface WithdrawResponse {
  txHash?: string;
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
