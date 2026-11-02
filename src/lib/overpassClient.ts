/** Overpass 公開インスタンス（並列レース用） */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const UA = "IllustratorMap/0.3 (map base studio)";

export class OverpassError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OverpassError";
  }
}

/**
 * 複数ミラーへ並列で問い合わせ、最初に成功した応答を返す。
 * 遅いミラーを順番待ちしないことで体感速度を改善する。
 */
export async function fetchOverpassJson(
  query: string,
  options?: { timeoutMs?: number },
): Promise<{ elements?: unknown[] }> {
  const timeoutMs = options?.timeoutMs ?? 18000;
  const body = `data=${encodeURIComponent(query)}`;

  const attempts = OVERPASS_ENDPOINTS.map((endpoint) =>
    fetchOne(endpoint, body, timeoutMs),
  );

  const errors: string[] = [];
  const wrapped = attempts.map((promise) =>
    promise.catch((error: unknown) => {
      const reason =
        error instanceof Error ? error.message : "network error";
      errors.push(reason);
      return Promise.reject(error);
    }),
  );

  try {
    return await Promise.any(wrapped);
  } catch {
    throw new OverpassError(
      `地図サーバーが混雑しています（${errors.slice(0, 2).join(" / ") || "timeout"}）。少し待って再試行してください。`,
    );
  }
}

async function fetchOne(
  endpoint: string,
  body: string,
  timeoutMs: number,
): Promise<{ elements?: unknown[] }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": UA,
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${endpoint}: HTTP ${response.status}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as { elements?: unknown[] };
    } catch {
      throw new Error(`${endpoint}: invalid JSON`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${endpoint}: timeout`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
