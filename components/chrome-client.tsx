"use client";
// The only client-side parts of the site chrome (audit 07 T08, 01 M1): the header (menu state), the
// desktop floating call button (shows/hides by scroll) and the "Free estimate" link that scrolls to the
// on-page form. Everything else (top bar, footer, mobile bar) is server-rendered in chrome.tsx.
// Data arrives as small props, so lib/site.ts (towns, FAQs, testimonials) is never bundled for the browser.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PhoneIcon } from "./chrome-icons";
import ServiceIcon from "@/app/services/_components/ServiceIcon";

export type HeaderNavItem = { label: string; href: string };
export type HeaderService = { slug: string; name: string; short: string };

/** The on-page estimate form: the section that wraps <LeadForm /> carries data-estimate-form (and
 *  id="estimate"). A bare #estimate is only a fallback, and never a heading, so an article heading can
 *  never hijack the "Free estimate" links (V5.1). */
function estimateTarget(): HTMLElement | null {
  const marked = document.querySelector<HTMLElement>("[data-estimate-form]");
  if (marked) return marked;
  const el = document.getElementById("estimate");
  return el && !/^H[1-6]$/.test(el.tagName) ? el : null;
}

const isCurrent = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export function HeaderClient({ nav, services, phone, phoneHref, brand }: {
  nav: HeaderNavItem[]; services: HeaderService[]; phone: string; phoneHref: string; brand: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const svcRef = useRef<HTMLDivElement>(null);
  const svcLinkRef = useRef<HTMLAnchorElement>(null);
  // Services dropdown dismissed with Escape (WCAG 2.2 SC 1.4.13, V5.7). It stays closed until the pointer
  // leaves the group or focus moves out of it; then hover / focus opens it again as usual.
  const [svcDismissed, setSvcDismissed] = useState(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const g = svcRef.current;
      if (!g) return;
      const focused = g.contains(document.activeElement);
      if (!focused && !g.matches(":hover")) return;
      setSvcDismissed(true);
      if (focused) svcLinkRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // While the mobile menu is open: Escape closes it, the page behind does not scroll, and the
  // fixed bottom CTA bar is hidden so it cannot cover the menu's own items (audit 10 UX-M1).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  const toggle = () => {
    setMenuTop(headerRef.current ? Math.round(headerRef.current.getBoundingClientRect().bottom) : 0);
    setOpen((v) => !v);
  };
  const close = () => setOpen(false);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white shadow-[0_6px_24px_-14px_rgba(20,20,43,.4)]">
      <div className="container-x flex h-[72px] md:h-[88px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0" aria-label={`${brand}, home`}>
          {/* Eager but low priority: React does not preload it, so it never competes with the page's hero image (07 T07). */}
          <Image src="/logo-header.png" alt={brand} width={497} height={349} sizes="96px" loading="eager" fetchPriority="low" className="h-14 md:h-16 lg:h-[52px] xl:h-[60px] w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 xl:gap-2 font-semibold text-[14px] xl:text-[15px] text-ink/80">
          {nav.map((n) =>
            n.href === "/services" ? (
              // Opens on hover AND on keyboard focus (focus-within), so the service links are reachable by Tab (01 M4);
              // Escape closes it and returns focus to "Services" (V5.7).
              <div key={n.href} ref={svcRef} className="relative group/svc"
                onMouseLeave={() => setSvcDismissed(false)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSvcDismissed(false); }}>
                <Link ref={svcLinkRef} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="navpill font-semibold flex items-center gap-1">
                  {n.label}<span aria-hidden="true" className="text-[10px] mt-0.5">▼</span>
                </Link>
                <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1 transition-[opacity,translate] duration-200 ${svcDismissed ? "" : "group-hover/svc:opacity-100 group-hover/svc:visible group-hover/svc:translate-y-0 group-focus-within/svc:opacity-100 group-focus-within/svc:visible group-focus-within/svc:translate-y-0"}`}>
                  <ul className="w-72 card p-2 shadow-card">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/services/${s.slug}`} aria-current={isCurrent(pathname, `/services/${s.slug}`) ? "page" : undefined}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-sand text-[14px] text-ink/80 hover:text-navy">
                          <ServiceIcon slug={s.slug} className="w-5 h-5 shrink-0 text-blue" />{s.short}
                        </Link>
                      </li>
                    ))}
                    <li><Link href="/services" className="block text-center mt-1 px-3 py-2 rounded-lg bg-sand text-blue font-bold text-sm">All services</Link></li>
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="navpill font-semibold whitespace-nowrap">{n.label}</Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a href={phoneHref} className="hidden xl:flex items-center gap-2 font-bold text-navy hover:text-blue whitespace-nowrap">
            <span className="w-9 h-9 rounded-full bg-[#1f7a3a] text-white grid place-items-center"><PhoneIcon className="w-4 h-4" /></span>{phone}
          </a>
          <EstimateLink className="btn btn-grad text-sm">Free estimate</EstimateLink>
        </div>

        <button ref={toggleRef} type="button" onClick={toggle} aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"} className="lg:hidden w-12 h-12 -mr-2 grid place-items-center text-navy">
          <span aria-hidden="true" className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <div aria-hidden="true" className="h-[3px] bg-grad-sunset" />

      {open && (
        // Fixed below the header and scrollable on its own, so every item is reachable even on
        // 360×640 phones (the old menu was taller than the screen and could not scroll).
        <nav id="mobile-menu" aria-label="Main" style={{ top: menuTop }}
          className="lg:hidden fixed inset-x-0 bottom-0 z-[60] overflow-y-auto overscroll-contain bg-white border-t border-sand">
          <div className="container-x pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] flex flex-col">
            {nav.map((n) =>
              n.href === "/services" ? (
                <div key={n.href} className="border-b border-sand py-1">
                  <Link href={n.href} onClick={close} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="flex items-center min-h-12 font-semibold text-navy">Services</Link>
                  <ul className="grid grid-cols-2 gap-x-3 pb-2">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/services/${s.slug}`} onClick={close} className="flex items-center gap-1.5 min-h-11 text-sm text-ink/80">
                          <ServiceIcon slug={s.slug} className="w-[1.15em] h-[1.15em] shrink-0 text-blue" />{s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link key={n.href} href={n.href} onClick={close} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}
                  className="flex items-center min-h-12 font-semibold text-ink/85 border-b border-sand">{n.label}</Link>
              )
            )}
            <a href={phoneHref} className="btn btn-navy mt-4"><PhoneIcon /> Call {phone}</a>
            <EstimateLink onDone={close} className="btn btn-green mt-2">Get a free estimate</EstimateLink>
          </div>
        </nav>
      )}
    </header>
  );
}

/** "Free estimate" link: scrolls to the estimate form when this page has one ([data-estimate-form]),
 *  otherwise opens /contact#estimate. Modifier-clicks still open a new tab (onNavigate). Audit 10 UX-H2, V5.1. */
export function EstimateLink({ className = "", children, onDone }: { className?: string; children: ReactNode; onDone?: () => void }) {
  return (
    <Link
      href="/contact#estimate"
      className={className}
      onNavigate={(e) => {
        onDone?.();
        const el = estimateTarget();
        if (!el) return;
        e.preventDefault();
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
        const hash = `#${el.id || "estimate"}`;
        if (location.hash !== hash) history.replaceState(null, "", hash);
      }}
    >
      {children}
    </Link>
  );
}

/** Desktop floating call button. Hidden near the top of the page and whenever an estimate form,
 *  a block marked data-cta-zone or the footer is on screen, so it never covers another CTA or the
 *  footer's last row (audit 10 UX-M8). Re-observes after every client-side navigation. */
export function FloatingCall({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const form = estimateTarget();
    const zones = [...document.querySelectorAll("[data-cta-zone], footer"), ...(form ? [form] : [])];
    const visible = new Set<Element>();
    const update = () => setShow(window.scrollY > 600 && visible.size === 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    zones.forEach((z) => io.observe(z));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [pathname]);

  return (
    <div className={`hidden md:block fixed bottom-6 right-6 z-50 transition duration-300 ${show ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-3"}`}>
      <a href={phoneHref} className="btn btn-green pulse text-base shadow-lg px-6 py-3.5">
        <PhoneIcon /> Call {phone}
      </a>
    </div>
  );
}
