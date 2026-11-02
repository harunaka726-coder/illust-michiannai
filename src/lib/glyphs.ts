const INK = "#5C4A3A";

/** 少しゆがんだ線で手書き感を出す簡易アイコン（将来はPNG差し替え） */
const GLYPHS: Record<string, string> = {
  cafe: `
    <ellipse cx="40" cy="71" rx="17" ry="3.2" fill="#000" opacity="0.07"/>
    <path d="M18 38c1-2 32-3 34 1v12c1 10-8 15-17 15s-18-4-17-14z" fill="#fff7ef" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M52 42c6 1 10 4 9 10s-5 8-9 7" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="35" cy="47" rx="9" ry="3" fill="#E7C3A8"/>
    <path d="M26 31c1-7 0-12-1-16M37 30c2-8 1-13 0-17M47 31c1-6 1-10 0-14" fill="none" stroke="#C4785A" stroke-width="2" stroke-linecap="round"/>
  `,
  bakery: `
    <ellipse cx="40" cy="70" rx="19" ry="3.2" fill="#000" opacity="0.07"/>
    <path d="M15 50c4-18 20-24 36-18 10 4 14 14 12 20-3 9-12 14-27 13S12 58 15 50z" fill="#F8DFB4" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M28 47c3-6 8-7 12-1M41 45c2-5 7-6 10 0" fill="none" stroke="#C4785A" stroke-width="2" stroke-linecap="round"/>
    <path d="M24 30c5-2 8 3 5 8-4 2-8-2-5-8z" fill="#E9B57C" stroke="${INK}" stroke-width="1.8"/>
    <path d="M39 24c5-1 8 4 5 8-4 2-8-2-5-8z" fill="#F3C98A" stroke="${INK}" stroke-width="1.8"/>
  `,
  convenience: `
    <ellipse cx="40" cy="71" rx="20" ry="3.2" fill="#000" opacity="0.07"/>
    <path d="M13 35c2-8 8-12 18-13h22c8 1 14 6 15 13z" fill="#E85D4C" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M18 35h44v26c0 2-2 3-4 3H22c-2 0-4-1-4-3z" fill="#fff8f1" stroke="${INK}" stroke-width="2.1"/>
    <path d="M33 48l7-11 7 11h-4l-3 8-3-8z" fill="#F4E3B2" stroke="${INK}" stroke-width="1.5"/>
    <path d="M23 53h9v8H23z" fill="#7EB6D9" stroke="${INK}" stroke-width="1.3"/>
  `,
  restaurant: `
    <ellipse cx="40" cy="70" rx="18" ry="3.5" fill="#000" opacity="0.08"/>
    <path d="M16 36h48l-6 22H22z" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M14 36h52" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M26 46c4 3 6 3 10 0M40 46c4 3 6 3 10 0" fill="none" stroke="#E07A5F" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 18l4 12M48 16l-2 12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  `,
  ramen: `
    <ellipse cx="40" cy="70" rx="20" ry="3.5" fill="#000" opacity="0.08"/>
    <path d="M14 40h52l-8 20H22z" fill="#F4E3B2" stroke="${INK}" stroke-width="2.2"/>
    <path d="M12 40h56" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M24 48c6 4 8 4 12 0M38 50c5 3 7 3 12 0" fill="none" stroke="#E07A5F" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M22 22c2 6-2 8 0 14M34 18c2 6-2 8 0 14M48 22c2 6-2 8 0 12" fill="none" stroke="#C4785A" stroke-width="2" stroke-linecap="round"/>
  `,
  soba: `
    <ellipse cx="40" cy="70" rx="20" ry="3.5" fill="#000" opacity="0.08"/>
    <path d="M16 42h48l-6 18H22z" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M14 42h52" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M24 50c8 2 10 6 16 2M26 56c8 2 12 4 18 1" fill="none" stroke="#8A7A6A" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 16l-6 20" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M56 18l-6 20" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  `,
  library: `
    <rect x="14" y="28" width="52" height="36" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M14 40h52" stroke="${INK}" stroke-width="2"/>
    <rect x="20" y="44" width="8" height="16" fill="#E07A5F"/>
    <rect x="30" y="44" width="8" height="16" fill="#7EB6D9"/>
    <rect x="40" y="44" width="8" height="16" fill="#F2C14E"/>
    <rect x="50" y="44" width="8" height="16" fill="#8FBF73"/>
    <path d="M22 22h36" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  `,
  bus: `
    <rect x="34" y="18" width="6" height="40" fill="#8A7A6A"/>
    <rect x="18" y="22" width="44" height="22" rx="3" fill="#F2C14E" stroke="${INK}" stroke-width="2.2"/>
    <rect x="24" y="28" width="14" height="10" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="52" cy="33" r="4" fill="#E07A5F" stroke="${INK}" stroke-width="1.4"/>
    <path d="M28 66h18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  `,
  pharmacy: `
    <rect x="18" y="24" width="44" height="40" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="32" width="12" height="24" fill="#E07A5F"/>
    <rect x="28" y="38" width="24" height="12" fill="#E07A5F"/>
    <rect x="22" y="18" width="36" height="8" rx="2" fill="#7EB6D9"/>
  `,
  bookstore: `
    <path d="M16 30h22v34H16z" fill="#E07A5F" stroke="${INK}" stroke-width="2"/>
    <path d="M38 26h24v38H38z" fill="#7EB6D9" stroke="${INK}" stroke-width="2"/>
    <path d="M20 38h14M20 46h14M42 36h16M42 44h16M42 52h16" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  `,
  supermarket: `
    <ellipse cx="40" cy="70" rx="22" ry="3.5" fill="#000" opacity="0.08"/>
    <rect x="16" y="28" width="48" height="34" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M16 40h48" stroke="${INK}" stroke-width="2"/>
    <path d="M22 24h28l6 10H16z" fill="#7EB6D9" stroke="${INK}" stroke-width="2"/>
    <circle cx="28" cy="58" r="3" fill="${INK}"/>
    <circle cx="52" cy="58" r="3" fill="${INK}"/>
  `,
  shop: `
    <ellipse cx="40" cy="70" rx="20" ry="3.5" fill="#000" opacity="0.08"/>
    <path d="M14 36l4-10h44l4 10z" fill="#F2C14E" stroke="${INK}" stroke-width="2.2"/>
    <rect x="18" y="36" width="44" height="26" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="46" width="12" height="16" fill="#E7B7A5" stroke="${INK}" stroke-width="1.6"/>
    <rect x="22" y="42" width="8" height="8" fill="#F7E7A1" stroke="${INK}" stroke-width="1.4"/>
  `,
  park: `
    <ellipse cx="40" cy="66" rx="24" ry="5" fill="#C5D9A8"/>
    <circle cx="28" cy="40" r="14" fill="#8FBF73" stroke="${INK}" stroke-width="2"/>
    <circle cx="48" cy="36" r="16" fill="#A8D08D" stroke="${INK}" stroke-width="2"/>
    <rect x="37" y="48" width="5" height="16" fill="#8A6A4A"/>
  `,
  tree: `
    <rect x="36" y="48" width="8" height="18" rx="2" fill="#8A6A4A"/>
    <circle cx="40" cy="36" r="18" fill="#8FBF73" stroke="${INK}" stroke-width="2"/>
    <circle cx="30" cy="40" r="8" fill="#A8D08D"/>
  `,
  station: `
    <ellipse cx="40" cy="70" rx="24" ry="3.5" fill="#000" opacity="0.08"/>
    <rect x="14" y="36" width="52" height="26" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M14 36 L40 18 L66 36" fill="#E07A5F" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="46" width="12" height="16" fill="#5C4A3A"/>
    <path d="M12 66h56" stroke="${INK}" stroke-width="2"/>
    <path d="M12 70h56" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/>
  `,
  school: `
    <rect x="16" y="34" width="48" height="30" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M12 34 L40 16 L68 34" fill="#7EB6D9" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="46" width="12" height="18" fill="#F2C14E" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="40" cy="26" r="3" fill="#E07A5F"/>
  `,
  hospital: `
    <rect x="18" y="26" width="44" height="40" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="34" width="12" height="24" fill="#E07A5F"/>
    <rect x="28" y="40" width="24" height="12" fill="#E07A5F"/>
  `,
  bank: `
    <rect x="18" y="36" width="44" height="28" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M12 36 L40 18 L68 36" fill="#F2C14E" stroke="${INK}" stroke-width="2.2"/>
    <path d="M26 42v16M40 42v16M54 42v16" stroke="${INK}" stroke-width="2.4"/>
  `,
  post: `
    <rect x="18" y="30" width="44" height="34" rx="2" fill="#E07A5F" stroke="${INK}" stroke-width="2.2"/>
    <rect x="26" y="40" width="28" height="16" rx="2" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
    <path d="M26 40l14 10 14-10" fill="none" stroke="${INK}" stroke-width="1.6"/>
  `,
  hotel: `
    <rect x="20" y="22" width="40" height="44" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <rect x="28" y="30" width="8" height="8" fill="#7EB6D9"/>
    <rect x="44" y="30" width="8" height="8" fill="#7EB6D9"/>
    <rect x="28" y="44" width="8" height="8" fill="#F2C14E"/>
    <rect x="44" y="44" width="8" height="8" fill="#F2C14E"/>
    <rect x="34" y="52" width="12" height="14" fill="#5C4A3A"/>
  `,
  shrine: `
    <rect x="18" y="40" width="44" height="24" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <path d="M10 40h60" stroke="#E07A5F" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 28h48" stroke="#E07A5F" stroke-width="4" stroke-linecap="round"/>
    <rect x="36" y="46" width="8" height="18" fill="#5C4A3A"/>
  `,
  home: `
    <path d="M12 40 L40 18 L68 40" fill="#E07A5F" stroke="${INK}" stroke-width="2.2"/>
    <rect x="20" y="40" width="40" height="26" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <rect x="34" y="50" width="12" height="16" fill="#C4785A"/>
  `,
  building: `
    <path d="M18 66V28c0-2 2-4 5-4h34c3 0 5 2 5 4v38z" fill="#fff7ef" stroke="${INK}" stroke-width="2.2"/>
    <path d="M26 36h8v8h-8zM36 36h8v8h-8zM46 36h8v8h-8zM26 48h8v8h-8zM36 48h8v8h-8zM46 48h8v8h-8z" fill="#7EB6D9" stroke="${INK}" stroke-width="1.2"/>
    <path d="M36 58h8v8h-8z" fill="#C4785A"/>
  `,
  conifer: `
    <path d="M40 14 L54 36 H46 L58 52 H48 L62 66 H18 L32 52 H22 L34 36 H26 Z" fill="#6FAE6A" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="36" y="64" width="8" height="10" fill="#8A6A4A"/>
  `,
  flowerbed: `
    <ellipse cx="40" cy="58" rx="26" ry="10" fill="#C5D9A8" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="28" cy="40" r="8" fill="#E07A5F" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="42" cy="34" r="9" fill="#F2C14E" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="54" cy="42" r="7" fill="#7EB6D9" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="40" cy="44" r="3" fill="#fff"/>
  `,
  bench: `
    <path d="M14 42h52v6H14z" fill="#C4785A" stroke="${INK}" stroke-width="2"/>
    <path d="M18 48v14M62 48v14M22 34h36v8H22z" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M22 34h36v8H22z" fill="#E7C3A8" stroke="${INK}" stroke-width="1.8"/>
  `,
  cloud: `
    <path d="M22 48c-8 0-12-6-10-12 2-6 8-8 14-6 2-8 12-12 20-8 6 3 8 10 6 14 8 0 12 6 8 12-3 5-10 6-16 4H28z" fill="#fff" stroke="${INK}" stroke-width="2" opacity="0.95"/>
  `,
  stream: `
    <path d="M10 30c12 8 18 8 30 0s18-8 30 0" fill="none" stroke="#7EC8E3" stroke-width="8" stroke-linecap="round"/>
    <path d="M10 46c12 8 18 8 30 0s18-8 30 0" fill="none" stroke="#9FD3E0" stroke-width="6" stroke-linecap="round"/>
    <path d="M10 58c12 6 18 6 30 0s18-6 30 0" fill="none" stroke="#B8D4D8" stroke-width="4" stroke-linecap="round"/>
  `,
  bike: `
    <circle cx="22" cy="52" r="12" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="58" cy="52" r="12" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <path d="M22 52 L36 28 H50 L58 52 M36 28 L42 52 M34 40 H48" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="36" cy="28" r="2.5" fill="#E07A5F"/>
  `,
  signboard: `
    <rect x="37" y="44" width="6" height="24" fill="#8A6A4A"/>
    <path d="M16 18h48v28H16z" fill="#F2C14E" stroke="${INK}" stroke-width="2.2"/>
    <path d="M24 28h32M24 36h24" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  `,
  compass: `
    <circle cx="40" cy="40" r="22" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M40 18 L46 42 L40 38 L34 42 Z" fill="#E07A5F" stroke="${INK}" stroke-width="1.5"/>
    <text x="40" y="16" text-anchor="middle" font-size="10" fill="${INK}" font-family="sans-serif">N</text>
  `,
  person: `
    <circle cx="40" cy="16" r="8" fill="#F6D3B0" stroke="${INK}" stroke-width="2"/>
    <path d="M28 32c2-8 22-8 24 0l2 16H26z" fill="#7EB6D9" stroke="${INK}" stroke-width="2"/>
    <path d="M30 48l-6 18M50 48l6 18" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M28 34l-10 10M52 34l10 8" fill="none" stroke="#E07A5F" stroke-width="3" stroke-linecap="round"/>
  `,
  car: `
    <path d="M10 46l8-16h32l10 16" fill="#7EB6D9" stroke="${INK}" stroke-width="2.2"/>
    <rect x="8" y="44" width="62" height="14" rx="4" fill="#F2C14E" stroke="${INK}" stroke-width="2.2"/>
    <circle cx="22" cy="60" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <circle cx="56" cy="60" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
  `,
  train: `
    <rect x="8" y="28" width="64" height="30" rx="8" fill="#E07A5F" stroke="${INK}" stroke-width="2.2"/>
    <rect x="16" y="34" width="14" height="12" rx="2" fill="#fff"/>
    <rect x="34" y="34" width="14" height="12" rx="2" fill="#fff"/>
    <circle cx="22" cy="62" r="5" fill="#5C4A3A"/>
    <circle cx="58" cy="62" r="5" fill="#5C4A3A"/>
    <path d="M4 70h72" stroke="${INK}" stroke-width="2"/>
  `,
  dog: `
    <ellipse cx="36" cy="48" rx="16" ry="10" fill="#E7C3A8" stroke="${INK}" stroke-width="2"/>
    <circle cx="54" cy="40" r="9" fill="#E7C3A8" stroke="${INK}" stroke-width="2"/>
    <circle cx="58" cy="38" r="1.4" fill="${INK}"/>
    <path d="M22 48l-6 12M30 54l-2 12M44 54l4 12" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M18 42c-6-8-2-14 2-12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  `,
  bird: `
    <path d="M18 46c10-16 22-16 30-4 8 4 16 2 22-6-8 10-12 18-26 18-6 6-16 8-22 2z" fill="#7EB6D9" stroke="${INK}" stroke-width="2"/>
    <circle cx="40" cy="40" r="1.5" fill="${INK}"/>
    <path d="M46 42l8 2-8 3" fill="#F2C14E"/>
  `,
  unknown: `
    <circle cx="40" cy="40" r="18" fill="#fff" stroke="${INK}" stroke-width="2.2"/>
    <path d="M32 34c0-6 16-6 16 2 0 8-8 6-8 12" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="40" cy="54" r="2" fill="${INK}"/>
  `,
  /** 権利的に安全な基本シェイプ */
  pin: `
    <path d="M40 12c-11 0-20 9-20 20 0 14 20 36 20 36s20-22 20-36c0-11-9-20-20-20z" fill="#E07A5F" stroke="${INK}" stroke-width="2.2"/>
    <circle cx="40" cy="32" r="8" fill="#fff"/>
  `,
  /** 青矢印（旧テキスト枠スロット） */
  textframe: `
    <path d="M12 40h38" fill="none" stroke="#3B82F6" stroke-width="5" stroke-linecap="round"/>
    <path d="M44 22 L68 40 L44 58 Z" fill="#3B82F6" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
  `,
  arrow: `
    <path d="M14 40h40" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M46 24 L66 40 L46 56 Z" fill="#E07A5F" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  `,
  circle: `
    <circle cx="40" cy="40" r="22" fill="#F2C14E" fill-opacity="0.35" stroke="${INK}" stroke-width="2.4"/>
  `,
  /** 星（旧四角スロット） */
  square: `
    <path d="M40 10 L47 30 L68 30 L51 43 L58 64 L40 51 L22 64 L29 43 L12 30 L33 30 Z" fill="#F2C14E" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  `,
  star: `
    <path d="M40 10 L47 30 L68 30 L51 43 L58 64 L40 51 L22 64 L29 43 L12 30 L33 30 Z" fill="#F2C14E" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  `,
};

export function glyphInner(category: string) {
  return GLYPHS[category] ?? GLYPHS.shop;
}

export function glyphSvgDocument(category: string, size = 128) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80">
  ${glyphInner(category)}
</svg>`;
}
