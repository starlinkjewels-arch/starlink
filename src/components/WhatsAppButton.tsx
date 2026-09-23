import { MessageCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Product } from '@/lib/storage';
import { stripHtml, SITE } from '@/lib/seo';
import { openWhatsApp } from '@/lib/whatsapp';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
  label?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

export const buildProductEnquiry = (product: Product) => {
  const summary = stripHtml(product.description || '').replace(/●/g, '•');
  const shortSummary = summary.length > 400 ? `${summary.slice(0, 397)}...` : summary;
  return [
    "Hi Starlink Jewels! I'm interested in:",
    '',
    `*${product.name}*`,
    `${SITE.url}/product/${product.id}`,
    shortSummary ? `\n${shortSummary}` : '',
  ].join('\n').trim();
};

const WhatsAppButton = ({ product, className, label = 'Enquire on WhatsApp', variant = 'default', size = 'xl' }: WhatsAppButtonProps) => {
  const { contactInfo } = useAppSelector(selectGlobalData);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        openWhatsApp(buildProductEnquiry(product), contactInfo?.whatsapp);
      }}
      className={className}
    >
      <MessageCircle />
      {label}
    </Button>
  );
};

export default WhatsAppButton;
