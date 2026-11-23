/**
 * Storefront PIN/state rule: same cases (and the same messages) as the backend, which stays the authority.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node","jsx":"react-jsx"}' src/lib/addressRules.test.ts
 */
import assert from 'node:assert';
import path from 'node:path';
import { pinStateProblem } from './addressRules';

const ok = [
  { state: 'Kerala', zipCode: '682001', country: 'India' }, { state: 'kerala', zipCode: '673007' }, { state: 'KL', zipCode: '695001' },
  { state: 'Tamil Nadu', zipCode: '600002' }, { state: 'Delhi', zipCode: '110001', country: '' },
  { state: 'Puducherry', zipCode: '673310' }, { state: 'Pondicherry', zipCode: '673311' }, { state: 'Lakshadweep', zipCode: '682555' },
  { state: 'Kerala', zipCode: '682 001' }, { state: 'Ontario', zipCode: 'K1A0B1', country: 'Canada' },
];
const bad: [object, RegExp][] = [
  [{ state: 'Tamil Nadu', zipCode: '673007' }, /673007 is a Kerala PIN code, but the state is "Tamil Nadu"/],
  [{ state: 'tamilnadu', zipCode: '673007' }, /Kerala PIN code/],
  [{ state: 'Kerala', zipCode: '600002' }, /600002 is not a Kerala PIN code/],
  [{ state: 'Tamil Nadu', zipCode: '673310' }, /Kerala PIN code/], // Mahé PIN, wrong state
  [{ state: 'Kerala', zipCode: '68200' }, /valid 6-digit PIN/], [{ state: 'Kerala', zipCode: '082001' }, /valid 6-digit PIN/],
  [{ state: 'Kerala', zipCode: '68A001' }, /valid 6-digit PIN/], [{ state: 'Kerala', zipCode: '' }, /valid 6-digit PIN/], [{ state: 'Kerala' }, /valid 6-digit PIN/],
];
let checks = 0;
for (const a of ok) { assert.strictEqual(pinStateProblem(a), '', JSON.stringify(a)); checks++; }
for (const [a, re] of bad) { assert.match(pinStateProblem(a), re, JSON.stringify(a)); checks++; }

// Parity with the backend rule (the server refuses exactly what the form warns about), when the backend repo is beside this one
let parity = 'skipped (backend repo not found)';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const backend = require(path.resolve(__dirname, '../../../luxy-backend/src/utils/addressRules')) as { addressProblem: (a: object) => string };
  for (const a of [...ok, ...bad.map(([x]) => x)]) { assert.strictEqual(pinStateProblem(a), backend.addressProblem(a), `parity: ${JSON.stringify(a)}`); checks++; }
  parity = 'identical to the backend';
} catch (e) { if ((e as { code?: string }).code !== 'MODULE_NOT_FOUND') throw e; }

console.log(`✅ PIN / state rule: valid Indian and exception addresses pass, invalid or contradictory ones get the fix-it message; ${parity} (${checks} checks)`);
