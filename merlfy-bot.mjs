#!/usr/bin/env node
/*
 * merlfy-bot.mjs — Merlfy için Telegram köprüsü (Memogram tarzı)
 * ---------------------------------------------------------------
 * Bu betik kendi bilgisayarında çalışır, sunucu gerektirmez.
 * Telegram botuna yazdığın her mesajı bir JSON dosyasına yazar;
 * o dosyayı Merlfy > Ayarlar > Telegram bölümünden içe aktarırsın.
 *
 * Kurulum:
 *   1) Telegram'da @BotFather ile bir bot oluştur, token'ı al.
 *   2) Node.js 18+ kurulu olsun.
 *   3) Çalıştır:
 *        MERLFY_BOT_TOKEN=123:ABC node merlfy-bot.mjs
 *      veya
 *        node merlfy-bot.mjs --token 123:ABC
 *
 * Telegram'da:
 *   /start            → yardım
 *   /pair ABC123      → mesajlarını Merlfy'deki bir profile bağla
 *                       (kodu Merlfy > Ayarlar > Telegram'da bulursun)
 *   düz mesaj / foto  → memo olarak kaydedilir
 *
 * Çıktı dosyası (varsayılan ./merlfy-telegram-inbox.json):
 *   { generatedAt, lastUpdateId, pairings:{chatId:code}, messages:[ {id,chatId,from,date,text,images,pairingCode} ] }
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/* ---------- args / config ---------- */
const argv = process.argv.slice(2);
const argOf = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };

const TOKEN = process.env.MERLFY_BOT_TOKEN || argOf("--token");
const OUT   = path.resolve(process.env.MERLFY_INBOX || argOf("--out") || "merlfy-telegram-inbox.json");
const INCLUDE_PHOTOS = !argv.includes("--no-photos");
const MAX_PHOTO_BYTES = Number(process.env.MERLFY_MAX_PHOTO || 4_000_000);

if (!TOKEN) {
  console.error("HATA: bot token yok. MERLFY_BOT_TOKEN ortam değişkenini ayarla ya da --token ver.");
  process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

/* ---------- inbox dosyası ---------- */
const emptyInbox = () => ({ app: "merlfy", version: 1, generatedAt: new Date().toISOString(), lastUpdateId: 0, pairings: {}, messages: [] });
let inbox = emptyInbox();

async function loadInbox() {
  if (existsSync(OUT)) {
    try {
      const parsed = JSON.parse(await readFile(OUT, "utf8"));
      inbox = { ...emptyInbox(), ...parsed };
      inbox.pairings ||= {};
      inbox.messages ||= [];
    } catch {
      console.warn("Uyarı: mevcut inbox dosyası okunamadı, yenisi oluşturuluyor.");
    }
  }
}
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 400);
}
async function persist() {
  inbox.generatedAt = new Date().toISOString();
  // en fazla son 5000 mesajı tut
  if (inbox.messages.length > 5000) inbox.messages = inbox.messages.slice(-5000);
  await writeFile(OUT, JSON.stringify(inbox, null, 2), "utf8");
}

/* ---------- Telegram API ---------- */
async function tg(method, body) {
  const r = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await r.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}
async function reply(chatId, text) {
  try { await tg("sendMessage", { chat_id: chatId, text }); } catch (e) { console.warn("reply hata:", e.message); }
}

async function downloadPhoto(fileId) {
  const f = await tg("getFile", { file_id: fileId });
  if (f.file_size && f.file_size > MAX_PHOTO_BYTES) return null;
  const r = await fetch(`${FILE_API}/${f.file_path}`);
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.byteLength > MAX_PHOTO_BYTES) return null;
  const ext = (f.file_path.split(".").pop() || "jpg").toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

/* ---------- mesaj işleme ---------- */
function nameOf(from) {
  if (!from) return "Telegram";
  return [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || String(from.id);
}

async function handleMessage(update) {
  const msg = update.message || update.channel_post;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text = (msg.text || msg.caption || "").trim();

  // komutlar
  if (text.startsWith("/start")) {
    await reply(chatId,
      "🪶 Merlfy köprüsü aktif.\n\n" +
      "• Buraya yazdığın her mesaj / gönderdiğin foto memo olarak kaydedilir.\n" +
      "• Bir Merlfy profiline bağlamak için:  /pair KOD\n" +
      "  (KOD: Merlfy > Ayarlar > Telegram)\n" +
      "• Sonra Merlfy'de:  Ayarlar > Telegram > Kutuyu içe aktar.");
    return;
  }
  if (text.startsWith("/pair")) {
    const code = text.split(/\s+/)[1];
    if (!code) { await reply(chatId, "Kullanım: /pair KOD"); return; }
    inbox.pairings[String(chatId)] = code.toUpperCase();
    scheduleSave();
    await reply(chatId, `✓ Bu sohbet '${code.toUpperCase()}' koduna bağlandı.`);
    return;
  }
  if (text.startsWith("/help")) {
    await reply(chatId, "Düz mesaj yaz ya da foto gönder → memo olur.\n/pair KOD ile bir profile bağla.");
    return;
  }

  // görseller
  const images = [];
  if (INCLUDE_PHOTOS && Array.isArray(msg.photo) && msg.photo.length) {
    const biggest = msg.photo[msg.photo.length - 1];
    try {
      const dataUrl = await downloadPhoto(biggest.file_id);
      if (dataUrl) images.push(dataUrl);
    } catch (e) { console.warn("foto indirilemedi:", e.message); }
  }
  if (INCLUDE_PHOTOS && msg.document && /^image\//.test(msg.document.mime_type || "")) {
    try {
      const dataUrl = await downloadPhoto(msg.document.file_id);
      if (dataUrl) images.push(dataUrl);
    } catch { /* yok say */ }
  }

  if (!text && !images.length) return; // sticker, ses vb. atla

  inbox.messages.push({
    id: update.update_id,
    chatId,
    from: nameOf(msg.from),
    date: msg.date, // unix saniye
    text,
    images,
    pairingCode: inbox.pairings[String(chatId)] || null,
  });
  scheduleSave();
  await reply(chatId, images.length ? "✓ kaydedildi (📷)" : "✓ kaydedildi");
}

/* ---------- ana döngü (long polling) ---------- */
let running = true;
process.on("SIGINT", async () => { running = false; console.log("\nkapatılıyor…"); await persist(); process.exit(0); });

async function main() {
  await loadInbox();
  const me = await tg("getMe");
  console.log(`🪶 Merlfy botu bağlandı: @${me.username}`);
  console.log(`   inbox dosyası: ${OUT}`);
  console.log(`   fotoğraflar: ${INCLUDE_PHOTOS ? "açık" : "kapalı"}  ·  durdurmak için Ctrl+C\n`);

  let offset = (inbox.lastUpdateId || 0) + 1;
  while (running) {
    try {
      const updates = await tg("getUpdates", { offset, timeout: 50, allowed_updates: ["message", "channel_post"] });
      for (const u of updates) {
        offset = u.update_id + 1;
        inbox.lastUpdateId = u.update_id;
        try { await handleMessage(u); }
        catch (e) { console.warn("mesaj işlenemedi:", e.message); }
      }
      if (updates.length) scheduleSave();
    } catch (e) {
      console.warn("polling hata:", e.message, "— 5 sn sonra tekrar");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
main().catch((e) => { console.error("ölümcül hata:", e); process.exit(1); });
