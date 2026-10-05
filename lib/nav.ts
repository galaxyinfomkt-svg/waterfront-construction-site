// Main navigation (header and mobile menu). "Home" is the logo link; "Projects" keeps the /gallery URL
// (the case-study index) and "Service Areas" makes the town directory one click from every page
// (audit 01 M4, 06 ST-H3).
export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/gallery" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
