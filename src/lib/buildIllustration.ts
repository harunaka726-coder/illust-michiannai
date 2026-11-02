"use client";

import { boundsTooLarge, boundsTooSmall } from "@/lib/geo";
import { useMapStore } from "@/store/mapStore";
import type { IllustArea, IllustPath, LandmarkSeed } from "@/types/illustration";

export function useBuildIllustration() {
  const bounds = useMapStore((state) => state.bounds);
  const setBaseMap = useMapStore((state) => state.setBaseMap);
  const setBusy = useMapStore((state) => state.setBusy);
  const setMessage = useMapStore((state) => state.setMessage);
  const busy = useMapStore((state) => state.busy);

  const build = async () => {
    if (!bounds || busy) return;
    if (boundsTooSmall(bounds)) {
      setMessage("範囲が小さすぎます。もう少し広くドラッグしてください。");
      return;
    }
    if (boundsTooLarge(bounds)) {
      setMessage("範囲が広すぎます。駅の周辺くらいまで絞ってください。");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bounds),
      });
      const data = (await response.json()) as {
        error?: string;
        paths?: IllustPath[];
        areas?: IllustArea[];
        landmarks?: LandmarkSeed[];
      };
      if (!response.ok) {
        setMessage(
          data.error ??
            "地図データの取得に失敗しました。少し待って再度お試しください。",
        );
        return;
      }
      setBaseMap(data.paths ?? [], data.areas ?? [], data.landmarks ?? []);
      if ((data.paths ?? []).length === 0) {
        setMessage("道がほとんど見つかりませんでした。範囲を少し広げてみてください。");
      } else {
        setMessage(
          "ベース（道・線路・公園・川）を作成しました。素材を配置して仕上げてください。",
        );
      }
    } catch {
      setMessage(
        "地図データの取得に失敗しました。通信状況を確認し、少し待って再度お試しください。",
      );
    } finally {
      setBusy(false);
    }
  };

  return { build, busy, canBuild: Boolean(bounds) };
}
