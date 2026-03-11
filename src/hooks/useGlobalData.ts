import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadGlobalData,
  selectGlobalData,
  selectContentHydrated,
  selectContentStatus,
} from "@/store/contentSlice";
import type {
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
  Office,
} from "@/lib/storage";
import type { BuyingGuide } from "@/lib/buyingGuides";

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
  offices: Office[];
  buyingGuides: BuyingGuide[];
}

interface UseGlobalDataReturn extends GlobalData {
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useGlobalData = (): UseGlobalDataReturn => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);

  useEffect(() => {
    if (status === "idle" && !hydrated) {
      dispatch(loadGlobalData());
    }
  }, [dispatch, hydrated, status]);

  const isLoading = useMemo(() => {
    if (status === "loading") return true;
    if (status === "idle" && !hydrated) return true;
    return false;
  }, [status, hydrated]);

  return {
    ...data,
    isLoading,
    refetch: () => dispatch(loadGlobalData({ force: true })).then(() => undefined),
  };
};
