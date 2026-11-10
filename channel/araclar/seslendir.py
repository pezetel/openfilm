#!/usr/bin/env python3
"""Bölümün anlatımını seslendirir: bolum.js'teki her satır için bir ses dosyası.

  python channel/araclar/seslendir.py channel/episodes/001-gokyuzu-neden-mavi
  python channel/araclar/seslendir.py <bölüm> --voice af_bella --speed 0.85 --pitch 1.5
  python channel/araclar/seslendir.py <bölüm> --dene af_heart,af_bella,bf_emma     # ses seçmek için örnekler

Ses motoru Kokoro (Apache 2.0): anahtar istemez, bilgisayarda çalışır, ürettiği ses ticari işte kullanılabilir.
İngilizce içindir; Türkçe bilmez. Kurulum bir kez:

  pip install kokoro-onnx soundfile

Model dosyaları (350 MB) ilk çalıştırmada ~/.cache/nedo-kokoro içine iner (ya da NEDO_KOKORO'nun gösterdiği yere).

Yazdıkları: <bölüm>/assets/audio/vo/<dil>/<satır>.wav, yanında sözleri (.vtt), ve sureler.json: her satırın
saniyesi. Sonra bolum.js'teki `at` değerleri bu sürelere göre düzeltilir, `kur.mjs` filmi yeniden kurar.
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

SURUM = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
DOSYALAR = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]
LEHCE = {"en": "en-us"}


def model_yeri() -> Path:
    yer = Path(os.environ.get("NEDO_KOKORO") or Path.home() / ".cache" / "nedo-kokoro")
    yer.mkdir(parents=True, exist_ok=True)
    for ad in DOSYALAR:
        if not (yer / ad).exists():
            print(f"model iniyor: {ad} …", file=sys.stderr)
            urllib.request.urlretrieve(SURUM + ad, yer / (ad + ".yarim"))
            (yer / (ad + ".yarim")).rename(yer / ad)
    return yer


def bolum_oku(klasor: Path) -> dict:
    """bolum.js bir JavaScript modülü: satırlarını node okur."""
    kod = "const m = await import(process.argv[1]); console.log(JSON.stringify({ dil: m.dil, satirlar: m.satirlar }))"
    cikti = subprocess.run(["node", "--input-type=module", "-e", kod, (klasor / "bolum.js").resolve().as_uri()],
                           check=True, capture_output=True, text=True).stdout
    return json.loads(cikti)


def duzelt(ses: np.ndarray, hiz: int, rms_db: float = -21.0) -> np.ndarray:
    """Baştaki ve sondaki sessizliği kırp, her satırı aynı yüksekliğe getir, uçlarını yumuşat."""
    ses = ses.astype(np.float64)
    esik = max(1e-4, np.abs(ses).max() * 0.02)
    dolu = np.nonzero(np.abs(ses) > esik)[0]
    if len(dolu):
        pay = int(0.04 * hiz)
        ses = ses[max(0, dolu[0] - pay): dolu[-1] + pay * 3]
    rms = np.sqrt(np.mean(ses ** 2)) or 1.0
    ses = ses * (10 ** (rms_db / 20) / rms)
    tepe = np.abs(ses).max()
    if tepe > 0.84:
        ses *= 0.84 / tepe
    kenar = int(0.01 * hiz)
    ses[:kenar] *= np.linspace(0, 1, kenar)
    ses[-kenar:] *= np.linspace(1, 0, kenar)
    return ses


def perde(dosya: Path, yarim_ton: float) -> None:
    """Sesi süresini değiştirmeden inceltir ya da kalınlaştırır (ffmpeg)."""
    if not yarim_ton:
        return
    oran = 2 ** (yarim_ton / 12)
    gecici = dosya.with_suffix(".perde.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(dosya), "-af",
                    f"rubberband=pitch={oran:.5f}", str(gecici)], check=True)
    gecici.replace(dosya)


def saat(sn: float) -> str:
    ms = round(sn * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}"


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("bolum", type=Path)
    p.add_argument("--voice", default="af_heart", help="Kokoro sesi (af_heart, af_bella, bf_emma, am_puck …)")
    p.add_argument("--speed", type=float, default=0.9, help="konuşma hızı; küçük çocuk için 0.85–0.95")
    p.add_argument("--pitch", type=float, default=0.0, help="yarım ton: artı değer sesi inceltir")
    p.add_argument("--dene", help="virgülle ayrılmış sesler: her biriyle ilk üç satır, assets yerine <bölüm>/.dene içine")
    a = p.parse_args()

    from kokoro_onnx import Kokoro
    yer = model_yeri()
    kokoro = Kokoro(str(yer / DOSYALAR[0]), str(yer / DOSYALAR[1]))
    b = bolum_oku(a.bolum)
    dil = b["dil"]
    if dil not in LEHCE:
        sys.exit(f"Kokoro {dil} bilmiyor (bildikleri: {', '.join(LEHCE)}). bolum.js'te dil = 'en' olmalı.")
    satirlar = [s for s in b["satirlar"] if s.get(dil)]

    def soyle(metin: str, ses_adi: str, dosya: Path) -> float:
        ses, hiz = kokoro.create(metin, voice=ses_adi, speed=a.speed, lang=LEHCE[dil])
        ses = duzelt(ses, hiz)
        sf.write(dosya, ses, hiz, subtype="PCM_16")
        perde(dosya, a.pitch)
        return sf.info(dosya).duration

    if a.dene:
        cikis = a.bolum / ".dene"
        cikis.mkdir(exist_ok=True)
        metin = " ".join(s[dil] for s in satirlar[:3])
        for ses_adi in a.dene.split(","):
            dosya = cikis / f"{ses_adi}{f'+{a.pitch:g}' if a.pitch else ''}.wav"
            print(f"{ses_adi:12} {soyle(metin, ses_adi, dosya):5.2f} sn  {dosya}")
        return

    cikis = a.bolum / "assets" / "audio" / "vo" / dil
    cikis.mkdir(parents=True, exist_ok=True)
    sureler = {}
    for s in satirlar:
        dosya = cikis / f"{s['id']}.wav"
        sn = soyle(s[dil], a.voice, dosya)
        sureler[s["id"]] = round(sn, 3)
        dosya.with_suffix(".vtt").write_text(f"WEBVTT\n\n{saat(0)} --> {saat(sn)}\n{s[dil]}\n", encoding="utf-8")
        ayrilan = s["to"] - s["at"]
        print(f"{s['id']:14} {sn:5.2f} sn  (bolum.js'te {ayrilan:4.1f} sn ayrılmış{'' if sn <= ayrilan + 0.05 else '  ← SIĞMIYOR'})  {s[dil]}")
    (cikis / "sureler.json").write_text(json.dumps({"voice": a.voice, "speed": a.speed, "pitch": a.pitch, "sureler": sureler}, indent=1) + "\n", encoding="utf-8")
    print(f"{len(sureler)} satır → {cikis}")


if __name__ == "__main__":
    main()
