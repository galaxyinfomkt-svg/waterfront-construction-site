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

export type Service = {
  slug: string;
  name: string;
  short: string;
  blurb: string;
  image: string;
  icon: string;
  features: string[];
};

export const services: Service[] = [
  { slug: "siding", name: "Siding", short: "Siding Installation & Replacement", icon: "🏠",
    image: "/images/siding.jpg",
    blurb: "Boost curb appeal and protect your home with premium vinyl, fiber-cement, and engineered siding installed to last New England winters.",
    features: ["Vinyl & fiber-cement siding", "Trim & soffit work", "Weather & moisture protection", "Energy-efficient upgrades"] },
  { slug: "windows-and-doors", name: "Windows & Doors", short: "Windows & Doors Replacement", icon: "🪟",
    image: "/images/windows.jpg",
    blurb: "Energy-efficient windows and beautiful entry doors that cut drafts, lower bills, and modernize the look of your home.",
    features: ["Energy-efficient windows", "Entry & patio doors", "Custom trim & casing", "Clean, sealed installs"] },
  { slug: "kitchen-remodeling", name: "Kitchen Remodeling", short: "Custom Kitchen Remodeling", icon: "🍽️",
    image: "/images/kitchen.jpg",
    blurb: "From refreshed cabinets to full gut renovations — a kitchen built around how your family actually lives, on time and on budget.",
    features: ["Custom cabinets & islands", "Countertops & backsplash", "Lighting & layout design", "Full project management"] },
  { slug: "bathroom-remodeling", name: "Bathroom Remodeling", short: "Bathroom Remodeling", icon: "🛁",
    image: "/images/bathroom.jpg",
    blurb: "Spa-like bathrooms with quality tile, modern fixtures, and waterproofing done right — built to add lasting value.",
    features: ["Tile & walk-in showers", "Vanities & fixtures", "Waterproofing & plumbing", "Accessible upgrades"] },
  { slug: "decks", name: "Decks", short: "Deck Design & Construction", icon: "🌳",
    image: "/images/deck.jpg",
    blurb: "Custom decks and outdoor living spaces in composite or wood — the perfect extension of the home you already love.",
    features: ["Composite & wood decks", "Railings & stairs", "Pergolas & outdoor living", "Permits handled for you"] },
  { slug: "home-additions", name: "Home Additions", short: "Home Additions & Expansions", icon: "📐",
    image: "/images/addition.jpg",
    blurb: "Need more room? We design and build additions — from sunrooms to second stories — that blend seamlessly with your home.",
    features: ["Room & second-story additions", "In-law suites", "Foundation to finish", "Design-build process"] },
  { slug: "painting", name: "Painting", short: "Interior & Exterior Painting", icon: "🎨",
    image: "/images/painting.jpg",
    blurb: "Crisp, durable interior and exterior painting with meticulous prep — a fast, high-impact refresh for any property.",
    features: ["Interior & exterior", "Premium prep & finishes", "Color consultation", "Clean, protected job sites"] },
  { slug: "home-remodeling", name: "Home Remodeling", short: "Full Home Remodeling", icon: "🛠️",
    image: "/images/remodel.jpg",
    blurb: "Whole-home renovations from foundation to final finish — one trusted team managing every trade and every detail.",
    features: ["Whole-home renovations", "Basement finishing", "Open-concept conversions", "Single point of contact"] },
  { slug: "trim-and-carpentry", name: "Trim & Carpentry", short: "Trim & Finish Carpentry", icon: "📏",
    image: "/images/home-exterior.jpg",
    blurb: "Custom trim, molding, and finish carpentry that gives every room a polished, high-end look.",
    features: ["Crown & baseboard molding", "Custom built-ins", "Doors & casings", "Detail-obsessed finish work"] },
  { slug: "repairs", name: "Repairs", short: "Small & Large Repairs", icon: "🔧",
    image: "/images/cta.jpg",
    blurb: "From quick fixes to major repairs after storm or wear — reliable, licensed help you can count on.",
    features: ["Carpentry & structural", "Water & rot repair", "Storm & damage repair", "Honest, upfront pricing"] },
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
