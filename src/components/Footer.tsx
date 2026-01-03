import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { getContact, ContactInfo } from '@/lib/storage';
import logo from '@/assets/starlink-logo-full.png';
import Zelle from '@/assets/paylogo/Zelle_(payment_service)-Logo.wine.png';
import Venmo from '@/assets/paylogo/Venmo-Logo.wine.png';
import Google from '@/assets/paylogo/Google_Pay-Logo.wine.png';
import PayPal from '@/assets/paylogo/PayPal-Logo.wine.png';
import Bank from '@/assets/paylogo/Wells_Fargo-Logo.wine.png';
import Visa from '@/assets/paylogo/Visa_Inc.-Logo.wine.png';
import GIA from '@/assets/paylogo/GIA_Logo.png';
import Rapaport from '@/assets/paylogo/Rapaport-header-20250120083212-20250210092659-20250227142926-20250310094122.svg';
import SDA from '@/assets/paylogo/sda.png';
import Bourse from '@/assets/paylogo/SDB LOGO.png';









const Footer = () => {
  const [contact, setContact] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
  });

  useEffect(() => {
    getContact().then(setContact);
  }, []);

  const paymentMethods = [
    { name: 'Zelle', logo: Zelle },
    { name: 'Venmo', logo: Venmo },
    { name: 'Google Pay', logo: Google },
    // { name: 'PayPal', logo: PayPal },
    { name: 'Visa', logo: Visa },
    { name: 'Bank Wire', logo: Bank }
  ];
  const trustedBadges = [
    { name: 'GIA', logo: GIA },
    { name: 'Rapaport', logo: Rapaport },
    { name: 'Surat Diamond Association', logo: SDA },
    { name: 'Surat Diamond Bourse', logo:Bourse },
    { name: 'Surat Jewelery Association', logo: 'https://sjma.in/cdn/shop/files/SJMA_Logo.png?v=1755163553&width=210' }
  ];


  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Trust Bar Section - New compact bar like Ouros Jewels */}
        <div className="bg-[#d3dcef] text-white py-6 px-8 rounded-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
            {/* Left: Trusted By Badges */}

            <div className="flex flex-col items-center lg:items-start gap-2">
              {/* <span className="text-white-300 whitespace-nowrap font-semibold">Trusted By</span> */}
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-end">
                {trustedBadges.map((method) => (
                  <img
                    key={method.name}
                    src={method.logo}
                    alt={method.name}
                    className="h-20 w-20 rounded-full object-contain bg-white/20 p-0.5 shadow-sm"
                    loading="lazy"
                    title={method.name}
                  />
                ))}
              </div>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex justify-center lg:justify-center">
              <img
                src={logo}
                alt="Starlink Jewels"
                className="h-20 w-auto mx-auto p-1 object-contain"
              />
            </div>

            {/* Right: Easy Payment Icons */}
            <div className="flex flex-col items-center lg:items-end gap-2">
              {/* <span className="text-white-300 whitespace-nowrap font-semibold">Easy Payment</span> */}
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-end">
                {paymentMethods.map((method) => (
                  <img
                    key={method.name}
                    src={method.logo}
                    alt={method.name}
                    className="h-20 w-20 rounded-full object-contain bg-white/20 p-0.5 shadow-sm"
                    loading="lazy"
                    title={method.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Starlink Jewels" className="h-20 w-auto" />
            <p className="text-sm text-muted-foreground">
              Discover Exquisite Lab-Lrown and Natural Diamond Jewelry. Premium Luxury Collections
              for Every Occasion.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contact.address && (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contact.instagram && (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contact.twitter && (
                <a
                  href={contact.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {contact.pinterest && (
                <a
                  href={contact.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all"
                  aria-label="Pinterest"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.804 1.604.804 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.383-4.042-3.104 0-4.688 2.029-4.688 4.191 0 1.025.388 1.938 1.221 2.279.137.056.21.031.243-.084l.23-.944c.019-.081.01-.15-.056-.23-.213-.263-.384-.746-.384-1.194 0-1.16.876-2.278 2.364-2.278 1.289 0 2.211.878 2.211 2.132 0 1.428-.708 2.413-1.622 2.413-.504 0-.883-.417-.762-.928.144-.609.424-1.267.424-1.707 0-.394-.211-.723-.649-.723-.515 0-.928.533-.928 1.249 0 .456.154.764.154.764l-.624 2.642c-.148.621-.082 1.584-.021 2.144C5.757 17.998 3.5 15.238 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Starlink Jewels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
