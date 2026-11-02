"use client";

import { useState } from "react";

/** スタジオは地図＋用紙の2画面前提なので、狭い画面では案内を出す */
export function MobileNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-[72px] z-[1500] px-3 md:hidden">
      <div className="mx-auto flex max-w-md items-start gap-2 rounded-xl border border-[#EDE6DC] bg-[#FFFDF8] px-3 py-2.5 text-[12px] leading-snug text-[#4A4038] shadow-lg">
        <p className="min-w-0 flex-1">
          スマホでは操作が難しいです。PC（または横長のタブレット）での利用をおすすめします。
        </p>
        <button
          type="button"
          className="shrink-0 rounded-md px-2 py-1 text-[11px] text-[#FF8A65]"
          onClick={() => setDismissed(true)}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
