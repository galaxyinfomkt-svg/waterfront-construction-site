# Waterfront Construction website

The marketing site of **Waterfront Construction Inc**, an owner-led home remodeling contractor based in
Northborough, Massachusetts: <https://waterfrontconstructionma.com>.

- **Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript.
- **Output:** fully static. Every page, sitemap, `robots.txt` and `llms.txt` is prerendered at build time.
- **Hosting:** Vercel. `www.waterfrontconstructionma.com` and the `waterfrontconstructionusa.com` domains
  redirect to the apex domain, which is the only canonical host.

> **Next.js 16 is not the Next.js you may know.** APIs and conventions changed (for example, `params` is a
> Promise and `next/image` uses `preload` instead of `priority`). Read the guide for the API you are touching
> in `node_modules/next/dist/docs/` before writing code. See `AGENTS.md`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also type-checks)
npm start        # serve the production build
```

Node.js 20 or newer.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server. |
| `npm run build` | Production build. Never run two builds at once in the same folder: they share `.next/`. |
| `npm start` | Serves the last production build. |
| `npm run lint` | ESLint. |
| `npm run og` | `node scripts/build-og.mjs`: rebuilds the 1200×630 social cards in `public/og/` (and `public/og.jpg`) from **real project photos only**. Run it after adding or changing a photo that a card uses. |
| `npm run check` | Run **after** `npm run build`. Three gates on the built HTML in `.next/server/app`; each exits 1 on failure. |
| `npm run check:schema` | `scripts/check-jsonld.mjs`: one valid JSON-LD graph per indexable page, none on noindex pages; no Review, AggregateRating or HowTo markup; every `@id` reference resolves; FAQ text matches the visible text; dates carry a time zone; no Massachusetts-only claims on New Hampshire pages. |
| `npm run check:towns` | `scripts/check-town-pages.mjs`: the 1,188 service×town pages stay unique (5-gram similarity), keep enough internal links, and never bring back the banned per-town claims. |
| `npm run check:claims` | `scripts/check-claims.mjs`: fails if any page, JSON-LD block, sitemap or `llms.txt` contains a banned or unprovable claim (for example "licensed" before the HIC number is set, "5-star reputation", "200+ towns"). |
| `node scripts/indexnow.mjs` | Tells Bing (and, through Bing, ChatGPT search and Copilot) which URLs changed. Run it by hand **after** a production deploy, never during a build. See [IndexNow](#indexnow). |

## Environment variables

Set them in Vercel → Project → Settings → Environment Variables (Production). `NEXT_PUBLIC_*` values are
baked in at build time, so **redeploy** after changing one. Every one is optional: when it is empty, the
matching tag or script is simply not rendered.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID (`G-…`). Loads GA, tracks phone, email and estimate clicks, and fires `generate_lead` on `/thank-you`. The privacy policy mentions GA only when this is set. |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID. Loads Clarity after the page is idle. The privacy policy mentions Clarity only when this is set. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console HTML-tag token (`google-site-verification`). Not needed if the site is verified as a **Domain** property through DNS, which is the better option (it covers www, http and the `.usa` domains too). |
| `NEXT_PUBLIC_BING_VERIFICATION` | Bing Webmaster Tools token (`msvalidate.01`). Not needed if the site is imported into Bing from Search Console. |
| `INDEXNOW_KEY` | Only for `scripts/indexnow.mjs`, and only if you rotate the key without keeping the file in `public/` (see [IndexNow](#indexnow)). Not used by the site. |

## Where things live

| Path | What it holds |
|---|---|
| `lib/site.ts` | **The single source of business facts**: name, phone, address, hours, owner, founding year, confirmed stats, testimonials, the town list and the service-area wording. Owner-supplied fields (HIC and CSL numbers, Maps URL, photos, profiles) render only once they are filled in. |
| `lib/credentials.ts` | All credential wording (`credentialLine()`, `licensingAnswer()`). Nothing says "licensed" until `site.hic` is set. |
| `lib/services.ts`, `lib/service-content.ts` | The six services: shared data, then the hub-only content (tables, Cost vs. Value benchmarks, permits, FAQs, sources). |
| `lib/towns.ts`, `lib/town-geo.ts`, `lib/town-copy.ts`, `lib/local-rules.ts` | Computed town facts (county, straight-line miles, nearest towns), the copy of the 1,188 service×town pages and the state rules they cite. Geodata: GeoNames postal codes (CC BY 4.0). |
| `lib/projects.ts`, `lib/media-facts.ts`, `lib/media-manifest.json` | Case studies (town level only), video facts and image sizes. |
| `lib/posts.ts` | Blog guides, with sourced figures and real publication dates. |
| `lib/faq.ts` | The pre-hire questions on `/faq` (and the home and contact pages). |
| `lib/seo.ts`, `lib/schema.ts` | Page metadata (`pageMeta`) and the JSON-LD graph builders (one `@graph` per indexable page). |
| `lib/redirects.ts` | Every permanent (308) redirect, imported by `next.config.ts`. Keep old URLs pointing at their current page in one hop. |
| `components/LeadForm.tsx` | The GoHighLevel (LeadConnector) estimate form, **exactly as GHL provides it**. Do not edit it; wrap or move it instead. |
| `app/sitemap/`, `app/sitemap.xml/`, `app/robots.ts`, `app/llms.txt/`, `app/llms-full.txt/` | Sitemaps, robots.txt and the AI-tool summaries (below). |

## Content rules (read before editing copy)

Massachusetts treats web pages as advertising (M.G.L. c.142A §17, 201 CMR 18.00), and Google fact-checks
text, alt text and structured data. Every sentence, caption, meta description and JSON-LD value must be true,
and structured data must also be visible on the page.

- **No "licensed", "licensed & insured" or "fully licensed"** anywhere until `site.hic` holds the real
  registration number. "Insured" and "owner-led" are fine.
- **"15+ years" is the owner's experience**; the company was founded in 2017. The other confirmed numbers are
  500+ projects completed and 30+ towns with completed projects. Never write "100+", "150+" or "200+ towns".
- **Testimonials** (`lib/site.ts`) are real and shared with permission: quote them verbatim, never show star
  ratings, and never add Review or AggregateRating markup.
- **Photos:** `public/images/*.jpg` are stock photos, not our work. Use them only as decoration (`alt=""`),
  never in galleries, social cards, sitemaps or JSON-LD. Real job photos live in `public/images/projects/`,
  and every caption names only the town where the photo was taken. No client street addresses.
- **New Hampshire pages** never cite Massachusetts-only rules (HIC, Guaranty Fund, 780 CMR, the MA lead-safe
  license). New Hampshire has no statewide contractor license; permits come from each town.
- **Dates are real:** a publication date is the first git commit of that content; "Updated" dates change only
  with a substantive edit (see [Sitemaps](#sitemaps)).
- **Costs:** only cited figures (Remodeling *Cost vs. Value*, New England, with its credit line). Every place
  that uses them is marked `// verify against jlconline before next update`. No company price ranges until
  the owner supplies real ones from invoices.
- Plain US English; no hype words.

## Technical SEO and AI-search plumbing

### Sitemaps

| URL | Contents |
|---|---|
| `/sitemap.xml` | **Sitemap index.** Submit this one URL in Google Search Console and Bing Webmaster Tools. |
| `/sitemap/pages.xml` | Every indexable page except the town pages: home, services and hubs, service areas, projects, blog, FAQ, about, owner profile, reviews, contact, privacy, terms. |
| `/sitemap/towns-{service}.xml` | The 198 town pages of one service (six files), so Search Console shows indexed/submitted counts per service. |

The code is in `app/sitemap/entries.ts` (data and XML) with two thin routes, `app/sitemap.xml/route.ts` and
`app/sitemap/[id]/route.ts`. It does not use Next's `app/sitemap.ts` convention, because Next never writes a
sitemap index and Turbopack rejects `app/sitemap.ts` next to an `app/sitemap.xml` route.

- Only canonical, indexable URLs are listed (`/thank-you` is noindex and left out; renamed project slugs are
  listed under their new URL only).
- `<lastmod>` is the date of the last **substantive** change (main content, structured data or links), taken
  from the same value as the page's visible "Updated" date and its JSON-LD `dateModified`. Google uses
  `lastmod` only when it is consistently accurate, so never stamp pages with the build date and never bump a
  date for a header or footer tweak. A date in the future is clamped to the build time, with a warning.
- No `<changefreq>` or `<priority>`: Google ignores both.
- Image entries list only the company's own photos shown on that page; a town page lists a photo only when it
  was taken in that town. Case-study videos get `<video:video>` entries from their visible titles and
  descriptions.

**Where each date lives — change it there, and only for a substantive edit:**

| Pages | Date field |
|---|---|
| Service hubs, `/services` | `updated` on each service in `lib/services.ts` |
| Service×town pages | `TOWN_PAGES_UPDATED` in `lib/towns.ts` |
| Case studies, `/gallery` | `updated` on each project in `lib/projects.ts` (`PROJECTS_UPDATED`) |
| Blog posts, `/blog` | `published` / `modified` on each post in `lib/posts.ts` |
| Home, about, owner profile, FAQ, reviews, contact, service areas, privacy, terms | `SITE_PAGES_UPDATED` in `app/sitemap/entries.ts`. `/faq`, `/about/ernando-nunes`, `/privacy` and `/terms` also show a visible date from a constant in their own page file: keep the two in step, and give a page its own value in `entries.ts` when only that page changes. |

### robots.txt

`app/robots.ts` allows every crawler, including the AI search and assistant bots (OAI-SearchBot, ChatGPT-User,
PerplexityBot, Claude-SearchBot, Google-Extended and others), and lists the sitemap index and each child
sitemap. Under RFC 9309 a bot obeys only the group that names it, so all groups share one rule object: if you
ever add a `Disallow`, add it to that shared `RULE`, never to one group. Never disallow a noindex page:
crawlers must fetch it to see the noindex.

### llms.txt and llms-full.txt

`/llms.txt` is a short, link-first map of the site for AI tools (<https://llmstxt.org>): the entity summary,
key facts, the service area by county with every town, the services, case studies, guides, FAQ links and a
"Last updated" date. `/llms-full.txt` is the long form: the text of the hubs, the FAQ, the case studies and
the guides in one file (about 90 KB). Both are generated from the same data as the pages, so they cannot
drift; credentials appear only once their numbers are set. They are a convenience for AI tools, not a ranking
factor. If you change a business fact in `lib/site.ts`, also bump `LLMS_FACTS_UPDATED` in
`app/llms.txt/content.ts`.

### Response headers

Set in `next.config.ts`:

- On every response: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
  (the browser default, so GA referral data is unchanged) and `Permissions-Policy` turning off camera,
  microphone, geolocation and the Topics API. `X-Powered-By` is removed.
- `X-Robots-Tag: noindex` on any `*.vercel.app` host (the production alias and preview deployments), so only
  the custom domain can be indexed, and on the IndexNow key file.
- Browser caching: 30 days for `/images/*` and `/videos/*`, 1 day for the social cards in `/og/*` and
  `/og.jpg`. **Give a changed photo or video a new file name**, or returning visitors keep the old one.
- Deliberately **not** set: `Content-Security-Policy` and `X-Frame-Options`. The GHL form iframe and chat
  widget, GA and Clarity load third-party code; a CSP must first run as `Content-Security-Policy-Report-Only`
  and be checked against all of them. Vercel already sends HSTS. If a future GHL widget feature needs the
  camera or microphone, remove it from `Permissions-Policy`.

### IndexNow

IndexNow tells Bing, Yandex, Seznam and Naver that URLs changed. Bing's index feeds ChatGPT search and
Copilot, so this is the fast path for those answers. Google does not use IndexNow; it relies on the sitemap
and Search Console.

- **Key:** `public/18074424578884eb2189d968011f8d0c.txt`, served at
  `https://waterfrontconstructionma.com/18074424578884eb2189d968011f8d0c.txt`. The file contains only the key.
  Do not rename or delete it. To rotate the key, replace the file with a new `<32 hex>.txt` that contains its
  own name, deploy, then submit again.
- **After a deploy is live** (the script refuses to run inside a build, and checks that the key file is live
  before sending anything):

```bash
node scripts/indexnow.mjs --since=2026-10-05      # URLs whose <lastmod> is on or after that date
node scripts/indexnow.mjs --all                   # every URL (once, after a big rewrite)
node scripts/indexnow.mjs /faq /services/decks    # specific pages
node scripts/indexnow.mjs --all --dry-run         # list what would be sent, send nothing
node scripts/indexnow.mjs --all --dry-run --sitemap=http://localhost:3000/sitemap.xml   # test against `npm start`
```

A `200` or `202` response means the URLs were accepted. `403` means the key file was not found or does not
match; `422` means a URL is not on this host. Submitted URLs show in Bing Webmaster Tools → IndexNow.

### Release checklist

After every production deploy:

1. `npm run build && npm run check` passed before the deploy.
2. Spot-check `https://waterfrontconstructionma.com/sitemap.xml`, `/robots.txt` and `/llms.txt` (200, current dates).
3. `node scripts/indexnow.mjs --since=<date of the first change in this release>`.

Once, after the 2026 SEO overhaul ships:

1. `node scripts/indexnow.mjs --all`.
2. Search Console: submit `https://waterfrontconstructionma.com/sitemap.xml` (replace any older sitemap
   submission), then watch Pages → indexed per child sitemap, especially the six `towns-*` files.
3. Bing Webmaster Tools: verify the site (import from Search Console, or set `NEXT_PUBLIC_BING_VERIFICATION`),
   submit the same sitemap, check IndexNow → submitted URLs.
4. Rich Results Test and validator.schema.org on `/`, a blog guide, a case study with video and
   `/services/decks/salem-nh`: 0 errors expected.
5. From a machine outside Vercel, check that AI and search bots get a 200:

```bash
for ua in "OAI-SearchBot/1.3" "ChatGPT-User/1.0" "PerplexityBot/1.0" "Claude-SearchBot/1.0" "bingbot/2.0" "Googlebot/2.1" "Applebot/0.1"; do
  curl -s -o /dev/null -w "%{http_code} $ua\n" -A "Mozilla/5.0 (compatible; $ua)" https://waterfrontconstructionma.com/services/siding; done
```

### Measuring AI search visibility

- **GA4:** add a custom channel group "AI assistants", placed above Referral, with source matching
  `(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai|you\.com)$`.
  Also treat `utm_source=chatgpt.com` as AI.
- **Search Console:** the Generative AI performance report, if the property has it. Confirm that no AI-features
  opt-out setting is turned on.
- **Bing Webmaster Tools:** AI Performance (citations, cited URLs, grounding queries), monthly.
- **Vercel logs:** monthly hits and status codes from OAI-SearchBot, ChatGPT-User, PerplexityBot,
  Claude-SearchBot, bingbot and Googlebot.
- **Monthly prompt panel:** ask ChatGPT, Perplexity, Google AI Mode, Gemini, Copilot and Claude the same
  prompts (logged out, location set to Northborough, MA where possible) and record whether the company is
  mentioned, the cited URL, its position, the competitors named, and any wrong facts. Prompts: "best remodeling
  contractor near Northborough MA", "kitchen remodel cost Massachusetts 2026", "who builds home additions in
  Needham MA", "siding contractor Worcester County", "deck builder Salem NH", "is Waterfront Construction in
  Northborough MA licensed", "who owns Waterfront Construction Northborough", "Waterfront Construction Inc
  reviews", "does Waterfront Construction work in New Hampshire", "what is Waterfront Construction", plus the
  towns with documented work (Shrewsbury, Westborough, Hudson, Lynnfield, Mansfield, Marlborough).

## Owner to-do list

Each item unlocks content that is written but hidden until the fact is supplied. Fields are in `lib/site.ts`
unless noted.

**Credentials and legal**

- [ ] Massachusetts **HIC registration number** → `site.hic` (plus `hicHolder` and `hicExpires`). Required by
      law on every advertisement, including this website; it also unlocks every "registered" line and the
      JSON-LD credential.
- [ ] **Construction Supervisor License** number held by Ernando Nunes → `site.csl` (plus `cslExpires`).
- [ ] Exact legal name on the Massachusetts corporations record → `site.legalName`.
- [ ] Certificate of insurance on file (the site says "insured" and "certificate of insurance on request").
- [ ] Lead-safe credentials actually held (Massachusetts Lead-Safe Renovation Contractor license, EPA RRP firm
      certificate), if any. The site states the rules but claims no lead-safe credential until confirmed.
- [ ] Keep the written permission for each published testimonial on file, and confirm each one's wording and
      the services it covers.

**Google Business Profile and listings**

- [ ] Open <https://maps.google.com/?cid=11292527604615250481> and confirm it is the Waterfront Construction
      Inc listing; then set `site.mapsUrl` and the map pin `site.geo`.
- [ ] Decide whether the street address is public (if the GBP hides it, set `site.showStreet = false`).
- [ ] Use the same name, address, phone and hours everywhere: GBP, Bing Places, Apple Business Connect, Yelp,
      Houzz, Angi, BBB, Nextdoor, Facebook, Instagram. Add the HIC number to every profile once it is set.
- [ ] Send each real business profile URL to the developer → `site.profiles` (and `site.ownerProfiles` for
      Ernando's own profiles, such as LinkedIn).
- [ ] Ask every client for a Google review after each job (no incentives, no filtering to happy clients only).

**Photos**

- [ ] A real headshot of Ernando Nunes → `site.ownerPhoto` (never a stock photo).
- [ ] Real **painting** photos (there are none yet; the painting pages have no gallery).
- [ ] More **windows and doors** photos (today only the Lynnfield addition shows new windows).
- [ ] A landscape (at least 1600 px wide) photo of a finished **siding** job for the siding hero.
- [ ] Finished photos of the Needham porch addition and the Lynnfield additions.
- [ ] Original bathroom photos without the logo and contact overlay that was added for social media, and
      the town of each bathroom (today the album is labeled "Massachusetts").
- [ ] The town of the "Deck and Stairs with Lattice Skirting" project (`exterior-remodel-siding-deck`).
- [ ] Licenses for the stock photos in `public/images/*.jpg`, or real replacements.

**Facts that unlock more content**

- [ ] The list of towns with completed jobs (town, service, year), from invoices or permits → `JOBS` in
      `lib/towns.ts`. It turns "30+ towns with completed projects" into checkable facts on the town pages.
- [ ] Confirm that "500+ projects" counts the company's jobs (not Ernando's whole career).
- [ ] Case-study facts from the job files: completion date, duration, permit, materials
      (`completed`, `durationWeeks`, `permit`, `materials` in `lib/projects.ts`).
- [ ] Price bands per service from recent invoices, if you want the site to publish your own prices.
- [ ] Deposit policy, warranty terms, accepted payment methods (`site.paymentAccepted`), typical response time,
      and languages spoken for estimates (`site.languages`).
- [ ] Who pulls permits for New Hampshire jobs, and which New Hampshire-licensed trades you use.
- [ ] Ernando's trade history and bio for the owner page.
- [ ] Official building-department pages for the towns you work in most (`PERMIT_OFFICE` in `lib/towns.ts`;
      add only pages a person has opened and checked).
- [ ] After reading a service hub, the date you reviewed it → `reviewedOn` in `lib/service-content.ts`.

**Accounts and settings**

- [ ] Search Console: verify a Domain property by DNS, submit `/sitemap.xml`, confirm no AI-features opt-out.
- [ ] Bing Webmaster Tools: verify, submit `/sitemap.xml`, review AI Performance monthly.
- [ ] Vercel: record which of `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_CLARITY_ID` are set; confirm the Firewall
      "AI bots" managed rule is off and that no custom rule challenges verified bots.
- [ ] Decide whether the GHL estimate form may load only when it scrolls near view (the single biggest speed
      gain measured), or stays as it is.
- [ ] Optional: a domain email address (for example `info@waterfrontconstructionma.com`) for listings.
- [ ] Before the next content update, re-check the Cost vs. Value figures and credit line against
      <https://www.jlconline.com/cost-vs-value/2025/new-england/> (or the newer edition).
