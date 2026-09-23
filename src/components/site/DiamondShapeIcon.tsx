import type { DiamondShape } from "@/lib/search";
import { cn } from "@/lib/utils";

// Outline drawings of the classic diamond cuts, in a 48×48 box.
const SHAPES: Record<DiamondShape, JSX.Element> = {
  Round: (
    <>
      <circle cx="24" cy="24" r="19" />
      <path d="M24 5v8M24 35v8M5 24h8M35 24h8M10.6 10.6l5.6 5.6M31.8 31.8l5.6 5.6M37.4 10.6l-5.6 5.6M16.2 31.8l-5.6 5.6" />
      <path d="M16.2 16.2 24 13l7.8 3.2L35 24l-3.2 7.8L24 35l-7.8-3.2L13 24z" />
    </>
  ),
  Oval: (
    <>
      <ellipse cx="24" cy="24" rx="13" ry="20" />
      <ellipse cx="24" cy="24" rx="6.5" ry="11" />
      <path d="M24 4v9M24 35v9M11 24h6.5M30.5 24H37" />
    </>
  ),
  Emerald: (
    <>
      <path d="M17 4h14l6 6v28l-6 6H17l-6-6V10z" />
      <path d="M19.5 10h9l3.5 3.5v21L28.5 38h-9L16 34.5v-21z" />
      <path d="M17 4l2.5 6M31 4l-2.5 6M37 10l-5 3.5M11 10l5 3.5M37 38l-5-3.5M11 38l5-3.5M17 44l2.5-6M31 44l-2.5-6" />
    </>
  ),
  Pear: (
    <>
      <path d="M24 4c7 9 14 17 14 25a14 14 0 0 1-28 0c0-8 7-16 14-25z" />
      <path d="M24 14c3.5 5 7 10 7 15a7 7 0 0 1-14 0c0-5 3.5-10 7-15z" />
      <path d="M24 4v10M10 29h7M31 29h7M24 36v7" />
    </>
  ),
  Marquise: (
    <>
      <path d="M24 3c10 7 14 14 14 21s-4 14-14 21C14 38 10 31 10 24s4-14 14-21z" />
      <path d="M24 12c4.5 4 6.5 8 6.5 12s-2 8-6.5 12c-4.5-4-6.5-8-6.5-12s2-8 6.5-12z" />
      <path d="M24 3v9M24 36v9M10 24h7.5M30.5 24H38" />
    </>
  ),
  Cushion: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="10" />
      <rect x="14" y="14" width="20" height="20" rx="5" />
      <path d="M9 9l6.5 6.5M39 9l-6.5 6.5M9 39l6.5-6.5M39 39l-6.5-6.5" />
    </>
  ),
  Princess: (
    <>
      <rect x="6" y="6" width="36" height="36" />
      <path d="M6 6l36 36M42 6 6 42" />
      <rect x="15" y="15" width="18" height="18" />
    </>
  ),
  Radiant: (
    <>
      <path d="M15 4h18l5 5v30l-5 5H15l-5-5V9z" />
      <path d="M18 12h12l3 3v18l-3 3H18l-3-3V15z" />
      <path d="M10 9l8 3M38 9l-8 3M10 39l8-3M38 39l-8-3M15 4l3 8M33 4l-3 8M15 44l3-8M33 44l-3-8" />
    </>
  ),
  Heart: (
    <>
      <path d="M24 42 8.5 25.5A9.5 9.5 0 0 1 24 13.3a9.5 9.5 0 0 1 15.5 12.2z" />
      <path d="M24 34 15 24.8a5 5 0 0 1 9-4.3 5 5 0 0 1 9 4.3z" />
      <path d="M24 13.3v7.2M24 34v8" />
    </>
  ),
  Asscher: (
    <>
      <path d="M15 5h18l10 10v18L33 43H15L5 33V15z" />
      <path d="M18.5 12h11l6.5 6.5v11L29.5 36h-11L12 29.5v-11z" />
      <path d="M22 18.5h4l3.5 3.5v4L26 29.5h-4L18.5 26v-4z" />
    </>
  ),
};

const DiamondShapeIcon = ({ shape, className }: { shape: DiamondShape; className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.2}
    strokeLinejoin="round"
    strokeLinecap="round"
    className={cn("h-12 w-12", className)}
    aria-hidden
  >
    {SHAPES[shape]}
  </svg>
);

export default DiamondShapeIcon;
