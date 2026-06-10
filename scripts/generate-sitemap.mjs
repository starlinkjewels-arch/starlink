import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const firebaseConfig = {
  apiKey: "AIzaSyBse5vfsARbl8k6ub9Mir6qs-CsPdaNuGU",
  authDomain: "starlinkjewels109.firebaseapp.com",
  projectId: "starlinkjewels109",
  storageBucket: "starlinkjewels109.firebasestorage.app",
  messagingSenderId: "192385163202",
  appId: "1:192385163202:web:6499e21aa7c34cd9e7c05b",
  measurementId: "G-FFTQZDHDDM",
};

const BASE_URL = "https://starlinkjewels.com";
const today = new Date().toISOString().split("T")[0];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const readCollection = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildUrlEntry = (loc, changefreq = "weekly", priority = "0.7", images = []) => {
  const imageXml = images
    .slice(0, 5)
    .filter(Boolean)
    .map(
      (img) => `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>`
    )
    .join("");

  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
};

const run = async () => {
  const [categories, products, buyingGuides, blogs] = await Promise.all([
    readCollection("categories"),
    readCollection("products"),
    readCollection("buying-guides"),
    readCollection("blogs"),
  ]);

  const urls = [];

  urls.push(buildUrlEntry(`${BASE_URL}/`, "daily", "1.0"));
  urls.push(buildUrlEntry(`${BASE_URL}/categories`, "weekly", "0.9"));
  urls.push(buildUrlEntry(`${BASE_URL}/gallery`, "weekly", "0.8"));
  urls.push(buildUrlEntry(`${BASE_URL}/blog`, "weekly", "0.7"));
  urls.push(buildUrlEntry(`${BASE_URL}/buying-guide`, "monthly", "0.7"));
  urls.push(buildUrlEntry(`${BASE_URL}/about`, "monthly", "0.6"));
  urls.push(buildUrlEntry(`${BASE_URL}/contact`, "monthly", "0.6"));
  urls.push(buildUrlEntry(`${BASE_URL}/usa`, "monthly", "0.6"));
  urls.push(buildUrlEntry(`${BASE_URL}/canada`, "monthly", "0.6"));
  urls.push(buildUrlEntry(`${BASE_URL}/australia`, "monthly", "0.6"));
  urls.push(buildUrlEntry(`${BASE_URL}/germany`, "monthly", "0.6"));

  categories.forEach((cat) => {
    if (!cat?.id) return;
    const images = cat.image
      ? [{ loc: cat.image, title: cat.name ? `${cat.name} - Starlink Jewels` : undefined }]
      : [];
    urls.push(buildUrlEntry(`${BASE_URL}/category/${cat.id}`, "weekly", "0.85", images));
  });

  buyingGuides
    .filter((g) => g?.published && g?.slug)
    .forEach((g) => {
      urls.push(buildUrlEntry(`${BASE_URL}/buying-guide/${g.slug}`, "monthly", "0.6"));
    });

  products.forEach((product) => {
    if (!product?.id) return;
    const productImages = [];
    if (product.images && Array.isArray(product.images)) {
      product.images.slice(0, 5).forEach((img) => {
        if (img && typeof img === "string" && img.startsWith("http")) {
          productImages.push({
            loc: img,
            title: product.name ? `${product.name} - Starlink Jewels` : undefined,
            caption: product.name || undefined,
          });
        }
      });
    } else if (product.image && typeof product.image === "string") {
      productImages.push({
        loc: product.image,
        title: product.name ? `${product.name} - Starlink Jewels` : undefined,
        caption: product.name || undefined,
      });
    }
    urls.push(buildUrlEntry(`${BASE_URL}/product/${product.id}`, "weekly", "0.75", productImages));
  });

  blogs.forEach((blog) => {
    if (!blog?.id) return;
    const blogImages = blog.image
      ? [{ loc: blog.image, title: blog.title || undefined, caption: blog.title || undefined }]
      : [];
    urls.push(buildUrlEntry(`${BASE_URL}/blog/${blog.id}`, "monthly", "0.65", blogImages));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outputPath = resolve(__dirname, "..", "public", "sitemap.xml");
  await writeFile(outputPath, xml, "utf8");
  console.log(`Sitemap generated with ${urls.length} URLs (including image tags).`);
};

run().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
