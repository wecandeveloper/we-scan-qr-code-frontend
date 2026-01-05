# Translation Quick Reference

## 🚀 **Quick Start**

### **Adding a New Translation**
1. Add key to both `en/translation.json` and `ar/translation.json`
2. Use in component: `{t("your_key")}`
3. Update `TRANSLATION_STRUCTURE.md` if it's a new component

### **Common Patterns**
```javascript
// Basic usage
{t("welcome_message")}

// With interpolation
{t("welcome_user", { name: "John" })}

// With HTML
{t("click_here", { link: <a href="/">here</a> })}
```

## 📝 **Translation Keys by Component**

### **Header/Navigation**
- `login_text`, `request_a_demo_text`
- `nav_home`, `nav_collections`, `nav_offers`

### **Products**
- `products_our_menu`, `loading_products`
- `item_added_to_cart`, `product_not_found`

### **Cart**
- `my_cart`, `sub_total`, `proceed_to_order`
- `cart_empty`, `remove_item_confirm`

### **Orders**
- `my_orders`, `order_status`, `order_total`
- `order_placed_successfully`, `order_cancelled_successfully`

### **Pricing**
- `pricing_title`, `standard_plan`, `premium_plan`
- `qr_scan`, `offer_creation`, `featured_products`
- `addons_title`, `custom_domain`, `food_photography`

## 🔧 **Developer Tools**

### **Find Translation Key**
```bash
# Search for a key in files
grep -r "your_key" src/
```

### **Check Missing Translations**
```bash
# Find unused keys
grep -r "t(" src/ | grep -o 't("[^"]*")'
```

## 📋 **Best Practices Checklist**

- [ ] Key exists in both EN and AR files
- [ ] Key is descriptive and self-explanatory
- [ ] No hardcoded strings in components
- [ ] Documentation updated for new components
- [ ] Tested in both languages
- [ ] RTL support for Arabic text

## 🎯 **Common Issues & Solutions**

### **Missing Translation**
```javascript
// ❌ Bad - shows key name
{t("missing_key")} // Shows: "missing_key"

// ✅ Good - add to both translation files
"missing_key": "Proper translation"
```

### **Interpolation Issues**
```javascript
// ❌ Bad
{t("welcome", { name: user.name })} // If user.name is undefined

// ✅ Good
{t("welcome", { name: user.name || "Guest" })}
```

### **HTML in Translations**
```javascript
// ❌ Bad - HTML in translation
"click_here": "Click <a href='/'>here</a>"

// ✅ Good - use interpolation
"click_here": "Click {{link}}"
// Usage: t("click_here", { link: <a href="/">here</a> })
```

## 📊 **File Structure**
```
/Locales/
├── en/translation.json     # English translations
├── ar/translation.json     # Arabic translations
├── TRANSLATION_STRUCTURE.md # Full documentation
└── QUICK_REFERENCE.md      # This file
```

## 🚀 **For New Projects**

1. Copy this translation structure
2. Update project-specific keys
3. Add new languages as needed
4. Maintain the documentation system

---

**Need Help?** Check `TRANSLATION_STRUCTURE.md` for detailed documentation.
