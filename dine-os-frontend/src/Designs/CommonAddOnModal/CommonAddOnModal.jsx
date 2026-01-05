import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { startGetAvailableCommonAddOns } from '../../Actions/commonAddOnActions';
import { getLocalizedName } from '../../Utils/languageUtils';
import i18n from '../../Services/i18n_new.js';
import './CommonAddOnModal.scss';

const CommonAddOnModal = ({ isOpen, onClose, onSave, selectedAddOns = [] }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentLang, setCurrentLang] = useState((i18n.language || "en").slice(0, 2));
    const [localSelected, setLocalSelected] = useState(selectedAddOns);
    const prevIsOpenRef = useRef(false);

    const commonAddOns = useSelector((state) => {
        return state.commonAddOns?.data || [];
    });

    useEffect(() => {
        // Only initialize when modal opens (transitions from closed to open)
        if (isOpen && !prevIsOpenRef.current) {
            dispatch(startGetAvailableCommonAddOns());
            setLocalSelected(selectedAddOns);
        }
        prevIsOpenRef.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, dispatch]); // Only depend on isOpen to prevent unwanted resets

    useEffect(() => {
        setCurrentLang((i18n.language || "en").slice(0, 2));
    }, [i18n.language]);

    const handleToggle = (addOn) => {
        if (!addOn.isAvailable) return;
        
        setLocalSelected(prev => {
            const isSelected = prev.some(a => a.name === addOn.name);
            if (isSelected) {
                return prev.filter(a => a.name !== addOn.name);
            } else {
                return [...prev, { name: addOn.name, price: addOn.price, quantity: 1 }];
            }
        });
    };

    const handleQuantityChange = (addOnName, change) => {
        setLocalSelected(prev => {
            return prev.map(addOn => {
                if (addOn.name === addOnName) {
                    const newQuantity = Math.max(1, (addOn.quantity || 1) + change);
                    return { ...addOn, quantity: newQuantity };
                }
                return addOn;
            });
        });
    };

    const getQuantity = (addOnName) => {
        const selected = localSelected.find(a => a.name === addOnName);
        return selected ? (selected.quantity || 1) : 1;
    };

    const handleSave = () => {
        onSave(localSelected);
        onClose();
    };

    const handleClose = () => {
        setLocalSelected(selectedAddOns); // Reset to initial value on close
        onClose();
    };

    const calculateTotal = () => {
        return localSelected.reduce((sum, addOn) => {
            const quantity = addOn.quantity || 1;
            return sum + ((addOn.price || 0) * quantity);
        }, 0);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="common-addon-modal-overlay"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="common-addon-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="common-addon-modal-header">
                            <h3>{t("common_add_ons") || "Common Add Ons"}</h3>
                            <button className="addOn-close-btn" onClick={handleClose}>
                                <IoClose />
                            </button>
                        </div>
                        <div className="common-addon-modal-body">
                            {commonAddOns.length > 0 ? (
                                <div className="addons-list">
                                    {commonAddOns.map((addOn, index) => {
                                        const isSelected = localSelected.some(a => a.name === addOn.name);
                                        const quantity = getQuantity(addOn.name);
                                        return (
                                            <div
                                                key={index}
                                                className={`addon-item-wrapper ${isSelected ? 'selected' : ''} ${!addOn.isAvailable ? 'disabled' : ''}`}
                                            >
                                                <motion.label
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`addon-item ${isSelected ? 'selected' : ''} ${!addOn.isAvailable ? 'disabled' : ''}`}
                                                    onClick={(e) => {
                                                        // Prevent label click from interfering with quantity controls
                                                        if (e.target.closest('.addon-quantity-controls')) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleToggle(addOn);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={!addOn.isAvailable}
                                                    />
                                                    <div className="addon-info">
                                                        <span className="addon-name">
                                                            {getLocalizedName(addOn, currentLang) || addOn.name}
                                                        </span>
                                                        {addOn.description && (
                                                            <span className="addon-description">{addOn.description}</span>
                                                        )}
                                                    </div>
                                                    <span className="addon-price">
                                                        {addOn.price > 0 ? `AED ${addOn.price}` : t("free") || "Free"}
                                                    </span>
                                                </motion.label>
                                                {isSelected && (
                                                    <div className="addon-quantity-controls">
                                                        <motion.button
                                                            type="button"
                                                            whileTap={{ scale: 0.85 }}
                                                            className="qty-btn minus"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuantityChange(addOn.name, -1);
                                                            }}
                                                        >
                                                            <FaMinus />
                                                        </motion.button>
                                                        <span className="qty-value">{quantity}</span>
                                                        <motion.button
                                                            type="button"
                                                            whileTap={{ scale: 0.85 }}
                                                            className="qty-btn plus"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuantityChange(addOn.name, 1);
                                                            }}
                                                        >
                                                            <FaPlus />
                                                        </motion.button>
                                                        <span className="qty-total">
                                                            {t("equals") || "="} AED {((addOn.price || 0) * quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="no-addons">
                                    <p>{t("no_common_addons_available") || "No common add-ons available"}</p>
                                </div>
                            )}
                            {localSelected.length > 0 && (
                                <div className="selected-total">
                                    <span className="total-label">{t("selected_total") || "Selected Total:"}</span>
                                    <span className="total-price">AED {calculateTotal().toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="common-addon-modal-footer">
                            <button className="cancel-btn" onClick={handleClose}>
                                {t("cancel") || "Cancel"}
                            </button>
                            <button className="save-btn" onClick={handleSave}>
                                {t("add_to_cart") || "Add to Cart"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommonAddOnModal;

