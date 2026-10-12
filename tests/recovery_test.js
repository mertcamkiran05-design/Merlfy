// Parola kurtarma (Google bağlantısı) testi. Gerçek Google penceresi otomatikleştirilemediği için
// signInWithPopup / linkWithPopup taklit edilir; akışın geri kalanı gerçek Firebase'e karşı çalışır.
const { chromium } = require("playwright");
const URL = process.argv[2] || "http://localhost:5178/";
const stamp = Date.now().toString(36);
const uname = "pwr" + stamp;
const results = [];
const ok = (name, cond, extra = "") => results.push([cond ? "PASS" : "FAIL", name, extra]);

async function login(page, user, pass) {
  const inp = page.locator(".gate-card form input");
  await inp.nth(0).fill(user); await inp.nth(1).fill(pass);
  await page.locator(".gate-card form button[type=submit]").click();
}
async function logout(page) {
  const b = page.locator("button", { hasText: "Çıkış" });
  for (let i = 0; i < await b.count(); i++) if (await b.nth(i).isVisible()) { await b.nth(i).click(); break; }
  await page.waitForSelector(".gate-card", { timeout: 20000 });
}
async function openSettings(page) {
  const b = page.locator("button", { hasText: "Ayarlar" });
  for (let i = 0; i < await b.count(); i++) if (await b.nth(i).isVisible()) { await b.nth(i).click(); break; }
  await page.waitForSelector("#recovery-card", { timeout: 10000 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector(".gate-card", { timeout: 20000 });

  // 1) giriş ekranında "Parolamı unuttum" → açıklama penceresi
  ok("girişte 'Parolamı unuttum' var", await page.locator("#forgot-btn").isVisible());
  await page.click("#forgot-btn");
  ok("kurtarma penceresi açıldı", await page.locator(".modal:has-text('Parolanı mı unuttun?')").isVisible());
  ok("Google ile gir butonu var", await page.locator("#google-recover").isVisible());
  await page.locator(".modal .icon-btn").click();

  // 2) hesap aç
  await page.getByRole("button", { name: /Yeni profil/ }).click();
  const inp = page.locator(".gate-card form input");
  await inp.nth(0).fill(uname); await inp.nth(1).fill("Kurtarma Test");
  await inp.nth(2).fill("eski1234"); await inp.nth(3).fill("eski1234");
  await page.locator(".gate-card form button[type=submit]").click();
  await page.waitForSelector("#comp-ta", { timeout: 20000 });

  // 3) Ayarlar → Hesap kurtarma kartı; bağlama hatası ve iptal davranışı
  await openSettings(page);
  ok("Ayarlar'da Hesap kurtarma kartı", await page.locator("#recovery-card h3", { hasText: "Hesap kurtarma" }).isVisible());
  ok("bağlı değilken 'Google hesabını bağla' butonu", await page.locator("#google-link").isVisible());
  await page.evaluate(() => { firebase.auth().currentUser.linkWithPopup = async () => { const e = new Error("x"); e.code = "auth/credential-already-in-use"; throw e; }; });
  await page.click("#google-link");
  ok("başka hesaba bağlı Google → anlaşılır hata", await page.locator("#recovery-card .err", { hasText: "başka bir Merlfy" }).isVisible());
  await page.evaluate(() => { firebase.auth().currentUser.linkWithPopup = async () => { const e = new Error("x"); e.code = "auth/popup-closed-by-user"; throw e; }; });
  await page.click("#google-link");
  ok("pencere kapatılınca hata gösterilmiyor", !(await page.locator("#recovery-card .err").isVisible()));

  // 4) çıkış → "Parolamı unuttum" → (taklit) Google girişi → yeni parola penceresi
  await logout(page);
  await page.click("#forgot-btn");
  await page.evaluate(([u]) => {
    // bağlı Google hesabıyla girişi taklit et: aynı Firebase kullanıcısına giriş yapılır
    firebase.auth().signInWithPopup = () => firebase.auth().signInWithEmailAndPassword(u + "@merlfy.local", "eski1234");
  }, [uname]);
  await page.click("#google-recover");
  let modalUp = false;
  try { await page.waitForSelector(".modal input[type=password]", { timeout: 20000 }); modalUp = true; } catch {}
  ok("Google ile girişten sonra 'Yeni parola belirle' penceresi", modalUp);
  ok("hesaba girildi (giriş ekranı kapandı)", await page.locator(".gate-card").count() === 0);
  if (modalUp) {
    const np = page.locator(".modal input[type=password]");
    await np.fill("kisa");
    await page.locator(".modal .btn.primary").click();
    ok("kısa parola reddediliyor", await page.locator(".modal .err", { hasText: "en az 6" }).isVisible());
    await np.fill("yeni5678");
    await page.locator(".modal .btn.primary").click();
    await page.waitForSelector(".modal", { state: "detached", timeout: 15000 }).catch(() => {});
    ok("yeni parola kaydedildi, pencere kapandı", await page.locator(".modal").count() === 0);
  }

  // 5) eski parola artık çalışmıyor, yeni parola çalışıyor
  await logout(page);
  await login(page, uname, "eski1234");
  ok("eski parola reddediliyor", await page.locator(".gate-card .err", { hasText: "hatalı" }).isVisible({ timeout: 15000 }).catch(() => false)
    || await page.waitForSelector(".gate-card .err:visible", { timeout: 15000 }).then(() => true).catch(() => false));
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".gate-card", { timeout: 20000 });
  await login(page, uname, "yeni5678");
  let inNew = false;
  try { await page.waitForSelector("#comp-ta", { timeout: 20000 }); inNew = true; } catch {}
  ok("yeni parolayla giriş çalışıyor", inNew);

  // 6) kurtarma bayrağı normal girişte pencere açmıyor
  ok("normal girişte yeni parola penceresi çıkmıyor", await page.locator(".modal").count() === 0);

  const bad = errs.filter(e => !/deprecated|auth\/wrong-password|auth\/invalid-credential|400/.test(e));
  ok("beklenmeyen konsol hatası yok", bad.length === 0, bad.slice(0, 3).join(" | "));

  await browser.close();
  for (const [s, n, x] of results) console.log(s.padEnd(5), n, x);
  console.log("test kullanıcısı:", uname);
  process.exit(results.some(r => r[0] === "FAIL") ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
