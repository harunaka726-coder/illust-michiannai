import type { Metadata, Viewport } from "next";
import {
  Kaisei_Decol,
  Kiwi_Maru,
  M_PLUS_Rounded_1c,
  Yomogi,
  Zen_Maru_Gothic,
} from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
import { ADSENSE_CLIENT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

// UI本体のみ preload。装飾フォントは必要時に遅延読み込み（数百ファイルの preload を防ぐ）
const zenmaru = Zen_Maru_Gothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-map-zenmaru",
  display: "swap",
  preload: true,
});

const yomogi = Yomogi({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-map-yomogi",
  display: "swap",
  preload: false,
});

const kiwi = Kiwi_Maru({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-map-kiwi",
  display: "swap",
  preload: false,
});

const mplus = M_PLUS_Rounded_1c({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-map-mplus",
  display: "swap",
  preload: false,
});

const kaisei = Kaisei_Decol({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-map-kaisei",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8A65",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${yomogi.variable} ${kiwi.variable} ${mplus.variable} ${zenmaru.variable} ${kaisei.variable} h-full antialiased`}
    >
      <body className="min-h-full font-[family-name:var(--font-map-zenmaru)]">
        <ThirdPartyScripts />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
