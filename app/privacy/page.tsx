import Link from "next/link";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "How Waterfront Construction Inc collects, uses, and protects the information you share through our website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-20">
          <div className="flex items-center gap-2 text-sm text-white/70"><Link href="/" className="hover:text-cyan">Home</Link><span>›</span><span className="text-white">Privacy Policy</span></div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Privacy Policy</h1>
          <p className="mt-3 text-white/80">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-14 bg-sand">
        <div className="container-x max-w-3xl">
          <div className="prose">
            <p className="lead">Waterfront Construction Inc (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This policy explains what information we collect through this website, how we use it, and the choices you have.</p>

            <h2>Information we collect</h2>
            <p>When you submit a form or contact us, we collect the details you provide — such as your name, phone number, email address, project type, and any message. We also automatically collect limited technical data (like device type, browser, and pages visited) to understand how the site is used.</p>

            <h2>How we use your information</h2>
            <ul>
              <li>To respond to your request and provide a free estimate</li>
              <li>To schedule and carry out construction or remodeling services</li>
              <li>To improve our website and services</li>
              <li>To send follow-ups about your inquiry (you can opt out at any time)</li>
            </ul>

            <h2>Cookies &amp; analytics</h2>
            <p>This site may use cookies and third-party analytics tools (such as Google Analytics and Microsoft Clarity) to measure traffic and improve the experience. You can disable cookies in your browser settings. Form submissions are processed by our customer-management provider (LeadConnector) to route your request to us.</p>

            <h2>Sharing your information</h2>
            <p>We do not sell your personal information. We share it only with trusted service providers that help us operate (for example, form, hosting, and analytics providers), and only as needed to provide our services or as required by law.</p>

            <h2>Your choices</h2>
            <p>You may request access to, correction of, or deletion of the personal information you&apos;ve shared with us. To make a request, or to opt out of follow-up communications, just contact us using the details below.</p>

            <h2>Contact us</h2>
            <p>Questions about this policy? Reach us at <a href={site.phoneHref} className="text-blue font-semibold">{site.phone}</a> or <a href={site.emailHref} className="text-blue font-semibold break-all">{site.email}</a> — {site.address}.</p>
            <p className="text-sm text-ink/50">This policy is provided for general information and is not legal advice.</p>
          </div>
          <div className="mt-8"><Link href="/contact" className="btn btn-green">Get a Free Estimate →</Link></div>
        </div>
      </section>
    </>
  );
}
