# Merlfy testleri (Playwright)

```sh
cd tests
npm install && npx playwright install chromium
npm run unit                 # seri koruma birim testi (tarayıcısız)
npm run serve                # ayrı terminalde: web/ klasörünü http://localhost:5178 'de sunar
npm run local                # iki hesap + mobil + satranç + yeni özellikler (yerel)
npm run recovery             # parola kurtarma (Google popup taklit edilir, yerel)
npm run live                 # aynı regresyon testi canlı sitede
```

Testler gerçek Firebase'e `pw...` adlı test hesapları açar (her çalıştırmada yeni).
Ekran görüntüleri `tests/shots/` altına düşer (git'e girmez).
