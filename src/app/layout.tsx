import type { Metadata, Viewport } from "next";
import {
  Kaisei_Decol,
  Kiwi_Maru,
  M_PLUS_Rounded_1c,
  Yomogi,
  Zen_Maru_Gothic,
} from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
import {
  ADSENSE_CLIENT,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | オリジナル道案内マップ作成`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "イラスト道案内" }],
  creator: "イラスト道案内",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | オリジナル道案内マップ作成`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | オリジナル道案内マップ作成`,
    description: SITE_DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
      <head>
        {/* AdSense 審査用: 初期HTMLの head に生の script を置く */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full font-[family-name:var(--font-map-zenmaru)]">
        <JsonLd />
        <ThirdPartyScripts />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
