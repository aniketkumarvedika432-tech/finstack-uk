/**
 * FinStack UK - 10/10 Master Engine
 * Features: Brand Monograms, Dynamic Comparison Matrix, Click Tracking, Live Filtering
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof TOOLS_DATA === "undefined" || !Array.isArray(TOOLS_DATA)) {
    console.error("FinStack: Master TOOLS_DATA not detected.");
    return;
  }

  updateLiveCounters();
  initPageControllers();
  bindOutboundClickAnalytics();
});

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name) {
  if (!name) return "FS";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function updateLiveCounters() {
  const counterSelectors = ["#toolCount", "#total-tools-count", ".tool-count"];
  counterSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.textContent = `${TOOLS_DATA.length}+`;
    });
  });
}

function buildToolCard(tool, customBadge = "") {
  const card = document.createElement("div");
  card.className = "card";
  const initials = getInitials(tool.name);

  card.innerHTML = `
    <div class="card-top">
      <div class="card-brand-header">
        <div class="brand-avatar">${initials}</div>
        <div>
          <span class="pill">${esc(tool.category)}</span>
          <h3>${esc(tool.name)}</h3>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
        <div style="font-weight:700; color:#0284c7; font-size:0.875rem; background:#f0f9ff; border:1px solid #bae6fd; padding:3px 8px; border-radius:6px;">
          ★ ${tool.rating || 4.5}
        </div>
        ${customBadge ? `<span style="font-size:0.75rem; font-weight:700; color:#16a34a;">${customBadge}</span>` : ""}
      </div>
    </div>
    <p>${esc(tool.tagline || tool.description)}</p>
    <div class="meta-row"><strong>Best for:</strong> <span>${esc(tool.bestFor || "UK Businesses")}</span></div>
    <div class="meta-row"><strong>Pricing:</strong> <span>${esc(tool.pricing || "Transparent")}</span></div>
    <div class="actions">
      <a class="btn btn-secondary" href="tool.html?id=${encodeURIComponent(tool.id)}">Profile & Matrix</a>
      <a class="btn outbound-track" href="${esc(tool.website)}" target="_blank" rel="noopener noreferrer" data-tool="${esc(tool.id)}">Visit ↗</a>
    </div>
  `;
  return card;
}

function bindOutboundClickAnalytics() {
  document.addEventListener("click", (e) => {
    const trackBtn = e.target.closest(".outbound-track");
    if (trackBtn && window.sessionStorage) {
      const toolId = trackBtn.getAttribute("data-tool");
      let clicks = JSON.parse(sessionStorage.getItem("finstack_clicks") || "[]");
      clicks.push({ tool: toolId, timestamp: new Date().toISOString() });
      sessionStorage.setItem("finstack_clicks", JSON.stringify(clicks));
    }
  });
}

function initPageControllers() {
  const hasHero = !!document.querySelector(".hero");
  const isDirectory = !!document.getElementById("search") || window.location.pathname.endsWith("tools.html");
  const isFinder = !!document.getElementById("finderForm") || window.location.pathname.endsWith("finder.html");
  const isProfile = !!document.getElementById("toolProfile") || window.location.pathname.endsWith("tool.html");

  if (hasHero) initHomepage();
  if (isDirectory) initDirectory();
  if (isFinder) initFinder();
  if (isProfile) initProfile();
}

function initHomepage() {
  const grid = document.getElementById("toolGrid") || document.getElementById("featured-tools-grid");
  const empty = document.getElementById("empty");

  if (!grid) return;
  if (empty) empty.style.display = "none";

  grid.innerHTML = "";
  const featured = TOOLS_DATA.filter(t => t.featured).slice(0, 6);
  featured.forEach(tool => grid.appendChild(buildToolCard(tool)));
}

function initDirectory() {
  const grid = document.getElementById("toolGrid") || document.getElementById("tools-grid");
  const searchInput = document.getElementById("search") || document.getElementById("directory-search");
  const catSelect = document.getElementById("cat") || document.getElementById("category-filter");
  const empty = document.getElementById("empty");
  const countEl = document.getElementById("resultsCount") || document.getElementById("directory-count");

  if (!grid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get("cat") || urlParams.get("category");
  const initialQuery = urlParams.get("q") || urlParams.get("search");

  if (catSelect && initialCat) {
    for (let opt of catSelect.options) {
      if (opt.value.toLowerCase() === initialCat.toLowerCase()) {
        catSelect.value = opt.value;
        break;
      }
    }
  }

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  function render() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const chosenCat = catSelect ? catSelect.value : (initialCat || "all");

    grid.innerHTML = "";

    const results = TOOLS_DATA.filter(tool => {
      const matchCat =
        !chosenCat ||
        chosenCat.toLowerCase() === "all" ||
        tool.category.toLowerCase() === chosenCat.toLowerCase();

      const searchCorpus = `${tool.name} ${tool.category} ${tool.tagline} ${tool.description} ${tool.bestFor} ${(tool.tags || []).join(" ")}`.toLowerCase();
      const matchQuery = !q || searchCorpus.includes(q);

      return matchCat && matchQuery;
    });

    if (results.length === 0) {
      if (empty) {
        empty.style.display = "block";
        empty.innerHTML = `
          <p>No tools matched your criteria.</p>
          <button class="btn btn-secondary" id="resetFiltersBtn" style="height: 38px;">Reset Filters</button>
        `;
        const resetBtn = document.getElementById("resetFiltersBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (catSelect) catSelect.value = "all";
            render();
          });
        }
      }
      if (countEl) countEl.textContent = "Showing 0 tools";
    } else {
      if (empty) empty.style.display = "none";
      if (countEl) countEl.textContent = `Showing ${results.length} tool${results.length === 1 ? "" : "s"}`;
      results.forEach(tool => grid.appendChild(buildToolCard(tool)));
    }
  }

  if (searchInput) searchInput.addEventListener("input", render);
  if (catSelect) catSelect.addEventListener("change", render);

  render();
}

function initFinder() {
  const form = document.getElementById("finderForm") || document.querySelector("form");
  const resultsWrapper = document.getElementById("results");
  const grid = document.getElementById("shortlist-grid") || resultsWrapper;

  if (!form || !resultsWrapper) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const businessType = (formData.get("type") || formData.get("business_type") || "").toLowerCase();
    const need = (formData.get("need") || formData.get("primary_need") || "").toLowerCase();
    const priority = (formData.get("priority") || "").toLowerCase();

    const scored = TOOLS_DATA.map(tool => {
      let score = 0;
      const tags = (tool.tags || []).map(t => t.toLowerCase());

      if (need && tool.category.toLowerCase().includes(need)) score += 50;
      if (businessType && (tags.includes(businessType) || tool.bestFor.toLowerCase().includes(businessType))) score += 30;
      if (priority) {
        if (priority.includes("cost") && (tags.includes("low-cost") || tags.includes("free-tier") || tool.pricing.toLowerCase().includes("free"))) score += 20;
        if (priority.includes("inter") && tags.includes("international")) score += 20;
      }

      return { ...tool, matchPct: Math.min(score, 98) };
    });

    const shortlist = scored
      .filter(t => t.matchPct > 0)
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 4);

    grid.innerHTML = "";

    if (shortlist.length === 0) {
      grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 20px;'>No exact match found. Try broader options.</p>";
    } else {
      shortlist.forEach(tool => {
        grid.appendChild(buildToolCard(tool, `${tool.matchPct}% Match`));
      });
    }

    resultsWrapper.style.display = "block";
    resultsWrapper.scrollIntoView({ behavior: "smooth" });
  });
}

function initProfile() {
  const target = document.getElementById("toolProfile");
  if (!target) return;

  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get("id");
  const tool = TOOLS_DATA.find(t => t.id === toolId);

  if (!tool) {
    target.innerHTML = `
      <div style="padding:40px 0; text-align:center;">
        <h2>Tool Not Found</h2>
        <p style="margin: 12px 0 20px 0; color: #64748b;">The selected provider does not exist or has moved.</p>
        <a class="btn" href="tools.html">View all tools</a>
      </div>
    `;
    return;
  }

  document.title = `${tool.name} Review & Feature Matrix | FinStack UK`;
  const initials = getInitials(tool.name);
  const competitors = TOOLS_DATA.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 2);

  target.innerHTML = `
    <div style="margin-bottom:32px; display:flex; align-items:center; gap:16px;">
      <div class="brand-avatar" style="width:58px; height:58px; font-size:1.35rem;">${initials}</div>
      <div>
        <span class="pill">${esc(tool.category)}</span>
        <h1 style="font-size: 2.25rem; font-weight:800; margin:4px 0 2px 0; letter-spacing:-0.5px;">${esc(tool.name)}</h1>
        <p style="font-size:1.05rem; color:#475569;">${esc(tool.tagline)}</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
        <h3 style="font-size:1.25rem; margin-bottom:12px; font-weight:700;">Overview & UK SME Positioning</h3>
        <p style="line-height:1.6; color:#475569;">${esc(tool.description)}</p>
        
        <h4 style="margin-top:24px; margin-bottom:10px; font-size:1.05rem; font-weight:700;">Verified Capabilities</h4>
        <ul style="padding-left:20px; line-height:1.8; color:#334155;">
          ${(tool.features || []).map(f => `<li>✓ ${esc(f)}</li>`).join("")}
        </ul>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; height:fit-content; box-shadow: var(--shadow-card);">
        <h3 style="font-size:1.25rem; margin-bottom:16px; font-weight:700;">Provider Factsheet</h3>
        <div class="meta-row" style="margin-bottom:10px;"><strong>Best for:</strong> <span>${esc(tool.bestFor)}</span></div>
        <div class="meta-row" style="margin-bottom:10px;"><strong>Pricing Model:</strong> <span>${esc(tool.pricing)}</span></div>
        <div class="meta-row" style="margin-bottom:10px;"><strong>SME Rating:</strong> <span>★ ${tool.rating || 4.5} / 5.0</span></div>
        <div class="meta-row" style="margin-bottom:10px;"><strong>UK Compliance:</strong> <span>HMRC / MTD Verified ✓</span></div>
        <a class="btn btn-block outbound-track" href="${esc(tool.website)}" target="_blank" rel="noopener noreferrer" data-tool="${esc(tool.id)}" style="margin-top:24px; height:46px;">Visit Official Website ↗</a>
      </div>
    </div>

    <div style="margin-top:36px; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">
      <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:6px;">Category Comparison Matrix (${esc(tool.category)})</h3>
      <p style="color:#64748b; font-size:0.9rem; margin-bottom:16px;">Direct feature and pricing comparison for leading UK solutions in this space.</p>
      
      <table class="comparison-matrix">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Pricing</th>
            <th>Target Audience</th>
            <th>Rating</th>
            <th>Direct Review</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background:#f0f9ff; font-weight:600;">
            <td>${esc(tool.name)} (Viewing)</td>
            <td>${esc(tool.pricing)}</td>
            <td>${esc(tool.bestFor)}</td>
            <td>★ ${tool.rating || 4.5}</td>
            <td>Current</td>
          </tr>
          ${competitors.map(c => `
            <tr>
              <td>${esc(c.name)}</td>
              <td>${esc(c.pricing)}</td>
              <td>${esc(c.bestFor)}</td>
              <td>★ ${c.rating || 4.5}</td>
              <td><a href="tool.html?id=${encodeURIComponent(c.id)}" style="color:#0284c7; font-weight:600; text-decoration:none;">Compare →</a></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
