import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadBlogs, loadGlobalData, selectBlogsLoaded, selectBlogsStatus, selectContentStatus, selectGlobalData } from "@/store/contentSlice";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildMetaDescriptionForBlog, buildMetaTitleForBlog, sanitizeMetaField } from '@/lib/seo';
import { Calendar, MessageCircle, Share2, Copy, Check, ArrowLeft, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categories, blogs, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [copied, setCopied] = useState(false);
  const [requestedRefresh, setRequestedRefresh] = useState(false);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  useEffect(() => {
    if (!requestedRefresh && blogs.length === 0 && status !== 'loading') {
      dispatch(loadGlobalData({ force: true }));
      setRequestedRefresh(true);
    }
  }, [blogs.length, dispatch, requestedRefresh, status]);

  useEffect(() => {
    if (!blogsLoaded && blogsStatus === 'idle') {
      dispatch(loadBlogs());
    }
  }, [blogsLoaded, blogsStatus, dispatch]);

  const blog = useMemo(() => blogs.find((b) => b.id === id) ?? null, [blogs, id]);

  const otherBlogs = useMemo(
    () =>
      blogs
        .filter((b) => b.id !== id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4),
    [blogs, id]
  );

  const blogUrl = `https://starlinkjewels.com/blog/${id}`;

  const handleWhatsAppShare = () => {
    const whatsappNumber = contactInfo?.whatsapp || '12015544824';
    const message = encodeURIComponent(
      `Hi! I read your blog: "${blog?.title}" and I'd like to learn more.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      toast.success('Blog link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({ title: blog.title, text: `Check out: ${blog.title}`, url: blogUrl });
        return;
      } catch {
        // fall through
      }
    }
    handleCopyUrl();
  };

  const cleanContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove SEO/meta noise
    tempDiv
      .querySelectorAll('meta, title, link, script, style, [data-meta], .meta-info, .seo-info')
      .forEach((el) => el.remove());

    // Unwrap anchor tags inside headings (removes underline/link styling on headings)
    tempDiv.querySelectorAll('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a').forEach((a) => {
      const parent = a.parentNode;
      if (parent) {
        while (a.firstChild) parent.insertBefore(a.firstChild, a);
        parent.removeChild(a);
      }
    });

    // Remove empty paragraphs (whitespace / <br>-only)
    tempDiv.querySelectorAll('p').forEach((p) => {
      const text = (p.textContent ?? '').trim();
      const inner = p.innerHTML.replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/g, '').trim();
      if (!text && !inner) p.remove();
    });

    // Collapse 3+ consecutive <br> into a single <br>
    let result = tempDiv.innerHTML;
    result = result.replace(/(<br\s*\/?>[\s]*){3,}/gi, '<br>');

    return result;
  };

  // Estimate read time
  const readTime = useMemo(() => {
    if (!blog) return 0;
    const words = blog.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [blog]);

  const isLoading = !blog && (status === 'loading' || blogsStatus === 'loading');
  const isNotFound = !blog && blogsLoaded;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop: `${paddingTop}px` }}>
          <p className="text-muted-foreground animate-pulse text-lg">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header promoHeader={promoHeader} />
        <MiniHeader categories={categories} promoHeight={promoHeight} />
        <main
          className="flex-1 flex flex-col items-center justify-center gap-5"
          style={{ paddingTop: `${paddingTop}px` }}
        >
          <p className="text-xl font-semibold">Blog post not found.</p>
          <Button variant="outline" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const seoTitle = blog ? sanitizeMetaField(blog.metaTitle) || buildMetaTitleForBlog(blog.title) : '';
  const seoDescription = blog
    ? sanitizeMetaField(blog.metaDescription, 30) || buildMetaDescriptionForBlog(blog.content)
    : '';

  const structuredData = blog
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `${blogUrl}#blogpost`,
          headline: blog.title,
          datePublished: blog.date,
          dateModified: blog.date,
          image: blog.image,
          description: seoDescription,
          author: {
            '@type': 'Organization',
            '@id': 'https://starlinkjewels.com/#organization',
            name: 'Starlink Jewels',
            url: 'https://starlinkjewels.com',
          },
          mainEntityOfPage: blogUrl,
          publisher: {
            '@type': 'Organization',
            '@id': 'https://starlinkjewels.com/#organization',
            name: 'Starlink Jewels',
            logo: { '@type': 'ImageObject', url: 'https://starlinkjewels.com/icon.png' },
          },
        },
      ]
    : [];

  const faqItems =
    blog?.seoFaq && blog.seoFaq.length > 0 ? blog.seoFaq : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {blog && (
        <SEOHead
          title={seoTitle}
          description={seoDescription}
          canonicalUrl={blogUrl}
          structuredData={structuredData}
          breadcrumbs={[
            { name: 'Home', url: 'https://starlinkjewels.com' },
            { name: 'Blog', url: 'https://starlinkjewels.com/blog' },
            { name: blog.title, url: blogUrl },
          ]}
          faqItems={faqItems}
        />
      )}

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      {blog && (
        <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

          {/* Hero — full-width cover image with gradient overlay + title */}
          <div className="relative w-full h-[340px] sm:h-[420px] md:h-[500px] overflow-hidden bg-muted">
            <OptimizedImage
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
            />
            {/* gradient: transparent top → dark bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Overlaid content — left aligned */}
            <div className="absolute inset-0 flex flex-col justify-end">
              <div className="px-6 md:px-10 lg:px-14 pb-8 max-w-2xl">
                {/* Badge + meta */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Blog Post
                  </span>
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={blog.date}>
                      {new Date(blog.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <BookOpen className="h-3.5 w-3.5" />
                    {readTime} min read
                  </div>
                </div>
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-md">
                  {blog.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Article body */}
          <article className="container mx-auto px-4 pt-6 pb-14 max-w-3xl">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 flex-wrap"
            >
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-foreground/70 line-clamp-1">{blog.title}</span>
            </nav>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-y border-border mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Blog Post
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={blog.date}>
                    {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  {readTime} min read
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>
            </div>

            {/* Body — prose */}
            <div className="prose prose-base max-w-none
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:leading-snug
              prose-h1:text-[1.25rem] prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-3
              prose-h2:text-[1.1rem] prose-h2:mt-6 prose-h2:mb-2
              prose-h3:text-[1rem] prose-h3:mt-4 prose-h3:mb-1.5
              prose-h4:text-[0.95rem] prose-h4:mt-3 prose-h4:mb-1
              prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-[15px] prose-p:my-2.5
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:text-foreground/80 prose-ol:text-foreground/80 prose-ul:pl-5 prose-ol:pl-5 prose-ul:my-3 prose-ol:my-3
              prose-li:my-0.5 prose-li:text-[15px]
              prose-hr:border-border prose-hr:my-5
              prose-img:rounded-xl prose-img:shadow-md prose-img:my-5
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-1 prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:not-italic prose-blockquote:my-5
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
              prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-4
              prose-table:text-sm prose-thead:bg-muted prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2">
              <div dangerouslySetInnerHTML={{ __html: cleanContent(blog.content) }} />
            </div>

            {/* Divider */}
            <div className="my-10 border-t border-border" />

            {/* WhatsApp CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-base">Interested in our jewelry?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'd love to help you find the perfect piece. Chat with us directly on WhatsApp.
                </p>
              </div>
              <Button
                onClick={handleWhatsAppShare}
                className="gap-2 bg-[#25D366] hover:bg-[#20BA59] text-white font-semibold px-6 py-2.5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </div>
          </article>

          {/* More Posts */}
          {otherBlogs.length > 0 && (
            <section className="bg-muted/40 border-t border-border py-14">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold">More from Our Blog</h2>
                  <Link
                    to="/blog"
                    className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {otherBlogs.map((b) => (
                    <article key={b.id}>
                      <Link to={`/blog/${b.id}`} className="block group">
                        <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="aspect-[4/3] overflow-hidden bg-muted">
                            <OptimizedImage
                              src={b.thumbnail || b.image}
                              alt={b.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              wrapperClassName="w-full h-full"
                            />
                          </div>
                          <CardContent className="p-4">
                            <time
                              dateTime={b.date}
                              className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider"
                            >
                              {new Date(b.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                              {b.title}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetail;
