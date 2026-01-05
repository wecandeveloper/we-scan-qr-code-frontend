import "./FilteredProducts.scss"
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { RiShareFill } from "react-icons/ri";
import { BsCartPlusFill } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useAuth } from "../../../../Context/AuthContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { startGetAllProducts } from "../../../../Actions/productActions";
import { PiSmileySadDuotone } from "react-icons/pi";
import { Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../../../../Services/i18n_new.js";
import { getLocalizedName, getLocalizedDescription } from "../../../../Utils/languageUtils";
import { hasSizesAndAddOnsAccess } from "../../../../Utils/subscriptionUtils";

export default function FilteredProducts({title}) {
    const { t, i18n: i18nHook } = useTranslation();
    const [currentLang, setCurrentLang] = useState((i18n.language || "en").slice(0, 2));
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ isOfferBannerImage, setIsOfferBannerImage ] = useState(false)

    const { setGlobalGuestCart } = useAuth()

    const { data: products, loading: productsLoading } = useSelector((state) => {
        return state.products;
    })

    const product = useSelector((state) => {
        return state.products.selected;
    })

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    });

    // console.log(restaurant)

    useEffect(() => {
        if (restaurant) {
            dispatch(startGetAllProducts(restaurant?.slug));
            setIsOfferBannerImage(restaurant?.theme?.offerBannerImages?.length > 0)
        }
    }, [restaurant, dispatch]);

    // Listen for language changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setCurrentLang(lng.slice(0, 2));
        };

        // Try multiple event listeners
        i18nHook.on('languageChanged', handleLanguageChange);
        i18n.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18nHook.off('languageChanged', handleLanguageChange);
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18nHook]);

    // Also update currentLang when i18n.language changes
    useEffect(() => {
        setCurrentLang((i18n.language || "en").slice(0, 2));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getProcessedProducts = () => {
        let filteredArray = products.filter((ele) => {
            // Filter out unavailable products
            if (!ele.isAvailable) {
                return false;
            }
            
            if (title === "Offer Items" && !(ele.offerPrice > 0)) {
                return false;
            } else if (title === "Featured Items") {
                if(!ele.isFeatured) {
                    return false
                }
            }
            return true;
        });

        if (title === "Related Items") {
            const currentTags = product?.tags || []; // Tags of the current product

            return filteredArray.filter((p) => {
                if (!p.tags || !Array.isArray(p.tags)) return false;

                // Check if at least one tag overlaps
                return p.tags.some(tag => currentTags.includes(tag));
            });
        }

        return filteredArray;
    };

    // Helper function to calculate offer price for a size based on product discount
    const calculateSizeOfferPrice = (sizePrice, product) => {
        if (!product?.discountPercentage || product.discountPercentage <= 0) {
            return null; // No offer
        }
        // Calculate offer price: sizePrice - (sizePrice * discountPercentage / 100)
        return sizePrice - (sizePrice * product.discountPercentage / 100);
    };

    // Helper function to get default size
    const getDefaultSize = (product) => {
        if (!product?.sizes || product.sizes.length === 0) return null;
        
        // Find size with isDefault: true, or first available size
        const defaultSize = product.sizes.find(s => s.isDefault && s.isAvailable) || 
                           product.sizes.find(s => s.isAvailable) || 
                           product.sizes[0];
        
        if (!defaultSize) return null;
        
        const sizePrice = defaultSize.price || 0;
        const offerPrice = calculateSizeOfferPrice(sizePrice, product);
        
        return {
            name: defaultSize.name,
            price: sizePrice,
            offerPrice: offerPrice // Calculated offer price for this size
        };
    };

    // Helper function to convert sizes for storage
    const convertSizesForStorage = (sizes) => {
        if (!sizes || !Array.isArray(sizes)) return [];
        return sizes.map(size => ({
            name: size.name,
            price: size.price || 0,
            isDefault: size.isDefault || false,
            isAvailable: size.isAvailable !== undefined ? size.isAvailable : true,
            translations: size.translations instanceof Map 
                ? Object.fromEntries(size.translations) 
                : (size.translations || {})
        }));
    };

    // Helper function to convert addOns for storage
    const convertAddOnsForStorage = (addOns) => {
        if (!addOns || !Array.isArray(addOns)) return [];
        return addOns.map(addOn => ({
            name: addOn.name,
            price: addOn.price || 0,
            isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : true,
            translations: addOn.translations instanceof Map 
                ? Object.fromEntries(addOn.translations) 
                : (addOn.translations || {})
        }));
    };

    // Helper function to get localized name for sizes/addOns
    const getLocalizedItemName = (item, product) => {
        if (!item) return '';
        // If item is a size object with name, try to find it in product.sizes to get translations
        if (item.name && product?.sizes) {
            const fullSize = product.sizes.find(s => s.name === item.name);
            if (fullSize) {
                return getLocalizedName(fullSize, currentLang) || item.name || '';
            }
        }
        // Fallback to direct name
        return item.name || '';
    };

    // Helper function to check if two line items are the same (same product, size, and addOns)
    const areLineItemsSame = (item1, item2) => {
        // Check productId
        if (!item1.productId || !item2.productId) return false;
        if (item1.productId._id !== item2.productId._id) return false;

        // Check selectedSize - both null or both have same name
        const size1 = item1.selectedSize?.name || null;
        const size2 = item2.selectedSize?.name || null;
        if (size1 !== size2) return false;

        // Check productAddOns - same count and same names
        const addOns1 = item1.productAddOns || [];
        const addOns2 = item2.productAddOns || [];
        
        if (addOns1.length !== addOns2.length) return false;
        
        // Sort by name and compare
        const names1 = addOns1.map(a => a.name).sort();
        const names2 = addOns2.map(a => a.name).sort();
        
        return names1.every((name, index) => name === names2[index]);
    };

    const handleAddToCart = (product) => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            totalAmount: 0,
        };

        // Get default size if product has sizes AND restaurant has premium/advanced access
        const defaultSize = hasSizesAndAddOnsAccess(restaurant) ? getDefaultSize(product) : null;
        
        // Create the new line item to compare
        const newLineItem = {
            productId: { _id: product._id },
            selectedSize: defaultSize || undefined,
            productAddOns: undefined, // No addOns selected in quick add
        };

        // Check if product already exists with EXACT same configuration (product, size, addOns)
        const existingItemIndex = guestCart.lineItems.findIndex(
            (item) => item.productId && areLineItemsSame(item, newLineItem)
        );
        const itemQty = guestCart?.lineItems[existingItemIndex]?.quantity || 0

        const newProduct = products.find(ele => ele._id === product._id)
        if (!newProduct) {
            toast.error(t("product_not_found"));
            return;
        }

        if(!newProduct.isAvailable) {
            toast.error(t("product_unavailable"));
            return;
        }

        // Calculate base price: use default size offer price if available, otherwise use size price or product offerPrice
        let basePrice = 0;
        if (defaultSize) {
            // Use offer price for size if available, otherwise use regular size price
            basePrice = defaultSize.offerPrice !== null && defaultSize.offerPrice > 0 
                ? defaultSize.offerPrice 
                : defaultSize.price;
        } else {
            basePrice = product.offerPrice && product.offerPrice > 0
                ? product.offerPrice
                : product.price;
        }
        
        const itemSubtotal = basePrice; // No addOns selected in quick add
        const itemTotal = itemSubtotal * 1; // Quantity is 1

        if (existingItemIndex !== -1) {
            guestCart.lineItems[existingItemIndex].quantity += 1;
            // Recalculate totals for existing item
            const existingItem = guestCart.lineItems[existingItemIndex];
            const existingBasePrice = existingItem.basePrice || existingItem.price;
            const existingProductAddOnsTotal = (existingItem.productAddOns || []).reduce((sum, a) => sum + (a.price || 0), 0);
            const existingSubtotal = existingBasePrice + existingProductAddOnsTotal;
            guestCart.lineItems[existingItemIndex].itemTotal = existingSubtotal * guestCart.lineItems[existingItemIndex].quantity;
            toast.success(t("item_already_in_cart_updated", { name: product.name, qty: itemQty + 1 }));
        } else {
            // Add new product with default size
            guestCart.lineItems.push({
                productId: {
                    _id: product._id,
                    name: product.name,
                    categoryId: {
                        name: product.categoryId.name,
                        translations: product.categoryId?.translations || {}
                    },
                    price: product.price,
                    offerPrice: product.offerPrice,
                    images: product.images || "",
                    discountPercentage: product.discountPercentage || 0,
                    isAvailable: product.isAvailable || true,
                    translations: product.translations || {},
                    restaurantId: {
                        _id: restaurant?._id,
                        name: restaurant?.name
                    },
                    // Include sizes and addOns for cart display (convert Maps to plain objects)
                    sizes: convertSizesForStorage(product.sizes),
                    addOns: convertAddOnsForStorage(product.addOns)
                },
                quantity: 1,
                price: itemSubtotal, // Legacy field for backward compatibility
                basePrice: basePrice,
                itemSubtotal: itemSubtotal,
                itemTotal: itemTotal,
                comments: "", // Comments will be added in cart
                selectedSize: defaultSize || undefined,
                productAddOns: undefined, // No addOns selected in quick add
            });
            toast.success(t("item_added_to_cart"));
        }

        // Recalculate totalAmount - support both old and new formats
        const totalAmount = guestCart.lineItems.reduce((acc, item) => {
            // Use itemTotal if available (new format), otherwise fall back to old calculation
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
        }, 0);

        let updatedGuestCart;

        updatedGuestCart = {
            ...guestCart,
            lineItems: guestCart.lineItems,
            totalAmount: totalAmount || 0,
        };


        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart)
    };

    return (
        <section id="sales">
            <div className={`filtered-products-section common-padding 
                ${title === "Offer Items" || title === "Related Items" ? "margin-bottom" : ""} 
                ${(isOfferBannerImage || location.pathname === `/restaurant/${restaurant?.slug}/offers`) ? "" : "margin-top"}
                ${currentLang === "ar" ? "ar" : ""}
            `}>
                <div className="head-div">
                    <h1 className="main-heading">{title === "Offer Items" ? t("offer_items") : title === "Featured Items" ? t("featured_items") : title === "Related Items" ? t("related_items") : title}</h1>
                    <a href={`/restaurant/${restaurant?.slug}/collections`}><div className="btn-dark">{t("show_all")}</div></a>
                </div>
                {productsLoading ? (
                    <div className="loading-div">
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress color="inherit" size={50}/>
                        </Box>
                        <p>{t("loading_products")}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="no-products-div">
                        <PiSmileySadDuotone />
                        <p>{t("no_products_found")}</p>
                    </div>
                ) : (
                    getProcessedProducts().length > 0 ? (
                        <div className="product-grid">
                            {getProcessedProducts().map((product) => {
                                return (
                                    <div 
                                        key={product._id}
                                        className="product-card"
                                        onClick={() => {
                                            navigate(`/restaurant/${restaurant?.slug}/products/${slugify(product.name)}`, {
                                            state: { productId: product._id },
                                            });
                                            // Scroll to top after navigation
                                            setTimeout(() => {
                                                window.scrollTo(0, 0);
                                            }, 100);
                                        }}
                                        >
                                        <div className="img-div">
                                            <img className="product-image" src={product.images[1]?.url || product.images[0]?.url} alt={product.name} />
                                            {/* <FaHeart className="wishlist-btn"/> */}
                                        </div>
                                        <div className="product-details">
                                            {restaurant.isCustomerOrderAvailable && <motion.div 
                                                whileTap={{ scale: 0.96 }}
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleAddToCart(product);
                                                }}
                                                className="cart-div">
                                                <FiShoppingCart className="cart-icon"/>
                                            </motion.div>}
                                            <div className="product-name-category-div">
                                                <div className="product-name-wrapper">
                                                    <h1 className="product-name">
                                                        {getLocalizedName(product, currentLang)}
                                                    </h1>
                                                    {(() => {
                                                        // Only show size badge for premium restaurants
                                                        if (!hasSizesAndAddOnsAccess(restaurant)) return null;
                                                        const productDefaultSize = getDefaultSize(product);
                                                        return productDefaultSize ? (
                                                            <span className="default-size-badge-inline">
                                                                {getLocalizedItemName(productDefaultSize, product)}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                                <p className="product-category">
                                                    {getLocalizedName(product?.categoryId, currentLang)}
                                                </p>
                                            </div>
                                            <p className="product-description">
                                                {(() => {
                                                    const description = getLocalizedDescription(product, currentLang);
                                                    return description.length > 50
                                                        ? description.substring(0, 50) + "..."
                                                        : description;
                                                })()}
                                            </p>
                                            <div className="price-div">
                                                {(() => {
                                                    // For premium restaurants, check for sizes; for standard, always use product price
                                                    const hasAccess = hasSizesAndAddOnsAccess(restaurant);
                                                    const productDefaultSize = hasAccess ? getDefaultSize(product) : null;
                                                    
                                                    // If product has sizes AND restaurant has premium access, use size price (with offer if applicable)
                                                    if (hasAccess && productDefaultSize) {
                                                        const sizeOfferPrice = productDefaultSize.offerPrice;
                                                        const hasOffer = sizeOfferPrice !== null && sizeOfferPrice > 0;
                                                        
                                                        return (
                                                            <>
                                                                {hasOffer && (
                                                                    <span className="offer-price">
                                                                        AED {sizeOfferPrice.toFixed(2)}
                                                                    </span>
                                                                )}
                                                                <span className={`product-price ${hasOffer ? "strike" : ""}`}>
                                                                    AED {productDefaultSize.price.toFixed(2)}
                                                                </span>
                                                            </>
                                                        );
                                                    }
                                                    
                                                    // For standard subscription or products without sizes, use product price/offerPrice
                                                    const productPrice = product?.price || 0;
                                                    const productOfferPrice = product?.offerPrice || 0;
                                                    const hasOffer = productOfferPrice > 0;
                                                    
                                                    return (
                                                        <>
                                                            {hasOffer && (
                                                                <span className="offer-price">
                                                                    AED {productOfferPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                            <span className={`product-price ${hasOffer ? "strike" : ""}`}>
                                                                AED {productPrice.toFixed(2)}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {product.discountPercentage > 0 && (
                                            <div className="offer-percentage-div">
                                                {/* <MdLocalOffer className="icon"/> */}
                                                <span className="offer">{product.discountPercentage}% {t("off")}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="no-products-found">
                            <PiSmileySadDuotone />
                            <h1>{t("no_title_found", { title: (title === "Offer Items" ? t("offer_items") : title === "Featured Items" ? t("featured_items") : title === "Related Items" ? t("related_items") : title) })}</h1>
                        </div>
                    )
                )}
            </div>
        </section>
    )
}