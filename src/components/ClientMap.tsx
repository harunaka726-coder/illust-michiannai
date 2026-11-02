"use client";

import { useEffect, useId, useState, type ComponentType } from "react";

/**
 * leaflet は window 必須のため、マウント後にだけ読み込む。
 * next/dynamic(ssr:false) は cacheComponents 下で永遠に pending になることがある。
 */
export function ClientMap() {
  const mapInstanceId = useId();
  const [MapComponent, setMapComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/components/MapComponent")
      .then((mod) => {
        if (!cancelled) setMapComponent(() => mod.MapComponent);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cancelled) {
          setError("地図の読み込みに失敗しました。再読み込みしてください。");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-[#B45309]">
        {error}
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
        地図を読み込み中…
      </div>
    );
  }

  // ルート遷移のたびに地図を作り直す（Leaflet のコンテナ再利用エラー防止）
  return <MapComponent key={mapInstanceId} />;
}
