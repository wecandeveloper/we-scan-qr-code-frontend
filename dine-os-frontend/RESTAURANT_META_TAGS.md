# Restaurant-Specific Meta Tags and Favicons

This system allows each restaurant to have their own logos and favicons for social media sharing and browser display.

## What This System Does

### 1. **Social Media Sharing Images (Open Graph & Twitter Cards)**
- **What they are**: The images that appear when sharing restaurant pages on social media (Facebook, WhatsApp, LinkedIn, Twitter, etc.)
- **Technical name**: Open Graph (OG) images and Twitter Card images
- **Location**: These are the `og:image` and `twitter:image` meta tags
- **Dynamic**: Each restaurant can have their own logo/image for sharing

### 2. **Favicons**
- **What they are**: The small icons that appear in browser tabs, bookmarks, and mobile home screens
- **Sizes supported**: 16x16, 32x32, 180x180 (Apple), 512x512
- **Dynamic**: Each restaurant can have their own favicon based on their logo

## How It Works

### Restaurant Data Structure
The system uses the existing restaurant model with the `theme.logo` field:

```javascript
restaurant: {
  name: "Restaurant Name",
  slug: "restaurant-slug",
  theme: {
    logo: {
      url: "https://cloudinary.com/image/upload/restaurant-logo.png",
      publicId: "restaurant-logo",
      hash: "abc123"
    }
  }
}
```

### Automatic Detection
- **Restaurant pages** (`/restaurant/:restaurantSlug`): Uses restaurant-specific meta tags and favicons
- **Main site pages** (`/`, `/login`, etc.): Uses default WeCan meta tags and favicons

## Implementation Details

### Files Created/Modified

1. **`/src/Utils/metaTagManager.js`** - Core meta tag management
2. **`/src/Utils/faviconGenerator.js`** - Favicon generation utilities  
3. **`/src/Components/DynamicMetaTags/DynamicMetaTags.jsx`** - React component
4. **`/src/Components/Layouts/RestaurantLayout/RestaurantLayout.jsx`** - Updated to include meta tags
5. **`/src/App.jsx`** - Updated to include meta tags for main site

### How It Updates Meta Tags

When a user visits `/restaurant/restaurant-name`:

1. **Page Title**: Changes from "Digital Menu" to "Restaurant Name | Digital Menu"
2. **Description**: Updates to restaurant-specific description
3. **Social Sharing Image**: Uses restaurant logo (if available) or falls back to default
4. **Favicons**: All favicon sizes use the restaurant logo
5. **Open Graph Tags**: All social media tags are restaurant-specific

## For Restaurant Owners

### Setting Up Restaurant Logo

Restaurant owners can upload their logo through the admin panel. The system will automatically:

1. Use the logo for social media sharing
2. Use the logo as favicons in all sizes
3. Fall back to default WeCan branding if no logo is set

### Logo Requirements

- **Format**: PNG, JPG, or WebP
- **Recommended size**: At least 512x512 pixels for best quality
- **Aspect ratio**: Square (1:1) works best for favicons
- **File size**: Keep under 2MB for optimal loading

## Technical Implementation

### Meta Tags Updated

```html
<!-- Page Title -->
<title>Restaurant Name | Digital Menu</title>

<!-- Description -->
<meta name="description" content="Explore Restaurant Name's digital menu..." />

<!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
<meta property="og:title" content="Restaurant Name | Digital Menu" />
<meta property="og:description" content="Explore Restaurant Name's digital menu..." />
<meta property="og:image" content="https://restaurant-logo-url.com" />
<meta property="og:url" content="https://dineos.ae/restaurant/restaurant-slug" />

<!-- Twitter Cards -->
<meta name="twitter:title" content="Restaurant Name | Digital Menu" />
<meta name="twitter:description" content="Explore Restaurant Name's digital menu..." />
<meta name="twitter:image" content="https://restaurant-logo-url.com" />

<!-- Favicons -->
<link rel="icon" sizes="16x16" href="https://restaurant-logo-url.com" />
<link rel="icon" sizes="32x32" href="https://restaurant-logo-url.com" />
<link rel="apple-touch-icon" sizes="180x180" href="https://restaurant-logo-url.com" />
<link rel="icon" sizes="512x512" href="https://restaurant-logo-url.com" />
```

### Fallback Behavior

If a restaurant doesn't have a logo set:
- Social sharing uses the default WeCan banner (`/wecan-og-banner.png`)
- Favicons use the default WeCan favicons
- All other meta tags still show restaurant-specific information

## Testing

### Social Media Sharing
1. Visit a restaurant page: `https://dineos.ae/restaurant/restaurant-name`
2. Share the URL on Facebook, WhatsApp, or LinkedIn
3. The shared preview should show the restaurant's logo and name

### Favicons
1. Visit a restaurant page
2. Check the browser tab - should show restaurant logo
3. Bookmark the page - should use restaurant logo
4. Add to mobile home screen - should use restaurant logo

### Default Pages
1. Visit main site pages (`/`, `/login`)
2. Should show default WeCan branding for social sharing and favicons

## Benefits

1. **Brand Consistency**: Each restaurant maintains their brand identity
2. **Professional Appearance**: Custom favicons and social sharing images
3. **SEO Benefits**: Restaurant-specific meta tags improve search visibility
4. **User Experience**: Users can easily identify restaurant pages in browser tabs
5. **Social Media**: Better engagement when sharing restaurant pages

## Maintenance

- No additional maintenance required
- System automatically handles new restaurants
- Fallbacks ensure the site always works even if logos are missing
- Performance optimized with lazy loading and error handling




