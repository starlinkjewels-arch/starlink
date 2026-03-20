export const SITE = {
  name: "Starlink Jewels",
  url: "https://www.starlinkjewels.com",
  ogImage: "https://www.starlinkjewels.com/icon.png",
  phonePrimary: "+91 9967381180",
  phoneWhatsApp: "+91 9967381180",
  email: "info@starlinkjewels.com",
  addressIndia: {
    country: "IN",
    region: "Gujarat",
    locality: "Surat",
  },
  addressUsa: {
    street: "55 John St",
    locality: "East Rutherford",
    region: "NJ",
    postalCode: "07073",
    country: "US",
  },
  sameAs: [
    "https://instagram.com/starlinkjewels",
    "https://facebook.com/starlinkjewels",
    "https://pinterest.com/starlinkjewels",
  ],
  keywords: [
    "lab grown diamond jewelry",
    "natural diamond engagement rings",
    "custom diamond jewelry",
    "eternity ring lab grown diamonds",
    "diamond necklace online India",
    "wholesale lab grown diamonds Surat",
    "certified lab grown diamond rings",
    "14KT gold diamond earrings",
    "luxury diamond wedding bands",
    "buy natural and lab grown diamonds online",
    "diamond jewelry",
    "gold jewelry",
    "engagement rings",
    "wedding bands",
    "GIA certified",
    "IGI certified",
  ],
};

export const buildKeywords = (extra?: string) => {
  const base = SITE.keywords.join(", ");
  return extra ? `${extra}, ${base}` : base;
};
