import { useState, useEffect } from 'react';
import { getInstagramPosts, saveInstagramPost, deleteInstagramPost, InstagramPost } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';

// Load Instagram embed.js once for admin previews
const loadInstagramEmbed = () => {
  if ((window as Window & { instgrm?: { Embeds: { process(): void } } }).instgrm) {
    (window as Window & { instgrm?: { Embeds: { process(): void } } }).instgrm!.Embeds.process();
    return;
  }
  if (document.getElementById('ig-embed-script')) return;
  const s = document.createElement('script');
  s.id = 'ig-embed-script';
  s.src = 'https://www.instagram.com/embed.js';
  s.async = true;
  document.body.appendChild(s);
};

const isInstagramUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.hostname === 'instagram.com' || parsedUrl.hostname === 'www.instagram.com';
  } catch {
    return false;
  }
};

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getInstagramPosts().then((data) => {
      setPosts(data);
      if (data.length > 0) loadInstagramEmbed();
    });
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setUrl('');
    setDialogOpen(true);
  };

  const handleEdit = (post: InstagramPost) => {
    setEditingId(post.id);
    setUrl(post.url);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setUrl('');
  };

  const handleSave = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error('Please enter an Instagram post URL');
      return;
    }
    if (!isInstagramUrl(trimmedUrl)) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }
    setIsAdding(true);
    try {
      const postData: InstagramPost = {
        id: editingId || Date.now().toString(),
        url: trimmedUrl,
      };
      await saveInstagramPost(postData);
      const updated = await getInstagramPosts();
      setPosts(updated);
      handleClose();
      toast.success(editingId ? 'Instagram post updated' : 'Instagram post added');
      setTimeout(loadInstagramEmbed, 500);
    } catch {
      toast.error(editingId ? 'Failed to update post' : 'Failed to add post');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteInstagramPost(id);
      const updated = await getInstagramPosts();
      setPosts(updated);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Instagram Posts ({posts.length})</h2>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {/* Official Instagram embed preview */}
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`${post.url}?utm_source=ig_embed&utm_campaign=loading`}
              data-instgrm-version="14"
              style={{ background: '#fff', border: 0, borderRadius: 0, margin: 0, maxWidth: '100%', minWidth: 0, width: '100%' }}
            >
              <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                Loading preview…
              </div>
            </blockquote>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3 truncate">{post.url}</p>
              <div className="flex gap-2">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />Open
                  </Button>
                </a>
                <Button variant="outline" size="sm" onClick={() => handleEdit(post)} disabled={isDeleting === post.id} className="flex-1">
                  <Pencil className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)} disabled={isDeleting === post.id} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />{isDeleting === post.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground col-span-2 text-center py-8">No posts added yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Instagram Post' : 'Add Instagram Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="instagram-url">Instagram Post URL *</Label>
              <Input
                id="instagram-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/... or /p/..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isAdding}>Cancel</Button>
            <Button onClick={handleSave} disabled={isAdding}>
              {isAdding ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Post' : 'Add Post')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInstagram;
