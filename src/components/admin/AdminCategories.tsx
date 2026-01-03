import { useState, useEffect } from 'react';
import { getCategories, saveCategory, deleteCategory, Category, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Get used priorities (excluding current editing item)
  const getUsedPriorities = () => {
    return categories
      .filter(c => c.id !== editingId)
      .map(c => c.priority)
      .filter((p): p is number => p !== undefined);
  };

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

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image);
    setPriority(category.priority || 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setPriority(1);
  };

  const handleAddCategory = async () => {
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
      };

      await saveCategory(categoryData);
      const updated = await getCategories();
      setCategories(updated);
      setName('');
      setDescription('');
      setImage('');
      setImageFile(null);
      setPriority(1);
      setEditingId(null);
      toast.success(editingId ? 'Category updated successfully' : 'Category added successfully');
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(null);
    }
  };

  const usedPriorities = getUsedPriorities();
  const sortedCategories = [...categories].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Category' : 'Add New Category'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem 
                      key={num} 
                      value={num.toString()}
                      disabled={usedPriorities.includes(num)}
                    >
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-image">Image *</Label>
            <Input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {image && (
              <img src={image} alt="Preview" className="h-32 w-auto rounded-lg mt-2" />
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} className="flex-1" disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Category' : 'Add Category')}
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
        {sortedCategories.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
              #{category.priority || '-'}
            </span>
            <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  disabled={isDeleting === category.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={isDeleting === category.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === category.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
