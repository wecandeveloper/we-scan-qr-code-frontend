import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";

const AdminOrderCancelToast = ({
  orderNo,
  orderType,
  tableNo,
  customerName,
  customerPhone,
  onConfirm,
  onClose
}) => {
  const [exiting, setExiting] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    if (cancellationReason.trim().length < 5) {
      alert("Cancellation reason must be at least 5 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(cancellationReason.trim());
      setExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      setIsLoading(false);
      console.error("Error confirming cancellation:", error);
    }
  };

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return createPortal(
    <div className={`admin-cancel-reason-toast-container ${exiting ? "exit" : ""}`}>
      <div className="admin-cancel-reason-toast">
        <div className="toast-header">
          <div className="header-content">
            <div className="icon-wrapper">
              <span className="cancel-icon">❌</span>
            </div>
            <h3 className="toast-title">Cancel Order</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <IoClose />
          </button>
        </div>

        <div className="toast-body">
          <div className="order-info">
            <div className="order-no">
              <strong>Order No:</strong> {orderNo}
            </div>
            
            <div className="order-type">
              <strong>Order Type:</strong> {orderType}
            </div>
            
            {/* Conditional display based on orderType */}
            {orderType === 'Dine-In' ? (
              <div className="table-info">
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
          </div>

          <div className="reason-input">
            <label htmlFor="cancellation-reason">
              <strong>Reason for Cancellation:</strong>
            </label>
            <textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this order..."
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="character-count">
              {cancellationReason.length}/500 characters
            </div>
          </div>
        </div>

        <div className="toast-footer">
          <button
            className="cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={isLoading || !cancellationReason.trim()}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <IoCheckmarkCircle className="check-icon" />
                <span>Confirm Cancellation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminOrderCancelToast;
