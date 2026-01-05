# Translation Management System

This document provides a comprehensive guide for managing translations across scalable projects.

## 🎯 **Project Overview**
- **Current Project**: WeScan QR Code Website
- **Languages**: English (EN), Arabic (AR)
- **Framework**: React with react-i18next
- **Structure**: Component-based JSON files with organized structure

## 📁 **File Structure**
```
/Locales/
├── en/
│   ├── common.json          # Common/utility translations
│   ├── header.json          # Header component translations
│   ├── footer.json          # Footer component translations
│   ├── products.json        # Products component translations
│   ├── restaurant.json      # Restaurant component translations
│   ├── cart.json           # Cart component translations
│   ├── orders.json         # Orders component translations
│   └── pricing.json        # Pricing component translations
├── ar/
│   ├── common.json          # Common/utility translations (Arabic)
│   ├── header.json          # Header component translations (Arabic)
│   ├── footer.json          # Footer component translations (Arabic)
│   ├── products.json        # Products component translations (Arabic)
│   ├── restaurant.json      # Restaurant component translations (Arabic)
│   ├── cart.json           # Cart component translations (Arabic)
│   ├── orders.json         # Orders component translations (Arabic)
│   └── pricing.json        # Pricing component translations (Arabic)
├── TRANSLATION_STRUCTURE.md # This documentation file
└── QUICK_REFERENCE.md      # Quick reference guide
```

## 🏗️ **Component-Based Organization**

### **1. Common/Utility Translations**
*Global translations used across multiple components*
- `no`, `yes`
- `loading`, `error`, `success`
- `save`, `cancel`, `edit`, `delete`

### **2. Main Header Component**
*Navigation and authentication elements*
- `login_text`, `request_a_demo_text`
- `nav_home`, `nav_collections`, `nav_offers`

### **3. Restaurant Not Found Page**
*Error handling and user guidance*
- `restaurant_not_found_title`, `restaurant_not_found_message`
- `go_to_home`, `restaurant_loading`, `please_wait`

### **4. Main Footer Component**
*Footer links and legal information*
- `footer_copyright`, `footer_privacy_policy`
- `footer_terms_and_conditions`, `footer_return_policy`

### **5. Products Component**
*Product listing and management*
- `products_our_menu`, `loading_categories`, `no_categories_found`
- `all_items`, `loading_products`, `no_products_found`
- `product_not_found`, `product_unavailable`
- `item_added_to_cart`, `item_already_in_cart_updated`

### **6. Restaurant Header Component**
*Restaurant-specific navigation and features*
- `search_placeholder`, `please_enter_search_term`
- `orders`, `change_table_or_order_type`
- `google_review_link`, `call_waiter_hint`
- `waiter_call_*` (all waiter call related messages)

### **7. Filtered Products Component**
*Product filtering and categorization*
- `offer_items`, `featured_items`, `related_items`
- `no_title_found`

### **8. Cart Component**
*Shopping cart functionality*
- `my_cart`, `sub_total`, `placing_order`
- `proceed_to_order`, `remove_item_confirm`
- `place_order_confirm`, `order_type`, `table_no`
- `delivery_address`, `take_away_details`
- `cart_empty`, `go_to_collection`

### **9. Orders Component**
*Order management and tracking*
- `my_orders`, `view_order_status`
- `all`, `placed`, `preparing`, `ready`, `delivered`, `cancelled`
- `order_id`, `order_date`, `order_status`, `order_total`
- `order_items`, `no_orders_found`
- `order_placed_successfully`, `order_placed_failed`
- `order_cancelled_successfully`, `order_cancelled_failed`

### **10. Pricing Table Component**
*Pricing plans and add-ons*
- `pricing_title`, `pricing_subtitle`
- `standard_plan`, `premium_plan`, `most_popular`
- `get_started`, `year`
- **Standard Plan Features**: `qr_scan`, `offer_creation`, `featured_products`, `free_training`, `order_history`, `call_waiter`, `whatsapp_integration`, `social_media_integration`, `google_review_link`, `location`, `admin_panel`, `english`
- **Premium Plan Features**: `arabic`, `dine_in`, `take_away`, `home_delivery`
- **Add-ons**: `addons_title`, `addons_subtitle`, `add_to_plan`
- **Add-on Services**: `custom_domain`, `food_photography`, `menu_setup`, `payment_integration`, `pos`
- **Add-on Descriptions**: `*_description` for each add-on

## 🚀 **Scalability Features**

### **Multi-Project Support**
This structure can be easily adapted for:
- E-commerce platforms
- Restaurant management systems
- QR code applications
- Multi-tenant applications

### **Easy Extension**
- Add new components by creating new sections
- Maintain consistent naming conventions
- Use component prefixes for clarity (optional)

## 📋 **Best Practices**

### **1. Naming Conventions**
- Use descriptive, self-explanatory keys
- Keep keys consistent between EN and AR
- Use snake_case for multi-word keys
- Group related keys with common prefixes

### **2. Component Organization**
- Group translations by component/feature
- Keep related translations together
- Maintain logical order within sections

### **3. Maintenance**
- Update this documentation when adding new components
- Keep both EN and AR files synchronized
- Use the documentation as a reference for new team members

### **4. Price Management**
- Keep prices in component arrays (not translations)
- Use dynamic pricing structure for easy updates
- Separate pricing logic from translation logic

## 🔧 **Adding New Translations**

### **Step 1: Identify Component**
Determine which component the translation belongs to.

### **Step 2: Add to JSON Files**
Add the key-value pair to both EN and AR files:
```json
// en/translation.json
"new_key": "English translation"

// ar/translation.json  
"new_key": "Arabic translation"
```

### **Step 3: Update Documentation**
Add the new key to the appropriate component section in this file.

### **Step 4: Use in Component**
```javascript
const { t } = useTranslation();
return <div>{t("new_key")}</div>;
```

## 🌍 **Multi-Language Support**

### **Current Languages**
- **English (EN)**: Primary language
- **Arabic (AR)**: RTL support with proper text direction

### **Adding New Languages**
1. Create new folder: `/Locales/[language_code]/`
2. Copy `translation.json` structure
3. Translate all values
4. Update i18n configuration
5. Add language selector to UI

## 📊 **Translation Statistics**
- **Total Keys**: ~200+ translation keys
- **Components**: 10+ major components
- **Languages**: 2 (EN, AR)
- **Coverage**: 100% of user-facing text

## 🔄 **Version Control**
- Keep translation files in version control
- Use meaningful commit messages for translation updates
- Tag releases with translation version numbers
- Maintain translation changelog for major updates

## 🎨 **UI Integration**
- All user-facing text uses translations
- No hardcoded strings in components
- Consistent translation key usage
- Proper interpolation for dynamic content

---

**Last Updated**: [Current Date]
**Maintainer**: Development Team
**Version**: 1.0.0
