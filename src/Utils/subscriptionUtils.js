/**
 * Utility functions for handling subscription-based features
 */

/**
 * Check if a restaurant has access to multi-language features
 * @param {Object} restaurant - Restaurant object with subscription and languages
 * @returns {boolean} - True if restaurant has access to multi-language features
 */
export const hasMultiLanguageAccess = (restaurant) => {
  if (!restaurant) return false;
  
  // Premium and Advanced subscriptions have access to multi-language features
  return restaurant.subscription === 'premium' || restaurant.subscription === 'advanced';
};

/**
 * Get available languages for a restaurant based on subscription
 * @param {Object} restaurant - Restaurant object with subscription
 * @returns {Array} - Array of available language codes
 */
export const getAvailableLanguages = (restaurant) => {
  if (!restaurant) return [];
  
  if (restaurant.subscription === 'premium' || restaurant.subscription === 'advanced') {
    // Premium and Advanced users can access all languages
    return ['ar', 'fr', 'es', 'en', 'de', 'it', 'pt', 'ru', 'zh', 'ja'];
  }
  
  // Standard subscription has no language access
  return [];
};

/**
 * Check if a specific language is available for a restaurant
 * @param {Object} restaurant - Restaurant object
 * @param {string} languageCode - Language code to check (e.g., 'ar', 'fr')
 * @returns {boolean} - True if language is available
 */
export const isLanguageAvailable = (restaurant, languageCode) => {
  const availableLanguages = getAvailableLanguages(restaurant);
  return availableLanguages.includes(languageCode);
};

/**
 * Get subscription features for a restaurant
 * @param {Object} restaurant - Restaurant object
 * @returns {Object} - Object with feature access information
 */
export const getSubscriptionFeatures = (restaurant) => {
  if (!restaurant) {
    return {
      multiLanguage: false,
      advancedAnalytics: false,
      customDomain: false,
      prioritySupport: false,
      maxLanguages: 0,
      maxProducts: 100,
      maxCategories: 20
    };
  }
  
  const isPremium = restaurant.subscription === 'premium';
  const isAdvanced = restaurant.subscription === 'advanced';
  const hasLanguageAccess = isPremium || isAdvanced;
  
  return {
    multiLanguage: hasLanguageAccess,
    advancedAnalytics: isPremium || isAdvanced,
    customDomain: isPremium || isAdvanced,
    prioritySupport: isPremium || isAdvanced,
    maxLanguages: hasLanguageAccess ? 10 : 0,
    maxProducts: (isPremium || isAdvanced) ? 1000 : 100,
    maxCategories: (isPremium || isAdvanced) ? 100 : 20
  };
};

/**
 * Check if restaurant can add more languages
 * @param {Object} restaurant - Restaurant object
 * @returns {boolean} - True if can add more languages
 */
export const canAddMoreLanguages = (restaurant) => {
  if (!restaurant) return false;
  
  const features = getSubscriptionFeatures(restaurant);
  const currentLanguageCount = restaurant.languages?.length || 0;
  
  return currentLanguageCount < features.maxLanguages;
};

/**
 * Check if a restaurant has access to product sizes and addOns features
 * @param {Object} restaurant - Restaurant object with subscription
 * @returns {boolean} - True if restaurant has access to sizes and addOns features
 */
export const hasSizesAndAddOnsAccess = (restaurant) => {
  if (!restaurant) return false;
  
  // Premium and Advanced subscriptions have access to sizes and addOns features
  return restaurant.subscription === 'premium' || restaurant.subscription === 'advanced';
};

/**
 * Check if a restaurant has access to payment gateway features
 * @param {Object} restaurant - Restaurant object with subscription
 * @returns {boolean} - True if restaurant has access to payment features
 */
export const hasPaymentAccess = (restaurant) => {
  if (!restaurant) return false;
  
  // Only advanced subscription has access to payment features
  return restaurant.subscription === 'advanced';
};

/**
 * Get subscription display information
 * @param {Object} restaurant - Restaurant object
 * @returns {Object} - Subscription display information
 */
export const getSubscriptionInfo = (restaurant) => {
  if (!restaurant) {
    return {
      type: 'standard',
      name: 'Standard',
      description: 'Basic features',
      color: '#6c757d',
      background: '#ffffff'
    };
  }
  
  const subscriptionInfo = {
    advanced: {
      name: 'Advanced',
      description: 'Full access including payment gateway and multi-language support',
      color: '#9c27b0',
      background: '#ffffff',
      border: '#9c27b0'
    },
    premium: {
      name: 'Premium',
      description: 'Full access to all features including multi-language support',
      color: '#ffd700',
      background: '#1a1a1a',
      border: '#1a1a1a'
    },
    standard: {
      name: 'Standard',
      description: 'Basic features without language support',
      color: '#28a745',
      background: '#ffffff',
      border: '#28a745'
    }
  };
  
  return subscriptionInfo[restaurant.subscription] || subscriptionInfo.standard;
};
