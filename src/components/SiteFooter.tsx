export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#EDE6DC] bg-[#FFFDF8]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#A89888]">© イラスト道案内 · PC推奨</p>
        {/* AdSense 自動広告用の余白。ユニットIDが決まったらここに <ins> を追加 */}
        <div
          className="flex min-h-[50px] min-w-[200px] flex-1 items-center justify-center overflow-hidden rounded-md bg-[#FFF8F1] sm:max-w-[320px]"
          data-ad-slot="footer"
          aria-label="広告枠"
        />
      </div>
    </footer>
  );
}
