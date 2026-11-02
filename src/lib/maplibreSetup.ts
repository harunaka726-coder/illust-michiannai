"use client";

import { setWorkerUrl } from "maplibre-gl";

/**
 * Next.js / Turbopack ではデフォルトの Worker 解決が失敗しやすいため、
 * public に置いたワーカーを明示指定する。
 */
if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}
