// Fotoğrafı olmayan kayıtlar için nötr yer tutucu (gerçek olmayan stok görsel kullanılmaz).
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
  '<rect width="800" height="600" fill="#e5e7eb"/>' +
  '<g fill="none" stroke="#9ca3af" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="270" y="215" width="260" height="190" rx="28"/>' +
  '<circle cx="400" cy="310" r="52"/>' +
  '<path d="M340 215l16-32h88l16 32"/>' +
  '</g></svg>';

export const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
