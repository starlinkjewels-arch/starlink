import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getGallery, saveGalleryItem, deleteGalleryItem, GalleryItem, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminGallery = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getGallery().then(setGallery);
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
    setDescription('');
    setImage('');
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDescription(item.description || '');
    setImage(item.image);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDescription('');
    setImage('');
    setImageFile(null);
  };

  const handleSave = async () => {
    if (!imageFile && !editingId) {
      toast.error('Please select an image');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'gallery');
      }
      const itemData: GalleryItem = {
        id: editingId || Date.now().toString(),
        description,
        image: imageUrl,
      };
      await saveGalleryItem(itemData);
      const updated = await getGallery();
      setGallery(updated);
      handleClose();
      toast.success(editingId ? 'Image updated' : 'Image added to gallery');
    } catch {
      toast.error(editingId ? 'Failed to update image' : 'Failed to add image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteGalleryItem(id);
      const updated = await getGallery();
      setGallery(updated);
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gallery ({gallery.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <OptimizedImage src={item.image} alt={item.description} className="w-full aspect-square object-cover" wrapperClassName="w-full" />
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground mb-3 truncate">{item.description || 'No description'}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} disabled={isDeleting === item.id} className="flex-1">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="flex-1">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {isDeleting === item.id ? '...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {gallery.length === 0 && (
          <p className="text-muted-foreground col-span-4 text-center py-8">No images in gallery yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Gallery Image' : 'Add Gallery Image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="gallery-description">Description (Optional)</Label>
              <Input
                id="gallery-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-image">Image {!editingId && '*'}</Label>
              <Input id="gallery-image" type="file" accept="image/*" onChange={handleImageUpload} />
              {image && (
                <OptimizedImage src={image} alt="Preview" className="h-40 w-full object-cover rounded-lg mt-2" wrapperClassName="w-full rounded-lg mt-2" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Image' : 'Add to Gallery')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGallery;
