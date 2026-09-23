import { useMemo, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Flag, Send } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import SiteLayout from '@/components/site/SiteLayout';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';
import { openWhatsApp, whatsappLink } from '@/lib/whatsapp';
import { SITE } from '@/lib/seo';

const topics = ['Custom design', 'Product enquiry', 'Engagement ring', 'Wholesale / B2B', 'Order support', 'Other'];

const faqItems = [
  {
    question: 'How can I contact Starlink Jewels?',
    answer: 'You can contact us via WhatsApp, phone or email for product enquiries, custom orders, and wholesale requests.',
  },
  {
    question: 'Do you offer custom jewelry design?',
    answer: 'Yes. We provide custom design and manufacturing for engagement rings, wedding bands, and fine jewelry.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes. We ship globally with secure packaging and delivery options for select regions.',
  },
];

const Contact = () => {
  const { contactInfo, offices } = useAppSelector(selectGlobalData);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState('');

  const sortedOffices = useMemo(() => [...offices].sort((a, b) => Number(Boolean(b.isHeadquarters)) - Number(Boolean(a.isHeadquarters))), [offices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email and message');
      return;
    }
    const text = `*New enquiry from the website*\n\n*Name:* ${name.trim()}\n*Email:* ${email.trim()}\n*Topic:* ${topic}\n\n${message.trim()}`;
    openWhatsApp(text, contactInfo?.whatsapp);
    setName('');
    setEmail('');
    setMessage('');
    toast.success('Opening WhatsApp to send your message');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://starlinkjewels.com/contact#contactpage',
    name: 'Contact Starlink Jewels',
    description: 'Contact Starlink Jewels for diamond jewelry, custom designs, engagement rings, and wholesale enquiries.',
    url: 'https://starlinkjewels.com/contact',
    mainEntityOfPage: 'https://starlinkjewels.com/contact',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://starlinkjewels.com/#jewelry-store',
      name: 'Starlink Jewels',
      telephone: contactInfo?.phone || SITE.phonePrimary,
      email: contactInfo?.email || SITE.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.addressIndia.locality,
        addressRegion: SITE.addressIndia.region,
        addressCountry: SITE.addressIndia.country,
      },
    },
  };

  const methods = [
    contactInfo?.phone && { icon: Phone, label: 'Call us', value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
    contactInfo?.email && { icon: Mail, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
    { icon: Clock, label: 'Business hours', value: 'Mon – Sat, 10:00 AM – 8:00 PM', href: undefined },
    contactInfo?.address && { icon: MapPin, label: 'Visit', value: contactInfo.address, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <SiteLayout>
      <SEOHead
        title="Contact Us - Diamond Jewelry Enquiries & Custom Orders"
        description="Contact Starlink Jewels for certified diamond jewelry, custom designs, engagement rings and wholesale orders. Chat with our experts on WhatsApp."
        keywords="contact starlink jewels, diamond jewelry enquiries, custom jewelry design, wholesale diamond jewelry, engagement ring consultation, lab grown diamond manufacturer Surat"
        canonicalUrl="https://starlinkjewels.com/contact"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://starlinkjewels.com' },
          { name: 'Contact', url: 'https://starlinkjewels.com/contact' },
        ]}
        faqItems={faqItems}
      />

      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions about a piece, a custom design or wholesale? Our team replies personally on WhatsApp, phone or email."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Contact' }]}
      />

      <section className="section">
        <div className="container-wide grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal className="space-y-8">
            <div className="rounded-md bg-neutral-950 p-8 text-neutral-100">
              <FaWhatsapp className="h-8 w-8 text-whatsapp" />
              <h2 className="mt-5 font-display text-3xl">The fastest way to reach us</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                Send photos, ask for prices or request a live video viewing of any piece.
              </p>
              <Button asChild variant="whatsapp" size="xl" className="mt-6 w-full sm:w-auto">
                <a href={whatsappLink('Hi Starlink Jewels! I have a question.', contactInfo?.whatsapp)} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            <ul className="divide-y border-y">
              {methods.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4 py-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block break-words font-medium hover:text-brand">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow mb-3">Send a message</p>
            <h2 className="heading-md">Tell us what you're looking for</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoComplete="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>I'm interested in</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Share details like stone shape, carat, metal, ring size or budget."
                  required
                />
              </div>
              <Button type="submit" size="xl" className="w-full">
                <Send /> Send via WhatsApp
              </Button>
              <p className="text-center text-xs text-muted-foreground">Your message opens in WhatsApp so you can review it before sending.</p>
            </form>
          </Reveal>
        </div>
      </section>

      {sortedOffices.length > 0 && (
        <section className="section border-t bg-secondary/40">
          <div className="container-wide">
            <div className="mb-10">
              <p className="eyebrow mb-3">Global presence</p>
              <h2 className="heading-lg">Our offices</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedOffices.map((office, i) => (
                <Reveal key={office.id} delay={(i % 3) * 80} className="rounded-md border bg-card p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {office.flagImage ? (
                        <img src={office.flagImage} alt={`${office.country} flag`} className="h-7 w-10 rounded-sm border object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <Flag className="h-5 w-5 text-brand" />
                      )}
                      <div>
                        <h3 className="font-display text-2xl leading-tight">{office.city}</h3>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{office.country}</p>
                      </div>
                    </div>
                    {office.isHeadquarters && (
                      <span className="rounded-full bg-brand-light px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">HQ</span>
                    )}
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <p className="flex gap-3 text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {office.address}
                    </p>
                    <a href={`tel:${office.phone}`} className="flex gap-3 hover:text-brand">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0" /> {office.phone}
                    </a>
                    <a href={`mailto:${office.email}`} className="flex gap-3 break-all hover:text-brand">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" /> {office.email}
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default Contact;
