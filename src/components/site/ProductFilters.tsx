import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import DiamondShapeIcon from "@/components/site/DiamondShapeIcon";
import type { Product } from "@/lib/storage";
import { DIAMOND_SHAPES } from "@/lib/search";
import {
  CARAT_BANDS,
  DIAMOND_TYPE_LABELS,
  EMPTY_FILTERS,
  METAL_LABELS,
  countActiveFilters,
  getProductAttributes,
  matchesFilters,
  type ProductFilterState,
} from "@/lib/productAttributes";
import { cn } from "@/lib/utils";

type GroupKey = keyof ProductFilterState;

interface Option {
  value: string;
  label: string;
}

const GROUPS: { key: GroupKey; label: string; options: Option[] }[] = [
  { key: "shapes", label: "Diamond shape", options: DIAMOND_SHAPES.map((s) => ({ value: s, label: s })) },
  { key: "diamondTypes", label: "Diamond", options: Object.entries(DIAMOND_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "metals", label: "Metal", options: Object.entries(METAL_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "carats", label: "Carat weight", options: CARAT_BANDS.map((b) => ({ value: b.value, label: b.label })) },
];

const hasValue = (product: Product, key: GroupKey, value: string) => {
  const a = getProductAttributes(product);
  if (key === "shapes") return (a.shapes as string[]).includes(value);
  if (key === "diamondTypes") return (a.diamondTypes as string[]).includes(value);
  if (key === "metals") return (a.metals as string[]).includes(value);
  return a.caratBand === value;
};

interface ProductFiltersProps {
  /** Every product in the current collection / search (before filtering). */
  products: Product[];
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  resultCount: number;
  /** Sort control etc., shown at the right of the bar. */
  trailing?: ReactNode;
}

// Faceted filters (no price): pill popovers on desktop, a bottom sheet on phones.
// Counts are faceted: each option shows how many pieces match it together with the other groups.
const ProductFilters = ({ products, value, onChange, resultCount, trailing }: ProductFiltersProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = countActiveFilters(value);

  // Only offer groups/options that exist in this set of products.
  const groups = useMemo(
    () =>
      GROUPS.map((g) => {
        const others = { ...value, [g.key]: [] } as ProductFilterState;
        const scoped = products.filter((p) => matchesFilters(p, others));
        const options = g.options
          .map((o) => ({ ...o, base: products.filter((p) => hasValue(p, g.key, o.value)).length, count: scoped.filter((p) => hasValue(p, g.key, o.value)).length }))
          .filter((o) => o.base > 0);
        return { ...g, options };
      }).filter((g) => g.options.length > 0),
    [products, value]
  );

  const toggle = (key: GroupKey, v: string) => {
    const current = value[key] as string[];
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    onChange({ ...value, [key]: next } as ProductFilterState);
  };

  const chips = groups.flatMap((g) =>
    (value[g.key] as string[]).map((v) => ({ key: g.key, value: v, label: g.options.find((o) => o.value === v)?.label ?? v }))
  );

  const optionButton = (g: (typeof groups)[number], o: (typeof groups)[number]["options"][number], variant: "list" | "chip") => {
    const selected = (value[g.key] as string[]).includes(o.value);
    const disabled = o.count === 0 && !selected;
    if (variant === "chip") {
      return (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => toggle(g.key, o.value)}
          aria-pressed={selected}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors disabled:opacity-35",
            selected ? "border-brand bg-brand text-white" : "hover:border-foreground"
          )}
        >
          {g.key === "shapes" && <DiamondShapeIcon shape={o.value as (typeof DIAMOND_SHAPES)[number]} className={cn("h-4 w-4", selected ? "text-white" : "text-brand")} />}
          {o.label}
          <span className={cn("text-xs tabular-nums", selected ? "text-white/75" : "text-muted-foreground")}>{o.count}</span>
        </button>
      );
    }
    return (
      <button
        key={o.value}
        type="button"
        disabled={disabled}
        onClick={() => toggle(g.key, o.value)}
        aria-pressed={selected}
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary disabled:opacity-35"
      >
        <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", selected && "border-brand bg-brand text-white")}>
          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        {g.key === "shapes" && <DiamondShapeIcon shape={o.value as (typeof DIAMOND_SHAPES)[number]} className="h-4 w-4 text-brand" />}
        <span className="flex-1">{o.label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
      </button>
    );
  };

  if (groups.length === 0) {
    return trailing ? <div className="mb-8 flex items-center justify-end gap-2">{trailing}</div> : null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        {/* Desktop: one popover per group */}
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          {groups.map((g) => {
            const n = (value[g.key] as string[]).length;
            return (
              <Popover key={g.key}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors hover:border-foreground data-[state=open]:border-foreground",
                      n > 0 && "border-brand text-brand"
                    )}
                  >
                    {g.label}
                    {n > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{n}</span>}
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 rounded-2xl p-2">
                  <div className="max-h-80 overflow-y-auto">{g.options.map((o) => optionButton(g, o, "list"))}</div>
                  {n > 0 && (
                    <button type="button" onClick={() => onChange({ ...value, [g.key]: [] } as ProductFilterState)} className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-brand hover:bg-secondary">
                      Clear {g.label.toLowerCase()}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>

        {/* Phones & tablets: bottom sheet */}
        <Button variant="outline" className="h-10 rounded-full lg:hidden" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {active > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{active}</span>}
        </Button>

        <div className="flex items-center gap-2">{trailing}</div>
      </div>

      {/* Active filter chips + result count */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          {active > 0 && ` of ${products.length}`}
        </p>
        {chips.map((c) => (
          <button
            key={`${c.key}-${c.value}`}
            type="button"
            onClick={() => toggle(c.key, c.value)}
            className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            aria-label={`Remove filter ${c.label}`}
          >
            {c.label} <X className="h-3 w-3" />
          </button>
        ))}
        {active > 1 && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Clear all
          </button>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="flex max-h-[88dvh] flex-col gap-0 rounded-t-3xl p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <SheetTitle className="font-display text-lg">Filters</SheetTitle>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {groups.map((g) => (
              <section key={g.key}>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.label}</h3>
                <div className="flex flex-wrap gap-2">{g.options.map((o) => optionButton(g, o, "chip"))}</div>
              </section>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t p-4">
            <Button variant="outline" size="lg" disabled={active === 0} onClick={() => onChange(EMPTY_FILTERS)}>
              Clear all
            </Button>
            <Button size="lg" onClick={() => setSheetOpen(false)}>
              Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProductFilters;
