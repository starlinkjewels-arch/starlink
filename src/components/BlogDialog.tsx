import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Calendar, ArrowRight, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { BlogPost } from '@/lib/storage';
import { useState } from 'react';
import { toast } from 'sonner';

interface BlogDialogProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

const BlogDialog = ({ blog, isOpen, onClose, whatsappNumber = '9967381180' }: BlogDialogProps) => {
  const [copied, setCopied] = useState(false);
  
  if (!blog) return null;

  const blogUrl = `${window.location.origin}/blog?id=${blog.id}`;

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Hi! I read your blog: "${blog.title}" and I'd like to learn more.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      toast.success('Blog link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: `Check out this blog: ${blog.title}`,
          url: blogUrl,
        });
      } catch (err) {
        // User cancelled or error
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-hidden p-0 rounded-2xl border border-border shadow-2xl bg-background">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 rounded-full bg-black/60 backdrop-blur-sm p-2.5 hover:bg-black/80 transition-all duration-300 hover:scale-110"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="flex flex-col max-h-[95vh] overflow-y-auto bg-background">
          {/* Featured Image - Full Display with proper background */}
          <div className="relative w-full bg-black flex items-center justify-center">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-auto max-h-[50vh] object-contain"
            />
          </div>
          {/* Content Section */}
          <div className="relative px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 space-y-4 bg-background">
            {/* Badge, Date & Share Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  Blog Post
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={blog.date}>
                    {new Date(blog.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="gap-1.5 h-8 px-3 text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1.5 h-8 px-3 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </div>
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-foreground">
              {blog.title}
            </h2>
            {/* Decorative Divider */}
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-12 bg-primary rounded-full" />
              <div className="h-0.5 w-6 bg-primary/50 rounded-full" />
              <div className="h-0.5 w-3 bg-primary/30 rounded-full" />
            </div>
            {/* Content - Render HTML with Tailwind Prose for attractive styling */}
            <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:font-bold prose-em:font-medium prose-code:bg-muted/50 prose-pre:bg-muted/50 prose-ul:ml-4 prose-ol:ml-4 prose-li:my-1">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
            {/* CTA Section */}
            <div className="pt-5 mt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Interested in learning more? Contact us today!
                </p>
                <Button
                  onClick={handleWhatsAppShare}
                  className="w-full sm:w-auto gap-2 bg-[#25D366] hover:bg-[#20BA59] text-white font-semibold px-5 py-2.5 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="default"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogDialog;
