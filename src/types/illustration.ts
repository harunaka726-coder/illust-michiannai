export interface LngLat {
  lng: number;
  lat: number;
}

export interface AreaBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface IllustPath {
  id: string;
  kind: "road" | "river" | "rail";
  name?: string;
  roadClass?: "major" | "street";
  points: LngLat[];
}

export interface IllustArea {
  id: string;
  kind: "park" | "wood" | "water";
  name?: string;
  ring: LngLat[];
}

export type DecoKind = "person" | "car" | "train" | "dog" | "bird" | "tree";

/** スタンプID・"text"・既存デコ種類 */
export type PlaceTool = string;

export type SpotKind =
  | "place"
  | "deco"
  | "stamp"
  | "text"
  | "road-label"
  | "park-label";

export interface IllustSpot {
  id: string;
  category: string;
  name: string;
  note: string;
  lat: number;
  lng: number;
  decoration?: boolean;
  /** 1 が標準。タイトル以外の要素の大きさ */
  scale?: number;
  kind?: SpotKind;
  /** 下絵作成時に自動配置したもの。更新時に入れ替える */
  auto?: boolean;
  fontId?: string;
  /** stamps.ts / アップロード素材の stamp id */
  stampId?: string;
  /** アップロード画像の data URL */
  imageUrl?: string;
  /** スタンプ／図形の回転（度） */
  rotation?: number;
}

/** ユーザーがアップロードした画像スタンプ */
export interface CustomStamp {
  id: string;
  label: string;
  imageUrl: string;
}

export interface LandmarkSeed {
  name: string;
  category: string;
  lat: number;
  lng: number;
}
