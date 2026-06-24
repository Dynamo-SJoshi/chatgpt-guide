# A Basic ChatGPT Guide — in Your Language

A beginner-friendly guide to using **ChatGPT** on a phone, with simple tips for everyday life — written for first-time and low-digital-literacy users in India. Available in multiple Indian languages, free to read, download, and share.

🌐 **Live site:** https://garviiii.github.io/chatgpt-guide/

## Languages

English, Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Punjabi, Odia.
_(Gujarati, Urdu planned.)_

## What's in this repo

```
guides/<lang>.md      # the guide, one markdown file per language (source of truth)
assets/screenshots/   # screenshot images used by the guides
build-site.mjs        # builds the static website (docs/) from guides/
docs/                 # the generated website, served by GitHub Pages
  ├─ assets/          #   screenshots (copied at build time)
  └─ pdfs/            #   downloadable PDFs (copied at build time)
pdfs/                 # generated PDFs, one per language (source)
pdf-tools/            # build-pdfs.mjs (md → PDF) + helpers
```

## Build the website

```bash
npm install        # one time (installs marked)
npm run build      # regenerates docs/ from guides/ (also copies assets + pdfs)
```

Open `docs/index.html` to preview. Rebuild whenever a guide or a PDF changes.

## Build the PDFs

```bash
cd pdf-tools && npm install   # one time
npm run pdfs                  # renders all 9 guides → pdfs/
```

Each PDF has inline screenshots, page numbers, native-script fonts, and a credit page. Re-run `npm run build` afterwards so `docs/pdfs/` picks up the new files.

## Deploy free on GitHub Pages

Repo **Settings → Pages → Build and deployment** → Source: **Deploy from a branch**, Branch: **main**, folder: **/docs**. Live at `https://<username>.github.io/<repo>/`.

## Editing a guide

1. Edit `guides/<lang>.md`.
2. `cd pdf-tools && npm run pdfs` (if you want the PDF updated).
3. `npm run build` from the repo root to regenerate the site.

Screenshots are referenced inline as `![caption](assets/screenshots/screenshot-N.png)` — same image positions across every language, so captions stay in each language.

## License & credit

Made with ❤️ by Garv Sachdeva. Educational use. ChatGPT is a product of OpenAI. App interfaces change over time; steps are accurate at the time of writing.
