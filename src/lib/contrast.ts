/**
 * Contrast guard — DESIGN.md §4.3 / §10.8.
 *
 * Any colour that is computed rather than taken straight from a token (a tint over
 * glass, a status wash, an overlay on a product photo) goes through `readable()`
 * so it cannot silently fall under the WCAG floor.
 *
 * Target: 4.5:1 for body text, 3:1 for large or bold text (WCAG 2.2 AA).
 */

export const AA_BODY = 4.5;
export const AA_LARGE = 3;

type Rgb = { r: number; g: number; b: number };

/** Accepts `#rgb`, `#rrggbb`, `rgb(…)`, or an `h s% l%` triplet as used by our tokens. */
export function parseColor(input: string): Rgb | null {
  const s = input.trim();

  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };

  // "240 6% 10%" — the shape our CSS custom properties store
  const hsl = s.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (hsl) return hslToRgb(+hsl[1], +hsl[2] / 100, +hsl[3] / 100);

  return null;
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

/** WCAG relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Contrast ratio between two colours, 1–21. Returns 0 if either can't be parsed. */
export function contrastRatio(fg: string, bg: string): number {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return 0;
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** True when `fg` on `bg` clears the threshold. */
export function passes(fg: string, bg: string, min = AA_BODY): boolean {
  return contrastRatio(fg, bg) >= min;
}

/**
 * Returns `fg` when it is readable on `bg`, otherwise the better of black/white.
 * In development it also warns, so the offending pair gets fixed at the token
 * level rather than being silently patched at runtime.
 */
export function readable(fg: string, bg: string, min = AA_BODY): string {
  if (passes(fg, bg, min)) return fg;

  const onBlack = contrastRatio("#000000", bg);
  const onWhite = contrastRatio("#ffffff", bg);
  const fallback = onBlack >= onWhite ? "#000000" : "#ffffff";

  if (import.meta.env?.DEV) {
    console.warn(
      `[contrast] ${fg} on ${bg} is ${contrastRatio(fg, bg).toFixed(2)}:1, below ${min}:1 — using ${fallback}`,
    );
  }
  return fallback;
}
