// JSON-LD as a native script tag (not next/script). "<" is escaped so no string value
// can ever close the script element (Next.js JSON-LD guide).
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
