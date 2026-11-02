import type { ThemeId, ThemePalette } from "@/types/map";

export type ActiveThemeId = "watercolor" | "picturebook";

export function normalizeThemeId(
  id: string | null | undefined,
): ActiveThemeId {
  if (id === "picturebook") return "picturebook";
  if (id === "watercolor") return "watercolor";
  return "watercolor";
}

/**
 * Loose Drawing 風: やわらかい白〜クリーム、コーラルアクセント
 */
export const THEMES: Record<ActiveThemeId, ThemePalette> = {
  watercolor: {
    id: "watercolor",
    label: "雑誌風",
    description: "Loose Drawing 風のやさしい紙色",
    mapStyle: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    colors: {
      background: "#FFF8F1",
      panel: "#FFFDF8",
      panelBorder: "#EDE6DC",
      accent: "#FF8A65",
      road: "#F0C4B0",
      water: "#A8D8E6",
      building: "#F5EEE6",
      label: "#4A4038",
      pinBg: "#FFFFFF",
    },
    iconDir: "/assets/icons/watercolor",
  },
  picturebook: {
    id: "picturebook",
    label: "シンプル",
    description: "白ベースの線画",
    mapStyle: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    colors: {
      background: "#F7F7F5",
      panel: "#FFFFFF",
      panelBorder: "#E8E6E1",
      accent: "#5B9BD5",
      road: "#C8C8C8",
      water: "#90CAF9",
      building: "#FAFAFA",
      label: "#3D3D3D",
      pinBg: "#FFFFFF",
    },
    iconDir: "/assets/icons/picturebook",
  },
};

export const THEME_FILTERS: Record<ActiveThemeId, string> = {
  watercolor: "sepia(0.08) saturate(0.95) contrast(0.98)",
  picturebook: "none",
};

export const THEME_LIST = [THEMES.watercolor, THEMES.picturebook];

export interface IllustThemeStyle {
  paper: string;
  ink: string;
  road: string;
  roadMajor: string;
  water: string;
  park: string;
  rail: string;
  roadWidth: number;
  majorWidth: number;
  riverWidth: number;
  railWidth: number;
  linecap: "round" | "butt" | "square";
  showGrid: boolean;
  gridColor: string;
}

export const ILLUST_INK: Record<ActiveThemeId, IllustThemeStyle> = {
  watercolor: {
    paper: "#FFFDF8",
    ink: "#4A4038",
    road: "#F0C4B0",
    roadMajor: "#FF8A65",
    water: "#A8D8E6",
    park: "#D4EBC8",
    rail: "#A89888",
    roadWidth: 9,
    majorWidth: 15,
    riverWidth: 14,
    railWidth: 3,
    linecap: "round",
    showGrid: false,
    gridColor: "transparent",
  },
  picturebook: {
    paper: "#FFFFFF",
    ink: "#3D3D3D",
    road: "#C8C8C8",
    roadMajor: "#9E9E9E",
    water: "#90CAF9",
    park: "#E8F5E9",
    rail: "#757575",
    roadWidth: 3.5,
    majorWidth: 5.5,
    riverWidth: 6,
    railWidth: 2,
    linecap: "butt",
    showGrid: false,
    gridColor: "transparent",
  },
};

export function resolveIllustInk(themeId: ThemeId) {
  return ILLUST_INK[normalizeThemeId(themeId)];
}
