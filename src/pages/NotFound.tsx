import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SiteLayout from '@/components/site/SiteLayout';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  return (
    <SiteLayout>
      <Helmet>
        <title>Page Not Found | Starlink Jewels</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="heading-xl">This page has moved on</h1>
        <p className="mt-5 max-w-md text-muted-foreground">
          We couldn't find <span className="break-all font-medium text-foreground">{location.pathname}</span>. Let's get you back to something beautiful.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="xl">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/categories">Shop collections</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
};

export default NotFound;
