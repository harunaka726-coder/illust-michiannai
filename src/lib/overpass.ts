import {
  getPoiDisplayName,
  resolvePoiCategory,
} from "@/lib/poiCategories";
import type { MapPin } from "@/types/map";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

/** クリック地点付近の OSM POI を Overpass から1件取得 */
export async function fetchNearbyOsmPoi(
  lat: number,
  lng: number,
  radiusMeters = 40,
): Promise<Omit<MapPin, "id"> | null> {
  const query = `
[out:json][timeout:8];
(
  node(around:${radiusMeters},${lat},${lng})[name][amenity];
  node(around:${radiusMeters},${lat},${lng})[name][shop];
  node(around:${radiusMeters},${lat},${lng})[name][tourism];
  node(around:${radiusMeters},${lat},${lng})[name][leisure];
  node(around:${radiusMeters},${lat},${lng})[name][railway=station];
  node(around:${radiusMeters},${lat},${lng})[name][railway=subway_entrance];
  way(around:${radiusMeters},${lat},${lng})[name][amenity];
  way(around:${radiusMeters},${lat},${lng})[name][shop];
);
out center 3;
`.trim();

  let data: OverpassResponse;
  try {
    const { fetchOverpassJson } = await import("@/lib/overpassClient");
    data = (await fetchOverpassJson(query, {
      timeoutMs: 12000,
    })) as OverpassResponse;
  } catch {
    return null;
  }

  const element = data.elements?.find((el) => el.tags?.name);
  if (!element?.tags) return null;

  const props = element.tags as Record<string, unknown>;
  const category = resolvePoiCategory(props);
  const pinLat = element.lat ?? lat;
  const pinLng = element.lon ?? lng;

  return {
    lat: pinLat,
    lng: pinLng,
    name: getPoiDisplayName(props),
    category,
    tags: element.tags,
    isCustom: false,
  };
}
