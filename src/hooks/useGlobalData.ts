import { useState, useEffect, useCallback } from 'react';
import {
  getBanners,
  getCategories,
  getProducts,
  getGallery,
  getFeaturedCollection,
  getBlogs,
  getInstagramPosts,
  getTestimonials,
  getPromoHeader,
  getContact,
  initializeDefaultData,
  Banner,
  Category,
  Product,
  GalleryItem,
  FeaturedCollection,
  BlogPost,
  InstagramPost,
  Testimonial,
  PromoHeader,
  ContactInfo,
} from '@/lib/storage';

interface GlobalData {
  banners: Banner[];
  categories: Category[];
  products: Product[];
  galleryItems: GalleryItem[];
  featuredCollection: FeaturedCollection[];
  blogs: BlogPost[];
  instagramPosts: InstagramPost[];
  testimonials: Testimonial[];
  promoHeader: PromoHeader | null;
  contactInfo: ContactInfo | null;
}

interface UseGlobalDataReturn extends GlobalData {
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SESSION_KEY = 'starlink_global_data_v2';
const IMAGE_CACHE_KEY = 'starlink_image_cache_v1';

// Global cache (in-memory)
let cachedData: GlobalData | null = null;
let isDataFetched = false;
let inFlight: Promise<GlobalData> | null = null;
let imagesPreloaded = false;

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const loadSessionCache = () => {
  if (typeof window === 'undefined') return;
  const raw = safeParse(sessionStorage.getItem(SESSION_KEY));
  if (raw?.data) {
    cachedData = raw.data as GlobalData;
    isDataFetched = true;
  }
};

const saveSessionCache = (data: GlobalData) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      savedAt: Date.now(),
      data,
    }));
  } catch {
    // ignore quota / privacy errors
  }
};

// Preload images into browser cache
const preloadImages = async (urls: string[]): Promise<void> => {
  if (imagesPreloaded || urls.length === 0) return;
  
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  
  await Promise.all(
    uniqueUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          // Check if it's a video
          if (url.match(/\.(mp4|webm|ogg)$/i)) {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.onloadeddata = () => resolve();
            video.onerror = () => resolve();
            video.src = url;
          } else {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          }
        })
    )
  );
  
  imagesPreloaded = true;
};

// Hydrate cache once per session load
loadSessionCache();

export const useGlobalData = (): UseGlobalDataReturn => {
  const [data, setData] = useState<GlobalData>({
    banners: cachedData?.banners || [],
    categories: cachedData?.categories || [],
    products: cachedData?.products || [],
    galleryItems: cachedData?.galleryItems || [],
    featuredCollection: cachedData?.featuredCollection || [],
    blogs: cachedData?.blogs || [],
    instagramPosts: cachedData?.instagramPosts || [],
    testimonials: cachedData?.testimonials || [],
    promoHeader: cachedData?.promoHeader || null,
    contactInfo: cachedData?.contactInfo || null,
  });

  const [isLoading, setIsLoading] = useState(!isDataFetched);

  const fetchAllData = useCallback(async (opts?: { force?: boolean }) => {
    // If we already have data and no force refresh, just return it.
    if (!opts?.force && isDataFetched && cachedData) {
      setIsLoading(false);
      setData(cachedData);
      return cachedData;
    }

    // Ensure we don't fire multiple API calls at once.
    if (inFlight) {
      const existing = await inFlight;
      setIsLoading(false);
      setData(existing);
      return existing;
    }

    setIsLoading(true);

    inFlight = (async () => {
      await initializeDefaultData();

      const [
        banners,
        categories,
        products,
        galleryItems,
        featuredCollection,
        blogs,
        instagramPosts,
        testimonials,
        promoHeader,
        contactInfo,
      ] = await Promise.all([
        getBanners(),
        getCategories(),
        getProducts(),
        getGallery(),
        getFeaturedCollection(),
        getBlogs(),
        getInstagramPosts(),
        getTestimonials(),
        getPromoHeader(),
        getContact(),
      ]);

      const newData: GlobalData = {
        banners,
        categories,
        products,
        galleryItems,
        featuredCollection,
        blogs,
        instagramPosts,
        testimonials,
        promoHeader,
        contactInfo,
      };

      // Preload critical images (banners, categories, featured)
      const criticalImages = [
        ...banners.map((b) => b.image),
        ...categories.slice(0, 6).map((c) => c.image),
        ...featuredCollection.slice(0, 4).map((f) => f.image),
      ];
      
      // Start preloading but don't block
      preloadImages(criticalImages);

      cachedData = newData;
      isDataFetched = true;
      saveSessionCache(newData);

      return newData;
    })();

    try {
      const resolved = await inFlight;
      setData(resolved);
      return resolved;
    } catch (error) {
      console.error('Error fetching global data:', error);
      // fallback to what we already have
      if (cachedData) setData(cachedData);
      return cachedData || data;
    } finally {
      inFlight = null;
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!isDataFetched) {
      fetchAllData();
    } else {
      setIsLoading(false);
      // If data was from cache, still preload images
      if (cachedData) {
        const criticalImages = [
          ...cachedData.banners.map((b) => b.image),
          ...cachedData.categories.slice(0, 6).map((c) => c.image),
          ...cachedData.featuredCollection.slice(0, 4).map((f) => f.image),
        ];
        preloadImages(criticalImages);
      }
    }
  }, [fetchAllData]);

  return {
    ...data,
    isLoading,
    refetch: () => fetchAllData({ force: true }).then(() => undefined),
  };
};
