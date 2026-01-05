import React, { useState } from "react";
import "./AcceptOrderToast.scss";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";

const AcceptOrderToast = ({ message, orderData, onConfirm, onCancel }) => {
  const [exiting, setExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null); // 'accept' or 'decline'

  const handleCancel = async () => {
    if (exiting || isLoading) return;
    setIsLoading(true);
    setLoadingType('decline');
    
    try {
      await onCancel();
    } catch (error) {
      console.error('Error declining order:', error);
    } finally {
      setExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingType(null);
      }, 300);
    }
  };

  const handleConfirm = async () => {
    if (exiting || isLoading) return;
    setIsLoading(true);
    setLoadingType('accept');
    
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingType(null);
      }, 300);
    }
  };

  // Extract order details from orderData (supports both old and new format)
  const orderDetails = orderData?.orderDetails || orderData || {};
  const orderNo = orderDetails.orderNo || orderData?.orderNo || 'N/A';
  const orderType = orderDetails.orderType || orderData?.orderType || 'N/A';
  const totalAmount = orderDetails.totalAmount || orderData?.totalAmount || 0;
  const tableNo = orderDetails.tableId?.tableNumber || orderDetails.tableNo || orderData?.tableNo || null;
  const customerName = orderDetails.deliveryAddress?.name || orderData?.customerName || null;
  const customerPhone = orderDetails.deliveryAddress?.phone 
    ? `${orderDetails.deliveryAddress.phone.countryCode || ''}${orderDetails.deliveryAddress.phone.number || ''}`
    : orderData?.customerPhone || null;
  const itemsCount = (orderDetails.lineItems?.length || 0) + (orderDetails.addOnsLineItems?.length || 0);

  return createPortal(
    <div className={`accept-order-toast-container ${exiting ? "exit" : ""}`}>
      <div className="accept-order-toast">
        <div className="toast-header">
          <div className="header-content">
            <div className="icon-wrapper">
              <span className="order-icon">📦</span>
            </div>
            <h3 className="toast-title">New Order Request</h3>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <IoClose />
          </button>
        </div>

        <div className="toast-body">
          {message && (
            <p className="message">{message}</p>
          )}
          
          {/* Order Details Section */}
          {orderData && (
            <>
              <div className="order-no">
                <strong>Order No:</strong> {orderNo}
              </div>
              
              <div className="order-type">
                <strong>Order Type:</strong> {orderType}
              </div>
              
              {/* Conditional display based on orderType */}
              {orderType === 'Dine-In' ? (
                tableNo && (
                  <div className="order-info">
                    <strong>Table:</strong> {tableNo}
                  </div>
                )
              ) : (
                (orderType === 'Home-Delivery' || orderType === 'Take-Away') && (
                  <div className="customer-info">
                    {customerName && (
                      <div className="customer-details">
                        <strong>Customer:</strong> {customerName || 'Guest Customer'}
                      </div>
                    )}
                    {customerPhone && (
                      <div className="customer-phone">
                        <strong>Phone:</strong> {customerPhone}
                      </div>
                    )}
                  </div>
                )
              )}

              <div className="order-summary">
                <div className="total-amount">
                  <strong>Total Amount:</strong> AED {totalAmount.toFixed(2)}
                </div>
                {itemsCount > 0 && (
                  <div className="items-count">
                    <strong>Items:</strong> {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="toast-footer">
          <button 
            className="accept-btn" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && loadingType === 'accept' && <div className="loading-spinner"></div>}
            {!isLoading && <IoCheckmarkCircle className="check-icon" />}
            <span>{isLoading && loadingType === 'accept' ? 'Processing...' : 'Accept'}</span>
          </button>
          <button 
            className="decline-btn" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading && loadingType === 'decline' && <div className="loading-spinner"></div>}
            <span>{isLoading && loadingType === 'decline' ? 'Processing...' : 'Decline'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AcceptOrderToast;

