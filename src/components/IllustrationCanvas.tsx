"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { resolveStamp } from "@/data/stamps";
import { glyphInner } from "@/lib/glyphs";
import { fontCss, MAP_FONTS, normalizeFontId, type MapFontId } from "@/lib/fonts";
import {
  clientToSvg,
  normalizeBounds,
  project,
  ringPath,
  toPath,
  unproject,
  viewForLayout,
} from "@/lib/geo";
import { normalizeThemeId, resolveIllustInk } from "@/lib/themes";
import { useMapStore } from "@/store/mapStore";
import type { IllustSpot } from "@/types/illustration";

function isAllowedImageFile(file: File) {
  const type = file.type.toLowerCase();
  if (
    type === "image/png" ||
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/svg+xml"
  ) {
    return true;
  }
  return /\.(png|jpe?g|svg)$/i.test(file.name);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function IllustrationCanvas() {
  const themeId = useMapStore((state) => state.themeId);
  const bounds = useMapStore((state) => state.bounds);
  const paths = useMapStore((state) => state.paths);
  const areas = useMapStore((state) => state.areas);
  const spots = useMapStore((state) => state.spots);
  const customStamps = useMapStore((state) => state.customStamps);
  const selectedSpotId = useMapStore((state) => state.selectedSpotId);
  const editingSpotId = useMapStore((state) => state.editingSpotId);
  const setEditingSpotId = useMapStore((state) => state.setEditingSpotId);
  const selectedPathId = useMapStore((state) => state.selectedPathId);
  const selectedAreaId = useMapStore((state) => state.selectedAreaId);
  const selectPath = useMapStore((state) => state.selectPath);
  const selectArea = useMapStore((state) => state.selectArea);
  const removePath = useMapStore((state) => state.removePath);
  const removeArea = useMapStore((state) => state.removeArea);
  const title = useMapStore((state) => state.title);
  const setTitle = useMapStore((state) => state.setTitle);
  const subtitle = useMapStore((state) => state.subtitle);
  const setSubtitle = useMapStore((state) => state.setSubtitle);
  const titleScale = useMapStore((state) => state.titleScale);
  const setTitleScale = useMapStore((state) => state.setTitleScale);
  const titleFontId = useMapStore((state) => state.titleFontId);
  const setTitleFontId = useMapStore((state) => state.setTitleFontId);
  const titleSelected = useMapStore((state) => state.titleSelected);
  const titleVisible = useMapStore((state) => state.titleVisible);
  const selectTitle = useMapStore((state) => state.selectTitle);
  const removeTitle = useMapStore((state) => state.removeTitle);
  const placeTool = useMapStore((state) => state.placeTool);
  const selectSpot = useMapStore((state) => state.selectSpot);
  const moveSpot = useMapStore((state) => state.moveSpot);
  const addSpot = useMapStore((state) => state.addSpot);
  const addCustomStamp = useMapStore((state) => state.addCustomStamp);
  const replaceNearbyPinWithStamp = useMapStore(
    (state) => state.replaceNearbyPinWithStamp,
  );
  const updateSpot = useMapStore((state) => state.updateSpot);
  const removeSpot = useMapStore((state) => state.removeSpot);
  const mapRotation = useMapStore((state) => state.mapRotation);
  const setMapRotation = useMapStore((state) => state.setMapRotation);
  const resetMapRotation = useMapStore((state) => state.resetMapRotation);
  const viewZoom = useMapStore((state) => state.viewZoom);
  const setViewZoom = useMapStore((state) => state.setViewZoom);
  const sheetLayout = useMapStore((state) => state.sheetLayout);
  const illustCropMode = useMapStore((state) => state.illustCropMode);
  const setIllustCropMode = useMapStore((state) => state.setIllustCropMode);
  const cropToBounds = useMapStore((state) => state.cropToBounds);
  const setMessage = useMapStore((state) => state.setMessage);

  const view = useMemo(() => viewForLayout(sheetLayout), [sheetLayout]);
  const ink = resolveIllustInk(themeId);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [cropRect, setCropRect] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);

  const selected = useMemo(
    () => spots.find((spot) => spot.id === selectedSpotId) ?? null,
    [spots, selectedSpotId],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (titleSelected) {
        event.preventDefault();
        removeTitle();
        return;
      }
      if (selectedPathId) {
        event.preventDefault();
        removePath(selectedPathId);
        return;
      }
      if (selectedAreaId) {
        event.preventDefault();
        removeArea(selectedAreaId);
        return;
      }
      if (selectedSpotId) {
        event.preventDefault();
        removeSpot(selectedSpotId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    removeArea,
    removePath,
    removeSpot,
    removeTitle,
    selectedAreaId,
    selectedPathId,
    selectedSpotId,
    titleSelected,
  ]);

  if (!bounds) return null;

  const innerW = view.w - view.padL - view.padR;
  const innerH = view.h - view.padT - view.padB;
  const titleText = title || "イラスト道案内";
  const titleWidth = Math.max(220, titleText.length * 28 + 48);
  const northAngle = -mapRotation;
  const paper = ink.paper;
  const themeKey = normalizeThemeId(themeId);
  // 表示ズームは CSS scale。書き出し用の実寸は固定のまま
  const sheetWidth = Math.round((520 * view.w) / 800);

  const clearSelection = () => {
    selectSpot(null);
    selectPath(null);
    selectArea(null);
    setEditingSpotId(null);
    setEditingTitle(false);
  };

  const pushHistory = useMapStore((state) => state.pushHistory);

  const startDrag = (spot: IllustSpot, event: React.PointerEvent<SVGGElement>) => {
    if (editingSpotId === spot.id || illustCropMode) return;
    event.stopPropagation();
    event.preventDefault();
    selectSpot(spot.id);
    setDragMoved(false);
    const target = event.currentTarget;
    const svg = target.ownerSVGElement;
    if (!svg) return;
    target.setPointerCapture?.(event.pointerId);
    let historyPushed = false;

    const move = (pointer: PointerEvent) => {
      if (!historyPushed) {
        pushHistory();
        historyPushed = true;
      }
      setDragMoved(true);
      const local = clientToSvg(svg, pointer.clientX, pointer.clientY);
      const next = unproject(local.x, local.y, bounds, mapRotation, view);
      moveSpot(spot.id, next.lat, next.lng);
    };
    const up = (pointer: PointerEvent) => {
      try {
        target.releasePointerCapture?.(pointer.pointerId);
      } catch {
        // ignore
      }
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      setTimeout(() => setDragMoved(false), 0);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };

  const placeStampAt = (stampId: string, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg || !bounds) return;
    const stamp = resolveStamp(stampId, customStamps);
    if (!stamp) return;
    const local = clientToSvg(svg, clientX, clientY);
    const next = unproject(local.x, local.y, bounds, mapRotation, view);
    replaceNearbyPinWithStamp(next.lat, next.lng, {
      category: stamp.glyphKey ?? "upload",
      name: "",
      note: "",
      lat: next.lat,
      lng: next.lng,
      decoration: true,
      kind: "stamp",
      stampId: stamp.id,
      imageUrl: stamp.imageUrl,
      scale: 1,
    });
  };

  const placeAt = (event: React.PointerEvent<SVGRectElement>) => {
    if (illustCropMode) return;
    if (!placeTool) {
      clearSelection();
      return;
    }
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const local = clientToSvg(svg, event.clientX, event.clientY);
    const next = unproject(local.x, local.y, bounds, mapRotation, view);
    if (placeTool === "text") {
      addSpot({
        category: "text",
        name: "テキスト",
        note: "",
        lat: next.lat,
        lng: next.lng,
        kind: "text",
        scale: 1,
        fontId: "yomogi",
      });
      return;
    }
    const stamp = resolveStamp(placeTool, customStamps);
    if (stamp) {
      replaceNearbyPinWithStamp(next.lat, next.lng, {
        category: stamp.glyphKey ?? "upload",
        name: "",
        note: "",
        lat: next.lat,
        lng: next.lng,
        decoration: true,
        kind: "stamp",
        stampId: stamp.id,
        imageUrl: stamp.imageUrl,
        scale: 1,
      });
      return;
    }
    addSpot({
      category: placeTool,
      name: "",
      note: "",
      lat: next.lat,
      lng: next.lng,
      decoration: true,
      kind: "deco",
      scale: 1,
    });
  };

  const beginEditSpot = (spot: IllustSpot) => {
    selectSpot(spot.id);
    setEditingSpotId(spot.id);
  };

  const placeImageFileAt = async (
    file: File,
    clientX: number,
    clientY: number,
  ) => {
    const svg = svgRef.current;
    if (!svg || !bounds || !isAllowedImageFile(file)) {
      setMessage("PNG / JPEG / SVG をドロップしてください。");
      return;
    }
    try {
      const imageUrl = await readFileAsDataUrl(file);
      const label = file.name.replace(/\.[^.]+$/, "") || "アップロード";
      const stampId = addCustomStamp({ label, imageUrl });
      const local = clientToSvg(svg, clientX, clientY);
      const next = unproject(local.x, local.y, bounds, mapRotation, view);
      replaceNearbyPinWithStamp(next.lat, next.lng, {
        category: "upload",
        name: "",
        note: "",
        lat: next.lat,
        lng: next.lng,
        decoration: true,
        kind: "stamp",
        stampId,
        imageUrl,
        scale: 1,
      });
    } catch {
      setMessage("画像の読み込みに失敗しました。");
    }
  };

  const onPaperPointerDown = (event: React.PointerEvent<SVGRectElement>) => {
    if (illustCropMode) {
      event.stopPropagation();
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;
      const local = clientToSvg(svg, event.clientX, event.clientY);
      setCropRect({
        x0: local.x,
        y0: local.y,
        x1: local.x,
        y1: local.y,
      });
      const move = (pointer: PointerEvent) => {
        const pt = clientToSvg(svg, pointer.clientX, pointer.clientY);
        setCropRect((prev) =>
          prev
            ? { ...prev, x1: pt.x, y1: pt.y }
            : { x0: local.x, y0: local.y, x1: pt.x, y1: pt.y },
        );
      };
      const up = (pointer: PointerEvent) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        setCropRect((prev) => {
          if (!prev) return null;
          const pt = clientToSvg(svg, pointer.clientX, pointer.clientY);
          const x1 = pt.x;
          const y1 = pt.y;
          const nw = unproject(prev.x0, prev.y0, bounds, mapRotation, view);
          const se = unproject(x1, y1, bounds, mapRotation, view);
          const next = normalizeBounds(nw, se);
          cropToBounds(next);
          setIllustCropMode(false);
          return null;
        });
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      return;
    }
    placeAt(event);
  };

  const selectedHud = selected
    ? (() => {
        const pos = project(selected.lng, selected.lat, bounds, mapRotation, view);
        return {
          left: (pos.x / view.w) * 100,
          top: (pos.y / view.h) * 100,
        };
      })()
    : null;

  const cropPreview =
    cropRect &&
    (() => {
      const x = Math.min(cropRect.x0, cropRect.x1);
      const y = Math.min(cropRect.y0, cropRect.y1);
      const w = Math.abs(cropRect.x1 - cropRect.x0);
      const h = Math.abs(cropRect.y1 - cropRect.y0);
      return { x, y, w, h };
    })();

  const sheetCursor = illustCropMode
    ? "crosshair"
    : placeTool
      ? "crosshair"
      : "default";

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center overflow-auto p-3"
      style={{
        backgroundColor: themeKey === "watercolor" ? "#EFE8DE" : "#F0F0F0",
      }}
    >
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
        <ControlButton label="拡大" onClick={() => setViewZoom(viewZoom + 0.35)}>
          <Plus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="縮小" onClick={() => setViewZoom(viewZoom - 0.35)}>
          <Minus className="h-4 w-4" />
        </ControlButton>
        <ControlButton
          label="左に回転"
          onClick={() => setMapRotation(mapRotation - 15)}
        >
          <RotateCcw className="h-4 w-4" />
        </ControlButton>
        <ControlButton
          label="右に回転"
          onClick={() => setMapRotation(mapRotation + 15)}
        >
          <RotateCw className="h-4 w-4" />
        </ControlButton>
      </div>

      <div
        className="relative my-auto shrink-0"
        style={{
          width: sheetWidth * viewZoom,
          height: (sheetWidth * viewZoom * view.h) / view.w,
        }}
      >
        <div
          style={{
            width: sheetWidth,
            height: (sheetWidth * view.h) / view.w,
            transform: `scale(${viewZoom})`,
            transformOrigin: "top left",
          }}
        >
        <div
          id="illustration-sheet"
          className="relative h-full w-full shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          style={{
            backgroundColor: paper,
            border: "1px solid #E5E5E5",
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (files?.length) {
              void placeImageFileAt(files[0], event.clientX, event.clientY);
              return;
            }
            const stampId =
              event.dataTransfer.getData("application/x-stamp-id") ||
              event.dataTransfer.getData("text/plain");
            if (stampId && !stampId.startsWith("http")) {
              placeStampAt(stampId, event.clientX, event.clientY);
            }
          }}
        >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${view.w} ${view.h}`}
          className="h-full w-full"
          role="img"
          aria-label="イラスト道案内"
          style={{
            background: paper,
            cursor: sheetCursor,
            fontFamily: fontCss(titleFontId),
          }}
        >
          <defs>
            {ink.showGrid && (
              <pattern
                id="retro-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke={ink.gridColor}
                  strokeWidth="1"
                />
              </pattern>
            )}
          </defs>

          <rect
            data-paper="true"
            width={view.w}
            height={view.h}
            fill={paper}
            onPointerDown={onPaperPointerDown}
          />
          {ink.showGrid && (
            <rect
              width={view.w}
              height={view.h}
              fill="url(#retro-grid)"
              pointerEvents="none"
            />
          )}

          <clipPath id="map-clip">
            <rect
              x={view.padL - 8}
              y={view.padT - 6}
              width={innerW + 16}
              height={innerH + 12}
            />
          </clipPath>

          <g clipPath="url(#map-clip)">
            {areas
              .filter((area) => area.kind === "park")
              .map((area) => {
                const selectedArea = area.id === selectedAreaId;
                return (
                  <path
                    key={area.id}
                    d={ringPath(area.ring, bounds, mapRotation, view)}
                    fill={ink.park}
                    opacity={0.82}
                    stroke={selectedArea ? ink.roadMajor : ink.ink}
                    strokeOpacity={selectedArea ? 0.55 : 0.12}
                    strokeWidth={selectedArea ? 3 : 1}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectArea(area.id);
                    }}
                  />
                );
              })}

            {paths
              .filter((path) => path.kind === "river")
              .map((path) => {
                const selectedPath = path.id === selectedPathId;
                const w = selectedPath ? ink.riverWidth * 1.75 : ink.riverWidth;
                return (
                  <path
                    key={path.id}
                    d={toPath(path.points, bounds, mapRotation, true, view)}
                    fill="none"
                    stroke={ink.water}
                    strokeWidth={w}
                    strokeLinecap={ink.linecap}
                    strokeLinejoin="round"
                    opacity={0.92}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectPath(path.id);
                    }}
                  />
                );
              })}

            {paths
              .filter((path) => path.kind === "road" && path.roadClass !== "major")
              .map((path) => {
                const selectedPath = path.id === selectedPathId;
                const w = selectedPath ? ink.roadWidth * 1.75 : ink.roadWidth;
                return (
                  <path
                    key={path.id}
                    d={toPath(path.points, bounds, mapRotation, true, view)}
                    fill="none"
                    stroke={ink.road}
                    strokeWidth={w}
                    strokeLinecap={ink.linecap}
                    strokeLinejoin="round"
                    opacity={0.95}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectPath(path.id);
                    }}
                  />
                );
              })}

            {paths
              .filter((path) => path.kind === "road" && path.roadClass === "major")
              .map((path) => {
                const selectedPath = path.id === selectedPathId;
                const w = selectedPath ? ink.majorWidth * 1.75 : ink.majorWidth;
                return (
                  <path
                    key={path.id}
                    d={toPath(path.points, bounds, mapRotation, true, view)}
                    fill="none"
                    stroke={ink.roadMajor}
                    strokeWidth={w}
                    strokeLinecap={ink.linecap}
                    strokeLinejoin="round"
                    opacity={0.95}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectPath(path.id);
                    }}
                  />
                );
              })}

            {paths
              .filter((path) => path.kind === "rail")
              .map((path) => {
                const selectedPath = path.id === selectedPathId;
                const w = selectedPath ? ink.railWidth * 1.75 : ink.railWidth;
                return (
                  <path
                    key={path.id}
                    d={toPath(path.points, bounds, mapRotation, true, view)}
                    fill="none"
                    stroke={ink.rail}
                    strokeWidth={w}
                    strokeDasharray="7 5"
                    strokeLinecap={ink.linecap}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectPath(path.id);
                    }}
                  />
                );
              })}
          </g>

          {spots.map((spot) => {
            const pos = project(spot.lng, spot.lat, bounds, mapRotation, view);
            const isSelected = spot.id === selectedSpotId;
            const editing = spot.id === editingSpotId;
            const scale = spot.scale ?? 1;
            const rotation = spot.rotation ?? 0;
            const textOnly =
              spot.kind === "text" ||
              spot.kind === "road-label" ||
              spot.kind === "park-label";
            const stamp = spot.stampId
              ? resolveStamp(spot.stampId, customStamps)
              : undefined;
            const imageUrl = spot.imageUrl || stamp?.imageUrl || undefined;
            const hasIcon =
              !textOnly &&
              Boolean(
                imageUrl ||
                  stamp?.glyphKey ||
                  spot.category ||
                  spot.kind === "stamp" ||
                  spot.kind === "deco" ||
                  spot.kind === "place" ||
                  spot.decoration,
              );
            const nameUnderIcon =
              hasIcon &&
              (spot.kind === "stamp" ||
                spot.kind === "deco" ||
                spot.kind === "place" ||
                spot.decoration);
            const showName = Boolean(spot.name) && !editing;
            return (
              <g
                key={spot.id}
                id={`spot-${spot.id}`}
                transform={`translate(${pos.x} ${pos.y}) rotate(${rotation}) scale(${scale})`}
                onPointerDown={(event) => startDrag(spot, event)}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  beginEditSpot(spot);
                }}
                style={{ cursor: "grab", touchAction: "none" }}
              >
                {/* 掴みやすい透明ヒット領域 */}
                <rect
                  x={textOnly ? -70 : -42}
                  y={textOnly ? -24 : -78}
                  width={textOnly ? 140 : 84}
                  height={textOnly ? 48 : 110}
                  fill="transparent"
                />
                {isSelected && (
                  <>
                    <ellipse
                      cx={0}
                      cy={textOnly ? -4 : -28}
                      rx={
                        textOnly
                          ? Math.max(46, (spot.name?.length || 4) * 9)
                          : 44
                      }
                      ry={textOnly ? 18 : 40}
                      fill={ink.roadMajor}
                      opacity={0.32}
                    />
                    <circle
                      cx={0}
                      cy={textOnly ? -4 : -36}
                      r={textOnly ? 0 : 10}
                      fill="none"
                      stroke={ink.roadMajor}
                      strokeWidth={3}
                      opacity={0.9}
                    />
                  </>
                )}
                {!textOnly &&
                  (() => {
                    if (imageUrl) {
                      return (
                        <image
                          href={imageUrl}
                          x={-36}
                          y={-72}
                          width={72}
                          height={72}
                          preserveAspectRatio="xMidYMid meet"
                          style={{ pointerEvents: "none" }}
                        />
                      );
                    }
                    const glyphKey = stamp?.glyphKey ?? spot.category;
                    return (
                      <g
                        transform="translate(-32 -68) scale(0.8)"
                        dangerouslySetInnerHTML={{
                          __html: glyphInner(glyphKey),
                        }}
                      />
                    );
                  })()}
                {(showName || (nameUnderIcon && spot.name)) && (
                  <text
                    y={textOnly ? 0 : nameUnderIcon || hasIcon ? 18 : 16}
                    textAnchor="middle"
                    fontSize={
                      textOnly
                        ? spot.kind === "text"
                          ? 22
                          : 15
                        : spot.name.length > 12
                          ? 13
                          : 15
                    }
                    fill={ink.ink}
                    fontWeight={600}
                    stroke={ink.paper}
                    strokeWidth={4}
                    paintOrder="stroke"
                    style={{ fontFamily: fontCss(spot.fontId) }}
                  >
                    {spot.name}
                  </text>
                )}
                {editing && (
                  <foreignObject
                    x={-110}
                    y={textOnly ? -28 : nameUnderIcon || hasIcon ? -4 : -8}
                    width={220}
                    height={64}
                  >
                    <div
                      className="flex flex-col gap-1"
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <input
                        autoFocus
                        value={spot.name}
                        onChange={(event) =>
                          updateSpot(spot.id, { name: event.target.value })
                        }
                        onBlur={(event) => {
                          const next = event.relatedTarget as HTMLElement | null;
                          if (next?.dataset?.spotFontSelect === spot.id) return;
                          setEditingSpotId(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") setEditingSpotId(null);
                          if (event.key === "Escape") setEditingSpotId(null);
                          event.stopPropagation();
                        }}
                        className="h-8 w-full rounded-md border-2 border-[#2563EB] bg-white px-2 text-center text-sm shadow outline-none"
                        style={{
                          fontFamily: fontCss(spot.fontId),
                          color: ink.ink,
                        }}
                        placeholder="名前を入力"
                      />
                      <select
                        data-spot-font-select={spot.id}
                        value={normalizeFontId(spot.fontId)}
                        onChange={(event) =>
                          updateSpot(spot.id, {
                            fontId: normalizeFontId(
                              event.target.value,
                            ) as MapFontId,
                          })
                        }
                        className="h-7 w-full rounded border border-[#E5E5E5] bg-white px-1 text-[11px]"
                      >
                        {MAP_FONTS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </foreignObject>
                )}
                {spot.note &&
                  !nameUnderIcon &&
                  spot.kind !== "road-label" &&
                  spot.kind !== "park-label" &&
                  !editing && (
                    <text
                      y={textOnly ? 22 : 34}
                      textAnchor="middle"
                      fontSize={12}
                      fill={ink.ink}
                      opacity={0.7}
                      style={{ fontFamily: fontCss(spot.fontId) }}
                    >
                      {spot.note}
                    </text>
                  )}
              </g>
            );
          })}

          <g
            transform={`translate(78 78) rotate(${northAngle})`}
            style={{ cursor: "pointer" }}
            onPointerDown={(event) => {
              event.stopPropagation();
              resetMapRotation();
            }}
          >
            <circle r="16" fill="#fff" stroke={ink.ink} strokeWidth="1.6" />
            <path d="M0 -12 L4 3 L0 0 L-4 3 Z" fill={ink.roadMajor} />
            <text y="-22" textAnchor="middle" fontSize="12" fill={ink.ink}>
              N
            </text>
          </g>

          {titleVisible && (
            <g
              transform={`translate(${view.w / 2} 62) scale(${titleScale})`}
              onPointerDown={(event) => {
                event.stopPropagation();
                selectTitle();
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                selectTitle();
                setEditingTitle(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={-titleWidth / 2}
                y={-36}
                width={titleWidth}
                height={subtitle || editingTitle ? 78 : 52}
                rx={12}
                fill={ink.paper}
                stroke={titleSelected ? ink.roadMajor : "transparent"}
                strokeWidth={2}
              />
              {!editingTitle ? (
                <>
                  <text
                    textAnchor="middle"
                    y={0}
                    fill={ink.ink}
                    fontSize={titleText.length > 16 ? 28 : 36}
                    fontWeight={700}
                    style={{ fontFamily: fontCss(titleFontId) }}
                  >
                    {titleText}
                  </text>
                  {subtitle && (
                    <text
                      y={28}
                      textAnchor="middle"
                      fill={ink.ink}
                      fontSize={16}
                      opacity={0.75}
                      style={{ fontFamily: fontCss(titleFontId) }}
                    >
                      {subtitle}
                    </text>
                  )}
                </>
              ) : (
                <foreignObject
                  x={-titleWidth / 2}
                  y={-30}
                  width={titleWidth}
                  height={70}
                >
                  <div className="flex flex-col gap-1 px-2">
                    <input
                      autoFocus
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setEditingTitle(false);
                        event.stopPropagation();
                      }}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="h-8 w-full rounded border border-[#2563EB] bg-white px-2 text-center text-sm font-bold outline-none"
                      style={{ color: ink.ink, fontFamily: fontCss(titleFontId) }}
                      placeholder="タイトル"
                    />
                    <input
                      value={subtitle}
                      onChange={(event) => setSubtitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setEditingTitle(false);
                        event.stopPropagation();
                      }}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="h-7 w-full rounded border border-[#E5E5E5] bg-white px-2 text-center text-xs outline-none"
                      style={{ color: ink.ink, fontFamily: fontCss(titleFontId) }}
                      placeholder="サブタイトル"
                    />
                  </div>
                </foreignObject>
              )}
            </g>
          )}

          {cropPreview && cropPreview.w > 2 && cropPreview.h > 2 && (
            <rect
              x={cropPreview.x}
              y={cropPreview.y}
              width={cropPreview.w}
              height={cropPreview.h}
              fill={ink.roadMajor}
              fillOpacity={0.12}
              stroke={ink.roadMajor}
              strokeWidth={2}
              strokeDasharray="6 4"
              pointerEvents="none"
            />
          )}
        </svg>

        {selected && selectedHud && !editingSpotId && (
          <div
            data-export-hide="true"
            className="absolute z-30 -translate-x-1/2"
            style={{
              left: `${selectedHud.left}%`,
              top: `calc(${selectedHud.top}% + 12px)`,
            }}
          >
            <div className="flex max-w-[min(100vw-2rem,420px)] flex-wrap items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white/95 px-3 py-1.5 shadow-md">
              <label className="flex items-center gap-1.5 text-[10px] text-[#404040]">
                大きさ
                <input
                  type="range"
                  min={0.45}
                  max={2.6}
                  step={0.05}
                  value={selected.scale ?? 1}
                  onChange={(event) =>
                    updateSpot(selected.id, {
                      scale: Number(event.target.value),
                    })
                  }
                  className="w-16"
                  onPointerDown={(event) => event.stopPropagation()}
                />
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-[#404040]">
                回転
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selected.rotation ?? 0}
                  onChange={(event) =>
                    updateSpot(selected.id, {
                      rotation: Number(event.target.value),
                    })
                  }
                  className="w-16"
                  onPointerDown={(event) => event.stopPropagation()}
                />
              </label>
              <label className="flex items-center gap-1 text-[10px] text-[#404040]">
                名前フォント
                <select
                  value={normalizeFontId(selected.fontId)}
                  onChange={(event) =>
                    updateSpot(selected.id, {
                      fontId: normalizeFontId(event.target.value) as MapFontId,
                    })
                  }
                  className="max-w-[100px] rounded border border-[#E5E5E5] bg-white px-1 py-0.5 text-[10px]"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {MAP_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded px-2 py-0.5 text-[10px] text-[#404040] underline"
                onClick={() => beginEditSpot(selected)}
              >
                名前を編集
              </button>
              <button
                type="button"
                aria-label="削除"
                title="Deleteキーでも削除できます"
                className="flex items-center gap-1 rounded-md bg-[#EF4444] px-2.5 py-1 text-[11px] text-white"
                onClick={() => removeSpot(selected.id)}
              >
                <Trash2 className="h-3 w-3" />
                削除
              </button>
            </div>
          </div>
        )}

        {titleSelected && titleVisible && !editingTitle && !selected && (
          <div
            data-export-hide="true"
            className="absolute left-1/2 top-[7%] z-30 -translate-x-1/2"
          >
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white/95 px-3 py-1.5 shadow-md">
              <label className="flex items-center gap-1.5 text-[10px] text-[#404040]">
                タイトル大きさ
                <input
                  type="range"
                  min={0.6}
                  max={2.2}
                  step={0.05}
                  value={titleScale}
                  onChange={(event) =>
                    setTitleScale(Number(event.target.value))
                  }
                  className="w-20"
                />
              </label>
              <label className="flex items-center gap-1 text-[10px] text-[#404040]">
                字体
                <select
                  value={titleFontId}
                  onChange={(event) =>
                    setTitleFontId(normalizeFontId(event.target.value))
                  }
                  className="max-w-[100px] rounded border border-[#E5E5E5] bg-white px-1 py-0.5 text-[10px]"
                >
                  {MAP_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded px-2 py-0.5 text-[10px] text-[#404040] underline"
                onClick={() => setEditingTitle(true)}
              >
                編集
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md bg-[#EF4444] px-2.5 py-1 text-[11px] text-white"
                onClick={() => removeTitle()}
              >
                <Trash2 className="h-3 w-3" />
                削除
              </button>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>

      {illustCropMode && (
        <p
          data-export-hide="true"
          className="pointer-events-none mt-2 text-center text-xs text-[#525252]"
        >
          用紙上をドラッグして表示範囲を切り取り
        </p>
      )}
      {placeTool && !illustCropMode && (
        <p
          data-export-hide="true"
          className="pointer-events-none mt-2 text-center text-xs text-[#525252]"
        >
          {placeTool === "text"
            ? "クリックでテキスト追加 / ダブルクリックで編集"
            : "スタンプを置く場所をクリック"}
        </p>
      )}
      {!placeTool && !illustCropMode && !dragMoved && !selected && (
        <p
          data-export-hide="true"
          className="pointer-events-none mt-2 text-center text-[11px] text-[#737373]"
        >
          スタンプはドラッグで移動 · ダブルクリックで名前編集 · Deleteで削除
        </p>
      )}
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white/95 text-[#171717] shadow-sm hover:bg-[#FAFAFA]"
      style={{
        borderColor: "currentColor",
        opacity: 0.9,
      }}
    >
      {children}
    </button>
  );
}
