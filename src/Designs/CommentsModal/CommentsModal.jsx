import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import './CommentsModal.scss';

const CommentsModal = ({ isOpen, onClose, onSave, initialValue = "", productName = "" }) => {
    const { t } = useTranslation();
    const [comments, setComments] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setComments(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSave = () => {
        onSave(comments);
        onClose();
    };

    const handleClose = () => {
        setComments(initialValue); // Reset to initial value on close
        onClose();
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
                    className="comments-modal-overlay"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="comments-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="comments-modal-header">
                            <h3>{t("special_instructions") || "Special Instructions"}</h3>
                            {productName && (
                                <p className="product-name-text">{productName}</p>
                            )}
                            <button className="close-btn" onClick={handleClose}>
                                <IoClose />
                            </button>
                        </div>
                        <div className="comments-modal-body">
                            <textarea
                                className="comments-textarea"
                                placeholder={t("add_special_instructions") || "Add any special cooking instructions or notes..."}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={5}
                                autoFocus
                            />
                            <div className="comments-modal-footer">
                                <button className="cancel-btn" onClick={handleClose}>
                                    {t("cancel") || "Cancel"}
                                </button>
                                <button className="save-btn" onClick={handleSave}>
                                    {t("save") || "Save"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommentsModal;

