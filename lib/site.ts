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
    slug: "kitchen-bathroom-remodeling", name: "Kitchen & Bath Remodeling", short: "Kitchen & Bathroom Remodeling", icon: "🍽️", image: "/images/kitchen.jpg",
    blurb: "The two rooms that sell your home and you use every day — beautiful kitchens and spa-like bathrooms, managed start to finish.",
    features: ["Custom cabinets & islands", "Tile & walk-in showers", "Countertops & backsplash", "Vanities, fixtures & lighting", "Plumbing, electrical & waterproofing", "Full project management"],
    long: [
      "Kitchens and bathrooms are where homeowners get the biggest return and the most daily enjoyment. Whether you want a fresh, modern kitchen with an island or a spa-like bathroom with a custom tile shower, we design and build it around how your family actually lives — and add real value at resale.",
      "We manage the entire project under one roof: cabinets, countertops, tile, vanities, fixtures and lighting, plus the plumbing, electrical and waterproofing behind the walls. One accountable team, one clear timeline, and a finish built to last.",
    ],
    faqs: [
      { q: "How much does a kitchen or bathroom remodel cost in Massachusetts?", a: "It depends on size, materials, and how much you change the layout. After a quick visit we give you a detailed, itemized estimate with honest options for every budget." },
      { q: "How long does a kitchen or bathroom remodel take?", a: "Bathrooms typically take 2–3 weeks and kitchens about 3–6 weeks once materials are in. We give you a clear schedule up front and work hard to stay on it." },
      { q: "Can I stay in my home during the remodel?", a: "In most cases, yes. We set up containment, keep the site clean, and plan the work to minimize disruption to your daily routine." },
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
    slug: "home-additions-remodeling", name: "Additions & Remodeling", short: "Home Additions & Remodeling", icon: "📐", image: "/images/addition.jpg",
    blurb: "Need more room or a whole-home refresh? From additions and second stories to full renovations — foundation to final finish, one trusted team.",
    features: ["Room & second-story additions", "In-law suites & sunrooms", "Whole-home renovations", "Basement finishing", "Foundation to final finish", "Design-build process"],
    long: [
      "When you love your neighborhood but need more space — or you want your whole home to feel new again — Waterfront Construction builds additions and full remodels that fit your life. From a sunroom or second story to an open-concept renovation, we design and build it to blend seamlessly with your home.",
      "As a design-build team we manage everything from foundation and framing to the final finish, coordinating every trade so you have a single point of contact and zero finger-pointing — on time, on budget, and matched to your existing home.",
    ],
    faqs: [
      { q: "How long does a home addition or full remodel take?", a: "Larger projects typically run 2–4 months depending on size and complexity. We provide a detailed schedule and keep you informed at every stage." },
      { q: "Do you handle design and permits?", a: "Yes. We're a design-build contractor, so we handle design, engineering, permits, and construction — a single point of contact for the whole project." },
      { q: "Will the new space match my existing home?", a: "That's our specialty. We match rooflines, siding, windows, and interior finishes so additions look original and remodels feel cohesive." },
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

// ~100 towns within/around 30 miles of Northborough — used for per-service local landing pages
export const allCities = [
  "Northborough", "Marlborough", "Westborough", "Shrewsbury", "Worcester", "Southborough",
  "Hopkinton", "Framingham", "Natick", "Hudson", "Grafton", "Holden", "Boylston", "West Boylston",
  "Berlin", "Bolton", "Clinton", "Sterling", "Northbridge", "Upton", "Hopedale", "Milford",
  "Ashland", "Sudbury", "Wayland", "Auburn", "Millbury", "Leicester", "Paxton", "Stow",
  "Maynard", "Acton", "Concord", "Sherborn", "Holliston", "Medway", "Bellingham", "Mendon",
  "Uxbridge", "Sutton", "Oxford", "Charlton", "Spencer", "Rutland", "Princeton", "Lancaster",
  "Harvard", "Littleton", "Boxborough", "Lunenburg", "Leominster", "Fitchburg", "Westminster",
  "Hubbardston", "Barre", "Oakham", "Brookfield", "East Brookfield", "West Brookfield",
  "North Brookfield", "Warren", "Ware", "Sturbridge", "Southbridge", "Dudley", "Webster",
  "Douglas", "Blackstone", "Millville", "Franklin", "Norfolk", "Wrentham", "Walpole", "Medfield",
  "Dover", "Wellesley", "Weston", "Lincoln", "Carlisle", "Westford", "Chelmsford", "Billerica",
  "Bedford", "Burlington", "Waltham", "Watertown", "Newton", "Needham", "Dedham", "Westwood",
  "Whitinsville", "Cherry Valley", "Jefferson", "Rochdale", "Fiskdale", "Baldwinville",
  "Templeton", "Phillipston", "Devens", "Still River",
];

export const citySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
