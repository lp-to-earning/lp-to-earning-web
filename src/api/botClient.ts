const BOT_API_URL = process.env.BOT_API_URL || "http://16.171.21.155:3001";
const BOT_API_KEY = process.env.BOT_API_KEY || "";

export async function botFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BOT_API_URL}${path}`, {
    headers: {
      "x-api-key": BOT_API_KEY,
    },
    next: { revalidate: 60 }, // ISR: 60초 캐시
  });

  if (!res.ok) {
    throw new Error(`Bot API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json as T;
}
