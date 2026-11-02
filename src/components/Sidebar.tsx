"use client";

import {
  Download,
  Link2,
  Palette,
  Save,
  Search,
  SquareDashedMousePointer,
  Type,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { StampPalette } from "@/components/StampPalette";
import { resolveStamp } from "@/data/stamps";
import { useBuildIllustration } from "@/lib/buildIllustration";
import {
  exportPptx,
  exportRaster,
  exportSvg,
} from "@/lib/exportIllustration";
import {
  createShareUrl,
  loadDraft,
  saveDraft,
} from "@/lib/mapShare";
import { THEME_LIST } from "@/lib/themes";
import { useActiveTheme, useMapStore } from "@/store/mapStore";
import type { ThemeId } from "@/types/map";

interface SearchHit {
  label: string;
  lat: number;
  lng: number;
}

export function Sidebar() {
  const theme = useActiveTheme();
  const themeId = useMapStore((state) => state.themeId);
  const setTheme = useMapStore((state) => state.setTheme);
  const flyTo = useMapStore((state) => state.flyTo);
  const setTitle = useMapStore((state) => state.setTitle);
  const rangeMode = useMapStore((state) => state.rangeMode);
  const setRangeMode = useMapStore((state) => state.setRangeMode);
  const bounds = useMapStore((state) => state.bounds);
  const phase = useMapStore((state) => state.phase);
  const title = useMapStore((state) => state.title);
  const subtitle = useMapStore((state) => state.subtitle);
  const titleScale = useMapStore((state) => state.titleScale);
  const mapRotation = useMapStore((state) => state.mapRotation);
  const placeTool = useMapStore((state) => state.placeTool);
  const setPlaceTool = useMapStore((state) => state.setPlaceTool);
  const message = useMapStore((state) => state.message);
  const setMessage = useMapStore((state) => state.setMessage);
  const resetIllustration = useMapStore((state) => state.resetIllustration);
  const hydrateFromMapData = useMapStore((state) => state.hydrateFromMapData);
  const paths = useMapStore((state) => state.paths);
  const spots = useMapStore((state) => state.spots);
  const customStamps = useMapStore((state) => state.customStamps);
  const selectedSpotId = useMapStore((state) => state.selectedSpotId);
  const selectSpot = useMapStore((state) => state.selectSpot);
  const sheetLayout = useMapStore((state) => state.sheetLayout);
  const setSheetLayout = useMapStore((state) => state.setSheetLayout);
  const illustCropMode = useMapStore((state) => state.illustCropMode);
  const setIllustCropMode = useMapStore((state) => state.setIllustCropMode);
  const undo = useMapStore((state) => state.undo);
  const pastLength = useMapStore((state) => state.past.length);
  const { build, busy, canBuild } = useBuildIllustration();
  const toMapData = useMapStore((state) => state.toMapData);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [draftHint, setDraftHint] = useState<string | null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);

  // 自動途中保存（編集中のみ）
  useEffect(() => {
    if (phase !== "ready") return;
    const timer = window.setInterval(() => {
      const data = useMapStore.getState().toMapData();
      if (!data) return;
      const result = saveDraft(data);
      if (result.ok) {
        setDraftHint(
          `自動保存 ${new Date(result.savedAt).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        );
      }
    }, 45000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const chooseHit = (hit: SearchHit, keepList = false) => {
    flyTo(hit.lat, hit.lng, 16);
    const short = hit.label.split(",")[0]?.trim();
    if (short) setTitle(`${short} 道案内`);
    if (!keepList) setHits([]);
  };

  const search = async () => {
    const text = query.trim();
    if (!text) return;
    setSearching(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`);
      const data = (await response.json()) as SearchHit[] | { error?: string };
      const list = Array.isArray(data) ? data : [];
      setHits(list);
      // 先頭候補へ即ジャンプ（候補リストは残して差し替え可能）
      if (list[0]) chooseHit(list[0], true);
      else setMessage("場所が見つかりませんでした。");
    } catch {
      setHits([]);
      setMessage("場所検索に失敗しました。");
    } finally {
      setSearching(false);
    }
  };

  const saveNow = () => {
    const data = toMapData();
    if (!data) {
      setMessage("先にイラストを作成してください。");
      return;
    }
    const result = saveDraft(data);
    if (result.ok) {
      setDraftHint(
        `保存しました ${new Date(result.savedAt).toLocaleTimeString("ja-JP")}`,
      );
      setMessage("途中保存しました。次回起動時に復元できます。");
    } else {
      setMessage("保存に失敗しました（容量不足の可能性）。");
    }
  };

  const restoreDraft = () => {
    const draft = loadDraft();
    if (!draft) {
      setMessage("保存データがありません。");
      return;
    }
    hydrateFromMapData(draft.data);
    const { bounds: b } = draft.data;
    flyTo((b.south + b.north) / 2, (b.west + b.east) / 2, 15);
    setDraftHint(
      `復元: ${new Date(draft.savedAt).toLocaleString("ja-JP")}`,
    );
    setMessage("途中保存から復元しました。");
  };

  const runExport = async (kind: "png" | "jpeg" | "svg" | "pptx") => {
    if (!bounds) return;
    setExporting(kind);
    try {
      if (kind === "svg") exportSvg();
      else if (kind === "pptx") {
        await exportPptx({
          themeId,
          bounds,
          paths,
          spots,
          title,
          subtitle,
          titleScale,
          mapRotation,
        });
      } else await exportRaster(kind);
    } catch (error) {
      console.error(error);
      alert("書き出しに失敗しました。");
    } finally {
      setExporting(null);
    }
  };

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col gap-4 overflow-y-auto border-r px-3 py-4"
      style={{
        backgroundColor: theme.colors.panel,
        borderColor: theme.colors.panelBorder,
        color: theme.colors.label,
      }}
    >
      <header className="flex items-start justify-between gap-2">
        <h1 className="text-lg font-semibold leading-snug tracking-tight">
          イラスト道案内
        </h1>
        <button
          type="button"
          title="Ctrl+Z"
          disabled={pastLength === 0}
          onClick={() => undo()}
          className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-35"
          style={{ borderColor: theme.colors.panelBorder }}
        >
          <Undo2 className="h-3.5 w-3.5" />
          戻す
        </button>
      </header>

      <section className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium opacity-75">
          <Search className="h-3.5 w-3.5" />
          場所
        </label>
        <div className="flex gap-1.5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void search();
            }}
            placeholder="代官山 など"
            className="min-w-0 flex-1 rounded-lg border bg-white/70 px-2.5 py-1.5 text-sm outline-none"
            style={{ borderColor: theme.colors.panelBorder }}
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={searching}
            className="rounded-lg px-2.5 text-sm text-white disabled:opacity-60"
            style={{ backgroundColor: theme.colors.accent }}
          >
            {searching ? "…" : "検索"}
          </button>
        </div>
        {hits.length > 0 && (
          <ul className="max-h-28 space-y-1 overflow-y-auto">
            {hits.map((hit) => (
              <li key={`${hit.lat}-${hit.lng}`}>
                <button
                  type="button"
                  onClick={() => chooseHit(hit)}
                  className="w-full rounded-lg bg-white/60 px-2 py-1 text-left text-[10px] leading-snug hover:bg-white"
                >
                  {hit.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium opacity-75">
          <SquareDashedMousePointer className="h-3.5 w-3.5" />
          範囲
        </label>
        <button
          type="button"
          onClick={() => setRangeMode(!rangeMode)}
          className="w-full rounded-lg border px-2.5 py-1.5 text-sm"
          style={{
            borderColor: theme.colors.panelBorder,
            backgroundColor: rangeMode
              ? theme.colors.accent
              : "rgba(255,255,255,0.55)",
            color: rangeMode ? "#fff" : theme.colors.label,
          }}
        >
          {rangeMode ? "ドラッグ中…" : "範囲を選ぶ"}
        </button>
        <button
          type="button"
          onClick={() => void build()}
          disabled={!canBuild || busy}
          className="w-full rounded-lg px-2.5 py-2 text-sm text-white disabled:opacity-40"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {busy
            ? "取得中…"
            : phase === "ready"
              ? "ベースを更新"
              : "ベースを作成"}
        </button>
      </section>

      <section className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-medium opacity-75">
          <Palette className="h-3.5 w-3.5" />
          テーマ
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {THEME_LIST.map((item) => {
            const active =
              themeId === item.id ||
              (themeId === "retro" && item.id === "picturebook");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id as ThemeId)}
                className="rounded-lg border px-2.5 py-2 text-center text-xs font-medium transition"
                style={{
                  borderColor: active
                    ? theme.colors.accent
                    : theme.colors.panelBorder,
                  backgroundColor: active
                    ? theme.colors.accent
                    : "rgba(255,255,255,0.55)",
                  color: active ? "#fff" : theme.colors.label,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {phase === "ready" && (
        <>
          <section className="space-y-1.5">
            <p className="text-[11px] font-medium opacity-75">紙面</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ["portrait", "縦"],
                  ["landscape", "横"],
                ] as const
              ).map(([id, label]) => {
                const active = sheetLayout === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSheetLayout(id)}
                    className="rounded-lg border px-2 py-1.5 text-[11px]"
                    style={{
                      borderColor: active
                        ? theme.colors.accent
                        : theme.colors.panelBorder,
                      backgroundColor: active
                        ? theme.colors.accent
                        : "rgba(255,255,255,0.55)",
                      color: active ? "#fff" : theme.colors.label,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setIllustCropMode(!illustCropMode)}
              className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
              style={{
                borderColor: theme.colors.panelBorder,
                backgroundColor: illustCropMode
                  ? theme.colors.accent
                  : "rgba(255,255,255,0.55)",
                color: illustCropMode ? "#fff" : theme.colors.label,
              }}
            >
              {illustCropMode ? "範囲絞り中…（紙面でドラッグ）" : "紙面で範囲を絞る"}
            </button>
            <button
              type="button"
              onClick={() => setPlaceTool(placeTool === "text" ? null : "text")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm"
              style={{
                borderColor: theme.colors.panelBorder,
                backgroundColor:
                  placeTool === "text"
                    ? theme.colors.accent
                    : "rgba(255,255,255,0.55)",
                color: placeTool === "text" ? "#fff" : theme.colors.label,
              }}
            >
              <Type className="h-3.5 w-3.5" />
              テキスト
            </button>
            <button
              type="button"
              onClick={() => setMaterialsOpen((value) => !value)}
              className="w-full rounded-lg border bg-white/55 px-2.5 py-1.5 text-left text-xs"
              style={{ borderColor: theme.colors.panelBorder }}
            >
              {materialsOpen ? "▼" : "▶"} 素材・スタンプ
            </button>
            {materialsOpen && <StampPalette compact />}
          </section>

          {spots.length > 0 && (
            <section className="space-y-1.5">
              <p className="text-[11px] font-medium opacity-75">
                スポット（{spots.length}）
              </p>
              <ul className="max-h-36 space-y-1 overflow-y-auto">
                {spots.map((spot, index) => {
                  const label =
                    spot.name ||
                    (spot.stampId
                      ? resolveStamp(spot.stampId, customStamps)?.label
                      : null) ||
                    spot.category ||
                    `スポット ${index + 1}`;
                  const active = spot.id === selectedSpotId;
                  return (
                    <li key={spot.id}>
                      <button
                        type="button"
                        onClick={() => selectSpot(spot.id)}
                        className="w-full truncate rounded-lg border px-2 py-1.5 text-left text-[11px]"
                        style={{
                          borderColor: active
                            ? theme.colors.accent
                            : theme.colors.panelBorder,
                          backgroundColor: active
                            ? theme.colors.accent
                            : "rgba(255,255,255,0.55)",
                          color: active ? "#fff" : theme.colors.label,
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[10px] opacity-50">
                クリックで右側のピンをハイライト
              </p>
            </section>
          )}

          <section className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium opacity-75">
              <Save className="h-3.5 w-3.5" />
              保存
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={saveNow}
                className="rounded-lg border bg-white/55 px-2 py-1.5 text-xs"
                style={{ borderColor: theme.colors.panelBorder }}
              >
                途中保存
              </button>
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-lg border bg-white/55 px-2 py-1.5 text-xs"
                style={{ borderColor: theme.colors.panelBorder }}
              >
                復元
              </button>
            </div>
            {draftHint && (
              <p className="text-[10px] opacity-50">{draftHint}</p>
            )}
            <button
              type="button"
              onClick={async () => {
                const data = toMapData();
                if (!data) return;
                const result = createShareUrl(data);
                setShareUrl(result.url);
                try {
                  await navigator.clipboard.writeText(result.url);
                } catch {
                  // ignore
                }
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border bg-white/55 px-2 py-1.5 text-xs"
              style={{ borderColor: theme.colors.panelBorder }}
            >
              <Link2 className="h-3 w-3" />
              共有リンク
            </button>
            {shareUrl && (
              <p className="break-all text-[9px] leading-relaxed opacity-60">
                {shareUrl}
              </p>
            )}
          </section>

          <section className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium opacity-75">
              <Download className="h-3.5 w-3.5" />
              書き出し
            </p>
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  ["png", "PNG"],
                  ["jpeg", "JPG"],
                  ["svg", "SVG"],
                  ["pptx", "PPT"],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={Boolean(exporting)}
                  onClick={() => void runExport(kind)}
                  className="rounded-lg border bg-white/55 px-2 py-1.5 text-[11px] disabled:opacity-50"
                  style={{ borderColor: theme.colors.panelBorder }}
                >
                  {exporting === kind ? "…" : label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetIllustration}
              className="text-[10px] underline opacity-45"
            >
              やり直す
            </button>
          </section>
        </>
      )}

      {phase !== "ready" && (
        <button
          type="button"
          onClick={restoreDraft}
          className="rounded-lg border bg-white/55 px-2.5 py-2 text-xs"
          style={{ borderColor: theme.colors.panelBorder }}
        >
          途中保存から復元
        </button>
      )}

      {message && (
        <p className="rounded-lg bg-white/70 px-2.5 py-2 text-[11px] leading-relaxed">
          {message}
        </p>
      )}
    </aside>
  );
}
