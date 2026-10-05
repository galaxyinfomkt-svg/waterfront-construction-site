import { site } from "./site";

// Credential wording in ONE place. Massachusetts requires the HIC registration number on every
// advertisement (M.G.L. c.142A §17; 201 CMR 18.00), and HIC is a *registration* (the CSL is the
// owner's *license*). Until site.hic is filled in, nothing here claims a license or a number.
export const hasHic = Boolean(site.hic);
export const hasCsl = Boolean(site.csl);

/** Short trust line, e.g. "MA HIC Reg. #123456 · CSL CS-123456 (Ernando Nunes) · Insured". Empty parts are skipped. */
export function credentialLine(o: { insured?: boolean } = { insured: true }): string {
  return [
    hasHic ? `MA HIC Reg. #${site.hic}` : "",
    hasCsl ? `MA Construction Supervisor License ${site.csl} (${site.owner})` : "",
    o.insured ? "Insured" : "",
  ].filter(Boolean).join(" · ");
}

/** Answer for "Are you licensed and insured?" — truthful with or without the numbers. */
export function licensingAnswer(state: "MA" | "NH" = "MA"): string {
  const reg = hasHic
    ? `Waterfront Construction Inc is a registered Massachusetts Home Improvement Contractor (HIC #${site.hic})`
    : "Waterfront Construction Inc is registered with the Massachusetts Home Improvement Contractor program — ask us for our registration number";
  const csl = hasCsl ? `, and owner ${site.owner} holds Massachusetts Construction Supervisor License ${site.csl}` : "";
  const nh = state === "NH"
    ? " New Hampshire has no statewide contractor license; building permits are issued by each town's building department."
    : "";
  return `${reg}${csl}. We carry insurance and provide a certificate of insurance on request.${nh}`;
}
