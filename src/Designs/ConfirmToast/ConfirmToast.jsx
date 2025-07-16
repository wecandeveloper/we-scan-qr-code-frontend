import React, { useEffect, useState } from 'react';
import './ConfirmToast.scss';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

const ConfirmToast = ({ message, onConfirm, onCancel }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onCancel, 300); // match CSS exit duration
    }, 3000);

    return () => clearTimeout(timer); // cleanup on unmount
  }, [onCancel]);

  const handleCancel = () => {
    setExiting(true);
    setTimeout(onCancel, 300); // match CSS exit duration
  };

  const handleConfirm = () => {
    setExiting(true);
    setTimeout(onConfirm, 300);
  };

  return createPortal(
    <div className={`confirm-toast-container ${exiting ? 'exit' : ''}`}>
      <IoClose className="close-icon" onClick={handleCancel} />
      <div className="confirm-toast">
        <p className="message">{message}</p>
        <div className="buttons">
          <button className="yes-btn" onClick={handleConfirm}>Yes</button>
          <button className="no-btn" onClick={handleCancel}>No</button>
        </div>
        <div className="bottom-line progress-bar"></div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmToast;