import { Link } from 'react-router-dom';
import { ChevronRight, Cookie } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/seo';
import { openCookieSettings } from '@/lib/consent';
import policy from '@/content/privacyPolicy.json';

type Section = (typeof policy.sections)[number] & {
  paragraphs?: string[];
  list?: string[];
  cookies?: { name: string; type: string; purpose: string; duration: string }[];
};

// Copy lives in src/content/privacyPolicy.json (shared with the pre-renderer).
const PrivacyPolicy = () => {
  const pageUrl = `${SITE.url}${policy.path}`;
  const sections = policy.sections as Section[];

  return (
    <SiteLayout>
      <SEOHead
        title={policy.metaTitle}
        description={policy.metaDescription}
        canonicalUrl={pageUrl}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: 'Privacy & Cookie Policy', url: pageUrl },
        ]}
      />

      <div className="container-wide py-8 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Privacy &amp; Cookie Policy</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Contents */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-3">On this page</p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-brand">{s.title}</a>
                </li>
              ))}
            </ol>
            <Button variant="outline" size="sm" className="mt-6" onClick={openCookieSettings}>
              <Cookie className="h-4 w-4" /> Cookie settings
            </Button>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <h1 className="heading-lg text-balance">Privacy &amp; cookie policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: {policy.updated}</p>
            <p className="mt-6 text-base leading-relaxed md:text-lg">{policy.intro}</p>

            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-t pt-8 mt-10">
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
                {s.cookies && (
                  <div className="mt-6 overflow-x-auto rounded-2xl border">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          {['Name', 'Type', 'Purpose', 'Duration'].map((h) => (
                            <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.cookies.map((c) => (
                          <tr key={c.name} className="border-t align-top">
                            <td className="px-4 py-3 font-mono text-xs">{c.name}</td>
                            <td className="px-4 py-3">{c.type}</td>
                            <td className="px-4 py-3 text-muted-foreground">{c.purpose}</td>
                            <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {s.id === 'your-rights' && (
                  <Button className="mt-6" onClick={openCookieSettings}>
                    <Cookie className="h-4 w-4" /> Change cookie settings
                  </Button>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default PrivacyPolicy;
