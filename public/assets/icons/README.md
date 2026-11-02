# アイコンアセット

テーマごとの手描き風 / 水彩風アイコンをここに配置します。

```
icons/
  watercolor/   # cafe.png, bakery.png, ...
  retro/
  picturebook/
```

現状の MVP では Lucide React をダミーアイコンとして使用しています。
差替時は `src/lib/poiCategories.ts` の `CATEGORY_ICONS` を、
`THEMES[themeId].iconDir` 配下の画像パス参照へ更新してください。
