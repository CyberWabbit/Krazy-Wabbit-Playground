"""Run the generator and MIDI suites with Node.js or macOS JavaScriptCore."""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
jsc = Path("/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc")
runtime = shutil.which("node") or (str(jsc) if jsc.is_file() else None)
if not runtime:
    raise SystemExit("Install Node.js or use the macOS JavaScriptCore runtime.")

files = (
    "src/music.js", "src/ecosystem.js", "src/audio.js",
    "tests/generators.js", "tests/lifecycle.js",
)
with tempfile.TemporaryDirectory(prefix="playground-tests-") as tmp:
    script = Path(tmp) / "suite.js"
    source = "\n".join((root / name).read_text(encoding="utf-8") for name in files)
    script.write_text("if (typeof print !== 'function') globalThis.print = console.log;\n" + source, encoding="utf-8")
    subprocess.run([runtime, str(script)], check=True)
