// Gera os ícones PNG do PWA (192 e 512) a partir de public/icon.svg.
// Uso: npm run icons
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("public/icon.svg", "utf8");

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  writeFileSync(`public/icon-${size}.png`, png);
  console.log(`gerado public/icon-${size}.png`);
}
