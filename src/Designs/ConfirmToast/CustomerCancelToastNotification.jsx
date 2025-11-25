import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";
import audio from "../../Assets/Notifications/notification-1.mp3";

const CustomerCancelToastNotification = ({
  orderNo,
  orderType,
  tableNo,
  customerName,
  customerPhone,
  cancellationReason,
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

  return createPortal(
    <div className={`customer-cancel-toast-container ${exiting ? "exit" : ""}`}>
      <audio ref={audioRef} preload="auto">
        <source src={audio} type="audio/mpeg" />
      </audio>
      <div className="customer-cancel-toast">
        <div className="toast-header">
          <div className="header-content">
            <div className="icon-wrapper">
              <span className="cancel-icon">⚠️</span>
            </div>
            <h3 className="toast-title">Order Cancelled by Customer</h3>
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

          <div className="cancellation-reason">
            <strong>Customer's Reason:</strong>
            <div className="reason-text">{cancellationReason}</div>
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

export default CustomerCancelToastNotification;
