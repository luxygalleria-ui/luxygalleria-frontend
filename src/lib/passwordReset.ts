/**
 * Forgot / reset password form rules, the same as the backend's (authController + the registration password rule in
 * luxy-backend/src/middlewares/validation.ts), so the form warns exactly where the server would refuse.
 */
export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** '' when the address looks valid, else the message the server would give. */
export const emailProblem = (email: string): string =>
  EMAIL_FORMAT.test(email.trim()) && email.trim().length <= 254 ? "" : "Please enter a valid email address.";

/** First unmet password rule ('' = strong enough): 8+ characters, upper and lower case, a number and a symbol. */
export const passwordProblem = (password: string): string => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
  return "";
};

/** The whole reset form: the password rule first, then the confirmation. */
export const resetFormProblem = (password: string, confirm: string): string =>
  passwordProblem(password) || (password === confirm ? "" : "The two passwords do not match.");

/** The token from the emailed link, or '' when it is missing or malformed (64 lowercase hex characters). */
export const resetTokenFrom = (value: string | null | undefined): string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value.trim()) ? value.trim() : "";
