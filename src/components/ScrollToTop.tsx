import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Each page renders its own header, so a menu/search panel that was open when a link was
    // tapped is removed mid-close. If that leaves the page scroll- or tap-locked (a known iOS Safari risk),
    // clear that once the new page is up and no panel is actually open.
    const id = window.setTimeout(() => {
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const body = document.body;
      if (body.style.pointerEvents === 'none') body.style.pointerEvents = '';
      if (body.hasAttribute('data-scroll-locked')) {
        body.removeAttribute('data-scroll-locked');
        body.style.removeProperty('overflow');
      }
    }, 600);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
