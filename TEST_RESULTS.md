# RC1 verification

| Check | Result |
| --- | --- |
| Approved release backup | **PASS.** ZIP copied byte for byte. All application source files match the approved source. |
| Production build | **PASS.** Python 3.15.2 generated static HTML identical to the approved standalone page. SHA-256 `bcbbb3dec58daef95e24ced1d5a94933e6247397ff09130c9fdf162e1786440e`. |
| Automated engines and MIDI | **PASS.** macOS JavaScriptCore exercised MUTINY and PARASITE generator state transitions, MIDI timestamps and cleanup, and 400,000 ECOSYSTEM simulation steps across 40 worlds. |
| Local HTTPS | **PASS.** Desktop Chrome 157 loaded the production page under a repository-style subpath on a loopback TLS server. The isolated profile allowed the local test certificate by public-key fingerprint. Chrome reported a secure context and exposed Web MIDI. |
| Local offline | **PASS.** Chrome loaded the same file with networking disabled and played all three instruments. No subresources were loaded. The HTTPS run produced only Chrome’s automatic same-origin favicon probes. |
| Transport and MIDI UI | **PASS.** Both browser runs checked audible signal from all instruments, silence after Stop and navigation, simulated PARASITE MIDI scheduling and Panic, and ECOSYSTEM’s BIG BANG, FATHER TIME fade, silence, and fresh rebirth. Signal checks measured browser samples. |
| Release hygiene | **PASS.** File inspection and pattern scans found no personal filesystem paths, credentials, telemetry, external runtime URLs, or development artifacts. |

The owner reported a successful physical Roland S-1 test via Chrome and USB-MIDI. This verification run used simulated outputs. No additional hardware, browser, or mobile compatibility testing was performed. The HTTPS test was local. GitHub Pages publication and testing of a public URL await approval.

## Final MIT package verification

**PASS.** The final build and automated tests were rerun. The instrument sources, test scripts, and generated page match RC1 byte for byte. The previous Chrome HTTPS and offline results therefore apply to the same application bytes. The project and static-site MIT license copies match.
