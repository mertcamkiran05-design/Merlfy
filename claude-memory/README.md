# Claude hafıza yedeği

Bu klasör, eski PC'deki Claude Code hafıza dosyalarının kopyasıdır (2026-10-16).
Yeni bilgisayarda Claude'un bunları hatırlaması için:

1. `git clone https://github.com/mertcamkiran05-design/Merlfy` (veya `git pull`)
2. Claude Code'u repo klasöründe aç ve şunu yaz:
   "claude-memory klasöründeki dosyaları hafızana kaydet, sonra DURUM.md'yi oku ve kaldığımız yerden devam edelim"

## Kaldığımız yer (2026-10-12, 8. oturum)
- 7. oturum sürümü canlıda (merlfy.netlify.app), tüm testler PASS.
- Parola kurtarma (Google bağlama + "Parolamı unuttum") kodda hazır (`npm run recovery` 15/15), **canlıya yüklenmedi**.
- Sıradaki iş: `web` klasörünün tamamını **app.netlify.com/projects/merlfy/deploys** sayfasına Netlify Drop ile yükle
  (genel Drop alanına değil, yoksa yeni site açılır) → canlıda kendi Google hesabınla bağla + "Parolamı unuttum"u dene.
- Firebase Storage bucket'ı hâlâ hiç açılmamış (404) — görseller şimdilik Firestore'a küçültülüp gömülüyor.
- Ayrıntılar: kökteki `DURUM.md`.
