import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logo from '@/assets/starlink-logo-horizontal.png';
import { PromoHeader as PromoHeaderType } from '@/lib/storage';

gsap.registerPlugin(ScrollTrigger);

interface HeaderProps {
  promoHeader?: PromoHeaderType | null;
}

const Header = ({ promoHeader }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'Buying Guide', path: '/buying-guide' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Promo Header - Hidden on scroll */}
      <div 
        className={`bg-blue-600 text-white overflow-hidden transition-all duration-300 ease-in-out ${
          hasPromo && !isScrolled ? 'h-6 opacity-100' : 'h-0 opacity-0'
        }`}
      >
        <div className="h-full flex items-center">
          <div className="animate-marquee whitespace-nowrap inline-block">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="inline-block text-sm font-medium px-16">
                {promoHeader?.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        ref={headerRef}
        className={`transition-all duration-500 ease-in-out
          ${isScrolled 
            ? 'mx-2 mt-2 rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-lg border border-gray-200/50 dark:border-gray-700/50' 
            : 'bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/30 dark:border-gray-700/30'
          }
          backdrop-blur-xl`}
      >
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center z-50">
              <img 
                src={logo} 
                alt="Starlink Jewels - Premium Diamond Jewelry Store" 
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-9' : 'h-11'}`} 
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6" role="navigation" aria-label="Main navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-all duration-300 relative group ${
                      location.pathname === link.path
                        ? 'text-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                        location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                ))}
              </nav>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
            <nav className="flex flex-col gap-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-4" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${
                    location.pathname === link.path 
                      ? 'text-blue-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Header;