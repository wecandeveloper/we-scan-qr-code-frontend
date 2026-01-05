import React, { useState } from "react";
import "./CustomerOrderCancelToast.scss";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

const CustomerOrderCancelToast = ({ message, onConfirm, onCancel }) => {
  const [exiting, setExiting] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    if (exiting || isLoading) return;
    setExiting(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleConfirm = async () => {
    if (exiting || isLoading || !cancellationReason.trim()) return;
    
    setIsLoading(true);
    
    try {
      await onConfirm(cancellationReason);
      // Close the toast after successful cancellation
      setExiting(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Reset loading state on error
      setIsLoading(false);
    }
  };

  const isConfirmDisabled = !cancellationReason.trim() || isLoading;

  return createPortal(
    <div className={`confirm-toast-cancel-container ${exiting ? "exit" : ""}`}>
      <div className="backdrop" onClick={handleCancel}></div>
      <div className="confirm-toast-cancel">
        <IoClose className="close-icon" onClick={handleCancel} />
        <p className="message">{message}</p>
        
        <div className="reason-input-section">
          <label htmlFor="cancellation-reason" className="reason-label">
            Please provide the reason for cancellation:
          </label>
          <textarea
            id="cancellation-reason"
            className="reason-textarea"
            placeholder="Enter your cancellation reason here..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="buttons">
          <button 
            className="yes-btn" 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isLoading && <div className="loading-spinner"></div>}
            <span className="button-text">
              {isLoading ? 'Cancelling...' : 'Cancel Order'}
            </span>
          </button>
          <button 
            className="no-btn" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Keep Order
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomerOrderCancelToast;
