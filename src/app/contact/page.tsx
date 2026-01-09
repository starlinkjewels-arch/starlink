'use client';

import type { Metadata } from 'next';
import Contact from '@/pages/Contact';

// export const metadata: Metadata = {
//   title: 'Contact Starlink Jewels | Get In Touch | WhatsApp Support',
//   description: 'Contact Starlink Jewels for inquiries, custom jewelry, or support. Available via email, WhatsApp, phone, or visit our offices worldwide. Fast response guaranteed.',
//   keywords: 'contact starlink jewels, jewelry support, custom jewelry inquiry, customer service, contact jewelry store, diamond consultation, jewelry help',
//   alternates: {
//     canonical: 'https://starlinkjewels.com/contact',
//   },
//   openGraph: {
//     type: 'website',
//     url: 'https://starlinkjewels.com/contact',
//     title: 'Contact Us | Starlink Jewels',
//     description: 'Get in touch with our jewelry experts. Available via email, WhatsApp, phone, and multiple offices worldwide.',
//   },
// };

export default function ContactPage() {
  return <Contact />;
}
