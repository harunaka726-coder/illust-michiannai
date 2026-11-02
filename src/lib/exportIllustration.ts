"use client";

import html2canvas from "html2canvas";
import PptxGenJS from "pptxgenjs";
import { glyphSvgDocument } from "@/lib/glyphs";
import { project, VIEW } from "@/lib/geo";
import { resolveIllustInk } from "@/lib/themes";
import type { ThemeId } from "@/types/map";
import type {
  AreaBounds,
  IllustPath,
  IllustSpot,
} from "@/types/illustration";

const SLIDE_W = 8;
const SLIDE_H = 10.4;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function sheetElement() {
  return document.getElementById("illustration-sheet");
}

export async function exportRaster(kind: "png" | "jpeg") {
  const sheet = sheetElement();
  if (!sheet) return;
  const canvas = await html2canvas(sheet, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
    ignoreElements: (element) =>
      element instanceof HTMLElement &&
      element.dataset.exportHide === "true",
  });
  const mime = kind === "jpeg" ? "image/jpeg" : "image/png";
  const dataUrl = canvas.toDataURL(mime, 0.92);
  const response = await fetch(dataUrl);
  downloadBlob(await response.blob(), `illust-map.${kind === "jpeg" ? "jpg" : "png"}`);
}

export function exportSvg() {
  const svg = sheetElement()?.querySelector("svg");
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(VIEW.w));
  clone.setAttribute("height", String(VIEW.h));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  downloadBlob(new Blob([xml], { type: "image/svg+xml" }), "illust-map.svg");
}

async function rasterizeGlyph(category: string) {
  const svg = glyphSvgDocument(category, 160);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 160;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, 160, 160);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function slidePoint(
  lng: number,
  lat: number,
  bounds: AreaBounds,
  rotation = 0,
) {
  const { x, y } = project(lng, lat, bounds, rotation);
  return {
    x: (x / VIEW.w) * SLIDE_W,
    y: (y / VIEW.h) * SLIDE_H,
  };
}

export async function exportPptx(options: {
  themeId: ThemeId;
  bounds: AreaBounds;
  paths: IllustPath[];
  spots: IllustSpot[];
  title: string;
  subtitle: string;
  titleScale?: number;
  mapRotation?: number;
}) {
  const rotation = options.mapRotation ?? 0;
  const ink = resolveIllustInk(options.themeId);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "ILLUST", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "ILLUST";
  pptx.title = options.title || "イラストマップ";

  const slide = pptx.addSlide();
  slide.background = { color: ink.paper.replace("#", "") };

  slide.addText(options.title || "イラストマップ", {
    x: 0.4,
    y: 0.22,
    w: SLIDE_W - 0.8,
    h: 0.48,
    align: "center",
    fontFace: "Yu Gothic",
    fontSize: Math.round(28 * (options.titleScale ?? 1)),
    bold: true,
    color: ink.ink.replace("#", ""),
  });
  if (options.subtitle) {
    slide.addText(options.subtitle, {
      x: 0.4,
      y: 0.68,
      w: SLIDE_W - 0.8,
      h: 0.28,
      align: "center",
      fontFace: "Yu Gothic",
      fontSize: 14,
      color: ink.ink.replace("#", ""),
    });
  }

  for (const path of options.paths) {
    const color =
      path.kind === "river"
        ? ink.water
        : path.kind === "rail"
          ? ink.rail
          : path.roadClass === "major"
            ? ink.roadMajor
            : ink.road;
    const width = path.kind === "river" ? 4.5 : path.roadClass === "major" ? 3.25 : 2;
    for (let index = 1; index < path.points.length; index += 1) {
      const start = slidePoint(
        path.points[index - 1].lng,
        path.points[index - 1].lat,
        options.bounds,
        rotation,
      );
      const end = slidePoint(
        path.points[index].lng,
        path.points[index].lat,
        options.bounds,
        rotation,
      );
      const box = {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        w: Math.max(Math.abs(end.x - start.x), 0.01),
        h: Math.max(Math.abs(end.y - start.y), 0.01),
      };
      const against =
        (end.x - start.x) * (end.y - start.y) < 0;
      slide.addShape("line", {
        ...box,
        flipH: against,
        line: {
          color: color.replace("#", ""),
          width,
          dashType: path.kind === "rail" ? "dash" : "solid",
        },
      });
    }
  }

  for (const spot of options.spots) {
    const pos = slidePoint(spot.lng, spot.lat, options.bounds, rotation);
    const scale = spot.scale ?? 1;
    const textOnly = spot.kind === "text" || spot.kind === "road-label";
    if (!textOnly) {
      const image = await rasterizeGlyph(spot.category);
      if (image) {
        const size = 0.76 * scale;
        slide.addImage({
          data: image,
          x: pos.x - size / 2,
          y: pos.y - size,
          w: size,
          h: size,
        });
      }
    }
    if (spot.name && spot.kind !== "deco") {
      slide.addText(spot.name, {
        x: pos.x - 0.9,
        y: pos.y + 0.02,
        w: 1.8,
        h: 0.28,
        align: "center",
        fontFace: "Yu Gothic",
        fontSize: Math.round((spot.kind === "text" ? 16 : 11) * scale),
        bold: true,
        color: ink.ink.replace("#", ""),
      });
    }
    if (spot.note) {
      slide.addText(spot.note, {
        x: pos.x - 1,
        y: pos.y + 0.28,
        w: 2,
        h: 0.24,
        align: "center",
        fontFace: "Yu Gothic",
        fontSize: 10,
        color: ink.ink.replace("#", ""),
      });
    }
  }

  const output = (await pptx.write({ outputType: "blob" })) as Blob;
  downloadBlob(output, "illust-map.pptx");
}
