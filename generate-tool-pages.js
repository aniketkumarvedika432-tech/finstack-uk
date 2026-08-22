/**
 * FinStack UK - Static SEO Page Generator
 *
 * Generates one static, fully pre-rendered HTML page per tool under /tools/.
 * These pages exist purely to be discoverable and indexable by search engines
 * (Google, Bing) via internal links + sitemap.xml. They intentionally do NOT
 * load js/app.js or js/tools.js at runtime: app.js's router auto-detects any
 * #toolProfile element on the page and re-renders it from a `?id=` query
 * param — since these static pages have no query param, that would wipe the
 * pre-rendered content and show "Fact Sheet Not Found" after the page loads.
 * Keeping these pages fully static avoids that entirely and is also better
 * for SEO (content is visible without needing JS execution to render).
 *
 * IMPORTANT: this script does not touch index.html, tools.html, finder.html,
 * tool.html, app.js, or style.css. It only writes new files under /tools/
 * and regenerates sitemap.xml. No existing UI, filters, or structure change.
 *
 * Usage: node scripts/generate-tool-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOOLS_OUT_DIR = path.join(ROOT, 'tools');
const SITE_URL = 'https://finstack-uk.vercel.app';

const { TOOLS_DATA } = require(path.join(ROOT, 'js', 'tools.js'));

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(name) {
  if (!name) return 'FS';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch (e) {
    return '';
  }
}

// Mirrors js/app.js's getTargetUrl() — same affiliate resolution logic.
const { AFFILIATE_CONFIG } = require(path.join(ROOT, 'js', 'tools.js'));
function getTargetUrl(tool) {
  if (AFFILIATE_CONFIG.customLinks && AFFILIATE_CONFIG.customLinks[tool.id]) {
    return AFFILIATE_CONFIG.customLinks[tool.id];
  }
  if (!tool.website) return '#';
  const separator = tool.website.includes('?') ? '&' : '?';
  return `${tool.website}${separator}${AFFILIATE_CONFIG.defaultParam}`;
}

// Renders the exact same inner markup as app.js's renderProfile(), as a
// static string, so the visual output is identical to the live JS version.
function renderProfileHtml(tool, allTools) {
  const initials = getInitials(tool.name);
  const logo = getFaviconUrl(tool.website);
  const outboundUrl = getTargetUrl(tool);
  const competitors = allTools.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 3);

  const featuredBadge = tool.featured
    ? '<span class="badge-featured" style="margin-left:8px;">⭐ Featured Partner</span>'
    : '';

  const editorialTake = tool.editorialTake || `${tool.name} is an established UK solution for ${tool.category} workflows, designed for Making Tax Digital compliance and standard UK accounting practices.`;
  const limitation = tool.limitation || 'Advanced multi-currency and high-volume transaction support requires upgrading to higher-tier pricing plans.';
  const whoShouldSkip = tool.whoShouldSkip || 'Large multinational enterprises requiring bespoke ERP ledger integrations should evaluate enterprise software platforms.';

  const featuresList = (tool.features || []).map((f) => `<li>${esc(f)}</li>`).join('');

  const competitorRows = competitors
    .map(
      (c) => `
    <tr>
      <td>${esc(c.name)}</td>
      <td>${esc(c.pricing)}</td>
      <td>${esc(c.bestFor)}</td>
      <td>★ ${c.rating || 4.5} <small style="display:block; font-size:0.75rem; color:#64748b;">(${esc(c.ratingSource || 'Public')})</small></td>
      <td><a href="${esc(c.id)}.html" style="color:#0284c7; font-weight:600; text-decoration:none;">Compare →</a></td>
    </tr>
  `
    )
    .join('');

  return `
      <div style="margin-bottom:32px; display:flex; align-items:center; gap:16px;">
        <div class="brand-avatar-wrap" style="width:58px; height:58px;">
          <img src="${esc(logo)}" alt="${esc(tool.name)}" class="brand-logo-img" style="width:38px; height:38px;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
          <div class="brand-avatar-fallback" style="display:none; font-size:1.35rem;">${esc(initials)}</div>
        </div>
        <div>
          <div style="display:flex; align-items:center;">
            <span class="pill">${esc(tool.category)}</span>
            ${featuredBadge}
          </div>
          <h1 style="font-size: 2.25rem; font-weight:800; margin:4px 0 2px 0; letter-spacing:-0.5px; color:#0f172a;">${esc(tool.name)}</h1>
          <p style="font-size:1.05rem; color:#475569;">${esc(tool.tagline)}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
          <h3 style="font-size:1.2rem; margin-bottom:10px; font-weight:700; color:#0f172a;">Editorial Analysis</h3>
          <p style="line-height:1.65; color:#334155; margin-bottom:20px;">${esc(editorialTake)}</p>

          <div class="editorial-box pros">
            <strong style="color:#166534; font-size:0.9rem; display:block; margin-bottom:6px;">✓ Core UK Strengths</strong>
            <ul style="padding-left:18px; line-height:1.7; color:#1e293b; font-size:0.9rem;">${featuresList}</ul>
          </div>

          <div class="editorial-box cons" style="margin-top:16px;">
            <strong style="color:#991b1b; font-size:0.9rem; display:block; margin-bottom:6px;">⚠️ Key Limitations</strong>
            <p style="font-size:0.875rem; color:#7f1d1d; line-height:1.5;">${esc(limitation)}</p>
          </div>

          <div class="editorial-box skip" style="margin-top:16px;">
            <strong style="color:#854d0e; font-size:0.9rem; display:block; margin-bottom:6px;">💡 Who Should Skip</strong>
            <p style="font-size:0.875rem; color:#713f12; line-height:1.5;">${esc(whoShouldSkip)}</p>
          </div>
        </div>

        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; height:fit-content; box-shadow: var(--shadow-card);">
          <h3 style="font-size:1.2rem; margin-bottom:16px; font-weight:700; color:#0f172a;">Provider Fact Sheet</h3>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Best for:</strong> <span>${esc(tool.bestFor)}</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Pricing Model:</strong> <span>${esc(tool.pricing)}</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Verified Rating:</strong> <span>★ ${tool.rating || 4.5} / 5.0 (${esc(tool.ratingSource || 'Public')})</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>UK Compliance:</strong> <span>HMRC MTD & FSCS Audited ✓</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Audit Date:</strong> <span>${esc(tool.ratingDate || 'Aug 2026')}</span></div>

          <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
            <a class="btn btn-block outbound-track" href="${esc(outboundUrl)}" target="_blank" rel="noopener noreferrer" data-tool="${esc(tool.id)}" style="height:46px;">Visit Official Website ↗</a>
            <button class="btn btn-secondary btn-block" type="button" onclick="navigator.clipboard.writeText(window.location.href); this.innerText='✓ Link Copied!'; const b=this; setTimeout(()=>{ b.innerText='Share Fact Sheet'; }, 2000);">Share Fact Sheet</button>
          </div>
        </div>
      </div>

      <div style="margin-top:36px; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
        <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:6px; color:#0f172a;">Compare ${esc(tool.name)} with Alternatives</h3>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:16px;">Direct feature, pricing, and verified rating comparison for leading UK solutions.</p>

        <table class="comparison-matrix">
          <thead><tr><th>Provider</th><th>Pricing</th><th>Target Audience</th><th>Rating</th><th>Action</th></tr></thead>
          <tbody>
            <tr style="background:#f0f9ff; font-weight:600;">
              <td>${esc(tool.name)} (Viewing)</td><td>${esc(tool.pricing)}</td><td>${esc(tool.bestFor)}</td><td>★ ${tool.rating || 4.5}</td><td>Current Profile</td>
            </tr>
            ${competitorRows}
          </tbody>
        </table>
      </div>
  `;
}

function buildJsonLd(tool) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: tool.description || tool.tagline,
    url: tool.website,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      description: tool.pricing
    }
  };
  if (tool.rating && tool.ratingSource) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(tool.rating),
      bestRating: '5',
      reviewCount: '1',
      author: tool.ratingSource
    };
  }
  return JSON.stringify(jsonLd, null, 2);
}

function buildPage(tool, allTools) {
  const title = `${esc(tool.name)} Review, Pricing & Alternatives | FinStack UK`;
  const description = `${esc(tool.name)}: ${esc(tool.tagline)} Compare pricing, UK compliance status, and verified rating on FinStack UK.`;
  const canonical = `${SITE_URL}/tools/${tool.id}.html`;
  const profileHtml = renderProfileHtml(tool, allTools);
  const jsonLd = buildJsonLd(tool);

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <link rel="icon" type="image/png" href="../og-image.png">
  <link rel="shortcut icon" href="../og-image.png">
  <link rel="apple-touch-icon" href="../og-image.png">
  <link rel="stylesheet" href="../css/style.css">
  <script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a class="logo" href="../index.html">FinStack<span>.uk</span></a>
      <div class="navlinks">
        <a href="../tools.html">Directory</a>
        <a href="../finder.html">Find my tools</a>
        <a href="../about.html">About</a>
        <a href="../methodology.html">Methodology</a>
        <a class="nav-cta" href="../for-providers.html">For providers</a>
      </div>
    </div>
  </nav>

  <main class="container" style="padding-top: 40px; padding-bottom: 60px;">
    <div id="toolProfile">${profileHtml}</div>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div><strong>FinStack.uk</strong><br><small>Independent UK fintech and small business software directory.</small></div>
      <div>
        <a href="../about.html">About</a> ·
        <a href="../methodology.html">Methodology</a> ·
        <a href="../for-providers.html">For providers</a> ·
        <a href="../privacy.html">Privacy</a> ·
        <a href="../terms.html">Terms</a>
      </div>
    </div>
    <div style="display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap; margin-top: 24px;">
      <a href="https://buysellstartups.com/listings/finstack-uk-msvek53l" target="_blank" rel="noopener"><img src="https://buysellstartups.com/api/badge/finstack-uk-msvek53l" alt="For Sale on Buy Sell Startups"/></a>
      <a href="https://maidensail.com/startup/finstack" rel="dofollow"><img src="https://maidensail.com/badge/finstack.svg" alt="Listed on Maidensail" height="36"></a>
    </div>
  </footer>
</body>
</html>
`;
}

function buildSitemap(allTools) {
  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/tools.html`, priority: '0.9' },
    { loc: `${SITE_URL}/finder.html`, priority: '0.9' },
    { loc: `${SITE_URL}/methodology.html`, priority: '0.7' },
    { loc: `${SITE_URL}/for-providers.html`, priority: '0.7' },
    { loc: `${SITE_URL}/about.html`, priority: '0.6' },
    { loc: `${SITE_URL}/privacy.html`, priority: '0.5' },
    { loc: `${SITE_URL}/terms.html`, priority: '0.5' }
  ];

  const toolUrls = allTools.map((t) => ({
    loc: `${SITE_URL}/tools/${t.id}.html`,
    priority: t.featured ? '0.85' : '0.7'
  }));

  const all = [...staticUrls, ...toolUrls];
  const body = all
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function main() {
  if (!fs.existsSync(TOOLS_OUT_DIR)) {
    fs.mkdirSync(TOOLS_OUT_DIR, { recursive: true });
  }

  let written = 0;
  for (const tool of TOOLS_DATA) {
    const html = buildPage(tool, TOOLS_DATA);
    fs.writeFileSync(path.join(TOOLS_OUT_DIR, `${tool.id}.html`), html, 'utf8');
    written += 1;
  }

  const sitemap = buildSitemap(TOOLS_DATA);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`Generated ${written} static tool pages in /tools/`);
  console.log(`Regenerated sitemap.xml with ${TOOLS_DATA.length + 8} URLs`);
}

main();
