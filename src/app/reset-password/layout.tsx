import type { Metadata } from "next";

// The page URL carries a one-time reset token: never sent as a Referer, never indexed
export const metadata: Metadata = {
  title: "Reset Password | Luxy Galleria",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
