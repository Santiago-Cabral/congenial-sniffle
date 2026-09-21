import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const htmlPath = join(dist, "index.html");
let html = readFileSync(htmlPath, "utf8");

const linkMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
if (!linkMatch) {
  console.log("inline-css: no se encontró link a CSS.");
  process.exit(0);
}

const cssPath = join(dist, linkMatch[1]);
const css = readFileSync(cssPath, "utf8");

html = html.replace(linkMatch[0], `<style>${css}</style>`);
writeFileSync(htmlPath, html);

console.log(`inline-css: CSS inlined (${css.length} bytes), se quitó ${linkMatch[1]}`);