import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadBlogs, selectBlogsLoaded, selectBlogsStatus, selectGlobalData } from '@/store/contentSlice';
import { BlogPost } from '@/lib/storage';
import { SITE, buildMetaDescriptionForBlog, stripHtml } from '@/lib/seo';

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

const BlogCard = ({ blog }: { blog: BlogPost }) => (
  <Link to={`/blog/${blog.id}`} className="group block">
    <div className="glint aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
      <img src={blog.thumbnail || blog.image} alt={blog.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" decoding="async" />
    </div>
    <time dateTime={blog.date} className="mt-5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {formatDate(blog.date)}
    </time>
    <h2 className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-brand">{blog.title}</h2>
    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{stripHtml(blog.content)}</p>
  </Link>
);

const Blog = () => {
  const dispatch = useAppDispatch();
  const { categories, blogs } = useAppSelector(selectGlobalData);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sortedBlogs = useMemo(() => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [blogs]);
  const [featured, ...rest] = sortedBlogs;

  // Old shared links used /blog?id=…; send them to the article page.
  const legacyId = searchParams.get('id');
  useEffect(() => {
    if (legacyId) navigate(`/blog/${legacyId}`, { replace: true });
  }, [legacyId, navigate]);

  useEffect(() => {
    if (!blogsLoaded && blogsStatus === 'idle') dispatch(loadBlogs());
  }, [blogsLoaded, blogsStatus, dispatch]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE.url}/blog#blog`,
    name: 'Starlink Jewels Journal - Expert Jewelry Insights & Guides',
    description: 'Expert insights, trends, and guides about diamonds, gemstones, and fine jewelry from Starlink Jewels.',
    url: `${SITE.url}/blog`,
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.png` } },
    blogPost: sortedBlogs.slice(0, 10).map((blog) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE.url}/blog/${blog.id}#blogpost`,
      headline: blog.title,
      datePublished: blog.date,
      dateModified: blog.date,
      image: blog.image,
      description: buildMetaDescriptionForBlog(blog.content),
      mainEntityOfPage: `${SITE.url}/blog/${blog.id}`,
      author: { '@type': 'Organization', name: SITE.name },
    })),
  };

  return (
    <SiteLayout>
      <SEOHead
        title="Jewelry Journal - Diamond Guides, Engagement Ring Tips & Trends"
        description="Expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest fine jewelry trends from Starlink Jewels."
        keywords="jewelry blog, diamond buying guide, engagement ring tips, lab grown vs natural diamonds, gemstone guide, jewelry care tips, wedding ring guide, custom jewelry design"
        canonicalUrl={`${SITE.url}/blog`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: SITE.url },
          { name: 'Journal', url: `${SITE.url}/blog` },
        ]}
        faqItems={defaultFaqItems}
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
                    <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
                    <div className="mt-5 h-6 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {featured && (
                <Reveal>
                  <Link to={`/blog/${featured.id}`} className="group grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
                    <div className="glint aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
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
                  </Link>
                </Reveal>
              )}

              {rest.length > 0 && (
                <div className="mt-20 grid gap-x-8 gap-y-14 border-t pt-16 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((blog, i) => (
                    <Reveal key={blog.id} delay={(i % 3) * 80}>
                      <BlogCard blog={blog} />
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
                  <div className="aspect-square overflow-hidden rounded-3xl bg-muted">
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                  </div>
                  <p className="mt-3 text-sm font-medium group-hover:text-brand">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default Blog;
