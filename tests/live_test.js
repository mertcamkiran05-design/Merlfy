// Live-site test: two accounts (public memo → Explore), mobile viewport sweep, chess AI/pass.
const { chromium, devices } = require("playwright");
const URL = process.argv[2] || "https://merlfy.netlify.app/";
const OUT = __dirname + "/shots";
require("fs").mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36);
const results = [];
const ok = (name, cond, extra = "") => { results.push([cond ? "PASS" : "FAIL", name, extra]); };

async function newUser(browser, opts, uname) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector(".gate-card", { timeout: 20000 });
  await page.getByRole("button", { name: /Yeni profil|New profile/ }).click();
  const inputs = page.locator(".gate-card form input");
  await inputs.nth(0).fill(uname);
  await inputs.nth(1).fill("Test " + uname);
  await inputs.nth(2).fill("test1234");
  await inputs.nth(3).fill("test1234");
  await page.locator(".gate-card form button[type=submit]").click();
  await page.waitForSelector("#comp-ta", { timeout: 20000 });
  return { ctx, page, errs };
}
const LBL = { feed: "Akış", explore: "Keşfet", calendar: "Takvim", break: "Mola", trash: "Çöp Kutusu", settings: "Ayarlar" };
const go = async (page, v) => {
  const btns = page.locator("button", { hasText: LBL[v] });
  const n = await btns.count();
  for (let i = 0; i < n; i++) if (await btns.nth(i).isVisible()) { await btns.nth(i).click(); return; }
  throw new Error("nav button not visible: " + v);
};
async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

(async () => {
  const browser = await chromium.launch();

  // ---------- 1) two accounts ----------
  const A = await newUser(browser, {}, "pwa" + stamp);
  const B = await newUser(browser, {}, "pwb" + stamp);
  const secret = "Herkese açık test memo " + stamp + " #pwtest";
  const priv = "Özel memo " + stamp;
  for (const [txt, vis] of [[secret, "public"], [priv, "private"]]) {
    await A.page.fill("#comp-ta", txt);
    await A.page.selectOption("#comp-vis", vis);
    await A.page.click("#comp-save");
    await A.page.waitForSelector(`.memo:has-text("${txt.slice(0, 20)}")`, { timeout: 15000 });
  }
  ok("A: iki memo kaydedildi", true);
  // B reloads and opens Explore
  await B.page.reload({ waitUntil: "load" });
  await B.page.waitForSelector("#comp-ta", { timeout: 20000 });
  await go(B.page, "explore");
  let seen = false;
  for (let i = 0; i < 10 && !seen; i++) {
    seen = await B.page.locator(`.memo:has-text("${stamp} #pwtest")`).count() > 0;
    if (!seen) { await B.page.waitForTimeout(1000); await go(B.page, "explore"); }
  }
  ok("B: A'nın herkese açık memosunu Keşfet'te görüyor", seen);
  const leak = await B.page.locator(`.memo:has-text("Özel memo ${stamp}")`).count();
  ok("B: A'nın özel memosu GÖRÜNMÜYOR", leak === 0);
  if (seen) {
    const card = B.page.locator(`.memo:has-text("${stamp} #pwtest")`).first();
    ok("B: kartta yazar adı var", (await card.locator(".who-name").innerText()).includes("pwa" + stamp));
    ok("B: başkasının memosunda menü yok", (await card.locator(".memo-head .menu, .memo-head button").count()) === 0);
  }
  await B.page.screenshot({ path: OUT + "/explore_B.png", fullPage: true });

  // ---------- 2) mobile sweep (account A on iPhone) ----------
  const M = await browser.newContext({ ...devices["iPhone 13"] });
  const mp = await M.newPage();
  const mErrs = [];
  mp.on("pageerror", e => mErrs.push(e.message));
  await mp.goto(URL, { waitUntil: "load" });
  await mp.waitForSelector(".gate-card");
  const inputs = mp.locator(".gate-card form input");
  await inputs.nth(0).fill("pwa" + stamp);
  await inputs.nth(1).fill("test1234");
  await mp.locator(".gate-card form button[type=submit]").click();
  await mp.waitForSelector("#comp-ta", { timeout: 20000 });
  for (const v of ["feed", "explore", "calendar", "break", "trash", "settings"]) {
    await go(mp, v); await mp.waitForTimeout(600);
    const o = await overflow(mp);
    ok(`mobil ${v}: yatay taşma yok`, o <= 1, "taşma=" + o + "px");
    await mp.screenshot({ path: `${OUT}/m_${v}.png`, fullPage: true });
  }
  // chess on mobile
  await go(mp, "break");
  await mp.getByRole("button", { name: /^Satranç$|^Chess$/ }).click();
  await mp.waitForSelector(".sq");
  const boardW = await mp.locator(".board").evaluate(b => b.getBoundingClientRect().width);
  ok("mobil satranç tahtası ekrana sığıyor", boardW > 250 && boardW <= 390, "w=" + boardW);
  await mp.screenshot({ path: `${OUT}/m_chess.png`, fullPage: true });

  // ---------- 3) chess AI + pass (desktop, account A) ----------
  const p = A.page;
  await go(p, "break");
  await p.getByRole("button", { name: /^Satranç$|^Chess$/ }).click();
  await p.getByRole("button", { name: /Bilgisayara karşı|vs computer/i }).click();
  await p.waitForTimeout(2500);
  await p.waitForSelector(".sq");
  const sizeBefore = await p.locator(".board").evaluate(b => b.getBoundingClientRect().width);
  const human = (await p.locator(".board").evaluate(b => b.firstElementChild.dataset.sq)) === "a8" ? "w" : "b";
  const mv = async (from, to) => { await p.click(`.sq[data-sq="${from}"]`); await p.click(`.sq[data-sq="${to}"]`); };
  // play e4 (or e5 if black); then wait for AI reply
  const pieces = () => p.evaluate(() => [...document.querySelectorAll(".sq .pc")].length);
  if (human === "w") {
    await mv("e2", "e4");
    await p.waitForTimeout(2500);
    const occ = await p.evaluate(() => !!document.querySelector('.sq[data-sq="e4"] .pc'));
    ok("AI modu: e4 oynandı", occ);
    const blackMoved = await p.evaluate(() => {
      const init = "a8b8c8d8e8f8g8h8a7b7c7d7e7f7g7h7".match(/../g);
      return init.some(s => !document.querySelector(`.sq[data-sq="${s}"] .pc.b`));
    });
    ok("AI modu: bilgisayar cevap verdi", blackMoved);
  } else ok("AI modu: insan siyah, atlandı", true, "humanSide=b");
  const sizeAfter = await p.locator(".board").evaluate(b => b.getBoundingClientRect().width);
  ok("AI modu: tahta boyutu sabit", Math.abs(sizeAfter - sizeBefore) < 1);
  ok("AI modu: taş sayısı 32", (await pieces()) === 32);

  await p.getByRole("button", { name: /İki kişi|Pass/ }).click();
  await p.waitForTimeout(2500);
  await p.waitForSelector(".sq");
  // Scholar's mate in pass mode
  const seq = [["e2","e4"],["e7","e5"],["f1","c4"],["b8","c6"],["d1","h5"],["g8","f6"],["h5","f7"]];
  for (const [a, b] of seq) { await mv(a, b); await p.waitForTimeout(150); }
  await p.waitForTimeout(800);
  const txt = await p.locator("main, #app").first().innerText();
  ok("İki kişi modu: çoban matı tanındı", /mat|checkmate|kazandı|wins/i.test(txt));
  await p.screenshot({ path: OUT + "/chess_pass_mate.png", fullPage: true });

  const allErrs = [...A.errs, ...B.errs, ...mErrs].filter(e => !/firebasestorage|CORS|favicon/i.test(e));
  ok("konsol/sayfa hatası yok", allErrs.length === 0, allErrs.slice(0, 5).join(" | "));

  for (const r of results) console.log(r.join("  "));
  console.log("test kullanıcıları:", "pwa" + stamp, "pwb" + stamp);
  await browser.close();
})().catch(e => { console.error("CRASH", e); for (const r of results) console.log(r.join("  ")); process.exit(1); });
