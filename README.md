# 散策マップ工房（Illustrator Map）

指定した地図範囲を、雑誌の特集記事のような **手描き風・水彩画風イラストマップ** にカスタマイズする Web アプリの MVP です。

## セットアップ

```bash
# 依存関係（初回のみ）
npm install

# Mapbox トークンを設定
copy .env.local.example .env.local
# .env.local を開き NEXT_PUBLIC_MAPBOX_TOKEN を記入
# 取得先: https://account.mapbox.com/access-tokens/

# 開発サーバー
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## いまできること（Stage 1）

1. Leaflet + CARTO タイルでインタラクティブ地図を表示（トークン不要）
2. 施設クリック → Overpass（OSM）で POI 取得 → かわいいアイコンがポップ
3. ダブルクリック →「My Home」などのカスタムピン追加
4. サイドバーで画風テーマ切替（水彩 / レトロペン画 / 絵本ポップ）
5. PNG ダウンロードボタン（html2canvas）

## ディレクトリ構成

```
src/
  app/                 # Next.js App Router
  components/
    MapComponent.tsx   # 地図・POI取得・ピン表示
    Sidebar.tsx        # テーマ切替・ピン管理・書出
    MapPinPopup.tsx    # 浮き上がりアニメ付きポップアップ
  lib/
    themes.ts          # 画風テーマ定義
    poiCategories.ts   # amenity/shop → カテゴリ & アイコン
  store/
    mapStore.ts        # Zustand（theme / pins）
  types/
    map.ts
public/assets/icons/   # 将来の自作アイコン差替用
  watercolor/
  retro/
  picturebook/
```

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Mapbox GL JS / react-map-gl
- Zustand
- Lucide React（ダミーアイコン）
- html2canvas

## 次のステップ案

- Overpass API 連携で OSM タグをより正確に取得
- 道路の手描き風 SVG フィルター強化
- 自作水彩アイコン PNG/SVG の差替
- Mapbox `map.getCanvas()` による高品質 PNG 書出
