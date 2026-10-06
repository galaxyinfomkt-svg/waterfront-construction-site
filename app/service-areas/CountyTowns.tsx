"use client";
import Link from "next/link";
import { Fragment } from "react";

/** One directory row: [city hub path (cityHubPath), "Town, ST", distance label, note]. Built on the server
 *  (app/service-areas/page.tsx). */
export type TownRow = [href: string, label: string, dist: string, note?: TownRowNote];
/** v: parent town of a village · d: Devens · p: [project slug, short title] of the case studies there. */
export type TownRowNote = { v?: string; d?: 1; p?: [string, string][] };

// The rows of one county table on /service-areas. A client component only so the page's RSC payload carries these
// compact tuples instead of ~200 serialized <tr> trees (the server HTML is the same; /service-areas must stay under
// 300 KB, spec §11). Every town links once, to its city hub (spec §5.6); prefetch off (V4.3).
export default function CountyTowns({ rows }: { rows: TownRow[] }) {
  return (
    <tbody>
      {rows.map(([href, label, dist, note]) => (
        <tr key={href}>
          <th scope="row">
            <Link prefetch={false} href={href}>{label}</Link>
            {note?.v && <span className="note">(village of {note.v})</span>}
            {note?.d && <span className="note">(regional enterprise zone)</span>}
            {note?.p && (
              <span className="note">
                Case {note.p.length > 1 ? "studies" : "study"}:{" "}
                {note.p.map(([p, title], i) => (
                  <Fragment key={p}>{i > 0 ? ", " : ""}<Link prefetch={false} href={`/projects/${p}`} className="link">{title}</Link></Fragment>
                ))}
              </span>
            )}
          </th>
          <td className="dist">{dist}</td>
        </tr>
      ))}
    </tbody>
  );
}
