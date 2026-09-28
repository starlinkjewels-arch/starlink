# SEO fixes for the tool subdomains

`ringbuilder.starlinkjewels.com` and `360.starlinkjewels.com` are separate apps (not in this repo).
Audit (Sep 2026): no structured data, no canonical tag, almost no crawlable text, and the ring builder
has no sitemap. The main site now has landing pages that target the search terms:

- https://starlinkjewels.com/ring-builder — "ring builder", "design your own engagement ring", "3D ring builder"
- https://starlinkjewels.com/3d-jewelry-viewer — "3D jewelry viewer", "jewelry rendering", "360 jewelry viewer"

Apply the changes below in each app so Google treats the tool and its landing page as one topic.

## ringbuilder.starlinkjewels.com

Add to `<head>` in `index.html`:

```html
<link rel="canonical" href="https://ringbuilder.starlinkjewels.com/" />
<title>3D Ring Builder – Design Your Own Engagement Ring | Starlink Jewels</title>
<meta name="description" content="Design your own diamond engagement ring in real-time 3D: 9 diamond shapes, 0.50–3.00 ct, 6 band styles, halo options and 14K/18K gold. Free, no sign-up." />
<meta property="og:image" content="https://starlinkjewels.com/icon.png" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://ringbuilder.starlinkjewels.com/#app",
  "name": "Starlink 3D Ring Builder",
  "url": "https://ringbuilder.starlinkjewels.com/",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any (web browser)",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@id": "https://starlinkjewels.com/#jewelry-store" },
  "mainEntityOfPage": "https://starlinkjewels.com/ring-builder"
}
</script>
```

Also:

1. Add `public/sitemap.xml` listing `https://ringbuilder.starlinkjewels.com/`, and a `Sitemap:` line in `robots.txt`.
2. Add a visible text link to `https://starlinkjewels.com/ring-builder` ("How it works") near "Back to store".
3. Make the `<h1>` describe the tool ("Design your own engagement ring"), and show the selected ring name as an `<h2>`.

## 360.starlinkjewels.com

```html
<link rel="canonical" href="https://360.starlinkjewels.com/" />
<title>3D Jewelry Viewer – Real-Time Photorealistic Rendering | Starlink Jewels</title>
<meta name="description" content="See fine jewelry in photorealistic real-time 3D. Rotate 360°, switch gold, platinum and silver finishes live and watch the diamonds sparkle." />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://360.starlinkjewels.com/#app",
  "name": "Starlink 3D Jewelry Viewer",
  "url": "https://360.starlinkjewels.com/",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any (web browser)",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@id": "https://starlinkjewels.com/#jewelry-store" },
  "mainEntityOfPage": "https://starlinkjewels.com/3d-jewelry-viewer"
}
</script>
```

Also add an `<h1>` ("3D Jewelry Viewer") and a link to `https://starlinkjewels.com/3d-jewelry-viewer`.

## Search Console

Add both subdomains as properties in Google Search Console and Bing Webmaster Tools (or verify the
whole `starlinkjewels.com` domain once with a DNS record, which covers every subdomain), and submit
their sitemaps.
