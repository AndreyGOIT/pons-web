//client/src/components/ScrollToTopButton.tsx
import { useState, useEffect } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="w3-button w3-theme w3-xlarge w3-circle w3-hover-dark-grey"
      style={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        zIndex: 1000,
        width: "50px",
        height: "50px",
      }}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  ) : null;
};

export default ScrollToTopButton;
