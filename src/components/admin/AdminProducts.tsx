import { useState, useEffect } from 'react';
import { getProducts, saveProduct, deleteProduct, getCategories, Product, Category, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, X, Play } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface MediaPreview {
  url: string;
  type: 'image' | 'video';
  file?: File;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
    getCategories().then(setCategories);
  }, []);

  const getMediaType = (file: File): 'image' | 'video' => {
    return file.type.startsWith('video/') ? 'video' : 'image';
  };

  const getMediaTypeFromUrl = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    return videoExtensions.test(url) || 
           url.toLowerCase().includes('video') || 
           url.toLowerCase().includes('.mp4') ||
           url.toLowerCase().includes('vid-') ? 'video' : 'image';
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);
    
    const newPreviews: MediaPreview[] = [];
    let processedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result as string,
          type: getMediaType(file),
          file: file
        });
        processedCount++;
        
        if (processedCount === files.length) {
          setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveNewMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.replace(/[^0-9.]/g, ''));
    setCategoryId(product.categoryId);
    
    const existingUrls = product.images || [product.image];
    const existingMediaItems = existingUrls.map(url => ({
      url,
      type: getMediaTypeFromUrl(url)
    }));
    
    setExistingMedia(existingMediaItems);
    setMediaPreviews([]);
    setMediaFiles([]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setMediaFiles([]);
    setMediaPreviews([]);
    setExistingMedia([]);
  };

  const handleAddProduct = async () => {
    const totalMedia = existingMedia.length + mediaFiles.length;
    
    if (!name || !price || !categoryId || totalMedia === 0) {
      toast.error('Please fill all required fields and add at least one image/video');
      return;
    }

    setIsUploading(true);
    try {
      let allMediaUrls = [...existingMedia.map(m => m.url)];
      
      if (mediaFiles.length > 0) {
        const newMediaUrls = await Promise.all(
          mediaFiles.map(file => uploadImageToStorage(file, 'products'))
        );
        allMediaUrls = [...allMediaUrls, ...newMediaUrls];
      }
      
      const productData: Product = {
        id: editingId || Date.now().toString(),
        name,
        description,
        price,
        categoryId,
        image: allMediaUrls[0],
        images: allMediaUrls,
      };

      await saveProduct(productData);
      const updated = await getProducts();
      setProducts(updated);
      
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setExistingMedia([]);
      setEditingId(null);
      
      toast.success(editingId ? 'Product updated successfully' : 'Product added successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editingId ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteProduct(id);
      const updated = await getProducts();
      setProducts(updated);
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(null);
    }
  };

  const allMediaCount = existingMedia.length + mediaPreviews.length;

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'color', 'background',
    'font',
    'size',
    'link', 'image'
  ];

  const QuillComponent = ReactQuill as unknown as React.FC<ReactQuillProps>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Diamond Ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <QuillComponent
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={modules}
              formats={formats}
              placeholder="Enter product description with rich formatting (bold, italic, lists, etc.)"
              style={{ height: '60%' }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-price">Price (in $) *</Label>
            <Input
              id="product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 599.99"
              type="number"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-media">
              Product Images/Videos * ({allMediaCount} file{allMediaCount !== 1 ? 's' : ''} selected)
            </Label>
            <Input
              id="product-media"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              disabled={isUploading}
            />
            
            {(existingMedia.length > 0 || mediaPreviews.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-3">
                {existingMedia.map((media, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg border-2 border-border overflow-hidden bg-muted">
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video 
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                          >
                            <source src={media.url} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-8 w-8 text-white" fill="white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={media.url} 
                          alt={`Existing ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingMedia(index)}
                      className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploading}
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                      {media.type === 'video' ? '🎥 Video' : '🖼️ Image'}
                    </div>
                    
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {mediaPreviews.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg border-2 border-primary overflow-hidden bg-muted">
                      {preview.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video 
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                          >
                            <source src={preview.url} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-8 w-8 text-white" fill="white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={preview.url} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveNewMedia(index)}
                      className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploading}
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                      {preview.type === 'video' ? '🎥 Video' : '🖼️ Image'}
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      New
                    </div>
                    
                    {existingMedia.length === 0 && index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM, MOV). First file will be the main product image.
            </p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleAddProduct} 
              className="flex-1" 
              disabled={isUploading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isUploading 
                ? (editingId ? 'Updating...' : 'Uploading...') 
                : (editingId ? 'Update Product' : 'Add Product')
              }
            </Button>
            {editingId && (
              <Button 
                onClick={handleCancelEdit} 
                variant="outline" 
                disabled={isUploading}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const productMedia = product.images || [product.image];
          const mainMediaType = getMediaTypeFromUrl(product.image);
          
          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {mainMediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video 
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    >
                      <source src={product.image} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-12 w-12 text-white" fill="white" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                )}
                
                {productMedia.length > 1 && (
                  <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    +{productMedia.length - 1} more
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                </p>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                {product.description && (
                  <div 
                    className="text-sm text-muted-foreground mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}
                <p className="font-bold text-xl text-primary mb-4">
                  ${parseFloat(product.price.replace(/[^0-9.]/g, '')).toFixed(2)}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    disabled={isDeleting === product.id}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting === product.id}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === product.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {products.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No products added yet. Add your first product above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProducts;