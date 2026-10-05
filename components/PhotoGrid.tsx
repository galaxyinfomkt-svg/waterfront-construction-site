import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/services";
import { getProject } from "@/lib/projects";

// Real job photos with TRUE captions (what the photo shows + where it was taken), each linking to its
// case study. Server component: captions and links are in the HTML that crawlers and AI engines read.
// Never pass stock images here (audit 02 C1): only Photo objects from lib/services.ts galleries.
export default function PhotoGrid({ photos, className = "" }: { photos: Photo[]; className?: string }) {
  if (!photos.length) return null;
  return (
    // Mobile: a swipeable row (keeps the page short); tablet and up: a grid.
    <ul role="list" className={`flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 pb-2 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 sm:overflow-visible ${className}`}>
      {photos.map((p) => {
        const project = p.project ? getProject(p.project) : undefined;
        return (
          <li key={p.src} className="w-[80%] shrink-0 snap-start sm:w-auto">
            <figure className="card overflow-hidden h-full flex flex-col">
              <div className="relative aspect-square bg-sand">
                <Image src={p.src} alt={p.alt} fill quality={60} sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
              </div>
              <figcaption className="p-4 text-sm leading-relaxed flex-1 flex flex-col gap-1.5">
                <span className="font-semibold text-navy">{p.caption}</span>
                {p.place && <span className="text-ink/70">{p.place}</span>}
                {project && (
                  <Link href={`/projects/${project.slug}`} className="mt-auto pt-1 font-semibold text-blue hover:underline underline-offset-2">
                    {project.shortTitle} case study <span aria-hidden="true">→</span>
                  </Link>
                )}
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
