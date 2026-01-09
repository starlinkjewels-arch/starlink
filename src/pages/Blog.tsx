import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import BlogDialog from '@/components/BlogDialog';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPost } from '@/lib/storage';

const Blog = () => {
  const { categories, blogs, promoHeader, contactInfo } = useGlobalData();
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [blogs]
  );

  // Handle URL query param to open specific blog
  useEffect(() => {
    const blogId = searchParams.get('id');
    if (blogId && blogs.length > 0) {
      const blog = blogs.find(b => b.id === blogId);
      if (blog) {
        setSelectedBlog(blog);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, blogs]);

  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Starlink Jewels Blog - Expert Jewelry Insights & Guides',
    description: 'Expert insights, trends, and comprehensive guides about luxury jewelry, diamonds, gemstones, and precious metals from Starlink Jewels.',
    url: 'https://starlinkjewels.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Starlink Jewels',
      logo: {
        '@type': 'ImageObject',
        url: 'https://starlinkjewels.com/logo.png'
      }
    },
    blogPost: sortedBlogs.slice(0, 10).map(blog => ({
      '@type': 'BlogPosting',
      headline: blog.title,
      datePublished: blog.date,
      dateModified: blog.date,
      image: blog.image,
      description: blog.content.substring(0, 160),
      author: {
        '@type': 'Organization',
        name: 'Starlink Jewels'
      }
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Jewelry Blog - Diamond Tips, Engagement Ring Guides & Luxury Trends | Starlink Jewels"
        description="Discover expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest luxury jewelry trends from Starlink Jewels experts."
        keywords="jewelry blog, diamond buying guide, engagement ring tips, jewelry trends 2024, gemstone guide, diamond education, luxury jewelry tips, how to buy diamonds, jewelry care tips, wedding ring guide, precious stones, gold jewelry guide, platinum jewelry, custom jewelry design, jewelry investment"
        canonicalUrl="https://starlinkjewels.com/blog"
        structuredData={structuredData}
      />


        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Jewelry Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover expert insights, diamond buying guides, and the latest trends in luxury jewelry. 
            Your trusted source for jewelry education and inspiration.
          </p>
        </div>

        {sortedBlogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBlogs.map((blog) => (
              <article key={blog.id}>
                <Card 
                  className="overflow-hidden hover-lift group h-full cursor-pointer transition-all duration-300 hover:shadow-xl"
                  onClick={() => handleBlogClick(blog)}
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img 
                      src={blog.thumbnail || blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      loading="lazy" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <time dateTime={blog.date} className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                      {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                    <h2 className="font-semibold text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        )}


      <BlogDialog
        blog={selectedBlog}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        whatsappNumber={contactInfo?.whatsapp}
      />
    </div>
  );
};

export default Blog;