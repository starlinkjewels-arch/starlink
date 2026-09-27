import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityWidget from "@/components/site/AccessibilityWidget";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { whatsappLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { enquiry } from "@/lib/enquiry";

const FloatingWhatsApp = () => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 400);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <a
      href={whatsappLink(enquiry.general(`${SITE.url}${pathname === "/" ? "" : pathname}`), contactInfo?.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-white/60 bg-white/80 p-1.5 text-foreground shadow-[0_18px_40px_-14px_rgba(15,27,51,0.35)] ring-1 ring-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-14px_rgba(43,89,168,0.45)] dark:border-white/10 dark:bg-neutral-900/80 md:bottom-8 md:right-8 md:pr-5",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2fd06b] to-[#128c4b] text-white shadow-md">
        {/* soft pulse to draw the eye without shouting */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/30 [animation-duration:2.4s]" aria-hidden />
        <FaWhatsapp className="relative h-5 w-5" />
      </span>
      <span className="hidden leading-tight md:block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Need help?</span>
        <span className="block text-sm font-semibold transition-colors group-hover:text-brand">Chat with an expert</span>
      </span>
    </a>
  );
};

// The shell (header, footer, floating buttons) is mounted once in App and persists across pages.
// Rebuilding it on every navigation froze phones for seconds and could leave the page locked when
// the mobile menu was torn down mid-close. Pages still wrap themselves in <SiteLayout>, which now only
// renders their content and passes page options up to the shell.
interface ShellOptions {
  hideFloatingWhatsApp: boolean;
}

const ShellContext = createContext<(options: ShellOptions) => void>(() => {});

export const SiteShell = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ShellOptions>({ hideFloatingWhatsApp: false });
  return (
    <ShellContext.Provider value={setOptions}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {!options.hideFloatingWhatsApp && <FloatingWhatsApp />}
        <AccessibilityWidget raised={options.hideFloatingWhatsApp} />
      </div>
    </ShellContext.Provider>
  );
};

interface SiteLayoutProps {
  children: ReactNode;
  className?: string;
  /** Pages with their own sticky enquiry bar hide the floating button. */
  hideFloatingWhatsApp?: boolean;
}

const SiteLayout = ({ children, className, hideFloatingWhatsApp = false }: SiteLayoutProps) => {
  const setOptions = useContext(ShellContext);
  useLayoutEffect(() => {
    setOptions({ hideFloatingWhatsApp });
    return () => setOptions({ hideFloatingWhatsApp: false });
  }, [hideFloatingWhatsApp, setOptions]);
  return className ? <div className={className}>{children}</div> : <>{children}</>;
};

export default SiteLayout;
