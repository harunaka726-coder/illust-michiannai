export type MapFontId = "yomogi" | "kiwi" | "mplus" | "zenmaru" | "kaisei";

export const MAP_FONTS: {
  id: MapFontId;
  label: string;
  css: string;
}[] = [
  {
    id: "yomogi",
    label: "よもぎ（手書き）",
    css: "var(--font-map-yomogi), cursive",
  },
  {
    id: "kiwi",
    label: "キウイ丸ゴ",
    css: "var(--font-map-kiwi), sans-serif",
  },
  {
    id: "mplus",
    label: "Mプラス丸",
    css: "var(--font-map-mplus), sans-serif",
  },
  {
    id: "zenmaru",
    label: "Zen丸ゴシック",
    css: "var(--font-map-zenmaru), sans-serif",
  },
  {
    id: "kaisei",
    label: "解星デコール",
    css: "var(--font-map-kaisei), serif",
  },
];

export function fontCss(id?: MapFontId | string | null) {
  return (
    MAP_FONTS.find((font) => font.id === id)?.css ??
    MAP_FONTS[0].css
  );
}

/** 旧フォントIDを新IDへ */
export function normalizeFontId(id?: string | null): MapFontId {
  if (id === "kiwi" || id === "mplus" || id === "zenmaru" || id === "kaisei" || id === "yomogi") {
    return id;
  }
  if (id === "hand" || id === "mincho") return "kaisei";
  if (id === "maru") return "zenmaru";
  return "yomogi";
}
