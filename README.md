# USAGI CLI — landing page

Static site for [usagicli.com](https://usagicli.com), served by GitHub Pages (`CNAME`).
No framework, no build step for the English page.

## Structure

```
index.html              English page (source of truth)
es/index.html           Spanish page — generated, do not edit by hand
assets/
  css/styles.css
  js/script.js          behaviour, EN/ES translations, Google Analytics
  img/                  logo, social preview image (og-image.png)
  icons/                favicon and app icons
design/                 source artwork (not linked from the site)
tools/build-es.mjs      generates es/index.html
robots.txt, sitemap.xml SEO
```

## Editing

1. Change text or markup in `index.html`.
2. Add or update the matching keys in **both** `en` and `es` inside `copy` in `assets/js/script.js`
   (elements use `data-i18n`, `data-i18n-html` or `data-i18n-label`).
3. Rebuild the Spanish page:

   ```
   node tools/build-es.mjs
   ```

   It warns about any Spanish key that is missing.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Analytics

GA4 measurement ID is `GA_ID` at the top of the analytics block in `assets/js/script.js`.
Tracked events: `contact_click` (whatsapp / email / phone), `contact_copy`, `hero_cta`, `language_switch`.
