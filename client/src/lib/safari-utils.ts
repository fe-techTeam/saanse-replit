/**
 * Safari-specific utilities to handle browser differences
 */

// Safari detection
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Chromium/.test(userAgent);
};

// Request debouncer for Safari
class SafariRequestDebouncer {
  private pendingRequests = new Map<string, NodeJS.Timeout>();
  private lastRequestTime = new Map<string, number>();
  private readonly DEBOUNCE_DELAY = 500; // 500ms debounce for Safari

  debounce<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear any pending request for this key
      const existingTimeout = this.pendingRequests.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Check if we need to throttle this request
      const now = Date.now();
      const lastRequest = this.lastRequestTime.get(key);
      
      if (lastRequest && (now - lastRequest) < this.DEBOUNCE_DELAY) {
        // If too soon, delay the request
        const timeout = setTimeout(async () => {
          try {
            this.lastRequestTime.set(key, Date.now());
            this.pendingRequests.delete(key);
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, this.DEBOUNCE_DELAY);
        
        this.pendingRequests.set(key, timeout);
      } else {
        // Execute immediately
        this.lastRequestTime.set(key, now);
        fn().then(resolve).catch(reject);
      }
    });
  }

  clear() {
    // Clear all pending timeouts
    this.pendingRequests.forEach(timeout => clearTimeout(timeout));
    this.pendingRequests.clear();
    this.lastRequestTime.clear();
  }
}

// Global debouncer instance
export const safariDebouncer = new SafariRequestDebouncer();

// Safari-specific React Query configuration
export const getSafariQueryConfig = () => {
  if (!isSafari()) return {};
  
  return {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 0, // No retries
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    notifyOnChangeProps: ['data', 'error'] as const,
    // Prevent rapid re-renders
    structuralSharing: false,
  };
};

// Safari-specific error handler
export const handleSafariError = (error: any) => {
  if (!isSafari()) return error;
  
  // In Safari, suppress throttling errors to prevent infinite loops
  if (error?.message?.includes('throttled')) {
    console.warn('Safari request throttled, using cached data');
    return null; // Return null to use cached data
  }
  
  return error;
};

// Clean up Safari resources
export const cleanupSafariResources = () => {
  if (isSafari()) {
    safariDebouncer.clear();
  }
};
