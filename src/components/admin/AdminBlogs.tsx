import { useState, useEffect } from 'react';
import { getBlogs, saveBlog, deleteBlog, BlogPost, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Pencil, Image } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoFaq, setSeoFaq] = useState<{ question: string; answer: string }[]>([]);
  const [aiKeywords, setAiKeywords] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSeoGenerating, setIsSeoGenerating] = useState(false);
  const [autoSeo, setAutoSeo] = useState(true);
  const [lastSeoHash, setLastSeoHash] = useState('');
  const [isBulkSeoRunning, setIsBulkSeoRunning] = useState(false);

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
    setMetaTitle(blog.metaTitle || '');
    setMetaDescription(blog.metaDescription || '');
    setSeoFaq(blog.seoFaq || []);
    setLastSeoHash(`${blog.title}|${blog.content}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImage('');
    setThumbnail('');
    setMetaTitle('');
    setMetaDescription('');
    setSeoFaq([]);
    setLastSeoHash('');
    setImageFile(null);
    setThumbnailFile(null);
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
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        seoFaq: seoFaq.length > 0 ? seoFaq : undefined,
      };
      await saveBlog(blogData);
      const updated = await getBlogs();
      setBlogs(updated);
      setTitle('');
      setContent('');
      setImage('');
      setThumbnail('');
      setMetaTitle('');
      setMetaDescription('');
      setSeoFaq([]);
      setLastSeoHash('');
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

  const aiEndpoint = import.meta.env.VITE_AI_API_URL || "http://localhost:5174";

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title/topic first');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch(`${aiEndpoint}/api/ai/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: title,
          keywords: aiKeywords,
          tone: "luxury, professional, persuasive",
          length: "900-1200 words",
          brand: "Starlink Jewels",
        }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      const data = await res.json();
      if (data?.title) setTitle(data.title);
      if (data?.metaTitle) setMetaTitle(data.metaTitle);
      if (data?.metaDescription) setMetaDescription(data.metaDescription);
      if (data?.contentHtml) setContent(data.contentHtml);
      toast.success("AI content generated");
    } catch (error) {
      toast.error("Failed to generate AI content");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSeoGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    setIsSeoGenerating(true);
    try {
      const res = await fetch(`${aiEndpoint}/api/ai/blog-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          brand: "Starlink Jewels",
        }),
      });
      if (!res.ok) throw new Error("AI error");
      const data = await res.json();
      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
      setSeoFaq(Array.isArray(data.faqItems) ? data.faqItems : []);
      setLastSeoHash(`${title}|${content}`);
      toast.success('SEO generated');
    } catch (error) {
      toast.error('Failed to generate SEO');
    } finally {
      setIsSeoGenerating(false);
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleBulkSeo = async () => {
    if (blogs.length === 0) return;
    if (isBulkSeoRunning) return;
    setIsBulkSeoRunning(true);
    try {
      for (const blog of blogs) {
        const res = await fetch(`${aiEndpoint}/api/ai/blog-seo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: blog.title,
            content: blog.content,
            brand: "Starlink Jewels",
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        await saveBlog({
          ...blog,
          metaTitle: data.metaTitle || blog.metaTitle,
          metaDescription: data.metaDescription || blog.metaDescription,
          seoFaq: Array.isArray(data.faqItems) ? data.faqItems : blog.seoFaq,
        });
        await sleep(1200);
      }
      const updated = await getBlogs();
      setBlogs(updated);
      toast.success('Bulk SEO completed');
    } catch (error) {
      toast.error('Bulk SEO failed');
    } finally {
      setIsBulkSeoRunning(false);
    }
  };

  useEffect(() => {
    if (!autoSeo) return;
    if (!title.trim()) return;
    const hash = `${title}|${content}`;
    if (hash === lastSeoHash) return;
    const timer = setTimeout(() => {
      if (!isSeoGenerating) {
        handleSeoGenerate();
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [title, content, autoSeo, lastSeoHash]);


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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleOptimizeTitle}>
                Optimize SEO Title
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                Adds high-intent words like guide, tips, and certification.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-keywords">AI Keywords (comma-separated)</Label>
            <Input
              id="blog-keywords"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="lab grown diamonds, engagement rings, GIA, IGI, diamond buying guide"
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleAiGenerate} disabled={isAiGenerating}>
                {isAiGenerating ? "Generating..." : "Generate AI Content + Meta"}
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                Uses OpenAI to create full content and SEO meta fields.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-content">Content *</Label>
            <div className="h-auto min-h-64">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Enter blog content with formatting..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleGenerateSeoOutline}>
                Generate SEO Outline
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                Adds a ready-to-edit structure with headings, FAQs, and keywords.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blog-meta-title">Meta Title (SEO)</Label>
              <Input
                id="blog-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title for search results"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-meta-description">Meta Description (SEO)</Label>
              <Textarea
                id="blog-meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description for search results"
                rows={4}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleSeoGenerate} disabled={isSeoGenerating}>
              {isSeoGenerating ? "Generating..." : "Generate SEO (AI)"}
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSeo}
                onChange={(e) => setAutoSeo(e.target.checked)}
              />
              Auto refresh meta on changes
            </label>
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
      <Card>
        <CardHeader>
          <CardTitle>Bulk SEO Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generates SEO meta + FAQ for all blog posts with a safe rate-limited queue.
          </p>
          <Button onClick={handleBulkSeo} disabled={isBulkSeoRunning || blogs.length === 0}>
            {isBulkSeoRunning ? 'Generating...' : 'Generate SEO for All Blogs'}
          </Button>
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
