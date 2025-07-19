import React, { useEffect, useState } from 'react';
import './ConfirmToast.scss';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

const ConfirmToast = ({ message, onConfirm, onCancel }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCancel(); // call handler instead of directly using onCancel to ensure exit transition
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onCancel();
    }, 300); // match exit animation
  };

  const handleConfirm = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onConfirm();
    }, 300);
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