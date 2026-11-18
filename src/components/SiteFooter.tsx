import { OTHER_WORKS_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#EDE6DC] bg-[#FFFDF8]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0 space-y-1 text-[11px] text-[#A89888]">
          <p>© イラスト道案内 · PC推奨</p>
          <a
            href={OTHER_WORKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B5E52] underline-offset-2 hover:text-[#FF8A65] hover:underline"
          >
            他の作品はこちら
          </a>
        </div>
        {/* デスクトップ向けに横長の広告スペースを確保（審査後に自動広告／ユニットが入る） */}
        <div
          className="flex min-h-[90px] w-full flex-1 items-center justify-center overflow-hidden rounded-md bg-[#FFF8F1] lg:min-h-[100px] lg:max-w-[728px]"
          data-ad-slot="footer"
          aria-label="広告枠"
        />
      </div>
    </footer>
  );
}
