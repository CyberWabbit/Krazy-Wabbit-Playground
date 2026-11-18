# Krazy Wabbit Playground

**Play more. Code less.** Three browser instruments for exploring what happens when a machine develops musical ideas of its own.

| Instrument | What it does |
| --- | --- |
| **MUTINY** | Autonomous musical rebellion. Turn up **CRAZY** to push a recurring groove into fills, breakdowns, and rebuilds. |
| **PARASITE** | Generative MIDI conductor. **INFECT** pushes a repeating phrase into slips, splices, and bursts. Use its built-in synth or route it to an external instrument. |
| **ECOSYSTEM** | Autonomous musical life simulation. **BIG BANG** starts a fresh world with four organisms. **FATHER TIME** ends it with a gradual fade. |

## Play locally

Open `docs/index.html` in a browser and choose an instrument. Internal audio works offline. The page has no server, assets to download, or account requirement. Use the instrument’s start control to unlock browser audio. Returning to the Playground stops the current performance. Background tabs may be throttled.

## Connect PARASITE to a MIDI instrument

Use desktop Chrome as the tested browser. From the project root, serve the page on loopback:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open [the local Playground](http://localhost:8765/). In PARASITE, select **Enable MIDI**, allow the browser permission, then select an output and channel. Optional CC messages require **Send CC** and a compatible controller number. Start at a modest output level. **Panic** clears scheduled messages and sends note-off and channel cleanup to the active route. If a disconnected device missed cleanup and keeps sounding, use that device’s panic or stop control.

External MIDI requires Web MIDI support, browser permission, and a secure context such as HTTPS or localhost. Use **Internal audio** when MIDI is unavailable. The owner reports successful Chrome USB-MIDI use with a Roland S-1. Automated tests use simulated outputs and don’t establish timing or compatibility across other hardware, browsers, or mobile devices. This version has no external MIDI clock or transport sync. [Web MIDI support and requirements](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/requestMIDIAccess)

## Build and test

```sh
python3 build.py
python3 tests/run.py
```

The build uses only the Python standard library and regenerates `docs/index.html` from `src/`. Tests use Node.js or the JavaScriptCore shell available on supported macOS installations. No package installation is needed.

The Playground is a browser application. See the [FM-1 porting guide](FM1_PORTING_GUIDE.md) for a separate firmware adaptation. See [contributing](CONTRIBUTING.md), [verification](TEST_RESULTS.md), and the [GitHub Pages instructions](GITHUB_PAGES.md).

## License

Krazy Wabbit Playground is licensed under the [MIT License](LICENSE). Copyright © 2026 Krazy Wabbit. Include the license notice when redistributing copies or substantial portions, including the standalone HTML.
