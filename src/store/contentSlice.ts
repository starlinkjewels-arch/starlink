import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
  getOffices,
  initializeDefaultData,
  type Banner,
  type Category,
  type Product,
  type GalleryItem,
  type FeaturedCollection,
  type BlogPost,
  type InstagramPost,
  type Testimonial,
  type PromoHeader,
  type ContactInfo,
  type Office,
} from "@/lib/storage";
import { getBuyingGuides, type BuyingGuide } from "@/lib/buyingGuides";
import type { RootState } from "./store";

export interface GlobalData {
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

interface ContentState {
  data: GlobalData;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  hydrated: boolean;
  lastUpdated: number | null;
  productsStatus: "idle" | "loading" | "succeeded" | "failed";
  productsLoaded: boolean;
  blogsStatus: "idle" | "loading" | "succeeded" | "failed";
  blogsLoaded: boolean;
}

const SESSION_KEY = "starlink_global_data_v3";

const emptyData: GlobalData = {
  banners: [],
  categories: [],
  products: [],
  galleryItems: [],
  featuredCollection: [],
  blogs: [],
  instagramPosts: [],
  testimonials: [],
  promoHeader: null,
  contactInfo: null,
  offices: [],
  buyingGuides: [],
};

const normalizeBuyingGuides = (guides: BuyingGuide[]): BuyingGuide[] => {
  return guides.map((g) => {
    const anyGuide = g as BuyingGuide & { createdAt?: unknown };
    const createdAt = anyGuide.createdAt;
    const asDate =
      createdAt && typeof createdAt === "object" && "toDate" in (createdAt as object)
        ? (createdAt as { toDate: () => Date }).toDate()
        : createdAt instanceof Date
        ? createdAt
        : typeof createdAt === "number"
        ? new Date(createdAt)
        : typeof createdAt === "string"
        ? new Date(createdAt)
        : null;
    return {
      ...g,
      createdAt: asDate ? asDate.toISOString() : (g as BuyingGuide).createdAt,
    };
  });
};

const normalizeBlogDates = (blogs: BlogPost[]): BlogPost[] => {
  return blogs.map((b) => {
    const anyBlog = b as BlogPost & { date?: unknown };
    const dateValue = anyBlog.date;
    const asDate =
      dateValue && typeof dateValue === "object" && "toDate" in (dateValue as object)
        ? (dateValue as { toDate: () => Date }).toDate()
        : dateValue instanceof Date
        ? dateValue
        : typeof dateValue === "number"
        ? new Date(dateValue)
        : typeof dateValue === "string"
        ? new Date(dateValue)
        : null;
    return {
      ...b,
      date: asDate ? asDate.toISOString() : (b as BlogPost).date,
    };
  });
};

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readSessionCache = (): { data: GlobalData; savedAt: number; productsLoaded?: boolean; blogsLoaded?: boolean } | null => {
  if (typeof window === "undefined") return null;
  const raw = safeParse(sessionStorage.getItem(SESSION_KEY));
  if (raw?.data) {
    return {
      data: { ...(raw.data as GlobalData), blogs: [] },
      savedAt: raw.savedAt || Date.now(),
      productsLoaded: Boolean(raw.productsLoaded),
      blogsLoaded: false,
    };
  }
  return null;
};

const saveSessionCache = (data: GlobalData, productsLoaded: boolean, blogsLoaded: boolean) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data: { ...data, blogs: [] },
        productsLoaded,
        blogsLoaded: false,
      })
    );
  } catch {
    // ignore quota / privacy errors
  }
};

const cached = readSessionCache();

const initialState: ContentState = {
  data: cached?.data ?? emptyData,
  status: cached ? "succeeded" : "idle",
  error: null,
  hydrated: Boolean(cached),
  lastUpdated: cached?.savedAt ?? null,
  productsStatus: cached?.productsLoaded ? "succeeded" : "idle",
  productsLoaded: Boolean(
    cached?.productsLoaded ??
      (cached?.data?.products ? true : false)
  ),
  blogsStatus: "idle",
  blogsLoaded: false,
};

export const loadGlobalData = createAsyncThunk<
  GlobalData,
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadGlobalData",
  async (args) => {
    if (!args?.force) {
      const session = readSessionCache();
      if (session?.data) {
        const hasBlogs = Array.isArray(session.data.blogs) && session.data.blogs.length > 0;
        if (hasBlogs) return session.data;
      }
    }

    await initializeDefaultData();

    const [
      banners,
      categories,
      galleryItems,
      featuredCollection,
      instagramPosts,
      testimonials,
      promoHeader,
      contactInfo,
      offices,
      buyingGuides,
    ] = await Promise.all([
      getBanners(),
      getCategories(),
      getGallery(),
      getFeaturedCollection(),
      getInstagramPosts(),
      getTestimonials(),
      getPromoHeader(),
      getContact(),
      getOffices(),
      getBuyingGuides(),
    ]);

    return {
      banners,
      categories,
      products: [],
      galleryItems,
      featuredCollection,
      blogs: [],
      instagramPosts,
      testimonials,
      promoHeader,
      contactInfo,
      offices,
      buyingGuides: normalizeBuyingGuides(buyingGuides),
    };
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.status === "loading") return false;
      if (content.hydrated) return false;
      return true;
    },
  }
);

export const loadProducts = createAsyncThunk<
  Product[],
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadProducts",
  async (args) => {
    if (!args?.force) {
      const session = readSessionCache();
      if (session?.productsLoaded && session.data?.products) {
        return session.data.products;
      }
    }
    const products = await getProducts();
    return products;
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.productsStatus === "loading") return false;
      if (content.productsLoaded) return false;
      return true;
    },
  }
);

export const loadBlogs = createAsyncThunk<
  BlogPost[],
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadBlogs",
  async (args) => {
    const blogs = await getBlogs();
    return normalizeBlogDates(blogs);
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.blogsStatus === "loading") return false;
      if (content.blogsLoaded) return false;
      return true;
    },
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setGlobalData(state, action: PayloadAction<GlobalData>) {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.hydrated = true;
      state.lastUpdated = Date.now();
      saveSessionCache(action.payload, state.productsLoaded, state.blogsLoaded);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGlobalData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadGlobalData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = {
          ...action.payload,
          products: state.productsLoaded ? state.data.products : action.payload.products,
          blogs: state.blogsLoaded ? state.data.blogs : action.payload.blogs,
        };
        state.hydrated = true;
        state.lastUpdated = Date.now();
        saveSessionCache(state.data, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadGlobalData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load data";
      })
      .addCase(loadProducts.pending, (state) => {
        state.productsStatus = "loading";
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.productsStatus = "succeeded";
        state.productsLoaded = true;
        state.data.products = action.payload;
        saveSessionCache(state.data, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.productsStatus = "failed";
        state.error = action.error.message ?? "Failed to load products";
      })
      .addCase(loadBlogs.pending, (state) => {
        state.blogsStatus = "loading";
      })
      .addCase(loadBlogs.fulfilled, (state, action) => {
        state.blogsStatus = "succeeded";
        state.blogsLoaded = true;
        state.data.blogs = action.payload;
        saveSessionCache(state.data, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadBlogs.rejected, (state, action) => {
        state.blogsStatus = "failed";
        state.error = action.error.message ?? "Failed to load blogs";
      });
  },
});

export const { setGlobalData } = contentSlice.actions;

export const selectGlobalData = (state: RootState) => state.content.data;
export const selectContentStatus = (state: RootState) => state.content.status;
export const selectContentHydrated = (state: RootState) => state.content.hydrated;
export const selectContentError = (state: RootState) => state.content.error;
export const selectProductsStatus = (state: RootState) => state.content.productsStatus;
export const selectProductsLoaded = (state: RootState) => state.content.productsLoaded;
export const selectBlogsStatus = (state: RootState) => state.content.blogsStatus;
export const selectBlogsLoaded = (state: RootState) => state.content.blogsLoaded;

export default contentSlice.reducer;
