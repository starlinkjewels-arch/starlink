import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Send, Flag, Loader2 } from 'lucide-react';
import { getContact, getOffices, ContactInfo, Office } from '@/lib/storage';
import { toast } from 'sonner';

const Contact = () => {
  const { categories, promoHeader } = useGlobalData();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52;

  useEffect(() => {
    getContact().then(setContact);
    getOffices().then(setOffices);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const whatsappMessage = `*New Contact Form*\n\n*Name:* ${name.trim()}\n*Email:* ${email.trim()}\n*Subject:* ${subject.trim()}\n*Message:*\n${message.trim()}`;
      window.open(`https://wa.me/${contact?.whatsapp || '919967381180'}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      setName(''); setEmail(''); setSubject(''); setMessage('');
      toast.success('Message sent!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedOffices = [...offices].sort((a, b) => (a.isHeadquarters ? -1 : 0) - (b.isHeadquarters ? -1 : 0));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Starlink Jewels - Diamond Jewelry Store',
    description: 'Contact Starlink Jewels for premium diamond jewelry, custom designs, engagement rings, and wholesale inquiries.',
    url: 'https://starlinkjewels.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Starlink Jewels',
      telephone: contact?.phone,
      email: contact?.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mumbai',
        addressCountry: 'India'
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Contact Us - Diamond Jewelry Inquiries & Custom Orders | Starlink Jewels"
        description="Contact Starlink Jewels for inquiries about GIA certified diamonds, custom jewelry designs, engagement rings, wholesale orders. Global offices in Mumbai, New York, Dubai. 24/7 WhatsApp support."
        keywords="contact starlink jewels, jewelry store contact, diamond jewelry inquiries, custom jewelry design, wholesale diamond jewelry, engagement ring consultation, buy diamonds online, jewelry showroom Mumbai, diamond dealer contact"
        canonicalUrl="https://starlinkjewels.com/contact"
        structuredData={structuredData}
      />

      
        {sortedOffices.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Global Presence</h1>
                <p className="text-lg text-muted-foreground">Visit us at any of our offices worldwide</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {sortedOffices.map((office) => (
                  <Card key={office.id} className="relative overflow-hidden hover:shadow-xl transition-shadow">
                    {office.isHeadquarters && <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold z-10">HEADQUARTERS</div>}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        {office.flagImage ? (
                          <img src={office.flagImage} alt={`${office.country} flag`} className="w-12 h-8 object-cover rounded border flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Flag className="h-6 w-6 text-primary" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold mb-1">{office.city}</h2>
                          <p className="text-sm text-muted-foreground font-medium">{office.country}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground flex-1">{office.address}</p></div>
                        <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary flex-shrink-0" /><a href={`tel:${office.phone}`} className="text-sm font-medium break-all hover:text-primary">{office.phone}</a></div>
                        <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary flex-shrink-0" /><a href={`mailto:${office.email}`} className="text-sm font-medium break-all hover:text-primary">{office.email}</a></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Get In Touch</h2>
              <p className="text-lg text-muted-foreground">We&rsquo;re here to help and answer any question you might have.</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              <div>
                <h3 className="text-3xl font-bold mb-4">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2"><Label htmlFor="name">Your Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required /></div>
                  <div className="space-y-2"><Label htmlFor="email">Your Email *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required /></div>
                  <div className="space-y-2"><Label htmlFor="subject">Subject *</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" required /></div>
                  <div className="space-y-2"><Label htmlFor="message">Message *</Label><Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more..." rows={6} required /></div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending...</> : <><Send className="h-5 w-5 mr-2" />Send Message</>}
                  </Button>
                </form>
              </div>
              <div className="space-y-8">
                <h3 className="text-3xl font-bold mb-6">Quick Contact</h3>
                <div className="space-y-4">
                  {contact?.phone && (
                    <Card><CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Phone className="h-6 w-6 text-primary" /></div>
                      <div><h4 className="font-semibold mb-1">Phone</h4><a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-primary">{contact.phone}</a></div>
                    </CardContent></Card>
                  )}
                  {contact?.email && (
                    <Card><CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Mail className="h-6 w-6 text-primary" /></div>
                      <div><h4 className="font-semibold mb-1">Email</h4><a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary">{contact.email}</a></div>
                    </CardContent></Card>
                  )}
                  <Card><CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Clock className="h-6 w-6 text-primary" /></div>
                    <div><h4 className="font-semibold mb-1">Business Hours</h4><p className="text-muted-foreground">Monday - Saturday: 10:00 AM - 8:00 PM</p><p className="text-muted-foreground">Sunday: Closed</p></div>
                  </CardContent></Card>
                </div>
              </div>
            </div>
          </div>
        </section>

    </div>
  );
};

export default Contact;