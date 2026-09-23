// Strips scripts, embeds and inline event handlers from admin-authored HTML before it is rendered.
const BLOCKED_TAGS = 'script, style, link, meta, title, iframe, object, embed, form, base';

export const sanitizeHtml = (html: string, options: { stripInlineStyles?: boolean } = {}): string => {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());

  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      // Content pasted from other apps carries their classes/data attributes, which can clash with site styles.
      else if (name === 'class' || name === 'id' || name === 'dir' || name.startsWith('data-')) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:')) el.removeAttribute(attr.name);
      else if (options.stripInlineStyles && (name === 'style' || name === 'face' || name === 'color' || name === 'size')) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') el.setAttribute('rel', 'noopener noreferrer');
  });

  return doc.body.innerHTML;
};
