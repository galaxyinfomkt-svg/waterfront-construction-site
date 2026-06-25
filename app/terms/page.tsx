import Link from "next/link";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms of Use",
  description: "The terms and conditions for using the Waterfront Construction Inc website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-20">
          <div className="flex items-center gap-2 text-sm text-white/70"><Link href="/" className="hover:text-cyan">Home</Link><span>›</span><span className="text-white">Terms of Use</span></div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Terms of Use</h1>
          <p className="mt-3 text-white/80">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-14 bg-sand">
        <div className="container-x max-w-3xl">
          <div className="prose">
            <p className="lead">By using this website you agree to the following terms. Please read them carefully.</p>

            <h2>Use of this website</h2>
            <p>This site is provided for general information about Waterfront Construction Inc and our services. You agree to use it lawfully and not to attempt to disrupt, damage, or gain unauthorized access to the site or its systems.</p>

            <h2>Estimates &amp; information</h2>
            <p>Any pricing ranges, timelines, or examples shown on this site are general estimates for informational purposes only and do not constitute a binding quote. Your actual project scope, price, and schedule are confirmed in a written estimate or contract. Project photos may be representative of the type of work we perform.</p>

            <h2>No warranty</h2>
            <p>While we work to keep the information on this site accurate and up to date, it is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any loss arising from reliance on the website&apos;s content.</p>

            <h2>Intellectual property</h2>
            <p>The content, branding, and design of this site are the property of Waterfront Construction Inc and may not be copied or reused without permission.</p>

            <h2>Third-party links &amp; services</h2>
            <p>This site may link to or use third-party services (such as Google, social media, and our contact-form provider). We are not responsible for the content or practices of third-party sites and services.</p>

            <h2>Changes</h2>
            <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>

            <h2>Contact</h2>
            <p>Questions? Reach us at <a href={site.phoneHref} className="text-blue font-semibold">{site.phone}</a> or <a href={site.emailHref} className="text-blue font-semibold break-all">{site.email}</a>.</p>
            <p className="text-sm text-ink/50">These terms are provided for general information and are not legal advice.</p>
          </div>
          <div className="mt-8"><Link href="/contact" className="btn btn-green">Get a Free Estimate →</Link></div>
        </div>
      </section>
    </>
  );
}
