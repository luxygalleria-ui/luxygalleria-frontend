/**
 * API URL resolution: NEXT_PUBLIC_API_URL wins everywhere (localhost included); the local default only when unset.
 * Uses fake URLs only; never reads or prints the real environment's values.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node","jsx":"react-jsx"}' src/lib/apiClient.test.ts
 */
import assert from 'node:assert';

const saved = process.env.NEXT_PUBLIC_API_URL;
const g = globalThis as { window?: { location: { hostname: string } } };
const setEnv = (v: string | undefined) => { if (v === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = v; };
const asPage = (hostname: string | null) => { if (hostname === null) delete g.window; else g.window = { location: { hostname } }; };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAPIURL, getBaseURL } = require('./apiClient');

let passed = 0;
const check = (label: string, env: string | undefined, host: string | null, api: string, base: string) => {
  setEnv(env); asPage(host);
  assert.strictEqual(getAPIURL(), api, `${label}: getAPIURL`);
  assert.strictEqual(getBaseURL(), base, `${label}: getBaseURL`);
  assert.ok(!/\/api\/v1\/api(\/|$)/i.test(getAPIURL()), `${label}: duplicate /api/v1`);
  passed++;
};

try {
  // Not configured: safe local fallback, wherever the page runs
  check('unset, server render', undefined, null, 'http://localhost:5000/api/v1', 'http://localhost:5000');
  check('unset, browser on localhost', undefined, 'localhost', 'http://localhost:5000/api/v1', 'http://localhost:5000');
  check('blank (spaces) counts as unset', '   ', 'localhost', 'http://localhost:5000/api/v1', 'http://localhost:5000');

  // Configured on localhost: must be honoured (the bug: it was ignored and :5000 used)
  check('configured, browser on localhost', 'http://localhost:5055/api/v1', 'localhost', 'http://localhost:5055/api/v1', 'http://localhost:5055');
  check('configured, browser on 127.0.0.1', 'http://localhost:5055/api/v1', '127.0.0.1', 'http://localhost:5055/api/v1', 'http://localhost:5055');
  check('configured, server render on localhost', 'http://localhost:5055/api/v1', null, 'http://localhost:5055/api/v1', 'http://localhost:5055');

  // Production
  check('production API on the production site', 'https://api.shop.example/api/v1', 'shop.example', 'https://api.shop.example/api/v1', 'https://api.shop.example');
  check('production, server render', 'https://api.shop.example/api/v1', null, 'https://api.shop.example/api/v1', 'https://api.shop.example');

  // Any spelling of the configured value joins to exactly one /api/v1
  for (const v of ['https://api.shop.example', 'https://api.shop.example/', 'https://api.shop.example/api', 'https://api.shop.example/api/',
    'https://api.shop.example/api/v1/', 'https://api.shop.example/API/V1', ' https://api.shop.example/api/v1 ', 'https://api.shop.example/api/v1//']) {
    check(`spelling ${JSON.stringify(v)}`, v, 'shop.example', 'https://api.shop.example/api/v1', 'https://api.shop.example');
  }
  // A mount path or "api" inside a word is kept (the old .replace('/api', '') mangled these)
  check('mount path', 'https://shop.example/backend/api/v1', 'shop.example', 'https://shop.example/backend/api/v1', 'https://shop.example/backend');
  check('"api" inside a path segment', 'https://shop.example/apiserver/api/v1', 'shop.example', 'https://shop.example/apiserver/api/v1', 'https://shop.example/apiserver');
  check('"api" in the hostname', 'https://api.shop.example', 'localhost', 'https://api.shop.example/api/v1', 'https://api.shop.example');

  console.log(`✅ API URL resolution: configured URL wins everywhere, local default only when unset, one /api/v1 (${passed} checks)`);
} finally {
  setEnv(saved); asPage(null);
}
