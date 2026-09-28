import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Lightbulb, Ruler } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { RING_SIZES, formatUs, sizeFromMeasurement, type RingSize } from '@/lib/ringSizes';
import { SITE } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import guide from '@/content/ringSizeGuide.json';

type System = 'us' | 'uk' | 'eu' | 'india';
const SYSTEMS: { value: System; label: string }[] = [
  { value: 'us', label: 'US / Canada' },
  { value: 'uk', label: 'UK / Australia' },
  { value: 'eu', label: 'EU / ISO' },
  { value: 'india', label: 'India / Japan' },
];

const labelFor = (s: RingSize, system: System) =>
  system === 'us' ? formatUs(s.us) : system === 'uk' ? s.uk : system === 'eu' ? String(s.eu) : String(s.india);

const RingSizeGuide = () => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const pageUrl = `${SITE.url}${guide.path}`;
  const [system, setSystem] = useState<System>('us');
  const [selectedUs, setSelectedUs] = useState<number>(7);
  const [measureKind, setMeasureKind] = useState<'diameter' | 'circumference'>('diameter');
  const [measure, setMeasure] = useState('');

  const selected = RING_SIZES.find((s) => s.us === selectedUs) ?? RING_SIZES[8];
  const measured = useMemo(() => (measure.trim() ? sizeFromMeasurement(parseFloat(measure.replace(',', '.')), measureKind) : null), [measure, measureKind]);
  const highlight = measured?.us ?? selected.us;

  // One option per chart row; systems that repeat a value (EU, India) keep the first row.
  const options = useMemo(() => {
    const seen = new Set<string>();
    return RING_SIZES.filter((s) => {
      const label = labelFor(s, system);
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  }, [system]);

  const sizeHelp = whatsappLink(
    'Hello Starlink Jewels 👋\n\nCould you help me find my ring size?\n\nThank you!',
    contactInfo?.whatsapp
  );

  return (
    <SiteLayout>
      <SEOHead
        title={guide.metaTitle}
        description={guide.metaDescription}
        canonicalUrl={pageUrl}
        faqItems={guide.faq}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: 'Ring Size Guide', url: pageUrl },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to measure your ring size at home',
          step: guide.methods.slice(0, 2).map((m, i) => ({ '@type': 'HowToSection', position: i + 1, name: m.title, itemListElement: m.steps.map((t, j) => ({ '@type': 'HowToStep', position: j + 1, text: t })) })),
        }}
      />

      {/* Hero + converter */}
      <section className="container-wide pt-3 md:pt-4">
        <div className="grid overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-light via-secondary to-secondary md:rounded-[2rem] lg:grid-cols-[1fr_1.05fr]">
          <div className="px-5 pb-8 pt-8 sm:px-8 md:px-12 md:py-14">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Ring Size Guide</span>
            </nav>
            <p className="eyebrow mb-4">Sizing</p>
            <h1 className="heading-xl text-balance">
              Ring size <span className="accent">guide</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">{guide.intro}</p>
          </div>

          <div className="p-5 sm:p-8 md:p-12">
            <div className="rounded-3xl bg-background p-5 shadow-[0_30px_60px_-30px_rgba(15,27,51,0.35)] md:p-7">
              <h2 className="font-display text-lg font-semibold tracking-tight">Size converter</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">I know my size in</label>
                  <Select value={system} onValueChange={(v) => setSystem(v as System)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SYSTEMS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Size</label>
                  <Select
                    value={String(options.find((o) => labelFor(o, system) === labelFor(selected, system))?.us ?? options[0].us)}
                    onValueChange={(v) => {
                      setSelectedUs(parseFloat(v));
                      setMeasure('');
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {options.map((s) => <SelectItem key={s.us} value={String(s.us)}>{labelFor(s, system)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
                {[
                  ['US', formatUs(selected.us)],
                  ['UK', selected.uk],
                  ['EU', String(selected.eu)],
                  ['India', String(selected.india)],
                  ['Ø mm', selected.diameter.toFixed(1)],
                  ['Circ. mm', selected.circumference.toFixed(1)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-secondary px-2 py-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{k}</dt>
                    <dd className="mt-1 font-display text-lg font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 border-t pt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Ruler className="h-4 w-4 text-brand" /> Measured at home?</h3>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder={measureKind === 'diameter' ? 'Inside diameter, e.g. 17.3' : 'Circumference, e.g. 54.4'}
                    value={measure}
                    onChange={(e) => setMeasure(e.target.value)}
                    className="h-11 rounded-xl"
                    aria-label="Measurement in millimetres"
                  />
                  <Select value={measureKind} onValueChange={(v) => setMeasureKind(v as 'diameter' | 'circumference')}>
                    <SelectTrigger className="h-11 w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diameter">Ring Ø (mm)</SelectItem>
                      <SelectItem value="circumference">Finger (mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="mt-3 min-h-[1.5rem] text-sm" aria-live="polite">
                  {measure.trim() === '' ? (
                    <span className="text-muted-foreground">Enter a measurement in millimetres.</span>
                  ) : measured ? (
                    <>
                      Your size: <strong>US {formatUs(measured.us)}</strong> · UK {measured.uk} · EU {measured.eu} · India {measured.india}
                    </>
                  ) : (
                    <span className="text-rose-600">That is outside the usual range. Please measure again, or ask us for help.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to measure */}
      <section className="section">
        <div className="container-wide">
          <p className="eyebrow mb-3">At home</p>
          <h2 className="heading-lg max-w-2xl text-balance">Three easy ways to measure</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-3 md:gap-5">
            {guide.methods.map((m, i) => (
              <div key={m.title} className="rounded-3xl border p-6">
                <span className="font-serif text-4xl italic text-brand">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{m.title}</h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {m.steps.map((s, j) => (
                    <li key={s} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">{j + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                {i === 2 && (
                  <Button asChild variant="whatsapp" className="mt-5">
                    <a href={sizeHelp} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Ask for sizing help</a>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-secondary p-6 md:p-8">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"><Lightbulb className="h-5 w-5 text-brand" /> Tips for a perfect fit</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
              {guide.tips.map((t) => (
                <li key={t} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="section bg-secondary/60" id="chart">
        <div className="container-wide">
          <p className="eyebrow mb-3">Conversion chart</p>
          <h2 className="heading-lg max-w-2xl text-balance">International ring size chart</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Inner diameter and circumference in millimetres. India/Japan sizes are approximate; we always confirm your size before crafting.</p>
          <div className="mt-8 overflow-x-auto rounded-3xl border bg-background">
            <table className="w-full min-w-[620px] text-center text-sm">
              <thead className="bg-secondary">
                <tr>
                  {['US / Canada', 'UK / Australia', 'EU / ISO', 'India / Japan', 'Diameter (mm)', 'Circumference (mm)'].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((s) => (
                  <tr
                    key={s.us}
                    onClick={() => {
                      setSelectedUs(s.us);
                      setMeasure('');
                    }}
                    className={cn('cursor-pointer border-t transition-colors hover:bg-brand-light/60', s.us === highlight && 'bg-brand-light font-semibold text-brand')}
                  >
                    <td className="px-3 py-2.5">{formatUs(s.us)}</td>
                    <td className="px-3 py-2.5">{s.uk}</td>
                    <td className="px-3 py-2.5">{s.eu}</td>
                    <td className="px-3 py-2.5">{s.india}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.diameter.toFixed(1)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.circumference.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg text-balance">Ring sizing questions</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/ring-builder">Design your ring <ArrowUpRight /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/category/rings">Shop rings</Link>
              </Button>
            </div>
          </div>
          <Accordion type="single" collapsible defaultValue="faq-0">
            {guide.faq.map((f, i) => (
              <AccordionItem key={f.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold tracking-tight hover:no-underline md:text-lg">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
};

export default RingSizeGuide;
