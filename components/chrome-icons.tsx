// Small inline SVG icons for the chrome and static pages (replace emoji icons, audit 10 UX-M4).
// Always decorative: aria-hidden + focusable=false, sized in em so they follow the text.
type P = { className?: string };
const base = { "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" } as const;

export function PhoneIcon({ className = "w-[1em] h-[1em]" }: P) {
  return <svg {...base} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>;
}
export function MailIcon({ className = "w-[1em] h-[1em]" }: P) {
  return <svg {...base} className={className}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
}
export function PinIcon({ className = "w-[1em] h-[1em]" }: P) {
  return <svg {...base} className={className}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
export function ClockIcon({ className = "w-[1em] h-[1em]" }: P) {
  return <svg {...base} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}
export function CheckIcon({ className = "w-[1em] h-[1em]" }: P) {
  return <svg {...base} className={className}><path d="M20 6 9 17l-5-5" /></svg>;
}
