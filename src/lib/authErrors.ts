/** Short, user-facing message for a failed sign-in / sign-up / Google request (axios error shape). */
export function authErrorMessage(err: unknown, mode: "signin" | "register" | "google" = "signin"): string {
  const e = err as { code?: string; response?: { status?: number; data?: { message?: string } } };
  const status = e?.response?.status;
  const serverMsg = e?.response?.data?.message?.trim() || "";
  const m = serverMsg.toLowerCase();

  if (!e?.response) {
    return e?.code === "ECONNABORTED"
      ? "The server took too long to respond. Please try again."
      : "Could not reach the server. Please check your connection and try again.";
  }
  if (/already (registered|exists)|in use/.test(m)) return "An account with this email already exists. Please sign in.";
  if (/weak|password must|password should|stronger/.test(m)) return "Password is too weak. Please use a stronger password.";
  if (/incorrect password|wrong password/.test(m)) return "Incorrect password. Please try again.";
  if (/no account|user not found|not registered/.test(m)) return "No account found with this email.";
  if (/valid email(?! or password)/.test(m)) return "Please enter a valid email address.";
  if (status === 401) return `Authentication failed (401): ${serverMsg || "Invalid credentials or session expired."}`;
  if (status === 429) return serverMsg || "Too many attempts. Please wait a few minutes and try again.";
  if (status === 409 && mode === "register") return "An account with this email already exists. Please sign in.";
  return serverMsg || (mode === "register" ? "Registration failed. Please try again." : "Something went wrong. Please try again.");
}
