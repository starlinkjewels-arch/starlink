import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import BlogDialog from '@/components/BlogDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadBlogs, selectBlogsLoaded, selectBlogsStatus, selectGlobalData } from '@/store/contentSlice';
import { BlogPost } from '@/lib/storage';
import { buildMetaDescriptionForBlog, buildMetaTitleForBlog, stripHtml } from '@/lib/seo';

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const defaultFaqItems = [
  {
    question: 'What topics do you cover in the Starlink Jewels journal?',
    answer: 'We cover diamond buying guides, engagement ring tips, jewelry care, gemstone education, and luxury jewelry trends.',
  },
  {
    question: 'Are your guides suitable for lab-grown and natural diamonds?',
    answer: 'Yes. Our guides explain both lab-grown and natural diamond options with practical buying advice.',
  },
  {
    question: 'Can I request a topic?',
    answer: 'Yes. You can contact us to request specific jewelry or diamond topics.',
  },
];

const BlogCard = ({ blog, onOpen }: { blog: BlogPost; onOpen: (b: BlogPost) => void }) => (
  <button type="button" onClick={() => onOpen(blog)} className="group block w-full text-left">
    <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
      <img src={blog.thumbnail || blog.image} alt={blog.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" decoding="async" />
    </div>
    <time dateTime={blog.date} className="mt-5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {formatDate(blog.date)}
    </time>
    <h2 className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-brand">{blog.title}</h2>
    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{stripHtml(blog.content)}</p>
  </button>
);

const Blog = () => {
  const dispatch = useAppDispatch();
  const { categories, blogs, contactInfo } = useAppSelector(selectGlobalData);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: routeBlogId } = useParams<{ id: string }>();

  const sortedBlogs = useMemo(() => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [blogs]);
  const [featured, ...rest] = sortedBlogs;

  // The open article is driven by the URL (/blog/:id, or legacy /blog?id=) so links are shareable.
  const openId = routeBlogId || searchParams.get('id');
  const selectedBlog = useMemo(() => (openId ? blogs.find((b) => b.id === openId) || null : null), [blogs, openId]);

  useEffect(() => {
    if (!blogsLoaded && blogsStatus === 'idle') dispatch(loadBlogs());
  }, [blogsLoaded, blogsStatus, dispatch]);

  const openBlog = (blog: BlogPost) => navigate(`/blog/${blog.id}`);
  const closeBlog = () => navigate('/blog');

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': 'https://www.starlinkjewels.com/blog#blog',
      name: 'Starlink Jewels Journal - Expert Jewelry Insights & Guides',
      description: 'Expert insights, trends, and guides about diamonds, gemstones, and fine jewelry from Starlink Jewels.',
      url: 'https://www.starlinkjewels.com/blog',
      publisher: { '@type': 'Organization', name: 'Starlink Jewels', logo: { '@type': 'ImageObject', url: 'https://www.starlinkjewels.com/icon.png' } },
      blogPost: sortedBlogs.slice(0, 10).map((blog) => ({
        '@type': 'BlogPosting',
        '@id': `https://www.starlinkjewels.com/blog/${blog.id}#blogpost`,
        headline: blog.title,
        datePublished: blog.date,
        dateModified: blog.date,
        image: blog.image,
        description: buildMetaDescriptionForBlog(blog.content),
        mainEntityOfPage: `https://www.starlinkjewels.com/blog/${blog.id}`,
        author: { '@type': 'Organization', name: 'Starlink Jewels' },
      })),
    },
    ...(selectedBlog
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `https://www.starlinkjewels.com/blog/${selectedBlog.id}#blogpost`,
            headline: selectedBlog.title,
            datePublished: selectedBlog.date,
            dateModified: selectedBlog.date,
            image: selectedBlog.image,
            description: buildMetaDescriptionForBlog(selectedBlog.content),
            author: { '@type': 'Organization', name: 'Starlink Jewels' },
            mainEntityOfPage: `https://www.starlinkjewels.com/blog/${selectedBlog.id}`,
          },
        ]
      : []),
  ];

  return (
    <SiteLayout>
      <SEOHead
        title={selectedBlog ? selectedBlog.metaTitle || buildMetaTitleForBlog(selectedBlog.title) : 'Jewelry Journal - Diamond Guides, Engagement Ring Tips & Trends'}
        description={
          selectedBlog
            ? selectedBlog.metaDescription || buildMetaDescriptionForBlog(selectedBlog.content)
            : 'Expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest fine jewelry trends from Starlink Jewels.'
        }
        keywords="jewelry blog, diamond buying guide, engagement ring tips, lab grown vs natural diamonds, gemstone guide, jewelry care tips, wedding ring guide, custom jewelry design"
        canonicalUrl={`https://www.starlinkjewels.com/blog${selectedBlog ? `/${selectedBlog.id}` : ''}`}
        ogImage={selectedBlog?.image}
        ogType={selectedBlog ? 'article' : 'website'}
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.starlinkjewels.com' },
          { name: 'Journal', url: 'https://www.starlinkjewels.com/blog' },
          ...(selectedBlog ? [{ name: selectedBlog.title, url: `https://www.starlinkjewels.com/blog/${selectedBlog.id}` }] : []),
        ]}
        faqItems={selectedBlog?.seoFaq?.length ? selectedBlog.seoFaq : defaultFaqItems}
      />

      <PageHero
        eyebrow="The journal"
        title="Guides, stories & trends"
        description="Expert advice on diamonds, craftsmanship and styling from the Starlink Jewels team."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Journal' }]}
      />

      <section className="section">
        <div className="container-wide">
          {sortedBlogs.length === 0 ? (
            blogsLoaded || blogsStatus === 'failed' ? (
              <p className="py-20 text-center text-muted-foreground">New articles are coming soon.</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[4/3] animate-pulse rounded-md bg-muted" />
                    <div className="mt-5 h-6 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {featured && (
                <Reveal>
                  <button type="button" onClick={() => openBlog(featured)} className="group grid w-full items-center gap-8 text-left lg:grid-cols-[1.3fr_1fr] lg:gap-14">
                    <div className="aspect-[16/10] overflow-hidden rounded-md bg-muted">
                      <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="eager" decoding="async" />
                    </div>
                    <div>
                      <p className="eyebrow mb-4">Latest article</p>
                      <h2 className="heading-lg text-balance transition-colors group-hover:text-brand">{featured.title}</h2>
                      <p className="mt-5 line-clamp-3 leading-relaxed text-muted-foreground">{stripHtml(featured.content)}</p>
                      <p className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDate(featured.date)}</p>
                      <span className="link-underline mt-6">
                        Read article <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              )}

              {rest.length > 0 && (
                <div className="mt-20 grid gap-x-8 gap-y-14 border-t pt-16 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((blog, i) => (
                    <Reveal key={blog.id} delay={(i % 3) * 80}>
                      <BlogCard blog={blog} onOpen={openBlog} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="border-t bg-secondary/40 py-16 md:py-20">
          <div className="container-wide">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="heading-md">Shop the collections</h2>
              <Link to="/categories" className="link-underline shrink-0">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/category/${category.id}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                  </div>
                  <p className="mt-3 text-sm font-medium group-hover:text-brand">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogDialog blog={selectedBlog} isOpen={Boolean(selectedBlog)} onClose={closeBlog} whatsappNumber={contactInfo?.whatsapp} />
    </SiteLayout>
  );
};

export default Blog;
