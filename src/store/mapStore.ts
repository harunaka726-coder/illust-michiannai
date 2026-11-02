"use client";

import { create } from "zustand";
import {
  normalizeFontId,
  type MapFontId,
} from "@/lib/fonts";
import {
  contains,
  intersectBounds,
  pathTouchesBounds,
  type SheetLayout,
} from "@/lib/geo";
import { MAP_DATA_VERSION, type MapData } from "@/lib/mapShare";
import { normalizeThemeId, THEMES } from "@/lib/themes";
import type {
  AreaBounds,
  CustomStamp,
  IllustArea,
  IllustPath,
  IllustSpot,
  LandmarkSeed,
  PlaceTool,
} from "@/types/illustration";
import type { ThemeId } from "@/types/map";

interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
  token: number;
}

/** Undo 用スナップショット（編集対象の主要状態） */
interface HistorySnapshot {
  paths: IllustPath[];
  areas: IllustArea[];
  spots: IllustSpot[];
  customStamps: CustomStamp[];
  title: string;
  subtitle: string;
  titleVisible: boolean;
  titleScale: number;
  titleFontId: MapFontId;
  mapRotation: number;
  bounds: AreaBounds | null;
  sheetLayout: SheetLayout;
}

interface MapStore {
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;

  focus: MapFocus | null;
  flyTo: (lat: number, lng: number, zoom?: number) => void;

  rangeMode: boolean;
  setRangeMode: (value: boolean) => void;
  draftBounds: AreaBounds | null;
  setDraftBounds: (bounds: AreaBounds | null) => void;
  bounds: AreaBounds | null;
  setBounds: (bounds: AreaBounds | null) => void;

  paths: IllustPath[];
  areas: IllustArea[];
  setBaseMap: (
    paths: IllustPath[],
    areas: IllustArea[],
    landmarks?: LandmarkSeed[],
  ) => void;
  removePath: (id: string) => void;
  removeArea: (id: string) => void;
  selectedPathId: string | null;
  selectedAreaId: string | null;
  selectPath: (id: string | null) => void;
  selectArea: (id: string | null) => void;
  cropToBounds: (next: AreaBounds) => void;

  spots: IllustSpot[];
  selectedSpotId: string | null;
  editingSpotId: string | null;
  addSpot: (spot: Omit<IllustSpot, "id">) => string;
  updateSpot: (id: string, patch: Partial<IllustSpot>) => void;
  moveSpot: (id: string, lat: number, lng: number) => void;
  removeSpot: (id: string) => void;
  selectSpot: (id: string | null) => void;
  setEditingSpotId: (id: string | null) => void;
  /** 近くのピン（place）をスタンプで置換 */
  replaceNearbyPinWithStamp: (
    lat: number,
    lng: number,
    stamp: Omit<IllustSpot, "id">,
  ) => string;

  title: string;
  subtitle: string;
  titleScale: number;
  titleFontId: MapFontId;
  titleSelected: boolean;
  titleVisible: boolean;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setTitleScale: (scale: number) => void;
  setTitleFontId: (fontId: MapFontId) => void;
  selectTitle: () => void;
  removeTitle: () => void;

  placeTool: PlaceTool | null;
  setPlaceTool: (tool: PlaceTool | null) => void;

  customStamps: CustomStamp[];
  addCustomStamp: (stamp: Omit<CustomStamp, "id"> & { id?: string }) => string;
  removeCustomStamp: (id: string) => void;

  mapRotation: number;
  setMapRotation: (deg: number) => void;
  resetMapRotation: () => void;
  viewZoom: number;
  setViewZoom: (zoom: number) => void;

  sheetLayout: SheetLayout;
  setSheetLayout: (layout: SheetLayout) => void;

  illustCropMode: boolean;
  setIllustCropMode: (value: boolean) => void;

  phase: "map" | "ready";
  busy: boolean;
  setBusy: (busy: boolean) => void;
  message: string | null;
  setMessage: (message: string | null) => void;
  resetIllustration: () => void;
  hydrateFromMapData: (data: MapData) => void;
  toMapData: () => MapData | null;

  past: HistorySnapshot[];
  pushHistory: () => void;
  undo: () => void;
  canUndo: () => boolean;
}

function takeSnapshot(state: {
  paths: IllustPath[];
  areas: IllustArea[];
  spots: IllustSpot[];
  customStamps: CustomStamp[];
  title: string;
  subtitle: string;
  titleVisible: boolean;
  titleScale: number;
  titleFontId: MapFontId;
  mapRotation: number;
  bounds: AreaBounds | null;
  sheetLayout: SheetLayout;
}): HistorySnapshot {
  return {
    paths: structuredClone(state.paths),
    areas: structuredClone(state.areas),
    spots: structuredClone(state.spots),
    customStamps: structuredClone(state.customStamps),
    title: state.title,
    subtitle: state.subtitle,
    titleVisible: state.titleVisible,
    titleScale: state.titleScale,
    titleFontId: state.titleFontId,
    mapRotation: state.mapRotation,
    bounds: state.bounds ? { ...state.bounds } : null,
    sheetLayout: state.sheetLayout,
  };
}

export const useMapStore = create<MapStore>((set, get) => ({
  themeId: "watercolor",
  setTheme: (themeId) => set({ themeId: normalizeThemeId(themeId) }),

  past: [],
  pushHistory: () => {
    const state = get();
    const snap = takeSnapshot(state);
    set({ past: [...state.past.slice(-39), snap] });
  },
  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const prev = state.past[state.past.length - 1];
    set({
      past: state.past.slice(0, -1),
      paths: prev.paths,
      areas: prev.areas,
      spots: prev.spots,
      customStamps: prev.customStamps,
      title: prev.title,
      subtitle: prev.subtitle,
      titleVisible: prev.titleVisible,
      titleScale: prev.titleScale,
      titleFontId: prev.titleFontId,
      mapRotation: prev.mapRotation,
      bounds: prev.bounds,
      sheetLayout: prev.sheetLayout,
      selectedSpotId: null,
      selectedPathId: null,
      selectedAreaId: null,
      editingSpotId: null,
      titleSelected: false,
      message: "ひとつ前に戻しました",
    });
  },
  canUndo: () => get().past.length > 0,

  focus: null,
  flyTo: (lat, lng, zoom = 16) =>
    set((state) => ({
      focus: { lat, lng, zoom, token: (state.focus?.token ?? 0) + 1 },
    })),

  rangeMode: false,
  setRangeMode: (rangeMode) =>
    set({ rangeMode, placeTool: null, illustCropMode: false }),
  draftBounds: null,
  setDraftBounds: (draftBounds) => set({ draftBounds }),
  bounds: null,
  setBounds: (bounds) => set({ bounds, phase: "map", message: null }),

  paths: [],
  areas: [],
  selectedPathId: null,
  selectedAreaId: null,
  setBaseMap: (paths, areas) =>
    set((state) => ({
      paths,
      areas,
      phase: "ready",
      spots: state.spots.filter((spot) => !spot.auto),
      selectedPathId: null,
      selectedAreaId: null,
    })),
  removePath: (id) => {
    get().pushHistory();
    set((state) => ({
      paths: state.paths.filter((path) => path.id !== id),
      selectedPathId: state.selectedPathId === id ? null : state.selectedPathId,
    }));
  },
  removeArea: (id) => {
    get().pushHistory();
    set((state) => ({
      areas: state.areas.filter((area) => area.id !== id),
      selectedAreaId: state.selectedAreaId === id ? null : state.selectedAreaId,
    }));
  },
  selectPath: (selectedPathId) =>
    set({
      selectedPathId,
      selectedAreaId: null,
      selectedSpotId: null,
      titleSelected: false,
      editingSpotId: null,
    }),
  selectArea: (selectedAreaId) =>
    set({
      selectedAreaId,
      selectedPathId: null,
      selectedSpotId: null,
      titleSelected: false,
      editingSpotId: null,
    }),
  cropToBounds: (next) => {
    const state = get();
    if (!state.bounds) return;
    const clipped = intersectBounds(state.bounds, next);
    if (!clipped) {
      set({ message: "範囲が無効です。" });
      return;
    }
    get().pushHistory();
    set({
      bounds: clipped,
      paths: state.paths.filter((path) =>
        pathTouchesBounds(path.points, clipped),
      ),
      areas: state.areas.filter((area) =>
        pathTouchesBounds(area.ring, clipped),
      ),
      spots: state.spots.filter((spot) =>
        contains(clipped, spot.lat, spot.lng),
      ),
      selectedPathId: null,
      selectedAreaId: null,
      illustCropMode: false,
      message: "範囲を絞りました。",
    });
  },

  spots: [],
  selectedSpotId: null,
  editingSpotId: null,
  addSpot: (spot) => {
    get().pushHistory();
    let createdId = crypto.randomUUID();
    set((state) => {
      const duplicate =
        spot.name &&
        spot.name !== "スポット" &&
        !spot.decoration &&
        spot.kind !== "stamp"
          ? state.spots.find(
              (item) =>
                item.name === spot.name &&
                Math.abs(item.lat - spot.lat) < 0.00025 &&
                Math.abs(item.lng - spot.lng) < 0.00025,
            )
          : undefined;
      if (duplicate) {
        createdId = duplicate.id;
        return { selectedSpotId: duplicate.id };
      }
      return {
        spots: [
          ...state.spots,
          {
            ...spot,
            id: createdId,
            scale: spot.scale ?? 1,
            rotation: spot.rotation ?? 0,
            kind:
              spot.kind ??
              (spot.stampId || spot.decoration ? "stamp" : "place"),
            fontId: normalizeFontId(spot.fontId),
          },
        ],
        selectedSpotId: createdId,
        editingSpotId: spot.kind === "text" ? createdId : null,
        titleSelected: false,
        selectedPathId: null,
        selectedAreaId: null,
        placeTool: null,
      };
    });
    return createdId;
  },
  updateSpot: (id, patch) => {
    // 連続入力は履歴を増やしすぎない（名前編集など）
    const significant =
      "scale" in patch ||
      "rotation" in patch ||
      "lat" in patch ||
      "lng" in patch ||
      "imageUrl" in patch ||
      "stampId" in patch;
    if (significant) get().pushHistory();
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === id
          ? {
              ...spot,
              ...patch,
              id: spot.id,
              fontId: patch.fontId
                ? normalizeFontId(patch.fontId)
                : spot.fontId,
            }
          : spot,
      ),
    }));
  },
  moveSpot: (id, lat, lng) =>
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === id ? { ...spot, lat, lng } : spot,
      ),
    })),
  removeSpot: (id) => {
    get().pushHistory();
    set((state) => ({
      spots: state.spots.filter((spot) => spot.id !== id),
      selectedSpotId: state.selectedSpotId === id ? null : state.selectedSpotId,
      editingSpotId: state.editingSpotId === id ? null : state.editingSpotId,
    }));
  },
  selectSpot: (selectedSpotId) =>
    set({
      selectedSpotId,
      titleSelected: false,
      editingSpotId: null,
      selectedPathId: null,
      selectedAreaId: null,
    }),
  setEditingSpotId: (editingSpotId) => set({ editingSpotId }),
  replaceNearbyPinWithStamp: (lat, lng, stamp) => {
    get().pushHistory();
    const state = get();
    const nearbyPins = state.spots.filter(
      (spot) =>
        (spot.kind === "place" || spot.stampId === "shape-pin") &&
        Math.hypot(spot.lat - lat, spot.lng - lng) < 0.00045,
    );
    const target = nearbyPins[0];
    const placeLat = target?.lat ?? lat;
    const placeLng = target?.lng ?? lng;
    // addSpot でも history を積むので、ここではピン削除だけ行い addSpot の二重履歴を避ける
    if (nearbyPins.length) {
      set({
        spots: state.spots.filter(
          (spot) => !nearbyPins.some((pin) => pin.id === spot.id),
        ),
        past: state.past, // pushHistory 済みを維持
      });
    }
    // addSpot 内の pushHistory を一時スキップするため直接追加
    let createdId = crypto.randomUUID();
    set((s) => ({
      spots: [
        ...s.spots,
        {
          ...stamp,
          id: createdId,
          lat: placeLat,
          lng: placeLng,
          name: stamp.name || target?.name || "",
          scale: stamp.scale ?? 1,
          rotation: stamp.rotation ?? 0,
          kind: stamp.kind ?? "stamp",
          fontId: normalizeFontId(stamp.fontId),
        },
      ],
      selectedSpotId: createdId,
      placeTool: null,
      titleSelected: false,
      selectedPathId: null,
      selectedAreaId: null,
    }));
    return createdId;
  },

  title: "イラスト道案内",
  subtitle: "",
  titleScale: 1,
  titleFontId: "yomogi",
  titleSelected: false,
  titleVisible: true,
  setTitle: (title) => set({ title, titleVisible: true }),
  setSubtitle: (subtitle) => set({ subtitle }),
  setTitleScale: (titleScale) => set({ titleScale }),
  setTitleFontId: (titleFontId) =>
    set({ titleFontId: normalizeFontId(titleFontId) }),
  selectTitle: () =>
    set({
      titleSelected: true,
      selectedSpotId: null,
      editingSpotId: null,
      selectedPathId: null,
      selectedAreaId: null,
    }),
  removeTitle: () => {
    get().pushHistory();
    set({
      title: "",
      subtitle: "",
      titleVisible: false,
      titleSelected: false,
    });
  },

  placeTool: null,
  setPlaceTool: (placeTool) =>
    set({ placeTool, rangeMode: false, illustCropMode: false }),

  customStamps: [],
  addCustomStamp: (stamp) => {
    get().pushHistory();
    const id = stamp.id ?? `upload-${crypto.randomUUID()}`;
    set((state) => ({
      customStamps: [
        ...state.customStamps,
        { id, label: stamp.label, imageUrl: stamp.imageUrl },
      ],
      placeTool: id,
      rangeMode: false,
    }));
    return id;
  },
  removeCustomStamp: (id) => {
    get().pushHistory();
    set((state) => ({
      customStamps: state.customStamps.filter((stamp) => stamp.id !== id),
      placeTool: state.placeTool === id ? null : state.placeTool,
    }));
  },

  mapRotation: 0,
  setMapRotation: (mapRotation) => {
    let deg = mapRotation % 360;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    set({ mapRotation: deg });
  },
  resetMapRotation: () => {
    if (get().mapRotation === 0) return;
    get().pushHistory();
    set({ mapRotation: 0 });
  },
  viewZoom: 1,
  setViewZoom: (viewZoom) =>
    set({ viewZoom: Math.min(8, Math.max(0.4, viewZoom)) }),

  sheetLayout: "portrait",
  setSheetLayout: (sheetLayout) => set({ sheetLayout }),

  illustCropMode: false,
  setIllustCropMode: (illustCropMode) =>
    set({
      illustCropMode,
      placeTool: null,
      rangeMode: false,
    }),

  phase: "map",
  busy: false,
  setBusy: (busy) => set({ busy }),
  message: null,
  setMessage: (message) => set({ message }),
  resetIllustration: () =>
    set({
      bounds: null,
      draftBounds: null,
      paths: [],
      areas: [],
      spots: [],
      selectedSpotId: null,
      editingSpotId: null,
      selectedPathId: null,
      selectedAreaId: null,
      phase: "map",
      placeTool: null,
      rangeMode: false,
      illustCropMode: false,
      message: null,
      title: "イラスト道案内",
      subtitle: "",
      titleScale: 1,
      titleFontId: "yomogi",
      titleSelected: false,
      titleVisible: true,
      mapRotation: 0,
      viewZoom: 1,
      customStamps: [],
      sheetLayout: "portrait",
    }),

  hydrateFromMapData: (data) =>
    set({
      themeId: normalizeThemeId(data.themeId),
      title: data.title,
      subtitle: data.subtitle,
      titleScale: data.titleScale ?? 1,
      titleFontId: normalizeFontId(data.titleFontId),
      titleVisible: data.titleVisible ?? Boolean(data.title),
      mapRotation: data.mapRotation ?? 0,
      bounds: data.bounds,
      paths: data.paths ?? [],
      areas: data.areas ?? [],
      spots: (data.spots ?? []).map((spot) => ({
        ...spot,
        id: spot.id || crypto.randomUUID(),
        fontId: normalizeFontId(spot.fontId),
        rotation: spot.rotation ?? 0,
      })),
      customStamps: data.customStamps ?? [],
      sheetLayout: data.sheetLayout ?? "portrait",
      phase: "ready",
      selectedSpotId: null,
      editingSpotId: null,
      titleSelected: false,
      placeTool: null,
      rangeMode: false,
      draftBounds: null,
      message: "共有マップを読み込みました。編集して再共有できます。",
      viewZoom: 1,
    }),

  toMapData: (): MapData | null => {
    const state = get();
    if (!state.bounds) return null;
    return {
      version: MAP_DATA_VERSION,
      themeId: state.themeId,
      title: state.title,
      subtitle: state.subtitle,
      titleScale: state.titleScale,
      titleFontId: state.titleFontId,
      titleVisible: state.titleVisible,
      mapRotation: state.mapRotation,
      bounds: state.bounds,
      paths: state.paths,
      areas: state.areas,
      spots: state.spots,
      customStamps: state.customStamps,
      sheetLayout: state.sheetLayout,
    };
  },
}));

export function useActiveTheme() {
  const themeId = useMapStore((state) => state.themeId);
  return THEMES[normalizeThemeId(themeId)];
}
