/**
 * Test file for metaTagManager functionality
 * This can be used to verify the meta tag system works correctly
 */

import { updateDocumentMeta, resetToDefaultMeta } from '../metaTagManager';

// Mock restaurant data
const mockRestaurant = {
  name: "Test Restaurant",
  slug: "test-restaurant",
  theme: {
    logo: {
      url: "https://example.com/restaurant-logo.png"
    }
  }
};

// Test function to verify meta tag updates
export const testMetaTagSystem = () => {
  console.log("🧪 Testing Meta Tag System...");
  
  // Test 1: Update with restaurant data
  console.log("1. Testing restaurant-specific meta tags...");
  updateDocumentMeta(mockRestaurant);
  
  // Verify title
  const title = document.title;
  console.log("✅ Page title:", title);
  console.log("Expected: 'Test Restaurant | Digital Menu'");
  console.log("Match:", title === "Test Restaurant | Digital Menu");
  
  // Verify Open Graph image
  const ogImage = document.querySelector('meta[property="og:image"]');
  console.log("✅ OG Image:", ogImage?.getAttribute('content'));
  console.log("Expected: 'https://example.com/restaurant-logo.png'");
  
  // Test 2: Reset to default
  console.log("\n2. Testing default meta tags...");
  resetToDefaultMeta();
  
  const defaultTitle = document.title;
  console.log("✅ Default title:", defaultTitle);
  console.log("Expected: 'Digital Menu | Contactless Digital Menu Solution'");
  console.log("Match:", defaultTitle === "Digital Menu | Contactless Digital Menu Solution");
  
  console.log("\n🎉 Meta tag system test completed!");
};

// Test function to verify favicon updates
export const testFaviconSystem = () => {
  console.log("🧪 Testing Favicon System...");
  
  // Check if favicon links exist
  const favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
  const favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  
  console.log("✅ Favicon 16x16:", favicon16?.getAttribute('href'));
  console.log("✅ Favicon 32x32:", favicon32?.getAttribute('href'));
  console.log("✅ Apple Touch Icon:", appleTouchIcon?.getAttribute('href'));
  
  console.log("\n🎉 Favicon system test completed!");
};

// Export test functions for manual testing in browser console
if (typeof window !== 'undefined') {
  window.testMetaTagSystem = testMetaTagSystem;
  window.testFaviconSystem = testFaviconSystem;
  console.log("🔧 Test functions available: testMetaTagSystem(), testFaviconSystem()");
}
