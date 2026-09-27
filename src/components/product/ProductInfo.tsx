import { useMemo } from 'react';
import { ShieldCheck, Truck, PencilRuler, Video, Share2, RotateCcw, Check } from 'lucide-react';
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
import { productUrl } from '@/lib/urls';

const highlights = [
  { icon: ShieldCheck, title: 'Certified', text: 'IGI / GIA graded' },
  { icon: Truck, title: 'Free shipping', text: 'Insured, worldwide' },
  { icon: PencilRuler, title: 'Made to order', text: 'Custom size & metal' },
  { icon: RotateCcw, title: 'Lifetime', text: 'Authenticity guarantee' },
];

// Reassurance sections under the description. Only promises the business already makes elsewhere
// on the site (no return windows or delivery times that haven't been confirmed).
const PROMISES = [
  {
    value: 'certification',
    icon: ShieldCheck,
    title: 'Certified & verified',
    lead: 'Know exactly what you are buying, before it ships.',
    points: [
      'Diamonds graded by IGI or GIA, the labs trusted by jewellers worldwide',
      'Certificate shared before dispatch, so you can check the report number yourself',
      'Lab-grown or natural: the type of every stone is stated clearly',
    ],
    cta: { label: 'Ask for this piece’s certificate', message: (name: string) => `Hi Starlink Jewels! Could you share the diamond certificate details for "${name}"?` },
  },
  {
    value: 'shipping',
    icon: Truck,
    title: 'Insured worldwide delivery',
    lead: 'From our Surat workshop to your door, protected all the way.',
    points: [
      'Complimentary insured shipping worldwide on orders over $500',
      'Fully tracked, in secure packaging',
      'Made to order: your delivery date is confirmed on WhatsApp before we begin',
    ],
    cta: { label: 'Check delivery time to my country', message: (name: string) => `Hi Starlink Jewels! How long would delivery of "${name}" take to my country?` },
  },
  {
    value: 'custom',
    icon: PencilRuler,
    title: 'Make it yours',
    lead: 'Every piece is crafted for you, not pulled from a shelf.',
    points: [
      'Choose 14K or 18K gold or platinum, in white, yellow or rose',
      'Your size, your stone: change the shape, carat or setting',
      'Approve a detailed CAD render before crafting begins, with no surprises',
    ],
    cta: { label: 'Customise this design', message: (name: string) => `Hi Starlink Jewels! I'd like to customise "${name}" (metal, size or stone).` },
  },
] as const;

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
  const shareUrl = productUrl(product);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
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
        {PROMISES.map(({ value, icon: Icon, title, lead, points, cta }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="gap-3 text-sm font-semibold uppercase tracking-[0.14em] hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                {title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pl-11 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">{lead}</p>
              <ul className="mt-3 space-y-2">
                {points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.2} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {cta && (
                <a
                  href={whatsappLink(cta.message(product.name), contactInfo?.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  <FaWhatsapp className="h-4 w-4" /> {cta.label}
                </a>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductInfo;
