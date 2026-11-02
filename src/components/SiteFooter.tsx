export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#EDE6DC] bg-[#FFFDF8]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#A89888]">© イラスト道案内</p>
        <div
          className="flex min-h-[50px] min-w-[200px] flex-1 items-center justify-center rounded-md border border-dashed border-[#E0D6C8] bg-[#FFF8F1] px-3 text-[10px] text-[#A89888] sm:max-w-[320px]"
          data-ad-slot="footer"
          aria-label="広告枠"
        >
          広告枠
        </div>
      </div>
    </footer>
  );
}
