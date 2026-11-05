// Homepage reviews intro. Every claim here is already made elsewhere on the site; keep it
// that way. Mirrored word for word in scripts/seo-data.mjs.
export const REVIEWS_INTRO =
  'What clients say about Starlink Jewels, in their own words. We design custom engagement rings, wedding bands and fine diamond jewelry in-house, approve every design in CAD before crafting, and have master artisans in Surat set each piece with IGI or GIA certified lab-grown and natural diamonds, then ship it insured worldwide.';

// Admins type "Michael R. – New York, USA" into one field; show the name and place apart.
export const splitTestimonialName = (raw: string) => {
  const [name, ...rest] = raw.split(/\s+[–—-]\s+/);
  return { name: name.trim(), place: rest.join(', ').trim() };
};
