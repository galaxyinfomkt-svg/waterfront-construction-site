export const site = {
  name: "Waterfront Construction Inc",
  shortName: "Waterfront Construction",
  phone: "(508) 816-2726",
  phoneHref: "tel:+15088162726",
  email: "waterfrontmass@gmail.com",
  emailHref: "mailto:waterfrontmass@gmail.com",
  address: "44 Bearfoot Road, Northborough, MA 01532",
  city: "Northborough, MA",
  hours: "Mon–Sat, 7am–6pm",
  founded: 2017,
  experience: 15,
  instagram: "https://www.instagram.com/waterfrontconstruction/",
  facebook: "https://www.facebook.com/Waterfrontconst/",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export type Faq = { q: string; a: string };
export type Service = {
  slug: string; name: string; short: string; blurb: string; image: string; icon: string;
  features: string[]; long: string[]; faqs: Faq[];
};

export const services: Service[] = [
  {
    slug: "siding", name: "Siding", short: "Siding Installation & Replacement", icon: "🏠", image: "/images/siding.jpg",
    blurb: "Boost curb appeal and protect your home with premium vinyl, fiber-cement, and engineered siding built for New England winters.",
    features: ["Vinyl & fiber-cement siding", "Trim, soffit & fascia work", "Weather & moisture protection", "Energy-efficient house wrap", "Color & style consultation", "Full clean-up & haul-away"],
    long: [
      "Your siding is your home's first line of defense against New England's brutal freeze-thaw cycles, driving rain, and summer heat. When it's installed correctly with quality materials, it keeps moisture out, lowers your energy bills, and dramatically lifts your curb appeal.",
      "We install and replace vinyl, fiber-cement, and engineered wood siding — handling everything from tear-off and moisture barriers to trim, soffits, and fascia. The result is a tight, weatherproof exterior that looks sharp and protects your biggest investment for decades.",
    ],
    faqs: [
      { q: "How long does siding installation take?", a: "Most homes are completed in about 1–2 weeks depending on size, the material chosen, and any repairs needed underneath. We give you a firm timeline before we start." },
      { q: "What siding material is best for Massachusetts?", a: "Vinyl and fiber-cement both perform extremely well in New England. Fiber-cement is exceptionally durable and fire-resistant, while vinyl offers great value and low maintenance. We help you choose based on your budget and the look you want." },
      { q: "Will new siding lower my energy bills?", a: "Yes — especially when paired with house wrap and insulation. New siding seals air leaks and improves your home's thermal envelope, which can noticeably reduce heating and cooling costs." },
    ],
  },
  {
    slug: "windows-and-doors", name: "Windows & Doors", short: "Windows & Doors Replacement", icon: "🪟", image: "/images/windows.jpg",
    blurb: "Energy-efficient windows and beautiful entry doors that cut drafts, lower bills, and modernize your home.",
    features: ["Energy-efficient replacement windows", "Entry & patio doors", "Custom interior trim & casing", "Fully sealed, weather-tight installs", "Improved security & comfort", "Style & color matching"],
    long: [
      "Drafty windows and tired doors quietly cost you money every month and let the New England cold creep in. Upgrading to modern, energy-efficient windows and a solid entry door is one of the fastest ways to make your home more comfortable, quieter, and more secure.",
      "We install replacement windows, patio and entry doors with clean, fully-sealed installations and custom interior trim. You get better insulation, better looks, and a draft-free home — without the mess or the guesswork.",
    ],
    faqs: [
      { q: "Do new windows really save energy?", a: "Absolutely. Modern double- or triple-pane windows with low-E coatings dramatically cut heat loss in winter and heat gain in summer, lowering your bills and eliminating cold drafts." },
      { q: "How long does a window replacement take?", a: "Most window replacements are completed in 1–3 days depending on the number of openings. We protect your home and clean up fully when we're done." },
      { q: "Can you match my home's existing style?", a: "Yes. We help you choose window and door styles, colors, and trim that complement your home — whether it's a classic colonial or a modern build." },
    ],
  },
  {
    slug: "kitchen-remodeling", name: "Kitchen Remodeling", short: "Custom Kitchen Remodeling", icon: "🍽️", image: "/images/kitchen.jpg",
    blurb: "From refreshed cabinets to full gut renovations — a kitchen built around how your family actually lives.",
    features: ["Custom cabinets & islands", "Countertops & backsplash", "Lighting & layout design", "Flooring, plumbing & electrical", "Full project management", "On-time, on-budget delivery"],
    long: [
      "The kitchen is the heart of the home — and the room buyers care about most. Whether you want a fresh, modern look or a full layout change with an island and better flow, a well-designed kitchen makes everyday life better and adds real value at resale.",
      "We manage your entire kitchen remodel under one roof: cabinets, countertops, backsplash, lighting, flooring, and the plumbing and electrical behind the walls. One accountable team, one clear timeline, and a finish you'll love to cook in.",
    ],
    faqs: [
      { q: "How much does a kitchen remodel cost?", a: "It depends on size, materials, and how much you change the layout. After a quick visit we give you a detailed, itemized estimate with honest options for every budget." },
      { q: "How long does a kitchen remodel take?", a: "A typical kitchen takes about 3–6 weeks once materials are in. We give you a clear schedule up front and work hard to stay on it." },
      { q: "Can I stay in my home during the remodel?", a: "In most cases, yes. We set up containment, keep the site clean, and plan the work to minimize disruption to your daily routine." },
    ],
  },
  {
    slug: "bathroom-remodeling", name: "Bathroom Remodeling", short: "Bathroom Remodeling", icon: "🛁", image: "/images/bathroom.jpg",
    blurb: "Spa-like bathrooms with quality tile, modern fixtures, and waterproofing done right — built to add lasting value.",
    features: ["Custom tile & walk-in showers", "Vanities & fixtures", "Waterproofing & plumbing", "Heated floors & lighting", "Accessible & curbless options", "Clean, protected job sites"],
    long: [
      "A dated bathroom is one of the first things buyers notice — and one of the upgrades you'll enjoy most every single day. From a clean refresh to a full gut renovation with a custom tile shower, we build bathrooms that feel like a spa and are waterproofed to last.",
      "We handle tile, vanities, fixtures, lighting, and the critical waterproofing and plumbing behind the scenes. Done right the first time, your new bathroom stays beautiful and leak-free for years.",
    ],
    faqs: [
      { q: "How long does a bathroom remodel take?", a: "Most bathrooms are completed in about 2–3 weeks depending on scope and tile work. We give you a firm timeline before starting." },
      { q: "Do you build walk-in and curbless showers?", a: "Yes. We build custom tile showers, walk-in and curbless designs, and accessible upgrades — all properly waterproofed for a leak-free result." },
      { q: "What if you find hidden water damage?", a: "If we find rot or water damage during demolition, we'll show you and address it the right way so your new bathroom is built on a solid, dry foundation." },
    ],
  },
  {
    slug: "decks", name: "Decks", short: "Deck Design & Construction", icon: "🌳", image: "/images/deck.jpg",
    blurb: "Custom decks and outdoor living spaces in composite or wood — the perfect extension of the home you already love.",
    features: ["Composite & wood decks", "Railings, stairs & lighting", "Pergolas & outdoor living", "Permits handled for you", "Built to code & built to last", "Custom design to fit your yard"],
    long: [
      "A custom deck is the easiest way to add usable living space and enjoy your backyard for half the year. Whether you picture summer cookouts, a quiet morning coffee spot, or a full outdoor living area with a pergola, we design and build it to fit your home and lifestyle.",
      "We build in low-maintenance composite and classic wood, with railings, stairs, lighting, and built-in features. We pull the permits and handle the structure so your deck is safe, solid, and ready for years of use.",
    ],
    faqs: [
      { q: "Composite or wood — which is better?", a: "Composite costs more up front but needs almost no maintenance and lasts longer. Wood is budget-friendly and classic but needs periodic sealing. We help you weigh the trade-offs." },
      { q: "Do I need a permit for a deck?", a: "Most decks require a permit in Massachusetts. As your licensed contractor, we handle the permitting and inspections for you." },
      { q: "How long does it take to build a deck?", a: "Most decks take about 1–2 weeks depending on size and features. Weather and permit timing can affect the schedule, and we keep you updated throughout." },
    ],
  },
  {
    slug: "home-additions", name: "Home Additions", short: "Home Additions & Expansions", icon: "📐", image: "/images/addition.jpg",
    blurb: "Need more room? We design and build additions — from sunrooms to second stories — that blend seamlessly with your home.",
    features: ["Room & second-story additions", "In-law suites & sunrooms", "Foundation to final finish", "Design-build process", "Roofline & siding matching", "Permits & engineering handled"],
    long: [
      "When you love your neighborhood but you're running out of room, an addition is almost always smarter than moving — no realtor fees, no moving trucks, just a home that finally fits your family. From a sunroom or in-law suite to a full second story, we design and build additions that look like they were always there.",
      "As a design-build team, we manage everything from foundation and framing to the final finish — matching your roofline, siding, and interior so the new space blends seamlessly with the old. One team, one plan, from blueprint to move-in.",
    ],
    faqs: [
      { q: "How long does a home addition take?", a: "Additions are larger projects and typically run 2–4 months depending on size and complexity. We give you a detailed schedule and keep you informed at every stage." },
      { q: "Do you handle design and permits?", a: "Yes. We're a design-build contractor, so we handle the design, engineering, permits, and construction — a single point of contact for the whole project." },
      { q: "Will the addition match my existing home?", a: "That's our specialty. We carefully match rooflines, siding, windows, and interior finishes so the addition looks original, not bolted-on." },
    ],
  },
  {
    slug: "painting", name: "Painting", short: "Interior & Exterior Painting", icon: "🎨", image: "/images/painting.jpg",
    blurb: "Crisp, durable interior and exterior painting with meticulous prep — a fast, high-impact refresh for any home.",
    features: ["Interior & exterior painting", "Meticulous surface prep", "Premium, durable finishes", "Cabinet & trim painting", "Color consultation", "Clean, protected job sites"],
    long: [
      "A fresh coat of paint is the fastest, highest-impact way to transform a room or refresh your home's exterior. The difference between a good paint job and a great one is in the prep — and that's where we shine.",
      "Our painters meticulously prep every surface — patching, sanding, caulking, and priming — before applying premium interior or exterior finishes. We protect your home, keep the site clean, and leave you with crisp lines and a durable, beautiful result.",
    ],
    faqs: [
      { q: "Do you do both interior and exterior painting?", a: "Yes — interior rooms, trim, cabinets, and full exteriors. We use premium paints suited to New England weather for long-lasting results." },
      { q: "How long will the paint last?", a: "With proper prep and quality paint, interiors stay fresh for many years and a good exterior job typically lasts 7–10 years or more depending on exposure." },
      { q: "Can you help me choose colors?", a: "Absolutely. We offer color consultation to help you pick shades that suit your home, your light, and your style." },
    ],
  },
  {
    slug: "home-remodeling", name: "Home Remodeling", short: "Full Home Remodeling", icon: "🛠️", image: "/images/remodel.jpg",
    blurb: "Whole-home renovations from foundation to final finish — one trusted team managing every trade and every detail.",
    features: ["Whole-home renovations", "Basement finishing", "Open-concept conversions", "All trades coordinated", "Single point of contact", "Clear schedule & budget"],
    long: [
      "Sometimes a single room isn't enough — you want your whole home to feel new again. A whole-home remodel lets you rethink your layout, open up cramped spaces, and bring every room up to a consistent, modern standard, all managed by one trusted team.",
      "We handle whole-home renovations from foundation to final finish — coordinating every trade, every material, and every detail so you have a single point of contact and zero finger-pointing. The result is a home that works the way you live.",
    ],
    faqs: [
      { q: "Can you remodel my whole home at once?", a: "Yes. We coordinate all trades and phases so a full renovation runs smoothly, and we can sequence the work so you can stay in your home when possible." },
      { q: "Do you finish basements too?", a: "We do — finished basements add valuable living space for family rooms, home offices, gyms, or in-law suites." },
      { q: "How do you keep a big project on track?", a: "With one accountable team, a clear written scope and schedule, and constant communication. You always know what's happening and what's next." },
    ],
  },
  {
    slug: "trim-and-carpentry", name: "Trim & Carpentry", short: "Trim & Finish Carpentry", icon: "📏", image: "/images/home-exterior.jpg",
    blurb: "Custom trim, molding, and finish carpentry that gives every room a polished, high-end look.",
    features: ["Crown & baseboard molding", "Wainscoting & coffered ceilings", "Custom built-ins & mantels", "Doors & casings", "Tight joints, clean lines", "Match or upgrade existing trim"],
    long: [
      "The details are what separate an ordinary room from a finished, high-end space. Custom trim, crown molding, wainscoting, and built-ins add character, warmth, and value that buyers and guests notice immediately.",
      "Our finish carpenters craft and install crown and baseboard molding, custom built-ins, doors, casings, and architectural details — all with the tight joints and clean lines that mark true craftsmanship.",
    ],
    faqs: [
      { q: "What kind of trim work do you do?", a: "Crown molding, baseboards, wainscoting, coffered ceilings, custom built-ins, mantels, doors, and casings — anything that adds a polished, finished look." },
      { q: "Can custom built-ins really add value?", a: "Yes. Quality built-ins add storage, character, and a custom feel that makes a home stand out and feel more expensive." },
      { q: "Do you match existing molding?", a: "We do. We can match your home's existing profiles or help you upgrade to a new, cohesive trim package throughout." },
    ],
  },
  {
    slug: "repairs", name: "Repairs", short: "Small & Large Repairs", icon: "🔧", image: "/images/cta.jpg",
    blurb: "From quick fixes to major repairs after storm or wear — reliable, licensed help you can count on.",
    features: ["Carpentry & structural repair", "Water & rot repair", "Storm & damage repair", "Door, window & trim fixes", "Honest, upfront pricing", "No job too small"],
    long: [
      "Not every project is a full remodel — sometimes you just need something fixed right by someone you can trust. From storm damage and water-rotted boards to that list of nagging repairs you've been putting off, we handle the jobs other contractors won't return calls for.",
      "As a licensed, insured contractor, we tackle carpentry, structural fixes, water and rot repair, and storm damage with honest, upfront pricing. No job is too small to do correctly.",
    ],
    faqs: [
      { q: "Do you take on small repair jobs?", a: "Yes. We handle both small and large repairs — and we treat the small ones with the same care and professionalism as a full remodel." },
      { q: "Can you help with storm or water damage?", a: "Absolutely. We repair water and rot damage, storm damage, and structural issues, and we can work with your insurance documentation when needed." },
      { q: "Do you give estimates for repairs?", a: "Yes — repair estimates are free and upfront, so you know the cost before any work begins." },
    ],
  },
];

export const galleryImages = [
  "/images/kitchen.jpg", "/images/home-exterior.jpg", "/images/bathroom.jpg",
  "/images/deck.jpg", "/images/remodel.jpg", "/images/siding.jpg",
  "/images/windows.jpg", "/images/painting.jpg", "/images/addition.jpg",
];

export const cities = [
  "Northborough", "Marlborough", "Westborough", "Shrewsbury", "Worcester", "Southborough",
  "Hopkinton", "Framingham", "Natick", "Hudson", "Grafton", "Holden", "Boylston", "West Boylston",
  "Berlin", "Bolton", "Clinton", "Sterling", "Northbridge", "Upton", "Hopedale", "Milford",
  "Ashland", "Sudbury", "Wayland", "Auburn", "Millbury", "Leicester", "Paxton", "Stow",
];

export const stats = [
  { value: "15+", label: "Years of experience" },
  { value: "30+", label: "Towns served" },
  { value: "100%", label: "Licensed & insured" },
  { value: "1-on-1", label: "Owner-led projects" },
];

export const testimonials = [
  { name: "Karen M.", town: "Shrewsbury, MA", text: "Ernando's crew remodeled our kitchen and a bathroom. Clean, on schedule, and the finish work is flawless. We get compliments constantly." },
  { name: "Dave R.", town: "Westborough, MA", text: "New siding and windows completely transformed the house. Professional from the estimate to the final walkthrough." },
  { name: "Priya S.", town: "Northborough, MA", text: "They built our deck and a small addition. Great communication the whole way — exactly what you want in a contractor." },
];
