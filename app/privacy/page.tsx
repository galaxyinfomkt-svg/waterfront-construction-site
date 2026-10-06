import Link from "next/link";
import { displayAddress } from "@/lib/address";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";

// Privacy policy (audit 06 ST-M3). Discloses the data flows the site really has: the LeadConnector
// (HighLevel) estimate form and chat widget, Vercel hosting, and — only when their IDs are configured
// at build time — Google Analytics and Microsoft Clarity. There is no cookie banner (the unused
// CookieConsent component was removed), so the policy says how to block cookies instead.
// Have counsel review; this is not legal advice.

// Dates: first published (git) and the last SUBSTANTIVE edit. The visible "Last updated" line and the
// WebPage dateModified read the same constant; change it only when the policy text changes.
const PUBLISHED = "2026-06-25T20:08:17-03:00";
const UPDATED = "2026-10-05T10:00:09-04:00";
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(UPDATED));

const GA = Boolean(process.env.NEXT_PUBLIC_GA_ID);
const CLARITY = Boolean(process.env.NEXT_PUBLIC_CLARITY_ID);

const DESCRIPTION = `What ${site.name} collects via our estimate form, chat, analytics and hosting, how we use it, and how to ask us to access or delete it.`;

export const metadata = pageMeta({ title: "Privacy Policy", description: DESCRIPTION, path: "/privacy" });

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }];

const ld = pageGraph([
  webPageNode({ path: "/privacy", name: "Privacy Policy", description: DESCRIPTION, datePublished: PUBLISHED, dateModified: UPDATED }),
  breadcrumbNode(crumbs),
]);

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={ld} />
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy">Privacy Policy</h1>
            <p className="mt-5 text-[13px] text-muted">Last updated: <time dateTime={UPDATED}>{updatedLabel}</time></p>
          </div>
        </div>
      </section>

      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="prose">
            <p className="lead">{site.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This policy explains what information we collect through this website, how we use it, who helps us process it, and the choices you have.</p>

            <h2>Information we collect</h2>
            <p>When you send our estimate form, use the chat window, call or email us, we collect what you give us, such as your name, phone number, email address, town or address, the type of project and your message. When you visit the site, our hosting provider and any analytics tools listed below also receive standard technical data, such as your IP address, browser and device type, and the pages you view.</p>

            <h2>Forms and chat</h2>
            <p>Our estimate form and the chat window on this site are provided by LeadConnector (HighLevel). What you type is stored by that provider and sent to us so we can reply.</p>

            <h2>How we use your information</h2>
            <ul>
              <li>To answer your request and prepare a free estimate</li>
              <li>To schedule and carry out remodeling work you hire us for</li>
              <li>To follow up about your inquiry (you can ask us to stop at any time)</li>
              <li>To keep the website working, secure and easy to use</li>
            </ul>

            <h2>Analytics and cookies</h2>
            {GA && <p>We use Google Analytics to understand how visitors find and use the site, for example which pages are viewed and which buttons are clicked. Google Analytics uses cookies.</p>}
            {CLARITY && <p>We use Microsoft Clarity, which captures how you use and interact with the site through behavioral metrics, heatmaps and session replay, to help us improve it. Clarity uses cookies; you can read how Microsoft handles this data in the Microsoft Privacy Statement.</p>}
            {!GA && !CLARITY && <p>This site does not currently run third-party analytics tools.</p>}
            <p>You can block or delete cookies in your browser settings; the site still works without them.</p>

            <h2>Hosting</h2>
            <p>This website is hosted by Vercel, which processes standard request logs (such as IP address and browser type) to deliver and secure the site.</p>

            <h2>Sharing your information</h2>
            <p>We do not sell your personal information. We share it only with the service providers named above, and only as needed to run the site and serve you, or when the law requires it.</p>

            <h2>How long we keep information</h2>
            <p>We keep inquiry and project records for as long as we need them to respond to you, carry out the work, and meet legal, tax and accounting obligations.</p>

            <h2>Children</h2>
            <p>This site is not directed to children under 13, and we do not knowingly collect their information.</p>

            <h2>Your choices</h2>
            <p>You can ask us to show, correct or delete the personal information you have shared with us, or to stop following up with you. Contact us using the details below.</p>

            <h2>Changes to this policy</h2>
            <p>If we change this policy, we will update it on this page and change the &ldquo;Last updated&rdquo; date above.</p>

            <h2>Contact us</h2>
            <p>Questions about this policy? Call <a href={site.phoneHref} className="link tel">{site.phone}</a>, email <a href={site.emailHref} className="link">{site.email}</a>, or write to {site.name}, {displayAddress}.</p>
            <p className="text-sm text-muted">This policy is provided for general information and is not legal advice.</p>
          </div>
          <div className="mt-8"><Link href="/contact#estimate" className="btn btn-primary">Get a free estimate</Link></div>
        </div>
      </section>
    </>
  );
}
