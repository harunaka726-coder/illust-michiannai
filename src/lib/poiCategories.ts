import type { LucideIcon } from "lucide-react";
import {
  Coffee,
  Croissant,
  ShoppingBag,
  UtensilsCrossed,
  Trees,
  TrainFront,
  Store,
  Home,
  MapPin,
  HelpCircle,
  School,
  Cross,
  Landmark,
  Mail,
  ShoppingCart,
  BedDouble,
  Church,
  BookOpen,
  Bus,
  Pill,
  Library,
  Soup,
} from "lucide-react";
import type { PoiCategory } from "@/types/map";

/** Mapbox / OSM タグ → 内部カテゴリ */
export function resolvePoiCategory(
  properties: Record<string, unknown> | null | undefined,
): PoiCategory {
  if (!properties) return "unknown";

  const amenity = String(properties.amenity ?? properties.class ?? "").toLowerCase();
  const shop = String(properties.shop ?? "").toLowerCase();
  const type = String(properties.type ?? properties.maki ?? "").toLowerCase();
  const category = String(properties.category ?? "").toLowerCase();
  const name = String(properties.name ?? properties.name_ja ?? "").toLowerCase();
  const cuisine = String(properties.cuisine ?? "").toLowerCase();
  const highway = String(properties.highway ?? "").toLowerCase();
  const railway = String(properties.railway ?? "").toLowerCase();

  const haystack = [amenity, shop, type, category, name, cuisine, highway, railway].join(" ");

  if (
    haystack.includes("cafe") ||
    haystack.includes("coffee") ||
    amenity === "cafe"
  ) {
    return "cafe";
  }
  if (
    haystack.includes("bakery") ||
    shop === "bakery" ||
    amenity === "bakery"
  ) {
    return "bakery";
  }
  if (
    haystack.includes("convenience") ||
    shop === "convenience" ||
    haystack.includes("コンビニ")
  ) {
    return "convenience";
  }
  if (amenity === "library" || haystack.includes("library") || name.includes("図書館")) {
    return "library";
  }
  if (
    highway === "bus_stop" ||
    amenity === "bus_station" ||
    haystack.includes("bus_stop") ||
    name.includes("バス停")
  ) {
    return "bus";
  }
  if (
    haystack.includes("ramen") ||
    name.includes("ラーメン") ||
    cuisine === "ramen"
  ) {
    return "ramen";
  }
  if (
    haystack.includes("soba") ||
    haystack.includes("udon") ||
    haystack.includes("noodle") ||
    name.includes("そば") ||
    name.includes("蕎麦") ||
    name.includes("うどん")
  ) {
    return "soba";
  }
  if (
    amenity === "pharmacy" ||
    shop === "chemist" ||
    haystack.includes("pharmacy") ||
    name.includes("薬局") ||
    name.includes("薬店")
  ) {
    return "pharmacy";
  }
  if (shop === "books" || amenity === "books" || name.includes("本屋") || name.includes("書店")) {
    return "bookstore";
  }
  if (
    haystack.includes("restaurant") ||
    haystack.includes("fast_food") ||
    amenity === "restaurant" ||
    amenity === "fast_food"
  ) {
    return "restaurant";
  }
  if (
    haystack.includes("school") ||
    haystack.includes("kindergarten") ||
    amenity === "school"
  ) {
    return "school";
  }
  if (
    haystack.includes("hospital") ||
    haystack.includes("clinic") ||
    amenity === "doctors"
  ) {
    return "hospital";
  }
  if (amenity === "bank" || haystack.includes("bank")) {
    return "bank";
  }
  if (amenity === "post_office" || haystack.includes("post_office")) {
    return "post";
  }
  if (shop === "supermarket" || haystack.includes("supermarket")) {
    return "supermarket";
  }
  if (
    haystack.includes("hotel") ||
    String(properties.tourism ?? "") === "hotel"
  ) {
    return "hotel";
  }
  if (
    amenity === "place_of_worship" ||
    haystack.includes("shrine") ||
    haystack.includes("temple")
  ) {
    return "shrine";
  }
  if (
    haystack.includes("park") ||
    haystack.includes("garden") ||
    amenity === "park"
  ) {
    return "park";
  }
  if (
    railway === "station" ||
    railway === "halt" ||
    railway === "subway_entrance" ||
    amenity === "station" ||
    (haystack.includes("station") && !haystack.includes("bus"))
  ) {
    return "station";
  }
  if (
    shop ||
    amenity ||
    haystack.includes("shop") ||
    haystack.includes("store") ||
    name.trim().length > 0
  ) {
    return "shop";
  }

  return "unknown";
}

export function getPoiDisplayName(
  properties: Record<string, unknown> | null | undefined,
  fallback = "スポット",
): string {
  if (!properties) return fallback;
  const name =
    properties.name ??
    properties.name_ja ??
    properties.name_en ??
    properties.title;
  if (typeof name === "string" && name.trim()) return name.trim();
  return fallback;
}

export const CATEGORY_LABELS: Record<PoiCategory, string> = {
  cafe: "カフェ",
  bakery: "ベーカリー",
  convenience: "コンビニ",
  restaurant: "レストラン",
  ramen: "ラーメン",
  soba: "そば・うどん",
  library: "図書館",
  bus: "バス停",
  pharmacy: "薬局",
  bookstore: "本屋",
  park: "公園",
  station: "駅",
  shop: "お店",
  school: "学校",
  hospital: "病院",
  bank: "銀行",
  post: "郵便局",
  supermarket: "スーパー",
  hotel: "ホテル",
  shrine: "神社・寺",
  home: "マイホーム",
  custom: "カスタム",
  unknown: "スポット",
};

/** MVP: Lucide をダミー手描き風アイコンとして使用。将来は THEMES[].iconDir のアセットへ差替 */
export const CATEGORY_ICONS: Record<PoiCategory, LucideIcon> = {
  cafe: Coffee,
  bakery: Croissant,
  convenience: ShoppingBag,
  restaurant: UtensilsCrossed,
  ramen: Soup,
  soba: Soup,
  library: Library,
  bus: Bus,
  pharmacy: Pill,
  bookstore: BookOpen,
  park: Trees,
  station: TrainFront,
  shop: Store,
  school: School,
  hospital: Cross,
  bank: Landmark,
  post: Mail,
  supermarket: ShoppingCart,
  hotel: BedDouble,
  shrine: Church,
  home: Home,
  custom: MapPin,
  unknown: HelpCircle,
};
