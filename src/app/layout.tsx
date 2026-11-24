import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { APP } from "@/lib/config";
import { getProvinceRows } from "@/lib/admin-data";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import "./educational.css";

export const metadata: Metadata = {
  title: { default: APP.title, template: `%s | ${APP.name}` },
  description: APP.description,
  applicationName: APP.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP.name },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f8fd" }, { media: "(prefers-color-scheme: dark)", color: "#0b1425" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <AppShell links={getProvinceRows("current").map(({ code, formerProvinces }) => ({ code, formerProvinces }))}>{children}</AppShell>
      </body>
    </html>
  );
}
