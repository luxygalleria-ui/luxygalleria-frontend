/**
 * Run: npx ts-node --transpile-only -O '{"module":"commonjs","moduleResolution":"node"}' src/lib/authErrors.test.ts
 */
import assert from "node:assert";
import { authErrorMessage } from "./authErrors";

const r = (status: number, message?: string) => ({ response: { status, data: { message } } });

assert.strictEqual(authErrorMessage(r(401, "Invalid email or password")), "Authentication failed (401): Invalid email or password");
assert.strictEqual(authErrorMessage(r(401)), "Authentication failed (401): Invalid credentials or session expired.");
assert.strictEqual(authErrorMessage(r(401, "Invalid Google token"), "google"), "Authentication failed (401): Invalid Google token");
assert.strictEqual(authErrorMessage(r(400, "Email is already registered"), "register"), "An account with this email already exists. Please sign in.");
assert.strictEqual(authErrorMessage(r(409), "register"), "An account with this email already exists. Please sign in.");
assert.strictEqual(authErrorMessage(r(422, "Password must contain at least one number"), "register"), "Password is too weak. Please use a stronger password.");
assert.strictEqual(authErrorMessage(r(401, "Incorrect password")), "Incorrect password. Please try again.");
assert.strictEqual(authErrorMessage(r(404, "User not found")), "No account found with this email.");
assert.strictEqual(authErrorMessage(r(400, "Please provide a valid email")), "Please enter a valid email address.");
assert.strictEqual(authErrorMessage(r(403, "Your account has been deactivated")), "Your account has been deactivated");
assert.strictEqual(authErrorMessage({}), "Could not reach the server. Please check your connection and try again.");
console.log("authErrors: ok");
