import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This provides a better UX by ensuring users
 * start at the top of each new page rather than maintaining scroll position.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the main window to top
    window.scrollTo(0, 0);
    
    // Also scroll any potential scrollable containers to top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Find any elements with scroll and reset them
    const scrollableElements = document.querySelectorAll('[data-scrollable], .overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll');
    scrollableElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.scrollTop = 0;
      }
    });
    
    // Try to scroll the main content area
    const mainContent = document.querySelector('main, [role="main"], .main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.scrollTop = 0;
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
