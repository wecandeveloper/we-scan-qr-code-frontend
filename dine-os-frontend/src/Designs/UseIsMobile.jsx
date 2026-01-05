import { useState, useEffect } from "react";

const useIsMobile = (breakpoint = 530) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]); // ✅ add breakpoint dependency

    return isMobile;
};

export default useIsMobile;
