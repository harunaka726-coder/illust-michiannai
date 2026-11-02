"use client";

import Link from "next/link";
import { CONTACT_URL, SITE_NAME } from "@/lib/site";

export function SiteHeader({
  showStudioCta = false,
}: {
  showStudioCta?: boolean;
}) {
  return (
    <header className="shrink-0 border-b border-[#EDE6DC] bg-[#FFFDF8]">
      <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-between gap-3 px-3">
        {showStudioCta ? (
          // ドキュメント→スタジオはフル読み込み（ソフトナビだと Console Error）
          <a
            href="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-[#4A4038]"
          >
            {SITE_NAME}
          </a>
        ) : (
          <span className="shrink-0 text-sm font-semibold tracking-tight text-[#4A4038]">
            {SITE_NAME}
          </span>
        )}
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-[#6B5E52] sm:gap-x-4 sm:text-xs">
          <Link href="/about" prefetch={false} className="hover:text-[#FF8A65]">
            遊び方
          </Link>
          <Link href="/privacy" prefetch={false} className="hover:text-[#FF8A65]">
            ポリシー
          </Link>
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF8A65]"
          >
            お問い合わせ
          </a>
          {showStudioCta && (
            <a
              href="/"
              className="rounded-full bg-[#FF8A65] px-2.5 py-1 text-[11px] text-white sm:text-xs"
            >
              作ってみる
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
