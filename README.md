# underthemark.com

Static marketing site plus the app. No framework, no runtime dependency.

## Deploying

`dist/` is the whole site. Drag it into Vercel, or connect the repo and set the
output directory to `dist`. Nothing needs to build on the server.

## Adding an article

1. Drop a `.md` file into `content/`.
2. Give it front matter:

```
---
title: The full headline, used as the H1
titletag: Short version for the search result, keep under 45 characters
slug: url-slug
category: Cutting costs
order: 05
summary: One or two sentences. Becomes the meta description and the card text.
published: 2026-07-24
modified: 2026-07-24
updated: July 2026
---
```

3. Write in markdown. Two special markers:
   - `[[AD]]` places an in-body advert
   - `[[AMCON]]` places an Amcon Ceylon banner
4. Run `node build.js`.

The sitemap, the guides index, the homepage cards and the "read next" links all
update themselves.

## Checking before you publish

`node verify.js` runs 195 checks: title and description lengths, canonicals,
one H1 per page, GA4 on every page, AdSense on the marketing pages only,
Amcon backlinks present and followable, no broken internal links, article word
counts, schema.org markup, sitemap completeness and robots.txt.

## What goes where

- `build.js` — template, head, nav, footer, markdown converter
- `pages.js` — the pages themselves and the build entry point
- `content/*.md` — articles
- `assets/site.css` — all styling
- `app-source/index.html` — the app, copied to `/app/` with analytics injected
- `dist/` — generated output, safe to delete and rebuild

## Notes

- AdSense runs on the marketing pages only. It is deliberately kept off `/app/`:
  adverts do not belong on a screen where someone is entering financial figures,
  and utility screens with little text are weak AdSense pages anyway.
- `ads.txt` carries publisher ID pub-3792288400696045. Verify this matches your
  AdSense account before going live.
- Analytics: G-3JFGX4Y3RC on every page including the app.
