/**
 * Indian PIN / state check, same rule and messages as the backend (luxy-backend/src/utils/addressRules.ts), which stays
 * the authority: the forms use it to tell the customer before saving, and checkout to flag an older saved address
 * before payment. Nothing is ever changed for the customer.
 *
 * India Post: every Kerala PIN starts with 67, 68 or 69; that circle also serves Mahé (Puducherry, 6733xx) and
 * Lakshadweep (6825xx). Delivery is priced Kerala vs elsewhere, so only the Kerala boundary is checked.
 */
type Addr = { state?: string; zipCode?: string; country?: string };

const isKerala = (state: string) => /^(kerala|kl)$/i.test(state.trim().replace(/\s+/g, " "));
const inIndia = (country?: string) => !country?.trim() || /^(india|in|bharat)$/i.test(country.trim());

/** "" when consistent, else one sentence telling the customer what to fix. */
export const pinStateProblem = (a: Addr): string => {
  if (!inIndia(a.country)) return "";
  const pin = (a.zipCode ?? "").replace(/\s+/g, "");
  const state = (a.state ?? "").trim();
  if (!/^[1-9]\d{5}$/.test(pin)) return "Enter a valid 6-digit PIN code.";
  const keralaPin = /^6[7-9]/.test(pin);
  if (isKerala(state)) return keralaPin ? "" : `PIN code ${pin} is not a Kerala PIN code (Kerala PIN codes start with 67, 68 or 69). Please check the state or PIN code.`;
  if (keralaPin && !(/^(puducherry|pondicherry)$/i.test(state) && pin.startsWith("6733")) && !(/^lakshadweep$/i.test(state) && pin.startsWith("6825"))) {
    return `PIN code ${pin} is a Kerala PIN code, but the state is "${state}". Please check the state or PIN code.`;
  }
  return "";
};
