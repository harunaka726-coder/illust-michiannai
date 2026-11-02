import type {
  AreaBounds,
  IllustArea,
  IllustPath,
  LngLat,
} from "@/types/illustration";

const UA = "IllustratorMap/0.3 (map base studio; contact: local)";

const MAJOR = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
]);

const ROAD_HIGHWAYS = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "unclassified",
  "residential",
  "living_street",
  "pedestrian",
  "service",
]);

function simplify(points: LngLat[], max = 24): LngLat[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const next = points.filter((_, index) => index % step === 0);
  const last = points[points.length - 1];
  if (next[next.length - 1] !== last) next.push(last);
  return next;
}

function lengthOf(points: LngLat[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(
      points[index].lat - points[index - 1].lat,
      points[index].lng - points[index - 1].lng,
    );
  }
  return total;
}

function midpoint(points: LngLat[]) {
  return points[Math.floor(points.length / 2)] ?? points[0];
}

function dedupeRivers(rivers: IllustPath[]): IllustPath[] {
  const sorted = [...rivers].sort(
    (a, b) => lengthOf(b.points) - lengthOf(a.points),
  );
  const kept: IllustPath[] = [];
  for (const river of sorted) {
    const mid = midpoint(river.points);
    if (!mid) continue;
    const duplicate = kept.find((other) => {
      const otherMid = midpoint(other.points);
      if (!otherMid) return false;
      const near =
        Math.hypot(mid.lat - otherMid.lat, mid.lng - otherMid.lng) < 0.0012;
      const sameName =
        Boolean(river.name) &&
        Boolean(other.name) &&
        river.name === other.name;
      return near || sameName;
    });
    if (!duplicate) kept.push(river);
  }
  return kept;
}

export interface BaseMapPayload {
  paths: IllustPath[];
  areas: IllustArea[];
  landmarks: [];
  source: "osm-api" | "overpass";
}

/**
 * OpenStreetMap 本体 API（/api/0.6/map）から範囲内の生データを取得。
 * Overpass より安定しやすい（小範囲向け）。
 */
export async function fetchOsmMapXml(bounds: AreaBounds): Promise<string> {
  const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
  const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": UA },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`OSM API HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/** OSM XML → 道・川・線路・公園 */
export function parseOsmXmlToBase(xml: string): BaseMapPayload {
  const nodes = new Map<string, LngLat>();
  const nodeRe = /<node\b([^>]*)\/?>/g;
  let match: RegExpExecArray | null;
  while ((match = nodeRe.exec(xml))) {
    const attrs = match[1];
    const id = attrs.match(/\bid="(\d+)"/)?.[1];
    const lat = Number(attrs.match(/\blat="([^"]+)"/)?.[1]);
    const lon = Number(attrs.match(/\blon="([^"]+)"/)?.[1]);
    if (id && Number.isFinite(lat) && Number.isFinite(lon)) {
      nodes.set(id, { lat, lng: lon });
    }
  }

  const roads: IllustPath[] = [];
  const rivers: IllustPath[] = [];
  const rails: IllustPath[] = [];
  const areas: IllustArea[] = [];

  const wayRe = /<way\b([^>]*)>([\s\S]*?)<\/way>/g;
  while ((match = wayRe.exec(xml))) {
    const wayAttrs = match[1];
    const body = match[2];
    const wayId = wayAttrs.match(/\bid="(\d+)"/)?.[1] ?? String(roads.length);

    const tags: Record<string, string> = {};
    const tagRe = /<tag\b([^>]*)\/?>/g;
    let tagMatch: RegExpExecArray | null;
    while ((tagMatch = tagRe.exec(body))) {
      const k = tagMatch[1].match(/\bk="([^"]*)"/)?.[1];
      const v = tagMatch[1].match(/\bv="([^"]*)"/)?.[1];
      if (k) tags[k] = v ?? "";
    }

    const refs: string[] = [];
    const ndRe = /<nd\b([^>]*)\/?>/g;
    let ndMatch: RegExpExecArray | null;
    while ((ndMatch = ndRe.exec(body))) {
      const ref = ndMatch[1].match(/\bref="(\d+)"/)?.[1];
      if (ref) refs.push(ref);
    }

    const points = simplify(
      refs
        .map((ref) => nodes.get(ref))
        .filter((point): point is LngLat => Boolean(point)),
    );
    if (points.length < 2) continue;

    const highway = tags.highway;
    if (highway && ROAD_HIGHWAYS.has(highway)) {
      roads.push({
        id: `road-${wayId}`,
        kind: "road",
        name: tags.name,
        roadClass: MAJOR.has(highway) ? "major" : "street",
        points,
      });
      continue;
    }

    const waterway = tags.waterway;
    if (waterway === "river" || waterway === "canal") {
      rivers.push({
        id: `river-${wayId}`,
        kind: "river",
        name: tags.name,
        points,
      });
      continue;
    }

    const railway = tags.railway;
    if (
      railway === "rail" ||
      railway === "subway" ||
      railway === "light_rail"
    ) {
      rails.push({
        id: `rail-${wayId}`,
        kind: "rail",
        name: tags.name,
        points,
      });
      continue;
    }

    if (
      (tags.leisure === "park" || tags.leisure === "garden") &&
      points.length >= 3
    ) {
      areas.push({
        id: `area-${wayId}`,
        kind: "park",
        name: tags.name,
        ring: points,
      });
    }
  }

  roads.sort((a, b) => {
    const rank = (road: IllustPath) => (road.roadClass === "major" ? 0 : 1);
    return rank(a) - rank(b) || lengthOf(b.points) - lengthOf(a.points);
  });

  return {
    paths: [
      ...roads.slice(0, 56),
      ...dedupeRivers(rivers).slice(0, 6),
      ...rails
        .sort((a, b) => lengthOf(b.points) - lengthOf(a.points))
        .slice(0, 8),
    ],
    areas: areas
      .sort((a, b) => lengthOf(b.ring) - lengthOf(a.ring))
      .slice(0, 14),
    landmarks: [],
    source: "osm-api",
  };
}

/** Overpass JSON elements からも同じ形へ */
export function buildBaseFromOverpassElements(
  elements: {
    type: string;
    id: number;
    tags?: Record<string, string>;
    geometry?: { lat: number; lon: number }[];
  }[],
): BaseMapPayload {
  const roads: IllustPath[] = [];
  const rivers: IllustPath[] = [];
  const rails: IllustPath[] = [];
  const areas: IllustArea[] = [];

  for (const element of elements) {
    if (
      element.type !== "way" ||
      !element.geometry ||
      element.geometry.length < 2
    ) {
      continue;
    }
    const tags = element.tags ?? {};
    const points = simplify(
      element.geometry.map((point) => ({ lat: point.lat, lng: point.lon })),
    );
    if (points.length < 2) continue;

    if (tags.highway && ROAD_HIGHWAYS.has(tags.highway)) {
      roads.push({
        id: `road-${element.id}`,
        kind: "road",
        name: tags.name,
        roadClass: MAJOR.has(tags.highway) ? "major" : "street",
        points,
      });
      continue;
    }
    if (tags.waterway === "river" || tags.waterway === "canal") {
      rivers.push({
        id: `river-${element.id}`,
        kind: "river",
        name: tags.name,
        points,
      });
      continue;
    }
    if (
      tags.railway === "rail" ||
      tags.railway === "subway" ||
      tags.railway === "light_rail"
    ) {
      rails.push({
        id: `rail-${element.id}`,
        kind: "rail",
        name: tags.name,
        points,
      });
      continue;
    }
    if (
      (tags.leisure === "park" || tags.leisure === "garden") &&
      points.length >= 3
    ) {
      areas.push({
        id: `area-${element.id}`,
        kind: "park",
        name: tags.name,
        ring: points,
      });
    }
  }

  roads.sort((a, b) => {
    const rank = (road: IllustPath) => (road.roadClass === "major" ? 0 : 1);
    return rank(a) - rank(b) || lengthOf(b.points) - lengthOf(a.points);
  });

  return {
    paths: [
      ...roads.slice(0, 56),
      ...dedupeRivers(rivers).slice(0, 6),
      ...rails
        .sort((a, b) => lengthOf(b.points) - lengthOf(a.points))
        .slice(0, 8),
    ],
    areas: areas
      .sort((a, b) => lengthOf(b.ring) - lengthOf(a.ring))
      .slice(0, 14),
    landmarks: [],
    source: "overpass",
  };
}
