/**
 * Forgot / reset password: form rules (and parity with the backend password rule when luxy-backend is beside this repo),
 * plus the wiring the pages must keep: the sign-in link, no-referrer/noindex on the token page, token out of the URL.
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node","jsx":"react-jsx"}' src/lib/passwordReset.test.ts
 */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { emailProblem, passwordProblem, resetFormProblem, resetTokenFrom } from "./passwordReset";

let checks = 0;
const eq = (a: unknown, b: unknown, m: string) => { assert.deepStrictEqual(a, b, m); checks++; };

// Email format (the server answers the same way for every valid address)
for (const ok of ["ann@test.local", " ann@test.local ", "a.b+c@shop.co.in"]) eq(emailProblem(ok), "", ok);
for (const bad of ["", "ann", "a@b", "@x.y", "a b@x.y", `${"a".repeat(250)}@x.yz`]) eq(emailProblem(bad), "Please enter a valid email address.", bad);

// Password rule: every class required, first failing rule reported
const weak: [string, RegExp][] = [["Ab1!", /8 characters/], ["alllowercase1!", /uppercase/], ["ALLUPPERCASE1!", /lowercase/], ["NoNumbers!!", /number/], ["NoSymbols123", /special/], ["", /8 characters/]];
for (const [pw, re] of weak) { assert.match(passwordProblem(pw), re, pw); checks++; }
for (const ok of ["New-Passw0rd#2026", "Aa1!aaaa", "Ünïcødé-Pässw0rd"]) eq(passwordProblem(ok), "", ok);
eq(resetFormProblem("New-Passw0rd#2026", "New-Passw0rd#2026x"), "The two passwords do not match.", "mismatch");
eq(resetFormProblem("weak", "weak"), "Password must be at least 8 characters", "rule before mismatch");
eq(resetFormProblem("New-Passw0rd#2026", "New-Passw0rd#2026"), "", "valid pair");

// Token from the link: exactly 64 lowercase hex characters, else nothing
const t = "a".repeat(32) + "0123456789abcdef".repeat(2);
eq(resetTokenFrom(t), t, "valid token");
for (const bad of [null, undefined, "", "abc", t.toUpperCase(), t + "0", "g".repeat(64)]) eq(resetTokenFrom(bad as string | null | undefined), "", String(bad).slice(0, 8));

// Parity with the backend password rule (the server refuses exactly what the form warns about)
let parity = "skipped (backend repo not found)";
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const backend = require(path.resolve(__dirname, "../../../luxy-backend/src/middlewares/validation"));
  const rule = backend.schemas.register.shape.body.shape.password;
  for (const pw of [...weak.map(([p]) => p), "New-Passw0rd#2026", "Aa1!aaaa", "Ünïcødé-Pässw0rd", "        ", "Aa1!"]) {
    const r = rule.safeParse(pw);
    eq(passwordProblem(pw), r.success ? "" : r.error.issues[0].message, `parity: ${JSON.stringify(pw)}`);
  }
  parity = "identical to the backend";
} catch (e) {
  if (!/Cannot find module/.test(String(e))) throw e;
}

// Page wiring
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
const signIn = read("app/sign-in/page.tsx");
assert.match(signIn, /<Link href="\/forgot-password"[^>]*>\s*Forgot Password\?\s*<\/Link>/); checks++;
assert.ok(!/\{\/\*(?:(?!\*\/)[^])*Forgot Password\?/.test(signIn), "link not inside an unclosed {/* comment */}"); checks++;
const resetLayout = read("app/reset-password/layout.tsx");
assert.match(resetLayout, /referrer: "no-referrer"/); checks++;
assert.match(resetLayout, /index: false/); checks++;
const resetPage = read("app/reset-password/page.tsx");
assert.match(resetPage, /history\.replaceState\(null, "", "\/reset-password"\)/, "token removed from the address bar"); checks++;
assert.match(resetPage, /localStorage\.removeItem\("luxygalleria_user"\)/, "signed out after reset"); checks++;
assert.ok(!/localStorage\.setItem/.test(resetPage), "never signs in automatically"); checks++;
assert.ok(!/console\.(log|info|warn|error)/.test(resetPage + read("app/forgot-password/page.tsx")), "pages log nothing"); checks++;

console.log(`✅ forgot / reset password: rules, token format, page wiring; backend parity ${parity} (${checks} checks)`);
