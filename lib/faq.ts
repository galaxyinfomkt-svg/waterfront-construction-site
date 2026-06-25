export type Faq = { q: string; a: string };

// Shared, AEO-optimized FAQs tailored per service (combined with each service's specific FAQs → 10+ per page)
export function commonFaqs(service: string): Faq[] {
  const s = service.toLowerCase();
  return [
    { q: `Is Waterfront Construction licensed and insured?`, a: `Yes. Waterfront Construction is a licensed Massachusetts Home Improvement Contractor and fully insured, so your home and your ${s} project are protected from start to finish.` },
    { q: `Do you offer free estimates for ${s}?`, a: `Always. Estimates are free and no-obligation. Call (508) 816-2726 or request one online and we'll respond within one business day.` },
    { q: `How much does ${s} cost in Massachusetts?`, a: `Cost depends on the size, materials and scope of your project. After a quick visit we provide a detailed, itemized estimate with honest options for every budget — no surprises or pressure.` },
    { q: `How long does a ${s} project take?`, a: `Timelines vary by project size. We give you a clear schedule before we start, work hard to stay on it, and keep you updated at every stage.` },
    { q: `What towns do you serve?`, a: `We're based in Northborough, MA and serve 30+ towns within about 30 miles across MetroWest and Worcester County — including Marlborough, Westborough, Shrewsbury, Worcester, Framingham, Natick and Hudson.` },
    { q: `Do you handle permits and inspections?`, a: `Yes. As your licensed contractor we pull the required permits and coordinate inspections, so you don't have to deal with the paperwork.` },
    { q: `Do you stand behind your work?`, a: `We do. We don't consider a ${s} job finished until you're completely satisfied, and we're available if anything needs attention after the project is complete.` },
  ];
}

export const faqs: Faq[] = [
  {
    q: "What areas does Waterfront Construction serve?",
    a: "We're based in Northborough, MA and serve homeowners within about a 30-mile radius across MetroWest and Worcester County — including Marlborough, Westborough, Shrewsbury, Worcester, Framingham, Natick, Hudson, Southborough, Hopkinton and surrounding towns.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Yes. Waterfront Construction is a licensed Massachusetts Home Improvement Contractor and fully insured, so your home and project are protected from start to finish.",
  },
  {
    q: "How much does a kitchen or bathroom remodel cost in Massachusetts?",
    a: "Every project is different, so we provide a free, detailed, itemized estimate after a quick visit. Pricing depends on size, materials, and scope — and we give you honest options for every budget before any work begins.",
  },
  {
    q: "Do you offer free estimates?",
    a: "Absolutely. Estimates are always free and no-obligation. Call (508) 816-2726 or fill out our form and we'll get back to you within one business day.",
  },
  {
    q: "How long does a typical remodel take?",
    a: "Smaller projects like bathrooms or siding can take 1–3 weeks, while kitchens and additions take longer. After we scope your project, you get a clear timeline up front — and we work to stay on schedule.",
  },
  {
    q: "Do you handle permits?",
    a: "Yes. As your licensed contractor, we handle the permits and inspections required for your project so you don't have to worry about the paperwork.",
  },
];
