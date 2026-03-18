import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the page to the top whenever the route changes.
 * This ensures a better user experience when navigating between pages.
 * 
 * Usage: Place this component inside Router, before <Routes>
 * Example: <ScrollToTop /> in App.jsx
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;
