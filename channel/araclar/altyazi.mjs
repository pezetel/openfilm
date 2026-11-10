#!/usr/bin/env node
// bolum.js'teki anlatım satırlarından film saatinde bir WebVTT yazar: assets/altyazi.<dil>.vtt
//   node channel/araclar/altyazi.mjs channel/episodes/001-gokyuzu-neden-mavi [tr|en]
// YouTube'a altyazı olarak yüklenir. Satırın bitişi, o dilde seslendirme varsa sesin gerçek süresidir
// (assets/audio/vo/<dil>/sureler.json), yoksa bolum.js'teki `to`.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const klasor = resolve(process.argv[2] ?? '.');
const { basi, satirlar, dil: varsayilan } = await import(pathToFileURL(join(klasor, 'bolum.js')).href);
const dil = process.argv[3] ?? varsayilan;
const sureDosyasi = join(klasor, `assets/audio/vo/${dil}/sureler.json`);
const sureler = existsSync(sureDosyasi) ? JSON.parse(readFileSync(sureDosyasi, 'utf8')).sureler : {};

const saat = (s) => { const ms = Math.round(s * 1000), p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`; };
const soylenen = satirlar.filter((s) => s[dil]);
const vtt = ['WEBVTT', '', ...soylenen.flatMap((s) => {
  const b = basi(s.id.split('-')[0]) + s.at;
  return [s.id, `${saat(b)} --> ${saat(b + (sureler[s.id] ?? s.to - s.at))}`, s[dil], ''];
})].join('\n');
mkdirSync(join(klasor, 'assets'), { recursive: true });
const dosya = join(klasor, `assets/altyazi.${dil}.vtt`);
writeFileSync(dosya, vtt);
console.log(`${soylenen.length} satır → ${dosya}`);
