'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/storage';
import { Sparkles, ChevronRight } from 'lucide-react';

interface MiniHeaderProps {
  categories?: Category[];
  promoHeight?: number;
}

const MiniHeader = ({ categories = [], promoHeight = 0 }: MiniHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate top position: promo (0 or 40) + header (80)
  const topPosition = promoHeight + 65;

  // Hide on scroll
  if (isScrolled) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-gradient-to-r from-background via-muted/80 to-background border-b border-border/50 backdrop-blur-md transition-all duration-300"
      style={{ top: `${promoHeight == 0 ? 80 : topPosition}px` }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-r from-primary/5 to-transparent blur-xl" />
        <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent blur-xl" />
      </div>

      <div className="relative w-full px-4 md:px-12 lg:px-16">
        <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
          {/* Collections Label */}
          <div className="flex items-center gap-2 text-primary font-semibold text-sm whitespace-nowrap bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            {/* <Sparkles className="h-4 w-4 animate-pulse" /> */}
            <span className="sm:inline">Collections</span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

          {/* Category Links */}
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="relative text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-all duration-300 bg-card hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary group shadow-sm hover:shadow-md"
                style={{ border: "1px solid #7d95c8" ,display:"flex",alignItems:"center",gap:"10px"}}
              >
            <Sparkles className="h-4 w-4 animate-pulse" />

                <span className="relative z-10 flex items-center gap-2">
                  {category.name}
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <span className="text-sm text-muted-foreground px-4 py-2">Loading collections...</span>
            )}
          </div>

          {/* View All Link */}
          {categories.length > 0 && (
            <Link
              href="/categories"
              className="ml-auto flex-shrink-0 text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniHeader;
