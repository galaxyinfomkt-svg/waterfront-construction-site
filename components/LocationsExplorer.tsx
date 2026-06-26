"use client";
import { useState } from "react";
import Link from "next/link";
import { services, allCities, citySlug } from "@/lib/site";

export default function LocationsExplorer() {
  const [active, setActive] = useState(services[0].slug);
  const s = services.find((x) => x.slug === active) || services[0];

  return (
    <div>
      {/* Service tabs — click a service to reveal all its city pages */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {services.map((sv) => (
          <button
            key={sv.slug}
            type="button"
            onClick={() => setActive(sv.slug)}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition inline-flex items-center gap-2 ${
              active === sv.slug ? "bg-grad-green text-white shadow" : "bg-white text-navy border border-sand hover:bg-sand"
            }`}
          >
            <span>{sv.icon}</span>{sv.name}
          </button>
        ))}
      </div>

      <p className="text-center text-ink/60 mt-6 mb-5">
        <span className="font-bold text-navy">{s.short}</span> — available in {allCities.length} towns. Pick yours:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {allCities.map((c) => (
          <Link
            key={c}
            href={`/services/${s.slug}/${citySlug(c)}`}
            className="px-3.5 py-2.5 rounded-lg bg-white border border-sand text-[13.5px] font-semibold text-navy hover:bg-grad-green hover:text-white hover:border-transparent transition flex items-center justify-between gap-1"
          >
            <span className="truncate">{c}, MA</span>
            <span className="text-blue group-hover:text-white shrink-0">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
