import { useState, useEffect } from 'react';
import { getContact, saveContact, ContactInfo } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminContact = () => {
  const [contact, setContact] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    twitter: '',
    pinterest: '',
    whatsapp: '9967381180',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getContact().then(setContact);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveContact(contact);
      toast.success('Contact information updated');
    } catch (error) {
      toast.error('Failed to update contact information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-address">Address</Label>
          <Textarea
            id="contact-address"
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            placeholder="Enter business address"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+91 1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="info@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-whatsapp">WhatsApp Number (Fixed for &quot;Buy on WhatsApp&quot;)</Label>
          <Input
            id="contact-whatsapp"
            value={contact.whatsapp}
            onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            placeholder="9967381180"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-facebook">Facebook URL</Label>
            <Input
              id="contact-facebook"
              value={contact.facebook}
              onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-instagram">Instagram URL</Label>
            <Input
              id="contact-instagram"
              value={contact.instagram}
              onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-twitter">Twitter URL</Label>
            <Input
              id="contact-twitter"
              value={contact.twitter}
              onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-pinterest">Pinterest URL</Label>
            <Input
              id="contact-pinterest"
              value={contact.pinterest}
              onChange={(e) => setContact({ ...contact, pinterest: e.target.value })}
              placeholder="https://pinterest.com/..."
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Contact Information'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminContact;
