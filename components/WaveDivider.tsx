// The wave that closes the home hero: the blue swoosh under the rooflines of the logo (public/logo-solid.png),
// drawn as two layered bands (soft blue behind, logo blue in front) that rise to the right and settle into the
// paper ground of the next section. Decorative only (aria-hidden), no text. Server component.
// preserveAspectRatio="none" stretches the curve to any width; the height is set by the caller per breakpoint.
export default function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 140" preserveAspectRatio="none" className={`block w-full ${className}`}>
      <path d="M0 96C300 44 600 38 900 66c220 21 390-4 540-52V140H0Z" className="fill-wave-soft" />
      <path d="M0 114c330-44 670-52 960-24 200 19 350 2 480-36V140H0Z" className="fill-wave" />
      <path d="M0 130c360-30 700-34 1000-14 190 13 330 2 440-22V140H0Z" className="fill-paper" />
    </svg>
  );
}
