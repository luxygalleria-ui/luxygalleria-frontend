// Self-check for the filter query-string logic. Run: node src/components/products/filterParams.check.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync(new URL("./ProductCatalog.tsx", import.meta.url), "utf8");
const fn = src.slice(src.indexOf("export function buildFilterParams"));
const body = fn.slice(0, fn.indexOf("\n}\n") + 3);
const { buildFilterParams } = await import(
  "data:text/javascript," +
  encodeURIComponent(ts.transpileModule(body, { compilerOptions: { target: "es2022" } }).outputText)
);

const q = (p) => p.toString();

// Clearing a chip drops the param (and resets to page 1).
assert.equal(q(buildFilterParams("brand=almarai&page=3", { brand: "all" })), "page=1");
assert.equal(q(buildFilterParams("search=choco&page=1", { search: "" })), "page=1");

// Price chip removal must delete both bounds, not write defaults back.
assert.equal(
  q(buildFilterParams("minPrice=243&maxPrice=757&page=1", { minPrice: null, maxPrice: null })),
  "page=1"
);

// 0 is a legitimate lower bound and must survive.
assert.equal(
  q(buildFilterParams("page=1", { minPrice: 0, maxPrice: 757 })),
  "page=1&minPrice=0&maxPrice=757"
);

// Paging explicitly does not reset the page.
assert.equal(q(buildFilterParams("brand=almarai&page=1", { page: 4 })), "brand=almarai&page=4");

// Any other filter change resets pagination.
assert.equal(q(buildFilterParams("page=7", { category: "snacks" })), "page=1&category=snacks");

console.log("filterParams: all checks passed");
