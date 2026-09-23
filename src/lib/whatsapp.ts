// wa.me only accepts the number as digits (country code included, no "+", spaces or brackets).
export const DEFAULT_WHATSAPP = "12015544824";

export const toWhatsAppNumber = (raw?: string | null): string => {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : DEFAULT_WHATSAPP;
};

export const whatsappLink = (message?: string, number?: string | null): string => {
  const base = `https://wa.me/${toWhatsAppNumber(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const openWhatsApp = (message?: string, number?: string | null) => {
  window.open(whatsappLink(message, number), "_blank", "noopener,noreferrer");
};
