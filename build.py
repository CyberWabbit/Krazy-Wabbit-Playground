from pathlib import Path

root = Path(__file__).resolve().parent
src = root / "src"
html = (src / "page.html").read_text(encoding="utf-8")
html = html.replace("/* STYLE */", (src / "style.css").read_text(encoding="utf-8"))
html = html.replace("/* SCRIPT */", "\n".join((src / f).read_text(encoding="utf-8") for f in (
    "music.js", "ecosystem.js", "audio.js", "habitat.js", "ui.js"
)))
site = root / "docs"
site.mkdir(exist_ok=True)
(site / "index.html").write_bytes(html.encode("utf-8"))
