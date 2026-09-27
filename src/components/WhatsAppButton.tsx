import { MessageCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Product } from '@/lib/storage';
import { openWhatsApp } from '@/lib/whatsapp';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { enquiry } from '@/lib/enquiry';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
  label?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

export const buildProductEnquiry = (product: Product) => enquiry.product(product);



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
