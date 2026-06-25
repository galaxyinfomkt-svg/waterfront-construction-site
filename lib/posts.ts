export type Section = { h?: string; p?: string[]; ul?: string[]; quote?: string };
export type Post = {
  slug: string; title: string; excerpt: string; image: string; date: string; read: string;
  category: string; lead: string; sections: Section[];
};

export const posts: Post[] = [
  {
    slug: "kitchen-remodel-cost-massachusetts",
    title: "How Much Does a Kitchen Remodel Cost in Massachusetts? (2026 Guide)",
    excerpt: "A clear breakdown of kitchen remodeling costs in MetroWest MA — by scope, materials, and what really drives the price.",
    image: "/images/kitchen.jpg",
    date: "June 20, 2026",
    read: "6 min read",
    category: "Cost Guide",
    lead: "“What will my kitchen remodel cost?” is the first question every homeowner asks — and the honest answer is: it depends. Here is a transparent, no-hype breakdown of what kitchen remodels actually cost in MetroWest Massachusetts, and what moves the number up or down.",
    sections: [
      { h: "Typical kitchen remodel cost ranges in MA", p: [
        "Costs vary with the size of your kitchen, the materials you choose, and how much you change the layout. As a general guide for Central Massachusetts homes:",
      ], ul: [
        "Minor refresh (paint, cabinet refacing, new counters & hardware): roughly $15,000–$25,000",
        "Mid-range remodel (new cabinets, countertops, backsplash, flooring, lighting): roughly $25,000–$45,000",
        "Major / high-end remodel (layout changes, island, custom cabinetry, premium finishes): roughly $45,000–$60,000+",
      ]},
      { h: "What drives the price", p: [
        "A few choices have an outsized effect on your final number. Knowing them up front helps you build a kitchen you love without surprises.",
      ], ul: [
        "Cabinets — usually the single biggest line item (stock vs. semi-custom vs. custom)",
        "Countertops — laminate, quartz, and natural stone span a wide price range",
        "Layout changes — moving plumbing, gas, or walls adds labor and trades",
        "Appliances — entry-level to professional-grade is a big swing",
        "Hidden conditions — older homes can hide outdated wiring or plumbing behind the walls",
      ]},
      { quote: "The smartest budget isn’t the lowest one — it’s the one with no surprises. That starts with a detailed, itemized estimate." },
      { h: "How to get the most value", p: [
        "You don't have to spend the most to get a kitchen you love. Keeping the existing layout, refacing solid cabinets, and choosing durable mid-range materials often delivers the biggest visual change per dollar. A good contractor will show you where to invest and where to save.",
      ]},
      { h: "Get a real number for your kitchen", p: [
        "Ranges are useful, but the only accurate figure is one based on your actual kitchen. Waterfront Construction provides free, detailed, itemized estimates for homeowners across Northborough and MetroWest — with honest options for every budget. Call (508) 816-2726 to get started.",
      ]},
    ],
  },
  {
    slug: "5-remodels-that-add-the-most-home-value",
    title: "5 Remodels That Add the Most Value to Your Home",
    excerpt: "Thinking about renovating? These projects give Massachusetts homeowners the best return on investment.",
    image: "/images/kitchen.jpg",
    date: "June 2, 2026",
    read: "5 min read",
    category: "Home Value",
    lead: "If you already own your home, the smartest renovations are the ones that make daily life better and pay you back at resale. Here are the five projects that consistently deliver the best return for MetroWest homeowners.",
    sections: [
      { h: "1. Kitchen refresh or full remodel", p: [
        "The kitchen sells the house — it's the first room buyers picture themselves in and the room your family lives in most. Even a mid-range update of cabinets, counters, and lighting returns a strong share of its cost while completely changing how the space feels every day.",
        "Not ready for a full gut? Refacing cabinets, swapping countertops, and improving the layout and lighting can transform a kitchen for a fraction of the price.",
      ]},
      { h: "2. Bathroom remodel", p: [
        "A clean, modern bathroom with quality tile and fixtures is one of the highest-impact upgrades you can make — especially in the older homes common across Central Massachusetts. Waterproofing done right also protects everything behind the walls.",
      ]},
      { h: "3. New siding", p: [
        "Curb appeal and protection in one. Fresh fiber-cement or vinyl siding instantly modernizes a home and shields it from New England weather — and it consistently ranks among the highest-ROI exterior projects nationwide.",
      ]},
      { h: "4. A deck or outdoor living space", p: [
        "Usable outdoor square footage is increasingly valuable, and a custom deck extends your living space for half the year. It's an upgrade you enjoy now and buyers reward later.",
      ]},
      { h: "5. A well-planned addition", p: [
        "When you love your location but need more room, an addition is almost always smarter than moving — no realtor fees, no moving trucks, and a home that finally fits your life.",
      ]},
      { quote: "The best remodel is the one that fits how you actually live — and pays you back when it's time to sell." },
      { h: "Which project is right for you?", p: [
        "Every home and budget is different. Request a free estimate and we'll walk you through the options that make the most sense for your goals.",
      ]},
    ],
  },
  {
    slug: "signs-its-time-to-replace-your-siding",
    title: "7 Signs It's Time to Replace Your Siding",
    excerpt: "Cracks, rot, rising energy bills? Here's how to know when siding repair becomes siding replacement.",
    image: "/images/siding.jpg",
    date: "May 18, 2026",
    read: "4 min read",
    category: "Exteriors",
    lead: "Siding protects everything behind it. When it starts to fail, moisture and cold follow — and small problems become expensive ones. Here's how to tell when it's time to replace rather than repair.",
    sections: [
      { h: "Watch for these warning signs", ul: [
        "Cracked, warped, or loose panels",
        "Peeling paint or wallpaper inside (a hidden-moisture clue)",
        "Rot, soft spots, or fungus on the boards",
        "Rising heating and cooling bills",
        "Needing to repaint every few years",
        "Faded, chalky color across large areas",
        "Visible gaps, holes, or pest entry points",
      ]},
      { h: "Repair or replace?", p: [
        "A few isolated issues can often be repaired. But when several of these signs show up together, replacement usually costs less over time than repeated patch jobs — and it dramatically improves comfort, energy efficiency, and curb appeal.",
      ]},
      { quote: "If you're patching siding every year, you're paying for a replacement on the installment plan." },
      { h: "Get an honest assessment", p: [
        "We're happy to take a look and tell you straight whether repair or replacement is the smarter move for your home. Estimates are always free.",
      ]},
    ],
  },
  {
    slug: "how-to-choose-a-contractor-in-massachusetts",
    title: "How to Choose a Remodeling Contractor in Massachusetts",
    excerpt: "Licensing, insurance, references — a simple checklist to hire with total confidence.",
    image: "/images/remodel.jpg",
    date: "April 29, 2026",
    read: "5 min read",
    category: "Hiring Guide",
    lead: "Hiring the right contractor is the difference between a smooth project and a stressful one. Use this checklist before you sign anything — it only takes a few minutes and can save you thousands.",
    sections: [
      { h: "Your pre-hire checklist", ul: [
        "Confirm Massachusetts Home Improvement Contractor licensing",
        "Verify they carry liability insurance (ask for proof)",
        "Ask who is actually on the job, day to day",
        "Get a written, itemized estimate — not a number on a napkin",
        "Check recent local references and photos of finished work",
        "Make sure permits and inspections are handled for you",
        "Trust the communication — clear before the job means clear during it",
      ]},
      { h: "Red flags to avoid", p: [
        "Be cautious of contractors who only take cash, won't put the scope in writing, pressure you to decide immediately, or can't show a license and insurance. The lowest bid is rarely the best value if it skips these basics.",
      ]},
      { quote: "Good contractors put everything in writing and answer the phone. If it's hard to reach them before the job, it'll be harder during it." },
      { h: "Why homeowners choose Waterfront", p: [
        "The owner is on every project, we're fully licensed and insured, and we put everything in writing — scope, timeline, and price. Reach out for a free, no-pressure estimate and see the difference.",
      ]},
    ],
  },
];
