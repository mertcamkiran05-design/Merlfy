// New-feature test on local server: image fallback upload, card themes + photo card, freeze line, PWA, mobile composer.
const { chromium, devices } = require("playwright");
const URL = process.argv[2] || "http://localhost:5178/";
const OUT = __dirname + "/shots";
const stamp = Date.now().toString(36);
const results = [];
const ok = (name, cond, extra = "") => results.push([cond ? "PASS" : "FAIL", name, extra]);

// make a ~2400x1600 noisy PNG (large, so the shrink path is exercised)
async function makeBigPng(browser) {
  const p = await browser.newPage();
  const b64 = await p.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 2400; c.height = 1600;
    const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 2400, 1600);
    g.addColorStop(0, "#2b6"); g.addColorStop(1, "#c53"); x.fillStyle = g; x.fillRect(0, 0, 2400, 1600);
    const d = x.getImageData(0, 0, 2400, 1600); for (let i = 0; i < d.data.length; i += 4) d.data[i] ^= (Math.random() * 90) | 0;
    x.putImageData(d, 0, 0);
    return c.toDataURL("image/png").split(",")[1];
  });
  await p.close();
  const f = __dirname + "/big.png"; require("fs").writeFileSync(f, Buffer.from(b64, "base64")); return f;
}

(async () => {
  const browser = await chromium.launch();
  const big = await makeBigPng(browser);
  ok("test görseli boyutu > 1MB", require("fs").statSync(big).size > 1e6, (require("fs").statSync(big).size / 1e6).toFixed(1) + "MB");

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [], warns = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); if (m.type() === "warning") warns.push(m.text()); });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector(".gate-card", { timeout: 20000 });
  await page.getByRole("button", { name: /Yeni profil/ }).click();
  const inp = page.locator(".gate-card form input");
  await inp.nth(0).fill("pwf" + stamp); await inp.nth(1).fill("Foto Test");
  await inp.nth(2).fill("test1234"); await inp.nth(3).fill("test1234");
  await page.locator(".gate-card form button[type=submit]").click();
  await page.waitForSelector("#comp-ta", { timeout: 20000 });

  // --- image upload via fallback ---
  await page.fill("#comp-ta", "Görselli memo " + stamp + " #foto");
  await page.setInputFiles("#comp-file", big);
  await page.waitForSelector("#comp-imgs img");
  const t0 = Date.now();
  await page.click("#comp-save");
  let saved = false;
  try { await page.waitForSelector(`.memo:has-text("Görselli memo ${stamp}") .memo-imgs img`, { timeout: 40000 }); saved = true; } catch {}
  ok("görselli memo kaydedildi (Storage kapalıyken bile)", saved, ((Date.now() - t0) / 1000).toFixed(1) + "s");
  if (saved) {
    await page.waitForTimeout(1500);
    const nat = await page.locator(`.memo:has-text("Görselli memo ${stamp}") .memo-imgs img`).first()
      .evaluate(i => ({ w: i.naturalWidth, src: i.src.slice(0, 30), len: i.src.length }));
    ok("kayıtlı görsel ekranda yükleniyor", nat.w > 0, JSON.stringify(nat));
    ok("görsel ≤ 900KB (Firestore sınırına uygun)", nat.len <= 900000 || !nat.src.startsWith("data:"), nat.len + " chars");
    // reload → still there (came back from Firestore, not memory)
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector("#comp-ta", { timeout: 20000 });
    const back = await page.locator(`.memo:has-text("Görselli memo ${stamp}") .memo-imgs img`).first()
      .evaluate(async i => { for (let k = 0; k < 30 && !i.naturalWidth; k++) await new Promise(r => setTimeout(r, 200)); return i.naturalWidth; });
    ok("yenileme sonrası görsel Firestore'dan geri geldi", back > 0);
    // second image save should be instant-ish? (storageDown flag is per session; after reload it retries) — just a text memo now
  }

  // --- share card with photo + themes ---
  const card = page.locator(`.memo:has-text("Görselli memo ${stamp}")`).first();
  await card.locator(".memo-menu > button").click();
  await page.getByRole("button", { name: /Kart olarak paylaş/ }).click();
  await page.waitForSelector(".modal .ct-row button", { timeout: 15000 });
  const chips = await page.locator(".modal .ct-row button").count();
  ok("kart teması seçenekleri (6)", chips === 6, String(chips));
  const dims1 = await page.locator(".modal img").first().evaluate(async i => { await i.decode(); return [i.naturalWidth, i.naturalHeight]; });
  ok("fotoğraflı kart: yükseklik görsel için uzadı", dims1[1] > 900, dims1.join("x"));
  await page.locator(".modal").first().screenshot({ path: OUT + "/card_auto.png" });
  for (const nm of ["Adaçayı", "Gül", "Mürekkep"]) {
    await page.locator(".modal .ct-row button", { hasText: nm }).click();
    await page.waitForSelector(`.modal .ct-row button.on:has-text("${nm}")`, { timeout: 15000 });
    await page.locator(".modal").first().screenshot({ path: `${OUT}/card_${nm}.png` });
  }
  const saved2 = await page.evaluate(() => localStorage.getItem("merlfy.cardTheme"));
  ok("tema seçimi hatırlanıyor", saved2 === "ink", saved2);
  // pixel check on ink theme: top-left of card should be near-black
  const px = await page.locator(".modal img").first().evaluate(async i => {
    await i.decode(); const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const x = c.getContext("2d"); x.drawImage(i, 0, 0); return [...x.getImageData(20, 20, 1, 1).data];
  });
  ok("Mürekkep teması uygulanmış (koyu zemin)", px[0] < 30 && px[1] < 30, px.join(","));
  await page.keyboard.press("Escape");
  await page.locator(".overlay").evaluate(o => o.remove()).catch(() => {});

  // --- freeze line ---
  const fz = await page.locator(".freeze-line").first().innerText().catch(() => "");
  ok("seri koruma satırı görünüyor", /Seri koruma/.test(fz), fz);

  // --- recap still works (factory path) ---
  await page.getByRole("button", { name: /Özetimi paylaş/ }).first().click();
  await page.getByRole("button", { name: /Son 7 gün|7/ }).first().click();
  const recapOk = await page.waitForSelector(".modal img", { timeout: 10000 }).then(() => true).catch(() => false);
  ok("karne kartı hâlâ üretiliyor", recapOk);
  await page.locator(".overlay").evaluate(o => o.remove()).catch(() => {});

  // --- PWA ---
  const man = await page.evaluate(async () => { const r = await fetch("/manifest.webmanifest"); return r.ok && (await r.json()).name; });
  ok("manifest erişilebilir", man === "Merlfy");
  const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  ok("service worker aktif", sw);
  await page.reload({ waitUntil: "load" });
  const ctrl = await page.evaluate(() => !!navigator.serviceWorker.controller);
  ok("service worker sayfayı kontrol ediyor", ctrl);
  // offline shell
  await ctx.setOffline(true);
  const tOff = Date.now();
  await page.reload({ waitUntil: "load" }).catch(() => {});
  const offUp = await page.waitForSelector("#comp-ta", { timeout: 20000 }).then(() => true).catch(() => false);
  const nMemos = await page.locator(".memo").count();
  ok("çevrimdışı açılıyor, memolar görünüyor", offUp && nMemos > 0, `${((Date.now() - tOff) / 1000).toFixed(1)}s, ${nMemos} memo`);
  await page.screenshot({ path: OUT + "/offline.png" });
  const offMemo = "Çevrimdışı memo " + stamp;
  let offSaved = false;
  if (await page.locator("#comp-ta").count()) {
    await page.fill("#comp-ta", offMemo);
    await page.click("#comp-save");
    offSaved = await page.waitForSelector(`.memo:has-text("${offMemo}")`, { timeout: 8000 }).then(() => true).catch(() => false);
  }
  ok("çevrimdışı memo yazılabiliyor (takılmıyor)", offSaved);
  await ctx.setOffline(false);
  await page.waitForTimeout(4000);
  // fresh context (no local cache) must see it → it really reached the server
  const c2 = await browser.newContext(); const p2 = await c2.newPage();
  await p2.goto(URL, { waitUntil: "load" }); await p2.waitForSelector(".gate-card");
  const i2 = p2.locator(".gate-card form input");
  await i2.nth(0).fill("pwf" + stamp); await i2.nth(1).fill("test1234");
  await p2.locator(".gate-card form button[type=submit]").click();
  await p2.waitForSelector("#comp-ta", { timeout: 20000 });
  ok("internet gelince çevrimdışı memo sunucuya senkronlandı", await p2.locator(`.memo:has-text("${offMemo}")`).count() > 0);
  await c2.close();
  // ?new=1 shortcut
  await page.goto(URL + "?new=1", { waitUntil: "load" });
  await page.waitForSelector("#comp-ta", { timeout: 20000 });
  await page.waitForTimeout(500);
  const foc = await page.evaluate(() => document.activeElement && document.activeElement.id);
  ok("?new=1 kısayolu yazma kutusuna odaklıyor", foc === "comp-ta", String(foc));

  // --- mobile composer: Kaydet inside viewport ---
  const M = await browser.newContext({ ...devices["iPhone 13"] });
  const mp = await M.newPage();
  await mp.goto(URL, { waitUntil: "load" });
  await mp.waitForSelector(".gate-card");
  const mi = mp.locator(".gate-card form input");
  await mi.nth(0).fill("pwf" + stamp); await mi.nth(1).fill("test1234");
  await mp.locator(".gate-card form button[type=submit]").click();
  await mp.waitForSelector("#comp-save", { timeout: 20000 });
  const box = await mp.locator("#comp-save").boundingBox();
  const cbox = await mp.locator("#composer").boundingBox();
  ok("mobil: Kaydet butonu kutunun içinde", box.x + box.width <= cbox.x + cbox.width + 0.5, `btn sağ=${(box.x + box.width).toFixed(0)} kutu sağ=${(cbox.x + cbox.width).toFixed(0)}`);
  ok("mobil: klavye ipucu gizli", !(await mp.locator(".comp-bar .kbd").isVisible()));
  await mp.locator("#composer").screenshot({ path: OUT + "/m_composer.png" });
  // iOS install hint in settings
  await mp.locator(".tabbar button", { hasText: "Ayarlar" }).click();
  const ios = await mp.getByText(/Ana Ekrana Ekle/).waitFor({ timeout: 8000 }).then(() => 1).catch(() => 0);
  ok("iOS: Ayarlar'da 'Ana Ekrana Ekle' ipucu", ios > 0);
  await mp.screenshot({ path: OUT + "/m_settings_install.png" });

  const realErrs = errs.filter(e => !/firebasestorage|CORS|ERR_FAILED|net::|Failed to load resource|Could not reach Cloud Firestore|client is offline/i.test(e));
  ok("beklenmeyen konsol hatası yok", realErrs.length === 0, realErrs.slice(0, 4).join(" | "));
  for (const r of results) console.log(r.join("  "));
  console.log("uyarılar:", warns.filter(w => /Storage|persist/i.test(w)).slice(0, 3));
  await browser.close();
})().catch(e => { console.error("CRASH", e.message); for (const r of results) console.log(r.join("  ")); process.exit(1); });
