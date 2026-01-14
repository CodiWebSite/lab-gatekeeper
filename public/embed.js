/**
 * ICMPP Laboratories - Auto-height iframe script for WordPress
 * 
 * Usage in WordPress:
 * 1. Add iframe with id="icmpp-labs"
 * 2. Include this script after the iframe
 * 
 * Example:
 * <iframe 
 *   id="icmpp-labs" 
 *   src="https://lab-gatekeeper.lovable.app/labs?view=list" 
 *   width="100%" 
 *   frameborder="0"
 *   style="border: none; min-height: 600px;">
 * </iframe>
 * <script src="https://lab-gatekeeper.lovable.app/embed.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const IFRAME_ID = 'icmpp-labs';
  const MIN_HEIGHT = 600;
  const RESIZE_DEBOUNCE = 100;

  // Find the iframe
  const iframe = document.getElementById(IFRAME_ID);
  if (!iframe) {
    console.warn('ICMPP Labs: iframe with id="' + IFRAME_ID + '" not found');
    return;
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle resize messages from iframe
  function handleMessage(event) {
    // Verify origin (adjust for your production URL)
    const allowedOrigins = [
      'https://lab-gatekeeper.lovable.app',
      'https://id-preview--338bf5c8-aab9-4044-bce6-4523e034e1a6.lovable.app',
      window.location.origin
    ];

    if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').split('.')[0]))) {
      return;
    }

    // Check for height message
    if (event.data && event.data.type === 'icmpp-resize' && event.data.height) {
      const newHeight = Math.max(event.data.height, MIN_HEIGHT);
      iframe.style.height = newHeight + 'px';
    }
  }

  // Listen for messages
  window.addEventListener('message', handleMessage, false);

  // Fallback: Set initial height based on viewport
  iframe.style.height = Math.max(window.innerHeight * 0.8, MIN_HEIGHT) + 'px';

  // Handle iframe load
  iframe.addEventListener('load', function() {
    // Request height from iframe content
    try {
      iframe.contentWindow.postMessage({ type: 'icmpp-request-height' }, '*');
    } catch (e) {
      // Cross-origin, use fallback height
    }
  });

  console.log('ICMPP Labs embed script initialized');
})();
