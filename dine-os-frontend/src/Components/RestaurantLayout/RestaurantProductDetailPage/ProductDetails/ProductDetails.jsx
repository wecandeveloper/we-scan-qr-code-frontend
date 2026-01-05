import { useDispatch, useSelector } from "react-redux"
import { startGetOneProduct } from "../../../../Actions/productActions";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import "./ProductDetails.scss"
import { GoDotFill } from "react-icons/go";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";

import { useAuth } from "../../../../Context/AuthContext";
import { toast } from "react-toastify";
import { IoShareOutline } from "react-icons/io5";
import slugify from "slugify";
import i18n from "../../../../Services/i18n_new.js";
import { useTranslation } from "react-i18next";
import { getLocalizedName, getLocalizedDescription } from "../../../../Utils/languageUtils";
import { hasSizesAndAddOnsAccess } from "../../../../Utils/subscriptionUtils";

export default function ProductDetails() {
    const { t, i18n: i18nHook } = useTranslation();
    const [currentLang, setCurrentLang] = useState((i18n.language || "en").slice(0, 2));
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { setGlobalGuestCart } = useAuth()
    const location = useLocation();
    const { productId: stateProductId } = location.state || {};
    
    // Get productId from URL params if not available in state
    const urlParams = new URLSearchParams(location.search);
    const urlProductId = urlParams.get('productId');
    const productId = stateProductId || urlProductId;
    const [bannerImages, setBannerImages] = useState([])

    const product = useSelector((state) => {
        return state.products.selected
    })

    const restaurant = useSelector((state) => {
            return state.restaurants.selected;
        });
    
    useEffect(() => {
        if (restaurant) {
            setBannerImages(restaurant?.theme?.bannerImages)
        }
    }, [restaurant, dispatch]);

    const [qty, setQty] = useState(1);
    // New state for sizes and addOns (comments removed - will be added in cart)
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedProductAddOns, setSelectedProductAddOns] = useState([]);

    const increaseQty = () => {
        setQty((prev) => prev + 1);
    };

    const decreaseQty = () => {
        if (qty > 1) {
            setQty((prev) => prev - 1);
        }
    };


    // Initialize selected size when product loads (use first available size as default) - Premium/Advanced Only
    useEffect(() => {
        // Only set size for premium/advanced restaurants
        if (!hasSizesAndAddOnsAccess(restaurant)) {
            setSelectedSize(null);
            return;
        }
        
        if (product?.sizes && product.sizes.length > 0) {
            const defaultSize = product.sizes.find(s => s.isAvailable) || product.sizes[0];
            if (defaultSize && !selectedSize) {
                const sizeOfferPrice = calculateSizeOfferPrice(defaultSize.price, product);
                setSelectedSize({
                    name: defaultSize.name,
                    price: defaultSize.price,
                    offerPrice: sizeOfferPrice
                });
            }
        } else {
            setSelectedSize(null);
        }
    }, [product, restaurant]);

    // Handle size selection
    const handleSizeChange = (size) => {
        if (size.isAvailable) {
            const sizeOfferPrice = calculateSizeOfferPrice(size.price, product);
            setSelectedSize({
                name: size.name,
                price: size.price,
                offerPrice: sizeOfferPrice
            });
        }
    };

    // Handle product addOn toggle
    const handleProductAddOnToggle = (addOn) => {
        if (!addOn.isAvailable) return;
        
        setSelectedProductAddOns(prev => {
            const isSelected = prev.some(a => a.name === addOn.name);
            if (isSelected) {
                return prev.filter(a => a.name !== addOn.name);
            } else {
                return [...prev, { name: addOn.name, price: addOn.price }];
            }
        });
    };

    // Helper function to calculate offer price for a size based on product discount
    const calculateSizeOfferPrice = (sizePrice, product) => {
        if (!product?.discountPercentage || product.discountPercentage <= 0) {
            return null; // No offer
        }
        // Calculate offer price: sizePrice - (sizePrice * discountPercentage / 100)
        return sizePrice - (sizePrice * product.discountPercentage / 100);
    };

    // Helper function to get localized name for sizes/addOns
    const getLocalizedItemName = (item) => {
        if (!item) return '';
        return getLocalizedName(item, currentLang) || item.name || '';
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


    // Calculate item price
    const calculateItemPrice = () => {
        let basePrice = 0;
        
        // Use selected size offer price if available, otherwise use size price or product offerPrice
        if (selectedSize) {
            basePrice = selectedSize.offerPrice !== null && selectedSize.offerPrice > 0 
                ? selectedSize.offerPrice 
                : selectedSize.price;
        } else {
            basePrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
        }
        
        // Add product addOns
        const productAddOnsTotal = selectedProductAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        
        return basePrice + productAddOnsTotal;
    };

    // console.log("product Name", productName)
    // console.log("product", product)

    useEffect(() => {
        // Disable browser scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Scroll to top when component mounts or productId changes
        const scrollToTopImmediate = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // Force scroll on all possible scrollable elements
            const scrollableElements = document.querySelectorAll('[style*="overflow"]');
            scrollableElements.forEach(el => {
                el.scrollTop = 0;
            });
        };
        
        // Immediate scroll
        scrollToTopImmediate();
        
        // Multiple attempts to ensure it sticks
        setTimeout(scrollToTopImmediate, 10);
        setTimeout(scrollToTopImmediate, 50);
        setTimeout(scrollToTopImmediate, 100);
        setTimeout(scrollToTopImmediate, 200);
    }, [productId]); // Run when productId changes

    // Also scroll to top when component first mounts
    useEffect(() => {
        // Disable browser scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        const scrollToTopImmediate = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            // Force scroll on all possible scrollable elements
            const scrollableElements = document.querySelectorAll('[style*="overflow"]');
            scrollableElements.forEach(el => {
                el.scrollTop = 0;
            });
        };
        
        // Immediate scroll
        scrollToTopImmediate();
        
        // Multiple attempts to ensure it sticks
        setTimeout(scrollToTopImmediate, 10);
        setTimeout(scrollToTopImmediate, 50);
        setTimeout(scrollToTopImmediate, 100);
        setTimeout(scrollToTopImmediate, 200);
    }, []); // Run only once when component mounts

    useEffect(() => {
        dispatch(startGetOneProduct(productId))
    }, [productId, dispatch]);


    useEffect(() => {
        if (!productId && product ) {
        navigate("/"); // ✅ Imperative redirect
        }
    }, [productId, product, navigate]);

    // Redirect if product is unavailable
    useEffect(() => {
        if (product && !product.isAvailable) {
            toast.error(t("product_unavailable"));
            navigate(`/restaurant/${restaurant?.slug}/collections`);
        }
    }, [product, navigate, restaurant?.slug, t]);


    // useEffect(() => {
    //     // Main Slider
    //     if(product) {
    //         const main = new Splide('#main-slider', {
    //             type: 'fade',
    //             // heightRatio: 0.,
    //             pagination: false,
    //             arrows: false,
    //             cover: true,
    //             height: '500px',
    //             breakpoints: {
    //                 1024: {
    //                     height: '450px',   // smaller on tablets
    //                 },
    //                 850: {
    //                     height: '400px',   // smaller on mobile
    //                 },
    //                 480: {
    //                     height: '350px',   // extra small screens
    //                 },
    //             },
    //         });
            

    //         // Thumbnail Slider
    //         const thumbnails = new Splide('#thumbnail-slider', {
    //             rewind: true,
    //             fixedWidth: 64,
    //             fixedHeight: 64,
    //             isNavigation: true,
    //             gap: 10,
    //             focus: 'center',
    //             pagination: false,
    //             cover: true,
    //             dragMinThreshold: {
    //                 mouse: 4,
    //                 touch: 10,
    //             },
    //             breakpoints : {
    //                 640: {
    //                 fixedWidth: 38,
    //                 fixedHeight: 38,
    //                 },
    //             },
    //         });

    //         main.sync(thumbnails);
    //         main.mount();
    //         thumbnails.mount();
    //     }
    // }, [product]);

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
    }, []);

    const handleShare = async (product) => {
        // Build the product link dynamically with productId as query parameter for state passing
        const productUrl = `${window.location.origin}/restaurant/${restaurant.slug}/products/${slugify(product.name).toLowerCase()}?productId=${product._id}`;
        
        // Get the product image URL
        const productImage = product?.images?.[0]?.url || product?.images?.[1]?.url;
        
        // Create share text with product details
        const shareText = `Check out this amazing product: ${getLocalizedName(product, currentLang)}\n\n${getLocalizedDescription(product, currentLang)}\n\nPrice: AED ${product.offerPrice > 0 ? product.offerPrice : product.price}${product.offerPrice > 0 ? ` (Original: AED ${product.price})` : ''}\n\nView more at: ${restaurant.name}`;

        // Check if Web Share API is supported (mostly on mobile browsers)
        if (navigator.share) {
            try {
                // For mobile devices, try to share with files (images) if supported
                if (navigator.canShare && productImage) {
                    // Try to fetch the image and create a File object for sharing
                    try {
                        const response = await fetch(productImage);
                        const blob = await response.blob();
                        const file = new File([blob], 'product-image.jpg', { type: blob.type });
                        
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: getLocalizedName(product, currentLang),
                                text: shareText,
                                url: productUrl,
                                files: [file]
                            });
                            return;
                        }
                    } catch {
                        console.log("Could not share with image, falling back to text only");
                    }
                }
                
                // Fallback to text-only sharing
                await navigator.share({
                    title: getLocalizedName(product, currentLang),
                    text: shareText,
                    url: productUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
                // Fallback to clipboard if sharing fails
                await copyToClipboard(productUrl, shareText);
            }
        } else {
            // Desktop fallback: Show share options with image
            await showDesktopShareOptions(product, productUrl, shareText, productImage);
        }
    };

    const copyToClipboard = async (url, text) => {
        try {
            await navigator.clipboard.writeText(`${text}\n\n${url}`);
            toast.success("Product link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link: ", err);
            toast.error("Failed to copy link");
        }
    };

    const showDesktopShareOptions = async (product, url, text) => {
        // Create WhatsApp share URL with image
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
        
        // Create a simple modal or use browser's built-in sharing
        if (confirm(`Share "${getLocalizedName(product, currentLang)}" on social media?\n\nClick OK to open share options.`)) {
            // Open WhatsApp by default (most common for product sharing)
            window.open(whatsappUrl, '_blank');
        }
    };


    const handleAddToCart = (product) => {
        // Guest user
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            totalAmount: 0,
        };

        // Calculate base price: use selected size offer price if available, otherwise use size price or product offerPrice
        let basePrice = 0;
        if (selectedSize) {
            basePrice = selectedSize.offerPrice !== null && selectedSize.offerPrice > 0 
                ? selectedSize.offerPrice 
                : selectedSize.price;
        } else {
            basePrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
        }

        // Calculate addOns totals
        const productAddOnsTotal = selectedProductAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        
        // Calculate item subtotal and total
        const itemSubtotal = basePrice + productAddOnsTotal;
        const itemTotal = itemSubtotal * qty;

        // Convert sizes and addOns Maps to plain objects for localStorage
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

        // Create line item with new structure
        const newLineItem = {
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
            quantity: qty,
            price: itemSubtotal, // Legacy field for backward compatibility
            basePrice: basePrice,
            itemSubtotal: itemSubtotal,
            itemTotal: itemTotal,
            comments: "", // Comments will be added in cart
            selectedSize: selectedSize || undefined,
            productAddOns: selectedProductAddOns.length > 0 ? selectedProductAddOns : undefined,
        };

        // Check if product already exists with EXACT same configuration (product, size, addOns)
        const existingItemIndex = guestCart.lineItems.findIndex(
            (item) => item.productId && areLineItemsSame(item, newLineItem)
        );

        if (existingItemIndex !== -1) {
            // If same product exists, update quantity
            guestCart.lineItems[existingItemIndex].quantity += qty;
            // Recalculate totals for existing item
            const existingItem = guestCart.lineItems[existingItemIndex];
            const existingBasePrice = existingItem.basePrice || existingItem.price;
            const existingProductAddOnsTotal = (existingItem.productAddOns || []).reduce((sum, a) => sum + (a.price || 0), 0);
            const existingSubtotal = existingBasePrice + existingProductAddOnsTotal;
            guestCart.lineItems[existingItemIndex].itemTotal = existingSubtotal * guestCart.lineItems[existingItemIndex].quantity;
            toast.success(`${getLocalizedName(product, currentLang)} ${t("item_already_in_cart_updated", { name: getLocalizedName(product, currentLang), qty: guestCart.lineItems[existingItemIndex].quantity })}`);
        } else {
            // Add new product
            guestCart.lineItems.push(newLineItem);
            toast.success(t("item_added_to_cart"));
        }

        // Recalculate totalAmount
        const totalAmount = guestCart.lineItems.reduce((acc, item) => {
            // Use itemTotal if available (new format), otherwise fall back to old calculation
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
        }, 0);

        const updatedGuestCart = {
            ...guestCart,
            lineItems: guestCart.lineItems,
            totalAmount: totalAmount,
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart);
        
        // Reset selections after adding to cart (optional)
        // setSelectedSize(null);
        // setSelectedProductAddOns([]);
        // setQty(1);
    };

    if(!product) {
        return null
    } 

    return (
        <section>
            <div className={`product-details-section common-padding ${currentLang === "ar" ? "ar" : ""}`}>
                <div className="img-div">
                    <img src={product?.images[0]?.url} alt="Product Image" />
                    {/* <div id="main-slider" className="splide">
                        <div className="splide__track">
                        <ul className="splide__list">
                            {product?.images.map((img, index) => (
                            <li className="splide__slide" key={index}>
                                <img src={img.url} alt={`Main ${index}`} />
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div> */}

                    {/* <div id="thumbnail-slider" className="splide mt-4">
                        <div className="splide__track">
                        <ul className="splide__list">
                            {product?.images.map((img, index) => (
                            <li className="splide__slide" key={index}>
                                <img src={img.url} alt={`Thumb ${index}`} />
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div> */}
                </div>
                <div className="product-details-div">
                    <div className="product-details">
                        <div className="product-name-div">
                            <h1 className="product-name">
                                {getLocalizedName(product, currentLang)}
                            </h1>
                            <h3 className="product-category">
                                {getLocalizedName(product?.categoryId, currentLang)}
                            </h3>
                        </div>
                        <div className="rating-div">
                            <span className="rating-value">5.0</span>
                            <div className="rating">
                                <span className="star">&#9733;</span>
                                <span className="star">&#9733;</span>
                                <span className="star">&#9733;</span>
                                <span className="star">&#9733;</span>
                                <span className="star">&#9733;</span>
                            </div>
                        </div>

                        {/* Show discount percentage tag below rating */}
                        {product.discountPercentage > 0 && (
                            <div className="discount-tag">
                                {t("sale")} {product.discountPercentage}%
                            </div>
                        )}

                        {/* Show price: always for non-premium, or when no size/addOns selected for premium */}
                        {(!hasSizesAndAddOnsAccess(restaurant) || !(selectedSize || selectedProductAddOns.length > 0)) && (
                            <div className="price-div">
                                <div className="price-div">
                                    {product.offerPrice != 0 && 
                                        <span className="offer-price">
                                            AED {product.offerPrice}
                                        </span>
                                    }
                                    <span className={`product-price ${product.offerPrice != 0 ? "strike" : ""}`}>
                                        AED {product.price}
                                    </span>
                                    {product.discountPercentage > 0 && (
                                        <div className="sale-offer">
                                            {t("sale")} {product.discountPercentage} %
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="stock-available-div">
                            {product.isAvailable ? (
                                <div className="stock-available">
                                    <GoDotFill /> <span>{t("available")}</span>
                                </div>
                            ) : (
                                <div className="no-stock">
                                    <GoDotFill /> <span>{t("not_available")}</span>
                                </div>
                            )}
                        </div>

                        {/* Size Selection Section - Premium/Advanced Only */}
                        {hasSizesAndAddOnsAccess(restaurant) && product?.sizes && product.sizes.length > 0 && (
                            <div className="size-selection-section">
                                <div className="section-header">
                                    <h3 className="section-title">{t("select_size")}</h3>
                                    <div className="required-badge">
                                        <span className="required-icon">!</span>
                                        <span className="required-text">{t("required")}</span>
                                    </div>
                                </div>
                                <p className="section-subtitle">{t("select") || "Select"} 1</p>
                                <div className="size-options-list">
                                    {product.sizes.map((size, index) => {
                                        const isSelected = selectedSize?.name === size.name;
                                        const actualSize = product.sizes.find(s => s.name === size.name);
                                        const displayName = getLocalizedItemName(actualSize || size);
                                        const sizeOfferPrice = calculateSizeOfferPrice(size.price, product);
                                        const hasOffer = sizeOfferPrice !== null && sizeOfferPrice > 0;
                                        
                                        return (
                                            <label 
                                                key={index} 
                                                className={`size-option-item ${isSelected ? 'selected' : ''} ${!size.isAvailable ? 'disabled' : ''}`}
                                            >
                                                <div className="size-option-content">
                                                    <div className="size-option-left">
                                                        <span className="size-name">{displayName}</span>
                                                    </div>
                                                    <div className="size-price-wrapper">
                                                        {size.price > 0 && (
                                                            <>
                                                                <span className={`size-price ${hasOffer ? 'strike' : ''}`}>
                                                                    +AED {size.price.toFixed(2)}
                                                                </span>
                                                                {hasOffer && (
                                                                    <span className="size-offer-price">+AED {sizeOfferPrice.toFixed(2)}</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="product-size"
                                                    checked={isSelected}
                                                    onChange={() => handleSizeChange(size)}
                                                    disabled={!size.isAvailable}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AddOns Selection Section - Premium/Advanced Only */}
                        {hasSizesAndAddOnsAccess(restaurant) && product?.addOns && product.addOns.length > 0 && (
                            <div className="addons-selection-section">
                                <div className="section-header">
                                    <h3 className="section-title">{t("add_ons")}</h3>
                                    <div className="optional-badge">
                                        <span className="optional-text">{t("optional")}</span>
                                    </div>
                                </div>
                                <div className="addons-options-list">
                                    {product.addOns.map((addOn, index) => {
                                        const isSelected = selectedProductAddOns.some(a => a.name === addOn.name);
                                        const actualAddOn = product.addOns.find(a => a.name === addOn.name);
                                        const displayName = getLocalizedItemName(actualAddOn || addOn);
                                        
                                        return (
                                            <label 
                                                key={index} 
                                                className={`addon-option-item ${isSelected ? 'selected' : ''} ${!addOn.isAvailable ? 'disabled' : ''}`}
                                            >
                                                <div className="addon-option-content">
                                                    <span className="addon-name">{displayName}</span>
                                                    {addOn.price > 0 && (
                                                        <span className="addon-price">+AED {addOn.price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleProductAddOnToggle(addOn)}
                                                    disabled={!addOn.isAvailable}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        {/* Display calculated price - only show when sizes/addOns are available and restaurant has premium */}
                        {hasSizesAndAddOnsAccess(restaurant) && restaurant.isCustomerOrderAvailable && ((product?.sizes && product.sizes.length > 0) || (product?.addOns && product.addOns.length > 0)) && (
                            <div className={`calculated-price-div ${!(product?.addOns && product.addOns.length > 0) && (product?.sizes && product.sizes.length > 0) ? 'no-addons' : ''}`}>
                                <span className="price-label">{t("total_price")}</span>
                                <span className="calculated-price">AED {calculateItemPrice().toFixed(2)}</span>
                            </div>
                        )}

                        {restaurant.isCustomerOrderAvailable && <div className="add-to-cart-div">
                            <div className="qty-div">
                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    onClick={decreaseQty}
                                    style={{ cursor: "pointer" }}
                                >
                                    <FaMinus />
                                </motion.div>

                                <span>{qty}</span>

                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    onClick={increaseQty}
                                    style={{ cursor: "pointer" }}
                                >
                                    <FaPlus />
                                </motion.div>
                            </div>
                            <motion.div 
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleAddToCart(product);
                                }}
                                className="add-to-cart">
                                <span>{t("add_to_cart")}</span>
                                <FiShoppingCart/>
                            </motion.div>
                            <motion.div 
                                whileTap={{ scale: 0.96 }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={() => handleShare(product)}
                                className="share-div">
                                <IoShareOutline className="share-icon"/>
                            </motion.div>
                        </div>}
                        <hr className="hr"/>
                        {product.description && product.description.length !== "undefined" && <p className="product-description">
                            {getLocalizedDescription(product, currentLang)}
                        </p>}
                    </div>
                    
                    {bannerImages[0]?.url && (
                        <div className="promo-card">
                            <img src={bannerImages[0]?.url} alt="Offer Banner" className="promo-bg"/>
                        </div>
                    )}
                </div>
            </div>

        </section>
    )
}