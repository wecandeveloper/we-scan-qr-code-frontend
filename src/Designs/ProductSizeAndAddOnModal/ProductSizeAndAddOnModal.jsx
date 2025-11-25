import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "../../Utils/languageUtils";
import "./ProductSizeAndAddOnModal.scss";

export default function ProductSizeAndAddOnModal({
    isOpen,
    onClose,
    product,
    initialSelectedSize = null,
    initialSelectedAddOns = [],
    onConfirm,
    currentLang = "en"
}) {
    const { t } = useTranslation();
    const [selectedSize, setSelectedSize] = useState(initialSelectedSize);
    const [selectedAddOns, setSelectedAddOns] = useState(initialSelectedAddOns);
    const prevIsOpenRef = useRef(false);

    // Helper function to calculate offer price for a size based on product discount
    const calculateSizeOfferPrice = (sizePrice, product) => {
        if (!product?.discountPercentage || product.discountPercentage <= 0) {
            return null; // No offer
        }
        // Calculate offer price: sizePrice - (sizePrice * discountPercentage / 100)
        return sizePrice - (sizePrice * product.discountPercentage / 100);
    };

    // Initialize selections when modal opens
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            // Set default size if product has sizes
            if (product?.sizes && product.sizes.length > 0 && !initialSelectedSize) {
                const defaultSize = product.sizes.find(s => s.isAvailable) || product.sizes[0];
                if (defaultSize) {
                    const sizePrice = defaultSize.price || 0;
                    const offerPrice = calculateSizeOfferPrice(sizePrice, product);
                    setSelectedSize({
                        name: defaultSize.name,
                        price: sizePrice,
                        offerPrice: offerPrice // Include offer price if available
                    });
                }
            } else if (initialSelectedSize) {
                // Ensure offerPrice is included if not already present
                if (initialSelectedSize.price && !initialSelectedSize.offerPrice) {
                    const offerPrice = calculateSizeOfferPrice(initialSelectedSize.price, product);
                    setSelectedSize({
                        ...initialSelectedSize,
                        offerPrice: offerPrice
                    });
                } else {
                    setSelectedSize(initialSelectedSize);
                }
            } else {
                setSelectedSize(null);
            }
            
            // Set initial addOns
            setSelectedAddOns(initialSelectedAddOns || []);
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, product, initialSelectedSize, initialSelectedAddOns]);

    // Helper function to get localized name
    const getLocalizedItemName = (item) => {
        if (!item) return '';
        return getLocalizedName(item, currentLang) || item.name || '';
    };

    // Handle size selection
    const handleSizeChange = (size) => {
        if (size.isAvailable) {
            const sizePrice = size.price || 0;
            const offerPrice = calculateSizeOfferPrice(sizePrice, product);
            setSelectedSize({
                name: size.name,
                price: sizePrice,
                offerPrice: offerPrice // Include offer price if available
            });
        }
    };

    // Handle addOn toggle
    const handleAddOnToggle = (addOn) => {
        if (!addOn.isAvailable) return;
        
        setSelectedAddOns(prev => {
            const isSelected = prev.some(a => a.name === addOn.name);
            if (isSelected) {
                return prev.filter(a => a.name !== addOn.name);
            } else {
                return [...prev, { name: addOn.name, price: addOn.price }];
            }
        });
    };

    // Calculate total price (using offer prices if available)
    const calculateTotal = () => {
        let basePrice = 0;
        
        // Use selected size price or product base price
        if (selectedSize) {
            // Use offer price if available, otherwise use regular price
            basePrice = (selectedSize.offerPrice !== null && selectedSize.offerPrice > 0) 
                ? selectedSize.offerPrice 
                : selectedSize.price;
        } else {
            basePrice = product?.offerPrice && product.offerPrice > 0 
                ? product.offerPrice 
                : product?.price || 0;
        }
        
        // Add selected addOns prices
        const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
        
        return basePrice + addOnsTotal;
    };

    // Handle confirm
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm({
                selectedSize,
                selectedAddOns,
                total: calculateTotal()
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="product-size-addon-modal-overlay" onClick={onClose}>
            <motion.div
                className="product-size-addon-modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="product-size-addon-modal-header">
                    <h2>{getLocalizedItemName(product) || product?.name || t("select_options")}</h2>
                    <button className="addon-modal-header-close-btn" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="product-size-addon-modal-body">
                    {/* Sizes Selection */}
                    {product?.sizes && product.sizes.length > 0 && (
                        <div className="options-section">
                            <h3 className="section-title">{t("select_size")}</h3>
                            <div className="sizes-list">
                                {product.sizes.map((size, index) => {
                                    const isSelected = selectedSize?.name === size.name;
                                    return (
                                        <motion.button
                                            key={index}
                                            whileTap={{ scale: 0.95 }}
                                            whileHover={{ scale: 1.02 }}
                                            className={`size-item ${isSelected ? 'selected' : ''} ${!size.isAvailable ? 'disabled' : ''}`}
                                            onClick={() => handleSizeChange(size)}
                                            disabled={!size.isAvailable}
                                        >
                                            <span className="size-name">{getLocalizedItemName(size)}</span>
                                            <span className="size-price">
                                                {(() => {
                                                    const sizePrice = size.price || 0;
                                                    const offerPrice = calculateSizeOfferPrice(sizePrice, product);
                                                    const hasOffer = offerPrice !== null && offerPrice > 0 && offerPrice < sizePrice;
                                                    
                                                    return (
                                                        <>
                                                            {hasOffer && (
                                                                <span className="offer-price">
                                                                    AED {offerPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                            <span className={`product-price ${hasOffer ? "strike" : ""}`}>
                                                                AED {sizePrice.toFixed(2)}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Product-specific AddOns */}
                    {product?.addOns && product.addOns.length > 0 && (
                        <div className="options-section">
                            <h3 className="section-title">{t("add_ons")}</h3>
                            <div className="addons-list">
                                {product.addOns.map((addOn, index) => {
                                    const isSelected = selectedAddOns.some(a => a.name === addOn.name);
                                    return (
                                        <motion.label
                                            key={index}
                                            whileTap={{ scale: 0.95 }}
                                            className={`addon-item ${isSelected ? 'selected' : ''} ${!addOn.isAvailable ? 'disabled' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleAddOnToggle(addOn)}
                                                disabled={!addOn.isAvailable}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="addon-name">{getLocalizedItemName(addOn)}</span>
                                            {addOn.price > 0 && (
                                                <span className="addon-price">+AED {addOn.price}</span>
                                            )}
                                        </motion.label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Total Price Display */}
                    <div className="total-section">
                        <span className="total-label">{t("total_price")}</span>
                        <span className="total-price">AED {calculateTotal().toFixed(2)}</span>
                    </div>
                </div>

                <div className="product-size-addon-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        {t("cancel", { ns: "common" })}
                    </button>
                    <button className="confirm-btn" onClick={handleConfirm}>
                        {t("confirm", { ns: "common" })}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

