import type { AreaBounds, LngLat } from "@/types/illustration";

export type SheetLayout = "portrait" | "landscape";

export type ViewBox = {
  w: number;
  h: number;
  padL: number;
  padT: number;
  padR: number;
  padB: number;
};

export const VIEW_PORTRAIT: ViewBox = {
  w: 800,
  h: 1040,
  padL: 56,
  padT: 128,
  padR: 56,
  padB: 64,
};

export const VIEW_LANDSCAPE: ViewBox = {
  w: 1100,
  h: 720,
  padL: 64,
  padT: 88,
  padR: 64,
  padB: 56,
};

/** 互換: デフォルトは縦長 */
export const VIEW = VIEW_PORTRAIT;

export function viewForLayout(layout: SheetLayout): ViewBox {
  return layout === "landscape" ? VIEW_LANDSCAPE : VIEW_PORTRAIT;
}

export function normalizeBounds(a: LngLat, b: LngLat): AreaBounds {
  return {
    south: Math.min(a.lat, b.lat),
    north: Math.max(a.lat, b.lat),
    west: Math.min(a.lng, b.lng),
    east: Math.max(a.lng, b.lng),
  };
}

export function boundsTooSmall(bounds: AreaBounds) {
  return (
    bounds.north - bounds.south < 0.0012 || bounds.east - bounds.west < 0.0012
  );
}

export function boundsTooLarge(bounds: AreaBounds) {
  return (
    bounds.north - bounds.south > 0.02 || bounds.east - bounds.west > 0.02
  );
}

export function contains(bounds: AreaBounds, lat: number, lng: number) {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export function intersectBounds(a: AreaBounds, b: AreaBounds): AreaBounds | null {
  const south = Math.max(a.south, b.south);
  const north = Math.min(a.north, b.north);
  const west = Math.max(a.west, b.west);
  const east = Math.min(a.east, b.east);
  if (south >= north || west >= east) return null;
  return { south, north, west, east };
}

function mapCenter(bounds: AreaBounds) {
  return {
    lng: (bounds.west + bounds.east) / 2,
    lat: (bounds.south + bounds.north) / 2,
  };
}

function rotateAround(
  x: number,
  y: number,
  cx: number,
  cy: number,
  deg: number,
) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function project(
  lng: number,
  lat: number,
  bounds: AreaBounds,
  rotationDeg = 0,
  view: ViewBox = VIEW,
) {
  const innerW = view.w - view.padL - view.padR;
  const innerH = view.h - view.padT - view.padB;
  const cx = view.padL + innerW / 2;
  const cy = view.padT + innerH / 2;
  const center = mapCenter(bounds);
  const nx = ((lng - center.lng) / (bounds.east - bounds.west)) * innerW;
  const ny = ((center.lat - lat) / (bounds.north - bounds.south)) * innerH;
  return rotateAround(cx + nx, cy + ny, cx, cy, rotationDeg);
}

export function unproject(
  x: number,
  y: number,
  bounds: AreaBounds,
  rotationDeg = 0,
  view: ViewBox = VIEW,
): LngLat {
  const innerW = view.w - view.padL - view.padR;
  const innerH = view.h - view.padT - view.padB;
  const cx = view.padL + innerW / 2;
  const cy = view.padT + innerH / 2;
  const center = mapCenter(bounds);
  const unrotated = rotateAround(x, y, cx, cy, -rotationDeg);
  return {
    lng:
      center.lng +
      ((unrotated.x - cx) / innerW) * (bounds.east - bounds.west),
    lat:
      center.lat -
      ((unrotated.y - cy) / innerH) * (bounds.north - bounds.south),
  };
}

export function toPath(
  points: LngLat[],
  bounds: AreaBounds,
  rotationDeg = 0,
  wobble = true,
  view: ViewBox = VIEW,
) {
  if (points.length === 0) return "";
  const projected = points.map((point) =>
    project(point.lng, point.lat, bounds, rotationDeg, view),
  );
  if (!wobble || projected.length < 2) {
    return projected
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
      )
      .join(" ");
  }

  let d = `M${projected[0].x.toFixed(1)} ${projected[0].y.toFixed(1)}`;
  for (let index = 1; index < projected.length; index += 1) {
    const prev = projected[index - 1];
    const curr = projected[index];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const amp = Math.min(4.5, len * 0.04);
    const ox = (-dy / len) * amp * (index % 2 === 0 ? 1 : -1);
    const oy = (dx / len) * amp * (index % 2 === 0 ? 1 : -1);
    d += ` Q${(mx + ox).toFixed(1)} ${(my + oy).toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export function ringPath(
  points: LngLat[],
  bounds: AreaBounds,
  rotationDeg = 0,
  view: ViewBox = VIEW,
) {
  if (points.length < 3) return "";
  return `${toPath(points, bounds, rotationDeg, true, view)} Z`;
}

export function centroid(points: LngLat[]): LngLat {
  const count = points.length || 1;
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / count,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / count,
  };
}

export function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

export function pathTouchesBounds(path: LngLat[], bounds: AreaBounds) {
  return path.some((point) => contains(bounds, point.lat, point.lng));
}
