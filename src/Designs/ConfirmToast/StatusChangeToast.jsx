import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";
import audio from "../../Assets/Notifications/notification-1.mp3";

const StatusChangeToast = ({
  orderNo,
  status,
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
      audioElement.loop = false; // Play only once
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Received':
        return '#3b82f6'; // Blue
      case 'Preparing':
        return '#f59e0b'; // Amber
      case 'Ready for Collection':
        return '#10b981'; // Green
      case 'Collected':
        return '#10b981'; // Green
      case 'Ready to Serve':
        return '#10b981'; // Green
      case 'Served':
        return '#10b981'; // Green
      case 'Out for Delivery':
        return '#8b5cf6'; // Purple
      case 'Delivered':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Received':
        return '📋';
      case 'Preparing':
        return '👨‍🍳';
      case 'Ready for Collection':
        return '📦';
      case 'Collected':
        return '✅';
      case 'Ready to Serve':
        return '🍽️';
      case 'Served':
        return '🎉';
      case 'Out for Delivery':
        return '🚚';
      case 'Delivered':
        return '🏠';
      default:
        return '📋';
    }
  };

  return createPortal(
    <div className={`status-change-toast-container ${exiting ? "exit" : ""}`}>
      <audio ref={audioRef} preload="auto">
        <source src={audio} type="audio/mpeg" />
      </audio>
      <div className="status-change-toast">
        <div className="toast-header">
          <div className="header-content">
            <div className="icon-wrapper" style={{ backgroundColor: getStatusColor(status) }}>
              <span className="status-icon">{getStatusIcon(status)}</span>
            </div>
            <h3 className="toast-title">Order Status Updated!</h3>
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

          <div className="status-update">
            <strong>New Status:</strong>
            <div className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
              <span className="status-icon">{getStatusIcon(status)}</span>
              <span className="status-text">{status}</span>
            </div>
          </div>

          {/* Show cancellation reason if status is Cancelled */}
          {status === 'Cancelled' && cancellationReason && (
            <div className="cancellation-reason">
              <strong>Reason for Cancellation:</strong>
              <div className="reason-text">{cancellationReason}</div>
            </div>
          )}
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

export default StatusChangeToast;
