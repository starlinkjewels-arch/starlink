import { useState, useEffect } from 'react';
import { getAd, saveAd, uploadImageToStorage, type Ad } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const AdminAds = () => {
  const [ad, setAd] = useState<Ad>({ image: '', link: '', enabled: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAd().then((existing) => {
      if (existing) {
        setAd(existing);
        setPreviewUrl(existing.image);
      }
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!ad.image && !imageFile) {
      toast.error('Please upload an ad image first');
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = ad.image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'ads', true);
      }
      const updated: Ad = { ...ad, image: imageUrl };
      await saveAd(updated);
      setAd(updated);
      setImageFile(null);
      toast.success('Ad saved successfully');
    } catch {
      toast.error('Failed to save ad');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = async () => {
    if (!ad.image && !imageFile) {
      toast.error('Upload an image before enabling the ad');
      return;
    }
    const updated = { ...ad, enabled: !ad.enabled };
    setAd(updated);
    try {
      await saveAd(updated);
      toast.success(updated.enabled ? 'Ad is now live' : 'Ad disabled');
    } catch {
      toast.error('Failed to update ad status');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Popup Ad</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Shown to visitors after 5 seconds. Hidden for 2 hours after they close it.
          </p>
        </div>
        <Button
          variant={ad.enabled ? 'default' : 'outline'}
          onClick={toggleEnabled}
          className="gap-2"
        >
          {ad.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {ad.enabled ? 'Live' : 'Disabled'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ad Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Image *</Label>
            <label
              htmlFor="ad-image"
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors w-fit"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {imageFile ? imageFile.name : 'Choose image'}
              </span>
            </label>
            <input id="ad-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {previewUrl && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={previewUrl}
                alt="Ad preview"
                className="w-full object-contain max-h-[400px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Click-through Link (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={ad.link || ''}
            onChange={(e) => setAd({ ...ad, link: e.target.value })}
            placeholder="https://... (clicking the ad opens this URL)"
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Ad'}
      </Button>
    </div>
  );
};

export default AdminAds;
