// Quote / consultation requests from the website, saved to Firestore /leads and managed in
// Admin → Leads. Submitted only when the customer presses "Send", with their agreement.
import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { db } from './firebase';

export const LEAD_TYPES = ['Quote for a piece', 'Video consultation', 'Custom design', 'Ring sizing help', 'Other question'] as const;
export const CONTACT_METHODS = ['WhatsApp', 'Email', 'Phone call'] as const;
export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

export type LeadType = (typeof LEAD_TYPES)[number];
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadInput {
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  contactMethod: ContactMethod;
  preferredTime: string;
  message: string;
  productId?: string;
  productName?: string;
  productUrl?: string;
}

export interface Lead extends LeadInput {
  id: string;
  status: LeadStatus;
  notes?: string;
  page: string;
  referrer: string | null;
  createdAt?: { toDate(): Date };
}

const clip = (v: string | undefined, max: number) => (v ?? '').trim().slice(0, max);

export const submitLead = async (input: LeadInput) => {
  const data: Record<string, unknown> = {
    type: input.type,
    name: clip(input.name, 80),
    email: clip(input.email, 120),
    phone: clip(input.phone, 40),
    country: clip(input.country, 60),
    city: clip(input.city, 80),
    contactMethod: input.contactMethod,
    preferredTime: clip(input.preferredTime, 40),
    message: clip(input.message, 2000),
    status: 'new',
    page: (window.location.pathname + window.location.search).slice(0, 300),
    referrer: document.referrer ? document.referrer.slice(0, 300) : null,
    createdAt: serverTimestamp(),
  };
  if (input.productId) {
    data.productId = clip(input.productId, 60);
    data.productName = clip(input.productName, 160);
    data.productUrl = clip(input.productUrl, 300);
  }
  await addDoc(collection(db, 'leads'), data);
};

export const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'India', 'United Arab Emirates', 'Singapore',
  'France', 'Italy', 'Netherlands', 'Switzerland', 'Spain', 'Belgium', 'Ireland', 'New Zealand', 'Hong Kong', 'Saudi Arabia',
  'Qatar', 'South Africa', 'Other',
];
