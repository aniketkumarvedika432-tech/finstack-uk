/**
 * FinStack UK - Core Engine
 * Fully decoupled, zero-dependency, works with all static HTML pages.
 */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof TOOLS_DATA === "undefined" || !Array.isArray(TOOLS_DATA)) {
    console.error("FinStack: TOOLS_DATA not found. Ensure tools.js is loaded before app.js.");
    return;
  }

  // Update counters on all pages
  var counters = document.querySelectorAll("#toolCount, #total-tools-count, .tool-count");
  counters.forEach(function (el) {
    el.textContent = TOOLS_DATA.length + "+";
  });

  // Identify current page by unique DOM elements
  var isProfile = document.getElementById("toolProfile");
  var isFinder = document.getElementById("finderForm");
  var isDirectory = document.getElementById("search") && document.getElementById("cat");
  var isHomepage = document.getElementById("toolGrid") && !isDirectory;

  if (isProfile) {
    renderProfile();
  } else if (isFinder) {
    renderFinder();
  } else if (isDirectory) {
    renderDirectory();
  } else if (isHomepage) {
    renderHomepage();
  }

  bindOutboundTracking();
});

// Safe HTML String Escaper
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Fallback Initials
function getInitials(name) {
  if (!name) return "FS";
  var parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Favicon Fetcher
function getFavicon(url) {
  try {
    var domain = new URL(url).hostname.replace(/^www\./, "");
    return "https://www.google.com/s2/favicons?domain=" + domain + "&sz=128";
  } catch (e) {
    return "";
  }
}

// Link Resolver (Affiliate or direct)
function getToolUrl(tool) {
  if (typeof getAffiliateUrl === "function") {
    return getAffiliateUrl(tool.id, tool.website);
  }
  return tool.website || "#";
}

// Card Generator
function createCard(tool, matchLabel) {
  var card = document.createElement("div");
  card.className = "card" + (tool.featured ? " is-featured" : "");

  var initials = getInitials(tool.name);
  var logo = getFavicon(tool.website);
  var link = getToolUrl(tool);

  var featuredBadge = tool.featured
    ? '<span class="badge-featured">⭐ Featured</span>'
    : '';

  var sourceBadge = tool.ratingSource
    ? '<small style="font-size:0.7rem; color:#64748b; font-weight:500; display:block; margin-top:2px;">' + esc(tool.ratingSource) + '</small>'
    : '';

  var matchBadge = matchLabel
    ? '<span style="font-size:0.75rem; font-weight:700; color:#16a34a; margin-top:2px;">' + esc(matchLabel) + '</span>'
    : '';

  card.innerHTML =
    '<div class="card-top">' +
      '<div class="card-brand-header">' +
        '<div class="brand-avatar-wrap">' +
          '<img src="' + esc(logo) + '" alt="' + esc(tool.name) + '" class="brand-logo-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
          '<div class="brand-avatar-fallback" style="display:none;">' + esc(initials) + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">' +
            '<span class="pill" style="margin-bottom:0;">' + esc(tool.category) + '</span>' +
            featuredBadge +
          '</div>' +
          '<h3>' + esc(tool.name) + '</h3>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; text-align:right;">' +
        '<div style="font-weight:700; color:#0284c7; font-size:0.875rem; background:#f0f9ff; border:1px solid #bae6fd; padding:3px 8px; border-radius:6px;">' +
          '★ ' + (tool.rating || 4.5) +
        '</div>' +
        sourceBadge +
        matchBadge +
      '</div>' +
    '</div>' +
    '<p>' + esc(tool.tagline || tool.description) + '</p>' +
    '<div class="meta-row"><strong>Best for:</strong> <span>' + esc(tool.bestFor || "UK Businesses") + '</span></div>' +
    '<div class="meta-row"><strong>Pricing:</strong> <span>' + esc(tool.pricing || "Transparent") + '</span></div>' +
    '<div class="actions">' +
      '<a class="btn btn-secondary" href="tool.html?id=' + encodeURIComponent(tool.id) + '">Review & Matrix</a>' +
      '<a class="btn outbound-track" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer" data-tool="' + esc(tool.id) + '">Visit ↗</a>' +
    '</div>';

  return card;
}

// 1. Homepage Logic
function renderHomepage() {
  var grid = document.getElementById("toolGrid");
  if (!grid) return;

  grid.innerHTML = "";
  var featured = TOOLS_DATA.filter(function (t) { return t.featured; });
  var display = featured.length >= 4 ? featured.slice(0, 6) : TOOLS_DATA.slice(0, 6);

  display.forEach(function (tool) {
    grid.appendChild(createCard(tool));
  });
}

// 2. Directory Logic (tools.html)
function renderDirectory() {
  var grid = document.getElementById("toolGrid");
  var searchInput = document.getElementById("search");
  var catSelect = document.getElementById("cat");
  var emptyState = document.getElementById("empty");
  var countLabel = document.getElementById("resultsCount");

  if (!grid) return;

  var params = new URLSearchParams(window.location.search);
  var qParam = params.get("q") || params.get("search") || "";
  var catParam = params.get("cat") || params.get("category") || "all";

  if (searchInput && qParam) searchInput.value = qParam;
  if (catSelect && catParam) {
    for (var i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value.toLowerCase() === catParam.toLowerCase()) {
        catSelect.selectedIndex = i;
        break;
      }
    }
  }

  function filter() {
    var q = searchInput ? searchInput.value.toLowerCase().trim() : "";
    var chosenCat = catSelect ? catSelect.value.toLowerCase() : "all";

    grid.innerHTML = "";

    var matches = TOOLS_DATA.filter(function (tool) {
      var matchCat = chosenCat === "all" || tool.category.toLowerCase() === chosenCat;
      var searchBody = (tool.name + " " + tool.category + " " + tool.tagline + " " + tool.description + " " + tool.bestFor + " " + (tool.tags || []).join(" ")).toLowerCase();
      var matchQ = !q || searchBody.indexOf(q) !== -1;
      return matchCat && matchQ;
    });

    if (matches.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      if (countLabel) countLabel.textContent = "Showing 0 tools";
    } else {
      if (emptyState) emptyState.style.display = "none";
      if (countLabel) countLabel.textContent = "Showing " + matches.length + " tool" + (matches.length === 1 ? "" : "s");

      var sorted = matches.sort(function (a, b) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });

      sorted.forEach(function (tool) {
        grid.appendChild(createCard(tool));
      });
    }
  }

  if (searchInput) searchInput.addEventListener("input", filter);
  if (catSelect) catSelect.addEventListener("change", filter);

  filter();
}

// 3. Finder Logic (finder.html)
function renderFinder() {
  var form = document.getElementById("finderForm");
  var resultsBox = document.getElementById("results");
  var shortlistGrid = document.getElementById("shortlist-grid");

  if (!form || !resultsBox || !shortlistGrid) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var type = (form.querySelector("#type") ? form.querySelector("#type").value : "").toLowerCase();
    var need = (form.querySelector("#need") ? form.querySelector("#need").value : "").toLowerCase();
    var priority = (form.querySelector("#priority") ? form.querySelector("#priority").value : "").toLowerCase();

    var scored = TOOLS_DATA.map(function (tool) {
      var score = 0;
      var cat = tool.category.toLowerCase();
      var tags = (tool.tags || []).map(function (t) { return t.toLowerCase(); });

      // Need Match (50 pts)
      if (need && (cat.indexOf(need) !== -1 || need.indexOf(cat) !== -1)) {
        score += 50;
      }

      // Entity Match (30 pts)
      if (type) {
        if (tags.indexOf(type) !== -1 || (tool.bestFor && tool.bestFor.toLowerCase().indexOf(type) !== -1)) {
          score += 30;
        }
      }

      // Priority Match (20 pts)
      if (priority) {
        if (priority.indexOf("low-cost") !== -1 && (tags.indexOf("low-cost") !== -1 || tags.indexOf("free-tier") || tool.pricing.toLowerCase().indexOf("free") !== -1)) {
          score += 20;
        } else if (priority.indexOf("international") !== -1 && (tags.indexOf("international") !== -1 || tags.indexOf("fx") !== -1)) {
          score += 20;
        } else if (priority.indexOf("all-in-one") !== -1 && (tags.indexOf("accounting") !== -1 || tags.indexOf("banking") !== -1)) {
          score += 20;
        } else {
          score += 10;
        }
      }

      var matchPct = score > 0 ? Math.min(score, 98) : 55;
      return { tool: tool, matchPct: matchPct };
    });

    var topPicks = scored.sort(function (a, b) {
      return b.matchPct - a.matchPct;
    }).slice(0, 4);

    shortlistGrid.innerHTML = "";
    topPicks.forEach(function (item) {
      shortlistGrid.appendChild(createCard(item.tool, item.matchPct + "% Match"));
    });

    resultsBox.style.display = "block";
    resultsBox.scrollIntoView({ behavior: "smooth" });
  });
}

// 4. Factsheet Logic (tool.html)
function renderProfile() {
  var target = document.getElementById("toolProfile");
  if (!target) return;

  var params = new URLSearchParams(window.location.search);
  var toolId = params.get("id");
  var tool = null;

  for (var i = 0; i < TOOLS_DATA.length; i++) {
    if (TOOLS_DATA[i].id === toolId) {
      tool = TOOLS_DATA[i];
      break;
    }
  }

  if (!tool) {
    target.innerHTML =
      '<div style="padding:48px 0; text-align:center;">' +
        '<h2 style="font-size:1.8rem; font-weight:800; color:#0f172a;">Factsheet Not Found</h2>' +
        '<p style="margin: 12px 0 24px 0; color: #64748b;">The selected tool does not exist or has been relocated.</p>' +
        '<a class="btn" href="tools.html">Browse Directory</a>' +
      '</div>';
    return;
  }

  document.title = tool.name + " Review, Pricing & Alternatives | FinStack UK";
  var initials = getInitials(tool.name);
  var logo = getFavicon(tool.website);
  var outboundUrl = getToolUrl(tool);

  var competitors = TOOLS_DATA.filter(function (t) {
    return t.category === tool.category && t.id !== tool.id;
  }).slice(0, 3);

  var featuredBadge = tool.featured
    ? '<span class="badge-featured" style="margin-left:8px;">⭐ Featured Partner</span>'
    : '';

  var editorialTake = tool.editorialTake || (tool.name + " is a standard UK solution for " + tool.category + " workflows, built to support Making Tax Digital and British banking compliance.");
  var limitation = tool.limitation || "Advanced multi-currency and high-volume transaction features require upgrades to higher-tier pricing plans.";
  var whoShouldSkip = tool.whoShouldSkip || "Large multinational corporations requiring complex bespoke ERP ledger integrations should evaluate enterprise-only platforms.";

  var featuresList = (tool.features || []).map(function (f) {
    return "<li>" + esc(f) + "</li>";
  }).join("");

  var competitorRows = competitors.map(function (c) {
    return "<tr>" +
      "<td>" + esc(c.name) + "</td>" +
      "<td>" + esc(c.pricing) + "</td>" +
      "<td>" + esc(c.bestFor) + "</td>" +
      "<td>★ " + (c.rating || 4.5) + " <small style='display:block; font-size:0.75rem; color:#64748b;'>(" + esc(c.ratingSource || "Public") + ")</small></td>" +
      "<td><a href='tool.html?id=" + encodeURIComponent(c.id) + "' style='color:#0284c7; font-weight:600; text-decoration:none;'>Compare →</a></td>" +
    "</tr>";
  }).join("");

  target.innerHTML =
    '<div style="margin-bottom:32px; display:flex; align-items:center; gap:16px;">' +
      '<div class="brand-avatar-wrap" style="width:58px; height:58px;">' +
        '<img src="' + esc(logo) + '" alt="' + esc(tool.name) + '" class="brand-logo-img" style="width:38px; height:38px;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
        '<div class="brand-avatar-fallback" style="display:none; font-size:1.35rem;">' + esc(initials) + '</div>' +
      '</div>' +
      '<div>' +
        '<div style="display:flex; align-items:center;">' +
          '<span class="pill">' + esc(tool.category) + '</span>' +
          featuredBadge +
        '</div>' +
        '<h1 style="font-size: 2.25rem; font-weight:800; margin:4px 0 2px 0; letter-spacing:-0.5px; color:#0f172a;">' + esc(tool.name) + '</h1>' +
        '<p style="font-size:1.05rem; color:#475569;">' + esc(tool.tagline) + '</p>' +
      '</div>' +
    '</div>' +

    '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">' +
      '<div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">' +
        '<h3 style="font-size:1.2rem; margin-bottom:10px; font-weight:700; color:#0f172a;">Editorial Analysis</h3>' +
        '<p style="line-height:1.65; color:#334155; margin-bottom:20px;">' + esc(editorialTake) + '</p>' +
        '<div class="editorial-box pros">' +
          '<strong style="color:#166534; font-size:0.9rem; display:block; margin-bottom:6px;">✓ Core UK Strengths</strong>' +
          '<ul style="padding-left:18px; line-height:1.7; color:#1e293b; font-size:0.9rem;">' + featuresList + '</ul>' +
        '</div>' +
        '<div class="editorial-box cons" style="margin-top:16px;">' +
          '<strong style="color:#991b1b; font-size:0.9rem; display:block; margin-bottom:6px;">⚠️ Key Limitations</strong>' +
          '<p style="font-size:0.875rem; color:#7f1d1d; line-height:1.5;">' + esc(limitation) + '</p>' +
        '</div>' +
        '<div class="editorial-box skip" style="margin-top:16px;">' +
          '<strong style="color:#854d0e; font-size:0.9rem; display:block; margin-bottom:6px;">💡 Who Should Skip</strong>' +
          '<p style="font-size:0.875rem; color:#713f12; line-height:1.5;">' + esc(whoShouldSkip) + '</p>' +
        '</div>' +
      '</div>' +

      '<div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; height:fit-content; box-shadow: var(--shadow-card);">' +
        '<h3 style="font-size:1.2rem; margin-bottom:16px; font-weight:700; color:#0f172a;">Provider Factsheet</h3>' +
        '<div class="meta-row" style="margin-bottom:10px;"><strong>Best for:</strong> <span>' + esc(tool.bestFor) + '</span></div>' +
        '<div class="meta-row" style="margin-bottom:10px;"><strong>Pricing Model:</strong> <span>' + esc(tool.pricing) + '</span></div>' +
        '<div class="meta-row" style="margin-bottom:10px;"><strong>Verified Rating:</strong> <span>★ ' + (tool.rating || 4.5) + ' / 5.0 (' + esc(tool.ratingSource || "Public") + ')</span></div>' +
        '<div class="meta-row" style="margin-bottom:10px;"><strong>UK Compliance:</strong> <span>HMRC MTD & FSCS Audited ✓</span></div>' +
        '<div class="meta-row" style="margin-bottom:10px;"><strong>Audit Date:</strong> <span>' + esc(tool.ratingDate || "Aug 2026") + '</span></div>' +
        '<div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">' +
          '<a class="btn btn-block outbound-track" href="' + esc(outboundUrl) + '" target="_blank" rel="noopener noreferrer" data-tool="' + esc(tool.id) + '" style="height:46px;">Visit Official Website ↗</a>' +
          '<button class="btn btn-secondary btn-block" type="button" onclick="navigator.clipboard.writeText(window.location.href); this.innerText=\'✓ Link Copied!\'; var b=this; setTimeout(function(){ b.innerText=\'Share Factsheet\'; }, 2000);">Share Factsheet</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-top:36px; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; box-shadow: var(--shadow-card);">' +
      '<h3 style="font-size:1.25rem; font-weight:700; margin-bottom:6px; color:#0f172a;">Compare ' + esc(tool.name) + ' with Alternatives</h3>' +
      '<table class="comparison-matrix">' +
        '<thead><tr><th>Provider</th><th>Pricing</th><th>Target Audience</th><th>Rating</th><th>Action</th></tr></thead>' +
        '<tbody>' +
          '<tr style="background:#f0f9ff; font-weight:600;">' +
            '<td>' + esc(tool.name) + ' (Viewing)</td><td>' + esc(tool.pricing) + '</td><td>' + esc(tool.bestFor) + '</td><td>★ ' + (tool.rating || 4.5) + '</td><td>Current</td>' +
          '</tr>' +
          competitorRows +
        '</tbody>' +
      '</table>' +
    '</div>';
}

// Click Tracker
function bindOutboundTracking() {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".outbound-track");
    if (btn && window.sessionStorage) {
      var id = btn.getAttribute("data-tool");
      try {
        var clicks = JSON.parse(sessionStorage.getItem("finstack_clicks") || "[]");
        clicks.push({ tool: id, at: new Date().toISOString() });
        sessionStorage.setItem("finstack_clicks", JSON.stringify(clicks));
      } catch (err) {}
    }
  });
}
