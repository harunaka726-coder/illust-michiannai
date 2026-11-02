import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return Response.json([]);

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "ja");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "IllustratorMap/0.1 (local prototype)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return Response.json(
      { error: "住所検索に失敗しました" },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    display_name: string;
    lat: string;
    lon: string;
  }[];

  return Response.json(
    data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    })),
  );
}
