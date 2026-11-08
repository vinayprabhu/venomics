# Venomics AI: standalone GitHub Pages edition

This export retains the title **Trace the adventurous journey that a venom takes to become a drug!** and the four scientific pathways. It removes SPC event branding, the date, adventure labels, the completion passport, secret codes and booth rewards. The previously hosted website has not been changed.

## Publish automatically on GitHub Pages

1. Create an initialized GitHub repository and upload the contents of this folder, including `.github/workflows/pages.yml`, `scripts/`, the runtime files and media.
2. Open **Settings > Pages** and set **Source** to **GitHub Actions**. This is a one-time repository setting.
3. Open **Actions > Publish Venomics website > Run workflow** for the first deployment. Later pushes to `main` deploy automatically.
4. When the workflow succeeds, use its deployment URL or **Settings > Pages > Visit site**. A project repository is served at `https://YOUR_USERNAME.github.io/REPOSITORY/`.
5. To publish an update, edit files and commit/push to `main`. The workflow checks JavaScript syntax, validates the data and required models, stages the website, and deploys it. A failed validation does not replace the live version.
6. A custom domain can be set in Pages settings; configure its DNS using GitHub's instructions.

No local build step, backend, API key or ChatGPT login is required to run the website. GitHub supplies the deployment token automatically; do not add a personal access token to the repository. All runtime assets are included and their paths are relative, including the four original GLB animal models, molecular data, audio, logo video and font. The `narration/` directory is optional for hosting.

Official instructions:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Local preview

From the extracted directory run:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/`. Opening `index.html` directly as a file will not load the JavaScript modules and data correctly.

## Navigation

Select an animal or **START HERE**, then use the right arrow to advance. Earlier stages remain available in the bottom trail. The final drug stage offers the next animal; the honeybee's final stage returns to all animals. Animal tabs permit direct switching. **START HERE** and the reset control clear exploration progress. No completion scores or reward codes are stored or displayed.

## Narration

`narration/venomics-stage-narration.txt` contains the complete script, production notes and sources. Each numbered clip TXT contains only text to speak. `narration/narration.json` maps every clip to its animal, stage, phase, filename and evidence sources, with approximate durations at 140 words per minute.

There are 24 stages and 28 clips: each biological-action stage is split into organ localization and mechanism. The scripts are production assets for your text-to-speech workflow; generated voice audio has not been added to the website.

## Scientific assets and credits

Keep the Sources control and the attribution data when redistributing. Photographs, sounds and anatomical reference assets retain their individual licenses. The user-supplied models and brand video remain included without any new license grant. Measured molecular structures, computed conformers and schematic mechanisms are distinguished in the site notes and narration.

## Deployment automation

The workflow in `.github/workflows/pages.yml` runs on pushes to `main` and supports the manual **Run workflow** button. `scripts/package_site.py` copies the runtime files to `_site/`, leaving narration and repository configuration out of the public website artifact. Source and asset attribution data remain included. The original ChatGPT-hosted website is independent and is not updated by this workflow. Changes made there do not synchronize automatically into this GitHub repository.

## Scientific review

The 8 November 2026 review updates narration, labels, treatment routes and structural context. See [SCIENCE_REVIEW.md](SCIENCE_REVIEW.md) for decisions and primary sources. Run `python scripts/check_science.py` and `node scripts/check_audio.mjs` to check narration consistency and circulation-audio routing.
