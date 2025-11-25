/**
 * Utility for generating restaurant-specific favicons
 * This creates different sizes of favicons from restaurant logos
 */

export const generateRestaurantFavicons = (logoUrl, restaurantName) => {
  if (!logoUrl) return null;

  // Create a canvas to generate favicon sizes
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Different favicon sizes we need
  const sizes = [
    { size: 16, name: '16x16' },
    { size: 32, name: '32x32' },
    { size: 180, name: '180x180', rel: 'apple-touch-icon' },
    { size: 512, name: '512x512' }
  ];

  const faviconUrls = {};

  sizes.forEach(({ size, name, rel = 'icon' }) => {
    canvas.width = size;
    canvas.height = size;
    
    // Create a new image element
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw the image centered and scaled to fit
      const scale = Math.min(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      faviconUrls[name] = dataUrl;
      
      // Update the favicon link
      updateFaviconLink(rel, dataUrl, name, size);
    };
    
    img.onerror = () => {
      // Fallback to original URL if canvas generation fails
      faviconUrls[name] = logoUrl;
      updateFaviconLink(rel, logoUrl, name, size);
    };
    
    img.src = logoUrl;
  });

  return faviconUrls;
};

const updateFaviconLink = (rel, href, sizes, size) => {
  let linkTag = document.querySelector(`link[rel="${rel}"][sizes="${sizes}"]`);
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    linkTag.setAttribute('sizes', sizes);
    linkTag.setAttribute('type', 'image/png');
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', href);
};

// Alternative approach: Use the original logo URL directly for favicons
// This is simpler and more reliable than canvas generation
export const setRestaurantFavicons = (logoUrl) => {
  if (!logoUrl) {
    // Reset to default favicons
    resetToDefaultFavicons();
    return;
  }

  // Update all favicon links to use the restaurant logo
  updateFaviconLink('icon', logoUrl, '16x16', 16);
  updateFaviconLink('icon', logoUrl, '32x32', 32);
  updateFaviconLink('apple-touch-icon', logoUrl, '180x180', 180);
  updateFaviconLink('icon', logoUrl, '512x512', 512);
};

const resetToDefaultFavicons = () => {
  updateFaviconLink('icon', '/favicon-16x16.png', '16x16', 16);
  updateFaviconLink('icon', '/favicon-32x32.png', '32x32', 32);
  updateFaviconLink('apple-touch-icon', '/apple-touch-icon.png', '180x180', 180);
  updateFaviconLink('icon', '/wecan-icon-512.png', '512x512', 512);
};
