import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getBlogs, saveBlog, deleteBlog, BlogPost, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Image } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { loadBlogs, loadGlobalData } from '@/store/contentSlice';

const AdminBlogs = () => {
  const dispatch = useAppDispatch();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getBlogs().then(setBlogs);
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

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnail(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage('');
    setThumbnail('');
    setMetaTitle('');
    setMetaDescription('');
    setImageFile(null);
    setThumbnailFile(null);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    setImage(blog.image);
    setThumbnail(blog.thumbnail || '');
    setMetaTitle(blog.metaTitle || '');
    setMetaDescription(blog.metaDescription || '');
    setImageFile(null);
    setThumbnailFile(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    resetForm();
  };

  const buildSeoTitle = (seed: string) => {
    const clean = seed.trim();
    if (!clean) return "Diamond Jewelry Buying Guide: Lab-Grown vs Natural";
    if (/guide|tips|how to|buying/i.test(clean)) return clean;
    return `Buying Guide: ${clean} Tips, Styles & Certification`;
  };

  const handleOptimizeTitle = () => {
    setTitle((prev) => buildSeoTitle(prev || 'Diamond Jewelry'));
    toast.success('SEO title optimized');
  };

  const buildSeoOutline = (topic: string) => {
    const safeTopic = topic?.trim() || 'Jewelry Buying Guide';
    return `
      <h2>${safeTopic}: Quick Summary</h2>
      <p>In this guide, we cover the key things to know before buying ${safeTopic.toLowerCase()} — quality, certification, pricing, and how to choose the right style.</p>
      <h3>1. What to Look For</h3>
      <ul>
        <li>Certification (GIA/IGI) and authenticity</li>
        <li>Metal options: 14KT/18KT gold, platinum</li>
        <li>Stone quality, cut, and setting security</li>
      </ul>
      <h3>2. Lab-Grown vs Natural Diamonds</h3>
      <p>Compare value, sustainability, and certification to choose what fits your needs and budget.</p>
      <h3>3. Popular Styles</h3>
      <ul>
        <li>Solitaire, halo, and three-stone designs</li>
        <li>Minimal vs statement pieces</li>
        <li>Everyday wear vs occasion jewelry</li>
      </ul>
      <h3>4. Sizing and Customization</h3>
      <p>We offer custom sizing and design options for a perfect fit.</p>
      <h3>5. Care and Maintenance</h3>
      <p>Clean and store your jewelry properly to preserve brilliance.</p>
      <h3>FAQ</h3>
      <ul>
        <li>Do you provide certification? Yes, for lab-grown and natural diamonds.</li>
        <li>Can I customize designs? Yes, contact us for custom work.</li>
        <li>Do you ship internationally? Yes, with secure, insured delivery.</li>
      </ul>
    `;
  };

  const handleGenerateSeoOutline = () => {
    const outline = buildSeoOutline(title || 'Diamond Jewelry Guide');
    setContent((prev) => (prev?.trim() ? `${prev}\n<hr/>\n${outline}` : outline));
    toast.success('SEO outline added to content');
  };

  const handleSave = async () => {
    if (!title || !content || (!imageFile && !editingId)) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = image;
      let thumbnailUrl = thumbnail;
      if (imageFile) imageUrl = await uploadImageToStorage(imageFile, 'blogs');
      if (thumbnailFile) thumbnailUrl = await uploadImageToStorage(thumbnailFile, 'blogs/thumbnails');
      const blogData: BlogPost = {
        id: editingId || Date.now().toString(),
        title,
        content,
        image: imageUrl,
        thumbnail: thumbnailUrl || imageUrl,
        date: editingId ? blogs.find(b => b.id === editingId)?.date || new Date().toISOString() : new Date().toISOString(),
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };
      await saveBlog(blogData);
      const updated = await getBlogs();
      setBlogs(updated);
      dispatch(loadGlobalData({ force: true }));
      dispatch(loadBlogs({ force: true }));
      handleClose();
      toast.success(editingId ? 'Blog post updated' : 'Blog post added');
    } catch {
      toast.error(editingId ? 'Failed to update blog post' : 'Failed to add blog post');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteBlog(id);
      const updated = await getBlogs();
      setBlogs(updated);
      dispatch(loadGlobalData({ force: true }));
      dispatch(loadBlogs({ force: true }));
      toast.success('Blog post deleted');
    } catch {
      toast.error('Failed to delete blog post');
    } finally {
      setIsDeleting(null);
    }
  };

  const getPlainTextPreview = (html: string): string =>
    html.replace(/<[^>]*>/g, '').trim().substring(0, 100) + (html.length > 100 ? '...' : '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Posts ({blogs.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            <div className="relative">
              <OptimizedImage src={blog.thumbnail || blog.image} alt={blog.title} className="w-full h-48 object-cover" wrapperClassName="w-full" />
              {blog.thumbnail && (
                <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Image className="h-3 w-3" />Has Thumbnail
                </span>
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{new Date(blog.date).toLocaleDateString()}</p>
              <h3 className="font-semibold mb-2 line-clamp-2">{blog.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{getPlainTextPreview(blog.content)}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(blog)} disabled={isDeleting === blog.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(blog.id)} disabled={isDeleting === blog.id} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />{isDeleting === blog.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {blogs.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No blog posts yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Title *</Label>
              <Input id="blog-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter blog title" />
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={handleOptimizeTitle}>Optimize SEO Title</Button>
                <p className="text-xs text-muted-foreground">Adds high-intent words like guide, tips, and certification.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor value={content} onChange={setContent} placeholder="Enter blog content with formatting..." />
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateSeoOutline}>Generate SEO Outline</Button>
                <p className="text-xs text-muted-foreground">Adds a ready-to-edit structure with headings, FAQs, and keywords.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blog-meta-title">Meta Title (SEO)</Label>
                <Input id="blog-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title for search results" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-meta-description">Meta Description (SEO)</Label>
                <Textarea id="blog-meta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="SEO description for search results" rows={3} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blog-thumbnail">Thumbnail Image (Square)</Label>
                <Input id="blog-thumbnail" type="file" accept="image/*" onChange={handleThumbnailUpload} />
                {thumbnail && (
                  <div className="relative inline-block mt-2">
                    <OptimizedImage src={thumbnail} alt="Thumbnail" className="h-28 w-28 object-cover rounded-lg" wrapperClassName="rounded-lg" />
                    <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">Thumb</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Recommended: Square (1:1)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-image">Featured Image {!editingId && '*'}</Label>
                <Input id="blog-image" type="file" accept="image/*" onChange={handleImageUpload} />
                {image && (
                  <div className="relative inline-block mt-2">
                    <OptimizedImage src={image} alt="Featured" className="h-28 w-auto object-cover rounded-lg" wrapperClassName="inline-block rounded-lg" />
                    <span className="absolute top-1 left-1 bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded">Featured</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Recommended: Wide (16:9)</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Post' : 'Add Blog Post')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogs;
