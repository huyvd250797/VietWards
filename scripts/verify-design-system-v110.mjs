import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const pkg = JSON.parse(read("package.json"));
assert.equal(pkg.version,"1.1.0");
const config=read("src/lib/config.ts");
assert.match(config,/releaseName: "Unified Design System 2.0"/);
assert.match(config,/name: "Unified Design System 2\.0"[^\n]+status: "current"/);
assert.match(config,/name: "Mobile UX Stabilization"[^\n]+status: "done"/);
const layout=read("src/app/layout.tsx");
const order=["./design-tokens.css","./globals.css","./educational.css","./design-system.css"].map(x=>layout.indexOf(`import "${x}";`));
assert.ok(order.every(x=>x>=0)&&order.every((x,i)=>i===0||x>order[i-1]),"CSS cascade must load semantic tokens before legacy styles and centralized overrides last");
const tokenFile=read("src/app/design-tokens.css");
const css=read("src/app/design-system.css");
const cssLegacy=read("src/app/globals.css");
assert.ok(!/^:root\s*\{/.test(cssLegacy),"Legacy CSS must not redeclare the semantic token root");
const [light,darkRaw]=tokenFile.split(':root[data-theme="dark"]');
assert.ok(light&&darkRaw,"Explicit light and dark color palettes required");
const tokenRegex=/(--vw-[\w-]+):\s*(#[a-fA-F0-9]{6})\s*;/g;
const palette=s=>Object.fromEntries([...s.matchAll(tokenRegex)].map(([_,k,v])=>[k,v]));
const colors={light:palette(light),dark:palette(darkRaw)};
const required=['bg','surface','surface-subtle','fg','fg-secondary','fg-muted','border','border-strong','accent','accent-tint','accent-tint-fg','action','action-hover','on-action','success','warning','danger','focus'];
for(const k of required) for(const p of ['light','dark'])assert.ok(colors[p][`--vw-${k}`],`${p} missing --vw-${k}`);
const relativeLuminance=(hex)=>{
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 return rgb.reduce((sum,x,i)=>sum+(x<=.04045?x/12.92:((x+.055)/1.055)**2.4)*[.2126,.7152,.0722][i],0);
};
const ratio=(hex1,hex2)=>{const a=relativeLuminance(hex1),b=relativeLuminance(hex2);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
const pairs=[['fg','surface'],['fg-secondary','surface'],['fg-muted','surface'],['accent','surface'],['accent-tint-fg','accent-tint'],['on-action','action'],['on-action','action-hover'],['warning','warning-tint'],['danger','danger-tint']];
for(const [name,p] of Object.entries(colors))for(const [fg,bg] of pairs){
 const cr=ratio(p[`--vw-${fg}`],p[`--vw-${bg}`]);
 assert.ok(cr>=4.5,`${name} ${fg}/${bg} contrast ${cr.toFixed(2)} <4.5`);
}
for(const selector of ['.vw-card','.vw-button-primary','.vw-icon-button','.vw-badge','.vw-field','.verified-metric','.verified-plate-chip','.gis-info-panel','.edu-tabs','.bottom-nav','.mobile-drawer'])
 assert.ok(css.includes(selector),`Unified surface or primitive missing ${selector}`);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/min-height: 44px/);
assert.match(read('src/components/app-shell.tsx'),/vw-icon-button/);
assert.match(read('src/components/verified-statistics-panel.tsx'),/vw-stat-card/);
assert.match(read('src/components/educational-explorer.tsx'),/vw-card/);
assert.match(read('public/sw.js'),/v1\.1\.0/);
assert.ok(existsSync(new URL('../docs/DESIGN-SYSTEM-V2.0.md',import.meta.url)));
console.log(`PASS V1.1.0: ${required.length} semantic roles per theme; ${pairs.length*2} WCAG text contrast pairs >=4.5:1; shared components, dark action, UI shell and retained iPhone UX.`);
