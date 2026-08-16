# FinStack UK — Production UK SME FinTech Directory & Recommendation Engine

FinStack.uk is a zero-OPEX, production-grade fintech discovery platform and decision engine built for UK sole traders, startups, and Limited Companies.

---

## ⚡ Key Highlights
- **Zero Operating Costs:** Runs perpetually on Vercel Edge with zero database overhead.
- **Audited Dataset:** 40+ verified UK SME tools across 8 key financial categories.
- **Interactive Finder:** Dynamic 3-step decision scoring algorithm (`finder.html`).
- **Turnkey Monetisation:** Built-in affiliate link router and featured listing support.

---

## 🛠️ Quickstart Guide

### 1. Local Development
No build tools, npm packages, or bundlers needed. Simply open `index.html` directly in any web browser or use a live server extension in VS Code.

### 2. Connecting a Custom Domain on Vercel
1. Go to your **Vercel Dashboard** → Select **FinStack UK**.
2. Navigate to **Settings** → **Domains**.
3. Enter your custom domain (e.g., `finstack.co.uk`) and add the provided CNAME/A records in your DNS manager.

---

## 💰 Monetisation Configuration

### How to Add / Swap Affiliate Links
Open `js/tools.js` and edit the `AFFILIATE_CONFIG` object at the top:

```javascript
const AFFILIATE_CONFIG = {
  globalTrackingParam: "ref=finstack",
  customLinks: {
    "tide": "[https://tide.co/?ref=YOUR_AFFILIATE_ID](https://tide.co/?ref=YOUR_AFFILIATE_ID)",
    "revolut-business": "[https://revolut.com/business/?ref=YOUR_AFFILIATE_ID](https://revolut.com/business/?ref=YOUR_AFFILIATE_ID)",
    "wise-business": "[https://wise.com/?ref=YOUR_AFFILIATE_ID](https://wise.com/?ref=YOUR_AFFILIATE_ID)"
  }
};
