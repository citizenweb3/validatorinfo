// Guards against javascript:/data: URL injection when rendering operator-supplied links.
// Returns the URL only when it uses an http(s) scheme; otherwise null so the caller omits the link.
export const safeHref = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};
