import { useState, useEffect } from 'react';
import { getBlogs, saveBlog, deleteBlog, BlogPost, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Pencil, Image } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getBlogs().then(setBlogs);
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

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    setImage(blog.image);
    setThumbnail(blog.thumbnail || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImage('');
    setThumbnail('');
    setImageFile(null);
    setThumbnailFile(null);
  };

  const handleAddBlog = async () => {
    if (!title || !content || (!imageFile && !editingId)) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = image;
      let thumbnailUrl = thumbnail;
     
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'blogs');
      }
      if (thumbnailFile) {
        thumbnailUrl = await uploadImageToStorage(thumbnailFile, 'blogs/thumbnails');
      }
     
      const blogData: BlogPost = {
        id: editingId || Date.now().toString(),
        title,
        content,
        image: imageUrl,
        thumbnail: thumbnailUrl || imageUrl, // Use main image as fallback
        date: editingId ? blogs.find(b => b.id === editingId)?.date || new Date().toISOString() : new Date().toISOString(),
      };
      await saveBlog(blogData);
      const updated = await getBlogs();
      setBlogs(updated);
      setTitle('');
      setContent('');
      setImage('');
      setThumbnail('');
      setImageFile(null);
      setThumbnailFile(null);
      setEditingId(null);
      toast.success(editingId ? 'Blog post updated successfully' : 'Blog post added successfully');
    } catch (error) {
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
      toast.success('Blog post deleted');
    } catch (error) {
      toast.error('Failed to delete blog post');
    } finally {
      setIsDeleting(null);
    }
  };

  const getPlainTextPreview = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim().substring(0, 100) + (html.length > 100 ? '...' : '');
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Blog Post' : 'Add New Blog Post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-content">Content *</Label>
            <div className="h-auto min-h-64">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                placeholder="Enter blog content with formatting..."
              />
            </div>
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blog-thumbnail">Thumbnail Image (Square - for listing)</Label>
              <Input
                id="blog-thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
              {thumbnail && (
                <div className="relative">
                  <img src={thumbnail} alt="Thumbnail Preview" className="h-32 w-32 object-cover rounded-lg mt-2" />
                  <span className="absolute top-4 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Thumbnail
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Recommended: Square image (1:1 ratio)</p>
            </div>
           
            <div className="space-y-2">
              <Label htmlFor="blog-image">Featured Image * (for detail view)</Label>
              <Input
                id="blog-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {image && (
                <div className="relative">
                  <img src={image} alt="Featured Preview" className="h-32 w-auto rounded-lg mt-2" />
                  <span className="absolute top-4 left-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Recommended: Wide image (16:9 ratio)</p>
            </div>
          </div>
         
          <div className="flex gap-2">
            <Button onClick={handleAddBlog} className="flex-1" disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Blog Post' : 'Add Blog Post')}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            <div className="relative">
              <img src={blog.thumbnail || blog.image} alt={blog.title} className="w-full h-48 object-cover" />
              {blog.thumbnail && (
                <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Has Thumbnail
                </span>
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">
                {new Date(blog.date).toLocaleDateString()}
              </p>
              <h3 className="font-semibold mb-2 line-clamp-2">{blog.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{getPlainTextPreview(blog.content)}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(blog)}
                  disabled={isDeleting === blog.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(blog.id)}
                  disabled={isDeleting === blog.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === blog.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBlogs;
