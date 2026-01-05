import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";
import audio from "../../Assets/Notifications/notification-1.mp3";

const PaidOrderAcknowledgeToast = ({
  orderNo,
  orderType,
  tableNo,
  customerName,
  customerPhone,
  totalAmount,
  paymentOption,
  onAcknowledge,
  onClose
}) => {
  const [exiting, setExiting] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.loop = true; // Loop for admin notifications
      audioElement.play().catch(console.error);
    }
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, []);

  const handleAcknowledge = () => {
    if (isAcknowledged) return;
    setIsAcknowledged(true);
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setExiting(true);
    setTimeout(() => {
      onAcknowledge();
    }, 300);
  };

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getPaymentOptionText = () => {
    if (paymentOption === 'pay_now') return 'Pay Now';
    if (paymentOption === 'pay_later') return 'Pay Later';
    if (paymentOption === 'cash_on_delivery') return 'Cash on Delivery';
    return paymentOption || 'Online Payment';
  };

  return createPortal(
    <div className={`paid-order-acknowledge-toast-container ${exiting ? "exit" : ""}`}>
      <audio ref={audioRef} preload="auto">
        <source src={audio} type="audio/mpeg" />
      </audio>
      <div className="paid-order-acknowledge-toast">
        <div className="toast-header">
          <div className="header-content">
            <div className="icon-wrapper">
              <span className="paid-icon">💰</span>
            </div>
            <h3 className="toast-title">New Paid Order Received</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <IoClose />
          </button>
        </div>

        <div className="toast-body">
          <div className="order-no">
            <strong>Order No:</strong> {orderNo}
          </div>
          
          <div className="order-type">
            <strong>Order Type:</strong> {orderType}
          </div>
          
          {/* Conditional display based on orderType */}
          {orderType === 'Dine-In' ? (
            <div className="order-info">
              <strong>Table:</strong> {tableNo || 'N/A'}
            </div>
          ) : (
            <div className="customer-info">
              <div className="customer-details">
                <strong>Customer:</strong> {customerName || 'Guest Customer'}
              </div>
              {customerPhone && (
                <div className="customer-phone">
                  <strong>Phone:</strong> {customerPhone}
                </div>
              )}
            </div>
          )}

          <div className="payment-info">
            <div className="payment-status">
              <strong>Payment Status:</strong> <span className="status-paid">✓ Paid</span>
            </div>
            <div className="payment-option">
              <strong>Payment Method:</strong> {getPaymentOptionText()}
            </div>
            {totalAmount && (
              <div className="total-amount">
                <strong>Total Amount:</strong> AED {totalAmount.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="toast-footer">
          <div
            className="acknowledge-btn"
            onClick={handleAcknowledge}
            disabled={isAcknowledged}
          >
            <IoCheckmarkCircle className="check-icon" />
            <span>{isAcknowledged ? 'Acknowledged' : 'Got it!'}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaidOrderAcknowledgeToast;

