import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { APP } from "@/lib/config";
import { getProvinceRows } from "@/lib/admin-data";
import "maplibre-gl/dist/maplibre-gl.css";
import "./design-tokens.css";
import "./globals.css";
import "./educational.css";
import "./design-system.css";

export const metadata: Metadata = {
  title: { default: APP.title, template: `%s | ${APP.name}` },
  description: APP.description,
  applicationName: APP.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP.name },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f3f6fb" }, { media: "(prefers-color-scheme: dark)", color: "#0b1625" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('vietwards-theme')||localStorage.getItem('vietatlas-theme');var dark=saved==='dark'||(saved!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',dark?'dark':'light')}catch(e){}})();` }} />
      </head>
      <body>
        <AppShell links={getProvinceRows("current").map(({ code, formerProvinces }) => ({ code, formerProvinces }))}>{children}</AppShell>
      </body>
    </html>
  );
}
