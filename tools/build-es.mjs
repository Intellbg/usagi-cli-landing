// Builds es/index.html from index.html using the Spanish strings in assets/js/script.js.
// Run after editing index.html or translations:  node tools/build-es.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "assets", "js", "script.js"), "utf8");
const start = src.indexOf("const copy =");
const end = src.indexOf("\n};", start) + 3;
const copy = new Function(`${src.slice(start, end)} return copy;`)();
const es = copy.es;

let html = readFileSync(join(root, "index.html"), "utf8");
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = s => esc(s).replace(/"/g, "&quot;");
const missing = new Set();
const t = key => {
  if(!(key in es)) missing.add(key);
  return es[key];
};

// Text, HTML and aria-label translations.
html = html.replace(/(<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (m, open, tag, key, _inner, close) => t(key) === undefined ? m : open + esc(t(key)) + close);
html = html.replace(/(<(\w+)\b[^>]*\bdata-i18n-html="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (m, open, tag, key, _inner, close) => t(key) === undefined ? m : open + t(key) + close);
html = html.replace(/<[^>]*\bdata-i18n-label="([^"]+)"[^>]*>/g, m => {
  const key = m.match(/data-i18n-label="([^"]+)"/)[1];
  if(t(key) === undefined) return m;
  return m.replace(/aria-label="[^"]*"/, `aria-label="${attr(t(key))}"`)
          .replace(/title="[^"]*"/, `title="${attr(t(key))}"`);
});

// Lifecycle detail starts on stage 1.
const setId = (id, value, raw = false) => {
  html = html.replace(new RegExp(`(<(\\w+)[^>]*id="${id}"[^>]*>)([\\s\\S]*?)(</\\2>)`),
    (m, open, tag, inner, close) => open + (raw ? value : esc(value)) + close);
};
setId("lcTitle", t("lc.1.title"));
setId("lcText", t("lc.1.text"));
setId("lcIso", t("lc.1.iso"));
setId("lcTags", t("lc.1.tags").split(" · ").map(x => `<li>${esc(x)}</li>`).join(""), true);

// Head: language, meta, canonical, social.
const title = "USAGI CLI — Software a medida, ingeniería de datos y dashboards";
const desc = "USAGI CLI desarrolla software a medida, pipelines de datos automatizados y dashboards de Power BI como un solo sistema confiable. Equipo bilingüe (español e inglés).";
const ogDesc = "Aplicaciones a medida, flujos de datos automatizados y dashboards construidos como un solo sistema confiable.";
const metaSet = (sel, value) => {
  html = html.replace(new RegExp(`(<meta ${sel} content=")[^"]*(")`), `$1${attr(value)}$2`);
};
html = html.replace('<html lang="en">', '<html lang="es">');
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
metaSet('name="description"', desc);
metaSet('property="og:title"', title);
metaSet('property="og:description"', ogDesc);
metaSet('property="og:url"', "https://usagicli.com/es/");
metaSet('property="og:locale"', "es_EC");
metaSet('property="og:locale:alternate"', "en_US");
metaSet('name="twitter:title"', title);
metaSet('name="twitter:description"', ogDesc);
html = html.replace('<link rel="canonical" href="https://usagicli.com/" />', '<link rel="canonical" href="https://usagicli.com/es/" />');

// Assets live one level up.
html = html.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|data:)([^"]+)"/g, '$1="../$2"');

if(missing.size) console.warn("Missing Spanish keys:", [...missing].join(", "));
mkdirSync(join(root, "es"), { recursive: true });
writeFileSync(join(root, "es", "index.html"), html);
console.log("Wrote es/index.html");
