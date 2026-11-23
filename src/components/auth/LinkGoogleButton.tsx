"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getAPIURL } from "../../lib/apiClient";

/**
 * Profile: the signed-in owner links Google to their account (POST /auth/google/link). Google sign-in never links a
 * password account by itself any more, so this is the only way to add Google sign-in to an existing account.
 * Renders nothing when Google sign-in is not configured.
 */
const configured = () => {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return !!id && id !== "YOUR_GOOGLE_CLIENT_ID_HERE";
};

type ApiError = { response?: { status?: number; data?: { message?: string } }; code?: string; message?: string };

function LinkGoogleConfigured({ token }: { token: string }) {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  // Loaded only when configured, exactly like GoogleAuthButton (the provider exists only then)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useGoogleLogin } = require("@react-oauth/google");

  useEffect(() => {
    let cancelled = false;
    axios.get(`${getAPIURL()}/users/profile`, { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 })
      .then((r) => { if (!cancelled) setLinked(!!r.data?.data?.googleLinked); })
      .catch(() => { if (!cancelled) setLinked(false); });
    return () => { cancelled = true; };
  }, [token]);

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse: { access_token: string }) => {
      setBusy(true); setMessage(null);
      try {
        // googleId only tells the server it is an access token; the identity is read from Google by the server
        const info = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${tokenResponse.access_token}` }, timeout: 15000 });
        const res = await axios.post(`${getAPIURL()}/auth/google/link`, { credential: tokenResponse.access_token, googleId: info.data?.sub },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 });
        setLinked(!!res.data?.data?.googleLinked);
        setMessage({ text: res.data?.message || "Google account linked.", ok: true });
      } catch (e) {
        const err = e as ApiError;
        console.error("Link Google failed:", err.response?.status, err.message); // never the token
        setMessage({ text: err.response?.data?.message || "Could not link your Google account. Please try again.", ok: false });
      } finally { setBusy(false); }
    },
    onError: () => setMessage({ text: "Google linking was cancelled.", ok: false }),
  });

  if (linked === null) return null;
  return (
    <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white text-sm">
      <p className="font-bold text-slate-900">Google sign-in</p>
      {linked ? (
        <p className="text-slate-600 mt-1">Your Google account is linked. You can sign in with Google or with your password.</p>
      ) : (
        <>
          <p className="text-slate-600 mt-1">Link the Google account for this email to sign in with Google.</p>
          <button type="button" onClick={() => { setMessage(null); login(); }} disabled={busy}
            className="mt-3 px-4 py-2 rounded-lg border-2 border-slate-200 font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60">
            {busy ? "Linking…" : "Link Google account"}
          </button>
        </>
      )}
      {message && <p className={`mt-2 ${message.ok ? "text-green-700" : "text-red-600"}`} role="status">{message.text}</p>}
    </div>
  );
}

export default function LinkGoogleButton({ token }: { token?: string }) {
  if (!token || !configured()) return null;
  return <LinkGoogleConfigured token={token} />;
}
