# FinStack UK — Production UK SME FinTech Directory & Recommendation Engine

[![Live Demo](https://img.shields.io/badge/Live_Site-finstack--uk.vercel.app-0284c7?style=flat-square&logo=vercel)](https://finstack-uk.vercel.app/)
[![Maintenance OPEX](https://img.shields.io/badge/OPEX-%240%2Fmonth-10b981?style=flat-square)](https://finstack-uk.vercel.app/)
[![Audited Tools](https://img.shields.io/badge/Audited_Tools-41_Verified-6366f1?style=flat-square)](https://finstack-uk.vercel.app/tools.html)
[![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_CSS3_%7C_ES6%2B_JS-f59e0b?style=flat-square)](https://finstack-uk.vercel.app/)

FinStack UK is a production-ready, zero-OPEX fintech discovery directory and interactive recommendation engine built specifically for UK sole traders, startups, and Limited Companies navigating British regulatory and banking rails (HMRC Making Tax Digital, FSCS protection, CIS deductions, payments, and RTI payroll).

---

## ⚡ Key Acquisition Highlights

* **$0/month Perpetual OPEX:** Operates fully client-side on Vercel Edge with zero server maintenance, node build overhead, or database subscription costs.
* **41 Curated UK B2B Tools:** Categorized across 8 financial verticals (Business Banking, Accounting/MTD, Invoicing, Corporate Cards, Payroll, Payment Gateways, Expense Management, and FX/Cross-Border) with verified Trustpilot UK and G2 audit points.
* **Dynamic Decision Engine:** 3-step recommendation scoring algorithm (`finder.html`) that calculates weighted match percentages in real time.
* **Turnkey Dual Monetisation:** Features a centralized 1-click affiliate router alongside a built-in `featured: true` sponsorship badging system.
* **SEO & Indexing Infrastructure:** Validated dual `@graph` schema markup (`WebSite` + `FAQPage` JSON-LD), dedicated `sitemap.xml`, `robots.txt`, and high-DPI Open Graph previews.

---

## 🛠️ Quickstart & Deployment Guide

### 1. Local Development
No build tools, compilation steps, or `npm install` requirements:
```bash
git clone [https://github.com/YOUR_USERNAME/finstack-uk.git](https://github.com/YOUR_USERNAME/finstack-uk.git)
cd finstack-uk

```

Open `index.html` directly in any standard browser or run with VS Code Live Server.

### 2. Custom Domain Configuration (Vercel)

1. Open your **Vercel Dashboard** → Select **finstack-uk**.
2. Navigate to **Settings** → **Domains** and input your domain (e.g., `finstack.co.uk` or `finstack.uk`).
3. Add the corresponding DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare):
* **Apex Domain (`example.co.uk`):** `A` Record `@` pointing to `76.76.21.21`
* **Subdomain (`www.example.co.uk`):** `CNAME` Record `www` pointing to `cname.vercel-dns.com`


4. SSL certificates are provisioned automatically by Vercel upon DNS verification.

---

## 💰 Monetisation & Listing Configuration

### 1. Global Affiliate & Referral Router

Outbound links route through the centralized `AFFILIATE_CONFIG` object located at the top of `js/tools.js`:

```javascript
const AFFILIATE_CONFIG = {
  // Fallback parameter appended to standard external links
  defaultParam: "ref=finstack",
  
  // Custom direct affiliate / CPA network tracking links
  customLinks: {
    "tide": "[https://www.tide.co/?ref=YOUR_AFFILIATE_ID](https://www.tide.co/?ref=YOUR_AFFILIATE_ID)",
    "revolut-business": "[https://www.revolut.com/business/?ref=YOUR_AFFILIATE_ID](https://www.revolut.com/business/?ref=YOUR_AFFILIATE_ID)",
    "wise-business": "[https://wise.com/business/?ref=YOUR_AFFILIATE_ID](https://wise.com/business/?ref=YOUR_AFFILIATE_ID)"
  }
};

```

### 2. Paid "Featured Partner" Badging

To pin a sponsor to top positions across categories and activate the **Featured Partner** tag, set `featured: true` on any tool entry in `js/tools.js`:

```javascript
{
  id: "tide",
  name: "Tide",
  featured: true,
  category: "Business Banking",
  // ... tool specifications
}

```

---

## 📂 Architecture & File Mapping

```text
├── index.html            # Homepage, category navigation & trust badges
├── tools.html            # Searchable 41-tool directory with live multi-attribute filters
├── finder.html           # Interactive 3-step decision engine
├── tool.html             # Dynamic tool factsheet with competitor comparison matrices
├── for-providers.html    # B2B listing submission portal for fintech founders
├── methodology.html      # Review scoring criteria and verification policy
├── about.html            # Platform overview and editorial guidelines
├── privacy.html          # UK GDPR compliance document
├── terms.html            # Standard terms of service
├── sitemap.xml           # XML sitemap for search crawlers
├── robots.txt            # Search engine crawl directives
├── js/
│   ├── tools.js          # Decoupled data store, taxonomy & affiliate config
│   └── app.js            # Client-side filtering, search & DOM rendering
└── css/
    └── style.css         # Responsive mobile-first CSS design system

```

---

## 📄 Handover & Transfer Details

* Full intellectual property, codebase, and complete rights are transferred upon transaction completion.
* Simple 1-click GitHub repository transfer to the buyer's GitHub profile.

```

```
