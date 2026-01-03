import { useState, useEffect } from 'react';
import { getBanners, saveBanner, deleteBanner, Banner, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif'>('image');
  const [priority, setPriority] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getBanners().then(setBanners);
  }, []);

  // Get used priorities (excluding current editing item)
  const getUsedPriorities = () => {
    return banners
      .filter(b => b.id !== editingId)
      .map(b => b.priority)
      .filter((p): p is number => p !== undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Auto-detect media type
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else if (file.type === 'image/gif') {
        setMediaType('gif');
      } else {
        setMediaType('image');
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setDescription(banner.description || '');
    setImage(banner.image);
    setMediaType(banner.mediaType || 'image');
    setPriority(banner.priority || 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setMediaType('image');
    setPriority(1);
  };

  const handleAddBanner = async () => {
    if (!title || (!imageFile && !editingId)) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'banners', true); // Skip watermark for banners
      }
      
      const bannerData: Banner = {
        id: editingId || Date.now().toString(),
        title,
        description,
        image: imageUrl,
        mediaType,
        priority,
      };

      await saveBanner(bannerData);
      const updated = await getBanners();
      setBanners(updated);
      setTitle('');
      setDescription('');
      setImage('');
      setImageFile(null);
      setMediaType('image');
      setPriority(1);
      setEditingId(null);
      toast.success(editingId ? 'Banner updated successfully' : 'Banner added successfully');
    } catch (error) {
      toast.error(editingId ? 'Failed to update banner' : 'Failed to add banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteBanner(id);
      const updated = await getBanners();
      setBanners(updated);
      toast.success('Banner deleted');
    } catch (error) {
      toast.error('Failed to delete banner');
    } finally {
      setIsDeleting(null);
    }
  };

  const usedPriorities = getUsedPriorities();
  const sortedBanners = [...banners].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Title *</Label>
              <Input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter banner title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-priority">Display Priority *</Label>
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
            <Label htmlFor="banner-description">Description</Label>
            <Textarea
              id="banner-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter banner description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-media">Media (Image, GIF, or Video) *</Label>
            <Input
              id="banner-media"
              type="file"
              accept="image/*,video/*"
              onChange={handleImageUpload}
            />
            {image && (
              <div className="mt-2">
                {mediaType === 'video' ? (
                  <video src={image} className="h-32 w-auto rounded-lg" controls />
                ) : (
                  <img src={image} alt="Preview" className="h-32 w-auto rounded-lg" />
                )}
                <p className="text-sm text-muted-foreground mt-1">Type: {mediaType}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddBanner} className="flex-1" disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Banner' : 'Add Banner')}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBanners.map((banner) => (
          <Card key={banner.id} className="relative">
            <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
              #{banner.priority || '-'}
            </span>
            {banner.mediaType === 'video' ? (
              <video src={banner.image} className="w-full h-48 object-cover" controls />
            ) : (
              <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{banner.title}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {banner.mediaType || 'image'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{banner.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(banner)}
                  disabled={isDeleting === banner.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(banner.id)}
                  disabled={isDeleting === banner.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === banner.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBanners;
