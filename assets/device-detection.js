/**
 * Device Detection and Routing System
 * Ensures complete separation between mobile and desktop experiences
 */

(function() {
  'use strict';
  
  // Device detection utility
  const DeviceDetector = {
    isMobile: function() {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth || document.documentElement.clientWidth;
      
      // Multi-factor detection for accuracy
      return mobileRegex.test(userAgent) || screenWidth <= 768;
    },
    
    isTablet: function() {
      const tabletRegex = /iPad|Android(?=.*Tablet)|Android(?=.*Mobile)/i;
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth || document.documentElement.clientWidth;
      
      return tabletRegex.test(userAgent) && screenWidth >= 768 && screenWidth <= 1024;
    },
    
    isDesktop: function() {
      return !this.isMobile() && !this.isTablet();
    },
    
    getDeviceType: function() {
      if (this.isMobile()) return 'mobile';
      if (this.isTablet()) return 'tablet';
      return 'desktop';
    }
  };
  
  // Theme Routing System
  const ThemeRouter = {
    setDeviceType: function() {
      const deviceType = DeviceDetector.getDeviceType();
      
      // Set device type in local storage for server-side detection
      localStorage.setItem('deviceType', deviceType);
      
      // Set CSS classes on body for immediate styling
      document.body.className = '';
      document.body.classList.add(`device-${deviceType}`);
      
      // Set device type in session for Shopify liquid access
      if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem('shopify_device_type', deviceType);
      }
      
      return deviceType;
    },
    
    enforceDeviceExperience: function() {
      const deviceType = this.setDeviceType();
      const currentTheme = document.body.getAttribute('data-theme-type');
      
      // If theme type doesn't match device, reload with correct experience
      if (currentTheme && currentTheme !== deviceType) {
        // Add device parameter to URL for server detection
        const url = new URL(window.location);
        url.searchParams.set('device', deviceType);
        url.searchParams.set('force_reload', '1');
        
        console.log(`Device mismatch detected. Reloading with ${deviceType} experience.`);
        window.location.href = url.toString();
      }
      
      return deviceType;
    }
  };
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    const deviceType = ThemeRouter.enforceDeviceExperience();
    console.log(`Device detected: ${deviceType}`);
    
    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('device-detected', { 
      detail: { deviceType: deviceType }
    }));
  });
  
  // Re-check on window resize (for desktop/tablet switching)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      const newDeviceType = ThemeRouter.enforceDeviceExperience();
      console.log(`Device type after resize: ${newDeviceType}`);
    }, 250);
  });
  
  // Make utilities globally available
  window.DeviceDetector = DeviceDetector;
  window.ThemeRouter = ThemeRouter;
  
})();
