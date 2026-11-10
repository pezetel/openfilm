#!/usr/bin/env node
// bolum.js'teki anlatım satırlarından film saatinde bir WebVTT yazar: assets/altyazi.<dil>.vtt
//   node channel/araclar/altyazi.mjs channel/episodes/001-gokyuzu-neden-mavi [tr|en]
// İki işi var: seslendirme gelene kadar filmde senaryoyu göstermek (film.html'deki captions parçası),
// ve YouTube'a altyazı olarak yüklemek.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const klasor = resolve(process.argv[2] ?? '.');
const { sahneler, satirlar, dil: varsayilan } = await import(pathToFileURL(join(klasor, 'bolum.js')).href);
const dil = process.argv[3] ?? varsayilan;

const baslar = {};
let t = 0;
for (const [ad, sn] of sahneler) { baslar[ad] = t; t += sn; }
const saat = (s) => { const ms = Math.round(s * 1000), p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`; };

const vtt = [
  'WEBVTT', '',
  'REGION', 'id:main', 'width:86%', 'lines:3', 'regionanchor:50%,100%', 'viewportanchor:50%,94%', '',
  'STYLE', '::cue { font: 700 4.4cqmin/1.25 system-ui, sans-serif; color: #ffffff; background: rgba(43, 33, 64, 0.78); padding: 0.2em 0.7em; border-radius: 0.5em; }', '',
  ...satirlar.flatMap((s) => {
    const b = baslar[s.id.split('-')[0]];
    if (b === undefined) throw new Error(`"${s.id}" hangi sahnenin? (sahneler: ${Object.keys(baslar).join(', ')})`);
    if (!s[dil]) throw new Error(`"${s.id}" satırının ${dil} sözü yok`);
    return [s.id, `${saat(b + s.at)} --> ${saat(b + s.to)} region:main align:center`, s[dil], ''];
  }),
].join('\n');
mkdirSync(join(klasor, 'assets'), { recursive: true });
const dosya = join(klasor, `assets/altyazi.${dil}.vtt`);
writeFileSync(dosya, vtt);
console.log(`${satirlar.length} satır → ${dosya}`);
