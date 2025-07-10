import { motion } from "framer-motion";

const DURATION = 0.25;
const STAGGER = 0.025;

export const FlipLinkBtn = ({ children, isHovered }) => {
    if (typeof children !== "string") return null;
        return (
            <div className="relative inline-block overflow-hidden" style={{ lineHeight: 1 }}>
                {/* Original text (slides out) */}
                <div>
                {children.split("").map((l, i) => (
                    <motion.span
                    key={`out-${i}`}
                    className="inline-block"
                    animate={isHovered ? "hovered" : "initial"}
                    initial="initial"
                    variants={{
                        initial: { y: 0 },
                        hovered: { y: "-100%" },
                    }}
                    transition={{
                        duration: DURATION,
                        ease: "easeInOut",
                        delay: STAGGER * i,
                    }}
                    >
                        {l === " " ? "\u00A0" : l}
                    </motion.span>
                ))}
                </div>
        
                {/* Replacement text (slides in) */}
                <div className="absolute inset-0">
                {children.split("").map((l, i) => (
                    <motion.span
                    key={`in-${i}`}
                    className="inline-block"
                    animate={isHovered ? "hovered" : "initial"}
                    initial="initial"
                    variants={{
                        initial: { y: "100%" },
                        hovered: { y: 0 },
                    }}
                    transition={{
                        duration: DURATION,
                        ease: "easeInOut",
                        delay: STAGGER * i,
                    }}
                    >
                        {l === " " ? "\u00A0" : l}
                    </motion.span>
                ))}
                </div>
            </div>
        );
};

export const FlipLinkText = ({ children }) => {
    if (typeof children !== "string") return null;
        return (
        <motion.div
            initial="initial"
            whileHover="hovered"
            className="relative inline-block overflow-hidden"
            style={{ lineHeight: 1 }}
        >
            {/* Original text (slides out) */}
            <div>
            {children.split("").map((l, i) => (
                <motion.span
                key={`out-${i}`}
                className="inline-block"
                variants={{
                    initial: { y: 0 },
                    hovered: { y: "-100%" },
                }}
                transition={{
                    duration: DURATION,
                    ease: "easeInOut",
                    delay: STAGGER * i,
                }}
                >
                    {l === " " ? "\u00A0" : l}
                </motion.span>
            ))}
            </div>
    
            {/* Replacement text (slides in) */}
            <div className="absolute inset-0">
            {children.split("").map((l, i) => (
                <motion.span
                key={`in-${i}`}
                className="inline-block"
                variants={{
                    initial: { y: "100%" },
                    hovered: { y: 0 },
                }}
                transition={{
                    duration: DURATION,
                    ease: "easeInOut",
                    delay: STAGGER * i,
                }}
                >
                    {l === " " ? "\u00A0" : l}
                </motion.span>
            ))}
            </div>
        </motion.div>
        );
  };