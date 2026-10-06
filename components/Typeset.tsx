/** Splits on "word &" and "Town, MA/NH" and wraps those parts in nowrap spans. textContent is byte-identical. */
export default function Typeset({ text }: { text: string }) {
  const parts = text.split(/(\S+ &(?= )|\S+, (?:MA|NH)\b)/);
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{p}</span> : p))}</>;
}
