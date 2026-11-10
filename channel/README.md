# Nedo ile Neden?

3–6 yaş için, her bölümde tek bir “neden?” sorusunu cevaplayan kısa çizgi filmler. Bölümler
[OpenFilm](../README.md) ile yapılır: her sahne `frame(t)` çizen bir web sayfası, film de onları kesen bir
`film.html`. Çizimler, müzik ve ses efektleri bu klasördeki koddan üretilir; hazır görsel, hazır müzik yok.

> Kanalın adı, Nedo'nun adı ve görünüşü birer öneri. Değiştirmek kolay: karakter tek dosyada
> (`shared/kit.js`), ekrandaki bütün yazılar tek dosyada (`bolum.js`).

## Neyin nerede olduğu

| Yer | Ne |
| --- | --- |
| `episodes/001-gokyuzu-neden-mavi/` | Pilot bölüm, İngilizce: 69,5 saniye, 6 sahne; anlatımı, müziği ve efektleriyle |
| `episodes/<bölüm>/bolum.js` | Bölümün bütün verisi: sahneler ve süreleri, anlatım satırları (EN + TR) ve zamanları, ekrandaki yazılar, efektlerin yerleri |
| `episodes/<bölüm>/shared/kit.js` | Nedo, güneş, renk topları, manzara ve hareket yardımcıları |
| `araclar/seslendir.py` | Anlatımı seslendirir (Kokoro: anahtarsız, bilgisayarda çalışır) |
| `araclar/ses.mjs` | Müziği ve ses efektlerini kodla üretir |
| `araclar/kur.mjs` | `film.html`'i `bolum.js`'ten kurar ve seslerin üst üste binmediğini denetler |
| `araclar/altyazi.mjs` | Anlatımdan YouTube altyazısı (WebVTT) yazar |
| `sorular.md` | Soru havuzu: 40 soru, çocuğa söylenecek cevap ve görsel fikir |

## Bölümün biçimi

Her bölüm aynı iskeleti izler; çocuk neyin geleceğini bilir, bu da izlemeyi sürdürür.

1. **Soru** (0–8 sn): Nedo bir şeye bakar, merak eder, soruyu sorar. Başındaki soru işareti parlar.
2. **Başlık** (3–4 sn): soru ekranda; müzik soru gibi yükselip havada kalır.
3. **Tahmin** (uzun bölümde): Nedo yanlış ama sevimli bir tahmin yürütür (“Biri boyamış olabilir mi?”).
4. **Açıklama**: en fazla üç adım. Her adımda tek bir fikir, tek bir hareket.
5. **“İşte bu yüzden…”**: cevap tek cümleyle, sorunun kelimeleriyle söylenir.
6. **Hadi deneyelim** (uzun bölümde): evde yapılabilecek, büyükle birlikte güvenli bir deney.
7. **Veda**: “Sen neyi merak ediyorsun?” Müzik sorunun cevabını verir, tonikte biter.

Pilot, bu iskeletin 1-2-4-5-7 adımlarından oluşan kısa çekirdeğidir. Asıl bölümler 2,5–3,5 dakika olmalı:
3. ve 6. adımlar eklenir, 5. adımdan sonra üç resimlik bir tekrar gelir.

### 3–6 yaş için kurallar

- Bir bölüm, bir soru, bir cevap. Yan bilgi yok.
- Cümleler kısa, kelimeler somut: “saçılma” değil “zıplar”, “molekül” değil “minicik tanecik”.
- Söylenen şey aynı anda ekranda olur. Söz hareketten önce gelmez.
- Yavaş tempo: sahne en az 3 saniye durur, ani flaş ve sarsıntı yok.
- Anlatılan bilgi doğrudur; basitleştirilir ama yanlış söylenmez. Bilim bilmiyorsa “hâlâ araştırıyorlar” denir.
- Ekranda okunması gereken yazı yok (çocuk okuyamaz); yazı yalnızca başlıkta ve vedada.
- Korkutucu hiçbir şey yok; gök gürültüsü gibi konular bile Nedo'nun merakıyla anlatılır.

## Yeni bölüm yapmak

Bir kez kurulur: OpenFilm bu depodan çalışır, ses motoru Python'da.

```bash
pnpm install
```

```bash
pip install kokoro-onnx soundfile
```

Yeni bölüm, bir öncekinin kopyasından başlar:

```bash
cp -r channel/episodes/001-gokyuzu-neden-mavi channel/episodes/002-how-is-a-rainbow-made
```

Sonra yeni klasörde:

1. `bolum.js`: soruyu, anlatım satırlarını, sahne sürelerini ve efektlerin yerlerini yaz.
2. Sahne sayfaları (`s1-…html` … `s6-…html`): açıklama sahnelerini yeniden çiz. Soru, başlık ve veda
   sahneleri çoğu zaman olduğu gibi kalır. Sahneler hareketlerini `bolum.js`'teki anlardan kurar
   (`an('s3-sir')`), süreyi de oradan alır (`sure('s3')`).
3. Seslendir. Her satırın süresini yazar ve ayrılan yere sığmayanı gösterir; `bolum.js`'teki `at`
   değerlerini buna göre düzelt.
4. Müziği üret, filmi kur, bak, render et.

```bash
python channel/araclar/seslendir.py channel/episodes/002-how-is-a-rainbow-made --speed 0.85
```

```bash
node channel/araclar/ses.mjs channel/episodes/002-how-is-a-rainbow-made
```

```bash
node channel/araclar/kur.mjs channel/episodes/002-how-is-a-rainbow-made
```

```bash
node channel/araclar/altyazi.mjs channel/episodes/002-how-is-a-rainbow-made
```

```bash
cd channel/episodes/002-how-is-a-rainbow-made && node ../../../packages/openfilm/bin/openfilm.mjs look
```

```bash
node ../../../packages/openfilm/bin/openfilm.mjs render --loudness=-14
```

`look` her kareyi iki kez, karışık sırayla çizer ve aynı saniyenin aynı resmi verdiğini doğrular; `open`
filmi Studio'da açar: orada her sahne, yazı ve ses elle değiştirilebilir. `kur.mjs` `film.html`'i baştan
yazdığı için Studio'daki elle ince ayar en sona kalır.

### Seslendirme

Anlatım Kokoro ile üretilir (Apache 2.0): anahtar istemez, bilgisayarda çalışır, ürettiği ses ticari işte
kullanılabilir. Model dosyaları (350 MB) ilk çalıştırmada iner. Yalnızca İngilizce konuşur.

- Ses seçmek: `seslendir.py <bölüm> --dene af_heart,af_bella,bf_emma,am_puck` her sesle ilk üç satırı
  `<bölüm>/.dene` içine yazar. Kanalın sesi bir kez seçilir ve değişmez: çocuk Nedo'yu sesinden tanır.
- `--speed 0.85` küçük çocuk için iyi bir hızdır; `--pitch 2` sesi iki yarım ton inceltir.
- Her satır ayrı bir dosyadır (`assets/audio/vo/en/s1-merhaba.wav`), sözleri yanındadır (`.vtt`).
- Renk adları gibi resimle aynı anda söylenmesi gereken kelimeler ayrı satırlardır: her biri kendi anına konur.

Pilottaki ses `af_heart`, hız 0,85. Bir insan sesi (seninki ya da bir seslendirmenin) kanalı daha özgün
kılar: dosyalar aynı adlarla aynı klasöre konur, gerisi aynıdır.

### Başka dil

Resimlerde yazı neredeyse yok, o yüzden aynı bölüm başka dile ucuza çevrilir. Satırların Türkçesi
`bolum.js`'te yazılı: `dil = 'tr'` yapınca ekrandaki yazılar Türkçe olur. Türkçe ses Kokoro'dan gelmez;
kayıt ya da başka bir ses servisi gerekir (dosyalar `assets/audio/vo/tr/` altına). Zamanlar o sese göre
yeniden düzeltilir.

## Yayın

- **Biçim**: 1920×1080, 30 kare/sn, ses −14 LUFS (`render --loudness=-14`).
- **Sıklık**: haftada 2 bölüm, aynı gün ve saatte. İlk hedef 20 bölüm: kanal ancak o zaman değerlendirilebilir.
- **Küçük resim**: Nedo + sorunun nesnesi + en fazla 3 kelime. `look <saniye>` tam boy kare verir.
- **Başlık**: sorunun kendisi. “Why Is the Sky Blue? | Nedo Asks Why”
- **Oynatma listeleri**: Gökyüzü, Hayvanlar, Vücudumuz, Doğa, Evde Bilim.
- **Shorts**: her bölümün “işte bu yüzden” anı dikey olarak ayrıca kesilir (1080×1920).

## Para kazanma: bilinmesi gerekenler

Bunlar bu belge yazılırken geçerli olan kurallardır ve değişir; kanal açılmadan önce YouTube'un kendi
sayfalarından doğrulanmalı.

- **Ortaklık eşiği**: reklam geliri için 1.000 abone ve son 12 ayda 4.000 saat izlenme (ya da 90 günde
  10 milyon Shorts izlenmesi). Yeni bir kanal için bu aylar sürer.
- **“Çocuklara özel” işareti zorunlu** ve bedeli var: kişiselleştirilmiş reklam yok (bin izlenme başına gelir
  yetişkin içeriğinden belirgin biçimde düşük), yorumlar kapalı, bildirim zili, bitiş ekranı, kartlar, üyelik
  ve Süper Sohbet yok. Gelir neredeyse yalnızca reklamdan ve izlenme süresinden gelir.
- **“Özgün olmayan içerik” kuralı**: toplu üretilmiş, birbirinin kopyası videolar gelir elde edemez. Yapay
  zekâ kullanmak yasak değil; ama her bölümün kendi çizimi, kendi senaryosu ve insan elinden geçmiş bir
  kurgusu olmalı. Bu kanalın şablonu iskelettir; açıklama sahneleri her bölümde baştan çizilir.
- **Çocuk içeriği kalite ilkeleri**: öğreten, merak uyandıran içerik öne çıkarılır; aşırı ticari, sansasyonel
  ya da otomatik üretilmiş içerik geri plana atılır ve gelirini kaybedebilir.
- **Dil**: kanal İngilizce: reklam geliri yüksek, izleyici çok, ama rakip de çok. Türkçe'de rakip az,
  gelir düşük; tutan bölümler Türkçe seslendirilip ikinci bir kanalda yayınlanabilir.
- **Reklam dışı gelir**: asıl para çoğu çocuk kanalında lisanstan, kitaptan ve oyuncaktan gelir. Bunun için
  Nedo'nun tanınması gerekir; o yüzden her bölümde aynı karakter, aynı renkler, aynı müzik.

## Haklar

Çizimler, müzik ve ses efektleri bu depodaki koddan üretilir. Yazı tipi Baloo 2, SIL Open Font License 1.1
ile (`shared/fonts/OFL.txt`). Anlatımın sesi Kokoro-82M modelinden (Apache 2.0).
