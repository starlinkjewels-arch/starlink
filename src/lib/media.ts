// Firebase download URLs carry query strings, so match the extension anywhere before "?" as well as known name hints.
const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)(\?|$|%)/i;

export const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return VIDEO_EXT.test(lower) || lower.includes('vid-') || lower.includes('video');
};

export const firstImage = (item: { image?: string; images?: string[] }): string | undefined => {
  const media = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  return media.find((url) => url && !isVideoUrl(url)) || media[0];
};

export const getProductTime =(item: { id?: string; createdAt?: unknown }): number => {
  const created = item.createdAt as number | string | { seconds: number } | undefined;
  if (created) {
    if (typeof created === 'object' && 'seconds' in created) return created.seconds * 1000;
    if (typeof created === 'number') return created;
    if (typeof created === 'string') {
      const t = new Date(created).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  // Older products used Date.now() as their id.
  const fromId = Number(String(item.id || '').split('_').pop());
  return Number.isFinite(fromId) && fromId > 0 ? fromId : 0;
};
