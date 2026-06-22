import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/storage';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
}

const WhatsAppButton = ({ product, className }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    const productUrl = `https://starlinkjewels.com/product/${product.id}`;

    const message = `Hello Starlink Jewels! 👋\n\nI am interested in the following product and would like more details:\n\n🏷️ ${product.name}\n🆔 Product ID: ${product.id}\n\n🔗 View Product:\n${productUrl}\n\nCould you please share availability, customisation options, and delivery details?\n\nThank you!`;

    const whatsappNumber = '12015544824';
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`luxury-gradient text-primary-foreground hover:opacity-90 transition-opacity ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Request More Details
    </Button>
  );
};

export default WhatsAppButton;
