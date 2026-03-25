import { useState, useEffect, useRef } from 'react';
import { getProducts, saveProduct, deleteProduct, getCategories, Product, Category, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, X, Play } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPriceRounded } from '@/lib/utils';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  file?: File;
  source: 'existing' | 'new';
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const hoverIdRef = useRef<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkDelta, setBulkDelta] = useState('10');
  const [bulkMode, setBulkMode] = useState<'amount' | 'percent'>('amount');
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<Product[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

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
    const newItems: MediaItem[] = [];
    let processedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newItems.push({
          id: `new-${Date.now()}-${index}`,
          url: reader.result as string,
          type: getMediaType(file),
          file,
          source: 'new',
        });
        processedCount++;
        if (processedCount === files.length) {
          setMediaItems(prev => [...prev, ...newItems]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const reorderMedia = (activeId: string, targetId: string) => {
    setMediaItems(prev => {
      const fromIndex = prev.findIndex(i => i.id === activeId);
      const toIndex = prev.findIndex(i => i.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };


  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDraggedId(id);
    setIsDragging(true);
    setActivePointerId(e.pointerId);
    draggedIdRef.current = id;
    isDraggingRef.current = true;
    hoverIdRef.current = id;
  };

  const handlePointerUp = (pointerId?: number) => {
    if (pointerId !== undefined && activePointerId !== null && pointerId === activePointerId) {
      const el = document.querySelector('[data-media-grid]') as Element | null;
      el?.releasePointerCapture?.(pointerId);
    }
    const activeId = draggedIdRef.current;
    const targetId = hoverIdRef.current;
    if (activeId && targetId && activeId !== targetId) {
      reorderMedia(activeId, targetId);
    }
    setDraggedId(null);
    setIsDragging(false);
    setActivePointerId(null);
    draggedIdRef.current = null;
    isDraggingRef.current = false;
    hoverIdRef.current = null;
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const tile = el?.closest?.('[data-media-id]') as HTMLElement | null;
      const targetId = tile?.dataset?.mediaId;
      if (targetId) {
        hoverIdRef.current = targetId;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      handlePointerUp(e.pointerId);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [activePointerId]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.replace(/[^0-9.]/g, ''));
    setCategoryId(product.categoryId);
    
    const existingUrls = product.images || [product.image];
    const existingMediaItems: MediaItem[] = existingUrls.map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      type: getMediaTypeFromUrl(url),
      source: 'existing',
    }));
    
    setMediaItems(existingMediaItems);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setMediaItems([]);
  };

  const handleAddProduct = async () => {
    const totalMedia = mediaItems.length;
    
    if (!name || !price || !categoryId || totalMedia === 0) {
      toast.error('Please fill all required fields and add at least one image/video');
      return;
    }

    setIsUploading(true);
    try {
      const newFiles = mediaItems.filter(m => m.source === 'new' && m.file).map(m => m.file as File);
      const newUploads = newFiles.length > 0
        ? await Promise.all(newFiles.map(file => uploadImageToStorage(file, 'products')))
        : [];
      let uploadIndex = 0;
      const allMediaUrls = mediaItems.map(m => {
        if (m.source === 'existing') return m.url;
        const url = newUploads[uploadIndex];
        uploadIndex += 1;
        return url;
      }).filter(Boolean) as string[];
      
      const existing = editingId ? products.find((p) => p.id === editingId) : null;
      const productData: Product = {
        id: editingId || Date.now().toString(),
        name,
        description,
        price,
        categoryId,
        image: allMediaUrls[0],
        images: allMediaUrls,
        createdAt: existing?.createdAt ?? Date.now(),
      };

      await saveProduct(productData);
      const updated = await getProducts();
      setProducts(updated);
      
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setMediaItems([]);
      setEditingId(null);
      
      toast.success(editingId ? 'Product updated successfully' : 'Product added successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editingId ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  const parsePriceNumber = (value: string): number => {
    const numeric = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
  };

  const formatPrice = (value: number): string => {
    const safe = Number.isFinite(value) ? value : 0;
    return safe.toFixed(2);
  };

  const handleOpenBulkPreview = () => {
    const delta = parsePriceNumber(bulkDelta);
    if (delta === 0) {
      toast.error('Please enter a non-zero amount');
      return;
    }
    const targetProducts =
      bulkSelectedIds.length > 0
        ? products.filter((p) => bulkSelectedIds.includes(p.id))
        : products;

    if (targetProducts.length === 0) {
      toast.error('No products to update');
      return;
    }

    const next = targetProducts.map((p) => {
      const current = parsePriceNumber(p.price);
      const updated =
        bulkMode === 'percent'
          ? Math.max(0, current + (current * delta) / 100)
          : Math.max(0, current + delta);
      return {
        ...p,
        price: formatPrice(updated),
      };
    });

    setBulkPreview(next);
    setBulkPreviewOpen(true);
  };

  const handleConfirmBulkUpdate = async () => {
    if (bulkPreview.length === 0) {
      setBulkPreviewOpen(false);
      return;
    }
    setIsBulkUpdating(true);
    try {
      await Promise.all(bulkPreview.map((p) => saveProduct(p)));
      const updated = await getProducts();
      setProducts(updated);
      setBulkSelectedIds([]);
      toast.success('All product prices updated');
      setBulkPreviewOpen(false);
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Failed to update prices');
    } finally {
      setIsBulkUpdating(false);
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

  const allMediaCount = mediaItems.length;

  const allSelected = products.length > 0 && bulkSelectedIds.length === products.length;
  const someSelected = bulkSelectedIds.length > 0 && bulkSelectedIds.length < products.length;

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
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Enter product description with rich formatting (bold, italic, lists, etc.)"
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
            
            {mediaItems.length > 0 && (
              <div
                data-media-grid
                className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-3 ${isDragging ? 'select-none' : ''}`}
                style={{ touchAction: 'none' }}
              >
                {mediaItems.map((media, index) => (
                  <div
                    key={media.id}
                    data-media-id={media.id}
                    className={`relative group cursor-move ${isDragging && draggedId === media.id ? 'ring-2 ring-primary' : ''}`}
                    onPointerDown={(e) => handlePointerDown(e, media.id)}
                  >
                    <div className={`aspect-square rounded-lg border-2 ${media.source === 'new' ? 'border-primary' : 'border-border'} overflow-hidden bg-muted`}>
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            draggable={false}
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
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(media.id)}
                      className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isUploading}
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className={`absolute bottom-2 left-2 ${media.source === 'new' ? 'bg-primary/90 text-primary-foreground' : 'bg-background/90'} backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium shadow-sm`}>
                      {media.type === 'video' ? 'Video' : 'Image'}
                    </div>

                    {media.source === 'new' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        New
                      </div>
                    )}

                    {index === 0 && (
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

      <Card>
        <CardHeader>
          <CardTitle>Bulk Price Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-64">
              <Label htmlFor="bulk-delta">Increase/Decrease Value</Label>
              <Input
                id="bulk-delta"
                value={bulkDelta}
                onChange={(e) => setBulkDelta(e.target.value)}
                placeholder="e.g., 10"
                type="number"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Use negative value to decrease prices.
              </p>
            </div>
            <div className="space-y-2 w-full sm:w-48">
              <Label>Mode</Label>
              <Select value={bulkMode} onValueChange={(v) => setBulkMode(v as 'amount' | 'percent')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">$ Amount</SelectItem>
                  <SelectItem value="percent">% Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleOpenBulkPreview} disabled={isUploading || isBulkUpdating}>
              Preview Changes
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => {
                if (checked) {
                  setBulkSelectedIds(products.map((p) => p.id));
                } else {
                  setBulkSelectedIds([]);
                }
              }}
              id="bulk-select-all"
            />
            <Label htmlFor="bulk-select-all">Select all products</Label>
            <span className="text-xs text-muted-foreground">
              {bulkSelectedIds.length > 0
                ? `${bulkSelectedIds.length} selected`
                : 'No selection = all products'}
            </span>
          </div>
          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-auto pr-2">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={bulkSelectedIds.includes(p.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setBulkSelectedIds((prev) => [...prev, p.id]);
                      } else {
                        setBulkSelectedIds((prev) => prev.filter((id) => id !== p.id));
                      }
                    }}
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          )}
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
                  ${formatPriceRounded(product.price)}
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

      <Dialog open={bulkPreviewOpen} onOpenChange={setBulkPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Price Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
            {bulkPreview.map((p) => {
              const original = products.find((x) => x.id === p.id);
              const originalPrice = original ? parsePriceNumber(original.price) : 0;
              const newPrice = parsePriceNumber(p.price);
              return (
                <div key={p.id} className="flex items-center justify-between border-b border-border pb-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {categories.find((c) => c.id === p.categoryId)?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground line-through">${formatPriceRounded(originalPrice)}</div>
                    <div className="font-semibold text-primary">${formatPriceRounded(newPrice)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBulkPreviewOpen(false)} disabled={isBulkUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBulkUpdate} disabled={isBulkUpdating}>
              {isBulkUpdating ? 'Updating...' : 'Confirm Update'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
