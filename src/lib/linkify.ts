/**
 * Converts URLs in text to clickable links
 * Matches: http://, https://, www.
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  // Regex to match URLs
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)|(www\.[^\s<>"{}|\\^`[\]]+)/gi;
  
  return text.replace(urlPattern, (match) => {
    // Add protocol if missing (for www. links)
    const href = match.startsWith('www.') ? `https://${match}` : match;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline underline-offset-2 break-all">${match}</a>`;
  });
}

/**
 * React component helper that renders text with auto-linked URLs
 */
export function createLinkedHTML(text: string): string {
  if (!text) return '';
  
  // First escape HTML to prevent XSS, then apply linkify
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  return linkifyText(escaped);
}
