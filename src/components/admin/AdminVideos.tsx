import { useEffect, useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {
  getVideos,
  saveVideo,
  deleteVideo,
  getProducts,
  captureVideoPoster,
  uploadImageToStorage,
  type VideoPost,
  type Product,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Film, Pencil, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_VIDEO_MB = 200;
const NO_PRODUCT = 'none';

const uploadVideoFile = (file: File, onProgress: (pct: number) => void): Promise<string> => {
  const safeName = file.name.replace(/[^\w.-]+/g, '_');
  const storageRef = ref(storage, `videos/${Date.now()}_${safeName}`);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type || 'video/mp4' });
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState('');
  const [productId, setProductId] = useState<string>(NO_PRODUCT);
  const [priority, setPriority] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editing, setEditing] = useState<VideoPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => getVideos().then(setVideos);

  useEffect(() => {
    refresh();
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const resetForm = () => {
    setTitle('');
    setProductId(NO_PRODUCT);
    setPriority('');
    setFile(null);
    setPreviewUrl('');
    setEditing(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      toast.error('Please choose a video file (MP4, MOV or WebM)');
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video must be smaller than ${MAX_VIDEO_MB} MB`);
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handleEdit = (video: VideoPost) => {
    setEditing(video);
    setTitle(video.title || '');
    setProductId(video.productId || NO_PRODUCT);
    setPriority(video.priority ? String(video.priority) : '');
    setFile(null);
    setPreviewUrl(video.url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!file && !editing) {
      toast.error('Please select a video to upload');
      return;
    }

    setIsSaving(true);
    setProgress(0);
    try {
      let url = editing?.url || '';
      let poster = editing?.poster;

      if (file) {
        // Upload the poster first (small), then the video with progress feedback.
        const posterFile = await captureVideoPoster(file);
        if (posterFile) {
          poster = await uploadImageToStorage(posterFile, 'videos/posters', true);
        }
        url = await uploadVideoFile(file, setProgress);
      }

      const video: VideoPost = {
        id: editing?.id || Date.now().toString(),
        url,
        poster,
        title: title.trim() || undefined,
        productId: productId !== NO_PRODUCT ? productId : undefined,
        priority: priority ? Number(priority) : undefined,
        createdAt: editing?.createdAt || Date.now(),
      };

      await saveVideo(video);
      await refresh();
      toast.success(editing ? 'Video updated' : 'Video published to the homepage');
      resetForm();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Upload failed. Check your connection and Firebase Storage rules, then try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this video from the website?')) return;
    setDeletingId(id);
    try {
      await deleteVideo(id);
      await refresh();
      if (editing?.id === id) resetForm();
      toast.success('Video deleted');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  const productName = (id?: string) => products.find((p) => p.id === id)?.name;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            {editing ? 'Edit Video' : 'Upload Video'}
          </CardTitle>
          <CardDescription>
            Short vertical videos (9:16, under 60 seconds) work best. They play as reels on the homepage.
            Link a product to make the video shoppable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-6 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-file">Video file {editing ? '(leave empty to keep current)' : '*'}</Label>
                <Input
                  id="video-file"
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/*"
                  onChange={handleFileChange}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">MP4 recommended for iPhone compatibility. Max {MAX_VIDEO_MB} MB.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-title">Caption (optional)</Label>
                <Input
                  id="video-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3 ct oval solitaire in motion"
                  maxLength={80}
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Linked product (optional)</Label>
                  <Select value={productId} onValueChange={setProductId} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="No product" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value={NO_PRODUCT}>No product</SelectItem>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-priority">Display order (optional)</Label>
                  <Input
                    id="video-priority"
                    type="number"
                    min={1}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="1 = first"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {isSaving && file && (
                <div className="space-y-1">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isSaving ? 'Saving…' : editing ? 'Update Video' : 'Upload & Publish'}
                </Button>
                {(editing || file) && (
                  <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="flex aspect-[9/16] items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {previewUrl ? (
                <video src={previewUrl} className="h-full w-full object-cover" controls muted playsInline />
              ) : (
                <p className="px-4 text-center text-xs text-muted-foreground">Preview appears here</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Published videos ({videos.length})</h3>
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos yet. Upload your first reel above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-[9/16] bg-muted">
                  <video
                    src={video.url}
                    poster={video.poster}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    controls
                  />
                  {video.priority ? (
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">
                      #{video.priority}
                    </span>
                  ) : null}
                </div>
                <CardContent className="space-y-2 p-3">
                  <p className="line-clamp-1 text-sm font-medium">{video.title || 'Untitled'}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {productName(video.productId) ? `Linked: ${productName(video.productId)}` : 'No linked product'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(video)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(video.id)}
                      disabled={deletingId === video.id}
                    >
                      {deletingId === video.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;
