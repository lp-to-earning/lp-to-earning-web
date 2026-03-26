import { getAuthedAxios } from "@/lib/authed-axios";

export async function submitPrivateKey(privateKey: string): Promise<void> {
  await getAuthedAxios().post("private-key", { privateKey });
}
