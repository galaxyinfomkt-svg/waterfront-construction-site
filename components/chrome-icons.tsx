// Small inline SVG line icons for the chrome and static pages (no icon library; server- and client-safe).
// Always decorative: aria-hidden + focusable=false. Every icon carries the `icon` class, which keeps a
// 1.5px non-scaling stroke at any size (globals.css). Default size is 1em, so it follows the text.
type P = { className?: string };
const base = {
  "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 1.5,
  strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24",
} as const;
const cx = (c?: string) => `icon ${c ?? "w-[1em] h-[1em]"}`;

export function PhoneIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>;
}
export function MailIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
}
export function PinIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
export function ClockIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}
export function CheckIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M20 6 9 17l-5-5" /></svg>;
}
export function ChevronDownIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="m6 9 6 6 6-6" /></svg>;
}
export function ChevronRightIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="m9 18 6-6-6-6" /></svg>;
}
export function ChevronLeftIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="m15 18-6-6 6-6" /></svg>;
}
export function ArrowRightIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}
export function ArrowUpRightIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>;
}
export function PlusIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}
export function XIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}
export function MenuIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>;
}
export function FileTextIcon({ className }: P) {
  return (
    <svg {...base} className={cx(className)}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}
export function AlertTriangleIcon({ className }: P) {
  return (
    <svg {...base} className={cx(className)}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
export function FacebookIcon({ className }: P) {
  return <svg {...base} className={cx(className)}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}
export function InstagramIcon({ className }: P) {
  return (
    <svg {...base} className={cx(className)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

/** Arrow glued to the last word; textContent === text; arrow aria-hidden.
 *  One wrapping span, so inside a flex/inline-flex parent (.link-arrow, .btn) the label stays a single
 *  flex item: the parent's gap never splits the words and the label wraps as normal text. */
export function ArrowLabel({ text, external = false }: { text: string; external?: boolean }) {
  const i = text.lastIndexOf(" ");
  const Icon = external ? ArrowUpRightIcon : ArrowRightIcon;
  return <span>{i > 0 ? text.slice(0, i + 1) : ""}<span className="whitespace-nowrap">{i > 0 ? text.slice(i + 1) : text}<Icon className="ml-1.5 inline w-3.5 h-3.5 align-[-0.125em] arrow-nudge" /></span></span>;
}
/** For labels that are JSX, not a string: NBSP + arrow (UAX14 GL glues it). */
export function ArrowSuffix() {
  return <>{"\u00A0"}<ArrowRightIcon className="inline w-3.5 h-3.5 align-[-0.125em] arrow-nudge" /></>;
}
