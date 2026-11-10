#!/usr/bin/env node
// Nedo ile Neden? — bölümün müziğini ve ses efektlerini kodla üretir. Hazır kayıt yok: her ses buradaki
// formüllerden çıkar, o yüzden hepsi kanalın kendi malıdır ve her çalıştırmada bit bit aynıdır.
//
//   node channel/araclar/ses.mjs channel/episodes/001-gokyuzu-neden-mavi
//
// Yazdıkları: <bölüm>/assets/audio/muzik/tema.mp3 (bölümün sahne sürelerine göre) ve assets/audio/efekt/*.wav

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const SR = 44100, TAU = Math.PI * 2;
const klasor = resolve(process.argv[2] ?? '.');
const { sahneler } = await import(pathToFileURL(join(klasor, 'bolum.js')).href);

// ───────── yardımcılar ─────────
const NOTA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** 'A4' → 440 */
const hz = (ad) => { const m = /^([A-G])(#?)(\d)$/.exec(ad); return 440 * 2 ** ((NOTA[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12 - 9) / 12); };
function tohumlu(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const ses = (sn, f) => { const a = new Float32Array(Math.ceil(sn * SR)); for (let i = 0; i < a.length; i++) a[i] = f(i / SR, i); return a; };
const vurus = (t) => 1 - Math.exp(-t * 900);          // tıklamasız başlangıç

// ───────── çalgılar ─────────
const marimba = (f, sn = 1.1) => ses(sn, (t) => vurus(t) * Math.exp(-t * 5.2) * (Math.sin(TAU * f * t) + 0.45 * Math.sin(TAU * f * 3.93 * t) * Math.exp(-t * 20) + 0.16 * Math.sin(TAU * f * 9.2 * t) * Math.exp(-t * 45)));
const zil = (f, sn = 1.6) => ses(sn, (t) => vurus(t) * Math.exp(-t * 3.4) * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t * 5) + 0.22 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t * 11)) * 0.7);
const bas = (f, sn = 0.7) => ses(sn, (t) => vurus(t) * Math.exp(-t * 4.2) * (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 8)));
/** tel: Karplus–Strong (ukulele gibi tınlar) */
function tel(f, sn = 1.0, seed = 1) {
  const N = Math.round(SR / f), r = tohumlu(seed + N), hat = Float32Array.from({ length: N }, () => r() * 2 - 1);
  for (let i = 1; i < N; i++) hat[i] = 0.55 * hat[i] + 0.45 * hat[i - 1];      // biraz yumuşat
  let j = 0;
  return ses(sn, (t) => { const k = (j + 1) % N, y = hat[j]; hat[j] = 0.4985 * (hat[j] + hat[k]); j = k; return y * Math.min(1, (sn - t) * 30); });
}
const cingirak = (sn = 0.07, seed = 3) => { const r = tohumlu(seed); let o = 0; return ses(sn, (t) => { const x = r() * 2 - 1, y = x - o; o = x; return y * Math.exp(-t * 75); }); };

// ───────── karıştırıcı ─────────
class Kayit {
  constructor(sn) { this.n = Math.ceil(sn * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n); }
  /** tek kanallı bir sesi `at` saniyesine koy; yön: −1 sol … 1 sağ */
  koy(a, at, kazanc = 1, yon = 0) {
    const o = Math.round(at * SR), l = kazanc * Math.cos((yon + 1) * Math.PI / 4), r = kazanc * Math.sin((yon + 1) * Math.PI / 4);
    for (let i = 0; i < a.length && o + i < this.n; i++) if (o + i >= 0) { this.L[o + i] += a[i] * l; this.R[o + i] += a[i] * r; }
    return this;
  }
  /** küçük bir oda: dört tarak, iki tümgeçiren (Schroeder) */
  oda(islak = 0.16) {
    for (const [K, kay] of [[this.L, 0], [this.R, 23]]) {
      const y = new Float32Array(this.n);
      for (const [ms, g] of [[29.7, 0.76], [37.1, 0.74], [41.1, 0.72], [43.7, 0.7]]) {
        const d = Math.round(ms / 1000 * SR) + kay, h = new Float32Array(d); let j = 0, az = 0;
        for (let i = 0; i < this.n; i++) { const o = h[j]; az = 0.6 * o + 0.4 * az; h[j] = K[i] + az * g; j = (j + 1) % d; y[i] += o * 0.25; }
      }
      for (const ms of [5, 1.7]) {
        const d = Math.round(ms / 1000 * SR), h = new Float32Array(d); let j = 0;
        for (let i = 0; i < this.n; i++) { const o = h[j], x = y[i]; h[j] = x + o * 0.7; y[i] = o - x * 0.7; j = (j + 1) % d; }
      }
      for (let i = 0; i < this.n; i++) K[i] += y[i] * islak;
    }
    return this;
  }
  /** en yüksek tepe `tepe` olsun; sonu kısa bir sönüşle bitsin */
  duzle(tepe = 0.7, sonus = 0.03) {
    let m = 0; for (let i = 0; i < this.n; i++) m = Math.max(m, Math.abs(this.L[i]), Math.abs(this.R[i]));
    const k = m ? tepe / m : 1, s = Math.round(sonus * SR);
    for (let i = 0; i < this.n; i++) { const f = k * Math.min(1, (this.n - 1 - i) / s); this.L[i] *= f; this.R[i] *= f; }
    return this;
  }
  wav(dosya) {
    const b = Buffer.alloc(44 + this.n * 4);
    b.write('RIFF', 0); b.writeUInt32LE(36 + this.n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
    b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(this.n * 4, 40);
    for (let i = 0; i < this.n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, this.L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, this.R[i])) * 32767), 46 + i * 4); }
    writeFileSync(dosya, b);
  }
}

// ───────── müzik ─────────
// 120 vuruş/dakika, ölçü 2 saniye. Her sahnenin havası ayrı; akorlar hep C–Am–F–G çevresinde döner.
const AKOR = {
  C: { bas: ['C3', 'G2'], tel: ['C4', 'E4', 'G4'] }, Am: { bas: ['A2', 'E2'], tel: ['A3', 'C4', 'E4'] },
  F: { bas: ['F2', 'C3'], tel: ['F3', 'A3', 'C4'] }, G: { bas: ['G2', 'D3'], tel: ['G3', 'B3', 'D4'] },
};
const EZGI = [   // sekiz ölçülük ezgi: her ölçüde dört vuruş, null = sus
  ['E5', 'G5', 'C6', 'G5'], ['A5', null, 'E5', 'A5'], ['F5', 'A5', 'C6', 'A5'], ['G5', 'B5', 'D6', null],
  ['E5', 'G5', 'C6', 'E6'], ['C6', 'A5', 'E5', null], ['F5', 'A5', 'G5', 'F5'], ['D5', 'G5', 'B5', null],
];
const MERAK = [  // deney sahnesi: seyrek, sorar gibi
  ['A5', null, null, 'E5'], [null, 'F5', null, 'C5'], ['G5', null, 'E5', null], [null, 'D5', null, 'B4'],
  ['A5', null, 'C6', null], [null, 'A5', 'F5', null], ['E5', null, 'G5', null], ['D5', null, null, 'G5'],
];
const HAVA = {
  giris:   { akorlar: ['C', 'Am', 'F', 'G'], tel: 0.5, bas: 0.5 },
  ana:     { akorlar: ['C', 'Am', 'F', 'G'], tel: 0.6, bas: 0.7, ezgi: EZGI, marimba: 0.55, cingirak: 0.05 },
  merak:   { akorlar: ['Am', 'F', 'C', 'G'], tel: 0.5, bas: 0.55, ezgi: MERAK, zil: 0.3, kesik: true },
  parlak:  { akorlar: ['C', 'Am', 'F', 'G'], tel: 0.65, bas: 0.75, ezgi: EZGI, marimba: 0.6, zil: 0.22, cingirak: 0.07 },
  kapanis: { akorlar: ['C', 'Am', 'F', 'G'], tel: 0.6, bas: 0.7, ezgi: [...EZGI.slice(0, 3), ['G5', 'A5', 'B5', null]], marimba: 0.55, zil: 0.18, cingirak: 0.05, son: true },
};
function muzik() {
  const toplam = sahneler.reduce((a, [, , sn]) => a + sn, 0);
  const k = new Kayit(toplam + 0.5);
  let bas0 = 0, sira = 0;
  for (const [, , sn, hava] of sahneler) {
    const cal = (a, at, kazanc, yon) => { if (at < sn - 0.01) k.koy(a, bas0 + at, kazanc, yon); };
    if (hava === 'baslik') {
      // başlık: soru gibi yükselip havada kalan ezgi (cevabı filmin sonunda gelir)
      cal(bas(hz('G2'), 1.6), 0, 0.7, 0);
      AKOR.G.tel.forEach((n, i) => { cal(tel(hz(n), 1.6, 40 + i), i * 0.06, 0.45, -0.3 + i * 0.3); cal(tel(hz(n), 1.4, 50 + i), 1.5 + i * 0.06, 0.4, -0.3 + i * 0.3); });
      [['E5', 0], ['G5', 0.25], ['A5', 0.5], ['B5', 1.0], ['D6', 1.5]].forEach(([n, at]) => { cal(zil(hz(n), 1.8), at, 0.5, 0.2); cal(marimba(hz(n), 1), at, 0.4, -0.2); });
    } else {
      const h = HAVA[hava] ?? HAVA.ana;
      const olcu = Math.ceil(sn / 2 - 0.001) - (h.son ? 1 : 0);
      for (let o = 0; o < olcu; o++) {
        const a = AKOR[h.akorlar[o % h.akorlar.length]], at = o * 2;
        cal(bas(hz(a.bas[0])), at, h.bas, 0); cal(bas(hz(a.bas[1]), 0.5), at + 1, h.bas * 0.7, 0);
        for (let e = 0; e < 8; e++) {                      // sekizlikler
          if (h.kesik ? e % 2 === 0 : false) continue;      // merak: yalnız aradaki vuruşlar
          const n = a.tel[[0, 1, 2, 1, 0, 2, 1, 2][e]];
          cal(tel(hz(n) * (h.kesik ? 2 : 1), h.kesik ? 0.35 : 0.9, 7 * o + e), at + e * 0.25, h.tel * (e % 2 ? 0.7 : 1), e % 2 ? 0.35 : -0.35);
          if (h.cingirak) cal(cingirak(0.07, 11 * o + e), at + e * 0.25, h.cingirak * (e % 2 ? 1.6 : 1), 0.5);
        }
        (h.ezgi?.[(sira + o) % h.ezgi.length] ?? []).forEach((n, v) => {
          if (!n) return;
          if (h.marimba) cal(marimba(hz(n)), at + v * 0.5, h.marimba, -0.15);
          if (h.zil) cal(zil(hz(n) * (h.marimba ? 2 : 1)), at + v * 0.5, h.zil, 0.25);
        });
      }
      if (h.son) {                                          // son: soru çözülür, C'de biter
        const at = olcu * 2;
        cal(bas(hz('C3'), 1.4), at, 0.8, 0);
        ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => cal(tel(hz(n), 1.4, 90 + i), at + i * 0.05, 0.5, -0.4 + i * 0.25));
        cal(marimba(hz('C6'), 1.4), at, 0.6, -0.15); cal(zil(hz('C7'), 1.5), at, 0.25, 0.25); cal(zil(hz('E6'), 1.5), at + 0.05, 0.2, 0.1);
      }
      if (h.ezgi) sira += olcu;
    }
    bas0 += sn;
  }
  return k.oda(0.2).duzle(0.6, 0.4);
}

// ───────── efektler ─────────
const EFEKT = {
  // baloncuk patlar gibi: bir şey belirdi
  pop: () => { let f = 0; return new Kayit(0.14).koy(ses(0.14, (t) => { f += TAU * (320 + 5200 * Math.min(t, 0.08)) / SR; return vurus(t) * Math.exp(-t * 38) * Math.sin(f); }), 0, 1).duzle(0.6, 0.01); },
  // yay gibi: Nedo zıplar, konar
  boing: () => { let f = 0; return new Kayit(0.5).koy(ses(0.5, (t) => { f += TAU * 190 * 2 ** (-t * 0.9) * (1 + 0.32 * Math.sin(TAU * 17 * t) * Math.exp(-t * 3.5)) / SR; return vurus(t) * Math.exp(-t * 5.5) * (Math.sin(f) + 0.35 * Math.sin(2 * f)); }), 0, 1).duzle(0.6); },
  // rüzgâr gibi: bir şey hızla geçer
  vinn: () => {
    const r = tohumlu(5); let lo = 0, bp = 0;
    return new Kayit(0.5).koy(ses(0.5, (t) => {
      const fc = 500 + 2600 * Math.sin(Math.PI * t / 0.5) ** 2, w = 2 * Math.sin(Math.PI * fc / SR), x = r() * 2 - 1;
      lo += w * bp; const hi = x - lo - 0.5 * bp; bp += w * hi;
      return bp * Math.sin(Math.PI * t / 0.5) ** 2;
    }), 0, 1).duzle(0.45);
  },
  // pırıltı: merak, sır, sihir
  parilti: () => { const k = new Kayit(1.1); [['C7', 0], ['G7', 0.07], ['E7', 0.14], ['B7', 0.22], ['G7', 0.31], ['D8', 0.42]].forEach(([n, at], i) => k.koy(zil(hz(n), 0.65), at, 0.6, i % 2 ? 0.5 : -0.5)); return k.oda(0.25).duzle(0.4); },
  // ışın uzar
  isik: () => { let f = 0; return new Kayit(1.7).koy(ses(1.7, (t) => { f += TAU * 300 * 3 ** Math.min(1, t / 1.5) / SR; return Math.min(1, t / 0.25) * Math.min(1, (1.7 - t) / 0.45) * (0.75 + 0.25 * Math.sin(TAU * 11 * t)) * (Math.sin(f) + 0.3 * Math.sin(2 * f) + 0.12 * Math.sin(3 * f)); }), 0, 1).oda(0.25).duzle(0.32); },
  // "işte bu yüzden!"
  tada: () => { const k = new Kayit(1.7); ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => { k.koy(marimba(hz(n), 1.3), i * 0.08, 0.7, -0.3 + i * 0.15); k.koy(zil(hz(n) * 2, 1.4), i * 0.08, 0.3, 0.3 - i * 0.15); }); return k.oda(0.25).duzle(0.6, 0.2); },
};
// renklerin notaları: kırmızıdan mora yükselen altı ses
['C5', 'D5', 'E5', 'G5', 'A5', 'C6'].forEach((n, i) => { EFEKT[`renk-${i + 1}`] = () => new Kayit(0.7).koy(marimba(hz(n), 0.7), 0, 0.8).koy(zil(hz(n) * 2, 0.7), 0, 0.3).oda(0.15).duzle(0.6, 0.1); });
// tık: mavi ışık bir taneciğe çarpar
['G6', 'A6', 'C7'].forEach((n, i) => { EFEKT[`tik-${i + 1}`] = () => new Kayit(0.34).koy(marimba(hz(n), 0.3), 0, 1).koy(cingirak(0.03, 9), 0, 0.25).oda(0.12).duzle(0.55, 0.05); });

// ───────── yaz ─────────
const efektDir = join(klasor, 'assets/audio/efekt'), muzikDir = join(klasor, 'assets/audio/muzik');
mkdirSync(efektDir, { recursive: true }); mkdirSync(muzikDir, { recursive: true });
for (const [ad, yap] of Object.entries(EFEKT)) yap().wav(join(efektDir, `${ad}.wav`));
const gecici = join(muzikDir, 'tema.wav');
muzik().wav(gecici);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', gecici, '-codec:a', 'libmp3lame', '-b:a', '160k', join(muzikDir, 'tema.mp3')]);
rmSync(gecici);
console.log(`${Object.keys(EFEKT).length} efekt → ${efektDir}\nmüzik → ${join(muzikDir, 'tema.mp3')}`);
