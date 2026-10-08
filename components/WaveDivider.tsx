// The wave that closes the home hero, made of the photo itself rather than flat colour bands: the photo's lower
// edge rolls into a soft swell, the swell just above that edge is frosted glass (the photo blurred and brightened
// through it, like a reflection on water), a thin light line catches its crest, and the paper ground of the next
// section fills below. Decorative only (aria-hidden), no text. Server component.
// The SVGs use preserveAspectRatio="none" (and the masks mask-size 100% 100%) so the curve stretches to any width;
// the height is set by the caller per breakpoint.

const VIEW = "0 0 1440 140";
// Crest of the frosted band, then the paper edge below it (same rhythm, lower and flatter).
const CREST = "M0 92C260 48 560 40 860 64c240 19 420 2 580-44";
const EDGE = "M0 124c340-38 690-46 990-22 190 15 330 2 450-26";
const close = (d: string) => `${d}V140H0Z`;

const mask = (d: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${VIEW}' preserveAspectRatio='none'><path d='${close(d)}'/></svg>`,
  )}")`;
const masked = (d: string) => ({
  maskImage: mask(d), WebkitMaskImage: mask(d),
  maskSize: "100% 100%", WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
});

export default function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div className="absolute inset-0 backdrop-blur-md backdrop-saturate-150 bg-white/15" style={masked(CREST)} />
      <svg focusable="false" viewBox={VIEW} preserveAspectRatio="none" className="absolute inset-0 block w-full h-full">
        <path d={CREST} fill="none" stroke="white" strokeOpacity=".7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d={EDGE} fill="none" stroke="white" strokeOpacity=".9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={close(EDGE)} className="fill-paper" />
      </svg>
    </div>
  );
}
