import React, { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import "./HamburgerButton.scss";

const HamburgerButton = ({ onClick }) => {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive((prev) => !prev);
    if (onClick) onClick(); // Optional callback for parent component
  };

  return (
    <MotionConfig transition={{ duration: 0.5, ease: "easeInOut" }}>
      <motion.button
        initial={false}
        animate={active ? "open" : "closed"}
        onClick={handleClick}
        className="hamburger-btn"
      >
        <motion.span variants={VARIANTS.top} className="bar top" />
        <motion.span variants={VARIANTS.middle} className="bar middle" />
        <motion.span variants={VARIANTS.bottom} className={`bar bottom ${active ? "hide" : ""}`} />
      </motion.button>
    </MotionConfig>
  );
};

export default HamburgerButton;

const VARIANTS = {
  top: {
    open: { rotate: ["0deg", "0deg", "45deg"], top: ["35%", "50%", "50%"] },
    closed: { rotate: ["45deg", "0deg", "0deg"], top: ["50%", "50%", "35%"] },
  },
  middle: {
    open: { rotate: ["0deg", "0deg", "-45deg"] },
    closed: { rotate: ["-45deg", "0deg", "0deg"] },
  },
  bottom: {
    open: { rotate: ["0deg", "0deg", "45deg"], bottom: ["35%", "50%", "50%"], left: "50%" },
    closed: { rotate: ["45deg", "0deg", "0deg"], bottom: ["50%", "50%", "35%"], left: "calc(50% + 10px)" },
  },
};
