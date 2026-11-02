"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LatLng, type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useBuildIllustration } from "@/lib/buildIllustration";
import { contains, normalizeBounds } from "@/lib/geo";
import { fetchNearbyOsmPoi } from "@/lib/overpass";
import { normalizeThemeId, THEME_FILTERS } from "@/lib/themes";
import { useActiveTheme, useMapStore } from "@/store/mapStore";

const DEFAULT_CENTER: [number, number] = [35.6812, 139.7671];
const DEFAULT_ZOOM = 15;

const OSM_TILE = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;

function ThemeTileFilter({ filter }: { filter: string }) {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane) pane.style.filter = filter;
  }, [map, filter]);
  return null;
}

function FocusController() {
  const map = useMap();
  const focus = useMapStore((state) => state.focus);
  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], focus.zoom);
  }, [focus, map]);
  return null;
}

function ResizeFix({ layoutKey }: { layoutKey: string }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(timer);
  }, [layoutKey, map]);
  return null;
}

/** 右紙面の回転に合わせて左地図を視覚的に同じ向きへ */
function RotationSync() {
  const map = useMap();
  const mapRotation = useMapStore((state) => state.mapRotation);
  useEffect(() => {
    const pane = map.getPane("mapPane");
    if (!pane) return;
    pane.style.transformOrigin = "center center";
    pane.style.transition = "transform 160ms ease";
    pane.style.transform = `rotate(${mapRotation}deg)`;
  }, [map, mapRotation]);
  return null;
}

function RangeDrawer() {
  const map = useMap();
  const rangeMode = useMapStore((state) => state.rangeMode);
  const setRangeMode = useMapStore((state) => state.setRangeMode);
  const setBounds = useMapStore((state) => state.setBounds);
  const setDraftBounds = useMapStore((state) => state.setDraftBounds);

  useEffect(() => {
    const container = map.getContainer();
    if (rangeMode) {
      map.dragging.disable();
      container.style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      container.style.cursor = "";
    }
    return () => {
      map.dragging.enable();
      container.style.cursor = "";
    };
  }, [map, rangeMode]);

  useEffect(() => {
    if (!rangeMode) return;
    let start: LatLng | null = null;

    const onDown = (event: LeafletMouseEvent) => {
      start = event.latlng;
      setDraftBounds(
        normalizeBounds(
          { lat: event.latlng.lat, lng: event.latlng.lng },
          { lat: event.latlng.lat, lng: event.latlng.lng },
        ),
      );
    };
    const onMove = (event: LeafletMouseEvent) => {
      if (!start) return;
      setDraftBounds(
        normalizeBounds(
          { lat: start.lat, lng: start.lng },
          { lat: event.latlng.lat, lng: event.latlng.lng },
        ),
      );
    };
    const onUp = (event: LeafletMouseEvent) => {
      if (!start) return;
      const next = normalizeBounds(
        { lat: start.lat, lng: start.lng },
        { lat: event.latlng.lat, lng: event.latlng.lng },
      );
      start = null;
      const tooSmall =
        next.north - next.south < 0.0012 || next.east - next.west < 0.0012;
      setDraftBounds(null);
      if (tooSmall) return;
      setBounds(next);
      setRangeMode(false);
    };

    map.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);
    return () => {
      map.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
    };
  }, [map, rangeMode, setBounds, setDraftBounds, setRangeMode]);

  return null;
}

function SpotPicker() {
  const theme = useActiveTheme();
  const phase = useMapStore((state) => state.phase);
  const bounds = useMapStore((state) => state.bounds);
  const rangeMode = useMapStore((state) => state.rangeMode);
  const spots = useMapStore((state) => state.spots);
  const selectedSpotId = useMapStore((state) => state.selectedSpotId);
  const addSpot = useMapStore((state) => state.addSpot);
  const updateSpot = useMapStore((state) => state.updateSpot);
  const moveSpot = useMapStore((state) => state.moveSpot);
  const pushHistory = useMapStore((state) => state.pushHistory);
  const selectSpot = useMapStore((state) => state.selectSpot);
  const setMessage = useMapStore((state) => state.setMessage);

  const icons = useMemo(() => {
    const make = (selected: boolean) =>
      L.divIcon({
        className: "pin-marker",
        html: `<div style="width:${selected ? 18 : 14}px;height:${selected ? 18 : 14}px;border-radius:999px;background:${selected ? theme.colors.accent : "#C4785A"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>`,
        iconSize: selected ? [18, 18] : [14, 14],
        iconAnchor: selected ? [9, 9] : [7, 7],
      });
    return { normal: make(false), selected: make(true) };
  }, [theme.colors.accent]);

  useMapEvents({
    click(event) {
      if (rangeMode || phase !== "ready" || !bounds) return;
      const { lat, lng } = event.latlng;
      if (!contains(bounds, lat, lng)) {
        setMessage("選んだ範囲の中をクリックしてください。");
        return;
      }

      const spotId = addSpot({
        category: "pin",
        name: "スポット",
        note: "",
        lat,
        lng,
        kind: "place",
        stampId: "shape-pin",
        scale: 1,
      });

      void (async () => {
        try {
          const poi = await fetchNearbyOsmPoi(lat, lng, 45);
          if (!poi) return;
          const inside = contains(bounds, poi.lat, poi.lng);
          updateSpot(spotId, {
            category: poi.category,
            name: poi.name || "スポット",
            lat: inside ? poi.lat : lat,
            lng: inside ? poi.lng : lng,
          });
        } catch {
          // pin already placed
        }
      })();
    },
  });

  return (
    <>
      {spots.map((spot) => {
        const selected = spot.id === selectedSpotId;
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            draggable={phase === "ready" && !rangeMode}
            icon={selected ? icons.selected : icons.normal}
            eventHandlers={{
              click: (event) => {
                event.originalEvent.stopPropagation();
                selectSpot(spot.id);
              },
              dragstart: () => {
                pushHistory();
                selectSpot(spot.id);
              },
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                moveSpot(spot.id, lat, lng);
              },
            }}
          />
        );
      })}
    </>
  );
}

export function MapComponent() {
  const theme = useActiveTheme();
  const themeId = useMapStore((state) => state.themeId);
  const phase = useMapStore((state) => state.phase);
  const bounds = useMapStore((state) => state.bounds);
  const draftBounds = useMapStore((state) => state.draftBounds);
  const rangeMode = useMapStore((state) => state.rangeMode);
  const { build, busy } = useBuildIllustration();
  const frame = draftBounds ?? bounds;
  const filter = THEME_FILTERS[normalizeThemeId(themeId)];

  return (
    <div className="map-paper relative h-full w-full overflow-hidden">
      <MapContainer
        key="illust-map"
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ background: theme.colors.background }}
        doubleClickZoom={false}
        scrollWheelZoom
        maxZoom={19}
      >
        <TileLayer
          attribution={OSM_TILE.attribution}
          url={OSM_TILE.url}
          maxZoom={19}
        />
        <ThemeTileFilter filter={filter} />
        <FocusController />
        <ResizeFix layoutKey={phase} />
        <RotationSync />
        <RangeDrawer />
        <SpotPicker />
        {frame && (
          <Rectangle
            bounds={[
              [frame.south, frame.west],
              [frame.north, frame.east],
            ]}
            pathOptions={{
              color: theme.colors.accent,
              weight: 2,
              dashArray: "6 4",
              fillColor: theme.colors.accent,
              fillOpacity: 0.12,
            }}
            interactive={false}
          />
        )}
      </MapContainer>

      <div
        className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[280px] rounded-full px-3 py-1 text-[11px] shadow-sm"
        style={{
          backgroundColor: `${theme.colors.pinBg}ee`,
          color: theme.colors.label,
          border: `1px solid ${theme.colors.panelBorder}`,
        }}
      >
        {rangeMode
          ? "ドラッグして範囲を囲んでください"
          : phase === "ready"
            ? "範囲内をクリックでピン追加"
            : "住所検索のあと、範囲を選んでください"}
      </div>

      {bounds && phase === "map" && !rangeMode && (
        <button
          type="button"
          onClick={() => void build()}
          disabled={busy}
          className="absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2 rounded-full px-5 py-3 text-sm text-white shadow-lg disabled:opacity-60"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {busy ? "作成中…" : "この範囲でベースを作成"}
        </button>
      )}
    </div>
  );
}
