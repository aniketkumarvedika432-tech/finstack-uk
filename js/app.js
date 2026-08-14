/**
 * FinStack UK Engine
 * Unified handler for Index, Directory, Finder, and Profiles
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof TOOLS_DATA === "undefined" || !Array.isArray(TOOLS_DATA)) {
    console.error("FinStack: TOOLS_DATA is not defined or loaded.");
    return;
  }

  updateLiveCounters();
  initPageControllers();
});

// Helper: Escape HTML strings safely
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 1. Live Counters
function updateLiveCounters() {
  const counterSelectors = ["#toolCount", "#total-tools-count", ".tool-count", "#directory-count"];
  counterSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.id === "toolCount" || el.classList.contains("tool-count")) {
        el.textContent = `${TOOLS_DATA.length}+`;
      }
    });
  });
}

// 2. Card HTML Generator (FinStack CSS Compatible)
function buildToolCard(tool) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-top">
      <div>
        <span class="pill">${esc(tool.category)}</span>
        <h3>${esc(tool.name)}</h3>
      </div>
      <div style="font-weight:700; color:var(--primary, #0f766e);">★ ${tool.rating || 4.5}</div>
    </div>
    <p>${esc(tool.tagline || tool.description)}</p>
    <div class="meta-row"><strong>Best for:</strong> <span>${esc(tool.bestFor || "UK Businesses")}</span></div>
    <div class="meta-row"><strong>Pricing:</strong> <span>${esc(tool.pricing || "Transparent")}</span></div>
    <div class="actions" style="margin-top:16px; display:flex; gap:8px;">
      <a class="btn btn-secondary" href="tool.html?id=${encodeURIComponent(tool.id)}">Profile</a>
      <a class="btn" href="${esc(tool.website)}" target="_blank" rel="noopener noreferrer">Visit ↗</a>
    </div>
  `;
  return card;
}

// 3. Page Initialiser
function initPageControllers() {
  const isHomepage = !!document.querySelector(".hero") || window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const isDirectory = !!document.getElementById("search") || !!document.getElementById("directory-search") || window.location.pathname.endsWith("tools.html");
  const isFinder = !!document.getElementById("finderForm") || !!document.getElementById("finder-form") || window.location.pathname.endsWith("finder.html");
  const isProfile = !!document.getElementById("toolProfile") || !!document.getElementById("tool-profile-container") || window.location.pathname.endsWith("tool.html");

  if (isHomepage) initHomepage();
  if (isDirectory) initDirectory();
  if (isFinder) initFinder();
  if (isProfile) initProfile();
}

// 4. Homepage Logic
function initHomepage() {
  const grid = document.getElementById("toolGrid") || document.getElementById("featured-tools-grid");
  const empty = document.getElementById("empty") || document.getElementById("empty-state");

  if (!grid) return;
  if (empty) empty.style.display = "none";

  grid.innerHTML = "";
  const featured = TOOLS_DATA.filter(t => t.featured).slice(0, 6);
  featured.forEach(tool => grid.appendChild(buildToolCard(tool)));
}

// 5. Directory Page Logic
function initDirectory() {
  const grid = document.getElementById("toolGrid") || document.getElementById("tools-grid");
  const searchInput = document.getElementById("search") || document.getElementById("directory-search") || document.querySelector('input[type="search"]');
  const catSelect = document.getElementById("cat") || document.getElementById("category-filter") || document.getElementById("categorySelect");
  const empty = document.getElementById("empty") || document.getElementById("empty-state");
  const countEl = document.getElementById("resultsCount") || document.getElementById("directory-count");

  if (!grid) return;

  // Read URL params
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

      const searchCorpus = `${tool.name} ${tool.category} ${tool.tagline} ${tool.description} ${tool.bestFor} ${tool.tags ? tool.tags.join(" ") : ""}`.toLowerCase();
      const matchQuery = !q || searchCorpus.includes(q);

      return matchCat && matchQuery;
    });

    if (results.length === 0) {
      if (empty) empty.style.display = "block";
      if (countEl) countEl.textContent = "Showing 0 tools";
    } else {
      if (empty) empty.style.display = "none";
      if (countEl) countEl.textContent = `Showing ${results.length} tool${results.length === 1 ? "" : "s"}`;
      results.forEach(tool => grid.appendChild(buildToolCard(tool)));
    }
  }

  if (searchInput) searchInput.addEventListener("input", render);
  if (catSelect) catSelect.addEventListener("change", render);

  // Initial immediate render
  render();
}

// 6. Finder Engine
function initFinder() {
  const form = document.getElementById("finderForm") || document.getElementById("finder-form") || document.querySelector("form");
  const resultsContainer = document.getElementById("results") || document.getElementById("finder-results") || document.getElementById("shortlist-grid");

  if (!form || !resultsContainer) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const businessType = (formData.get("type") || formData.get("business_type") || "").toLowerCase();
    const need = (formData.get("need") || formData.get("primary_need") || "").toLowerCase();
    const priority = (formData.get("priority") || "").toLowerCase();

    const scored = TOOLS_DATA.map(tool => {
      let score = 0;
      const tags = (tool.tags || []).map(t => t.toLowerCase());

      if (need && tool.category.toLowerCase().includes(need)) score += 5;
      if (businessType && (tags.includes(businessType) || tool.bestFor.toLowerCase().includes(businessType))) score += 3;
      if (priority) {
        if (priority.includes("cost") && (tags.includes("low-cost") || tags.includes("free-tier") || tool.pricing.toLowerCase().includes("free"))) score += 2;
        if (priority.includes("inter") && tags.includes("international")) score += 2;
      }

      return { ...tool, score };
    });

    const shortlist = scored
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const finalTarget = document.getElementById("shortlist-grid") || resultsContainer;
    finalTarget.innerHTML = "";

    if (shortlist.length === 0) {
      finalTarget.innerHTML = "<p>No exact match found. Try selecting broader options or explore the full directory.</p>";
    } else {
      shortlist.forEach(tool => finalTarget.appendChild(buildToolCard(tool)));
    }

    const wrapper = document.getElementById("finder-results") || resultsContainer;
    wrapper.style.display = "block";
    wrapper.scrollIntoView({ behavior: "smooth" });
  });
}

// 7. Dynamic Profile Page (tool.html)
function initProfile() {
  const target = document.getElementById("toolProfile") || document.getElementById("tool-profile-container") || document.getElementById("profile");
  if (!target) return;

  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get("id");
  const tool = TOOLS_DATA.find(t => t.id === toolId);

  if (!tool) {
    target.innerHTML = `
      <div style="padding:40px 0; text-align:center;">
        <h2>Tool Not Found</h2>
        <p>The selected provider does not exist or has moved.</p>
        <a class="btn" href="tools.html" style="margin-top:16px;">View all tools</a>
      </div>
    `;
    return;
  }

  document.title = `${tool.name} Review & Details | FinStack UK`;

  target.innerHTML = `
    <div style="margin-bottom:24px;">
      <span class="pill">${esc(tool.category)}</span>
      <h1 style="margin:12px 0 6px 0;">${esc(tool.name)}</h1>
      <p style="font-size:1.15rem; color:#475569;">${esc(tool.tagline)}</p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
      <div style="background:#fff; border:1px solid var(--border, #e2e8f0); border-radius:12px; padding:24px;">
        <h3>Overview</h3>
        <p style="margin-top:12px; line-height:1.6;">${esc(tool.description)}</p>
        <h4 style="margin-top:20px;">Key Features</h4>
        <ul style="margin-top:10px; padding-left:20px; line-height:1.8;">
          ${(tool.features || []).map(f => `<li>${esc(f)}</li>`).join("")}
        </ul>
      </div>
      <div style="background:#fff; border:1px solid var(--border, #e2e8f0); border-radius:12px; padding:24px; height:fit-content;">
        <h3>Summary</h3>
        <div class="meta-row" style="margin-top:16px;"><strong>Best for:</strong> <span>${esc(tool.bestFor)}</span></div>
        <div class="meta-row" style="margin-top:8px;"><strong>Pricing:</strong> <span>${esc(tool.pricing)}</span></div>
        <div class="meta-row" style="margin-top:8px;"><strong>Rating:</strong> <span>★ ${tool.rating || 4.5} / 5.0</span></div>
        <a class="btn" href="${esc(tool.website)}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; margin-top:24px;">Visit Official Site ↗</a>
      </div>
    </div>
  `;
}
