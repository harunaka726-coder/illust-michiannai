"use client";

import { useMapStore } from "@/store/mapStore";

export function LoadingOverlay() {
  const busy = useMapStore((state) => state.busy);
  if (!busy) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div className="flex min-w-[220px] flex-col items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-8 py-6 shadow-lg">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#C4785A]" />
        <p className="text-sm font-medium text-[#171717]">ベースを作成中…</p>
      </div>
    </div>
  );
}
