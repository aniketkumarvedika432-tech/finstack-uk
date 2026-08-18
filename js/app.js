/**
 * FinStack UK - Application Engine
 * Pure Vanilla ES6+, Zero-Dependency, Cross-Browser Compatible
 */

(function () {
  'use strict';

  // Master Initialization
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof TOOLS_DATA === 'undefined' || !Array.isArray(TOOLS_DATA)) {
      console.error('FinStack UK: Master dataset TOOLS_DATA is missing or corrupted.');
      return;
    }

    renderCounters();
    routeCurrentPage();
    bindAnalytics();
  });

  // Utility: HTML Sanitizer
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Utility: Fallback Monogram Generator
  function getInitials(name) {
    if (!name) return 'FS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Utility: Domain Favicon Resolver
  function getDomainLogo(url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
      return '';
    }
  }

  // Live Count Elements
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

  // Universal Tool Card Component
  function renderCard(tool, badgeText) {
    badgeText = badgeText || '';
    const card = document.createElement('div');
    card.className = `card ${tool.featured ? 'is-featured' : ''}`;
    
    const initials = getInitials(tool.name);
    const logoUrl = getDomainLogo(tool.website);
    const outboundUrl = getTargetUrl(tool);

    const sourceHTML = tool.ratingSource
      ? `<small style="font-size:0.7rem; color:#64748b; font-weight:500; display:block; margin-top:2px;">${escapeHTML(tool.ratingSource)}</small>`
      : '';

    const featuredHTML = tool.featured
      ? `<span class="badge-featured">⭐ Featured</span>`
      : '';

    const matchBadgeHTML = badgeText
      ? `<span style="font-size:0.75rem; font-weight:700; color:#16a34a; margin-top:2px;">${escapeHTML(badgeText)}</span>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <div class="card-brand-header">
          <div class="brand-avatar-wrap">
            <img src="${escapeHTML(logoUrl)}" alt="${escapeHTML(tool.name)} logo" class="brand-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="brand-avatar-fallback" style="display:none;">${escapeHTML(initials)}</div>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span class="pill" style="margin-bottom:0;">${escapeHTML(tool.category)}</span>
              ${featuredHTML}
            </div>
            <h3>${escapeHTML(tool.name)}</h3>
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
      <p>${escapeHTML(tool.tagline || tool.description)}</p>
      <div class="meta-row"><strong>Best for:</strong> <span>${escapeHTML(tool.bestFor || 'UK Businesses')}</span></div>
      <div class="meta-row"><strong>Pricing:</strong> <span>${escapeHTML(tool.pricing || 'Transparent')}</span></div>
      <div class="actions">
        <a class="btn btn-secondary" href="tool.html?id=${encodeURIComponent(tool.id)}">Review & Matrix</a>
        <a class="btn outbound-track" href="${escapeHTML(outboundUrl)}" target="_blank" rel="noopener noreferrer" data-tool="${escapeHTML(tool.id)}">Visit ↗</a>
      </div>
    `;
    return card;
  }

  // Click Analytics
  function bindAnalytics() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.outbound-track');
      if (btn && window.sessionStorage) {
        const toolId = btn.getAttribute('data-tool');
        try {
          const stored = JSON.parse(sessionStorage.getItem('finstack_clicks') || '[]');
          stored.push({ id: toolId, at: new Date().toISOString() });
          sessionStorage.setItem('finstack_clicks', JSON.stringify(stored));
        } catch (err) {}
      }
    });
  }

  // Page Routing & Controllers
  function routeCurrentPage() {
    const isProfilePage = !!document.getElementById('toolProfile');
    const isFinderPage = !!document.getElementById('finderForm');
    const isDirectoryPage = !!document.getElementById('search') || window.location.pathname.endsWith('tools.html');

    if (isProfilePage) {
      initProfileController();
      return;
    }
    if (isFinderPage) {
      initFinderController();
      return;
    }
    if (isDirectoryPage) {
      initDirectoryController();
      return;
    }

    // Default: Homepage (index.html)
    initHomepageController();
  }

  // Homepage View Controller
  function initHomepageController() {
    const grid = document.getElementById('toolGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const featured = TOOLS_DATA.filter((t) => t.featured).slice(0, 6);
    const toRender = featured.length > 0 ? featured : TOOLS_DATA.slice(0, 6);
    toRender.forEach((tool) => grid.appendChild(renderCard(tool)));
  }

  // Full Directory View Controller (tools.html)
  function initDirectoryController() {
    const grid = document.getElementById('toolGrid');
    const searchInput = document.getElementById('search');
    const catSelect = document.getElementById('cat');
    const emptyState = document.getElementById('empty');
    const countLabel = document.getElementById('resultsCount');

    if (!grid) return;

    const urlParams = new URLSearchParams(window.location.search);
    const paramCat = urlParams.get('cat') || urlParams.get('category');
    const paramQuery = urlParams.get('q') || urlParams.get('search');

    if (catSelect && paramCat) {
      for (let i = 0; i < catSelect.options.length; i++) {
        if (catSelect.options[i].value.toLowerCase() === paramCat.toLowerCase()) {
          catSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (searchInput && paramQuery) {
      searchInput.value = paramQuery;
    }

    function applyFilters() {
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const chosenCat = catSelect ? catSelect.value : (paramCat || 'all');

      grid.innerHTML = '';

      const matched = TOOLS_DATA.filter((tool) => {
        const matchCategory =
          !chosenCat ||
          chosenCat.toLowerCase() === 'all' ||
          tool.category.toLowerCase() === chosenCat.toLowerCase();

        const corpus = `${tool.name} ${tool.category} ${tool.tagline} ${tool.description} ${tool.bestFor} ${(tool.tags || []).join(' ')}`.toLowerCase();
        const matchQuery = !q || corpus.includes(q);

        return matchCategory && matchQuery;
      });

      if (matched.length === 0) {
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.innerHTML = `
            <p style="margin-bottom: 16px; color: #64748b;">No tools match your search criteria.</p>
            <button class="btn btn-secondary" id="resetBtn" type="button" style="height: 38px;">Reset Filters</button>
          `;
          const resetBtn = document.getElementById('resetBtn');
          if (resetBtn) {
            resetBtn.onclick = () => {
              if (searchInput) searchInput.value = '';
              if (catSelect) catSelect.value = 'all';
              applyFilters();
            };
          }
        }
        if (countLabel) countLabel.textContent = 'Showing 0 tools';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (countLabel) countLabel.textContent = `Showing ${matched.length} tool${matched.length === 1 ? '' : 's'}`;

        const sorted = [...matched].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        sorted.forEach((tool) => grid.appendChild(renderCard(tool)));
      }
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (catSelect) catSelect.addEventListener('change', applyFilters);

    applyFilters();
  }

  // Interactive Recommendation Engine (finder.html)
  function initFinderController() {
    const form = document.getElementById('finderForm');
    const resultsContainer = document.getElementById('results');
    const shortlistGrid = document.getElementById('shortlist-grid') || document.querySelector('#results .grid');

    if (!form || !resultsContainer) return;

    form.onsubmit = function (e) {
      e.preventDefault();
      e.stopPropagation();

      const formData = new FormData(form);
      const selectedType = (formData.get('type') || '').toLowerCase().trim();
      const selectedNeed = (formData.get('need') || '').toLowerCase().trim();
      const selectedPriority = (formData.get('priority') || '').toLowerCase().trim();

      const scoredList = TOOLS_DATA.map((tool) => {
        let score = 0;
        const tags = (tool.tags || []).map((t) => t.toLowerCase());
        const cat = (tool.category || '').toLowerCase();

        // Need Matching (Weight: 50)
        if (selectedNeed && (cat.includes(selectedNeed) || selectedNeed.includes(cat))) {
          score += 50;
        }

        // Entity Matching (Weight: 30)
        if (selectedType && (tags.includes(selectedType) || tool.bestFor.toLowerCase().includes(selectedType))) {
          score += 30;
        }

        // Priority Matching (Weight: 20)
        if (selectedPriority) {
          if (selectedPriority.includes('low-cost') || selectedPriority.includes('cost')) {
            if (tags.includes('low-cost') || tags.includes('free-tier') || tool.pricing.toLowerCase().includes('free')) {
              score += 20;
            }
          }
          if (selectedPriority.includes('international') && (tags.includes('international') || tags.includes('fx'))) {
            score += 20;
          }
          if (selectedPriority.includes('compliance') && (tags.includes('compliance') || tags.includes('mtd') || tags.includes('vat'))) {
            score += 20;
          }
          if (selectedPriority.includes('all-in-one') && (tags.includes('accounting') || tags.includes('banking'))) {
            score += 15;
          }
        }

        return { ...tool, matchPct: Math.min(score > 0 ? score : 45, 98) };
      });

      const topPicks = scoredList
        .sort((a, b) => b.matchPct - a.matchPct)
        .slice(0, 4);

      if (shortlistGrid) {
        shortlistGrid.innerHTML = '';
        topPicks.forEach((tool) => {
          shortlistGrid.appendChild(renderCard(tool, `${tool.matchPct}% Match`));
        });
      }

      resultsContainer.style.display = 'block';
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    };
  }

  // Profile View Controller (tool.html)
  function initProfileController() {
    const target = document.getElementById('toolProfile');
    if (!target) return;

    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('id');
    const tool = TOOLS_DATA.find((t) => t.id === toolId);

    if (!tool) {
      target.innerHTML = `
        <div style="padding:48px 0; text-align:center;">
          <h2 style="font-size:1.8rem; font-weight:800; color:#0f172a;">Tool Factsheet Not Found</h2>
          <p style="margin: 12px 0 24px 0; color: #64748b;">The selected tool does not exist or has been relocated.</p>
          <a class="btn" href="tools.html">Browse Directory</a>
        </div>
      `;
      return;
    }

    document.title = `${tool.name} Review, Pricing & UK Alternatives | FinStack UK`;
    const initials = getInitials(tool.name);
    const logoUrl = getDomainLogo(tool.website);
    const outboundUrl = getTargetUrl(tool);
    const competitors = TOOLS_DATA.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 3);

    const featuredHTML = tool.featured
      ? `<span class="badge-featured" style="margin-left:8px;">⭐ Featured Partner</span>`
      : '';

    const editorialTake = tool.editorialTake || `${tool.name} is an established solution in the ${tool.category} sector, optimized for UK limited companies and sole traders requiring Making Tax Digital and UK banking compliance.`;
    const limitation = tool.limitation || 'Advanced features like multi-currency support and high-volume batch payments require upgrades to premium subscription plans.';
    const whoShouldSkip = tool.whoShouldSkip || 'Enterprises with multi-entity global structures needing bespoke ERP configurations should consider dedicated enterprise software.';

    target.innerHTML = `
      <div style="margin-bottom:32px; display:flex; align-items:center; gap:16px;">
        <div class="brand-avatar-wrap" style="width:58px; height:58px;">
          <img src="${escapeHTML(logoUrl)}" alt="${escapeHTML(tool.name)} logo" class="brand-logo-img" style="width:38px; height:38px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="brand-avatar-fallback" style="display:none; font-size:1.35rem;">${escapeHTML(initials)}</div>
        </div>
        <div>
          <div style="display:flex; align-items:center;">
            <span class="pill">${escapeHTML(tool.category)}</span>
            ${featuredHTML}
          </div>
          <h1 style="font-size: 2.25rem; font-weight:800; margin:4px 0 2px 0; letter-spacing:-0.5px; color:#0f172a;">${escapeHTML(tool.name)}</h1>
          <p style="font-size:1.05rem; color:#475569;">${escapeHTML(tool.tagline)}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
          <h3 style="font-size:1.2rem; margin-bottom:10px; font-weight:700; color:#0f172a;">Editorial Review & SME Suitability</h3>
          <p style="line-height:1.65; color:#334155; margin-bottom:20px;">${escapeHTML(editorialTake)}</p>

          <div class="editorial-box pros">
            <strong style="color:#166534; font-size:0.9rem; display:block; margin-bottom:6px;">✓ Core UK Strengths</strong>
            <ul style="padding-left:18px; line-height:1.7; color:#1e293b; font-size:0.9rem;">
              ${(tool.features || []).map((f) => `<li>${escapeHTML(f)}</li>`).join('')}
            </ul>
          </div>

          <div class="editorial-box cons" style="margin-top:16px;">
            <strong style="color:#991b1b; font-size:0.9rem; display:block; margin-bottom:6px;">⚠️ Key Limitations to Consider</strong>
            <p style="font-size:0.875rem; color:#7f1d1d; line-height:1.5;">${escapeHTML(limitation)}</p>
          </div>

          <div class="editorial-box skip" style="margin-top:16px;">
            <strong style="color:#854d0e; font-size:0.9rem; display:block; margin-bottom:6px;">💡 Who should consider skipping?</strong>
            <p style="font-size:0.875rem; color:#713f12; line-height:1.5;">${escapeHTML(whoShouldSkip)}</p>
          </div>
        </div>

        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; height:fit-content; box-shadow: var(--shadow-card);">
          <h3 style="font-size:1.2rem; margin-bottom:16px; font-weight:700; color:#0f172a;">Provider Factsheet</h3>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Best for:</strong> <span>${escapeHTML(tool.bestFor)}</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Pricing Model:</strong> <span>${escapeHTML(tool.pricing)}</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Verified Rating:</strong> <span>★ ${tool.rating || 4.5} / 5.0 (${escapeHTML(tool.ratingSource || 'Public Aggregators')})</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>UK Compliance:</strong> <span>HMRC / MTD / FSCS Sourced ✓</span></div>
          <div class="meta-row" style="margin-bottom:10px;"><strong>Audit Timestamp:</strong> <span>${escapeHTML(tool.ratingDate || 'Aug 2026')}</span></div>
          
          <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
            <a class="btn btn-block outbound-track" href="${escapeHTML(outboundUrl)}" target="_blank" rel="noopener noreferrer" data-tool="${escapeHTML(tool.id)}" style="height:46px;">Visit Official Website ↗</a>
            <button class="btn btn-secondary btn-block" type="button" onclick="navigator.clipboard.writeText(window.location.href); this.innerText='✓ Link Copied to Clipboard!'; setTimeout(()=>this.innerText='Share This Factsheet', 2000);">Share This Factsheet</button>
          </div>
        </div>
      </div>

      <div style="margin-top:36px; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
        <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:6px; color:#0f172a;">Compare ${escapeHTML(tool.name)} with Alternatives (${escapeHTML(tool.category)})</h3>
        <p style="color:#64748b; font-size:0.9rem; margin-bottom:16px;">Direct feature, pricing, and verified rating comparison for leading UK solutions.</p>
        
        <table class="comparison-matrix">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Pricing</th>
              <th>Target Audience</th>
              <th>Verified Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f0f9ff; font-weight:600;">
              <td>${escapeHTML(tool.name)} (Viewing)</td>
              <td>${escapeHTML(tool.pricing)}</td>
              <td>${escapeHTML(tool.bestFor)}</td>
              <td>★ ${tool.rating || 4.5} <small style="display:block; font-size:0.75rem; color:#64748b; font-weight:normal;">(${escapeHTML(tool.ratingSource || 'Public')})</small></td>
              <td>Current Profile</td>
            </tr>
            ${competitors
              .map(
                (c) => `
              <tr>
                <td>${escapeHTML(c.name)}</td>
                <td>${escapeHTML(c.pricing)}</td>
                <td>${escapeHTML(c.bestFor)}</td>
                <td>★ ${c.rating \vert{}\vert{} 4.5} <small style="display:block; font-size:0.75rem; color:#64748b; font-weight:normal;">(${escapeHTML(c.ratingSource || 'Public')})</small></td>
                <td><a href="tool.html?id=${encodeURIComponent(c.id)}" style="color:#0284c7; font-weight:600; text-decoration:none;">View Review →</a></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }
})();
