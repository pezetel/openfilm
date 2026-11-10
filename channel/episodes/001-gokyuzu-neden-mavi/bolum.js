// Bölüm 001 — Gökyüzü neden mavi?
// Sesli anlatımın satırları ve her birinin sahne içindeki başlangıç saniyesi. Sahneler hareketlerini bu
// saniyelerden kurar: seslendirme gelince yalnızca buradaki `at` değerleri (ve gerekirse sahne süreleri) ayarlanır.
// Ekrandaki yazılar da burada: başka bir dil = bu dosyanın o dildeki hâli + o dilin ses dosyaları.

export const dil = 'tr';

/** Sahneler, filmdeki sıralarıyla: [ad, süre (saniye), müziğin havası]. film.html ile aynı olmalı.
 *  Müzik (araclar/ses.mjs) bu sürelere göre bestelenir: 2 saniyede bir ölçü, her kesme bir vuruşa denk gelir. */
export const sahneler = [
  ['s1', 8, 'giris'], ['s2', 3.5, 'baslik'], ['s3', 15, 'ana'], ['s4', 20, 'merak'], ['s5', 12, 'parlak'], ['s6', 9.5, 'kapanis'],
];

export const yazi = {
  tr: { marka: 'Nedo ile Neden?', baslik: 'Gökyüzü neden mavi?', soru: 'Sen neyi merak ediyorsun?', veda: 'Görüşürüz!' },
  en: { marka: 'Why, Nedo?', baslik: 'Why is the sky blue?', soru: 'What do you wonder about?', veda: 'See you soon!' },
}[dil];

/** id: sahne-an · at/to: sahnenin kendi saniyeleri · tr/en: söylenen söz */
export const satirlar = [
  { id: 's1-merhaba', at: 0.9, to: 2.5, tr: 'Merhaba! Ben Nedo.', en: "Hi! I'm Nedo." },
  { id: 's1-bak', at: 2.8, to: 5.3, tr: 'Bugün yukarı baktım ve merak ettim…', en: 'Today I looked up and wondered…' },
  { id: 's1-sor', at: 5.6, to: 7.7, tr: 'Gökyüzü neden mavi?', en: 'Why is the sky blue?' },

  { id: 's3-gunes', at: 0.6, to: 2.9, tr: 'Güneş bize ışık yollar.', en: 'The Sun sends us light.' },
  { id: 's3-beyaz', at: 3.2, to: 5.2, tr: 'Işık bembeyaz görünür…', en: 'The light looks white…' },
  { id: 's3-sir', at: 5.5, to: 7.4, tr: 'ama içinde bir sır saklı!', en: 'but it hides a secret!' },
  { id: 's3-renkler', at: 7.7, to: 9.6, tr: 'İçinde bütün renkler var:', en: 'All the colors are inside it:' },
  { id: 's3-say', at: 9.8, to: 14.5, tr: 'kırmızı, turuncu, sarı, yeşil, mavi, mor!', en: 'red, orange, yellow, green, blue, purple!' },

  { id: 's4-hava', at: 0.4, to: 3.8, tr: 'Işık bize gelirken havanın içinden geçer.', en: 'On its way to us, light passes through the air.' },
  { id: 's4-tanecik', at: 4.2, to: 7.6, tr: 'Havada göremediğimiz minicik tanecikler var.', en: 'The air is full of tiny bits we cannot see.' },
  { id: 's4-kirmizi', at: 8.0, to: 11.0, tr: 'Kırmızı ışık dümdüz geçer gider.', en: 'Red light goes straight through.' },
  { id: 's4-mavi', at: 11.6, to: 13.0, tr: 'Ama mavi ışık…', en: 'But blue light…' },
  { id: 's4-tik', at: 13.2, to: 15.0, tr: 'tık, tık, tık!', en: 'boing, boing, boing!' },
  { id: 's4-ziplar', at: 15.4, to: 19.2, tr: 'Taneciklere çarpar ve her yöne zıplar!', en: 'It bumps into the tiny bits and bounces everywhere!' },

  { id: 's5-yayilir', at: 0.4, to: 4.2, tr: 'Zıplayan mavi ışık bütün gökyüzüne yayılır.', en: 'The bouncing blue light spreads all over the sky.' },
  { id: 's5-goz', at: 4.6, to: 8.0, tr: 'Nereye bakarsak bakalım, gözümüze mavi gelir.', en: 'Wherever we look, blue reaches our eyes.' },
  { id: 's5-iste', at: 8.4, to: 11.4, tr: 'İşte bu yüzden gökyüzü mavi!', en: 'And that is why the sky is blue!' },

  { id: 's6-biliyoruz', at: 0.4, to: 1.9, tr: 'Artık biliyoruz!', en: 'Now we know!' },
  { id: 's6-sen', at: 2.3, to: 5.2, tr: 'Peki sen neyi merak ediyorsun?', en: 'So, what do you wonder about?' },
  { id: 's6-veda', at: 5.7, to: 8.4, tr: 'Bir dahaki “neden”de görüşürüz!', en: 'See you at the next “why”!' },
];

/** Bir satırın sahne içindeki başlangıç saniyesi: sahneler hareketi buna bağlar. */
export const an = (id) => {
  const s = satirlar.find((x) => x.id === id);
  if (!s) throw new Error(`bolum.js: "${id}" diye bir satır yok`);
  return s.at;
};
