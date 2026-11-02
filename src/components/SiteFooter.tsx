export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#EDE6DC] bg-[#FFFDF8]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="shrink-0 text-[11px] text-[#A89888]">
          © イラスト道案内 · PC推奨
        </p>
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
