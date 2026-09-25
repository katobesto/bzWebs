'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const ROOT = __dirname;
const WEBS_DIR = path.join(ROOT, 'webs');
const PORT = Number(process.env.PORT) || 4001;

app.disable('x-powered-by');
app.use('/assets', express.static(path.join(ROOT, 'public')));

function getWebsites() {
  return fs.readdirSync(WEBS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => {
      const dir = path.join(WEBS_DIR, entry.name);
      const hasIndex = ['index.html', 'index.htm'].some((file) => fs.existsSync(path.join(dir, file)));
      return { name: entry.name, hasIndex };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function renderHome(websites) {
  const cards = websites.map(({ name, hasIndex }, index) => {
    const safe = escapeHtml(name);
    const href = `/site/${encodeURIComponent(name)}/`;
    return `
      <a class="site-card" href="${href}" style="--delay:${index * 55}ms">
        <div class="card-top"><span class="site-index">${String(index + 1).padStart(2, '0')}</span><span class="arrow" aria-hidden="true">↗</span></div>
        <h2>${safe}</h2>
        <div class="card-bottom"><span class="status-dot"></span><span>${hasIndex ? 'Lista para explorar' : 'Carpeta de sitio'}</span><span class="open-label">Abrir sitio</span></div>
      </a>`;
  }).join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#10120f">
  <title>BZ Webs — Tu colección web</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root{color-scheme:dark;--bg:#10120f;--panel:#171a16;--line:#292d27;--text:#f0f0e9;--muted:#92978d;--accent:#c5f36b;--font:'DM Sans',sans-serif;--display:'Manrope',sans-serif}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 80% 0%,#26301b 0,transparent 35%),var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
    .top-note{font-size:12px;color:var(--muted);letter-spacing:.02em}.hero{padding:78px 0 42px;display:grid;grid-template-columns:1fr auto;align-items:end;gap:30px}.eyebrow{display:flex;align-items:center;gap:9px;color:var(--accent);font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.eyebrow:before{content:'';width:18px;height:1px;background:var(--accent)}h1{font:600 clamp(42px,7vw,76px)/.99 var(--display);letter-spacing:-.075em;margin:20px 0 15px;max-width:680px}h1 span{color:#858a7d}.intro{color:var(--muted);font-size:15px;line-height:1.65;margin:0;max-width:510px}.count{font:500 12px var(--font);color:var(--muted);border:1px solid var(--line);padding:10px 13px;border-radius:99px;white-space:nowrap;margin-bottom:5px}.count strong{color:var(--text);font-weight:600}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:12px 0 80px}.site-card{min-height:166px;background:linear-gradient(145deg,#1a1d18,#151713);border:1px solid var(--line);border-radius:13px;padding:18px 19px;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .22s,border-color .22s,background .22s;animation:rise .5s both;animation-delay:var(--delay)}.site-card:hover{transform:translateY(-3px);border-color:#6b824d;background:linear-gradient(145deg,#20251b,#171a16)}.card-top,.card-bottom{display:flex;align-items:center}.card-top{justify-content:space-between}.site-index{font:11px ui-monospace,monospace;color:#73796e}.arrow{font-size:18px;color:#7d8377;transition:transform .2s,color .2s}.site-card:hover .arrow{transform:translate(2px,-2px);color:var(--accent)}.site-card h2{font:600 21px var(--display);letter-spacing:-.045em;margin:26px 0 auto;overflow-wrap:anywhere}.card-bottom{gap:8px;font-size:11px;color:var(--muted);padding-top:18px}.status-dot{height:6px;width:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px #c5f36b55}.open-label{margin-left:auto;opacity:0;transition:opacity .2s;color:var(--accent)}.site-card:hover .open-label{opacity:1}.empty{grid-column:1/-1;border:1px dashed #383d34;border-radius:13px;min-height:175px;display:grid;place-content:center;text-align:center;color:var(--muted);line-height:1.8}.empty strong{color:var(--text);font-weight:600}.footer{border-top:1px solid #ffffff12;padding:20px 0 26px;color:#777d72;font-size:11px;display:flex;justify-content:space-between}
    @keyframes rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}@media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{padding-top:58px}}@media(max-width:520px){.shell{width:calc(100% - 32px)}.topbar{height:68px}.top-note{font-size:10px}.hero{grid-template-columns:1fr;gap:19px;padding:48px 0 28px}.count{justify-self:start}.grid{grid-template-columns:1fr;padding-bottom:54px}.site-card{min-height:148px}.footer{gap:12px;flex-wrap:wrap}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
    @keyframes rise{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}@media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{padding-top:58px}}@media(max-width:520px){.shell{width:calc(100% - 32px)}.topbar{height:68px}.top-note{font-size:10px}.hero{grid-template-columns:1fr;gap:19px;padding:48px 0 28px}.count{justify-self:start}.grid{grid-template-columns:1fr;padding-bottom:54px}.site-card{min-height:148px}.footer{gap:12px;flex-wrap:wrap}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  </style>
</head>
<body><div class="shell">
  <header class="topbar"><div class="brand"><span class="brand-mark">b.</span><span>BZ WEBS</span></div><span class="top-note">TU ESPACIO, TUS SITIOS</span></header>
  <main><section class="hero"><div><div class="eyebrow">Colección web</div><h1>Un lugar para<br><span>cada idea.</span></h1><p class="intro">Tus proyectos web, reunidos en un solo espacio. Elige uno y entra a explorar.</p></div><div class="count"><strong>${websites.length}</strong> ${websites.length === 1 ? 'sitio' : 'sitios'} disponibles</div></section>
  <section class="grid" aria-label="Sitios disponibles">${cards || '<div class="empty"><strong>Aún no hay sitios por aquí.</strong><span>Añade una carpeta dentro de <code>webs/</code> para empezar.</span></div>'}</section></main>
  <footer class="footer"><span>Hecho para crear y compartir.</span><span>BZ WEBS <span aria-hidden="true">·</span> LOCAL HOST</span></footer>
</div></body></html>`;
}

app.get('/', (_req, res) => {
  try {
    res.type('html').send(renderHome(getWebsites()));
  } catch (error) {
    console.error('Could not list websites:', error);
    res.status(500).send('No se pudo cargar la lista de sitios.');
  }
});

app.use('/site/:site', (req, res, next) => {
  let name;
  try { name = decodeURIComponent(req.params.site); } catch { return res.sendStatus(400); }
  if (!name || name.startsWith('.') || name.includes('/') || name.includes('\\')) return res.sendStatus(404);

  const target = path.resolve(WEBS_DIR, name);
  if (path.dirname(target) !== WEBS_DIR) return res.sendStatus(404);
  let stat;
  try { stat = fs.statSync(target); } catch { return res.sendStatus(404); }
  if (!stat.isDirectory()) return res.sendStatus(404);

  const requestedPath = req.path.replace(/^\/+/, '');
  const filePath = path.resolve(target, requestedPath);
  if (filePath !== target && !filePath.startsWith(`${target}${path.sep}`)) return res.sendStatus(404);

  if (!requestedPath) {
    const indexFile = ['index.html', 'index.htm'].find((file) => fs.existsSync(path.join(target, file)));
    if (indexFile) return res.sendFile(path.join(target, indexFile));
    return res.status(404).type('text').send(`No se encontró index.html en webs/${name}/`);
  }

  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      if (error.status === 404) res.sendStatus(404);
      else next(error);
    }
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BZ Webs escuchando en http://localhost:${PORT}`);
    console.log(`Sitios en: ${WEBS_DIR}`);
  });
}

module.exports = app;
