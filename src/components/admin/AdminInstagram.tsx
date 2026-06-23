import { useState, useEffect } from 'react';
import { getInstagramPosts, saveInstagramPost, deleteInstagramPost, InstagramPost } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const isInstagramUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'instagram.com' || parsed.hostname === 'www.instagram.com';
  } catch { return false; }
};

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getInstagramPosts().then(setPosts);
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
    if (!trimmedUrl) { toast.error('Please enter an Instagram post URL'); return; }
    if (!isInstagramUrl(trimmedUrl)) { toast.error('Please enter a valid Instagram URL'); return; }
    setIsAdding(true);
    try {
      const postData: InstagramPost = { id: editingId || Date.now().toString(), url: trimmedUrl };
      await saveInstagramPost(postData);
      const updated = await getInstagramPosts();
      setPosts(updated);
      handleClose();
      toast.success(editingId ? 'Instagram post updated' : 'Instagram post added');
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
              <iframe
                src={post.url}
                title="Instagram post"
                className="w-full h-[480px] border-0 bg-[#fafafa]"
                loading="lazy"
                allow="encrypted-media; autoplay"
                scrolling="no"
              />
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2 truncate">{post.url}</p>
                <div className="flex gap-1.5">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />Open
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)} disabled={isDeleting === post.id} className="flex-1 text-xs">
                    <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)} disabled={isDeleting === post.id} className="flex-1 text-xs">
                    <Trash2 className="h-3.5 w-3.5 mr-1" />{isDeleting === post.id ? '...' : 'Delete'}
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
                placeholder="https://www.instagram.com/reel/ABC123/embed/"
              />
              <p className="text-xs text-muted-foreground">
                Enter the embed URL: instagram.com/reel/ID/embed/ or /p/ID/embed/
              </p>
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
