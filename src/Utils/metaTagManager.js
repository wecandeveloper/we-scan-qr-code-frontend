/**
 * Utility for managing dynamic meta tags, favicons, and Open Graph data
 * for restaurant-specific pages
 */

import { setRestaurantFavicons } from './faviconGenerator';

export const updateDocumentMeta = (restaurant) => {
  if (!restaurant) return;

  const { name, theme, slug } = restaurant;
  const baseUrl = window.location.origin;
  const restaurantUrl = `${baseUrl}/restaurant/${slug}`;
  
  // Update page title
  document.title = `${name} | Digital Menu`;
  
  // Update meta description
  updateMetaTag('description', `Explore ${name}'s digital menu. Browse our delicious offerings and place your order seamlessly.`);
  
  // Update Open Graph tags for social media sharing
  updateMetaTag('og:title', `${name} | Digital Menu`, 'property');
  updateMetaTag('og:description', `Explore ${name}'s digital menu. Browse our delicious offerings and place your order seamlessly.`, 'property');
  updateMetaTag('og:url', restaurantUrl, 'property');
  updateMetaTag('og:type', 'website', 'property');
  
  // Update Twitter Card tags
  updateMetaTag('twitter:title', `${name} | Digital Menu`, 'name');
  updateMetaTag('twitter:description', `Explore ${name}'s digital menu. Browse our delicious offerings and place your order seamlessly.`, 'name');
  updateMetaTag('twitter:url', restaurantUrl, 'name');
  
  // Update images for social sharing
  if (theme?.logo?.url) {
    updateMetaTag('og:image', theme.logo.url, 'property');
    updateMetaTag('twitter:image', theme.logo.url, 'name');
  } else {
    // Fallback to default image
    updateMetaTag('og:image', '/wecan-og-banner.png', 'property');
    updateMetaTag('twitter:image', '/wecan-og-banner.png', 'name');
  }
  
  // Update favicons using the dedicated favIcon field
  setRestaurantFavicons(theme?.favIcon?.url);
};

const updateMetaTag = (name, content, attribute = 'name') => {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};


// Reset to default meta tags (for non-restaurant pages)
export const resetToDefaultMeta = () => {
  document.title = 'Digital Menu | Contactless Digital Menu Solution';
  
  updateMetaTag('description', 'A seamless digital QR menu solution designed for restaurants, cafes, and bars. Enhance customer experience with contactless ordering, easy menu browsing, and secure payments — all from the convenience of a smartphone.');
  
  updateMetaTag('og:title', 'Digital Menu | Contactless Digital Menu Solution', 'property');
  updateMetaTag('og:description', 'A seamless digital QR menu solution designed for restaurants, cafes, and bars. Enhance customer experience with contactless ordering, easy menu browsing, and secure payments — all from the convenience of a smartphone.', 'property');
  updateMetaTag('og:url', window.location.origin, 'property');
  updateMetaTag('og:image', '/wecan-og-banner.png', 'property');
  
  updateMetaTag('twitter:title', 'Digital Menu | Contactless Digital Menu Solution', 'name');
  updateMetaTag('twitter:description', 'A seamless digital QR menu solution designed for restaurants, cafes, and bars. Enhance customer experience with contactless ordering, easy menu browsing, and secure payments — all from the convenience of a smartphone.', 'name');
  updateMetaTag('twitter:url', window.location.origin, 'name');
  updateMetaTag('twitter:image', '/wecan-og-banner.png', 'name');
  
  // Reset favicons to default
  setRestaurantFavicons(null);
};
