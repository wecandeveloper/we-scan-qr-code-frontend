import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateDocumentMeta, resetToDefaultMeta } from '../../Utils/metaTagManager';

/**
 * Component that manages dynamic meta tags based on the current route and restaurant data
 * This handles both restaurant-specific pages and main site pages
 */
export default function DynamicMetaTags() {
  const { restaurantSlug } = useParams();
  const { selected: restaurant, loading: restaurantLoading } = useSelector(
    (state) => state.restaurants
  );

  useEffect(() => {
    // Check if we're on a restaurant-specific page
    if (restaurantSlug && restaurant && !restaurantLoading) {
      // Update meta tags with restaurant-specific data
      updateDocumentMeta(restaurant);
    } else if (!restaurantSlug) {
      // Reset to default meta tags for main site pages
      resetToDefaultMeta();
    }
  }, [restaurantSlug, restaurant, restaurantLoading]);

  // This component doesn't render anything visible
  return null;
}
