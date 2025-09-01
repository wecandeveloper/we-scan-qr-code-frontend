import React, { useState } from "react";
import "./ConfirmToast2.scss";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

const ConfirmToast2 = ({ message, onConfirm, onCancel }) => {
  const [exiting, setExiting] = useState(false);

  const handleCancel = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleConfirm = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  return createPortal(
    <div className={`confirm-toast-container ${exiting ? "exit" : ""}`}>
      <IoClose className="close-icon" onClick={handleCancel} />
      <div className="confirm-toast">
        <p className="message">{message}</p>
        <div className="buttons">
          <button className="yes-btn" onClick={handleConfirm}>Accept</button>
          <button className="no-btn" onClick={handleCancel}>Decline</button>
        </div>
        <div className="bottom-line2 progress-bar2"></div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmToast2;
