# 🪶 Merlfy

Kişisel, çok profilli **memo defteri**. Memos / Memogram tarzında: aklına geleni
saniyeler içinde yaz, markdown ile biçimlendir, `#etiket` ile grupla, zaman
akışında ve aktivite ısı haritasında gör.

**Tek dosya, backend yok.** Bütün veriler tarayıcının içinde (IndexedDB) saklanır;
hiçbir sunucuya gönderilmez.

---

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `merlfy.html` | Uygulamanın tamamı. Çift tıkla, tarayıcıda açılır. |
| `merlfy-bot.mjs` | Telegram köprüsü (Memogram). İsteğe bağlı. |
| `README.md` | Bu dosya. |

---

## Çalıştırma

`merlfy.html` dosyasına çift tıkla — hepsi bu. Kurulum, derleme, internet gerekmez
(yalnızca yazı tipleri CDN'den yüklenir; çevrimdışı da çalışır, yazı tipi sistemden gelir).

İlk açılışta bir **profil** oluşturursun. Aynı tarayıcıda birden fazla profil
olabilir (aile, iş/kişisel, vb.); her profilin memoları ayrıdır. İlk profil
"sahip" olur ve Ayarlar'dan diğer profilleri yönetebilir.

Hızlıca denemek için giriş ekranındaki **"Demo profilini aç"** bağlantısını kullan.

### Özellikler
- Markdown: başlık, liste, görev listesi `- [ ]`, kod bloğu, tablo, alıntı, link, görsel
- `#etiket` otomatik yakalanır → tıkla, filtrele; etiket bulutu + sayaç
- Görünürlük: Özel / Çalışma alanı / Herkese açık — **Keşfet** sekmesi profiller arası paylaşımı gösterir
- Görsel: sürükle-bırak veya yapıştır (otomatik küçültülür)
- Arama, tarih & etiket filtresi, görünürlük filtresi, 🖼 "sadece görselli" filtresi
- Aktivite ısı haritası + seri (streak) sayacı, seri kilometre taşlarında konfeti
- **Günün kıvılcımı** — her gün dönen yazma sorusu, tek tıkla composer'a ekle
- **Geçen bugün** — 1 hafta / 1 ay / 1 yıl önce yazdıkların yüzeye çıkar
- **Rozetler** — 10 başarı (ilk memo, 7/30 gün seri, 100 memo, gece kuşu, etiketçi…), açılınca kutlama
- **Paylaşım kartları** — memoyu ya da "Merlfy Karnem" özetini görsel kart olarak paylaş
  (mobilde doğrudan hikâyeye; masaüstünde indir/kopyala)
- Bugün yazıp yazmadığını gösteren günlük hedef rozeti
- Çöp kutusu (30 gün) + geri yükleme
- **Mola** sekmesi: 3 mini oyun
  - **Hafıza** — kart eşleştirme
  - **Hızlı Matematik** — 30 saniyede kaç soru
  - **Satranç** — bilgisayara karşı (3 zorluk) veya iki kişi (sırayla).
    Hamle geçerliliği, alınan taşlar, şah/mat tespiti, geri alma, PGN dışa aktarma.
  - Her oyunun **kendi skor tablosu** (IndexedDB): oyuncu adı, puan, tarih, en yüksek skor.
    Satrançta kazanan/kaybeden + hamle sayısı da tutulur.
- Açık / koyu / sistem teması, Türkçe / İngilizce
- Dışa / içe aktarma (JSON yedek)
- Klavye kısayolları: `n` yeni memo · `/` ara · `g a` akış · `g k` keşfet · `g t` takvim · `?` tümü

### Yedekleme
Ayarlar → Veri → **Dışa aktar**. Metni kopyala ya da `.json` dosyası indir.
Geri yüklemek için **İçe aktar** — mevcut verilerle birleştirilir (çakışma olmaz).

> Tarayıcı verisi silinirse (site verilerini temizleme, farklı tarayıcı, gizli pencere)
> memolar gider. Düzenli olarak dışa aktar.

---

## Telegram köprüsü (Memogram)

Telegram'a yazdıklarını Merlfy'ye taşır. Tarayıcı uygulaması bir bot çalıştıramadığı
için köprü ayrı bir küçük betiktir; kendi bilgisayarında çalışır.

### Kurulum
1. Telegram'da **@BotFather** ile bir bot oluştur, token'ı al.
2. Node.js 18+ kurulu olsun.
3. Betiği çalıştır:
   ```bash
   MERLFY_BOT_TOKEN=123456:ABC-DEF node merlfy-bot.mjs
   ```
   Windows PowerShell:
   ```powershell
   $env:MERLFY_BOT_TOKEN="123456:ABC-DEF"; node merlfy-bot.mjs
   ```
4. Telegram'da bota yaz:
   - `/pair KOD` — KOD'u Merlfy → Ayarlar → Telegram bölümünden al (her profile özel)
   - sonra istediğin gibi düz mesaj / fotoğraf gönder → `✓ kaydedildi`
5. Merlfy'de: **Ayarlar → Telegram → "Telegram kutusunu içe aktar"** → betiğin ürettiği
   `merlfy-telegram-inbox.json` dosyasını seç. Yeni mesajlar memo olur (tekrarlar atlanır).

### Seçenekler
| | |
|---|---|
| `--token 123:ABC` | token'ı argümanla ver |
| `--out yol.json` / `MERLFY_INBOX` | çıktı dosyasının yolu |
| `--no-photos` | fotoğrafları indirme (dosyayı küçük tutar) |
| `MERLFY_MAX_PHOTO` | maks. foto boyutu (bayt, varsayılan 4 MB) |

`/pair` kullanmazsan mesajlar kodsuz kaydedilir; içe aktarırken
**"Tüm mesajları bu profile aktar"** kutusunu işaretle.

---

## Sınırlar (dürüstçe)

- **Çok kullanıcılı** = aynı cihaz/tarayıcıdaki yerel profiller. Cihazlar arası
  gerçek senkron yok (backend yok). Cihazlar arası taşıma: dışa/içe aktarma.
- **Telegram** otomatik akmaz; köprü betiği + tek tıkla içe aktarma gerekir.
- Görseller base64 olarak tarayıcıda tutulur; binlerce büyük görsel depolamayı şişirir.
