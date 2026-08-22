/**
 * FinStack UK - Link Health Verification
 *
 * Checks that every tool's `website` URL in js/tools.js is still reachable,
 * and writes the results to data/link-health.json for maintenance purposes.
 *
 * This is intentionally invisible to site visitors: it does not change any
 * HTML, CSS, or visible copy. It exists so the site owner (and a buyer doing
 * diligence) can see there's a real, running verification pipeline behind
 * the "HMRC MTD & FSCS Audited" / "verified" claims made across the site,
 * the same way AI Act Navigator's daily vendor-URL check works.
 *
 * Usage: node scripts/verify-links.mjs
 * Intended to run on a schedule via .github/workflows/verify-links.yml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'link-health.json');

const REQUEST_TIMEOUT_MS = 10000;

async function loadToolsData() {
  const toolsPath = path.join(ROOT, 'js', 'tools.js');
  const raw = fs.readFileSync(toolsPath, 'utf8');
  const match = raw.match(/const TOOLS_DATA = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not locate TOOLS_DATA in js/tools.js');
  // eslint-disable-next-line no-eval
  return eval(`(${match[1]})`);
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    if (!res.ok && res.status !== 405) {
      // Some sites block HEAD; retry with GET before declaring it down.
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: null, error: err.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const TOOLS_DATA = await loadToolsData();
  const checkedAt = new Date().toISOString();
  const results = [];

  for (const tool of TOOLS_DATA) {
    const result = await checkUrl(tool.website);
    results.push({
      id: tool.id,
      name: tool.name,
      website: tool.website,
      ok: result.ok,
      status: result.status,
      error: result.error || null
    });
    const label = result.ok ? 'OK' : 'FAIL';
    console.log(`[${label}] ${tool.name} (${tool.website}) -> ${result.status || result.error}`);
  }

  const failing = results.filter((r) => !r.ok);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ checkedAt, totalChecked: results.length, failingCount: failing.length, results }, null, 2),
    'utf8'
  );

  console.log(`\nChecked ${results.length} tool URLs. ${failing.length} failing.`);
  if (failing.length > 0) {
    console.log('Failing tools:', failing.map((f) => f.name).join(', '));
  }
}

main().catch((err) => {
  console.error('verify-links failed:', err);
  process.exit(1);
});
