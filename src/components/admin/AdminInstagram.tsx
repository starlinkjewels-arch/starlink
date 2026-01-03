import { useState, useEffect } from 'react';
import { getInstagramPosts, saveInstagramPost, deleteInstagramPost, InstagramPost } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getInstagramPosts().then(setPosts);
  }, []);

  const handleEdit = (post: InstagramPost) => {
    setEditingId(post.id);
    setUrl(post.url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUrl('');
  };

  const handleAddPost = async () => {
    if (!url) {
      toast.error('Please enter an Instagram post URL');
      return;
    }

    if (!url.includes('instagram.com')) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    setIsAdding(true);
    try {
      const postData: InstagramPost = {
        id: editingId || Date.now().toString(),
        url,
      };

      await saveInstagramPost(postData);
      const updated = await getInstagramPosts();
      setPosts(updated);
      setUrl('');
      setEditingId(null);
      toast.success(editingId ? 'Instagram post updated' : 'Instagram post added');
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Instagram Post' : 'Add Instagram Post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram-url">Instagram Post URL *</Label>
            <Input
              id="instagram-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddPost} className="flex-1" disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Post' : 'Add Post')}
            </Button>
            {editingId && (
              <Button onClick={handleCancelEdit} variant="outline" disabled={isAdding}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  View Post <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mb-4 truncate">{post.url}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post)}
                  disabled={isDeleting === post.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  disabled={isDeleting === post.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === post.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminInstagram;
