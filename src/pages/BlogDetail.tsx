import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Link2, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import Reveal from '@/components/site/Reveal';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadBlogs, selectBlogsLoaded, selectBlogsStatus, selectContentStatus, selectGlobalData } from '@/store/contentSlice';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  SITE,
  buildMetaDescriptionForBlog,
  buildMetaTitleForBlog,
  cleanRichTextHtml,
  sanitizeMetaField,
  stripHtml,
} from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';

const formatDate = (date: string, month: 'long' | 'short' = 'long') =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' });

const readingMinutes = (html: string) => Math.max(1, Math.round(stripHtml(html).split(/\s+/).filter(Boolean).length / 220));

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { blogs, contactInfo } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!blogsLoaded && blogsStatus === 'idle') dispatch(loadBlogs());
  }, [blogsLoaded, blogsStatus, dispatch]);

  const blog = useMemo(() => blogs.find((b) => b.id === id) ?? null, [blogs, id]);
  const content = useMemo(() => (blog ? sanitizeHtml(cleanRichTextHtml(blog.content)) : ''), [blog]);
  const otherBlogs = useMemo(
    () =>
      blogs
        .filter((b) => b.id !== id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [blogs, id]
  );

  const blogUrl = `${SITE.url}/blog/${id}`;

  if (!blog) {
    const loading = status === 'loading' || blogsStatus === 'loading' || (!blogsLoaded && blogsStatus !== 'failed');
    return (
      <SiteLayout>
        <SEOHead
          title={loading ? 'Loading Article' : 'Article Not Found'}
          description="Diamond guides, engagement ring tips and fine jewelry stories from Starlink Jewels."
          canonicalUrl={blogUrl}
          noIndex={!loading}
        />
        {loading ? (
          <div className="container-wide max-w-3xl space-y-5 py-16">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-12 w-4/5 animate-pulse rounded bg-muted" />
            <div className="aspect-[16/9] animate-pulse rounded-3xl bg-muted" />
            <div className="h-40 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="container-wide py-28 text-center">
            <p className="eyebrow mb-4">Journal</p>
            <h1 className="heading-lg">This article isn't available</h1>
            <p className="mt-4 text-muted-foreground">It may have been moved or retired. Browse the rest of the journal instead.</p>
            <Button asChild size="xl" className="mt-8">
              <Link to="/blog">
                <ArrowLeft /> Back to the journal
              </Link>
            </Button>
          </div>
        )}
      </SiteLayout>
    );
  }

  const seoTitle = sanitizeMetaField(blog.metaTitle) || buildMetaTitleForBlog(blog.title);
  const seoDescription = sanitizeMetaField(blog.metaDescription, 30) || buildMetaDescriptionForBlog(blog.content);
  const minutes = readingMinutes(blog.content);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${blogUrl}#blogpost`,
    headline: blog.title,
    datePublished: blog.date,
    dateModified: blog.date,
    image: blog.image,
    description: seoDescription,
    wordCount: stripHtml(blog.content).split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${minutes}M`,
    inLanguage: 'en',
    author: { '@type': 'Organization', '@id': `${SITE.url}/#jewelry-store`, name: SITE.name, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE.url}/#jewelry-store`,
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': blogUrl },
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, text: `Check out: ${blog.title}`, url: blogUrl });
        return;
      } catch {
        // cancelled: fall back to copying
      }
    }
    copyLink();
  };

  return (
    <SiteLayout>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={blogUrl}
        ogImage={blog.image}
        ogType="article"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: 'Journal', url: `${SITE.url}/blog` },
          { name: blog.title, url: blogUrl },
        ]}
        faqItems={blog.seoFaq && blog.seoFaq.length > 0 ? blog.seoFaq : undefined}
      />

      <article>
        <header className="container-wide max-w-4xl pb-10 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li><Link to="/blog" className="hover:text-foreground">Journal</Link></li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li className="line-clamp-1 text-foreground" aria-current="page">{blog.title}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="eyebrow">Journal</span>
            <span aria-hidden>·</span>
            <time dateTime={blog.date}>{formatDate(blog.date)}</time>
            <span aria-hidden>·</span>
            <span>{minutes} min read</span>
          </div>
          <h1 className="heading-xl mt-5 text-balance">{blog.title}</h1>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check /> : <Link2 />} {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="outline" size="sm" onClick={share}>
              <Share2 /> Share
            </Button>
          </div>
        </header>

        {blog.image && (
          <div className="container-wide max-w-6xl">
            <div className="clip-reveal overflow-hidden rounded-3xl bg-secondary">
              <img
                src={blog.image}
                alt={blog.title}
                className="aspect-[16/9] w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        )}

        <div className="container-wide max-w-3xl py-12 md:py-16">
          <div className="rich-text md:prose-lg" dangerouslySetInnerHTML={{ __html: content }} />

          <div className="mt-16 overflow-hidden rounded-3xl bg-secondary p-8 text-center md:p-12">
            <p className="eyebrow mb-3">Talk to an expert</p>
            <p className="heading-md text-balance">
              Have a question about <span className="accent">this?</span>
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Our diamond specialists are happy to help you choose, compare or design something of your own.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild variant="whatsapp" size="lg">
                <a
                  href={whatsappLink(`Hi Starlink Jewels! I read "${blog.title}" and I'd like to learn more.`, contactInfo?.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> Ask on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/categories">
                  Shop collections <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {otherBlogs.length > 0 && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Keep reading</p>
                <h2 className="heading-md">More from the journal</h2>
              </div>
              <Link to="/blog" className="link-underline shrink-0">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {otherBlogs.map((b, i) => (
                <Reveal key={b.id} delay={i * 80}>
                  <Link to={`/blog/${b.id}`} className="group block">
                    <div className="glint aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                      <img
                        src={b.thumbnail || b.image}
                        alt={b.title}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <time dateTime={b.date} className="mt-5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {formatDate(b.date, 'short')}
                    </time>
                    <h3 className="mt-2 font-display text-xl leading-snug transition-colors group-hover:text-brand">{b.title}</h3>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default BlogDetail;
