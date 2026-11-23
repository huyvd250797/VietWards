import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json", "next.config.ts", "vercel.json", "src/app/layout.tsx", "src/app/page.tsx",
  "src/app/ban-do/page.tsx", "src/app/tinh-thanh/page.tsx", "src/app/lich-su/page.tsx",
  "src/app/gioi-thieu/page.tsx", "src/app/manifest.ts", "src/app/globals.css",
  "src/components/app-shell.tsx", "src/lib/config.ts", "src/lib/domain.ts", "src/lib/admin-data.ts", "src/lib/admin-sources.ts", "src/app/api/administrative/route.ts", "src/components/province-explorer.tsx", "src/components/history-explorer.tsx", "scripts/verify-data.mjs", "src/app/api/map-boundaries/route.ts", "src/components/map-stage.tsx",
  "public/sw.js", "public/offline.html", "public/icons/icon-192.png", "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png", "README.md", "docs/ROADMAP.md"
];
const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));
if (missing.length) {
  console.error("Missing required files:\n" + missing.join("\n"));
  process.exit(1);
}
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "0.3.0") throw new Error("Incorrect release version");
console.log(`OK: ${required.length} required files, release ${packageJson.version}`);
