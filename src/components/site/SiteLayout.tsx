import { useEffect, useState, type ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityWidget from "@/components/site/AccessibilityWidget";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const FloatingWhatsApp = () => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappLink("Hi Starlink Jewels! I'm browsing your website and have a question.", contactInfo?.whatsapp)}
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

interface SiteLayoutProps {
  children: ReactNode;
  className?: string;
  /** Pages with their own sticky enquiry bar hide the floating button. */
  hideFloatingWhatsApp?: boolean;
}

const SiteLayout = ({ children, className, hideFloatingWhatsApp = false }: SiteLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className={cn("flex-1", className)}>{children}</main>
    <Footer />
    {!hideFloatingWhatsApp && <FloatingWhatsApp />}
    <AccessibilityWidget raised={hideFloatingWhatsApp} />
  </div>
);

export default SiteLayout;
