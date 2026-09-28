// Ring size conversions, generated from the North American standard:
//   inner circumference (mm) = 2.55 × US size + 36.5   (≈ 54.4 mm for US 7)
//   inner diameter (mm)      = 0.8128 × US size + 11.63 (≈ 17.3 mm for US 7)
// UK / Australia letters step two letters per US size (US 6 = L½, US 7 = N½).
// EU/ISO size is the circumference in mm; India/Japan sizes are approximate (circumference − 40).
// scripts/seo-data.mjs repeats these formulas for the pre-rendered chart; keep them in sync.

export interface RingSize {
  us: number;
  uk: string;
  eu: number;
  india: number;
  diameter: number;
  circumference: number;
}

const UK_LETTERS = ["F½", "G½", "H½", "I½", "J½", "K½", "L½", "M½", "N½", "O½", "P½", "Q½", "R½", "S½", "T½", "U½", "V½", "W½", "X½", "Y½", "Z½"];

export const circumferenceForUs = (us: number) => 2.55 * us + 36.5;
export const diameterForUs = (us: number) => 0.8128 * us + 11.63;

export const RING_SIZES: RingSize[] = UK_LETTERS.map((uk, i) => {
  const us = 3 + i * 0.5;
  const circumference = circumferenceForUs(us);
  return {
    us,
    uk,
    eu: Math.round(circumference),
    india: Math.max(1, Math.round(circumference - 40)),
    diameter: Math.round(diameterForUs(us) * 10) / 10,
    circumference: Math.round(circumference * 10) / 10,
  };
});

export const formatUs = (us: number) => (Number.isInteger(us) ? String(us) : `${Math.floor(us)}½`);

/** Nearest listed size for a measured inner diameter or circumference (mm), or null if out of range. */
export const sizeFromMeasurement = (value: number, kind: "diameter" | "circumference"): RingSize | null => {
  if (!Number.isFinite(value) || value <= 0) return null;
  const key = kind === "diameter" ? "diameter" : "circumference";
  const first = RING_SIZES[0][key];
  const last = RING_SIZES[RING_SIZES.length - 1][key];
  const step = (last - first) / (RING_SIZES.length - 1);
  if (value < first - step || value > last + step) return null;
  return RING_SIZES.reduce((best, s) => (Math.abs(s[key] - value) < Math.abs(best[key] - value) ? s : best));
};
