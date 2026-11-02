import type { MapFontId } from "@/lib/fonts";
import type { SheetLayout } from "@/lib/geo";
import type {
  AreaBounds,
  CustomStamp,
  IllustArea,
  IllustPath,
  IllustSpot,
} from "@/types/illustration";
import type { ThemeId } from "@/types/map";

export const MAP_DATA_VERSION = 1 as const;

export interface MapData {
  version: typeof MAP_DATA_VERSION;
  themeId: ThemeId;
  title: string;
  subtitle: string;
  titleScale: number;
  titleFontId: MapFontId;
  titleVisible?: boolean;
  mapRotation: number;
  bounds: AreaBounds;
  paths: IllustPath[];
  areas: IllustArea[];
  spots: IllustSpot[];
  customStamps?: CustomStamp[];
  sheetLayout?: SheetLayout;
}

const STORAGE_PREFIX = "illust-map:";
const DRAFT_KEY = "illust-map:draft";

export interface DraftRecord {
  savedAt: string;
  data: MapData;
}

export function saveDraft(data: MapData): { ok: boolean; savedAt: string } {
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt, data } satisfies DraftRecord));
    return { ok: true, savedAt };
  } catch {
    return { ok: false, savedAt };
  }
}

export function loadDraft(): DraftRecord | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftRecord;
    if (!parsed?.data?.bounds) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function encodeMapData(data: MapData): string {
  const json = JSON.stringify(data);
  // UTF-8 安全な Base64
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function decodeMapData(encoded: string): MapData | null {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as MapData;
    if (!data?.bounds || !Array.isArray(data.spots)) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveMapLocally(data: MapData): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 10)
      : `m${Date.now().toString(36)}`;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(data));
  } catch {
    // quota 超過時は無視（URL埋め込み側にフォールバック）
  }
  return id;
}

export function loadMapLocally(id: string): MapData | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as MapData;
    if (!data?.bounds) return null;
    return data;
  } catch {
    return null;
  }
}

/** 短い共有URLを発行。データが大きい場合は localStorage + id を使う */
export function createShareUrl(data: MapData): {
  url: string;
  mode: "query" | "local";
} {
  const encoded = encodeMapData(data);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  if (encoded.length < 6500) {
    return {
      url: `${origin}${path}?map=${encodeURIComponent(encoded)}`,
      mode: "query",
    };
  }

  const id = saveMapLocally(data);
  return {
    url: `${origin}${path}?id=${id}`,
    mode: "local",
  };
}

export function readSharedMapFromLocation(
  search: string,
): { data: MapData; source: "query" | "local" } | null {
  const params = new URLSearchParams(search);
  const mapParam = params.get("map");
  if (mapParam) {
    const data = decodeMapData(mapParam);
    if (data) return { data, source: "query" };
  }
  const id = params.get("id");
  if (id) {
    const data = loadMapLocally(id);
    if (data) return { data, source: "local" };
  }
  return null;
}
