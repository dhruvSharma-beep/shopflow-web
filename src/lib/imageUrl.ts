// Force HTTPS on all CDN URLs — fixes Safari mixed-content block
export const cdnUrl = (path: string) =>
  path.startsWith('http://') ? 'https://' + path.slice(7) : path;