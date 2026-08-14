/**
 * Application Engine for FinStack UK
 * Unified handler for Homepage, Directory, Finder, and Profiles
 */

document.addEventListener("DOMContentLoaded", () => {
  initLiveCounters();
  initHomepageFeatured();
  initDirectoryPage();
  initFinderEngine();
  initProfilePage();
});

/* ==========================================================================
   1. COMMON UTILITIES & STAT COUNTERS
   ========================================================================== */
function initLiveCounters() {
  const countElements = document.querySelectorAll(".tool-count, #total-tools-count");
  if (countElements.length > 0 && typeof TOOLS_DATA !== "undefined") {
    countElements.forEach(el => {
      el.textContent = `${TOOLS_DATA.length}+`;
    });
  }
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function createToolCard(tool) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", tool.id);
  card.setAttribute("data-category", tool.category);

  card.innerHTML = `
    <div class="card-header">
      <div>
        <span class="category-badge">${escapeHtml(tool.category)}</span>
        <h3 class="card-title">${escapeHtml(tool.name)}</h3>
      </div>
      <div class="card-rating">★ ${tool.rating || 4.5}</div>
    </div>
    <p class="card-desc">${escapeHtml(tool.tagline)}</p>
    <div class="card-meta">
      <div class="meta-item">
        <strong>Best for:</strong> ${escapeHtml(tool.bestFor)}
      </div>
      <div class="meta-item">
        <strong>Pricing:</strong> ${escapeHtml(tool.pricing)}
      </div>
    </div>
    <div class="card-actions">
      <a href="tool.html?id=${encodeURIComponent(tool.id)}" class="btn btn-secondary btn-sm">View Details</a>
      <a href="${escapeHtml(tool.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Visit Tool ↗</a>
    </div>
  `;
  return card;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   2. HOMEPAGE FEATURED TOOLS
   ========================================================================== */
function initHomepageFeatured() {
  const featuredContainer = document.getElementById("featured-tools-grid");
  if (!featuredContainer || typeof TOOLS_DATA === "undefined") return;

  featuredContainer.innerHTML = "";
  const featuredTools = TOOLS_DATA.filter(t => t.featured).slice(0, 6);

  featuredTools.forEach(tool => {
    featuredContainer.appendChild(createToolCard(tool));
  });
}

/* ==========================================================================
   3. DIRECTORY (tools.html) - SEARCH & FILTERING
   ========================================================================== */
function initDirectoryPage() {
  const grid = document.getElementById("tools-grid");
  const searchInput = document.getElementById("directory-search");
  const categoryFilter = document.getElementById("category-filter");
  const resultCount = document.getElementById("directory-count");
  const emptyState = document.getElementById("empty-state");

  if (!grid || typeof TOOLS_DATA === "undefined") return;

  const urlCategory = getQueryParam("category");
  const urlSearch = getQueryParam("q");

  if (categoryFilter && urlCategory) {
    categoryFilter.value = urlCategory;
  }
  if (searchInput && urlSearch) {
    searchInput.value = urlSearch;
  }

  function renderFilteredTools() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "All";

    grid.innerHTML = "";

    const filtered = TOOLS_DATA.filter(tool => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All" ||
        tool.category.toLowerCase() === selectedCategory.toLowerCase();

      const searchContent = `${tool.name} ${tool.tagline} ${tool.description} ${tool.category} ${tool.tags.join(" ")} ${tool.bestFor}`.toLowerCase();
      const matchesSearch = !query || searchContent.includes(query);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (resultCount) resultCount.textContent = "Showing 0 tools";
    } else {
      if (emptyState) emptyState.style.display = "none";
      if (resultCount) resultCount.textContent = `Showing ${filtered.length} tool${filtered.length === 1 ? "" : "s"}`;
      filtered.forEach(tool => grid.appendChild(createToolCard(tool)));
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderFilteredTools);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderFilteredTools);
  }

  // Initial immediate render
  renderFilteredTools();
}

/* ==========================================================================
   4. FINDER (finder.html) - SHORTLIST GENERATOR
   ========================================================================== */
function initFinderEngine() {
  const finderForm = document.getElementById("finder-form");
  const resultsSection = document.getElementById("finder-results");
  const shortlistContainer = document.getElementById("shortlist-grid");

  if (!finderForm || !resultsSection || !shortlistContainer || typeof TOOLS_DATA === "undefined") {
    return;
  }

  finderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const businessType = finderForm.querySelector('select[name="business_type"]')?.value || "";
    const primaryNeed = finderForm.querySelector('select[name="primary_need"]')?.value || "";
    const priority = finderForm.querySelector('select[name="priority"]')?.value || "";

    const scoredTools = TOOLS_DATA.map(tool => {
      let score = 0;
      const toolTags = tool.tags.map(t => t.toLowerCase());

      // 1. Primary category match (Weight: 5)
      if (primaryNeed && tool.category.toLowerCase() === primaryNeed.toLowerCase()) {
        score += 5;
      }

      // 2. Business type match (Weight: 3)
      if (businessType && (toolTags.includes(businessType.toLowerCase()) || tool.bestFor.toLowerCase().includes(businessType.toLowerCase()))) {
        score += 3;
      }

      // 3. Priority match (Weight: 2)
      if (priority) {
        if (priority === "low-cost" && (toolTags.includes("low-cost") || toolTags.includes("free-tier") || tool.pricing.toLowerCase().includes("free"))) {
          score += 2;
        } else if (priority === "all-in-one" && (toolTags.includes("accounting") || toolTags.includes("banking"))) {
          score += 2;
        } else if (priority === "international" && toolTags.includes("international")) {
          score += 2;
        }
      }

      return { ...tool, matchScore: score };
    });

    const shortlisted = scoredTools
      .filter(item => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    shortlistContainer.innerHTML = "";

    if (shortlisted.length === 0) {
      shortlistContainer.innerHTML = "<p class='no-results'>No specific matches found. Try selecting different criteria.</p>";
    } else {
      shortlisted.forEach(tool => {
        const item = document.createElement("div");
        item.className = "card shortlist-card";
        item.innerHTML = `
          <div class="card-header">
            <div>
              <span class="category-badge">${escapeHtml(tool.category)}</span>
              <h3 class="card-title">${escapeHtml(tool.name)}</h3>
            </div>
            <span class="badge badge-success">Match Score: ${tool.matchScore}/10</span>
          </div>
          <p class="card-desc">${escapeHtml(tool.tagline)}</p>
          <div class="card-meta">
            <div class="meta-item"><strong>Why it matches:</strong> Best suited for ${escapeHtml(tool.bestFor)}</div>
            <div class="meta-item"><strong>Pricing:</strong> ${escapeHtml(tool.pricing)}</div>
          </div>
          <div class="card-actions">
            <a href="tool.html?id=${encodeURIComponent(tool.id)}" class="btn btn-secondary btn-sm">Read Full Profile</a>
            <a href="${escapeHtml(tool.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Visit Tool ↗</a>
          </div>
        `;
        shortlistContainer.appendChild(item);
      });
    }

    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: "smooth" });
  });
}

/* ==========================================================================
   5. PROFILE PAGE (tool.html) - DYNAMIC LOADER
   ========================================================================== */
function initProfilePage() {
  const profileContainer = document.getElementById("tool-profile-container");
  if (!profileContainer || typeof TOOLS_DATA === "undefined") return;

  const toolId = getQueryParam("id");
  const tool = TOOLS_DATA.find(t => t.id === toolId);

  if (!tool) {
    profileContainer.innerHTML = `
      <div class="profile-error text-center" style="padding: 60px 20px;">
        <h2>Tool Not Found</h2>
        <p>The provider you requested does not exist in our directory or has moved.</p>
        <a href="tools.html" class="btn btn-primary" style="margin-top: 15px;">Browse All Tools</a>
      </div>
    `;
    return;
  }

  // Update Page Title
  document.title = `${tool.name} Review & Pricing | FinStack UK`;

  // Render Tool Profile
  profileContainer.innerHTML = `
    <div class="profile-header">
      <span class="category-badge">${escapeHtml(tool.category)}</span>
      <h1 class="profile-title">${escapeHtml(tool.name)}</h1>
      <p class="profile-tagline">${escapeHtml(tool.tagline)}</p>
      <div class="profile-rating">Rating: ★ ${tool.rating || 4.5} / 5.0</div>
    </div>

    <div class="profile-details-grid">
      <div class="profile-main-content">
        <h3>Overview</h3>
        <p>${escapeHtml(tool.description)}</p>

        <h3 style="margin-top: 25px;">Key Features</h3>
        <ul class="feature-list">
          ${tool.features.map(f => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
        </ul>
      </div>

      <div class="profile-sidebar-card">
        <h3>Tool Summary</h3>
        <div class="sidebar-meta-row">
          <strong>Category:</strong> <span>${escapeHtml(tool.category)}</span>
        </div>
        <div class="sidebar-meta-row">
          <strong>Best For:</strong> <span>${escapeHtml(tool.bestFor)}</span>
        </div>
        <div class="sidebar-meta-row">
          <strong>Pricing:</strong> <span>${escapeHtml(tool.pricing)}</span>
        </div>
        <a href="${escapeHtml(tool.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block" style="margin-top: 20px;">Visit Official Website ↗</a>
      </div>
    </div>
  `;
}
