import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getCategories, saveCategory, deleteCategory, Category, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const getUsedPriorities = () =>
    categories.filter(c => c.id !== editingId).map(c => c.priority).filter((p): p is number => p !== undefined);

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
    setName('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setPriority(1);
    setMetaTitle('');
    setMetaDescription('');
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image);
    setPriority(category.priority || 1);
    setMetaTitle(category.metaTitle || '');
    setMetaDescription(category.metaDescription || '');
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setPriority(1);
    setMetaTitle('');
    setMetaDescription('');
  };

  const handleSave = async () => {
    if (!name || (!imageFile && !editingId)) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'categories');
      }
      const categoryData: Category = {
        id: editingId || Date.now().toString(),
        name,
        description,
        image: imageUrl,
        priority,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };
      await saveCategory(categoryData);
      const updated = await getCategories();
      setCategories(updated);
      handleClose();
      toast.success(editingId ? 'Category updated' : 'Category added');
    } catch {
      toast.error(editingId ? 'Failed to update category' : 'Failed to add category');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteCategory(id);
      const updated = await getCategories();
      setCategories(updated);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(null);
    }
  };

  const usedPriorities = getUsedPriorities();
  const sortedCategories = [...categories].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCategories.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
              #{category.priority || '-'}
            </span>
            <OptimizedImage src={category.image} alt={category.name} className="w-full h-48 object-cover" wrapperClassName="w-full" />
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)} disabled={isDeleting === category.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} disabled={isDeleting === category.id} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === category.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {sortedCategories.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No categories added yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rings, Necklaces"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-priority">Display Priority *</Label>
                <Select value={priority.toString()} onValueChange={(val) => setPriority(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()} disabled={usedPriorities.includes(num)}>
                        {num} {usedPriorities.includes(num) ? '(Used)' : num === 1 ? '(First)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Lower number = displays first</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-meta-title">Meta Title (SEO)</Label>
                <Input
                  id="category-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO meta title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-meta-description">Meta Description (SEO)</Label>
                <Textarea
                  id="category-meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-image">Image {!editingId && '*'}</Label>
              <Input id="category-image" type="file" accept="image/*" onChange={handleImageUpload} />
              {image && (
                <OptimizedImage src={image} alt="Preview" className="h-40 w-full object-cover rounded-lg mt-2" wrapperClassName="w-full rounded-lg mt-2" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Category' : 'Add Category')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
