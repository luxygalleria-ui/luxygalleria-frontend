/** The UAT notice is the exact agreed text (same as the backend's TEST_ORDER_NOTICE). Run: npx tsx src/lib/testPayment.test.ts */
import assert from "assert";
import { TEST_PAYMENT_NOTICE } from "./testPayment";
assert.strictEqual(TEST_PAYMENT_NOTICE, "UAT TEST PAYMENT — NO REAL MONEY WAS RECEIVED. THIS ORDER WILL NOT BE DELIVERED.");
console.log("✅ UAT test payment notice text");
