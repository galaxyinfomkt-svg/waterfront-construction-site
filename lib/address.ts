import { site } from "./site";

// The visible business address, honoring the owner setting site.showStreet (V4.5): when the Google Business
// Profile hides the street (service-area business), every page shows only the town, state and ZIP, matching
// the PostalAddress in lib/schema.ts. Use this instead of printing site.address directly.
export const displayAddress: string = site.showStreet
  ? site.address
  : `${site.locality}, ${site.region} ${site.postalCode}`;
