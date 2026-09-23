import { useState, useEffect } from 'react';
import { getTestimonials, saveTestimonial, deleteTestimonial, Testimonial } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Quote, Pencil, Star } from 'lucide-react';
import { toast } from 'sonner';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getTestimonials().then(setTestimonials);
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setText('');
    setRating(5);
    setDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setName(testimonial.name);
    setText(testimonial.text);
    setRating(testimonial.rating);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName('');
    setText('');
    setRating(5);
  };

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSaving(true);
    try {
      const testimonial: Testimonial = {
        id: editingId || Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        rating,
      };
      await saveTestimonial(testimonial);
      const updated = await getTestimonials();
      setTestimonials(updated);
      handleClose();
      toast.success(editingId ? 'Testimonial updated' : 'Testimonial added');
    } catch {
      toast.error(editingId ? 'Failed to update testimonial' : 'Failed to add testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTestimonial(id);
      const updated = await getTestimonials();
      setTestimonials(updated);
      toast.success('Testimonial deleted');
    } catch {
      toast.error('Failed to delete testimonial');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Testimonials ({testimonials.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6 space-y-3">
              <Quote className="h-8 w-8 text-primary/20" />
              <p className="text-sm italic text-muted-foreground">"{testimonial.text}"</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="font-semibold">— {testimonial.name}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)} disabled={isDeleting === testimonial.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(testimonial.id)} disabled={isDeleting === testimonial.id} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === testimonial.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No testimonials added yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="testimonial-name">Customer Name *</Label>
              <Input
                id="testimonial-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah Johnson"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial-text">Testimonial Text *</Label>
              <Textarea
                id="testimonial-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter customer testimonial..."
                rows={4}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-7 w-7 cursor-pointer transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add Testimonial')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestimonials;
