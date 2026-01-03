// Firebase data management for Starlink Jewels
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  mediaType?: 'image' | 'video' | 'gif';
  priority?: number;
}

export interface VisitorLog {
  id?: string;
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  userAgent: string;
  page: string;
  timestamp: Date;
  grantedLocation: boolean;   // true = user allowed geolocation
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  priority?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  images?: string[]; // Multiple product images
  description: string;
  price: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  description: string;
}

export interface FeaturedCollection {
  id: string;
  image: string;
  title: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image: string;
  thumbnail?: string;
  date: string;
}

export interface InstagramPost {
  id: string;
  url: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  pinterest?: string;
  whatsapp: string;
}

export interface PromoHeader {
  text: string;
  enabled: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}

export interface Office {
  id: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isHeadquarters?: boolean;
  flagImage?: string;
}

// Collection names
const COLLECTIONS = {
  BANNERS: 'banners',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  GALLERY: 'gallery',
  FEATURED: 'featured-collection',
  CONTACT: 'contact',
  OFFICES: 'offices',
  BLOGS: 'blogs',
  INSTAGRAM: 'instagram',
  VISITORS: 'visitors',
  PROMO_HEADER: 'promo-header',
  TESTIMONIALS: 'testimonials',
};

// Initialize default data
export const initializeDefaultData = async () => {
  try {
    const contactDoc = await getDoc(doc(db, COLLECTIONS.CONTACT, 'main'));
    if (!contactDoc.exists()) {
      const defaultContact: ContactInfo = {
        address: '123 Diamond Street, Mumbai, India',
        phone: '+91 9967381180',
        email: 'info@starlinkjewels.com',
        instagram: 'https://instagram.com/starlinkjewels',
        facebook: 'https://facebook.com/starlinkjewels',
        whatsapp: '9967381180',
      };
      await setDoc(doc(db, COLLECTIONS.CONTACT, 'main'), defaultContact);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Banner methods
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BANNERS));
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
    // Sort by priority (lower number = first)
    return banners.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting banners:', error);
    return [];
  }
};

export const saveBanner = async (banner: Banner) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BANNERS, banner.id), banner);
  } catch (error) {
    console.error('Error saving banner:', error);
  }
};

export const deleteBanner = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BANNERS, id));
  } catch (error) {
    console.error('Error deleting banner:', error);
  }
};

// Category methods
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    // Sort by priority (lower number = first)
    return categories.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const saveCategory = async (category: Category) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), category);
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.CATEGORIES, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
  } catch (error) {
    console.error('Error getting category:', error);
  }
  return undefined;
};

export const deleteCategory = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

// Product methods
export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

export const saveProduct = async (product: Product) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
  } catch (error) {
    console.error('Error saving product:', error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

// Gallery methods
export const getGallery = async (): Promise<GalleryItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.GALLERY));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
  } catch (error) {
    console.error('Error getting gallery:', error);
    return [];
  }
};

export const saveGalleryItem = async (item: GalleryItem) => {
  try {
    await setDoc(doc(db, COLLECTIONS.GALLERY, item.id), item);
  } catch (error) {
    console.error('Error saving gallery item:', error);
  }
};

export const deleteGalleryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GALLERY, id));
  } catch (error) {
    console.error('Error deleting gallery item:', error);
  }
};

// Featured Collection methods
export const getFeaturedCollection = async (): Promise<FeaturedCollection[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FEATURED));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedCollection));
  } catch (error) {
    console.error('Error getting featured collection:', error);
    return [];
  }
};

export const saveFeaturedItem = async (item: FeaturedCollection) => {
  try {
    await setDoc(doc(db, COLLECTIONS.FEATURED, item.id), item);
  } catch (error) {
    console.error('Error saving featured item:', error);
  }
};

export const deleteFeaturedItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FEATURED, id));
  } catch (error) {
    console.error('Error deleting featured item:', error);
  }
};

// Contact methods
export const getContact = async (): Promise<ContactInfo> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.CONTACT, 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as ContactInfo;
    }
  } catch (error) {
    console.error('Error getting contact:', error);
  }
  return {
    address: '',
    phone: '',
    email: '',
    whatsapp: '9967381180',
  };
};

export const saveContact = async (contact: ContactInfo) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONTACT, 'main'), contact);
  } catch (error) {
    console.error('Error saving contact:', error);
  }
};

// Office methods
export const getOffices = async (): Promise<Office[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.OFFICES));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Office));
  } catch (error) {
    console.error('Error getting offices:', error);
    return [];
  }
};

export const saveOffice = async (office: Office) => {
  try {
    await setDoc(doc(db, COLLECTIONS.OFFICES, office.id), office);
  } catch (error) {
    console.error('Error saving office:', error);
  }
};

export const deleteOffice = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.OFFICES, id));
  } catch (error) {
    console.error('Error deleting office:', error);
  }
};

// Blog methods
export const getBlogs = async (): Promise<BlogPost[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BLOGS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    console.error('Error getting blogs:', error);
    return [];
  }
};

export const saveBlog = async (blog: BlogPost) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BLOGS, blog.id), blog);
  } catch (error) {
    console.error('Error saving blog:', error);
  }
};

export const deleteBlog = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BLOGS, id));
  } catch (error) {
    console.error('Error deleting blog:', error);
  }
};

// Instagram methods
export const getInstagramPosts = async (): Promise<InstagramPost[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INSTAGRAM));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstagramPost));
  } catch (error) {
    console.error('Error getting Instagram posts:', error);
    return [];
  }
};

export const saveInstagramPost = async (post: InstagramPost) => {
  try {
    await setDoc(doc(db, COLLECTIONS.INSTAGRAM, post.id), post);
  } catch (error) {
    console.error('Error saving Instagram post:', error);
  }
};

export const deleteInstagramPost = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INSTAGRAM, id));
  } catch (error) {
    console.error('Error deleting Instagram post:', error);
  }
};

// PromoHeader methods
export const getPromoHeader = async (): Promise<PromoHeader> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.PROMO_HEADER, 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as PromoHeader;
    }
  } catch (error) {
    console.error('Error getting promo header:', error);
  }
  return { text: '', enabled: false };
};

export const savePromoHeader = async (promo: PromoHeader) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PROMO_HEADER, 'main'), promo);
  } catch (error) {
    console.error('Error saving promo header:', error);
  }
};

// Testimonial methods
export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TESTIMONIALS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  } catch (error) {
    console.error('Error getting testimonials:', error);
    return [];
  }
};

export const saveTestimonial = async (testimonial: Testimonial) => {
  try {
    await setDoc(doc(db, COLLECTIONS.TESTIMONIALS, testimonial.id), testimonial);
  } catch (error) {
    console.error('Error saving testimonial:', error);
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TESTIMONIALS, id));
  } catch (error) {
    console.error('Error deleting testimonial:', error);
  }
};

// Upload file to Firebase Storage and return URL
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Add watermark to image
const addWatermark = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        resolve(file);
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add watermark
      ctx.font = `${Math.max(20, img.width / 20)}px Cinzel`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STARLINK JEWELS', canvas.width / 2, canvas.height / 2);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const watermarkedFile = new File([blob], file.name, { type: file.type });
          resolve(watermarkedFile);
        } else {
          resolve(file);
        }
      }, file.type);
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

export const uploadImageToStorage = async (file: File, path: string, skipWatermark: boolean = false): Promise<string> => {
  try {
    // Add watermark before uploading (unless skipped)
    const fileToUpload = skipWatermark ? file : await addWatermark(file);
    const storageRef = ref(storage, `${path}/${Date.now()}_${fileToUpload.name}`);
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
