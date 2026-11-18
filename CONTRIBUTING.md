# Contributing

After publication, open an issue for a bug or an instrument idea. Include the instrument, reproduction steps, expected and observed behavior, and browser and OS versions. For MIDI reports include the device, connection type, and channel. Remove personal paths, MIDI device serial numbers, and credentials from logs.

Change the source in `src/`. Run `python3 build.py` and `python3 tests/run.py` and include the regenerated `docs/index.html` in the pull request. Keep changes focused and add regression coverage when behavior changes. For audio and MIDI changes, describe how you checked sound, Stop, Panic, output switching, and navigation.

The project keeps music generation, artwork, and sound local. Discuss new dependencies and instrument behavior changes before submitting a large patch. Attribute incorporated materials and document their licenses. Contributions are made under the repository’s [MIT License](LICENSE).

For browser regression work, `tests/browser-smoke.js` is a development-only harness for desktop Chrome. Run it in the Playground page context with audio already unlocked by a user gesture, starting from the landing page. It writes the result to `document.body.dataset.smoke` and uses a simulated MIDI output. Open a fresh tab after the test to restore normal MIDI discovery.
