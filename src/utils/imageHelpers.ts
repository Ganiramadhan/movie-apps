// Utility function to fix malformed URLs from database
export const fixImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Fix double protocol: https://http:// or http://http://
  let fixed = url.replace(/^https?:\/\/https?:\/\//, 'https://');
  
  // Fix double path: /movies/movies/ -> /movies/
  fixed = fixed.replace(/\/movies\/movies\//, '/movies/');
  
  // If URL starts with http:// and page is loaded over HTTPS, upgrade to HTTPS
  if (fixed.startsWith('http://') && window.location.protocol === 'https:') {
    fixed = fixed.replace(/^http:\/\//, 'https://');
  }
  
  // Replace IP address with domain if present
  fixed = fixed.replace(/31\.97\.107\.126:9000/, 'storage.bpdabujapijabar.or.id');
  
  return fixed || null;
};

// Get proper image URL (TMDB or MinIO)
export const getImageUrl = (posterPath: string | null | undefined, size: string = 'w200'): string | null => {
  if (!posterPath) return null;
  
  // If it's a full URL (MinIO), fix any malformations
  if (posterPath.startsWith('http')) {
    const fixed = fixImageUrl(posterPath);
    return fixed || null;
  }
  
  // If it starts with /, it's a TMDB path
  if (posterPath.startsWith('/')) {
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }
  
  return posterPath || null;
};

// Placeholder image for when poster is not available
export const getPlaceholderImage = (width: number = 200, height: number = 300): string => {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect fill="%232a2a2a" width="${width}" height="${height}"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E`;
};
