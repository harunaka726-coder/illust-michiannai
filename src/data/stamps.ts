/**
 * 権利的に安全な基本シェイプのみをデフォルト保持。
 * 装飾イラストは外部素材サイト or ユーザーアップロードで追加する。
 */

export type StampKind = "shape" | "upload";

export interface StampDef {
  id: string;
  label: string;
  kind: StampKind;
  glyphKey?: string;
  imageUrl?: string;
}

export const BASIC_STAMPS: StampDef[] = [
  { id: "shape-pin", label: "ピン", kind: "shape", glyphKey: "pin" },
  { id: "shape-frame", label: "青矢印", kind: "shape", glyphKey: "textframe" },
  { id: "shape-arrow", label: "矢印", kind: "shape", glyphKey: "arrow" },
  { id: "shape-circle", label: "丸", kind: "shape", glyphKey: "circle" },
  { id: "shape-square", label: "星", kind: "shape", glyphKey: "square" },
];

export const STAMPS = BASIC_STAMPS;

export function getBasicStamp(id: string) {
  return BASIC_STAMPS.find((stamp) => stamp.id === id);
}

export function resolveStamp(
  id: string,
  customStamps: { id: string; label: string; imageUrl: string }[] = [],
): StampDef | undefined {
  const basic = getBasicStamp(id);
  if (basic) return basic;
  const custom = customStamps.find((stamp) => stamp.id === id);
  if (!custom) return undefined;
  return {
    id: custom.id,
    label: custom.label,
    kind: "upload",
    imageUrl: custom.imageUrl,
  };
}

export function getStamp(id: string) {
  return getBasicStamp(id);
}

export interface MaterialSite {
  id: string;
  label: string;
  homeUrl: string;
  searchUrl: (query: string) => string;
  note?: string;
  custom?: boolean;
}

const q = encodeURIComponent;

/** 指定順のフリー素材サイト */
export const MATERIAL_SITES: MaterialSite[] = [
  {
    id: "irasutoya",
    label: "いらすとや",
    homeUrl: "https://www.irasutoya.com/",
    searchUrl: (w) => `https://www.irasutoya.com/search?q=${q(w)}`,
  },
  {
    id: "soco-st",
    label: "SOCO-ST",
    homeUrl: "https://soco-st.com/",
    searchUrl: (w) => `https://soco-st.com/?s=${q(w)}`,
  },
  {
    id: "sui-sai-jp",
    label: "すいさい.jp",
    homeUrl: "https://sui-sai.jp/",
    searchUrl: (w) => `https://sui-sai.jp/?s=${q(w)}`,
  },
  {
    id: "enpitsu",
    label: "えんぴつ素材",
    homeUrl: "https://enpitsu-sozai.com/",
    searchUrl: (w) => `https://enpitsu-sozai.com/?s=${q(w)}`,
  },
  {
    id: "fukidesign",
    label: "吹き出しデザイン",
    homeUrl: "https://fukidesign.com/",
    searchUrl: (w) => `https://fukidesign.com/?s=${q(w)}`,
  },
  {
    id: "tech-pic",
    label: "テックピク",
    homeUrl: "https://tech-pic.com/",
    searchUrl: (w) => `https://tech-pic.com/?s=${q(w)}`,
  },
  {
    id: "tsukatte",
    label: "使って",
    homeUrl: "https://tsukatte.com/",
    searchUrl: (w) => `https://tsukatte.com/?s=${q(w)}`,
  },
  {
    id: "loose-drawing",
    label: "Loose Drawing",
    homeUrl: "https://loosedrawing.com/",
    searchUrl: (w) => `https://loosedrawing.com/?s=${q(w)}`,
  },
  {
    id: "tyoudoii",
    label: "ちょうどいいイラスト",
    homeUrl: "https://tyoudoii-illust.com/",
    searchUrl: (w) => `https://tyoudoii-illust.com/?s=${q(w)}`,
  },
  {
    id: "kuku-keke",
    label: "くくけけ",
    homeUrl: "https://kuku-keke.com/",
    searchUrl: (w) => `https://kuku-keke.com/?s=${q(w)}`,
  },
  {
    id: "shigureni",
    label: "しぐれに",
    homeUrl: "https://shigureni.com/",
    searchUrl: (w) => `https://shigureni.com/?s=${q(w)}`,
  },
  {
    id: "illustcenter",
    label: "イラストセンター",
    homeUrl: "https://illustcenter.com/",
    searchUrl: (w) => `https://illustcenter.com/?s=${q(w)}`,
  },
  {
    id: "poromi",
    label: "ぽろみ",
    homeUrl: "https://poromi-free.net/",
    searchUrl: (w) => `https://poromi-free.net/?s=${q(w)}`,
  },
  {
    id: "onwa",
    label: "温和イラスト",
    homeUrl: "https://onwa-illust.com/",
    searchUrl: (w) => `https://onwa-illust.com/?s=${q(w)}`,
  },
];

const CUSTOM_SITES_KEY = "illust-map:custom-sites";

export interface StoredCustomSite {
  id: string;
  label: string;
  homeUrl: string;
}

export function loadCustomSites(): MaterialSite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_SITES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as StoredCustomSite[];
    return list.map((item) => ({
      id: item.id,
      label: item.label,
      homeUrl: item.homeUrl,
      custom: true,
      searchUrl: (w) => {
        const base = item.homeUrl.replace(/\/$/, "");
        return `${base}/?s=${q(w)}`;
      },
    }));
  } catch {
    return [];
  }
}

export function saveCustomSites(sites: StoredCustomSite[]) {
  localStorage.setItem(CUSTOM_SITES_KEY, JSON.stringify(sites));
}

export function allMaterialSites(custom: MaterialSite[] = []): MaterialSite[] {
  return [...MATERIAL_SITES, ...custom];
}
