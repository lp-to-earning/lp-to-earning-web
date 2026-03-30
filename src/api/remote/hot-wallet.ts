import { getAuthedAxios } from "@/lib/authed-axios";
import axios from "axios";

export interface CreateHotWalletResponse {
  success: boolean;
  message?: string;
  address?: string;
  error?: string;
}

/**
 * `POST /api/hot-wallet/create` — 관리형 핫월렛 발급 (Body 비움)
 */
export async function postCreateHotWallet(): Promise<CreateHotWalletResponse> {
  const { data } = await getAuthedAxios().post<CreateHotWalletResponse>(
    "hot-wallet/create",
    {},
  );
  return data;
}

export function parseHotWalletCreateError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as
      | { error?: string; message?: string }
      | undefined;
    const msg = d?.error ?? d?.message ?? err.message;
    if (err.response?.status === 404)
      return "핫월렛 생성 주소를 서버에서 찾지 못했습니다(404). 백엔드에 POST /api/hot-wallet/create 라우트가 있는지 확인해 주세요.";
    if (err.response?.status === 401)
      return "인증이 만료되었습니다. 다시 로그인해 주세요.";
    if (err.response?.status === 400)
      return typeof msg === "string" && msg
        ? msg
        : "지갑 생성 중 오류가 발생했습니다.";
    if (typeof msg === "string" && msg) return msg;
  }
  if (err instanceof Error) return err.message;
  return "핫월렛 생성 요청에 실패했습니다.";
}
