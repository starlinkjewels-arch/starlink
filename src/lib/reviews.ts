// Product reviews: customers submit from the product page (status "pending"); an admin approves
// them in Admin → Reviews. Only approved reviews are public and used in structured data.
import { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore/lite';
import { db } from './firebase';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  text: string;
  name: string;
  email?: string;
  country: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  createdAt?: { toDate(): Date };
}

export interface ReviewInput {
  productId: string;
  productName: string;
  rating: number;
  title: string;
  text: string;
  name: string;
  email: string;
  country: string;
}

const clip = (v: string, max: number) => v.trim().slice(0, max);

export const submitReview = async (input: ReviewInput) => {
  await addDoc(collection(db, 'reviews'), {
    productId: clip(input.productId, 60),
    productName: clip(input.productName, 160),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: clip(input.title, 100),
    text: clip(input.text, 2000),
    name: clip(input.name, 60),
    email: clip(input.email, 120),
    country: clip(input.country, 60),
    status: 'pending',
    verified: false,
    createdAt: serverTimestamp(),
  });
};

const cache = new Map<string, Review[]>();

/** Approved reviews for a product, newest first. */
export const useProductReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<Review[]>(() => (productId && cache.get(productId)) || []);
  const [loaded, setLoaded] = useState(Boolean(productId && cache.has(productId)));

  useEffect(() => {
    if (!productId || cache.has(productId)) {
      setReviews((productId && cache.get(productId)) || []);
      setLoaded(true);
      return;
    }
    let alive = true;
    getDocs(query(collection(db, 'reviews'), where('productId', '==', productId), where('status', '==', 'approved')))
      .then((snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))
          .sort((a, b) => (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0));
        cache.set(productId, list);
        if (alive) setReviews(list);
      })
      .catch(() => alive && setReviews([]))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [productId]);

  const count = reviews.length;
  const average = count ? reviews.reduce((n, r) => n + r.rating, 0) / count : 0;
  return { reviews, count, average, loaded };
};
