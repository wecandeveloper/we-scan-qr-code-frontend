import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Cart.scss"

import { FaMinus, FaPlus } from "react-icons/fa";
import { IoClose, IoFastFood } from "react-icons/io5";
import { MdEditNote } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../Context/AuthContext";
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConfirmToast from "../../../Designs/ConfirmToast/ConfirmToast";
import CommentsModal from "../../../Designs/CommentsModal/CommentsModal";
import CommonAddOnModal from "../../../Designs/CommonAddOnModal/CommonAddOnModal";
import ProductSizeAndAddOnModal from "../../../Designs/ProductSizeAndAddOnModal/ProductSizeAndAddOnModal";
// import defaultImage from "../../../Assets/Common/defaultImage.avif";
import { startCreateOrder } from "../../../Actions/orderActions";
import { Box, CircularProgress } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import i18n from "../../../Services/i18n_new.js";
import { getLocalizedName } from "../../../Utils/languageUtils";
import { BsCartXFill } from "react-icons/bs";
import { startGetAvailableCommonAddOns } from "../../../Actions/commonAddOnActions";
import { hasSizesAndAddOnsAccess, hasPaymentAccess } from "../../../Utils/subscriptionUtils";
import { createStripePaymentSession, createPaymobPaymentIntention } from "../../../Actions/paymentActions";

export default function Cart({setIsCartSectionOpen}) {
    const {t, i18n: i18nHook} = useTranslation()
    const [currentLang, setCurrentLang] = useState((i18n.language || "en").slice(0, 2));
    const dispatch = useDispatch()
    const { setGlobalGuestId, globalGuestCart, setGlobalGuestCart, setOpenSelectOrderTypeModal } = useAuth()

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    const commonAddOns = useSelector((state) => {
        return state.commonAddOns?.data || [];
    })

    // const [ guestCart, setGuestCart ] = useState([])
    const [ guestId, setGuestId ] = useState("")
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ productToRemove, setProductToRemove ] = useState(null);
    const [ showConfirmProceedOrder, setShowConfirmProceedOrder ] = useState(false);
    const [ orderLoading, setOrderLoading ] = useState(false);
    const [ commentsModalOpen, setCommentsModalOpen ] = useState(false);
    const [ selectedItemForComments, setSelectedItemForComments ] = useState(null);
    const [ commonAddOnModalOpen, setCommonAddOnModalOpen ] = useState(false);
    const [ sizeAddOnModalOpen, setSizeAddOnModalOpen ] = useState(false);
    const [ selectedItemForSizeAddOn, setSelectedItemForSizeAddOn ] = useState(null);
    const [ selectedPaymentOption, setSelectedPaymentOption ] = useState(null);
    const [ paymentLoading, setPaymentLoading ] = useState(false);


    useEffect(() => {
        const guestId = localStorage.getItem("guestId") || "";
        setGuestId(guestId);
        setGlobalGuestId(guestId);

        const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            orderType: "",
            tableId: null,
            deliveryAddress: null,
        };
        
        // Check if cart items belong to current restaurant
        if (restaurant && guestCartData.lineItems && guestCartData.lineItems.length > 0) {
            // Filter items that belong to current restaurant
            // Common addOns (no productId) are always valid
            const validItems = guestCartData.lineItems.filter(item => 
                item.isCommonAddOn || // Common addOns are always valid
                (item.productId && item.productId.restaurantId && 
                item.productId.restaurantId._id === restaurant._id)
            );
            
            // If no valid items, clear the cart
            if (validItems.length === 0) {
                const emptyCart = {
                    lineItems: [],
                    orderType: "",
                    tableId: null,
                    deliveryAddress: null,
                };
                setGlobalGuestCart(emptyCart);
                localStorage.setItem("guestCart", JSON.stringify(emptyCart));
            } else {
                // Update cart with only valid items
                const updatedCart = {
                    ...guestCartData,
                    lineItems: validItems
                };
                setGlobalGuestCart(updatedCart);
                localStorage.setItem("guestCart", JSON.stringify(updatedCart));
            }
        } else {
            setGlobalGuestCart(guestCartData);
        }
    }, [restaurant]);

    // Clear cart when restaurant changes (additional safety)
    useEffect(() => {
        if (restaurant) {
            const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || {
                lineItems: [],
                orderType: "",
                tableId: null,
                deliveryAddress: null,
            };
            
            // Check if any items belong to different restaurant
            // Common addOns (no productId) are always valid
            const hasInvalidItems = guestCartData.lineItems.some(item => 
                !item.isCommonAddOn && // Skip common addOns
                item.productId && item.productId.restaurantId && 
                item.productId.restaurantId._id !== restaurant._id
            );
            
            if (hasInvalidItems) {
                // Clear cart completely when switching restaurants
                const emptyCart = {
                    lineItems: [],
                    orderType: "",
                    tableId: null,
                    deliveryAddress: null,
                };
                setGlobalGuestCart(emptyCart);
                localStorage.setItem("guestCart", JSON.stringify(emptyCart));
            }
        }
    }, [restaurant?._id]); // Only trigger when restaurant ID changes

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

    // Helper function to calculate offer price for a cart item
    const calculateItemOfferPrice = (lineItem) => {
        // Always recalculate from product data to determine if there's an offer
        // itemSubtotal might already include offer price, but we need to check if offer exists
        if (!lineItem.productId) return null;
        
        const product = lineItem.productId;
        
        // If product has sizes and a size is selected
        if (lineItem.selectedSize) {
            const sizePrice = lineItem.selectedSize.price || 0;
            const discountPercentage = product.discountPercentage || 0;
            
            if (discountPercentage > 0 && sizePrice > 0) {
                // Calculate offer price for size: sizePrice - (sizePrice * discountPercentage / 100)
                const sizeOfferPrice = sizePrice - (sizePrice * discountPercentage / 100);
                const productAddOnsTotal = (lineItem.productAddOns || []).reduce((sum, addOn) => sum + (addOn.price || 0), 0);
                return sizeOfferPrice + productAddOnsTotal;
            }
            return null;
        }
        
        // If no size, use product offerPrice
        if (product.offerPrice && product.offerPrice > 0) {
            const productAddOnsTotal = (lineItem.productAddOns || []).reduce((sum, addOn) => sum + (addOn.price || 0), 0);
            return product.offerPrice + productAddOnsTotal;
        }
        
        return null;
    };

    // Helper function to get original price for a cart item
    const getItemOriginalPrice = (lineItem) => {
        // Always recalculate from product data to get the ORIGINAL price (not offer price)
        // basePrice might be the offer price, so we need to get the actual original price
        if (!lineItem.productId) return 0;
        
        const product = lineItem.productId;
        
        // If product has sizes and a size is selected
        if (lineItem.selectedSize) {
            // Get the original size price (not offer price)
            // selectedSize.price is the original price, selectedSize.offerPrice would be the offer
            const sizePrice = lineItem.selectedSize.price || 0;
            const productAddOnsTotal = (lineItem.productAddOns || []).reduce((sum, addOn) => sum + (addOn.price || 0), 0);
            return sizePrice + productAddOnsTotal;
        }
        
        // If no size, use product original price (not offerPrice)
        const productAddOnsTotal = (lineItem.productAddOns || []).reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        return product.price + productAddOnsTotal;
    };

    const getLocalizedItemName = (item) => {
        if (!item) return '';
        return getLocalizedName(item, currentLang) || item.name || '';
    };

    // Also update currentLang when i18n.language changes
    useEffect(() => {
        setCurrentLang((i18n.language || "en").slice(0, 2));
    }, [i18n.language]);

    // Fetch available common addOns to get translations
    useEffect(() => {
        dispatch(startGetAvailableCommonAddOns());
    }, [dispatch]);

    // Listen for cart cleared event (when order is accepted)
    useEffect(() => {
        const handleCartCleared = () => {
            setGlobalGuestCart({
                lineItems: [],
                orderType: "",
                tableId: null,
                deliveryAddress: null,
            });
        };

        window.addEventListener('cartCleared', handleCartCleared);
        return () => window.removeEventListener('cartCleared', handleCartCleared);
    }, [setGlobalGuestCart]);

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

    const handleRemoveLineItem = (lineItem) => {
        if (!lineItem || !lineItem.productId) {
            toast.error("Product not found");
            return;
        }
        setShowConfirm(true);
        setProductToRemove(lineItem) // Store the entire lineItem, not just productId
    };

    const handleSaveCommonAddOns = (selectedAddOns) => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            orderType: "",
            tableId: null,
            deliveryAddress: null,
        };

        // Remove existing common addOn line items
        const productLineItems = guestCart.lineItems.filter(item => item.productId);
        
        // Add each selected common addOn as a separate line item
        selectedAddOns.forEach(addOn => {
            // Find the full addOn object from Redux store to get translations
            const fullAddOn = commonAddOns.find(ca => ca.name === addOn.name);
            
            // Convert Map translations to object for localStorage compatibility
            let translationsObj = null;
            if (fullAddOn?.translations) {
                if (fullAddOn.translations.get && typeof fullAddOn.translations.get === 'function') {
                    // It's a Map, convert to object
                    translationsObj = {};
                    for (const [lang, data] of fullAddOn.translations.entries()) {
                        translationsObj[lang] = data;
                    }
                } else {
                    // Already an object
                    translationsObj = fullAddOn.translations;
                }
            }
            
            const quantity = addOn.quantity || 1;
            const itemSubtotal = addOn.price || 0;
            const itemTotal = itemSubtotal * quantity;
            
            const commonAddOnItem = {
                productId: null, // Common addOns don't have a product
                isCommonAddOn: true, // Flag to identify common addOn items
                commonAddOnName: addOn.name,
                commonAddOnPrice: addOn.price,
                commonAddOnTranslations: translationsObj, // Store translations as object
                quantity: quantity,
                price: addOn.price,
                basePrice: addOn.price,
                itemSubtotal: itemSubtotal,
                itemTotal: itemTotal,
            };
            productLineItems.push(commonAddOnItem);
        });

        // Recalculate totalAmount
        const totalAmount = productLineItems.reduce((acc, item) => {
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            return acc + (item.quantity * (item.price || 0));
        }, 0);

        const updatedGuestCart = {
            ...guestCart,
            lineItems: productLineItems,
            totalAmount: totalAmount,
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart);
        toast.success(t("common_addons_added") || "Common add-ons added to cart");
    };

    const handleRemoveCommonAddOn = (itemIndex) => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        const updatedLineItems = guestCart.lineItems.filter((item, index) => index !== itemIndex);
        
        const totalAmount = updatedLineItems.reduce((acc, item) => {
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            return acc + (item.quantity * (item.price || 0));
        }, 0);

        const updatedGuestCart = {
            ...guestCart,
            lineItems: updatedLineItems,
            totalAmount: totalAmount,
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart);
        toast.success(t("item_removed") || "Item removed from cart");
    };

    // Get selected common addOns from cart
    const getSelectedCommonAddOns = () => {
        const commonAddOnItems = cartItems.filter(item => item.isCommonAddOn);
        return commonAddOnItems.map(item => ({
            name: item.commonAddOnName,
            price: item.commonAddOnPrice,
            quantity: item.quantity || 1
        }));
    };

    // const cartItems = cart?.lineItems
    // const totalAmount = cart?.totalAmount


    const cartItems = globalGuestCart?.lineItems || [];
    
    // Recalculate totalAmount using offer prices (if available) for each line item
    const totalAmount = cartItems.reduce((acc, item) => {
        // Use itemTotal if available (already calculated with offer price)
        if (item.itemTotal !== undefined) {
            return acc + item.itemTotal;
        }
        // Fallback: calculate from offer price if available, otherwise use original price
        const itemOfferPrice = calculateItemOfferPrice(item);
        const itemOriginalPrice = getItemOriginalPrice(item);
        const priceToUse = itemOfferPrice !== null ? itemOfferPrice : itemOriginalPrice;
        return acc + (priceToUse * (item.quantity || 1));
    }, 0);

    const handleQtyInc = (lineItem) => {
        // Create a reference line item to match against
        const referenceItem = {
            productId: { _id: lineItem.productId?._id },
            selectedSize: lineItem.selectedSize || undefined,
            productAddOns: lineItem.productAddOns || undefined,
        };

        const updatedLineItems = globalGuestCart.lineItems.map((ele) => {
            // Match by exact configuration (product, size, addOns)
            if (ele.productId && areLineItemsSame(ele, referenceItem)) {
                const newQuantity = ele.quantity + 1;
                // Recalculate itemTotal if new format
                let itemTotal = ele.itemTotal;
                if (ele.itemSubtotal !== undefined) {
                    itemTotal = ele.itemSubtotal * newQuantity;
                } else {
                    // Fallback to old calculation
                    itemTotal = (ele.price || 0) * newQuantity;
                }
                toast.success(`Quantity updated to ${newQuantity}`);
                return { ...ele, quantity: newQuantity, itemTotal };
            }
            return ele;
        });

        // Calculate total - support both old and new formats
        const totalAmount = updatedLineItems.reduce((acc, item) => {
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            return acc + (item.quantity * (item.price || 0));
        }, 0);

        const updatedGuestCart = {
            ...globalGuestCart,
            lineItems: updatedLineItems,
            totalAmount: totalAmount,
        };

        setGlobalGuestCart(updatedGuestCart)
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
    };

    const handleQtyDec = (lineItem) => {
        // Create a reference line item to match against
        const referenceItem = {
            productId: { _id: lineItem.productId?._id },
            selectedSize: lineItem.selectedSize || undefined,
            productAddOns: lineItem.productAddOns || undefined,
        };

        const item = globalGuestCart.lineItems.find((ele) => 
            ele.productId && areLineItemsSame(ele, referenceItem)
        );

        if (item) {
            if (item.quantity > 1) {
                const newQuantity = item.quantity - 1;
                const updatedLineItems = globalGuestCart.lineItems.map((ele) => {
                    // Match by exact configuration (product, size, addOns)
                    if (ele.productId && areLineItemsSame(ele, referenceItem)) {
                        // Recalculate itemTotal if new format
                        let itemTotal = ele.itemTotal;
                        if (ele.itemSubtotal !== undefined) {
                            itemTotal = ele.itemSubtotal * newQuantity;
                        } else {
                            // Fallback to old calculation
                            itemTotal = (ele.price || 0) * newQuantity;
                        }
                        return { ...ele, quantity: newQuantity, itemTotal };
                    }
                    return ele;
                });

                // Calculate total - support both old and new formats
                const totalAmount = updatedLineItems.reduce((acc, item) => {
                    if (item.itemTotal !== undefined) {
                        return acc + item.itemTotal;
                    }
                    return acc + (item.quantity * (item.price || 0));
                }, 0);

                const updatedGuestCart = {
                    ...globalGuestCart,
                    lineItems: updatedLineItems,
                    totalAmount: totalAmount,
                };

                toast.success(`Quantity decreased, new quantity is ${newQuantity}`)
                setGlobalGuestCart(updatedGuestCart)
                localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
            } else {
                handleRemoveLineItem(lineItem); // Pass the full lineItem
            }
        }
    };

    const confirmRemoveLineItem = () => {
        // your delete logic here
        if (!productToRemove || !productToRemove.productId) {
            toast.error("Product not found");
            setShowConfirm(false);
            setProductToRemove(null);
            return;
        }
        
        // productToRemove is now the entire lineItem (with productId, selectedSize, productAddOns)
        // We need to remove only the exact matching line item (same product, size, and addOns)
        const updatedLineItems = globalGuestCart.lineItems.filter((ele) => {
            // Keep common addOns (no productId)
            if (!ele.productId) return true;
            // Remove only the exact matching line item (same product, size, and addOns)
            return !areLineItemsSame(ele, productToRemove);
        })
        
        // Calculate total - support both old and new formats
        const totalAmount = updatedLineItems.reduce((acc, item) => {
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            return acc + (item.quantity * (item.price || 0));
        }, 0);

        let updatedGuestCart;

        if(updatedLineItems.length === 0) {
            updatedGuestCart = {
                ...globalGuestCart,
                lineItems: [],
                totalAmount: 0,
            };
            toast.success("Product removed from cart, Cart is Empty Now")
        } else {
            updatedGuestCart = {
                ...globalGuestCart,
                lineItems: updatedLineItems,
                totalAmount: totalAmount,
            };
            toast.success("Product removed from cart")
        }

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart);
        setShowConfirm(false);
        setProductToRemove(null);
    };

    const cancelRemoveLineItem = () => {
        setShowConfirm(false);
        setProductToRemove(null);
    };

    const handleOpenCommentsModal = (lineItem) => {
        setSelectedItemForComments(lineItem);
        setCommentsModalOpen(true);
    };

    const handleSaveComments = (comments) => {
        if (!selectedItemForComments || !selectedItemForComments.productId) return;

        // Create a reference line item to match against
        const referenceItem = {
            productId: { _id: selectedItemForComments.productId._id },
            selectedSize: selectedItemForComments.selectedSize || undefined,
            productAddOns: selectedItemForComments.productAddOns || undefined,
        };

        const updatedLineItems = globalGuestCart.lineItems.map((item) => {
            // Match by exact configuration (product, size, addOns)
            if (item.productId && areLineItemsSame(item, referenceItem)) {
                return { ...item, comments: comments };
            }
            return item;
        });

        const updatedGuestCart = {
            ...globalGuestCart,
            lineItems: updatedLineItems,
        };

        setGlobalGuestCart(updatedGuestCart);
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        
        if (comments.trim()) {
            toast.success(t("comments_saved") || "Comments saved successfully");
        }
    };

    const handleSaveSizeAddOn = ({ selectedSize, selectedAddOns }) => {
        if (!selectedItemForSizeAddOn) return;

        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        // Create a reference item to match exactly (product, size, addOns)
        const referenceItem = {
            productId: { _id: selectedItemForSizeAddOn.productId?._id },
            selectedSize: selectedItemForSizeAddOn.selectedSize || undefined,
            productAddOns: selectedItemForSizeAddOn.productAddOns || undefined,
        };
        
        const updatedLineItems = guestCart.lineItems.map((item) => {
            // Match by exact configuration (product, size, addOns) - not just productId
            if (item.productId && areLineItemsSame(item, referenceItem)) {
                // Recalculate prices
                const basePrice = selectedSize ? selectedSize.price : (item.productId.offerPrice && item.productId.offerPrice > 0 ? item.productId.offerPrice : item.productId.price);
                const productAddOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
                const itemSubtotal = basePrice + productAddOnsTotal;
                const itemTotal = itemSubtotal * (item.quantity || 1);
                return {
                    ...item,
                    selectedSize: selectedSize || undefined,
                    productAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
                    basePrice: basePrice,
                    itemSubtotal: itemSubtotal,
                    itemTotal: itemTotal,
                    price: itemSubtotal // Keep legacy field for backward compatibility
                };
            }
            return item;
        });

        // Recalculate totalAmount
        const totalAmount = updatedLineItems.reduce((acc, item) => {
            if (item.itemTotal !== undefined) {
                return acc + item.itemTotal;
            }
            return acc + (item.quantity * (item.price || 0));
        }, 0);

        const updatedGuestCart = {
            ...guestCart,
            lineItems: updatedLineItems,
            totalAmount: totalAmount,
        };

        setGlobalGuestCart(updatedGuestCart);
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setSizeAddOnModalOpen(false);
        setSelectedItemForSizeAddOn(null);
        toast.success(t("options_updated") || "Options updated successfully");
    };

    const handleProceedToOrder = () => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        const { orderType, tableId, deliveryAddress } = guestCart;

        if (!orderType) {
            toast.error("Please select the order type");
            setOpenSelectOrderTypeModal(true);
            return;
        }

        if (orderType === "Dine-In" && !tableId) {
            toast.error("Please select the table number");
            setOpenSelectOrderTypeModal(true);
            return;
        }

        if (orderType === "Home-Delivery" && !deliveryAddress) {
            toast.error("Please add the delivery address");
            setOpenSelectOrderTypeModal(true);
            return;
        }

        if (orderType === "Take-Away" && !deliveryAddress) {
            toast.error("Please add the take away details");
            setOpenSelectOrderTypeModal(true);
            return;
        }

        // Check if payment is enabled for this restaurant
        const isPaymentEnabled = hasPaymentAccess(restaurant) && 
                                 restaurant?.paymentSettings?.isPaymentEnabled;

        if (isPaymentEnabled) {
            // Show payment options - don't proceed yet
            // Payment option will be selected in the UI
            return;
        }

        // ✅ All good, show confirmation modal (no payment)
        setShowConfirmProceedOrder(true);
    };

    // Get available payment options based on order type
    const getAvailablePaymentOptions = () => {
        const orderType = globalGuestCart?.orderType;
        if (!orderType) return [];

        if (orderType === "Dine-In") {
            return [
                { value: 'pay_now', label: t("pay_now"), description: t("pay_online_now") },
                { value: 'pay_later', label: t("pay_later"), description: t("pay_at_restaurant") }
            ];
        } else if (orderType === "Home-Delivery") {
            return [
                { value: 'pay_now', label: t("pay_now"), description: t("pay_online_now") },
                { value: 'cash_on_delivery', label: t("cash_on_delivery"), description: t("pay_when_delivered") }
            ];
        } else if (orderType === "Take-Away") {
            return [
                { value: 'pay_now', label: t("pay_now"), description: t("pay_online_now") },
                { value: 'pay_later', label: t("pay_later"), description: t("pay_when_collecting") }
            ];
        }
        return [];
    };

    const handlePaymentOptionSelect = async (paymentOption) => {
        if (!paymentOption) {
            toast.error("Please select a payment option");
            return;
        }

        // Prevent double-clicks
        if (paymentLoading || orderLoading) {
            console.warn("Order processing already in progress, ignoring duplicate request");
            return;
        }

        setSelectedPaymentOption(paymentOption);
        setPaymentLoading(true);

        try {
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
            
            // Check if payment is enabled
            const isPaymentEnabled = hasPaymentAccess(restaurant) && 
                                     restaurant?.paymentSettings?.isPaymentEnabled;

            if (isPaymentEnabled && paymentOption === 'pay_now') {
                // Create payment session
                const paymentData = {
                    guestCart: guestCart,
                    restaurantId: restaurant._id,
                    paymentOption: paymentOption
                };

                const gateway = restaurant.paymentSettings.selectedGateway;
                let paymentResponse;

                if (gateway === 'stripe') {
                    paymentResponse = await createStripePaymentSession(paymentData);
                } else if (gateway === 'paymob') {
                    paymentResponse = await createPaymobPaymentIntention(paymentData);
                } else {
                    throw new Error("Payment gateway not configured");
                }

                // For pay_now, we should always get a paymentURL (order is created after payment)
                if (paymentResponse.data?.paymentURL) {
                    // Redirect to payment gateway
                    window.location.href = paymentResponse.data.paymentURL;
                    return; // IMPORTANT: Return here to prevent any fallthrough
                } else {
                    // If no paymentURL, something went wrong
                    throw new Error("Payment processing failed: No payment URL received from gateway");
                }
            } else {
                // Pay Later or Cash on Delivery - go through old accept/decline flow
                // Call payment API first to validate, then route to old order creation if requiresApproval
                const paymentData = {
                    guestCart: guestCart,
                    restaurantId: restaurant._id,
                    paymentOption: paymentOption
                };

                const gateway = restaurant.paymentSettings.selectedGateway;
                let paymentResponse;

                if (gateway === 'stripe') {
                    paymentResponse = await createStripePaymentSession(paymentData);
                } else if (gateway === 'paymob') {
                    paymentResponse = await createPaymobPaymentIntention(paymentData);
                } else {
                    throw new Error("Payment gateway not configured");
                }

                // Check if order requires approval (pay_later/cash_on_delivery)
                if (paymentResponse.data?.requiresApproval) {
                    // Route to old order creation flow (accept/decline)
                    await confirmProceedOrder(paymentOption);
                    return;
                } else if (paymentResponse.data?.skipPayment) {
                    // This shouldn't happen for pay_later, but handle gracefully
                    toast.success(paymentResponse.message || "Order created successfully");
                    if (paymentResponse.data?.guestId) {
                        localStorage.setItem("guestId", paymentResponse.data.guestId);
                        setGlobalGuestId(paymentResponse.data.guestId);
                    }
                    const emptyCart = { lineItems: [], orderType: "", tableId: null, deliveryAddress: null };
                    localStorage.setItem("guestCart", JSON.stringify(emptyCart));
                    setGlobalGuestCart(emptyCart);
                    setIsCartSectionOpen(false);
                    return;
                } else {
                    throw new Error("Payment processing failed: Unexpected response from payment gateway");
                }
            }
        } catch (err) {
            console.error("Payment processing failed:", err);
            toast.error(err.response?.data?.message || "Something went wrong while processing payment");
        } finally {
            setPaymentLoading(false);
        }
    };

    const confirmProceedOrder = async (paymentOption = null) => {
        // Prevent double-clicks and duplicate order creation
        if (orderLoading || paymentLoading) {
            console.warn("Order processing already in progress, ignoring duplicate request");
            return;
        }

        setOrderLoading(true);
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};

        try {
            // Check if payment is enabled and payment option is provided
            const isPaymentEnabled = hasPaymentAccess(restaurant) && 
                                     restaurant?.paymentSettings?.isPaymentEnabled;

            // If payment is enabled, paymentOption must be provided
            if (isPaymentEnabled && !paymentOption) {
                console.warn("Payment is enabled but no paymentOption provided. Skipping order creation to prevent duplicates.");
                toast.error("Payment option is required. Please select a payment option.");
                return;
            }

            // If payment is enabled and paymentOption is pay_now, this should NOT be called
            // pay_now orders should only be handled in handlePaymentOptionSelect
            if (isPaymentEnabled && paymentOption === 'pay_now') {
                console.error("pay_now orders should be handled in handlePaymentOptionSelect, not confirmProceedOrder");
                toast.error("Please use the payment option selection to place your order.");
                return;
            }

            // Regular order creation (no payment) OR pay_later/cash_on_delivery (requires approval)
            if (!isPaymentEnabled || paymentOption === 'pay_later' || paymentOption === 'cash_on_delivery') {
                // Regular order creation (no payment) OR pay_later/cash_on_delivery (requires approval)
            // Separate common addOns from product items
            const productLineItems = [];
            const addOnsLineItems = [];
            
            guestCart.lineItems.forEach((item) => {
                // Handle common addOn items (no productId)
                if (item.isCommonAddOn) {
                    addOnsLineItems.push({
                        commonAddOnName: item.commonAddOnName,
                        quantity: item.quantity,
                        price: item.price,
                        basePrice: item.basePrice,
                        itemSubtotal: item.itemSubtotal,
                        itemTotal: item.itemTotal,
                    });
                } else {
                    // Handle product items
                    const lineItem = {
                        productId: item.productId?._id,
                        quantity: item.quantity,
                    };
                    
                    // Add new fields if they exist
                    if (item.comments) lineItem.comments = item.comments;
                    if (item.selectedSize) lineItem.selectedSize = item.selectedSize;
                    if (item.productAddOns && item.productAddOns.length > 0) lineItem.productAddOns = item.productAddOns;
                    
                    productLineItems.push(lineItem);
                }
            });
            
            // Build the payload with separated structure
            const formData = {
                restaurantId: restaurant._id,
                lineItems: productLineItems,
                addOnsLineItems: addOnsLineItems,
                orderType: guestCart.orderType,
                guestId: guestId || undefined,
            };

            // Attach tableId if Dine-In
            if (guestCart.orderType === "Dine-In" && guestCart.tableId) {
                formData.tableId = guestCart.tableId._id;
            }

            // Attach deliveryAddress if Home-Delivery
            if ((guestCart.orderType === "Home-Delivery" || guestCart.orderType === "Take-Away") && guestCart.deliveryAddress) {
                formData.deliveryAddress = guestCart.deliveryAddress;
            }

            // IMPORTANT: If payment is enabled and paymentOption is provided (pay_later/cash_on_delivery), include it
            // This tells the backend that this is a pay_later order and should be allowed through
            if (hasPaymentAccess(restaurant) && restaurant?.paymentSettings?.isPaymentEnabled && paymentOption) {
                formData.paymentOption = paymentOption;
            }

            // Call API
            await dispatch(startCreateOrder(formData, setGlobalGuestId, setIsCartSectionOpen, setGlobalGuestCart));
            }
        } catch (err) {
            console.error("Order failed:", err);
            toast.error(err.response?.data?.message || "Something went wrong while placing the order");
        } finally {
            setOrderLoading(false);
            setShowConfirmProceedOrder(false);
        }
    };

    return (
        <section>
            <div className={`cart-details-page ${currentLang === "ar" ? "ar" : ""}`}>
                {cartItems?.length > 0 ? (
                    <div className="cart">
                        <div className="cart-header">
                            <h1 className="main-heading">{t("my_cart")}</h1>
                            <div className="cart-details-div">
                                {/* Display Product Items */}
                                {cartItems?.filter(item => !item.isCommonAddOn).map((lineItem, itemIndex) => {
                                        return (
                                            <div className="lineItem-card" key={lineItem.productId?._id || `item-${itemIndex}`}>
                                                <IoClose className="remove-item" onClick={() => { 
                                                    if (lineItem.productId) {
                                                        handleRemoveLineItem(lineItem); // Pass the entire lineItem, not just productId
                                                    }
                                                }}/>
                                                <div className="line-items-price-qty-div">
                                                    {/* Image in separate div */}
                                                    {lineItem?.productId?.images[0]?.url || lineItem?.productId?.images[1]?.url ? (
                                                        <div className="img-div">
                                                            <img src={lineItem.productId.images[0].url} alt="" />
                                                        </div>
                                                    ) : (
                                                        <div className="img-div">
                                                            {/* <img src={defaultImage} alt="" /> */}
                                                            <IoFastFood className="default-image-icon"/>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Name-category and price-qty in another div */}
                                                    <div className="content-details-div">
                                                        <div className="lineitem-details">
                                                            <div className="product-name-div">
                                                                <h1 className="product-name">
                                                                    {getLocalizedName(lineItem.productId, currentLang)}
                                                                </h1>
                                                                <h3 className="product-category">
                                                                    {getLocalizedName(lineItem.productId?.categoryId, currentLang)}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="price-qty-div">
                                                            <div className="price-div">
                                                                    {(() => {
                                                                        // Calculate offer price and original price for this item
                                                                        const itemOfferPrice = calculateItemOfferPrice(lineItem);
                                                                        const itemOriginalPrice = getItemOriginalPrice(lineItem);
                                                                        const hasOffer = itemOfferPrice !== null && itemOfferPrice > 0;
                                                                        const quantity = lineItem.quantity || 1;
                                                                        
                                                                        // Calculate totals with quantity
                                                                        const offerTotal = hasOffer ? itemOfferPrice * quantity : null;
                                                                        const originalTotal = itemOriginalPrice * quantity;
                                                                        
                                                                        return (
                                                                            <>
                                                                                {hasOffer && offerTotal && (
                                                                                    <span className="offer-price">
                                                                                        AED {offerTotal.toFixed(2)}
                                                                                    </span>
                                                                                )}
                                                                                <span className={`product-price ${hasOffer ? "strike" : ""}`}>
                                                                                    AED {originalTotal.toFixed(2)}
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    })()}
                                                            </div>
                                                            <div className="qty-div">
                                                                <motion.div
                                                                    whileTap={{ scale: 0.85 }}
                                                                    whileHover={{ scale: 1 }}
                                                                    transition={{ type: "spring", stiffness: 300 }}
                                                                    onClick={() => { handleQtyDec(lineItem) }}
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    <FaMinus />
                                                                </motion.div>

                                                                <span className="qty">{lineItem.quantity}</span>

                                                                <motion.div
                                                                    whileTap={{ scale: 0.85 }}
                                                                    whileHover={{ scale: 1 }}
                                                                    transition={{ type: "spring", stiffness: 300 }}
                                                                    onClick = {() => { handleQtyInc(lineItem) }}
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    <FaPlus />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Compact Size and AddOns Selection - Between price-qty-div and comments - Premium Only */}
                                                {hasSizesAndAddOnsAccess(restaurant) && ((lineItem.productId?.sizes && lineItem.productId.sizes.length > 0) || (lineItem.productId?.addOns && lineItem.productId.addOns.length > 0)) && (
                                                    <div className="cart-options-section">
                                                        <div className="options-display-header">
                                                            <span className="options-label">
                                                                {lineItem.productId?.sizes && lineItem.productId.sizes.length > 0 && lineItem.productId?.addOns && lineItem.productId.addOns.length > 0 
                                                                    ? `${t("size")} & ${t("add_ons")}`
                                                                    : lineItem.productId?.sizes && lineItem.productId.sizes.length > 0
                                                                    ? t("size")
                                                                    : t("add_ons")
                                                                }
                                                            </span>
                                                            <button 
                                                                className="edit-options-btn"
                                                                onClick={() => {
                                                                    setSizeAddOnModalOpen(true);
                                                                    setSelectedItemForSizeAddOn(lineItem);
                                                                }}
                                                                title={t("edit_size_addons") || "Edit size & add-ons"}
                                                            >
                                                                <MdEditNote />
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Display Selected Size */}
                                                        {lineItem.productId?.sizes && lineItem.productId.sizes.length > 0 && (
                                                            <div className="selected-size-display">
                                                                {lineItem.selectedSize ? (
                                                                    <div className="size-display-item">
                                                                        <span className="size-label">{t("size")}:</span>
                                                                        <span className="size-value">
                                                                            {getLocalizedItemName(lineItem.productId.sizes.find(s => s.name === lineItem.selectedSize.name) || lineItem.selectedSize)}
                                                                            {(() => {
                                                                                // Calculate offer price for size if discount exists
                                                                                const sizePrice = lineItem.selectedSize.price || 0;
                                                                                const discountPercentage = lineItem.productId?.discountPercentage || 0;
                                                                                let displayPrice = sizePrice;
                                                                                
                                                                                if (discountPercentage > 0 && sizePrice > 0) {
                                                                                    // Calculate offer price: sizePrice - (sizePrice * discountPercentage / 100)
                                                                                    displayPrice = sizePrice - (sizePrice * discountPercentage / 100);
                                                                                }
                                                                                
                                                                                return displayPrice > 0 && ` (+AED ${displayPrice.toFixed(2)})`;
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="size-display-item">
                                                                        <span className="size-label">{t("size")}:</span>
                                                                        <span className="size-value not-selected">{t("not_selected") || "Not selected"}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Display Selected AddOns */}
                                                        {lineItem.productId?.addOns && lineItem.productId.addOns.length > 0 && (
                                                            <div className="selected-addons-display">
                                                                {lineItem.productAddOns && lineItem.productAddOns.length > 0 ? (
                                                                    <div className="selected-addons-chips">
                                                                        {lineItem.productAddOns.map((selectedAddOn, idx) => {
                                                                            const fullAddOn = lineItem.productId.addOns.find(a => a.name === selectedAddOn.name);
                                                                            const displayName = getLocalizedItemName(fullAddOn || selectedAddOn);
                                                                            return (
                                                                                <span key={idx} className="addon-chip">
                                                                                    {displayName}
                                                                                    {selectedAddOn.price > 0 && ` (+AED ${selectedAddOn.price.toFixed(2)})`}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <span className="no-addons-text">{t("no_addons_selected") || "No add-ons selected"}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Comments Section - Below lineitem-details-div and price-qty-div */}
                                                {lineItem.comments && (
                                                    <div className="cart-item-comments-display">
                                                        <div className="comments-display-header">
                                                            <span className="comments-label">{t("special_instructions") || "Special Instructions"}:</span>
                                                            <button 
                                                                className="edit-comments-btn"
                                                                onClick={() => handleOpenCommentsModal(lineItem)}
                                                                title={t("edit_comments") || "Edit comments"}
                                                            >
                                                                <MdEditNote />
                                                            </button>
                                                        </div>
                                                        <p className="comments-text">{lineItem.comments}</p>
                                                    </div>
                                                )}
                                                
                                                {/* Add Comments Button - Show if no comments */}
                                                {!lineItem.comments && (
                                                    <div className="cart-item-add-comments">
                                                        <button 
                                                            className="add-comments-btn"
                                                            onClick={() => handleOpenCommentsModal(lineItem)}
                                                        >
                                                            <MdEditNote />
                                                            <span>{t("add_instructions") || "Add Instructions"}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                
                                {/* Display Add-Ons in Compact Section */}
                                {cartItems?.filter(item => item.isCommonAddOn).length > 0 && (
                                    <div className="addons-compact-section">
                                        <h3 className="addons-compact-title">{t("common_add_ons") || "Add-Ons"}</h3>
                                        <div className="addons-compact-list">
                                            {cartItems.filter(item => item.isCommonAddOn).map((lineItem, index) => {
                                                const actualIndex = cartItems.findIndex(item => item === lineItem);
                                                // Get translated name if translations are available
                                                const addOnForTranslation = lineItem.commonAddOnTranslations 
                                                    ? { name: lineItem.commonAddOnName, translations: lineItem.commonAddOnTranslations }
                                                    : commonAddOns.find(ca => ca.name === lineItem.commonAddOnName);
                                                const displayName = addOnForTranslation 
                                                    ? getLocalizedName(addOnForTranslation, currentLang) || lineItem.commonAddOnName
                                                    : lineItem.commonAddOnName;
                                                
                                                return (
                                                    <div key={`addon-${index}`} className="addon-compact-item">
                                                        <span className="addon-name">{displayName}</span>
                                                        <div className="addon-qty-controls">
                                                            <motion.div
                                                                className="addon-qty-btn"
                                                                whileTap={{ scale: 0.85 }}
                                                                onClick={() => {
                                                                    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
                                                                    const updatedLineItems = guestCart.lineItems.map((item, idx) => {
                                                                        if (idx === actualIndex && item.isCommonAddOn) {
                                                                            const newQuantity = Math.max(1, (item.quantity || 1) - 1);
                                                                            const itemTotal = (item.price || 0) * newQuantity;
                                                                            return { ...item, quantity: newQuantity, itemTotal };
                                                                        }
                                                                        return item;
                                                                    });
                                                                    const totalAmount = updatedLineItems.reduce((acc, item) => {
                                                                        if (item.itemTotal !== undefined) {
                                                                            return acc + item.itemTotal;
                                                                        }
                                                                        return acc + (item.quantity * (item.price || 0));
                                                                    }, 0);
                                                                    const updatedGuestCart = {
                                                                        ...guestCart,
                                                                        lineItems: updatedLineItems,
                                                                        totalAmount: totalAmount,
                                                                    };
                                                                    localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                                                                    setGlobalGuestCart(updatedGuestCart);
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <FaMinus />
                                                            </motion.div>
                                                            <span className="addon-qty">{lineItem.quantity || 1}</span>
                                                            <motion.div
                                                                className="addon-qty-btn"
                                                                whileTap={{ scale: 0.85 }}
                                                                onClick={() => {
                                                                    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
                                                                    const updatedLineItems = guestCart.lineItems.map((item, idx) => {
                                                                        if (idx === actualIndex && item.isCommonAddOn) {
                                                                            const newQuantity = (item.quantity || 1) + 1;
                                                                            const itemTotal = (item.price || 0) * newQuantity;
                                                                            return { ...item, quantity: newQuantity, itemTotal };
                                                                        }
                                                                        return item;
                                                                    });
                                                                    const totalAmount = updatedLineItems.reduce((acc, item) => {
                                                                        if (item.itemTotal !== undefined) {
                                                                            return acc + item.itemTotal;
                                                                        }
                                                                        return acc + (item.quantity * (item.price || 0));
                                                                    }, 0);
                                                                    const updatedGuestCart = {
                                                                        ...guestCart,
                                                                        lineItems: updatedLineItems,
                                                                        totalAmount: totalAmount,
                                                                    };
                                                                    localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                                                                    setGlobalGuestCart(updatedGuestCart);
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <FaPlus />
                                                            </motion.div>
                                                        </div>
                                                        <div className="addon-price-remove">
                                                            <span className="addon-price">AED {((lineItem.price || 0) * (lineItem.quantity || 1)).toFixed(2)}</span>
                                                            <IoClose 
                                                                className="remove-addon" 
                                                                onClick={() => handleRemoveCommonAddOn(actualIndex)}
                                                                title={t("item_removed") || "Remove"}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Add Common AddOns Card */}
                            <div className="add-common-addons-card" onClick={() => setCommonAddOnModalOpen(true)}>
                                <div className="add-common-addons-content">
                                    <IoFastFood className="add-icon"/>
                                    <div className="add-common-addons-text">
                                        <h3>{t("add_common_addons") || "Add Common Add-Ons"}</h3>
                                        <p>{t("add_common_addons_description") || "Add extra items like extra cheese, sauce, etc."}</p>
                                    </div>
                                    <div className="add-common-addons-arrow">→</div>
                                </div>
                            </div>
                        </div>
                        <div className="total-order-div">
                            <div className="total-amount-div">
                                <div className="title">{t("sub_total")}</div>
                                <div className="amount">
                                    AED {totalAmount}
                                </div>
                            </div>
                            { globalGuestCart.orderType &&
                                <div className="order-type-details-div">
                                    <div className="order-type-details">
                                        <div className="order-type">
                                            <p className="head">Order Type:</p> 
                                            <p className="value">{globalGuestCart.orderType}</p>
                                        </div>
                                        { globalGuestCart.orderType === "Dine-In" ? 
                                            <div className="dine-in-order">
                                                <p className="head">Table No:</p> 
                                                <p className="value">{globalGuestCart.tableId.tableNumber}</p>
                                            </div>
                                        : globalGuestCart.orderType === "Home-Delivery" ? (
                                            <div className="delivery-order">
                                                <h3 className="head">Delivery Address</h3>
                                                <div className="delivery-details">
                                                    <div className="name">{globalGuestCart?.deliveryAddress?.name}</div>
                                                    <div className="name">{globalGuestCart?.deliveryAddress?.phone?.countryCode} {globalGuestCart?.deliveryAddress?.phone?.number}</div>
                                                    <div className="address-details">
                                                        {globalGuestCart?.deliveryAddress?.addressNo},{" "}
                                                        {globalGuestCart?.deliveryAddress?.street},{" "}<br/>
                                                        {globalGuestCart?.deliveryAddress?.city}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : ( globalGuestCart.orderType === "Take-Away" &&
                                            <div className="delivery-order">
                                                <h3 className="head">Take Away Details</h3>
                                                <div className="delivery-details">
                                                    <div className="name">{globalGuestCart?.deliveryAddress?.name}</div>
                                                    <div className="name">{globalGuestCart?.deliveryAddress?.phone?.countryCode} {globalGuestCart?.deliveryAddress?.phone?.number}</div>
                                                    <div className="address-details">
                                                        {globalGuestCart?.deliveryAddress?.vehicleNo}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div onClick={() => {setOpenSelectOrderTypeModal(true)}} className="btn-dark change-order-type">Change Table Number / Order type</div>
                                </div>}
                            
                            {/* Payment Options Section */}
                            {hasPaymentAccess(restaurant) && 
                             restaurant?.paymentSettings?.isPaymentEnabled && 
                             globalGuestCart.orderType && (
                                <div className="payment-options-section">
                                    <h3 className="payment-options-title">{t("select_payment_option") || "Select Payment Option"}</h3>
                                    <div className="payment-options-list">
                                        {getAvailablePaymentOptions().map((option) => (
                                            <div 
                                                key={option.value}
                                                className={`payment-option-card ${selectedPaymentOption === option.value ? 'selected' : ''}`}
                                                onClick={() => setSelectedPaymentOption(option.value)}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="paymentOption" 
                                                    value={option.value}
                                                    checked={selectedPaymentOption === option.value}
                                                    onChange={() => setSelectedPaymentOption(option.value)}
                                                />
                                                <div className="payment-option-content">
                                                    <div className="payment-option-label">{option.label}</div>
                                                    <div className="payment-option-description">{option.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div 
                                className="order-btn" 
                                onClick={() => {
                                    // Prevent clicks during processing
                                    if (orderLoading || paymentLoading) {
                                        console.warn("Order processing in progress, please wait");
                                        return;
                                    }

                                    if (hasPaymentAccess(restaurant) && restaurant?.paymentSettings?.isPaymentEnabled && globalGuestCart.orderType) {
                                        // If payment enabled, use payment flow
                                        if (!selectedPaymentOption) {
                                            toast.error(t("please_select_payment_option") || "Please select a payment option");
                                            return;
                                        }
                                        handlePaymentOptionSelect(selectedPaymentOption);
                                    } else {
                                        // Regular order flow
                                        handleProceedToOrder();
                                    }
                                }}
                                style={{ 
                                    cursor: (orderLoading || paymentLoading) ? 'not-allowed' : 'pointer',
                                    opacity: (orderLoading || paymentLoading) ? 0.6 : 1
                                }}
                            >
                                {(orderLoading || paymentLoading) ? 
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {t("processing") || "Processing..."} <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : (
                                    hasPaymentAccess(restaurant) && restaurant?.paymentSettings?.isPaymentEnabled && globalGuestCart.orderType
                                        ? (t("proceed_to_payment") || "Proceed to Payment")
                                        : (t("proceed_to_order") || "Proceed to Order")
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key="empty-cart" className="cart-details empty">
                        <h1 className="main-heading">{t("my_cart")}</h1>
                        <p>{t("cart_empty")}</p>
                        <BsCartXFill className="icon" />
                        <p>
                            <Trans i18nKey="go_to_collection">
                                Go to <a href={`/restaurant/${restaurant?.slug}/collections`}>Collection</a> to add a new Item to the Cart
                            </Trans>
                        </p>
                    </div>
                )}
            </div>


            {showConfirm && (
                <ConfirmToast
                    message={t("remove_item_confirm")}
                    onConfirm={confirmRemoveLineItem}
                    onCancel={cancelRemoveLineItem}
                />
            )}
            {showConfirmProceedOrder && (
                <ConfirmToast
                    message={t("place_order_confirm")}
                    onConfirm={() => {
                        // Only call confirmProceedOrder if payment is NOT enabled
                        // If payment is enabled, the order should be created through handlePaymentOptionSelect
                        const isPaymentEnabled = hasPaymentAccess(restaurant) && 
                                                 restaurant?.paymentSettings?.isPaymentEnabled;
                        if (!isPaymentEnabled) {
                            confirmProceedOrder();
                        } else {
                            toast.error("Please use the payment option selection to place your order.");
                            setShowConfirmProceedOrder(false);
                        }
                    }}
                    onCancel={() => setShowConfirmProceedOrder(false)}
                />
            )}

            {/* Comments Modal */}
            <CommentsModal
                isOpen={commentsModalOpen}
                onClose={() => {
                    setCommentsModalOpen(false);
                    setSelectedItemForComments(null);
                }}
                onSave={handleSaveComments}
                initialValue={selectedItemForComments?.comments || ""}
                productName={selectedItemForComments ? getLocalizedName(selectedItemForComments.productId, currentLang) : ""}
            />

            {/* Common AddOn Modal */}
            <CommonAddOnModal
                isOpen={commonAddOnModalOpen}
                onClose={() => setCommonAddOnModalOpen(false)}
                onSave={handleSaveCommonAddOns}
                selectedAddOns={getSelectedCommonAddOns()}
            />

            {/* Product Size and AddOn Modal - Premium Only */}
            {hasSizesAndAddOnsAccess(restaurant) && selectedItemForSizeAddOn && selectedItemForSizeAddOn.productId && (
                <ProductSizeAndAddOnModal
                    isOpen={sizeAddOnModalOpen}
                    onClose={() => {
                        setSizeAddOnModalOpen(false);
                        setSelectedItemForSizeAddOn(null);
                    }}
                    product={selectedItemForSizeAddOn.productId}
                    initialSelectedSize={selectedItemForSizeAddOn.selectedSize || null}
                    initialSelectedAddOns={selectedItemForSizeAddOn.productAddOns || []}
                    onConfirm={handleSaveSizeAddOn}
                    currentLang={currentLang}
                />
            )}

        </section>
    )
}