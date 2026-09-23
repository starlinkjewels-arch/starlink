import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getFeaturedCollection, saveFeaturedItem, deleteFeaturedItem, FeaturedCollection, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminFeaturedCollection = () => {
  const [items, setItems] = useState<FeaturedCollection[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getFeaturedCollection().then(setItems);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: FeaturedCollection) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setImage(item.image);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setImageFile(null);
  };

  const handleSave = async () => {
    if (!title || (!imageFile && !editingId)) {
      toast.error('Please provide title and image');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'featured-collection');
      }
      const itemData: FeaturedCollection = {
        id: editingId || Date.now().toString(),
        title,
        description,
        image: imageUrl,
      };
      await saveFeaturedItem(itemData);
      const updated = await getFeaturedCollection();
      setItems(updated);
      handleClose();
      toast.success(editingId ? 'Featured item updated' : 'Featured item added');
    } catch {
      toast.error(editingId ? 'Failed to update featured item' : 'Failed to add featured item');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteFeaturedItem(id);
      const updated = await getFeaturedCollection();
      setItems(updated);
      toast.success('Featured item deleted');
    } catch {
      toast.error('Failed to delete featured item');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Featured Collection ({items.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <OptimizedImage src={item.image} alt={item.title} className="w-full h-48 object-cover" wrapperClassName="w-full" />
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} disabled={isDeleting === item.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No featured items yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Featured Item' : 'Add Featured Collection Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="featured-title">Title *</Label>
              <Input
                id="featured-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Diamond Necklace Collection"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured-description">Description</Label>
              <Textarea
                id="featured-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter item description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured-image">Image {!editingId && '*'}</Label>
              <Input id="featured-image" type="file" accept="image/*" onChange={handleImageUpload} />
              {image && (
                <OptimizedImage src={image} alt="Preview" className="h-40 w-full object-cover rounded-lg mt-2" wrapperClassName="w-full rounded-lg mt-2" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Item' : 'Add Item')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeaturedCollection;
