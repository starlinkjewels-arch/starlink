import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Sections that open a dialog by changing the URL; switching within them should keep scroll position.
const sectionOf = (path: string) => {
  if (path === '/blog' || path.startsWith('/blog/')) return '/blog';
  if (path === '/buying-guide' || path.startsWith('/buying-guide/')) return '/buying-guide';
  return path;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    const sameSection = sectionOf(previous.current) === sectionOf(pathname) && previous.current !== pathname;
    previous.current = pathname;
    if (sameSection && pathname.startsWith('/blog')) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
