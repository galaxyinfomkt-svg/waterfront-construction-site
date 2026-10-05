import { TOWN_GEO } from "./town-geo";

export const site = {
  name: "Waterfront Construction Inc",
  shortName: "Waterfront Construction",
  owner: "Ernando Nunes",
  phone: "(508) 816-2726",
  phoneHref: "tel:+15088162726",
  email: "waterfrontmass@gmail.com",
  emailHref: "mailto:waterfrontmass@gmail.com",
  address: "44 Bearfoot Road, Northborough, MA 01532",
  city: "Northborough, MA",
  hours: "Mon–Sat, 7am–6pm",
  founded: 2017,
  experience: 15, // the owner's years of hands-on construction experience (confirmed by the owner)
  projectsCompleted: 500, // confirmed by the owner
  townsWithProjects: 30, // towns where the company has completed projects (confirmed by the owner)
  instagram: "https://www.instagram.com/waterfrontconstruction/",
  facebook: "https://www.facebook.com/Waterfrontconst/",
  gbp: "https://g.page/r/CTGCYqkGHrecEBM", // Google Business Profile (same token as the review link)
  googleReview: "https://g.page/r/CTGCYqkGHrecEBM/review",
  // Massachusetts law (M.G.L. c.142A §17 / 201 CMR 18.00) requires the HIC registration number on
  // every advertisement, including web pages. Fill these in from the owner's documents — every
  // credential line on the site renders only when its value is set (never a placeholder).
  hic: "", // MA Home Improvement Contractor registration #, e.g. "123456"
  csl: "", // MA Construction Supervisor License # held by the owner, e.g. "CS-123456"
  // ---- added for structured data (08-schema.md §4). Empty / false = not rendered anywhere. ----
  legalName: "", // exact name on the MA Corporations Division record, e.g. "Waterfront Construction Inc." ← OWNER
  hicHolder: "company" as "company" | "owner", // whose name is on the HIC certificate ← OWNER
  hicExpires: "", // ISO date on the HIC card, e.g. "2027-05-31" ← OWNER (optional)
  cslExpires: "", // ISO date on the CSL card ← OWNER (optional)
  street: "44 Bearfoot Road", locality: "Northborough", region: "MA", postalCode: "01532",
  showStreet: true, // false if the GBP is a service-area business with the address hidden ← OWNER
  geo: null as null | { lat: number; lng: number }, // GBP pin, ≥5 decimals, e.g. { lat: 42.33xxx, lng: -71.6xxxx } ← OWNER/GBP
  mapsUrl: "", // verified Maps place URL; decoded candidate: https://maps.google.com/?cid=11292527604615250481 ← VERIFY
  profiles: [] as string[], // other REAL business profiles (Yelp, BBB, Houzz, Angi, Nextdoor, LinkedIn page) ← OWNER
  ownerProfiles: [] as string[], // e.g. "https://www.tiktok.com/@ernandonunes2" if the owner confirms it is his ← OWNER
  ownerPhoto: "", // real headshot path, e.g. "/images/ernando-nunes.webp" ← OWNER (never a stock photo)
  languages: ["English"] as string[], // add "Portuguese"/"Spanish" only if estimates are given in that language ← OWNER
  paymentAccepted: "", // e.g. "Check, bank transfer, credit card" — only if shown on /contact ← OWNER
};

export { nav } from "./nav";
export { services, type Faq, type Service } from "./services";

export type City = { n: string; s?: "NH" };

// Massachusetts service-area towns (MetroWest, Worcester County, Greater Boston, North Shore & South)
const MA_CITIES = [
  "Northborough", "Marlborough", "Westborough", "Shrewsbury", "Worcester", "Southborough",
  "Hopkinton", "Framingham", "Natick", "Hudson", "Grafton", "Holden", "Boylston", "West Boylston",
  "Berlin", "Bolton", "Clinton", "Sterling", "Northbridge", "Upton", "Hopedale", "Milford",
  "Ashland", "Sudbury", "Wayland", "Auburn", "Millbury", "Leicester", "Paxton", "Stow",
  "Maynard", "Acton", "Concord", "Sherborn", "Holliston", "Medway", "Bellingham", "Mendon",
  "Uxbridge", "Sutton", "Oxford", "Charlton", "Spencer", "Rutland", "Princeton", "Lancaster",
  "Harvard", "Littleton", "Boxborough", "Lunenburg", "Leominster", "Fitchburg", "Westminster",
  "Hubbardston", "Barre", "Oakham", "Brookfield", "East Brookfield", "West Brookfield",
  "North Brookfield", "Warren", "Ware", "Sturbridge", "Southbridge", "Dudley", "Webster",
  "Douglas", "Blackstone", "Millville", "Franklin", "Norfolk", "Wrentham", "Walpole", "Medfield",
  "Dover", "Wellesley", "Weston", "Lincoln", "Carlisle", "Westford", "Chelmsford", "Billerica",
  "Bedford", "Burlington", "Waltham", "Watertown", "Newton", "Needham", "Dedham", "Westwood",
  "Whitinsville", "Cherry Valley", "Jefferson", "Rochdale", "Fiskdale", "Baldwinville",
  "Templeton", "Phillipston", "Devens", "Still River",
  "Boston", "Cambridge", "Somerville", "Brookline", "Arlington", "Belmont", "Medford", "Malden",
  "Melrose", "Everett", "Chelsea", "Revere", "Winthrop", "Quincy", "Milton", "Braintree",
  "Weymouth", "Canton", "Randolph", "Stoughton", "Sharon", "Norwood", "Lexington", "Woburn",
  "Winchester", "Stoneham", "Reading", "Wakefield", "Wilmington", "North Reading", "Tewksbury",
  "Lynn", "Lynnfield", "Peabody", "Salem", "Beverly", "Danvers", "Marblehead", "Swampscott",
  "Saugus", "Middleton", "Topsfield", "Hamilton", "Wenham", "Ipswich", "Gloucester", "Rockport",
  "Manchester-by-the-Sea", "Nahant", "Andover", "North Andover", "Haverhill", "Methuen",
  "Lawrence", "Amesbury", "Newburyport", "Georgetown", "Boxford",
  "Mansfield", "Foxborough", "Norton", "Easton", "Attleboro", "North Attleborough", "Plainville",
  "Millis", "Avon", "Holbrook", "Abington", "Rockland", "Brockton", "Raynham", "Taunton",
  "Bridgewater", "Hanover", "Norwell", "Marshfield",
];

// Southern New Hampshire service-area towns
const NH_CITIES = [
  "Salem", "Nashua", "Hudson", "Pelham", "Windham", "Derry", "Londonderry", "Hampstead",
  "Atkinson", "Plaistow", "Kingston", "Danville", "Sandown", "Chester", "Merrimack", "Amherst",
  "Hollis", "Litchfield", "Manchester", "Bedford", "Hooksett",
];

export const allCities: City[] = [
  ...MA_CITIES.map((n) => ({ n }) as City),
  ...NH_CITIES.map((n) => ({ n, s: "NH" }) as City),
];

// Featured / priority markets (shown on Service Areas & About)
const FEATURED = [
  "Northborough", "Marlborough", "Westborough", "Shrewsbury", "Worcester", "Framingham",
  "Natick", "Hudson", "Sudbury", "Wellesley", "Newton", "Needham", "Dedham", "Brookline",
  "Cambridge", "Boston", "Quincy", "Milton", "Norwood", "Walpole", "Mansfield", "Foxborough",
  "Attleboro", "Franklin", "Milford", "Lynnfield", "Peabody", "Beverly", "Danvers", "Andover",
  "Lexington", "Burlington", "Woburn", "Reading",
];
const FEATURED_NH = ["Salem", "Nashua", "Derry", "Windham", "Londonderry"];
export const cities: City[] = [
  ...FEATURED.map((n) => ({ n }) as City),
  ...FEATURED_NH.map((n) => ({ n, s: "NH" }) as City),
];

export const citySlug = (c: City) =>
  c.n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + (c.s === "NH" ? "-nh" : "");
export const cityLabel = (c: City) => `${c.n}, ${c.s ?? "MA"}`;
export const cityStateFull = (c: City) => (c.s === "NH" ? "New Hampshire" : "Massachusetts");

// ONE statement of the service area, used everywhere (copy, schema, llms.txt, OG, manifest).
// Counties are computed from the actual town list so they can never drift from the town pages.
const countyCount = allCities.reduce<Record<string, number>>((m, c) => {
  const k = `${TOWN_GEO[citySlug(c)][0]} County, ${c.s === "NH" ? "New Hampshire" : "Massachusetts"}`;
  m[k] = (m[k] || 0) + 1;
  return m;
}, {});
export const serviceArea = {
  short: "Central & Eastern Massachusetts and southern New Hampshire",
  regions: "Worcester County, MetroWest, Greater Boston, the North Shore, the South Shore & Bristol County, and southern New Hampshire",
  base: "Northborough, MA (Worcester County)",
  // [county, number of served towns], largest first
  counties: Object.entries(countyCount).sort((a, b) => b[1] - a[1]) as [string, number][],
};

export const stats = [
  { value: `${site.experience}+`, label: "Years of hands-on experience" },
  { value: `${site.projectsCompleted}+`, label: "Projects completed" },
  { value: `${site.townsWithProjects}+`, label: "Towns with completed projects" },
  { value: String(site.founded), label: "Founded in Northborough, MA" },
];

// Real client testimonials, shared verbatim by the home page and /reviews (confirmed real and
// published with permission by the owner). Never mark these up as Review/AggregateRating.
export const testimonials = [
  { name: "Karen M.", town: "Shrewsbury, MA", date: "May 2026", text: "Ernando's crew remodeled our kitchen and a bathroom. Clean, on schedule, and the finish work is flawless. We get compliments constantly." },
  { name: "Dave R.", town: "Westborough, MA", date: "Apr 2026", text: "New siding and windows completely transformed the house. Professional from the estimate to the final walkthrough — highly recommend." },
  { name: "Priya S.", town: "Northborough, MA", date: "Apr 2026", text: "They built our deck and a small addition. Great communication the whole way. Exactly what you want in a contractor." },
  { name: "Tom & Lisa B.", town: "Marlborough, MA", date: "Mar 2026", text: "Full first-floor remodel. The team treated our home like their own and the quality is outstanding. Worth every penny." },
  { name: "Rafael C.", town: "Hudson, MA", date: "Feb 2026", text: "Honest pricing and no surprises. Our bathroom looks like it belongs in a magazine. Will definitely hire again." },
  { name: "Susan D.", town: "Framingham, MA", date: "Jan 2026", text: "From the first phone call they were responsive and professional. The kitchen came out beautiful and on budget." },
];
