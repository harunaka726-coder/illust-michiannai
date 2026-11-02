/** retro は旧データ互換（表示時はシンプルへ正規化） */
export type ThemeId = "watercolor" | "picturebook" | "retro";

export type PoiCategory =
  | "cafe"
  | "bakery"
  | "convenience"
  | "restaurant"
  | "ramen"
  | "soba"
  | "library"
  | "bus"
  | "pharmacy"
  | "bookstore"
  | "park"
  | "station"
  | "shop"
  | "school"
  | "hospital"
  | "bank"
  | "post"
  | "supermarket"
  | "hotel"
  | "shrine"
  | "home"
  | "custom"
  | "unknown";

export interface MapPin {
  id: string;
  lng: number;
  lat: number;
  name: string;
  category: PoiCategory;
  /** OSM / Mapbox raw tags for debugging & future logic */
  tags?: Record<string, string>;
  isCustom?: boolean;
}

export interface ThemePalette {
  id: ThemeId;
  label: string;
  description: string;
  /** MapLibre / OpenFreeMap などのスタイルURL */
  mapStyle: string;
  colors: {
    background: string;
    panel: string;
    panelBorder: string;
    accent: string;
    road: string;
    water: string;
    building: string;
    label: string;
    pinBg: string;
  };
  /** Relative path under /public/assets/icons/{themeId}/ */
  iconDir: string;
}
