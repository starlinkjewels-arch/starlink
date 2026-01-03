// src/components/admin/AdminBuyingGuides.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getBuyingGuides, saveBuyingGuide, deleteBuyingGuide, BuyingGuide } from '@/lib/buyingGuides';
import { uploadImageToStorage } from '@/lib/storage';
import { toast } from 'sonner';

const AdminBuyingGuides = () => {
  const [guides, setGuides] = useState<BuyingGuide[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BuyingGuide | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);

  useEffect(() => { loadGuides(); }, []);

  const loadGuides = async () => {
    const data = await getBuyingGuides();
    setGuides(data);
  };

  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return toast.error('Title & content required');

    let finalImageUrl = imageUrl;
    if (image) {
      finalImageUrl = await uploadImageToStorage(image, 'buying-guides');
    }

    const guide: BuyingGuide = {
      id: editing?.id || Date.now().toString(),
      title,
      slug: generateSlug(title),
      content,
      image: finalImageUrl,
      order: editing?.order ?? guides.length,
      published,
      createdAt: editing?.createdAt || new Date(),
    };

    await saveBuyingGuide(guide);
    toast.success(editing ? 'Guide updated' : 'Guide added');
    setOpen(false);
    resetForm();
    loadGuides();
  };

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setImage(null);
    setImageUrl('');
    setPublished(true);
  };

  const startEdit = (guide: BuyingGuide) => {
    setEditing(guide);
    setTitle(guide.title);
    setContent(guide.content);
    setImageUrl(guide.image);
    setPublished(guide.published);
    setOpen(true);
  };
  const removeGuide = async (id: string) => {
  if (window.confirm('Are you sure you want to delete this buying guide?')) {
    try {
      await deleteBuyingGuide(id);  // ← Fixed this line
      toast.success('Guide deleted successfully');
      loadGuides();
    } catch (error) {
      toast.error('Failed to delete guide');
    }
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Jewelry Buying Guides</h2>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add New Guide
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden">
            <img src={guide.image || '/placeholder.jpg'} alt={guide.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{guide.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                {guide.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{guide.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(guide)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeGuide(guide.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Buying Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to Choose the Perfect Diamond" />
            </div>

            <div>
              <Label>Cover Image</Label>
              {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-3" />}
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setImage(e.target.files[0])} />
            </div>

            <div>
              <Label>Content (Use HTML for formatting)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<h2>Introduction</h2><p>Your content here...</p><ul><li>Point 1</li></ul><img src='your-image-url' />"
                className="min-h-96 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Supports &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;img&gt;, etc.</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={published} onCheckedChange={setPublished} />
              <Label>Publish (Visible on website)</Label>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave}>Save Guide</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBuyingGuides;
