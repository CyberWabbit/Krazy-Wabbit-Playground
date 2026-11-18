# GitHub Pages

The static artifact is `docs/index.html`. It embeds its JavaScript, CSS, and artwork. The `docs/.nojekyll` marker tells Pages to serve the generated files directly. Hash navigation keeps all three instruments working under a repository subpath without server routing.

## After publication is authorized

1. Keep the approved license notice in the repository and in `docs/LICENSE`. Run `python3 build.py` and `python3 tests/run.py`.
2. Create or select a public GitHub repository on GitHub Free and push the project to `main`. Include `docs/index.html` and `docs/.nojekyll`.
3. Open **Settings → Pages**. Select **Deploy from a branch**, choose **main** and **/docs**, then save.
4. When Pages reports the deployment URL, enable **Enforce HTTPS** if needed. Open the reported HTTPS URL and verify all three instruments. Check PARASITE’s MIDI permission and Panic with a known device.
5. Publish the matching ZIP and tag the approved commit.

[GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [GitHub Pages HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
