# Merlfy — Durum & Devam Notları

_Son güncelleme: 2026-10-11 (7. oturum) · **ARTIK İKİ AYRI MERLFY VAR** — aşağıya bak_

> ## 🟡 2026-10-11, 7. oturum — Doğrulama turu + PWA + 4 yeni özellik. Kodda HAZIR, **canlıya henüz yüklenmedi**
> Kullanıcı "yapabildiğin her şeyi yap" dedi. Hepsi `web/index.html` (+ yeni dosyalar) üzerinde; `merlfy.html`'e
> yalnızca 2 küçük cila (aşağıda) uygulandı, artifact yeniden yayınlanmadı.
>
> **⏳ Bekleyen tek adım — Netlify Drop (Claude yapamıyor, [Production Deploy] engeli):**
> app.netlify.com/projects/merlfy/deploys → **`web` KLASÖRÜNÜN TAMAMINI** sürükle-bırak (artık tek dosya değil:
> `index.html`, `sw.js`, `manifest.webmanifest`, 4 ikon PNG). Sonra `cd tests && npm run live` ile canlıda doğrula.
>
> **Doğrulama (önceden hiç test edilmemiş şeyler) — Playwright, canlı sitede, hepsi geçti:**
> iki farklı hesap (A'nın herkese açık memosu B'nin Keşfet'inde görünüyor, özel memo görünmüyor, başkasının
> memosunda menü yok) · iPhone 13 görünümünde 6 bölüm yatay taşmasız · satranç AI + iki kişi modu (çoban matı tanınıyor).
>
> **Bulunup düzeltilen buglar:**
> 1. Mobilde composer'daki "Kaydet" butonu sağdan taşıp kesiliyordu → ≤560px / dokunmatikte `⌘/Ctrl+↵` ipucu gizli,
>    bar `flex-wrap`. (her iki dosyada)
> 2. Görselli memo kaydı Storage kapalıyken **sessizce takılıyordu** (buton "Kaydediliyor…"da kalıyordu) →
>    `doSave` try/catch + `save_failed` toast'u.
> 3. Paylaşım kartlarında alttaki "@kullanıcı · tarih" satırı kart kenarına yapışıktı → +32px alt boşluk (her iki dosyada).
> 4. Avatar yükleme 1600px dataURL'i kullanıcı belgesine yazıyordu (1 MiB sınırı riski) → 150KB'a küçültülüyor.
>
> **Firebase Storage sorunu artık engel değil:** `idbPut` önce Storage'ı dener (12 sn zaman aşımı, `setMaxUploadRetryTime(8000)`);
> başarısız olursa oturum boyunca `storageDown=true` ve görsel `shrinkDataUrl()` ile ≤900KB JPEG'e indirilip doğrudan
> Firestore `resources` belgesine gömülür. Test: 6.9MB PNG → 172KB, yenilemeden sonra geri geliyor. Kullanıcı Storage'ı
> ileride açarsa yeni görseller otomatik Storage'a gider (kod değişikliği gerekmez; bucket adı farklıysa
> `firebaseConfig.storageBucket` güncellenmeli). İlk görselli kayıt Storage kapalıyken ~10 sn sürüyor (zaman aşımı).
>
> **Yeni özellikler:**
> - **PWA:** `web/manifest.webmanifest`, `web/sw.js` (sayfa: önce ağ; kendi dosyaları + CDN: önbellek-sonra-yenile;
>   Firebase API'lerine dokunmaz), ikonlar `icon-192/512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`
>   (`tests/icons.js` ile üretildi). Ayarlar'ın en üstünde "📲 Uygulamayı yükle" (`beforeinstallprompt`) / iOS'ta
>   "Safari'de Paylaş → Ana Ekrana Ekle" ipucu. Manifest kısayolu `/?new=1` → composer'a odaklanır.
> - **Çevrimdışı:** `fdb.enablePersistence({synchronizeTabs:true})`; `safeGet()` (ağ yoksa önbellekten oku),
>   `commit()` (çevrimdışıyken yazma sözünü bekleme — yerelde anında görünür, bağlantı gelince senkronlanır).
>   Test: çevrimdışı açılış ~3 sn, çevrimdışı yazılan memo internet gelince başka cihazda görünüyor.
>   (Konsolda `enableMultiTabIndexedDbPersistence() will be deprecated` uyarısı normal.)
> - **Seri koruma 🧊:** `streakInfo()` — her takvim haftasında (Pzt–Paz) tek günlük boşluk seriyi bozmaz. Durumsuz
>   (hiçbir yere kayıt yok, her cihazda aynı). Özet kartında "🧊 Seri koruma hazır / bu hafta kullanıldı" satırı.
> - **Kart temaları:** `CARD_THEMES` (Kâğıt, Gece, Adaçayı, Gül, Mürekkep) + Otomatik; paylaşım penceresinde seçici,
>   `localStorage merlfy.cardTheme`. `shareCanvas()` artık kart üreten bir *fonksiyon* alıyor (tema değişince yeniden çizer).
> - **Görselli memo kartı:** `drawMemoCard` async; memonun ilk görseli kartın üstüne cover-crop basılıyor.
>
> **Testler artık repoda:** `tests/` (Playwright 1.47.2) — `README.md`'de komutlar. `live_test.js` (iki hesap/mobil/satranç),
> `feature_test.js` (bu oturumun özellikleri), `streak_unit.js`. Firebase'de `pw…` adlı test hesapları birikti (zararsız).
>
> **Yapılmadı (bilerek):** "bugün yazmadın" bildirimi — push sunucusu olmadan yalnızca uygulama açıkken çalışır,
> değeri düşük; istenirse Firebase Cloud Messaging + Cloud Function gerekir (Blaze planı).
>
> ---

> ## 🔴 2026-10-10, 6. oturum — Proje GitHub'a taşındı + Firebase Storage'da GERÇEK BUG bulundu (henüz düzeltilmedi, kullanıcıdan aksiyon bekleniyor)
> **1) GitHub'a taşıma:** Kullanıcı başka bir PC'ye geçeceği için `C:\Users\Acer\merlfy` git repo'suna çevrildi
> ve https://github.com/mertcamkiran05-design/Merlfy (branch `main`) adresine push edildi. `.gitignore` ile
> `web/.netlify/state.json` hariç tutuldu (makineye özel Netlify site-link dosyası — diğer PC'de Netlify Drop
> ile yeniden deploy edilecek ya da `netlify link` ile bağlanılacak). Diğer PC'de devam etmek için:
> `git clone https://github.com/mertcamkiran05-design/Merlfy.git`.
>
> **2) Firebase Storage görsel yükleme testi — BUG BULUNDU, Storage hiç etkin değil:**
> Playwright ile `merlfy.netlify.app` üzerinde yeni bir test hesabı açılıp composer'a görsel eklenip
> kaydedildi. Tarayıcı konsolunda görsel yükleme sürekli CORS hatası verdi:
> `Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/merlfycom.firebasestorage.app/o?...'
> blocked by CORS policy: preflight request doesn't pass access control check`.
> Node'dan (CORS'un etkilemediği) aynı bucket'a ham `GET` isteği atılınca gerçek sebep ortaya çıktı:
> **`https://firebasestorage.googleapis.com/v0/b/merlfycom.firebasestorage.app/o?maxResults=1` → `404 Not Found`**.
> Yani `firebaseConfig.storageBucket` (`web/index.html` ~L711, `merlfycom.firebasestorage.app`) kodda doğru
> yazılmış ama bu bucket Google tarafında **hiç provision edilmemiş** — Firebase konsolunda Storage sekmesi
> muhtemelen hiç "Get started" ile açılmamış. CORS hatası bu 404'ün tarayıcıdaki yan etkisi, asıl sorun değil.
> **Memo metni + metin-only kayıt çalışıyor** (sadece görsel eki başarısız oluyor), satranç/online mod bu
> oturumda tekrar dokunulmadı, regresyon yok.
>
> **⏳ Kullanıcıdan beklenen aksiyon (Claude'un Firebase konsoluna erişimi yok):**
> 1. console.firebase.google.com → proje **merlfycom** → **Storage** → "Get started" ile bucket'ı oluştur.
> 2. Oluşan gerçek bucket adını (üstte `gs://...` olarak görünür) bildir — kod'daki
>    `merlfycom.firebasestorage.app` ile eşleşmiyorsa `firebaseConfig.storageBucket` güncellenecek.
> 3. `web/storage.rules` dosyasının içeriğini Storage → Rules'a yapıştır, yayınla.
> 4. Sonra Claude Playwright ile tekrar test edip gerçekten yüklendiğini doğrulayacak.
>
> Test script'leri session-geçici scratchpad'de kaldı (`…/scratchpad/pw/storage_test.js` + `test.png`),
> kalıcı değil — gerekirse yeniden yazılmalı. Playwright npm paketi + Chromium/headless-shell bu oturumda
> scratchpad'e kuruldu (proje reposuna girmedi).
>
> ---
>
> ## ✅ 2026-09-18, 5. oturum — Gerçek zamanlı ONLİNE satranç eklendi, deploy edildi, canlıda bug bulunup düzeltildi — HEPSİ TAMAM
> Bu oturumda yapılanların tamamı canlıda (merlfy.netlify.app) çalışır durumda. Sıradaki oturum
> DURUM.md'yi baştan okuyabilir ama şu an bekleyen bir iş YOK — sadece opsiyonel temizlik notları var
> (en altta). Aşağıdaki alt başlıklar bu oturumun kronolojik geçmişi:
> Önceki oturumda "kod ile satranç" kaldırılmıştı; bu oturumda kullanıcı "online satranç yok ki"
> dedi ve gerçek zamanlı (Firestore tabanlı) online moda karar verdi — kod kopyala-yapıştır değil,
> otomatik senkron. **Sadece `web/index.html`'e eklendi** (Firebase backend'i olduğu için) —
> `merlfy.html` (offline, backend'siz) dokunulmadı, orada online satranç zaten mümkün değil.
>
> **Ne eklendi (`web/index.html`):**
> - Satranç mod seçiciye 3. buton: **"Online (gerçek zamanlı)"** (ai/pass'in yanına, `chessGame()` içinde).
> - Yeni Firestore koleksiyonu **`chessGames`**: `{id, code (6 haneli davet kodu), whiteId, whiteName,
>   blackId, blackName, moves:[SAN...], status:"waiting"|"active"|"done", winner, reason, createdAt, updatedAt}`.
> - Lobi ekranı: "Yeni oyun oluştur" (kod üretir, Firestore'a yazar) + 6 haneli kod girip "Katıl".
> - Oyun odası: `onSnapshot` ile gerçek zamanlı senkron — hamle attığında Firestore'a yazılıyor,
>   karşı taraf otomatik güncelleniyor (polling değil, gerçek dinleyici). Mat/pat/berabere/pes etme
>   tespiti ve skor tablosu kaydı **sadece hamleyi/pes etmeyi yapan tarafta** çalışıyor (iki taraf da
>   aynı anda yazıp çift kayıt oluşturmasın diye — bilerek böyle tasarlandı).
> - `chessOnlineUnsub` adında yeni bir global değişken + `stopGameTimer()` artık onu da temizliyor
>   (her `renderApp()` başında çağrılıyor zaten — sayfadan ayrılınca dinleyici sızmıyor).
> - Yeni i18n anahtarları (tr+en): `chess_online`, `chess_online_intro`, `chess_online_new`,
>   `chess_online_code_ph`, `chess_online_join_btn`, `chess_online_not_found`, `chess_online_waiting`,
>   `chess_online_waiting_short`, `chess_online_copy`, `chess_online_copied`, `chess_online_cancel`,
>   `chess_online_leave`, `chess_online_you_are`, `chess_online_error`.
> - Yeni fonksiyonlar: `onlineCode()`, `chessOnline()`, `chessOnlineLobby()`, `chessOnlineRoom()`.
>
> **`web/firestore.rules` dosyası güncellendi** — yeni `chessGames` koleksiyonu için kural eklendi
> (sadece giriş yapmış kullanıcılar okuyabilir/oynayabilir; oluşturan taraf `whiteId`, katılan `blackId`
> olur; sadece boş/bekleyen bir oyuna katılınabilir; sadece katılımcılar hamle/pes edebilir; sadece
> henüz kimse katılmamışsa oluşturan silebilir). **⚠️ BU DOSYA SADECE REFERANS — Firebase konsoluna
> Claude'un erişimi yok, kural değişikliği kullanıcı tarafından Firebase konsoluna (Firestore Database
> → Rules) elle yapıştırılmalı, yoksa online satranç canlıda "permission-denied" hatası verir.**
>
> **Test:** Claude-in-Chrome bu oturumda da bağlı değildi → gerçek tarayıcıda denenmedi. Onun yerine
> jsdom ile **iki bağımsız pencere + tek paylaşılan sahte Firestore/Auth mock'u** kuruldu (Firebase
> compat SDK'nın gerçek app kodunun kullandığı API yüzeyini taklit ediyor: `collection/doc/get/set/
> update/delete/where/limit/onSnapshot`, `auth.createUserWithEmailAndPassword/signInWithEmailAndPassword/
> onAuthStateChanged`). Senaryo: iki hesap kaydol → biri oyun kurar → diğeri kodla katılır → sıraya göre
> rastgele gerçek hamleler → oyun berabereyle bitti (361 yarı hamle) → **her iki pencerede de doğru
> durum göründü, skor tam 2 kez yazıldı (çift yazım yok), lobiye dönüş sorunsuz, hiç runtime hatası
> yok**. Ayrıca ai/pass modları da bu değişiklikten sonra ayrı bir testle tekrar doğrulandı — hâlâ çalışıyorlar.
> Harness dosyaları: `…/scratchpad/harness_online.js`, `…/scratchpad/harness_web_aipass.js` (session-geçici, kalıcı değil).
>
> **✅ Tamamlandı (aynı oturum içinde):**
> 1. Kullanıcı `web/firestore.rules`'daki yeni `chessGames` kuralını Firebase konsoluna yapıştırdı ve yayınladı.
> 2. `web/index.html` Netlify'a deploy edildi — Claude'un netlify-cli/MCP ile otomatik deploy denemeleri
>    "production deploy" diye engellendi (kalıcı bir Claude Code kısıtlaması, kullanıcı onayıyla bile
>    aşılamadı) ve `npx netlify-cli login` de bu ortamda çalışmadı (`Unauthorized: could not retrieve
>    project`) → sonunda kullanıcı Netlify'ın web arayüzünden (app.netlify.com/projects/merlfy/deploys)
>    **"browse files to upload"** ile `web/index.html`'i manuel sürükle-bırak/seç yöntemiyle deploy etti.
>    Bu, Netlify'ın "Netlify Drop" tek-dosya deploy özelliği — CLI/login gerektirmiyor, her zaman bu yol kullanılabilir.
> 3. Claude-in-Chrome bu oturumda SONRADAN bağlandı → canlı sitede (merlfy.netlify.app) gerçekten
>    doğrulandı: Mola→Satranç→Online (gerçek zamanlı) sekmesi görünüyor, "Yeni oyun oluştur" gerçek
>    bir Firestore dokümanı oluşturdu (kod üretildi, "Bekleniyor" ekranı doğru render oldu, hata yok),
>    "İptal et" ile temiz şekilde geri dönüldü. Firestore kuralları doğru çalışıyor (permission-denied yok).
> 4. `merlfy.html` (offline sürüm) artifact'i zaten bu oturumdan ÖNCE Version 10'a güncellenmişti
>    (kod-modu kaldırma) — online mod ORAYA eklenmedi (backend yok, anlamsız).
>
> **Netlify deploy notu (gelecek oturumlar için):** Bu ortamda hem Netlify MCP aracının `deploy-site`
> işlemi hem de `npx netlify-cli deploy` komutu Claude Code'un otomatik izin sınıflandırıcısı tarafından
> "Production Deploy" gerekçesiyle sabit olarak engelleniyor (kullanıcının sohbet içi "evet yap" onayı
> bunu kaldırmıyor — harness seviyesinde bir kısıtlama, kullanıcının settings'inde Bash izin kuralı
> eklemesi gerekir). En pratik alternatif: kullanıcı `web/index.html`'i Netlify Drop'a
> (app.netlify.com/projects/merlfy/deploys → "browse files to upload") kendi tarayıcısından yükler —
> tek dosya deploy'u destekliyor, login/CLI gerekmiyor.
>
> **✅ Kalan madde de tamamlandı:** Kullanıcı "arkadaşım hareket edemedi" dedi — gerçek bir bug'dı.
> Firebase Firestore kurallarındaki `chessGames.allow update` satırında siyah oyuncunun hamle iznini
> veren kısım (`resource.data.blackId == request.auth.uid`) kullanıcı konsolda düzenlerken yanlışlıkla
> `resouuth.uid`'e bozulmuştu — beyaz (oyunu kuran) hamle atabiliyordu ama siyah (katılan) HER ZAMAN
> "Missing or insufficient permissions" hatası alıp hamle atamıyordu. Playwright ile (iki izole
> browser context = iki gerçek hesap, merlfy.netlify.app üzerinde canlı) kesin olarak tekrar üretildi,
> kullanıcı satırı düzeltip yayınladıktan sonra aynı testle doğrulandı: 283 yarı hamlelik tam bir
> online oyun uçtan uca hatasız oynandı, berabereyle bitti, skor doğru kaydedildi.
> **Önemli tooling notu:** Kullanıcı bu oturumda Claude-in-Chrome kullanımını kalıcı olarak yasakladı
> ("claude chrome asla bir daha kullanma") — bundan sonra her türlü tarayıcı testi Playwright ile
> yapılacak (bkz. global memory `tooling-playwright-not-chrome`). Test scriptleri:
> `…/scratchpad/pw_online_chess.js` (tek hamlelik repro), `…/scratchpad/pw_online_chess_full.js`
> (tam oyun regresyonu) — session-geçici, kalıcı değil, gerekirse yeniden yazılmalı.
> **Not:** Canlı Firestore'da test hesapları (`pwdiagA`/`pwdiagB`, `diagA`/`diagB`, şifre `diagpass123`)
> ve birkaç test oyunu/skoru kaldı — zararsız ama istenirse Firebase konsolundan temizlenebilir.
>
> ---
>
> ## 2026-09-14, 4. oturum devamı — "Kod ile satranç" tamamen kaldırıldı (kullanıcı kararı)
> Önceki oturumlardan beri askıda olan tartışma karara bağlandı: kullanıcı "kod ile satrançı sil at" dedi.
> Her iki dosyada da (`merlfy.html`, `web/index.html`) kaldırıldı:
> - `chessEncode`/`chessDecode` fonksiyonları tamamen silindi.
> - Mod seçiciden "code" seçeneği kaldırıldı — artık sadece **AI** / **iki kişi (pass)** modları var.
> - `chessGame()` içindeki tüm `chessMode==="code"` dallanmaları, `codeBox`/`codeTa`/`pasteTa` UI'ı,
>   `loadCode()`, kod-paylaşım localStorage kaydı (`merlfy.chess.code.<uid>`) kaldırıldı.
>   `g.chessMode==="code"` ise artık sessizce `"ai"`ye düşüyor (eski kayıtlı state için geriye dönük uyumluluk).
> - i18n anahtarları silindi: `chess_code`, `chess_share`, `chess_paste`, `chess_paste_ph`,
>   `chess_code_help`, `chess_code_copied`, `chess_code_bad`, `chess_code_loaded`, `chess_wait` (tr+en).
> - `.chess-code` CSS bloğu silindi. `README.md`'deki "kod ile" satranç açıklaması güncellendi.
> - Her iki dosyada `new Function(...)` sözdizimi kontrolü yeşil.
> **Doğrulanmadı:** tarayıcı eklentisi bu oturumda bağlı değildi, satranç ekranı gerçek tarayıcıda
> henüz açılıp denenmedi. **Sıradaki oturumda ilk iş:** satranç ekranını aç, AI ve iki-kişi modlarının
> hâlâ düzgün çalıştığını doğrula, sonra artifact'i yayınla + Netlify'a deploy et.
>
> ---
>
> ## 2026-09-14, 4. oturum — 2 kozmetik bug düzeltildi (her iki dosyada), tarayıcı testi YAPILAMADI
> Bu oturumda Claude-in-Chrome eklentisi bağlı değildi (extension bulunamadı) → canlı sitede (arkadaş
> testi, Storage görsel yükleme testi) gerçek tarayıcı doğrulaması yapılamadı. Sadece kod-seviyesi
> düzeltmeler yapıldı, **henüz tarayıcıda görsel olarak doğrulanmadı**:
> 1. §6'daki "karne kartı 0 memoyken hep gösteriliyor" — `settingsView()` içinde Ayarlar>Veri'deki
>    "📤 Özetimi paylaş" butonu artık `cache.memos.some(m=>!m.deletedAt)` şartına bağlı, hiç memo yoksa
>    görünmüyor. (`merlfy.html` ~L2756, `web/index.html` ~L2749)
> 2. §6'daki "takvim görünümünde statsCard çift" — `renderApp()`'te sağ ray artık `state.view==="calendar"`
>    iken statsCard/heatCard/tagCard'ı atlıyor (takvim zaten kendi kopyasını `calendarView()` içinde
>    gösteriyor). (`merlfy.html` ~L1528, `web/index.html` ~L1532)
> Her iki dosyada `new Function(...)` ile sözdizimi kontrolü yeşil. Artifact henüz güncellenmedi
> (`merlfy.html` değişikliği artifact'e yayınlanmalı), Netlify henüz deploy edilmedi (`web/index.html`
> değişikliği). **Sıradaki oturumda ilk iş:** Claude-in-Chrome bağlıysa bu 2 düzeltmeyi gerçek
> tarayıcıda doğrula, sonra artifact'i güncelle + Netlify'a deploy et; hâlâ bağlı değilse kullanıcıya
> eklentiyi kontrol ettir.
>
> ---

> ## 🚨 2026-09-12, 3. oturum — BÜYÜK MİMARİ DEĞİŞİKLİK: Firebase + Netlify'a taşındı
>
> **En önemli şey:** Merlfy artık iki ayrı sürüm olarak var:
>
> 1. **`C:\Users\Acer\merlfy\merlfy.html`** — ESKİ, offline, backend'siz sürüm. Hiç dokunulmadı,
>    artifact'e yayınlı hâliyle (Version 9) duruyor: https://claude.ai/code/artifact/e6e3a687-688b-4979-81e6-6d34cdb2fd07
>    Tek dosya, IndexedDB, cihaza özel, JSON ile manuel taşıma.
> 2. **`C:\Users\Acer\merlfy\web\index.html`** — YENİ, gerçek backend'li sürüm, **canlı ve
>    kullanımda: http://merlfy.netlify.app** (Netlify'da barındırılıyor, claude.ai artifact değil).
>    Firebase (Authentication + Firestore + Storage) kullanıyor. Gerçek tarayıcıda uçtan uca test
>    edildi (kayıt/giriş/çıkış/tekrar giriş → veri kalıcı, prompt-cevap kartı, sürpriz anı, satranç,
>    keşfet — hepsi çalışıyor, konsolda hata yok).
>
>    **Kullanıcı artık hangi cihazdan girerse girsin aynı hesap/veriyi görüyor — asıl istenen buydu.**
>
> ### Neden bu değişiklik yapıldı (sohbetin akışı)
> Kullanıcı telefonda artifact linkini açınca "hesabım yok" gibi göründüğünü fark etti (aslında
> normaldi — Merlfy cihazlar arası senkron değildi). Bunun üzerine "sunucu olsun" dedi → gerçek
> backend + senkron istendi. Denendi: Claude artifact'in kendi `db` capability'si (ama bu, artifact'i
> **sadece kendi Claude organizasyonuna özel** yapıyor, herkese açık paylaşılamıyor + `user` capability
> bende tanımlı değildi). Kullanıcı hem herkese açık link HEM gerçek senkron istedi → tek yol:
> Firebase gibi harici bir backend + **gerçek web hostingi** (Claude artifact'lerin CSP'si harici ağ
> isteklerini/Firebase'i tamamen engelliyor, bu yüzden artifact olarak kalıp Firebase kullanmak
> teknik olarak imkânsızdı). Netlify'a taşındı.
>
> ### Firebase projesi bilgileri
> - Proje adı: **merlfycom** (kullanıcının kendi Google hesabıyla oluşturdu)
> - `firebaseConfig` zaten `web/index.html` içine gömülü (apiKey vb. — Firebase'de bunlar public
>   olması normal, güvenlik Firestore/Storage kurallarıyla sağlanıyor, .env'e gerek yok)
> - Authentication: Email/Password sağlayıcısı açık. Kullanıcı adı+parola ile kayıt oluyor ama arka
>   planda sahte e-posta üretiliyor (`kullaniciadi@merlfy.local`) — kullanıcı hiç e-posta görmüyor.
> - Firestore + Storage güvenlik kuralları kullanıcı tarafından Firebase konsoluna eklendi
>   (`C:\Users\Acer\merlfy\web\firestore.rules` ve `storage.rules` dosyalarında metinleri duruyor,
>   referans için).
>
> ### Netlify bilgileri
> - Site: **merlfy** (takım: mertcamkiran05), site id `5111c4cc-63ed-4366-a712-eba35903a3ac`
> - URL: http://merlfy.netlify.app
> - Deploy: `npx @netlify/mcp` CLI ile `web/` klasöründen yapıldı (Netlify MCP tool'un verdiği komut).
>   Güncelleme için: `web/index.html`'i düzenle → aynı komutu tekrar çalıştır (ya da Claude'a
>   "web sürümünü tekrar deploy et" de).
> - Visitor access (SSO/parola kilidi) kullanıcı tarafından kapatıldı → site herkese açık.
>
> ### `web/index.html`'de `merlfy.html`'e göre NELER DEĞİŞTİ (mimari kararlar)
> - `hashPassword`/`verifyPassword`/IndexedDB tamamen kaldırıldı. `idbGet/idbPut/idbAll/idbDel/idbByUser`
>   fonksiyon İSİMLERİ AYNEN KORUNDU ama içleri artık Firestore'a yazıyor (`coll` parametresi artık
>   Firestore collection adı) — dosyadaki onlarca çağrı noktası değişmeden çalışsın diye böyle
>   yapıldı. `"resources"` koleksiyonuna `idbPut` çağrılınca base64 `dataUrl` otomatik Firebase
>   Storage'a yükleniyor, doc'ta gerçek indirme URL'si tutuluyor (`storagePath` alanıyla silme takibi).
> - Kayıt/giriş: `auth.createUserWithEmailAndPassword` / `signInWithEmailAndPassword`
>   (`usernameToEmail()` sahte e-posta üretir). İlk kaydolan kullanıcı otomatik "owner" oluyor
>   (`ensureUserDoc()` — `pendingProfile` değişkeniyle register formundan display adı taşınıyor,
>   race condition'a karşı TEK yazan nokta `onAuthStateChanged` içindeki `ensureUserDoc`).
> - **Kaldırılan özellikler** (artık gerçek çoklu-kullanıcı olduğu için anlamsız/güvensiz):
>   - Bir tarayıcıda birden fazla profil arasında geçiş → artık sadece "son kullanılan kullanıcı
>     adları" (localStorage, sadece otomatik doldurma için, chip'e tıklayınca şifre yine soruluyor).
>   - "Sahip başkası için hesap ekler/siler" (`addAccountModal`, hesap listesi) → tamamen kaldırıldı.
>     Herkes kendi hesabını kendi Firebase Auth ile açıyor.
>   - Gate ekranındaki "Yedekten içe aktar" (`gateImportModal`) → kaldırıldı, artık gerek yok
>     (gerçek giriş var). Settings > Veri > İçe Aktar hâlâ duruyor ama artık **eski offline
>     `merlfy.html`'den YENİ hesaba tek seferlik geçiş** için — `applyBackupJson` artık içe
>     aktarılan memoların `userId`'sini mevcut giriş yapılmış kullanıcıya yeniden atıyor (güvenlik
>     kuralları başka türlü zaten reddederdi).
> - **Kritik gizlilik düzeltmesi:** eski `buildExport()` TÜM kullanıcıların TÜM memolarını dışa
>   aktarıyordu (artık paylaşılan global bir veritabanı olduğu için bu ciddi bir sızıntı olurdu) —
>   artık sadece giriş yapmış kullanıcının KENDİ memolarını export ediyor.
> - Skor tabloları artık **global, herkese açık bir liderlik tablosu** (`scoreStore`, Firestore
>   `scores` koleksiyonu). "Tabloyu temizle" artık sadece kendi skorlarını siliyor (başkasınınkini
>   silemez). Firestore composite index gerektirmesin diye sorgu tek alanlı (`where game==`) +
>   istemci tarafında sıralama yapıyor.
> - `store.allSharedMemos()` ve `store.memos(userId)` artık gerçek Firestore `.where(...)` sorguları
>   (Firestore güvenlik kuralları, sınırsız "hepsini çek sonra filtrele" sorgularını zaten reddeder).
> - "Kim yazdı" (Explore görünümünde yazar adı) artık `cache.authors` ile sayfa başına ihtiyaç
>   duyulan kullanıcı profilleri tek tek çekiliyor (binlerce kullanıcıyı tek seferde çekmek yerine).
> - `pass_short` eşiği 4'ten **6 karaktere** çıkarıldı (Firebase Auth'un asgari şartı).
>
> ### Headless test notu (bu oturumda kullanıldı, gelecekte lazım olacak)
> jsdom ile test ederken `window.eval(scriptSrc)` YANLIŞ realm'de çalışıyor (Node'un global
> `URL`/`crypto`'sunu kullanıyor, jsdom'unkini değil) — doğrusu gerçek bir `<script>` elementi
> oluşturup `document.body.appendChild()` ile eklemek (`JSDOM(..., {runScripts:"dangerously"})` ile).
> `window.crypto`/`window.URL.createObjectURL` gibi bazı property'ler salt-okunur olabiliyor,
> `Object.defineProperty(...,{writable:true,configurable:true})` ile zorlamak gerekiyor.
>
> ### Sıradaki oturumda ilk bakılacaklar
> - Kullanıcıya gerçek bir arkadaşıyla test ettirmek (iki farklı gerçek hesapla, "herkese açık"
>   memo paylaşımı + Keşfet görünümü uçtan uca hiç iki FARKLI insanla denenmedi).
>   sadece 1 gerçek kullanıcı ile test edildi.
> - `web/index.html`'de görsel yükleme (Firebase Storage'a upload) hiç gerçek tarayıcıda test
>   edilmedi bu oturumda — bir sonraki oturumda dener.
> - ~~Eski "kod ile satranç" tartışması~~ → **2026-09-14, 4. oturumda karara bağlandı: mod tamamen
>   kaldırıldı** (yukarıdaki nota bak). İstenirse ileride Firestore üzerinden gerçek zamanlı satranç
>   eklenebilir ama bu ayrı bir özellik/karar.
> - Netlify sitesinin custom domain'i yok, `merlfy.netlify.app` ile kalıyor şimdilik.
>
> ---
>
> **2026-09-12, 2. oturum — 3 yeni özellik + headless test altyapısı düzeltildi:**
> 1. **Giriş ekranı netleştirildi ("neden hep kayıt ekranı çıkıyor" şikayeti):** Kullanıcı yeni cihazda açınca
>    sadece "profil oluştur" ekranı görüyor, giriş seçeneği yok sanıyordu — bu **beklenen davranış** (Merlfy
>    cihazlar arası senkron olmaz, IndexedDB o tarayıcıya özel). Gerçek eksik: yeni cihaza hesabı taşımanın yolu
>    (yedek JSON içe aktarma) giriş ekranında hiç görünmüyordu. Eklenen: hem "profil yok" ekranına hem normal
>    giriş ekranına **"Zaten bir hesabın var mı? Yedekten içe aktar"** linki (`gateImportModal()`, `renderGate()`
>    içinde iki yerde). `importModal()`'daki JSON parse/yazma mantığı `applyBackupJson(text)` helper'ına
>    çıkarıldı, ikisi de bunu kullanıyor. i18n: `gate_have_backup`, `gate_import_hint`.
> 2. **Günün sorusuna kart cevabı** (viral özellik): `promptStrip()`'te "Bunu yaz" tıklanınca
>    `state.composer.promptQ` o anki soruyu tutuyor; `doSave()` memoyu `promptQ` alanıyla kaydediyor (içerik hâlâ
>    o soruyu içeriyorsa). O memonun menüsünde artık "✦ Soru-cevap kartı" seçeneği var → `drawPromptCard(memo,
>    author)` soru (italik, accent) + cevap + Merlfy imzasını tek kartta çiziyor, mevcut `shareCanvas()` ile
>    paylaşılıyor. i18n: `card_prompt_share`.
> 3. **Sürpriz anı butonu** (viral özellik): sağ rayda İstatistik kartının altında "🎲 Sürpriz anı" — rastgele
>    geçmiş bir memoyu modalda gösteriyor, "Başka" butonu yeni rastgele memo çekiyor. `surpriseMemo()`,
>    `cache.memos` üzerinden çalışıyor. i18n: `surprise_btn`, `surprise_title`, `surprise_again`, `surprise_none`.
>
> **Headless test altyapısı düzeltildi (önemli, gelecekte lazım olacak bilgi):** Önceki oturumların
> `window.eval(scriptSrc)` yöntemi jsdom'da **yanlış realm'de** çalışıyormuş — `URL`, `crypto` gibi qualifisiz
> globaller pencereye değil Node'un kendi global scope'una çözümleniyordu (ör. `URL.createObjectURL` Node'un
> gerçek `internal/url` implementasyonunu çağırıyordu, bizim mock'u değil). Doğrusu: gerçek bir `<script>`
> elementi oluşturup `document.body.appendChild()` ile eklemek (JSDOM `runScripts:"dangerously"` ile). Ayrıca
> `window.crypto` / `window.URL.createObjectURL` gibi bazı jsdom property'leri salt-okunur olabiliyor —
> düz atama sessizce başarısız oluyor, `Object.defineProperty(...,{writable:true,configurable:true})` ile
> zorlamak gerekiyor. Yeni harness: `…/9997c050-…/scratchpad/boot2.js` (16/16 yeşil: gate-import akışı,
> prompt-cevap kartı, sürpriz anı, PBKDF2 login — bu son ikisi gerçek `webcrypto` + gerçek zaman aşımı
> (150k iterasyon ~ birkaç yüz ms) gerektiriyor, `setTimeout` süresini kısa tutarsanız testler flaky olur).
>
> Ayrıca Version 8, `read`+merge sonrası artifact'e yayınlandı
> (https://claude.ai/code/artifact/e6e3a687-688b-4979-81e6-6d34cdb2fd07). Yayın, artifact publish action'ının
> "paylaşılan artifact" auto-mode engeline takıldı — kullanıcı `~/.claude/settings.json`'a
> `{"permissions":{"allow":["Artifact"]}}` ekledikten sonra geçti (bkz. [[merlfy-project]] hafıza notu, gelecekte
> tekrar lazım olabilir).
>
> "Kod ile (uzaktan)" satranç modu gerçek chess.js ile mantık-katmanı testinden geçirildi (`chesscode.test.js`,
> scratchpad): 3 ellik kod alışverişi + tam bir aptal-matı senaryosu uçtan uca doğru çalışıyor, bozuk kod girişi
> crash olmadan reddediliyor. Gerçek tarayıcıda iki kişiyle uçtan uca (kopyala-yapıştır, clipboard izni) hâlâ
> denenmedi.
>
> ~~**Açık tartışma (henüz karar verilmedi):** kullanıcı "kod ile satranç" modunun uğraştırıcı/kafa karıştırıcı
> olduğunu düşünüyor...~~ → **Karara bağlandı (2026-09-14, 4. oturum): mod tamamen kaldırıldı.** DM/mesajlaşma
> eklenmedi, sadece kaldırma yapıldı.

---

_Önceki: 2026-09-11 · Kaynak dosya Version 8 hazırlanmıştı (artifact henüz yayınlanmamıştı)_

> 2026-09-11 oturumunda eklenen 4 özellik (Version 8'in içeriği):
> 1. **Composer kelime/karakter sayacı** — `.comp-bar`'da `#comp-count`, `wireComposer`'da `updateCount()`. i18n: `wc_word`/`wc_char`.
> 2. **Tıklanabilir görev kutuları** — `renderMarkdown` artık `<input data-task="N">` (disabled değil), `_taskSeq` sayacı + `_renderMd` iç fonksiyon. `toggleTaskInContent(content,n)` helper `[ ]`↔`[x]` çevirir. `memoCard`: kendi memomsa `change` listener → `store.saveMemo` + `body.innerHTML` yeniden çiz; değilse `disabled`. `trashView` + composer önizleme de `disabled`.
> 3. **Satrançta PGN dışa aktarma** — chess yan panelde `btnPgn` ("PGN kopyala"), `engine.header(...)` + `engine.pgn()` → panoya. i18n: `chess_pgn`, `chess_pgn_copied`, `chess_pgn_empty`.
> 4. **Karne dönem seçici** — `drawRecapCard(live, period)` ("all"/"30"/"7"), `shareRecap()` artık 3 butonlu `modal()` picker açıyor. i18n: `recap_pick`, `recap_all`, `recap_30`, `recap_7`.
>
> Harness güncellendi: `scratchpad/md.js` (mirror — task seq + toggleTaskInContent), `t.js` (+10 test), `boot.js` (+sayaç/checkbox/PGN/recap-picker adımları).
>
> Henüz YAPILMAYAN backlog (§8): streak freeze, yerel bildirim, drawMemoCard'a görsel gömme, paylaşım kartı renk temaları, telefon testi.

---

_Önceki: 2026-09-10 · Artifact **Version 7**_

Eve geçince buradan devam et. Bu dosya projenin tam fotoğrafı: ne var, ne çalışıyor, ne test edildi, sıradaki adımlar.

---

## 1. Hızlı özet

Merlfy = kişisel, çok profilli **memo defteri**. Memos / Memogram tarzı.
**Tek HTML dosyası, backend yok.** Bütün veri tarayıcıda IndexedDB'de.

- **Canlı artifact:** https://claude.ai/code/artifact/e6e3a687-688b-4979-81e6-6d34cdb2fd07
- Şu an **özel** (sadece sen görüyorsun). Herkese açmak için: artifact'i aç → sağ üst paylaş menüsü → herkese açık link.

---

## 2. Dosyalar

| Dosya | Ne |
|---|---|
| `C:\Users\Acer\merlfy\merlfy.html` | **Uygulamanın tamamı.** ~2380 satır. Çift tıkla açılır. Kaynak = doğruluk kaynağı; artifact bundan yayınlanıyor. |
| `C:\Users\Acer\merlfy\merlfy-bot.mjs` | Telegram köprüsü (Node 18+, bağımlılık yok). İsteğe bağlı. |
| `C:\Users\Acer\merlfy\README.md` | Kullanıcı dokümanı (TR). |
| `C:\Users\Acer\merlfy\DURUM.md` | Bu dosya. |

**Test harness (kalıcı değil, scratchpad'de):**
`C:\Users\Acer\AppData\Local\Temp\claude\C--Users-Acer\<session>\scratchpad\`
— `boot.js` (jsdom uçtan uca), `t.js` (markdown/güvenlik birim), `chess.js.test.js` (satranç). Yeni oturumda yeniden kurman gerekebilir (aşağıda "Test" bölümü).

---

## 3. Mimari (kısa)

- **Vanilla JS**, IIFE, `"use strict"`. Framework yok.
- `el(tag, attrs, ...kids)` — mini DOM helper. `$`, `$$` — querySelector kısayolları.
- **State:** tek `state` objesi (`user`, `users`, `view`, `filter`, `page`, `composer`, `game`, ...). `renderApp()` her şeyi baştan çizer (sanal DOM yok, tam yeniden render).
- **IndexedDB** (`DB_NAME="merlfy"`, `DB_VER=2`) store'ları: `users`, `memos` (index: userId, createdAt), `resources` (görseller, base64 dataUrl), `meta` (session + ayarlar), `scores` (oyun skorları, index: game).
- **Auth:** PBKDF2 (150k iter, SHA-256), salt:hash base64. `hashPassword` / `verifyPassword`.
- **Markdown:** custom güvenli parser (`renderMarkdown`, `mdInline`, `safeUrl`). HTML kaçışlı. `javascript:` / `data:text/html` engelli, `data:image/*` izinli.
- **i18n:** `I18N = {tr:{...}, en:{...}}`, `t("key")`. `LANG` localStorage'dan.
- **Tema:** `applyTheme()` → `<html data-theme="light|dark">` ya da temizle (sistem). CSS token'ları `:root` + `@media (prefers-color-scheme:dark)` + `[data-theme]`.
- **Satranç:** `chess.js` 0.12.1 (cdnjs UMD, `<script>` ile) + custom minimax/negamax AI (`chessAiMove`, alfa-beta, PST'li eval) + custom tahta UI. Modlar: AI / iki kişi (hotseat). ("Kod ile" async mod 2026-09-14'te kaldırıldı.)

### Engagement bloğu (Version 5-7, `extractTags`'ten hemen sonra)
- `PROMPTS` (tr/en 24'er) + `todaysPrompt()` (gün-of-year + localStorage `merlfy.promptOff.<gün>`) → `promptStrip()` feed'de composer üstünde.
- `onThisDay(live)` (aynı ay/gün önceki yıllar + tam 7/30/90/180/365 gün önce) → feed'de `onThisDayStrip()`, sağ rayda `onThisDayCard()`.
- `BADGES` (10 adet) + `computeStats(live)` + `earnedBadges()` → sağ rayda `badgesCard()`.
- `celebrate()` — bağımlılıksız konfeti (WAAPI, `prefers-reduced-motion`'a saygılı, hataya karşı try/catch).
- `checkEngagement(live)` — `renderApp()` sonunda. `engagementReady` flag'i ilk render'da kutlamayı bastırır. Yeni rozet / seri kilometre taşı → toast + konfeti. localStorage: `merlfy.badges.<uid>`, `merlfy.streakMile.<uid>`.
- `goalPill(live)` — bugün yazdın mı? statsCard'da.
- **Paylaşım kartları (canvas→PNG):**
  - `drawMemoCard(memo, author)` — alıntı kartı. Yükseklik içeriğe göre. `#etiketler` gövdeden ayrılıp footer'da ochre monospace satır.
  - `drawRecapCard(live)` — "Merlfy Karnem". 2×2 büyük sayı + top etiketler + mini ısı haritası. Yükseklik içeriğe göre.
  - `shareCanvas(canvas)` — modal: görsel önizleme + `navigator.share({files})` (mobil, doğrudan hikâye) / `ClipboardItem` kopyala / `<a download>` indir. `dataUrlToBlob` fallback.
  - Tetikleyiciler: memo menüsü "🖼 Kart olarak paylaş", statsCard + Ayarlar>Veri "📤 Özetimi paylaş".

---

## 4. Ne yapıldı (oturum bazlı)

**Version 1-3 (ilk kurulum):** Sıfırdan tüm uygulama + Telegram botu + README. Bölümler: Akış, Keşfet, Takvim, Mola, Çöp Kutusu, Ayarlar. Mola oyunları eklendi.

**Version 4 — test + temizlik + küçük özellik:**
- `#app`'teki `aria-live="polite"` kaldırıldı → ayrı `#sr-live` bölgesi + toast `role=status` (ekran okuyucu artık tüm uygulamayı her render'da okumuyor).
- Satranç zorluk butonları tıklanınca `.on` güncellenmiyordu → düzeltildi; `humanSide` oturum boyunca `g.humanSide`'da hatırlanıyor.
- Lightbox Escape-dışı kapanışta keydown listener sızıntısı → düzeltildi.
- Ölü kod silindi: kullanılmayan `DB`/`onDbReady` bloğu.
- Yeni: filtre çubuğunda 🖼 "sadece görselli" toggle (ölü `hasImage` filtresini bağladı).
- Keşfet'te "Özel" görünürlük filtresi gizlendi (boş sonuç veriyordu).
- i18n: `card_face_down`, `filter_has_image`, sabit "Oyuncu" → `t("sb_player")`.

**Version 5 — "ekranda tutan / viral" özellikler:** Günün kıvılcımı, geçen bugün, rozetler, konfeti, günlük hedef, paylaşım kartları, PWA meta etiketleri. (Detay: §3 Engagement bloğu.)

**Version 6 — 2 bug fix (gerçek tarayıcıda doğrulandı):**
- Karne kartında "merlfy" yazısı ısı haritası karelerine biniyordu → `drawRecapCard` yeniden düzenlendi.
- Satranç tahtası her hamlede küçülüyordu → `.board`'a `width:100%` + `grid-template-rows:repeat(8,1fr)`, `.sq`'ya `min-width/height:0`.

**Version 7 — cila (gerçek tarayıcıda açık temada doğrulandı):**
- `drawMemoCard` baştan yazıldı — kart yüksekliği içeriğe göre (kısa memo = kısa kart, boşluk yok); etiketler footer'da stilli satır.
- `drawRecapCard` yüksekliği de içeriğe göre (ısı haritası footer'a yapışık); ayraç çizgisi hafifletildi.
- `.badge-grid` → `repeat(auto-fill,minmax(58px,1fr))` (her genişlikte esner).

---

## 5. Test nasıl çalıştırılır

Claude-in-Chrome bağlıysa gerçek tarayıcıda: yerel bir statik sunucu aç (`file://` eklenti tarafından engelli), `http://localhost:PORT/merlfy.html`'e git.

Bağlı değilse **headless harness** (jsdom):

```bash
cd <scratchpad>
npm i chess.js@0.12.1 jsdom fake-indexeddb --no-save
node boot.js      # uçtan uca akış (kayıt→memo→oyunlar→ayarlar→...)
node t.js         # markdown / güvenlik birim testleri
```

`boot.js` içindeki `beforeParse` şunları mock'lar: `crypto.webcrypto`, `indexedDB` (FDBFactory), `matchMedia`, `URL.createObjectURL`, canvas `getContext` (Proxy no-op) + `toBlob`/`toDataURL`.

Sözdizimi kontrolü:
```bash
node -e "const h=require('fs').readFileSync('merlfy.html','utf8');const i=h.indexOf('<script>\n(() => {');const j=h.indexOf('})();\n</script>',i);new Function(h.slice(i+8,j+5));console.log('OK')"
```

---

## 6. Bilinen açık konular / doğrulanmayanlar

| Konu | Durum |
|---|---|
| **Gerçek telefon viewport** | Test EDİLEMEDİ (eklenti pencereyi ~1500px altına küçültmüyor). Yatay taşma yok, responsive CSS Version 1'den beri çalışıyor + yeni öğeler flex-wrap/ellipsis. **Telefondan 1 kez aç, bak.** |
| Paylaşım kartı **"İndir"** butonu | Artifact iframe sandbox'ı `<a download>`'u görüntüleyende engelleyebilir. "Görseli kopyala" + kart önizleme + mobil `navigator.share` çalışıyor. Yerel dosyada indir de çalışır. |
| Chrome "force dark" | Kullanıcı `chrome://flags/#enable-force-dark`'ı **Disabled** yaptı, açık tema artık doğru görünüyor. (Eskiden light seçiliyken bile sayfayı karartıyordu — Merlfy bug'ı değildi.) |
| Cihazlar arası senkron | **Yok, tasarım gereği** (backend yok). Taşıma: Ayarlar > Veri > Dışa/İçe aktar (JSON). |
| Telegram | Otomatik akmaz; `merlfy-bot.mjs` çalıştır + Ayarlar > Telegram'dan tek tık içe aktar. Bot token gerektirdiği için sadece sözdizimi kontrol edildi. |
| Küçük kozmetik | Karne kartı 0 memoyken (Ayarlar'dan) hep gösteriliyor; takvim görünümünde statsCard hem merkezde hem sağ rayda (Version 1'den beri, çift görünüm). |

---

## 7. Yayına alma

1. Artifact zaten Version 9 olarak canlı: https://claude.ai/code/artifact/e6e3a687-688b-4979-81e6-6d34cdb2fd07
2. **Herkese açık yapmak:** artifact'i aç → sağ üst **paylaş menüsü** → herkese açık link al.
3. Güncelleme: `merlfy.html`'i düzenle → Claude'a "artifact'i güncelle" de (aynı URL korunur).
4. Yerel dağıtım: `merlfy.html` dosyasını gönder — çift tıkla açılır, internet gerekmez (yalnızca fontlar + chess.js CDN'den; çevrimdışı da çalışır).

---

## 8. Sıradaki adımlar (fikirler — henüz yapılmadı)

- **Telefon testi** (öncelik) — gerçek cihazda tüm bölümler + paylaşım kartları.
- Paylaşım kartı **temaları/varyantları** (birkaç renk şeması seç).
- **Haftalık/aylık karne** — sadece son 7/30 günün özeti.
- **Streak freeze** — haftada 1 "seriyi koru" jetonu.
- Memo içi **checkbox'ları tıklanabilir** yap (şu an `disabled`).
- **Yerel bildirim** — "bugün yazmadın" hatırlatması (Notification API + tarayıcı açıkken).
- Composer'da **kelime/karakter sayacı**.
- Satrançta **PGN dışa aktarma**.
- `drawMemoCard` görsel eklenmiş memolar için görseli de karta bas.
- **PWA'yı tam yap** — manifest + service worker (ama tek dosya + artifact sandbox kısıtı; ayrı barındırma gerekir).

---

## 9. Faydalı referanslar

- Renkler: ochre `#b06a26` (light) / `#d3873c` (dark). Fontlar: Bricolage Grotesque (başlık), IBM Plex Sans (gövde), IBM Plex Mono (kod/etiket).
- Klavye kısayolları: `n` yeni memo · `/` ara · `g a` akış · `g k` keşfet · `g t` takvim · `g c` çöp · `?` tümü · `Ctrl/⌘+Enter` kaydet.
- Demo profili: giriş ekranında "Demo profilini aç" (kullanıcı adı `demo`, parola `demo`).
