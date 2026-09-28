import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { SITE } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';
import { enquiry } from '@/lib/enquiry';
import { cn } from '@/lib/utils';
import policies from '@/content/policies.json';

export type PolicyKey = keyof typeof policies;

type Section = { title: string; paragraphs?: string[]; list?: string[] };

// Shipping, returns, warranty and terms. Copy lives in src/content/policies.json (shared with the
// pre-renderer); every page links the others so customers can find what they need.
const PolicyPage = ({ policy }: { policy: PolicyKey }) => {
  const page = policies[policy];
  const { contactInfo } = useAppSelector(selectGlobalData);
  const pageUrl = `${SITE.url}${page.path}`;
  const sections = page.sections as Section[];

  return (
    <SiteLayout>
      <SEOHead
        title={page.metaTitle}
        description={page.metaDescription}
        canonicalUrl={pageUrl}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: page.title, url: pageUrl },
        ]}
      />

      <div className="container-wide py-8 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{page.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-3">Customer care</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {(Object.keys(policies) as PolicyKey[]).map((key) => (
                <li key={key}>
                  <Link
                    to={policies[key].path}
                    aria-current={key === policy ? 'page' : undefined}
                    className={cn(
                      'block rounded-full border px-3.5 py-1.5 text-sm transition-colors lg:rounded-lg lg:border-0 lg:px-3 lg:py-2',
                      key === policy ? 'border-brand bg-brand-light font-semibold text-brand' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {policies[key].navLabel}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/ring-size-guide" className="block rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground lg:rounded-lg lg:border-0 lg:px-3 lg:py-2">
                  Ring size guide
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="block rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground lg:rounded-lg lg:border-0 lg:px-3 lg:py-2">
                  Privacy &amp; cookies
                </Link>
              </li>
            </ul>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <h1 className="heading-lg text-balance">{page.title}</h1>
            <p className="mt-5 text-base leading-relaxed md:text-lg">{page.intro}</p>
            {page.highlights.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {page.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1.5 text-xs font-semibold text-brand">
                    <Check className="h-3.5 w-3.5" /> {h}
                  </li>
                ))}
              </ul>
            )}

            {sections.map((s) => (
              <section key={s.title} className="mt-10 border-t pt-8">
                <h2 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 leading-relaxed text-muted-foreground">{p}</p>
                ))}
                {s.list && (
                  <ul className="mt-4 space-y-2.5">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3 leading-relaxed text-muted-foreground">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="mt-12 rounded-3xl bg-secondary p-6 md:p-8">
              <p className="font-display text-xl font-semibold tracking-tight">Still have a question?</p>
              <p className="mt-2 text-sm text-muted-foreground">Our team replies personally on WhatsApp and by email.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="whatsapp">
                  <a href={whatsappLink(enquiry.general(pageUrl), contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Chat on WhatsApp</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${contactInfo?.email || SITE.email}`}>Email us</a>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default PolicyPage;
