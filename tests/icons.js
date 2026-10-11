const { chromium } = require("playwright");
const out = process.argv[2] || require("path").join(__dirname, "../web");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name, size, maskable] of [["icon-192.png",192,false],["icon-512.png",512,false],["icon-maskable-512.png",512,true],["apple-touch-icon.png",180,true]]) {
    await p.setViewportSize({ width: size, height: size });
    const r = maskable ? 0 : Math.round(size*0.22), f = Math.round(size*(maskable?0.5:0.62));
    await p.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;border-radius:${r}px;background:linear-gradient(145deg,#2b3438,#14191b);display:grid;place-items:center;font-size:${f}px;line-height:1;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji'">🪶</div></body></html>`);
    await p.screenshot({ path: out + "/" + name, omitBackground: !maskable });
  }
  await b.close();
})();
