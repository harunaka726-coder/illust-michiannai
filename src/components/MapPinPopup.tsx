"use client";

import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/poiCategories";
import type { MapPin } from "@/types/map";
import type { ThemePalette } from "@/types/map";

interface MapPinPopupProps {
  pin: MapPin;
  theme: ThemePalette;
  onClose?: () => void;
}

export function MapPinPopup({ pin, theme, onClose }: MapPinPopupProps) {
  const Icon = CATEGORY_ICONS[pin.category];
  const categoryLabel = CATEGORY_LABELS[pin.category];

  return (
    <div
      className="pin-popup pointer-events-auto flex min-w-[140px] max-w-[200px] flex-col items-center gap-1.5 rounded-2xl px-3 py-3 shadow-md"
      style={{
        backgroundColor: theme.colors.pinBg,
        border: `1.5px solid ${theme.colors.panelBorder}`,
        color: theme.colors.label,
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: theme.colors.panel,
          color: theme.colors.accent,
        }}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p
        className="text-center text-sm font-medium leading-tight tracking-wide"
        style={{ fontFamily: "var(--font-map-hand), cursive" }}
      >
        {pin.name}
      </p>
      <span className="text-[10px] opacity-60">{categoryLabel}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 text-[10px] underline opacity-50 transition hover:opacity-80"
        >
          閉じる
        </button>
      )}
    </div>
  );
}
