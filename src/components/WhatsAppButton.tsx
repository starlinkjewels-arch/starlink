import { MessageCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Product } from '@/lib/storage';
import { SITE } from '@/lib/seo';
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

export const buildProductEnquiry = (product: Product) =>
  `Hello Starlink Jewels! 👋

I am interested in the following product and would like more details:

🏷️ ${product.name}

🔗 View Product:
${SITE.url}/product/${product.id}

Could you please share availability, customisation options, and delivery details?

Thank you!`;

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
