"use client";

import { useEffect, useRef } from "react";
import { ClientMap } from "@/components/ClientMap";
import { IllustrationCanvas } from "@/components/IllustrationCanvas";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Sidebar } from "@/components/Sidebar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { loadDraft, readSharedMapFromLocation } from "@/lib/mapShare";
import { useActiveTheme, useMapStore } from "@/store/mapStore";

export default function HomePage() {
  const theme = useActiveTheme();
  const phase = useMapStore((state) => state.phase);
  const hydrateFromMapData = useMapStore((state) => state.hydrateFromMapData);
  const flyTo = useMapStore((state) => state.flyTo);
  const setMessage = useMapStore((state) => state.setMessage);
  const undo = useMapStore((state) => state.undo);
  const hydrated = useRef(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod || event.key.toLowerCase() !== "z" || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const shared = readSharedMapFromLocation(window.location.search);
    if (shared) {
      hydrateFromMapData(shared.data);
      const { bounds } = shared.data;
      flyTo(
        (bounds.south + bounds.north) / 2,
        (bounds.west + bounds.east) / 2,
        15,
      );
      return;
    }
    // 共有URLがなければ途中保存の有無を案内
    const draft = loadDraft();
    if (draft) {
      setMessage(
        `途中保存があります（${new Date(draft.savedAt).toLocaleString("ja-JP")}）。左の「復元」から読み込めます。`,
      );
    }
  }, [flyTo, hydrateFromMapData, setMessage]);

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      <LoadingOverlay />
      <SiteHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex min-h-0 min-w-0 flex-1">
          <section className="h-full min-w-0 flex-1">
            <ClientMap />
          </section>
          {phase === "ready" && (
            <section className="h-full w-[min(46vw,640px)] min-w-[300px] shrink-0 border-l border-[#EDE6DC] bg-[#FFFDF8]">
              <IllustrationCanvas />
            </section>
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
