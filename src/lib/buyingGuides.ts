// lib/buyingGuides.ts
import { collection, getDocs, getDoc, setDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImageToStorage } from './storage';

export interface BuyingGuide {
  id: string;
  title: string;
  slug: string;        // auto-generated from title
  content: string;     // Rich text (HTML or markdown – we'll use simple HTML)
  image: string;       // Main cover image
  order: number;       // For sorting
  published: boolean;
  createdAt: Date;
}

const COLLECTION = 'buying-guides';

// Get all guides (sorted by order)
export const getBuyingGuides = async (): Promise<BuyingGuide[]> => {
  const q = query(collection(db, COLLECTION), orderBy('order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyingGuide));
};

// Save / Update guide
export const saveBuyingGuide = async (guide: BuyingGuide) => {
  await setDoc(doc(db, COLLECTION, guide.id), guide);
};

// Delete guide
export const deleteBuyingGuide = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};
