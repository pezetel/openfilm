#!/usr/bin/env node
// film.html'i bolum.js'ten kurar: sahneler, anlatım, ses efektleri ve müzik, her biri kendi parçasında.
//   node channel/araclar/kur.mjs channel/episodes/001-gokyuzu-neden-mavi
// Önce seslendir.py (anlatım) ve ses.mjs (müzik, efektler) çalışmış olmalı. film.html'i baştan yazar:
// Studio'da elle yapılan değişiklikler bir sonraki kurulumda kaybolur, o yüzden elle ince ayar en sona kalır.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const klasor = resolve(process.argv[2] ?? '.');
const { dil, sahneler, satirlar, efektler, basi, sure } = await import(pathToFileURL(join(klasor, 'bolum.js')).href);

const r3 = (x) => Math.round(x * 1000) / 1000;
const uzunluk = (dosya) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(klasor, dosya)], { encoding: 'utf8' }));
const toplam = sahneler.reduce((a, s) => a + s[2], 0);
const sorunlar = [];

for (const [ad, , sn] of sahneler) if (Math.abs(sn * 2 - Math.round(sn * 2)) > 1e-9) sorunlar.push(`${ad}: süresi (${sn}) yarım saniyenin katı değil, müzik kesmeye denk gelmez`);

// anlatım: her satırın sesi, sahnesinin başı + satırın anı
const sureDosyasi = join(klasor, `assets/audio/vo/${dil}/sureler.json`);
const sureler = existsSync(sureDosyasi) ? JSON.parse(readFileSync(sureDosyasi, 'utf8')).sureler : {};
const anlatim = satirlar.filter((s) => s[dil]).map((s) => {
  const sahne = s.id.split('-')[0], dosya = `assets/audio/vo/${dil}/${s.id}.wav`;
  if (!existsSync(join(klasor, dosya))) { sorunlar.push(`${s.id}: sesi yok (${dosya}); önce seslendir.py`); return null; }
  const sn = sureler[s.id] ?? uzunluk(dosya);
  if (s.at + sn > sure(sahne) + 0.05) sorunlar.push(`${s.id}: ${r3(s.at + sn)}. saniyede bitiyor, sahne ${sure(sahne)} saniye`);
  return { id: `vo-${s.id}`, src: dosya, at: r3(basi(sahne) + s.at), sn, volume: 1 };
}).filter(Boolean);

// efektler: parça adına göre
const parcalar = new Map();
const sayac = new Map();
for (const [parca, ses, sahne, t, volume] of efektler) {
  const dosya = `assets/audio/efekt/${ses}.wav`;
  if (!existsSync(join(klasor, dosya))) { sorunlar.push(`${ses}: dosyası yok (${dosya}); önce ses.mjs`); continue; }
  const n = (sayac.get(`${sahne}-${ses}`) ?? 0) + 1;
  sayac.set(`${sahne}-${ses}`, n);
  if (!parcalar.has(parca)) parcalar.set(parca, []);
  parcalar.get(parca).push({ id: `${sahne}-${ses}${n > 1 ? `-${n}` : ''}`, src: dosya, at: r3(basi(sahne) + t), sn: uzunluk(dosya), volume });
}

// bir parçadaki sesler üst üste binemez
const denetle = (ad, klipler) => {
  klipler.sort((a, b) => a.at - b.at);
  for (let i = 1; i < klipler.length; i++) {
    const once = klipler[i - 1], bu = klipler[i];
    if (once.at + once.sn > bu.at + 0.001) sorunlar.push(`“${ad}” parçası: ${once.id} (${once.at}–${r3(once.at + once.sn)}) ile ${bu.id} (${bu.at}) üst üste`);
  }
};
denetle('anlatım', anlatim);
for (const [ad, klipler] of parcalar) denetle(ad, klipler);

if (sorunlar.length) { console.error(`film.html yazılmadı:\n  ${sorunlar.join('\n  ')}`); process.exit(1); }

const sesKlibi = (k) => `  <audio id="${k.id}" src="${k.src}"${k.at ? ` at="${k.at}"` : ''}${k.volume === 1 ? '' : ` volume="${k.volume}"`}></audio>`;
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
</head>
<body>
<section title="sahneler">
${sahneler.map(([ad, sayfa]) => `  <iframe id="${ad}" src="${sayfa}"${basi(ad) ? ` at="${r3(basi(ad))}"` : ''}></iframe>`).join('\n')}
</section>
<section title="anlatım (${dil})">
${anlatim.map(sesKlibi).join('\n')}
</section>
${[...parcalar].map(([ad, klipler]) => `<section title="efekt: ${ad}">\n${klipler.map(sesKlibi).join('\n')}\n</section>`).join('\n')}
<section title="müzik">
  <audio id="muzik" src="assets/audio/muzik/tema.mp3#t=0,${r3(toplam)}" volume="${anlatim.length ? 0.32 : 0.6}"></audio>
</section>
</body>
</html>
`;
writeFileSync(join(klasor, 'film.html'), html);
console.log(`film.html: ${toplam} sn · ${sahneler.length} sahne · ${anlatim.length} anlatım satırı · ${[...parcalar.values()].reduce((a, k) => a + k.length, 0)} efekt`);
