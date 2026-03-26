/**
 * API 베이스 URL (끝에 `/` 포함).
 *
 * - `NEXT_PUBLIC_API_HOST`가 있으면: 직접 호출 (로컬에서 백엔드만 띄울 때 등). 예: `http://127.0.0.1:3001/api`
 * - 비어 있으면: 브라우저에서는 **현재 출처 + `/api/`** → Vercel(HTTPS)에서 Mixed Content 없이 `next.config` rewrites로 백엔드 전달.
 */
function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed ? `${trimmed}/` : "";
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_HOST?.trim() ?? "";
  if (fromEnv) {
    return normalizeApiBase(fromEnv);
  }

  if (typeof window !== "undefined") {
    return normalizeApiBase(`${window.location.origin}/api`);
  }

  return "";
}
