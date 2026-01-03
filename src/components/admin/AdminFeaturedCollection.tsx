import { useState, useEffect } from 'react';
import { getFeaturedCollection, saveFeaturedItem, deleteFeaturedItem, FeaturedCollection, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getFeaturedCollection().then(setItems);
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

  const handleEdit = (item: FeaturedCollection) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setImage(item.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setImageFile(null);
  };

  const handleAdd = async () => {
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
      setTitle('');
      setDescription('');
      setImage('');
      setImageFile(null);
      setEditingId(null);
      toast.success(editingId ? 'Featured item updated successfully' : 'Featured item added successfully');
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete featured item');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Featured Collection Item' : 'Add Featured Collection Item'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured-image">Image *</Label>
            <Input
              id="featured-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {image && (
              <img src={image} alt="Preview" className="h-32 w-auto rounded-lg mt-2" />
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1" disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Featured Item' : 'Add to Featured Collection')}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
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

export default AdminFeaturedCollection;
