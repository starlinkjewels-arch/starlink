import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getOffices, saveOffice, deleteOffice, Office, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Pencil, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminOffices = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [flagImage, setFlagImage] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFlag, setIsUploadingFlag] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getOffices().then(setOffices);
  }, []);

  const handleFlagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('File size should be less than 2MB'); return; }
    setIsUploadingFlag(true);
    try {
      const url = await uploadImageToStorage(file, 'flags');
      setFlagImage(url);
      toast.success('Flag uploaded successfully');
    } catch {
      toast.error('Failed to upload flag');
    } finally {
      setIsUploadingFlag(false);
    }
  };

  const resetForm = () => {
    setCountry('');
    setCity('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsHeadquarters(false);
    setFlagImage('');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (office: Office) => {
    setEditingId(office.id);
    setCountry(office.country);
    setCity(office.city);
    setAddress(office.address);
    setPhone(office.phone);
    setEmail(office.email);
    setIsHeadquarters(office.isHeadquarters || false);
    setFlagImage(office.flagImage || '');
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleSave = async () => {
    if (!country || !city || !address || !phone || !email) {
      toast.error('Please fill all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const officeData: Office = {
        id: editingId || Date.now().toString(),
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        isHeadquarters,
        flagImage: flagImage || undefined,
      };
      await saveOffice(officeData);
      const updated = await getOffices();
      setOffices(updated);
      handleClose();
      toast.success(editingId ? 'Office updated' : 'Office added');
    } catch {
      toast.error(editingId ? 'Failed to update office' : 'Failed to add office');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteOffice(id);
      const updated = await getOffices();
      setOffices(updated);
      toast.success('Office deleted');
    } catch {
      toast.error('Failed to delete office');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Office Locations ({offices.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Office
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offices.map((office) => (
          <Card key={office.id} className="relative">
            {office.isHeadquarters && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">HQ</div>
            )}
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start gap-2">
                {office.flagImage ? (
                  <OptimizedImage src={office.flagImage} alt={`${office.country} flag`} className="w-8 h-6 object-cover" wrapperClassName="rounded border flex-shrink-0 mt-1 w-8 h-6" />
                ) : (
                  <Flag className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                )}
                <h4 className="font-bold text-lg">{office.city}, {office.country}</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{office.address}</p>
                <p className="font-medium">📞 {office.phone}</p>
                <p className="font-medium break-all">✉️ {office.email}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(office)} disabled={isDeleting === office.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(office.id)} disabled={isDeleting === office.id} className="flex-1">
                  {isDeleting === office.id ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {offices.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No offices added yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Office Location' : 'Add New Office Location'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-country">Country *</Label>
                <Input id="office-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., United States" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="office-city">City *</Label>
                <Input id="office-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., New York" maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-address">Address *</Label>
              <Textarea id="office-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter complete office address" rows={3} maxLength={500} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-phone">Phone Number *</Label>
                <Input id="office-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1 234 567 8900" maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="office-email">Email *</Label>
                <Input id="office-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., office@starlinkjewels.com" maxLength={255} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-flag">Country Flag (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input id="office-flag" type="file" accept="image/*" onChange={handleFlagUpload} disabled={isUploadingFlag} className="cursor-pointer flex-1" />
                {isUploadingFlag && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Uploading...</div>}
              </div>
              {flagImage && (
                <div className="flex items-center gap-3 mt-2">
                  <OptimizedImage src={flagImage} alt="Flag preview" className="h-8 w-12 object-cover" wrapperClassName="rounded border h-8 w-12" />
                  <Button variant="ghost" size="sm" onClick={() => setFlagImage('')} className="text-destructive hover:text-destructive">Remove</Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">PNG or JPG, max 2MB</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="headquarters" checked={isHeadquarters} onCheckedChange={(checked) => setIsHeadquarters(checked as boolean)} />
              <Label htmlFor="headquarters" className="cursor-pointer">Mark as Headquarters</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingId ? 'Updating...' : 'Adding...'}</> : (editingId ? 'Update Office' : 'Add Office')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOffices;
