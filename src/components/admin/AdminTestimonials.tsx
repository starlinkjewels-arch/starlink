import { useState, useEffect } from 'react';
import { getTestimonials, saveTestimonial, deleteTestimonial, Testimonial } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Quote, Pencil, Star } from 'lucide-react';
import { toast } from 'sonner';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getTestimonials().then(setTestimonials);
  }, []);

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setName(testimonial.name);
    setText(testimonial.text);
    setRating(testimonial.rating);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setText('');
    setRating(5);
  };

  const handleAdd = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

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
      
      setName('');
      setText('');
      setRating(5);
      setEditingId(null);
      
      toast.success(editingId ? 'Testimonial updated successfully' : 'Testimonial added successfully');
    } catch (error) {
      toast.error(editingId ? 'Failed to update testimonial' : 'Failed to add testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTestimonial(id);
      const updated = await getTestimonials();
      setTestimonials(updated);
      toast.success('Testimonial deleted');
    } catch (error) {
      toast.error('Failed to delete testimonial');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Testimonial' : 'Add New Customer Testimonial'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="testimonial-rating">Rating (1-5 stars)</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer transition-colors ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Customer Testimonials ({testimonials.length})</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardContent className="p-6 space-y-3">
                <Quote className="h-8 w-8 text-primary/20" />
                <p className="text-sm italic text-muted-foreground">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="font-semibold">— {testimonial.name}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                    disabled={isDeleting === testimonial.id}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={isDeleting === testimonial.id}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === testimonial.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
