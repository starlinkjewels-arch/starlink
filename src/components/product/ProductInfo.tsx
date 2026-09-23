import { useMemo } from 'react';
import { ShieldCheck, Truck, PencilRuler, Video, Share2, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/storage';
import { cleanRichTextHtml, SITE } from '@/lib/seo';
import { sanitizeHtml } from '@/lib/sanitize';
import { openWhatsApp, whatsappLink } from '@/lib/whatsapp';
import { buildProductEnquiry } from '@/components/WhatsAppButton';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import GIA from '@/assets/paylogo/GIA_Logo.png';
import IGI from '@/assets/paylogo/igi logo.webp';

const highlights = [
  { icon: ShieldCheck, title: 'Certified', text: 'IGI / GIA graded' },
  { icon: Truck, title: 'Free shipping', text: 'Insured, worldwide' },
  { icon: PencilRuler, title: 'Made to order', text: 'Custom size & metal' },
  { icon: RotateCcw, title: 'Lifetime', text: 'Authenticity guarantee' },
];

interface ProductInfoProps {
  product: Product;
  /** Show the description expanded (product page) vs collapsed. */
  descriptionOpen?: boolean;
}

// Buying panel shared by the product page and the quick-view dialog.
const ProductInfo = ({ product, descriptionOpen = true }: ProductInfoProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);
  // Descriptions are often pasted from other apps; drop their inline fonts/colours so they match the site.
  const descriptionHtml = useMemo(
    () => sanitizeHtml(cleanRichTextHtml(product.description || ''), { stripInlineStyles: true }),
    [product.description]
  );
  const videoCallHref = whatsappLink(
    `Hi Starlink Jewels! I'd like a live video call to see "${product.name}" before ordering.`,
    contactInfo?.whatsapp
  );
  const productUrl = `${SITE.url}/product/${product.id}`;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: productUrl });
        return;
      }
      await navigator.clipboard.writeText(productUrl);
      toast.success('Link copied');
    } catch {
      // share sheet dismissed
    }
  };

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <Button size="xl" className="w-full" onClick={() => openWhatsApp(buildProductEnquiry(product), contactInfo?.whatsapp)}>
          <FaWhatsapp className="!h-5 !w-5 text-whatsapp" /> Enquire on WhatsApp
        </Button>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Button asChild variant="outline" size="xl" className="w-full">
            <a href={videoCallHref} target="_blank" rel="noopener noreferrer">
              <Video /> Live video viewing
            </a>
          </Button>
          <Button variant="outline" size="xl" className="px-4" onClick={share} aria-label="Share this piece">
            <Share2 />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {highlights.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border bg-secondary/40 px-3 py-3.5 text-center">
            <Icon className="mx-auto h-5 w-5 text-brand" strokeWidth={1.5} />
            <p className="mt-2 text-xs font-semibold">{title}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-lg border px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Certified by</span>
        <img src={GIA} alt="GIA" className="h-7 w-auto object-contain dark:invert" loading="lazy" />
        <img src={IGI} alt="IGI" className="h-8 w-auto object-contain dark:invert" loading="lazy" />
      </div>

      <Accordion type="multiple" defaultValue={descriptionOpen ? ['details'] : []} className="w-full">
        {descriptionHtml && (
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.14em] hover:no-underline">Product details</AccordionTrigger>
            <AccordionContent>
              <div className="rich-text prose-sm prose-headings:font-sans prose-headings:text-sm prose-headings:font-semibold prose-headings:tracking-normal" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="certification">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.14em] hover:no-underline">Certification</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            Diamonds are certified by IGI or GIA where applicable. Certificates are shared before dispatch so you can verify every stone.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.14em] hover:no-underline">Shipping &amp; delivery</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            Each piece is made to order and shipped fully insured with tracking. Complimentary worldwide shipping on orders over $500.
            Delivery timelines depend on your design and region; our team confirms them on WhatsApp.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="custom">
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.14em] hover:no-underline">Customisation</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            Choose your metal (14K/18K gold or platinum), size and stone. We share CAD renders for approval before crafting begins.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductInfo;
