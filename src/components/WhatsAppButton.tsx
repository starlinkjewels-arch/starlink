import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/storage';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
}

const WhatsAppButton = ({ product, className }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    // Strip HTML tags and decode common HTML entities for cleaner text
    let cleanDescription = product.description
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')       // Replace &nbsp; with space
      .replace(/&amp;/g, '&')        // Replace &amp; with &
      .trim();

    // Optional: Replace multiple spaces or bullet-like characters with proper WhatsApp bullets
    cleanDescription = cleanDescription.replace(/●/g, '•');

    const priceInDollars = `$${product.price.replace(/[^0-9.]/g, '')}`;

    const message = `Hi! I'm interested in:\n\n*${
      product.name
    }*\nPrice: ${priceInDollars}\n\n${cleanDescription}`;

    const whatsappNumber = '+919967381180'; // Fixed number

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`luxury-gradient text-primary-foreground hover:opacity-90 transition-opacity ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Request For More Details
    </Button>
  );
};

export default WhatsAppButton;
