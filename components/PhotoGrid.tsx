import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/services";
import { getProject } from "@/lib/projects";
import { spanFor } from "@/lib/grid";
import { ArrowLabel } from "./chrome-icons";

// Real job photos with TRUE captions (what the photo shows + where it was taken), each linking to its
// case study. Server component: captions and links are in the HTML that crawlers and AI engines read.
// Never pass stock images here (audit 02 C1): only Photo objects from lib/services.ts galleries.
export default function PhotoGrid({ photos, className = "" }: { photos: Photo[]; className?: string }) {
  if (!photos.length) return null;
  const n = photos.length;
  return (
    // Mobile: a swipeable row (keeps the page short); tablet and up: a grid (6-col spans from spanFor, no empty cell).
    <ul role="list" className={`flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 pb-2 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible ${className}`}>
      {photos.map((p, i) => {
        const project = p.project ? getProject(p.project) : undefined;
        return (
          <li key={p.src} className={`w-[80%] shrink-0 snap-start sm:w-auto ${i === 0 && n % 2 ? "sm:col-span-2" : ""} ${n === 1 ? "lg:col-span-6 lg:max-w-[48rem]" : spanFor(i, n)}`}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-well">
                <Image src={p.src} alt={p.alt} fill quality={60} sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
              </div>
              <figcaption className="mt-3">
                {/* {" "} keeps words apart in the HTML text (textContent) that crawlers and AI engines read. */}
                <span className="block text-[15px] leading-normal text-ink">{p.caption}</span>{" "}
                {p.place && <span className="block mt-1 text-sm text-muted">{p.place}</span>}{" "}
                {project && (
                  <Link href={`/projects/${project.slug}`} className="link-arrow text-sm">
                    <ArrowLabel text={`${project.shortTitle} case study`} />
                  </Link>
                )}{" "}
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
