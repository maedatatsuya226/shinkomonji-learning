import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "新小文字病院 E-Learning",
  description: "新入職員向け動画研修プラットフォーム",
  manifest: "/manifest.json",
  icons: {
    apple: '/icon.jpg?v=2',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Learning",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b", // PWAスマホでの上部ステータスバーを完全な黒（Dark Zinc）化
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
