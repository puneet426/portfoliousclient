# Nirmayi Kelkar — personal site

A static, single-page portfolio. No build step and no dependencies: plain HTML, CSS and a little JavaScript.

- `index.html`: all of the content (intro, about, experience, education, skills, contact)
- `styles.css`: design tokens at the top (colours, fonts), plus light and dark themes and print styles
- `main.js`: intro and reveal animations, scroll progress, timeline fill, count-up figures, section index, mobile menu, theme toggle and copy-email
- `assets/contours.svg`: the lunar contour-line texture (coloured through CSS masks)
- `assets/`: the portrait photo

Fonts: Newsreader (headings), IBM Plex Sans (text) and IBM Plex Mono (dates and labels), loaded from Google Fonts.

## Preview locally

```bash
python3 -m http.server 8000
```

## Deploy

- **Vercel / Netlify:** import the repository. There's no framework and no build command, and the output directory is the repo root.
- **GitHub Pages:** go to Settings → Pages, then deploy from the branch `main`, folder `/ (root)`.

## Editing

To add a role, copy one `<li class="role">…</li>` block in the Experience section of `index.html` and change its text.
