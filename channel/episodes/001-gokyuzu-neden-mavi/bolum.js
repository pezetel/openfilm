// Bölüm 001 — Why is the sky blue? / Gökyüzü neden mavi?
// Bölümün bütün verisi burada: sahneler ve süreleri, anlatım satırları ve zamanları, ekrandaki yazılar,
// ses efektlerinin yerleri. Sahne sayfaları hareketlerini buradaki saniyelerden kurar (`an('s3-sir')`),
// `araclar/kur.mjs` de film.html'i buradan yazar. Zamanlamayı değiştirmek için yalnızca bu dosya değişir.

/** Anlatımın ve ekrandaki yazıların dili. Satırların zamanları (`at`, `to`) bu dilin seslendirmesine göredir:
 *  dil değişince `seslendir.py` yeniden çalıştırılır ve zamanlar onun yazdığı sürelere göre düzeltilir. */
export const dil = 'en';

/** Sahneler, filmdeki sıralarıyla: [ad, sayfa, süre (saniye), müziğin havası].
 *  Süreler yarım saniyenin katı olmalı: müzik (araclar/ses.mjs) 2 saniyelik ölçülerle bestelenir,
 *  böylece her kesme bir vuruşa denk gelir. */
export const sahneler = [
  ['s1', 's1-merak.html', 8, 'giris'],
  ['s2', 's2-baslik.html', 3.5, 'baslik'],
  ['s3', 's3-gunes.html', 16, 'ana'],
  ['s4', 's4-hava.html', 20.5, 'merak'],
  ['s5', 's5-mavi.html', 12, 'parlak'],
  ['s6', 's6-kapanis.html', 9.5, 'kapanis'],
];
/** Bir sahnenin süresi (saniye). */
export const sure = (ad) => sahneler.find((s) => s[0] === ad)[2];
/** Bir sahnenin filmdeki başlangıcı (saniye). */
export const basi = (ad) => { let t = 0; for (const s of sahneler) { if (s[0] === ad) return t; t += s[2]; } throw new Error(`bolum.js: "${ad}" diye bir sahne yok`); };

export const yazi = {
  tr: { marka: 'Nedo ile Neden?', baslik: 'Gökyüzü neden mavi?', soru: 'Sen neyi merak ediyorsun?', veda: 'Görüşürüz!' },
  en: { marka: 'Nedo Asks Why', baslik: 'Why is the sky blue?', soru: 'What do you wonder about?', veda: 'See you!' },
}[dil];

/** id: sahne-an · at/to: sahnenin kendi saniyeleri · tr/en: söylenen söz.
 *  Sözü boş bir satır seslendirilmez ama anı durur: sahne hareketini ona bağlar (s4-tik: orada efektler konuşur). */
export const satirlar = [
  { id: 's1-merhaba', at: 0.9, to: 2.5, tr: 'Merhaba! Ben Nedo.', en: "Hi! I'm Nedo." },
  { id: 's1-bak', at: 2.8, to: 5.3, tr: 'Bugün yukarı baktım ve merak ettim…', en: 'Today I looked up, and I wondered…' },
  { id: 's1-sor', at: 5.6, to: 7.7, tr: 'Gökyüzü neden mavi?', en: 'Why is the sky blue?' },

  { id: 's3-gunes', at: 0.6, to: 2.9, tr: 'Güneş bize ışık yollar.', en: 'The Sun sends us light.' },
  { id: 's3-beyaz', at: 3.2, to: 5.2, tr: 'Işık bembeyaz görünür…', en: 'The light looks white…' },
  { id: 's3-sir', at: 5.5, to: 7.4, tr: 'ama içinde bir sır saklı!', en: "but it's hiding a secret!" },
  { id: 's3-renkler', at: 7.7, to: 9.6, tr: 'İçinde bütün renkler var!', en: 'All the colors are inside it!' },
  { id: 's3-kirmizi', at: 10.0, to: 10.8, tr: 'Kırmızı!', en: 'Red!' },
  { id: 's3-turuncu', at: 10.9, to: 11.7, tr: 'Turuncu!', en: 'Orange!' },
  { id: 's3-sari', at: 11.8, to: 12.6, tr: 'Sarı!', en: 'Yellow!' },
  { id: 's3-yesil', at: 12.7, to: 13.5, tr: 'Yeşil!', en: 'Green!' },
  { id: 's3-mavi', at: 13.6, to: 14.4, tr: 'Mavi!', en: 'Blue!' },
  { id: 's3-mor', at: 14.5, to: 15.3, tr: 'Mor!', en: 'Purple!' },

  { id: 's4-hava', at: 0.4, to: 3.8, tr: 'Işık bize gelirken havanın içinden geçer.', en: 'On its way to us, the light travels through the air.' },
  { id: 's4-tanecik', at: 3.9, to: 7.9, tr: 'Hava, göremediğimiz minicik taneciklerle dolu.', en: 'The air is full of tiny, tiny bits. Too tiny to see!' },
  { id: 's4-kirmizi', at: 8.4, to: 11.4, tr: 'Kırmızı ışık dümdüz geçer gider.', en: 'Red light zooms straight through.' },
  { id: 's4-mavi', at: 11.9, to: 13.2, tr: 'Ama mavi ışık…', en: 'But blue light…' },
  { id: 's4-tik', at: 13.5, to: 15.4, tr: '', en: '' },
  { id: 's4-ziplar', at: 15.7, to: 19.2, tr: 'Taneciklere çarpar ve her yöne zıplar!', en: 'It bumps into the tiny bits, and bounces everywhere!' },

  { id: 's5-yayilir', at: 0.4, to: 4.2, tr: 'Zıplayan mavi ışık bütün gökyüzüne yayılır.', en: 'The bouncing blue light spreads all over the sky.' },
  { id: 's5-goz', at: 4.6, to: 8.0, tr: 'Nereye bakarsak bakalım, mavi görürüz!', en: 'So wherever we look, we see blue!' },
  { id: 's5-iste', at: 8.4, to: 11.4, tr: 'İşte bu yüzden gökyüzü mavi!', en: "And that's why the sky is blue!" },

  { id: 's6-biliyoruz', at: 0.4, to: 1.9, tr: 'Artık biliyoruz!', en: 'Now we know!' },
  { id: 's6-sen', at: 2.3, to: 5.2, tr: 'Peki sen neyi merak ediyorsun?', en: 'What do you wonder about?' },
  { id: 's6-veda', at: 5.7, to: 8.4, tr: 'Bir dahaki “neden”de görüşürüz!', en: 'See you next time!' },
];

/** Bir satırın sahne içindeki başlangıç saniyesi: sahneler hareketi buna bağlar. */
export const an = (id) => {
  const s = satirlar.find((x) => x.id === id);
  if (!s) throw new Error(`bolum.js: "${id}" diye bir satır yok`);
  return s.at;
};

/** s4: mavi ışığın taneciklere çarptığı anlar (sahnenin saniyeleri). Sayfa yolu, film “tık” seslerini bunlardan kurar. */
export const carpmalar = [0, 0.7, 1.4].map((d) => an('s4-tik') + d).concat([0.1, 0.9, 1.7, 2.5, 3.3].map((d) => an('s4-ziplar') + d));

/** Ses efektleri: [parça, ses (assets/audio/efekt/<ses>.wav), sahne, sahnenin saniyesi, ses düzeyi].
 *  Bir parçadaki sesler üst üste binemez: `kur.mjs` bunu denetler. */
export const efektler = [
  ['hareket', 'boing', 's1', 0.55, 0.7],
  ['notalar', 'parilti', 's1', an('s1-sor') - 0.25, 0.6],

  ['hareket', 'vinn', 's2', -0.45, 0.6],
  ['hareket', 'pop', 's2', 0.1, 0.8],
  ['hareket', 'pop', 's2', 0.7, 0.7],
  ['hareket', 'boing', 's2', 1.0, 0.5],

  ['hareket', 'pop', 's3', 0.05, 0.8],
  ['notalar', 'isik', 's3', an('s3-gunes') + 0.3, 0.6],
  ['notalar', 'parilti', 's3', an('s3-sir') + 0.1, 0.55],
  ['hareket', 'vinn', 's3', an('s3-renkler'), 0.55],
  ...['kirmizi', 'turuncu', 'sari', 'yesil', 'mavi', 'mor'].map((ad, i) => ['notalar', `renk-${i + 1}`, 's3', an(`s3-${ad}`), 0.6]),

  ['hareket', 'vinn', 's4', 0.25, 0.5],
  ['notalar', 'parilti', 's4', an('s4-tanecik') + 0.2, 0.4],
  ['hareket', 'vinn', 's4', an('s4-kirmizi') + 0.3, 0.6],
  ...carpmalar.map((t, i) => ['notalar', `tik-${i % 3 + 1}`, 's4', t, i < 3 ? 1 : 0.6]),

  ...[0.25, 0.8, 1.4, 2.1, 2.9].map((t, i) => ['hareket', 'pop', 's5', t, 0.4 - i * 0.05]),
  ['notalar', 'parilti', 's5', an('s5-goz') + 0.4, 0.45],
  ['notalar', 'tada', 's5', an('s5-iste') + 1.9, 0.8],
  ['hareket', 'boing', 's5', an('s5-iste') + 0.25, 0.6],
  ['hareket', 'boing', 's5', an('s5-iste') + 1.2, 0.5],

  ['hareket', 'boing', 's6', an('s6-biliyoruz') + 0.2, 0.6],
  ['notalar', 'parilti', 's6', an('s6-sen'), 0.5],
  ['hareket', 'pop', 's6', an('s6-sen') + 0.15, 0.6],
  ['hareket', 'pop', 's6', an('s6-veda') + 0.1, 0.6],
];
