# Licensing audit

The owner approved the [MIT License](LICENSE) with copyright © 2026 Krazy Wabbit. Include the copyright and permission notice in redistributed copies or substantial portions.

| Material | Audit finding |
| --- | --- |
| Application and tests | Project-authored source in this release candidate. No dependency manifest, installed packages, or vendored libraries. Python and JavaScript runtimes are external tools. |
| Graphics and typography | Illustrations and rabbits are inline SVG and CSS. The application requests system font families and redistributes no font files. |
| Sound | Web Audio generates tones and noise from code. The candidate includes no recorded samples, loops, or audio files. |
| FM-1 resources | The porting guide links to external projects. The candidate includes no firmware, SDK, toolchain, firmware source, or binary from those projects. |

This is a file and provenance review of the available project, with no third-party material identified that requires a different license. The included project code and assets are eligible for distribution under MIT based on this audit and the owner’s authorization. If a later port uses a firmware framework or SDK, audit that port under the framework’s terms. The browser project’s license would not supersede those terms.
