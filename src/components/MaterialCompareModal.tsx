"use client";

import { ExternalLink, X } from "lucide-react";
import type { MaterialSite } from "@/data/stamps";

/**
 * 各サイトの検索結果を並べて比較するパネル。
 * ※多くのサイトは iframe 埋め込みを禁止しているため、
 *   プレビューカード＋「開く」で別タブ比較が現実的な実装。
 */
export function MaterialCompareModal({
  query,
  sites,
  onClose,
}: {
  query: string;
  sites: MaterialSite[];
  onClose: () => void;
}) {
  const openAll = () => {
    for (const site of sites) {
      window.open(site.searchUrl(query), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#2b2b2b]/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#EDE6DC] bg-[#FFFDF8] shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-[#EDE6DC] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#3D3D3D]">
              「{query}」の検索結果を比較
            </p>
            <p className="mt-0.5 text-[11px] text-[#8A8A8A]">
              各サイトの検索ページへジャンプして素材を見比べられます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAll}
              className="rounded-full bg-[#FF8A65] px-3 py-1.5 text-[11px] font-medium text-white"
            >
              すべて別タブで開く
            </button>
            <button
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="rounded-full border border-[#EDE6DC] bg-white p-2 text-[#5C5C5C]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const url = site.searchUrl(query);
            return (
              <a
                key={site.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-[#EDE6DC] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF8A65]/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#3D3D3D]">
                      {site.label}
                    </p>
                    <p className="mt-1 line-clamp-2 break-all text-[10px] text-[#9A9A9A]">
                      {url}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#FF8A65] opacity-70 group-hover:opacity-100" />
                </div>
                <div className="mt-3 flex h-24 items-center justify-center rounded-xl bg-[#FFF5F0] text-[11px] text-[#B07A6A]">
                  {query} の素材を見る
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
