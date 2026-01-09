import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';
import { getContact } from '@/lib/storage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Gallery = () => {
  const { categories, galleryItems, promoHeader } = useGlobalData();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('919967381180');
  const [filter, setFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  useEffect(() => {
    setIsLoaded(true);
    getContact().then(contact => {
      if (contact?.whatsapp) setWhatsappNumber(contact.whatsapp);
    });
  }, []);

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < galleryItems.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  const handleBuyOnWhatsApp = () => {
    if (selectedIndex === null) return;
    const item = galleryItems[selectedIndex];
    const message = `Hi! I'm interested in this item from your gallery:\n\n${item.image}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, galleryItems.length]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Starlink Jewels Gallery - Diamond & Gold Jewelry Collection',
    description: 'Browse our stunning collection of GIA certified diamond jewelry, engagement rings, gold necklaces, and luxury pieces.',
    url: 'https://starlinkjewels.com/gallery',
    image: galleryItems.slice(0, 10).map(item => item.image),
    numberOfItems: galleryItems.length
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Jewelry Gallery - Diamond & Gold Collection Photos | Starlink Jewels"
        description="Browse our gallery of exquisite GIA certified diamond jewelry. View stunning engagement rings, gold necklaces, earrings, bracelets. High-quality photos of luxury jewelry pieces."
        keywords="jewelry gallery, diamond jewelry photos, gold jewelry images, engagement ring photos, luxury jewelry collection, diamond necklace gallery, gold earrings photos, jewelry design gallery, real jewelry photos, diamond ring images"
        canonicalUrl="https://starlinkjewels.com/gallery"
        structuredData={structuredData}
      />


        {/* Hero Section */}
        <div className={`text-center mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Our Gallery
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of fine jewelry
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gallery Coming Soon</h3>
            <p className="text-gray-600">We&rsquo;re curating an exceptional collection for you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`group cursor-pointer transition-all duration-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 40}ms` }}
                onClick={() => setSelectedIndex(index)}
              >
                <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  {/* Image Container */}
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img 
                      src={item.image} 
                      alt={item.description || 'Luxury Jewelry'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      loading="lazy" 
                    />
                  </div>

                  {/* Description Overlay - Slides up from bottom on hover */}
                  {item.description && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium line-clamp-2">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {galleryItems.length > 0 && (
          <div className="mt-16 text-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-10 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Find Your Perfect Piece
            </h2>
            <p className="text-lg text-blue-50 mb-6 max-w-2xl mx-auto">
              Connect with us to explore our collection and find the jewelry that speaks to you
            </p>
            <Button 
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-6 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FaWhatsapp className="h-5 w-5 mr-2 text-[#25D366]" />
              Connect With Us
            </Button>
          </div>
        )}


      {/* Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden bg-white border border-gray-200">
          {selectedIndex !== null && (
            <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative bg-gray-100">
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedIndex(null)}
                  className="absolute top-3 right-3 z-20 h-9 w-9 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all duration-200"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>

                {/* Counter */}
                <div className="absolute top-3 left-3 z-10 bg-white shadow-md px-3 py-1.5 rounded-full">
                  <span className="text-sm font-medium text-gray-700">{selectedIndex + 1} / {galleryItems.length}</span>
                </div>

                {/* Navigation Buttons */}
                {selectedIndex > 0 && (
                  <button 
                    onClick={handlePrevious} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all duration-200"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                )}
                
                {selectedIndex < galleryItems.length - 1 && (
                  <button 
                    onClick={handleNext} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-all duration-200"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                )}

                {/* Image */}
                <img 
                  src={galleryItems[selectedIndex].image} 
                  alt={galleryItems[selectedIndex].description || 'Gallery image'} 
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>

              {/* Info Section */}
              <div className="bg-white p-6 border-t border-gray-200">
                {galleryItems[selectedIndex].description && (
                  <p className="text-gray-700 mb-5 text-center text-base">
                    {galleryItems[selectedIndex].description}
                  </p>
                )}
                
                <Button 
                  onClick={handleBuyOnWhatsApp} 
                  className="w-full bg-[#25D366] hover:bg-[#20BA59] text-white h-12 font-semibold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <FaWhatsapp className="h-5 w-5 mr-2" />
                  Order on WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;