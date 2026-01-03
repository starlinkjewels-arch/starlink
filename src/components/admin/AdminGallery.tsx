import { useState, useEffect } from 'react';
import { getGallery, saveGalleryItem, deleteGalleryItem, GalleryItem, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminGallery = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getGallery().then(setGallery);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDescription(item.description || '');
    setImage(item.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setImage('');
    setImageFile(null);
  };

  const handleAddImage = async () => {
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
      setDescription('');
      setImage('');
      setImageFile(null);
      setEditingId(null);
      toast.success(editingId ? 'Image updated' : 'Image added to gallery');
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Gallery Image' : 'Add Gallery Image'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="gallery-image">Image *</Label>
            <Input
              id="gallery-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {image && (
              <img src={image} alt="Preview" className="h-32 w-auto rounded-lg mt-2" />
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddImage} className="flex-1" disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Image' : 'Add to Gallery')}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <Card key={item.id}>
            <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3 truncate">{item.description || 'No description'}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  disabled={isDeleting === item.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting === item.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGallery;
