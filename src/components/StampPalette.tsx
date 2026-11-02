"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Plus, Star, Trash2, Upload } from "lucide-react";

import {
  BASIC_STAMPS,
  MATERIAL_SITES,
  allMaterialSites,
  getBasicStamp,
  loadCustomSites,
  saveCustomSites,
  type MaterialSite,
  type StoredCustomSite,
} from "@/data/stamps";
import { glyphInner } from "@/lib/glyphs";
import { useActiveTheme, useMapStore } from "@/store/mapStore";
import { MaterialCompareModal } from "@/components/MaterialCompareModal";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/svg+xml,.png,.jpg,.jpeg,.svg";
const FAV_KEY = "illust-map:fav-sites";

function isAllowedImage(file: File) {
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

export function StampPalette({ compact = false }: { compact?: boolean }) {
  const theme = useActiveTheme();
  const placeTool = useMapStore((state) => state.placeTool);
  const setPlaceTool = useMapStore((state) => state.setPlaceTool);
  const customStamps = useMapStore((state) => state.customStamps);
  const addCustomStamp = useMapStore((state) => state.addCustomStamp);
  const removeCustomStamp = useMapStore((state) => state.removeCustomStamp);
  const setMessage = useMapStore((state) => state.setMessage);

  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sitesOpen, setSitesOpen] = useState(!compact);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customSites, setCustomSites] = useState<MaterialSite[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
    setCustomSites(loadCustomSites());
  }, []);

  const persistCustom = (list: StoredCustomSite[]) => {
    saveCustomSites(list);
    setCustomSites(loadCustomSites());
  };

  const toggleFavorite = (siteId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const sites = useMemo(
    () => allMaterialSites(customSites),
    [customSites],
  );

  const sortedSites = useMemo(() => {
    return [...sites].sort((a, b) => {
      const af = favorites.includes(a.id) ? 0 : 1;
      const bf = favorites.includes(b.id) ? 0 : 1;
      if (af !== bf) return af - bf;
      // お気に入り以外は定義順（MATERIAL_SITES → custom）
      return 0;
    });
  }, [sites, favorites]);

  const ingestFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      let added = 0;
      for (const file of list) {
        if (!isAllowedImage(file)) {
          setMessage("PNG / JPEG / SVG のみ追加できます。");
          continue;
        }
        try {
          const imageUrl = await readFileAsDataUrl(file);
          const label = file.name.replace(/\.[^.]+$/, "") || "アップロード";
          addCustomStamp({ label, imageUrl });
          added += 1;
        } catch {
          setMessage("画像の読み込みに失敗しました。");
        }
      }
      if (added > 0) {
        setMessage(`${added}件追加。紙面にドロップ／クリックで配置できます。`);
      }
    },
    [addCustomStamp, setMessage],
  );

  const openSiteSearch = (siteId: string) => {
    const site = sites.find((item) => item.id === siteId);
    if (!site) return;
    const w = query.trim() || "イラスト";
    window.open(site.searchUrl(w), "_blank", "noopener,noreferrer");
  };

  const addCustomSite = () => {
    const homeUrl = newUrl.trim();
    const label = newLabel.trim() || homeUrl;
    if (!/^https?:\/\//i.test(homeUrl)) {
      setMessage("URLは https:// から入力してください。");
      return;
    }
    const stored: StoredCustomSite[] = [
      ...customSites
        .filter((s) => s.custom)
        .map((s) => ({ id: s.id, label: s.label, homeUrl: s.homeUrl })),
      {
        id: `custom-${crypto.randomUUID().slice(0, 8)}`,
        label,
        homeUrl,
      },
    ];
    persistCustom(stored);
    setNewLabel("");
    setNewUrl("");
    setMessage("サイトを追加しました。");
  };

  const removeCustomSite = (id: string) => {
    const stored = customSites
      .filter((s) => s.custom && s.id !== id)
      .map((s) => ({ id: s.id, label: s.label, homeUrl: s.homeUrl }));
    persistCustom(stored);
    setFavorites((prev) => prev.filter((fav) => fav !== id));
  };

  return (
    <section className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium opacity-80">フリー素材を探す</p>
          <button
            type="button"
            className="text-[10px] underline opacity-55"
            onClick={() => setSitesOpen((value) => !value)}
          >
            {sitesOpen ? "閉じる" : `${sites.length}サイト`}
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例: 桜"
          className="w-full rounded-2xl border bg-white/90 px-3 py-2 text-sm outline-none"
          style={{ borderColor: theme.colors.panelBorder, color: theme.colors.label }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (query.trim()) setCompareOpen(true);
              else openSiteSearch(MATERIAL_SITES[0].id);
            }
          }}
        />
        <button
          type="button"
          disabled={!query.trim()}
          onClick={() => setCompareOpen(true)}
          className="w-full rounded-2xl px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: theme.colors.accent }}
        >
          「{query.trim() || "キーワード"}」を全サイトで比較
        </button>

        {sitesOpen && (
          <>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-0.5">
              {sortedSites.map((site) => {
                const fav = favorites.includes(site.id);
                return (
                  <div key={site.id} className="flex items-stretch gap-1">
                    <button
                      type="button"
                      aria-label={fav ? "お気に入り解除" : "お気に入り"}
                      onClick={() => toggleFavorite(site.id)}
                      className="rounded-xl border bg-white/80 px-1.5"
                      style={{ borderColor: theme.colors.panelBorder }}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={fav ? "#FFB74D" : "none"}
                        color={fav ? "#FFB74D" : theme.colors.label}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSiteSearch(site.id)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border bg-white/80 px-2.5 py-1.5 text-left text-[11px] transition hover:bg-white"
                      style={{
                        borderColor: theme.colors.panelBorder,
                        color: theme.colors.label,
                      }}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {site.label}
                        {site.custom ? "（追加）" : ""}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-45" />
                    </button>
                    {site.custom && (
                      <button
                        type="button"
                        aria-label="削除"
                        onClick={() => removeCustomSite(site.id)}
                        className="rounded-xl border bg-white/80 px-1.5"
                        style={{ borderColor: theme.colors.panelBorder }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="space-y-1.5 rounded-2xl border border-dashed p-2"
              style={{ borderColor: theme.colors.panelBorder }}
            >
              <p className="text-[10px] font-medium opacity-70">サイトを追加</p>
              <input
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="表示名（任意）"
                className="w-full rounded-xl border bg-white px-2 py-1.5 text-[11px] outline-none"
                style={{ borderColor: theme.colors.panelBorder }}
              />
              <input
                value={newUrl}
                onChange={(event) => setNewUrl(event.target.value)}
                placeholder="https://example.com/"
                className="w-full rounded-xl border bg-white px-2 py-1.5 text-[11px] outline-none"
                style={{ borderColor: theme.colors.panelBorder }}
              />
              <button
                type="button"
                onClick={addCustomSite}
                className="flex w-full items-center justify-center gap-1 rounded-xl border bg-white/80 px-2 py-1.5 text-[11px]"
                style={{ borderColor: theme.colors.panelBorder }}
              >
                <Plus className="h-3 w-3" />
                URLを追加
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium opacity-80">画像をスタンプ追加</p>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (event.dataTransfer.files?.length) {
              void ingestFiles(event.dataTransfer.files);
            }
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-2 py-3 text-center"
          style={{
            borderColor: dragOver ? theme.colors.accent : theme.colors.panelBorder,
            backgroundColor: dragOver
              ? "rgba(255,138,101,0.12)"
              : "rgba(255,255,255,0.7)",
            color: theme.colors.label,
          }}
        >
          <Upload className="h-4 w-4 opacity-70" />
          <p className="text-[11px]">PNG / JPEG / SVG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                void ingestFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />
        </div>

        {customStamps.length > 0 && (
          <div className="grid grid-cols-3 gap-1">
            {customStamps.map((stamp) => {
              const active = placeTool === stamp.id;
              return (
                <div key={stamp.id} className="relative">
                  <button
                    type="button"
                    draggable
                    className="stamp-chip flex w-full flex-col items-center gap-0.5 rounded-xl border px-0.5 py-1.5 text-[9px]"
                    style={{
                      borderColor: theme.colors.panelBorder,
                      backgroundColor: active
                        ? theme.colors.accent
                        : "rgba(255,255,255,0.75)",
                      color: active ? "#fff" : theme.colors.label,
                    }}
                    onClick={() => setPlaceTool(active ? null : stamp.id)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "application/x-stamp-id",
                        stamp.id,
                      );
                      event.dataTransfer.setData("text/plain", stamp.id);
                      event.dataTransfer.effectAllowed = "copy";
                      setPlaceTool(stamp.id);
                    }}
                    title={stamp.label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stamp.imageUrl}
                      alt=""
                      className="h-8 w-8 object-contain"
                      draggable={false}
                    />
                    <span className="w-full truncate px-0.5">{stamp.label}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${stamp.label}を削除`}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-white shadow-sm"
                    style={{ borderColor: theme.colors.panelBorder }}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeCustomStamp(stamp.id);
                    }}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium opacity-80">基本シェイプ</p>
        <div className="grid grid-cols-5 gap-1">
          {BASIC_STAMPS.map((stamp) => {
            const active = placeTool === stamp.id;
            return (
              <button
                key={stamp.id}
                type="button"
                draggable
                title={stamp.label}
                className="stamp-chip flex flex-col items-center rounded-xl border px-0.5 py-1.5"
                style={{
                  borderColor: theme.colors.panelBorder,
                  backgroundColor: active
                    ? theme.colors.accent
                    : "rgba(255,255,255,0.75)",
                  color: active ? "#fff" : theme.colors.label,
                }}
                onClick={() => setPlaceTool(active ? null : stamp.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-stamp-id",
                    stamp.id,
                  );
                  event.dataTransfer.setData("text/plain", stamp.id);
                  event.dataTransfer.effectAllowed = "copy";
                  setPlaceTool(stamp.id);
                }}
              >
                <span
                  className="block h-7 w-7"
                  dangerouslySetInnerHTML={{
                    __html: `<svg viewBox="0 0 80 80" width="28" height="28">${glyphInner(stamp.glyphKey ?? "pin")}</svg>`,
                  }}
                />
              </button>
            );
          })}
        </div>
        {(placeTool &&
          (getBasicStamp(placeTool) ||
            customStamps.some((stamp) => stamp.id === placeTool) ||
            placeTool === "text")) && (
          <button
            type="button"
            className="text-[11px] underline opacity-60"
            onClick={() => setPlaceTool(null)}
          >
            配置モードを解除
          </button>
        )}
      </div>

      {compareOpen && query.trim() && (
        <MaterialCompareModal
          query={query.trim()}
          sites={sortedSites}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </section>
  );
}
