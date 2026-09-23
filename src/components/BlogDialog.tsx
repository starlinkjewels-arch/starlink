import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Share2, Link2, Check, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/lib/storage';
import { sanitizeHtml } from '@/lib/sanitize';
import { cleanRichTextHtml, stripHtml, SITE } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';

interface BlogDialogProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

const readingMinutes = (html: string) => Math.max(1, Math.round(stripHtml(html).split(/\s+/).length / 220));

const BlogDialog = ({ blog, isOpen, onClose, whatsappNumber }: BlogDialogProps) => {
  const [copied, setCopied] = useState(false);
  const content = useMemo(() => (blog ? sanitizeHtml(cleanRichTextHtml(blog.content)) : ''), [blog]);

  if (!blog) return null;

  const blogUrl = `${SITE.url}/blog/${blog.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, url: blogUrl });
        return;
      } catch {
        // cancelled: fall back to copying
      }
    }
    copyLink();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:h-[92vh] sm:rounded-lg sm:border [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">{blog.title}</DialogTitle>
        <DialogDescription className="sr-only">Journal article</DialogDescription>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md backdrop-blur hover:bg-background"
          aria-label="Close article"
        >
          <X className="h-5 w-5" />
        </button>

        <article className="flex-1 overflow-y-auto">
          <div className="bg-neutral-100 dark:bg-neutral-900">
            <img src={blog.image} alt={blog.title} className="mx-auto max-h-[55vh] w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
          </div>

          <div className="mx-auto max-w-2xl px-6 py-10 md:py-14">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <time dateTime={blog.date}>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              <span aria-hidden>·</span>
              <span>{readingMinutes(blog.content)} min read</span>
            </div>
            <h1 className="heading-lg mt-4 text-balance">{blog.title}</h1>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? <Check /> : <Link2 />} {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="outline" size="sm" onClick={share}>
                <Share2 /> Share
              </Button>
            </div>

            <div className="rich-text mt-10 md:prose-lg" dangerouslySetInnerHTML={{ __html: content }} />

            <div className="mt-14 rounded-md bg-secondary/60 p-8 text-center">
              <p className="font-display text-2xl">Have a question about this?</p>
              <p className="mt-2 text-sm text-muted-foreground">Our diamond experts are happy to help you choose.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild variant="whatsapp">
                  <a href={whatsappLink(`Hi Starlink Jewels! I read "${blog.title}" and have a question.`, whatsappNumber)} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp /> Ask on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/categories" onClick={onClose}>
                    Shop collections <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </DialogContent>
    </Dialog>
  );
};

export default BlogDialog;
