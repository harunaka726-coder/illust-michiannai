import { NextRequest } from "next/server";
import { boundsTooLarge, boundsTooSmall } from "@/lib/geo";
import { fetchOverpassJson } from "@/lib/overpassClient";
import {
  buildBaseFromOverpassElements,
  fetchOsmMapXml,
  parseOsmXmlToBase,
  type BaseMapPayload,
} from "@/lib/osmMapFetch";
import type { AreaBounds } from "@/types/illustration";

/** bbox キーごとの短時間キャッシュ */
const cache = new Map<string, { at: number; payload: BaseMapPayload }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function cacheKey(bounds: AreaBounds) {
  return [
    bounds.south.toFixed(5),
    bounds.west.toFixed(5),
    bounds.north.toFixed(5),
    bounds.east.toFixed(5),
  ].join(",");
}

function overpassQuery(bbox: string) {
  return `
[out:json][timeout:15];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential)$"](${bbox});
  way["waterway"~"^(river|canal)$"](${bbox});
  way["railway"~"^(rail|subway|light_rail)$"](${bbox});
  way["leisure"~"^(park|garden)$"](${bbox});
);
out geom;
`.trim();
}

async function fetchViaOverpass(bounds: AreaBounds): Promise<BaseMapPayload> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const data = await fetchOverpassJson(overpassQuery(bbox), {
    timeoutMs: 16000,
  });
  return buildBaseFromOverpassElements(
    (data.elements as Parameters<typeof buildBaseFromOverpassElements>[0]) ??
      [],
  );
}

export async function POST(request: NextRequest) {
  const bounds = (await request.json()) as AreaBounds;
  if (
    !Number.isFinite(bounds?.south) ||
    !Number.isFinite(bounds?.north) ||
    !Number.isFinite(bounds?.west) ||
    !Number.isFinite(bounds?.east)
  ) {
    return Response.json({ error: "範囲が不正です" }, { status: 400 });
  }
  if (boundsTooSmall(bounds)) {
    return Response.json(
      { error: "範囲が小さすぎます。もう少し広く選んでください。" },
      { status: 400 },
    );
  }
  if (boundsTooLarge(bounds)) {
    return Response.json(
      { error: "範囲が広すぎます。駅の周辺くらいまで絞ってください。" },
      { status: 400 },
    );
  }

  const key = cacheKey(bounds);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return Response.json(cached.payload);
  }

  const errors: string[] = [];

  // 1) OSM 本体 API（Overpass 非依存・小範囲で安定）
  try {
    const xml = await fetchOsmMapXml(bounds);
    const payload = parseOsmXmlToBase(xml);
    if (payload.paths.length > 0 || payload.areas.length > 0) {
      cache.set(key, { at: Date.now(), payload });
      return Response.json(payload);
    }
    errors.push("OSM API: 該当データなし");
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "OSM API failed",
    );
  }

  // 2) Overpass フォールバック
  try {
    const payload = await fetchViaOverpass(bounds);
    if (payload.paths.length > 0 || payload.areas.length > 0) {
      cache.set(key, { at: Date.now(), payload });
      return Response.json(payload);
    }
    errors.push("Overpass: 該当データなし");
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Overpass failed",
    );
  }

  return Response.json(
    {
      error: `地図データの取得に失敗しました。範囲を少し変えて再試行してください。（${errors[0] ?? "unknown"}）`,
    },
    { status: 502 },
  );
}
