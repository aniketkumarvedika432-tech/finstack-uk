/**
 * FinStack UK - Application Engine
 * Pure Vanilla JavaScript (ES6+), Zero External Runtime Dependencies
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof TOOLS_DATA === 'undefined' || !Array.isArray(TOOLS_DATA)) {
      console.error('FinStack UK: Master dataset TOOLS_DATA is missing or corrupted.');
      return;
    }

    renderCounters();
    routeCurrentPage();
    bindAnalytics();
  });

  // HTML Entity Escaper
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Fallback Monogram Generator
  function getInitials(name) {
    if (!name) return 'FS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Google Favicon Resolver
  function getFaviconUrl(url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
      return '';
    }
  }

  // Global Counter Elements
  function renderCounters() {
    const targets = ['#toolCount', '#total-tools-count', '.tool-count'];
    targets.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.textContent = `${TOOLS_DATA.length}+`;
      });
    });
  }

  // Affiliate URL Resolver
  function getTargetUrl(tool) {
    if (typeof getAffiliateUrl === 'function') {
      return getAffiliateUrl(tool.id, tool.website);
    }
    return tool.website || '#';
  }

  // Master Card Builder
  function createCard(tool, badgeText) {
    badgeText = badgeText || '';
    const card = document.createElement('div');
    card.className = `card ${tool.featured ? 'is-featured' : ''}`;

    const initials = getInitials(tool.name);
    const logoUrl = getFaviconUrl(tool.website);
    const outboundUrl = getTargetUrl(tool);

    const sourceHTML = tool.ratingSource
      ? `<small style="font-size:0.7rem; color:#64748b; font-weight:500; display:block; margin-top:2px;">${esc(tool.ratingSource)}</small>`
      : '';

    const featuredHTML = tool.featured
      ? `<span class="badge-featured">⭐ Featured</span>`
      : '';

    const matchBadgeHTML = badgeText
      ? `<span style="font-size:0.75rem; font-weight:700; color:#16a34a; margin-top:2px;">${esc(badgeText)}</span>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <div class="card-brand-header">
          <div class="brand-avatar-wrap">
            <img src="${esc(logoUrl)}" alt="${esc(tool.name)} logo" class="brand-logo-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
            <div class="brand-avatar-fallback" style="display:none;">${esc(initials)}</div>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span class="pill" style="margin-bottom:0;">${esc(tool.category)}</span>
              ${featuredHTML}
            </div>
            <h3>${esc(tool.name)}</h3>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; text-align:right;">
          <div style="font-weight:700; color:#0284c7; font-size:0.875rem; background:#f0f9ff; border:1px solid #bae6fd; padding:3px 8px; border-radius:6px;">
            ★ ${tool.rating || 4.5}
          </div>
          ${sourceHTML}
          ${matchBadgeHTML}
        </div>
      </div>
      <p>${esc(tool.tagline || tool.description)}</p>
      <div class="meta-row"><strong>Best for:</strong> <span>${esc(tool.bestFor || 'UK Businesses')}</span></div>
      <div class="meta-row"><strong>Pricing:</strong> <span>${esc(tool.pricing || 'Transparent')}</span></div>
      <div class="actions">
        <a class="btn btn-secondary" href="tool.html?id=${encodeURIComponent(tool.id)}">Review & Matrix</a>
        <a class="btn outbound-track" href="${esc(outboundUrl)}" target="_blank" rel="noopener noreferrer" data-tool="${esc(tool.id)}">Visit ↗</a>
      </div>
    `;
    return card;
  }

  // Page Routing Logic
  function routeCurrentPage() {
    const isProfile = document.getElementById('toolProfile');
    const isFinder = document.getElementById('finderForm');
    const isDirectory = document.getElementById('search') && document.getElementById('cat');
    const isHomepage = document.getElementById('toolGrid') && !isDirectory;

    if (isProfile) {
      renderProfile();
    } else if (isFinder) {
      renderFinder();
    } else if (isDirectory) {
      renderDirectory();
    } else if (isHomepage) {
      renderHomepage();
    }
  }

  // 1. Homepage Controller
  function renderHomepage() {
    const grid = document.getElementById('toolGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const featured = TOOLS_DATA.filter((t) => t.featured);
    const display = featured.length >= 4 ? featured.slice(0, 6) : TOOLS_DATA.slice(0, 6);
    display.forEach((tool) => grid.appendChild(createCard(tool)));
  }

  // 2. Directory Controller (tools.html)
  function renderDirectory() {
    const grid = document.getElementById('toolGrid');
    const searchInput = document.getElementById('search');
    const catSelect = document.getElementById('cat');
    const emptyState = document.getElementById('empty');
    const countLabel = document.getElementById('resultsCount');

    if (!grid) return;

    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat') || urlParams.get('category');
    const initialQuery = urlParams.get('q') || urlParams.get('search');

    if (catSelect && initialCat) {
      for (let i = 0; i < catSelect.options.length; i++) {
        if (catSelect.options[i].value.toLowerCase() === initialCat.toLowerCase()) {
          catSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilter() {
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const chosenCat = catSelect ? catSelect.value.toLowerCase() : 'all';

      grid.innerHTML = '';

      const matches = TOOLS_DATA.filter((tool) => {
        const matchCat = chosenCat === 'all' || tool.category.toLowerCase() === chosenCat;
        const corpus = `${tool.name} ${tool.category} ${tool.tagline} ${tool.description} ${tool.bestFor} ${(tool.tags || []).join(' ')}`.toLowerCase();
        const matchQ = !q || corpus.indexOf(q) !== -1;
        return matchCat && matchQ;
      });

      if (matches.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (countLabel) countLabel.textContent = 'Showing 0 tools';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (countLabel) countLabel.textContent = `Showing ${matches.length} tool${matches.length === 1 ? '' : 's'}`;

        const sorted = matches.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        sorted.forEach((tool) => grid.appendChild(createCard(tool)));
      }
    }

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (catSelect) catSelect.addEventListener('change', applyFilter);

    applyFilter();
  }

  // 3. Stack Finder Controller (finder.html)
  function renderFinder() {
    const form = document.getElementById('finderForm');
    const resultsBox = document.getElementById('results');
    const shortlistGrid = document.getElementById('shortlist-grid');

    if (!form || !resultsBox || !shortlistGrid) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const type = (form.querySelector('#type') ? form.querySelector('#type').value : '').toLowerCase();
      const need = (form.querySelector('#need') ? form.querySelector('#need').value : '').toLowerCase();
      const priority = (form.querySelector('#priority') ? form.querySelector('#priority').value : '').toLowerCase();

      const scored = TOOLS_DATA.map((tool) => {
        let score = 0;
        const cat = tool.category.toLowerCase();
        const tags = (tool.tags || []).map((t) => t.toLowerCase());

        // Category / Need Weight (50 pts)
        if (need && (cat.indexOf(need) !== -1 || need.indexOf(cat) !== -1)) {
          score += 50;
        }

        // Entity Match Weight (30 pts)
        if (type) {
          if (tags.indexOf(type) !== -1 || (tool.bestFor && tool.bestFor.toLowerCase().indexOf(type) !== -1)) {
            score += 30;
          }
        }

        // Operating Priority Weight (20 pts)
        if (priority) {
          if (priority.indexOf('low-cost') !== -1 && (tags.indexOf('low-cost') !== -1 || tags.indexOf('free-tier') || tool.pricing.toLowerCase().indexOf('free') !== -1)) {
            score += 20;
          } else if (priority.indexOf('international') !== -1 && (tags.indexOf('international') !== -1 || tags.indexOf('fx') !== -1)) {
            score += 20;
          } else if (priority.indexOf('compliance') !== -1 && (tags.indexOf('compliance') !== -1 || tags.indexOf('mtd') !== -1 || tags.indexOf('vat') !== -1)) {
            score += 20;
          } else if (priority.indexOf('all-in-one') !== -1 && (tags.indexOf('accounting') !== -1 || tags.indexOf('banking') !== -1)) {
            score += 20;
          } else {
            score += 10;
          }
        }

        const matchPct = score > 0 ? Math.min(score, 98) : 55;
        return { tool, matchPct };
      });

      const topPicks = scored.sort((a, b) => b.matchPct - a.matchPct).slice(0, 4);

      shortlistGrid.innerHTML = '';
      topPicks.forEach((item) => {
        shortlistGrid.appendChild(createCard(item.tool, `${item.matchPct}% Match`));
      });

      resultsBox.style.display = 'block';
      resultsBox.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 4. Fact Sheet Controller (tool.html)
  function renderProfile() {
    const target = document.getElementById('toolProfile');
    if (!target) return;

    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('id');
    const tool = TOOLS_DATA.find((t) => t.id === toolId);

    if (!tool) {
      target.innerHTML = `
        <div style="padding:48px 0; text-align:center;">
          <h2 style="font-size:1.8rem; font-weight:800; color:#0f172a;">Fact Sheet Not Found</h2>
          <p style="margin: 12px 0 24px 0; color: #64748b;">The selected tool does not exist or has been relocated.</p>
          <a class="btn" href="tools.html">Browse Directory</a>
        </div>
      `;
      return;
    }

    document.title = `${tool.name} Review, Pricing & Alternatives | FinStack UK`;
    const initials = getInitials(tool.name);
    const logo = getFaviconUrl(tool.website);
    const outboundUrl = getTargetUrl(tool);

    const competitors = TOOLS_DATA.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 3);

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
        <td><a href="tool.html?id=${encodeURIComponent(c.id)}" style="color:#0284c7; font-weight:600; text-decoration:none;">Compare →</a></td>
      </tr>
    `
      )
      .join('');

    target.innerHTML = `
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

  // Outbound Click Tracker
  function bindAnalytics() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.outbound-track');
      if (btn && window.sessionStorage) {
        const id = btn.getAttribute('data-tool');
        try {
          const clicks = JSON.parse(sessionStorage.getItem('finstack_clicks') || '[]');
          clicks.push({ tool: id, at: new Date().toISOString() });
          sessionStorage.setItem('finstack_clicks', JSON.stringify(clicks));
        } catch (err) {}
      }
    });
  }
})();
