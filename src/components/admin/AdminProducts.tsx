import { useState, useEffect, useRef } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { getProducts, saveProduct, deleteProduct, getCategories, Product, Category, uploadImageToStorage, getProductCategoryIds } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, X, Play, GripVertical, Images, Copy, Search, ChevronsUpDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPriceRounded } from '@/lib/utils';
import { stripHtml } from '@/lib/seo';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  file?: File;
  source: 'existing' | 'new';
}

// Reusable multi-select dropdown component
const MultiSelectDropdown = ({
  options,
  selected,
  onToggle,
  placeholder,
  searchable = false,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
  placeholder: string;
  searchable?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable && search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find(o => o.id === selected[0])?.label ?? placeholder
      : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          <span className="truncate text-left">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        {searchable && (
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <input
              className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        {searchable && selected.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground">
            <span>{selected.length} selected</span>
            <button
              className="text-destructive hover:underline"
              onClick={() => selected.forEach(id => onToggle(id, false))}
            >
              Clear all
            </button>
          </div>
        )}
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No results found.</p>
          )}
          {filtered.map((opt) => {
            const isChecked = selected.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer text-sm select-none"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => onToggle(opt.id, Boolean(checked))}
                />
                <span className="flex-1 truncate">{opt.label}</span>
                {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const hoverIdRef = useRef<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkDelta, setBulkDelta] = useState('10');
  const [bulkMode, setBulkMode] = useState<'amount' | 'percent'>('amount');
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<Product[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoFaq, setSeoFaq] = useState<{ question: string; answer: string }[]>([]);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
    getCategories().then(setCategories);
  }, []);

  const getMediaType = (file: File): 'image' | 'video' => file.type.startsWith('video/') ? 'video' : 'image';

  const getMediaTypeFromUrl = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    return videoExtensions.test(url) || url.toLowerCase().includes('video') || url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('vid-') ? 'video' : 'image';
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems: MediaItem[] = [];
    let processedCount = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newItems.push({ id: `new-${Date.now()}-${index}`, url: reader.result as string, type: getMediaType(file), file, source: 'new' });
        processedCount++;
        if (processedCount === files.length) setMediaItems(prev => [...prev, ...newItems]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveMedia = (id: string) => setMediaItems(prev => prev.filter(item => item.id !== id));

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
    if (activeId && targetId && activeId !== targetId) reorderMedia(activeId, targetId);
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
      if (targetId) hoverIdRef.current = targetId;
    };
    const onPointerUp = (e: PointerEvent) => { if (isDraggingRef.current) handlePointerUp(e.pointerId); };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [activePointerId]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setSelectedCategoryIds([]);
    setMediaItems([]);
    setMetaTitle('');
    setMetaDescription('');
    setSeoFaq([]);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.replace(/[^0-9.]/g, ''));
    setSelectedCategoryIds(getProductCategoryIds(product));
    setMetaTitle(product.metaTitle || '');
    setMetaDescription(product.metaDescription || '');
    setSeoFaq(product.seoFaq || []);
    const existingUrls = product.images || [product.image];
    setMediaItems(existingUrls.map((url, index) => ({ id: `existing-${index}-${url}`, url, type: getMediaTypeFromUrl(url), source: 'existing' as const })));
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleSave = async () => {
    if (!name || !price || selectedCategoryIds.length === 0 || mediaItems.length === 0) {
      toast.error('Please fill all required fields and add at least one image/video');
      return;
    }
    setIsUploading(true);
    try {
      const newFiles = mediaItems.filter(m => m.source === 'new' && m.file).map(m => m.file as File);
      const newUploads = newFiles.length > 0 ? await Promise.all(newFiles.map(file => uploadImageToStorage(file, 'products'))) : [];
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
        categoryId: selectedCategoryIds[0],
        categoryIds: selectedCategoryIds,
        image: allMediaUrls[0],
        images: allMediaUrls,
        createdAt: existing?.createdAt ?? Date.now(),
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        seoFaq: seoFaq.length > 0 ? seoFaq : undefined,
      };
      await saveProduct(productData);
      const updated = await getProducts();
      setProducts(updated);
      handleClose();
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

  const getDescriptionPreview = (html: string) => {
    const text = stripHtml(html || '');
    if (!text) return '';
    return text.length > 140 ? `${text.slice(0, 137).trimEnd()}...` : text;
  };

  const handleOpenBulkPreview = () => {
    const delta = parsePriceNumber(bulkDelta);
    if (delta === 0) { toast.error('Please enter a non-zero amount'); return; }
    const targetProducts = bulkSelectedIds.length > 0 ? products.filter((p) => bulkSelectedIds.includes(p.id)) : products;
    if (targetProducts.length === 0) { toast.error('No products to update'); return; }
    const next = targetProducts.map((p) => {
      const current = parsePriceNumber(p.price);
      const updated = bulkMode === 'percent' ? Math.max(0, current + (current * delta) / 100) : Math.max(0, current + delta);
      return { ...p, price: formatPrice(updated) };
    });
    setBulkPreview(next);
    setBulkPreviewOpen(true);
  };

  const handleConfirmBulkUpdate = async () => {
    if (bulkPreview.length === 0) { setBulkPreviewOpen(false); return; }
    setIsBulkUpdating(true);
    try {
      await Promise.all(bulkPreview.map((p) => saveProduct(p)));
      const updated = await getProducts();
      setProducts(updated);
      setBulkSelectedIds([]);
      toast.success('All product prices updated');
      setBulkPreviewOpen(false);
    } catch {
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
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(null);
    }
  };

  const getCategoryNames = (product: Product) => {
    const ids = getProductCategoryIds(product);
    return categories.filter((category) => ids.includes(category.id)).map((category) => category.name);
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || getCategoryNames(p).some((n) => n.toLowerCase().includes(q));
      })
    : products;

  const categoryOptions = categories.map(c => ({ id: c.id, label: c.name }));
  const productOptions = products.map(p => ({ id: p.id, label: p.name }));

  const bulkTargetLabel = bulkSelectedIds.length === 0
    ? `All products (${products.length})`
    : `${bulkSelectedIds.length} product${bulkSelectedIds.length !== 1 ? 's' : ''} selected`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products ({products.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Bulk Price Update */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Price Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="bulk-delta">Increase / Decrease Value</Label>
              <Input id="bulk-delta" value={bulkDelta} onChange={(e) => setBulkDelta(e.target.value)} placeholder="e.g., 10" type="number" step="0.01" />
              <p className="text-xs text-muted-foreground">Use negative value to decrease.</p>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={bulkMode} onValueChange={(v) => setBulkMode(v as 'amount' | 'percent')}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">$ Amount</SelectItem>
                  <SelectItem value="percent">% Percent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleOpenBulkPreview} disabled={isBulkUpdating} className="self-end">
              Preview Changes
            </Button>
          </div>

          {/* Product multi-select dropdown */}
          <div className="space-y-2">
            <Label>Apply To</Label>
            <MultiSelectDropdown
              options={productOptions}
              selected={bulkSelectedIds}
              onToggle={(id, checked) => {
                if (checked) setBulkSelectedIds(prev => [...prev, id]);
                else setBulkSelectedIds(prev => prev.filter(x => x !== id));
              }}
              placeholder={`All products (${products.length})`}
              searchable
            />
            <p className="text-xs text-muted-foreground">
              {bulkSelectedIds.length === 0 ? 'No selection = update all products' : bulkTargetLabel}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID or category…" className="pl-9" />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')}><X className="h-4 w-4" /></Button>
        )}
        <span className="text-sm text-muted-foreground whitespace-nowrap">{filteredProducts.length} / {products.length}</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const productMedia = product.images || [product.image];
          const mainMediaType = getMediaTypeFromUrl(product.image);
          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {mainMediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video className="w-full h-full object-cover" preload="metadata" muted playsInline>
                      <source src={product.image} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-12 w-12 text-white" fill="white" />
                    </div>
                  </div>
                ) : (
                  <OptimizedImage src={product.image} alt={product.name} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                )}
                {productMedia.length > 1 && (
                  <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">+{productMedia.length - 1} more</div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{getCategoryNames(product).join(', ') || 'Unknown'}</p>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                {product.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{getDescriptionPreview(product.description)}</p>}
                <p className="font-bold text-xl text-primary mb-4">${formatPriceRounded(product.price)}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(product)} disabled={isDeleting === product.id} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(product.id)} disabled={isDeleting === product.id} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />{isDeleting === product.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{searchQuery ? `No products found matching "${searchQuery}".` : 'No products added yet. Click "Add Product" to get started!'}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Edit Product</span>
                  <div className="flex items-center gap-1.5 bg-muted rounded-md px-2 py-1">
                    <span className="font-mono text-xs text-muted-foreground">{editingId}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(editingId); toast.success('Product ID copied'); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Categories multi-select dropdown */}
            <div className="space-y-2">
              <Label>Categories *</Label>
              <MultiSelectDropdown
                options={categoryOptions}
                selected={selectedCategoryIds}
                onToggle={(id, checked) => {
                  if (checked) setSelectedCategoryIds(prev => prev.includes(id) ? prev : [...prev, id]);
                  else setSelectedCategoryIds(prev => prev.filter(x => x !== id));
                }}
                placeholder="Select categories..."
              />
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedCategoryIds.map(id => {
                    const cat = categories.find(c => c.id === id);
                    return cat ? (
                      <span key={id} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {cat.name}
                        <button onClick={() => setSelectedCategoryIds(prev => prev.filter(x => x !== id))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Select one or more categories. First selected = primary category.</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Diamond Ring" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Enter product description with rich formatting (bold, italic, lists, etc.)" />
            </div>

            {/* SEO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-meta-title">Meta Title (SEO)</Label>
                <Input id="product-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO meta title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-meta-description">Meta Description (SEO)</Label>
                <Input id="product-meta-description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="SEO meta description" />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (in $) *</Label>
              <Input id="product-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 599.99" type="number" step="0.01" />
            </div>

            {/* Media */}
            <div className="space-y-2">
              <Label>Product Images/Videos * ({mediaItems.length} file{mediaItems.length !== 1 ? 's' : ''})</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => mediaInputRef.current?.click()} disabled={isUploading}>
                  <Images className="h-4 w-4 mr-2" />Add Images / Videos
                </Button>
                <span className="text-sm text-muted-foreground">{mediaItems.length === 0 ? 'No files selected yet' : `${mediaItems.length} file${mediaItems.length !== 1 ? 's' : ''} ready`}</span>
              </div>
              <Input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} disabled={isUploading} className="cursor-pointer" />
              {mediaItems.length > 0 && (
                <div
                  data-media-grid
                  className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3 ${isDragging ? 'select-none' : ''}`}
                  style={{ touchAction: 'none' }}
                >
                  {mediaItems.map((media, index) => (
                    <div key={media.id} data-media-id={media.id} className={`relative group ${isDragging && draggedId === media.id ? 'ring-2 ring-primary' : ''}`}>
                      <div className={`aspect-square rounded-lg border-2 ${media.source === 'new' ? 'border-primary' : 'border-border'} overflow-hidden bg-muted`}>
                        {media.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video className="w-full h-full object-cover" preload="metadata" muted playsInline draggable={false}>
                              <source src={media.url} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-8 w-8 text-white" fill="white" />
                            </div>
                          </div>
                        ) : (
                          <OptimizedImage src={media.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" wrapperClassName="w-full h-full" draggable={false} />
                        )}
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveMedia(media.id); }}
                        className="absolute -top-2 -right-2 z-20 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        disabled={isUploading}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onPointerDown={(e) => handlePointerDown(e, media.id)}
                        className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-medium shadow-sm cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-3.5 w-3.5" />Move
                      </button>
                      <div className={`absolute bottom-2 left-2 ${media.source === 'new' ? 'bg-primary/90 text-primary-foreground' : 'bg-background/90'} backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium shadow-sm`}>
                        {media.type === 'video' ? 'Video' : 'Image'}
                      </div>
                      {media.source === 'new' && <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">New</div>}
                      {index === 0 && <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">Main</div>}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Supported: Images (JPG, PNG, WebP) and Videos (MP4, WebM). First file = main product image.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Product' : 'Add Product')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Price Preview Dialog */}
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
                    <div className="text-xs text-muted-foreground truncate">{getCategoryNames(p).join(', ') || 'Unknown'}</div>
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
            <Button variant="outline" onClick={() => setBulkPreviewOpen(false)} disabled={isBulkUpdating}>Cancel</Button>
            <Button onClick={handleConfirmBulkUpdate} disabled={isBulkUpdating}>{isBulkUpdating ? 'Updating...' : 'Confirm Update'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
