const isBrowser = typeof window !== "undefined";

let assetsPreloaded = false;

export const preloadAssets = (urls: string[]) => {
  if (!isBrowser || assetsPreloaded) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if (unique.length === 0) return;

  assetsPreloaded = true;

  const doPreload = () => {
    unique.forEach((url) => {
      if (url.match(/\.(mp4|webm|ogg)$/i)) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.src = url;
      } else {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
      }
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(doPreload, { timeout: 1500 });
  } else {
    setTimeout(doPreload, 100);
  }
};
