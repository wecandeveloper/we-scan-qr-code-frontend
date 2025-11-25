/**
 * Utility functions for handling multi-language content
 */

/**
 * Get the appropriate name based on current language
 * @param {Object} item - Category or Product object
 * @param {string} currentLang - Current language code (e.g., 'en', 'ar', 'fr')
 * @returns {string} - Name in the requested language or fallback to default
 */
export const getLocalizedName = (item, currentLang = 'en') => {
  if (!item) return '';
  
  // Handle both Map and Object formats
  if (item.translations) {
    let translation = null;
    
    // Check if it's a Map
    if (item.translations.get && typeof item.translations.get === 'function') {
      translation = item.translations.get(currentLang);
    } 
    // Check if it's a plain object
    else if (typeof item.translations === 'object') {
      // Try direct key first
      translation = item.translations[currentLang];
      
      // If not found, try to find a key that matches the current language
      // This handles cases where keys might be stored as '["ar"]' instead of 'ar'
      if (!translation) {
        const availableKeys = Object.keys(item.translations);
        for (const key of availableKeys) {
          // Try to parse the key if it's a stringified array
          let parsedKey = key;
          try {
            const parsed = JSON.parse(key);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedKey = parsed[0];
            }
          } catch (e) {
            // If parsing fails, use the key as is
          }
          
          if (parsedKey === currentLang) {
            translation = item.translations[key];
            break;
          }
        }
      }
    }
    
    if (translation && translation.name) {
      return translation.name;
    }
  }
  
  return item.name || '';
};

/**
 * Get the appropriate description based on current language
 * @param {Object} item - Category or Product object
 * @param {string} currentLang - Current language code (e.g., 'en', 'ar', 'fr')
 * @returns {string} - Description in the requested language or fallback to default
 */
export const getLocalizedDescription = (item, currentLang = 'en') => {
  if (!item) return '';
  
  // Handle both Map and Object formats
  if (item.translations) {
    let translation = null;
    
    // Check if it's a Map
    if (item.translations.get && typeof item.translations.get === 'function') {
      translation = item.translations.get(currentLang);
    } 
    // Check if it's a plain object
    else if (typeof item.translations === 'object') {
      // Try direct key first
      translation = item.translations[currentLang];
      
      // If not found, try to find a key that matches the current language
      // This handles cases where keys might be stored as '["ar"]' instead of 'ar'
      if (!translation) {
        const availableKeys = Object.keys(item.translations);
        for (const key of availableKeys) {
          // Try to parse the key if it's a stringified array
          let parsedKey = key;
          try {
            const parsed = JSON.parse(key);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedKey = parsed[0];
            }
          } catch (e) {
            // If parsing fails, use the key as is
          }
          
          if (parsedKey === currentLang) {
            translation = item.translations[key];
            break;
          }
        }
      }
    }
    
    if (translation && translation.description) {
      return translation.description;
    }
  }
  
  return item.description || '';
};

/**
 * Get both name and description in the requested language
 * @param {Object} item - Category or Product object
 * @param {string} currentLang - Current language code
 * @returns {Object} - Object with localized name and description
 */
export const getLocalizedContent = (item, currentLang = 'en') => {
  return {
    name: getLocalizedName(item, currentLang),
    description: getLocalizedDescription(item, currentLang)
  };
};

/**
 * Check if a translation exists for a specific language
 * @param {Object} item - Category or Product object
 * @param {string} lang - Language code to check
 * @returns {boolean} - True if translation exists
 */
export const hasTranslation = (item, lang) => {
  if (!item || !item.translations || !item.translations.get) return false;
  const translation = item.translations.get(lang);
  return translation && (translation.name || translation.description);
};

/**
 * Get all available languages for an item
 * @param {Object} item - Category or Product object
 * @returns {Array} - Array of language codes
 */
export const getAvailableLanguages = (item) => {
  if (!item || !item.translations || !item.translations.keys) return [];
  return Array.from(item.translations.keys());
};

/**
 * Convert translations Map to object for API calls
 * @param {Map} translations - Translations Map
 * @returns {Object} - Object representation of translations
 */
export const translationsMapToObject = (translations) => {
  if (!translations || !translations.entries) return {};
  const obj = {};
  for (const [lang, data] of translations.entries()) {
    obj[lang] = data;
  }
  return obj;
};

/**
 * Convert translations object to Map for database storage
 * @param {Object} translationsObj - Object representation of translations
 * @returns {Map} - Map representation of translations
 */
export const translationsObjectToMap = (translationsObj) => {
  if (!translationsObj) return new Map();
  const map = new Map();
  for (const [lang, data] of Object.entries(translationsObj)) {
    map.set(lang, data);
  }
  return map;
};

/**
 * Clean up serialized language codes
 * @param {Array} languages - Array of language codes (may be serialized)
 * @returns {Array} - Clean array of language codes
 */
export const cleanLanguageCodes = (languages) => {
  if (!Array.isArray(languages)) return [];
  
  return languages.map(lang => {
    // If it's already a clean string, return it
    if (typeof lang === 'string' && lang.length <= 3 && !lang.includes('[')) {
      return lang;
    }
    
    // Try to parse serialized strings
    try {
      // Handle cases like "[\"ar\"]" or "[\"AR\"]"
      const parsed = JSON.parse(lang);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].toLowerCase();
      }
      return parsed.toLowerCase();
    } catch (e) {
      // If parsing fails, try to extract the language code
      const match = lang.match(/["']([a-z]{2})["']/i);
      if (match) {
        return match[1].toLowerCase();
      }
      return lang.toLowerCase();
    }
  }).filter(lang => lang && lang.length <= 3);
};

/**
 * Get language display information
 * @param {string} langCode - Language code (e.g., 'ar', 'en', 'fr')
 * @returns {Object} - Language display information
 */
export const getLanguageInfo = (langCode) => {
  const languageNames = {
    'ar': { name: 'Arabic', native: 'العربية' },
    'fr': { name: 'French', native: 'Français' },
    'es': { name: 'Spanish', native: 'Español' },
    'en': { name: 'English', native: 'English' },
    'de': { name: 'German', native: 'Deutsch' },
    'it': { name: 'Italian', native: 'Italiano' },
    'pt': { name: 'Portuguese', native: 'Português' },
    'ru': { name: 'Russian', native: 'Русский' },
    'zh': { name: 'Chinese', native: '中文' },
    'ja': { name: 'Japanese', native: '日本語' },
    'ko': { name: 'Korean', native: '한국어' }
  };
  
  return languageNames[langCode] || { 
    name: langCode.toUpperCase(), 
    native: langCode.toUpperCase() 
  };
};

/**
 * Scroll to top of the page
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToTop = (smooth = true) => {
  try {
    if (smooth) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  } catch (error) {
    // Fallback for browsers that don't support smooth scrolling
    window.scrollTo(0, 0);
  }
};
