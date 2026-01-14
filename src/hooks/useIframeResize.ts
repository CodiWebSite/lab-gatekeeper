import { useEffect, useCallback } from 'react';

/**
 * Hook to handle iframe auto-height for WordPress embedding
 * Sends resize messages to parent window when content height changes
 */
export function useIframeResize() {
  const sendHeight = useCallback(() => {
    if (window.parent !== window) {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        { type: 'icmpp-resize', height },
        '*'
      );
    }
  }, []);

  useEffect(() => {
    // Initial height send
    sendHeight();

    // Send height on resize
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(document.body);

    // Listen for height requests from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'icmpp-request-height') {
        sendHeight();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('resize', sendHeight);

    // Send height on route changes (for SPA navigation)
    const mutationObserver = new MutationObserver(() => {
      setTimeout(sendHeight, 100);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', sendHeight);
    };
  }, [sendHeight]);

  return { sendHeight };
}
