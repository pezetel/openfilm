// Nedo ile Neden? — sahnelerin ortak kiti: zaman yardımcıları, Nedo, güneş, renk topları, manzara.
// Tek kural: her şey yalnızca t'den hesaplanır; hiçbir şey kareden kareye birikmez.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
/** t, a ile b arasında nerede: 0…1 */
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  in: (k) => k * k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  back: (k) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2),
  elastic: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
};
/** "at" anında hoplayarak beliren şey: 0 → (biraz taşar) → 1 */
export const pop = (t, at, dur = 0.5) => ease.back(prog(t, at, at + dur));
/** a…b arasında bir kez yükselip inen tümsek: 0 → 1 → 0 */
export const bump = (t, a, b) => Math.sin(Math.PI * prog(t, a, b));
/** tohumdan hep aynı sayılar: sahne her açılışta aynı çizilsin */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** iki rengin karışımı (#rrggbb) */
export const mix = (a, b, k) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(' ')})`;
};
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const RENK = {
  murekkep: '#2B2140', gokUst: '#3FA9F5', gokAlt: '#BFE6FF', soluk: '#E9F0FB', solukAlt: '#F7FAFF',
  cimen: '#6CCB5F', cimenAcik: '#8EDB7A', cimenKoyu: '#4FB04A',
  nedo: '#FF8A3D', nedoKoyu: '#E8662A', nedoGobek: '#FFE3C4', sari: '#FFD23F', sariKoyu: '#FFB703',
};
/** ışığın içindeki renkler, sırasıyla */
export const GOKKUSAGI = [
  { ad: 'kirmizi', renk: '#FF4D4D' }, { ad: 'turuncu', renk: '#FF9431' }, { ad: 'sari', renk: '#FFD93D' },
  { ad: 'yesil', renk: '#4CD964' }, { ad: 'mavi', renk: '#3D8BFF' }, { ad: 'mor', renk: '#A66BFF' },
];

/** Yazı tipleri yüklenene kadar çizim başlamasın (Türkçe harfler ayrı dosyada: onları da iste). */
export const yazilar = () => Promise.all(['700', '800'].map((w) => document.fonts.load(`${w} 64px "Baloo 2"`, 'AaĞğŞşİıÇçÖöÜü?!')));

/** Sayfayı film olarak tanıt; OpenFilm dışında açılırsa kendi kendine oynasın. */
export function baslat(film) {
  window.film = film;
  if (window.filmHost) return;
  const t0 = performance.now();
  const dongu = () => {
    const t = (performance.now() - t0) / 1000;
    film.frame(film.duration ? t % film.duration : t);
    requestAnimationFrame(dongu);
  };
  Promise.resolve(film.ready).then(dongu);
}

// ───────────────────────── Nedo ─────────────────────────
// Orijin: ayaklarının bastığı yerin ortası. Boyu yaklaşık 300, başının üstünde süzülen soru işaretiyle 480.
export function nedoCiz() {
  const M = RENK.murekkep;
  const goz = (x) => `
    <g class="n-goz" data-x="${x}">
      <ellipse cx="${x}" cy="-196" rx="36" ry="41" fill="#fff"/>
      <g class="n-bebek"><circle cx="${x}" cy="-194" r="19" fill="${M}"/><circle cx="${x + 7}" cy="-203" r="7" fill="#fff"/></g>
    </g>`;
  return `
  <ellipse class="n-golge" cx="0" cy="8" rx="128" ry="18" fill="${M}" opacity=".16"/>
  <g class="n-govde">
    <g class="n-kol-sol"><line x1="-112" y1="-150" x2="-158" y2="-92" stroke="${RENK.nedoKoyu}" stroke-width="40" stroke-linecap="round"/></g>
    <g class="n-kol-sag"><line x1="112" y1="-150" x2="158" y2="-92" stroke="${RENK.nedoKoyu}" stroke-width="40" stroke-linecap="round"/></g>
    <ellipse cx="-54" cy="-8" rx="42" ry="20" fill="${RENK.nedoKoyu}"/>
    <ellipse cx="54" cy="-8" rx="42" ry="20" fill="${RENK.nedoKoyu}"/>
    <circle cx="-92" cy="-262" r="34" fill="${RENK.nedo}"/><circle cx="-92" cy="-262" r="17" fill="${RENK.nedoGobek}"/>
    <circle cx="92" cy="-262" r="34" fill="${RENK.nedo}"/><circle cx="92" cy="-262" r="17" fill="${RENK.nedoGobek}"/>
    <path d="M-134 -122 C-134 -232 -82 -292 0 -292 C82 -292 134 -232 134 -122 C134 -42 84 -12 0 -12 C-84 -12 -134 -42 -134 -122Z" fill="${RENK.nedo}"/>
    <ellipse cx="0" cy="-86" rx="80" ry="62" fill="${RENK.nedoGobek}"/>
    <circle cx="-92" cy="-146" r="21" fill="#FF5E7A" opacity=".5"/>
    <circle cx="92" cy="-146" r="21" fill="#FF5E7A" opacity=".5"/>
    ${goz(-48)}${goz(48)}
    <path class="n-agiz" d="M-24 -148 Q0 -124 24 -148" stroke="${M}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <g class="n-agiz-acik"><path d="M-30 -150 Q0 -98 30 -150Z" fill="${M}" stroke="${M}" stroke-width="8" stroke-linejoin="round"/><ellipse cx="0" cy="-124" rx="13" ry="8" fill="#FF5E7A"/></g>
    <g class="n-soru">
      <defs><radialGradient id="n-isik-g"><stop offset="0" stop-color="#FFFBE0"/><stop offset=".45" stop-color="#FFF6C4" stop-opacity=".7"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
      <circle class="n-isik" cx="0" cy="-400" r="170" fill="url(#n-isik-g)" opacity="0"/>
      <path d="M-40 -428 C-40 -476 40 -476 40 -428 C40 -396 0 -394 0 -362" stroke="#fff" stroke-width="34" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="0" cy="-326" r="23" fill="#fff"/>
      <path d="M-40 -428 C-40 -476 40 -476 40 -428 C40 -396 0 -394 0 -362" stroke="${RENK.sari}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="0" cy="-326" r="16" fill="${RENK.sari}"/>
    </g>
  </g>`;
}

/**
 * Nedo'nun t anındaki duruşu.
 * bak: [x, y] −1…1 gözbebeklerinin yönü · y: yerden yükseklik (px, yukarı eksi) · ez: 1 yere yapışmış, −1 uzamış
 * mutlu: 0 gülümser, 1 ağzı açık · solKol/sagKol: 0 aşağıda, 1 havada · salla: el sallama (0…1)
 * soru: soru işaretinin büyüklüğü · isik: parıltısı (0…1) · tohum: göz kırpma sırası
 */
export function nedoDurus(g, t, { bak = [0, 0], y = 0, ez = 0, mutlu = 0, solKol = 0, sagKol = 0, salla = 0, soru = 1, isik = 0, tohum = 0 } = {}) {
  const nefes = Math.sin(t * 2.3 + tohum) * 0.012;
  const sx = 1 + ez * 0.2 - nefes, sy = 1 - ez * 0.2 + nefes;
  $('.n-govde', g).setAttribute('transform', `translate(0 ${y.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`);
  const yuk = clamp(-y / 500);
  $('.n-golge', g).setAttribute('transform', `scale(${(1 - 0.55 * yuk).toFixed(3)})`);
  $('.n-golge', g).setAttribute('opacity', (0.16 * (1 - 0.6 * yuk)).toFixed(3));
  const k = (t + 1.9 + tohum * 1.7) % 3.4;
  const kirp = k < 0.16 ? Math.sin((k / 0.16) * Math.PI) : 0;
  for (const goz of $$('.n-goz', g)) {
    const x = goz.dataset.x;
    goz.setAttribute('transform', `translate(${x} -196) scale(1 ${(1 - 0.92 * kirp).toFixed(3)}) translate(${-x} 196)`);
  }
  for (const b of $$('.n-bebek', g)) b.setAttribute('transform', `translate(${(bak[0] * 13).toFixed(2)} ${(bak[1] * 15).toFixed(2)})`);
  $('.n-agiz', g).setAttribute('opacity', mutlu > 0.5 ? 0 : 1);
  $('.n-agiz-acik', g).setAttribute('opacity', mutlu > 0.5 ? 1 : 0);
  const el = Math.sin(t * 13) * 16 * salla;
  $('.n-kol-sol', g).setAttribute('transform', `rotate(${(solKol * 112).toFixed(2)} -112 -150)`);
  $('.n-kol-sag', g).setAttribute('transform', `rotate(${(-sagKol * 112 + el).toFixed(2)} 112 -150)`);
  const s = $('.n-soru', g);
  const sal = Math.sin(t * 1.9 + tohum) * 5, suz = Math.sin(t * 2.6 + tohum) * 7;
  s.setAttribute('transform', `translate(0 ${(suz - 300).toFixed(2)}) rotate(${sal.toFixed(2)}) scale(${soru.toFixed(3)}) translate(0 300)`);
  $('.n-isik', g).setAttribute('opacity', (isik * (0.85 + 0.15 * Math.sin(t * 6))).toFixed(3));
}

// ───────────────────────── güneş ─────────────────────────
export function gunesCiz(r = 190) {
  const M = RENK.murekkep;
  let isinlar = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 360, uz = i % 2 ? r * 0.42 : r * 0.6;
    isinlar += `<line x1="0" y1="${-(r + 30)}" x2="0" y2="${-(r + 30 + uz)}" stroke="${RENK.sariKoyu}" stroke-width="${r * 0.14}" stroke-linecap="round" transform="rotate(${a})"/>`;
  }
  const e = r / 190;
  return `
  <defs><radialGradient id="g-hale-g"><stop offset=".45" stop-color="#FFF6B8" stop-opacity=".9"/><stop offset="1" stop-color="#FFF6B8" stop-opacity="0"/></radialGradient></defs>
  <circle class="g-hale" r="${r * 2.1}" fill="url(#g-hale-g)"/>
  <g class="g-isinlar">${isinlar}</g>
  <circle r="${r}" fill="${RENK.sari}"/>
  <circle cx="${-74 * e}" cy="${30 * e}" r="${24 * e}" fill="#FF8A3D" opacity=".55"/>
  <circle cx="${74 * e}" cy="${30 * e}" r="${24 * e}" fill="#FF8A3D" opacity=".55"/>
  <g class="g-gozler"><ellipse cx="${-52 * e}" cy="${-22 * e}" rx="${15 * e}" ry="${20 * e}" fill="${M}"/><ellipse cx="${52 * e}" cy="${-22 * e}" rx="${15 * e}" ry="${20 * e}" fill="${M}"/></g>
  <path d="M${-44 * e} ${32 * e} Q0 ${78 * e} ${44 * e} ${32 * e}" stroke="${M}" stroke-width="${10 * e}" fill="none" stroke-linecap="round"/>`;
}
export function gunesDurus(g, t) {
  $('.g-isinlar', g).setAttribute('transform', `rotate(${(t * 9).toFixed(2)})`);
  $('.g-hale', g).setAttribute('transform', `scale(${(1 + 0.05 * Math.sin(t * 2)).toFixed(3)})`);
  const k = (t + 1.1) % 3.9;
  const kirp = k < 0.16 ? Math.sin((k / 0.16) * Math.PI) : 0;
  $('.g-gozler', g).setAttribute('transform', `scale(1 ${(1 - 0.9 * kirp).toFixed(3)})`);
}

// ───────────────────────── renk topu (ışığın bir rengi) ─────────────────────────
export function topCiz(renk, r = 46, yuz = true) {
  const M = RENK.murekkep, e = r / 46;
  return `<circle r="${r}" fill="${renk}" stroke="#fff" stroke-width="${6 * e}"/><circle cx="${-15 * e}" cy="${-17 * e}" r="${11 * e}" fill="#fff" opacity=".55"/>` + (yuz ? `
    <circle cx="${-13 * e}" cy="${-2 * e}" r="${5.5 * e}" fill="${M}"/><circle cx="${13 * e}" cy="${-2 * e}" r="${5.5 * e}" fill="${M}"/>
    <path d="M${-10 * e} ${12 * e} Q0 ${22 * e} ${10 * e} ${12 * e}" stroke="${M}" stroke-width="${4.5 * e}" fill="none" stroke-linecap="round"/>` : '');
}

// ───────────────────────── manzara ─────────────────────────
export const gokCiz = (id = 'gok') => `
  <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop class="gok-ust" offset="0" stop-color="${RENK.gokUst}"/><stop class="gok-alt" offset="1" stop-color="${RENK.gokAlt}"/></linearGradient></defs>
  <rect id="${id}" x="-200" y="-200" width="2320" height="1480" fill="url(#${id}-g)"/>`;
export const tepelerCiz = () => `
  <path d="M-100 830 C240 700 560 730 960 800 C1320 862 1640 742 2020 792 L2020 1180 L-100 1180Z" fill="${RENK.cimenAcik}"/>
  <path d="M-100 915 C360 830 800 892 1200 872 C1500 857 1760 892 2020 858 L2020 1180 L-100 1180Z" fill="${RENK.cimen}"/>
  ${[[180, 960, '#fff'], [420, 1010, '#FFD23F'], [1380, 955, '#FF8FB1'], [1640, 1005, '#fff'], [1090, 1020, '#FFD23F'], [760, 1040, '#FF8FB1']]
    .map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="15" fill="${c}"/><circle r="6" fill="#FFB703"/></g>`).join('')}`;
export const bulutCiz = (cls = '') => `<g class="bulut ${cls}"><ellipse rx="118" ry="46" fill="#fff"/><circle cx="-54" cy="-28" r="48" fill="#fff"/><circle cx="18" cy="-50" r="62" fill="#fff"/><circle cx="78" cy="-18" r="42" fill="#fff"/></g>`;
