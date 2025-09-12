import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeaders } from "./jwt";

// Safari detection utility
const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Chromium/.test(userAgent);
};

// Request throttling for Safari
const requestThrottleMap = new Map<string, number>();
const SAFARI_THROTTLE_DELAY = 1000; // 1 second minimum between same requests in Safari

const shouldThrottleRequest = (queryKey: string): boolean => {
  if (!isSafari()) return false;
  
  const now = Date.now();
  const lastRequest = requestThrottleMap.get(queryKey);
  
  if (lastRequest && (now - lastRequest) < SAFARI_THROTTLE_DELAY) {
    console.log(`Throttling request for Safari: ${queryKey}`);
    return true;
  }
  
  requestThrottleMap.set(queryKey, now);
  return false;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  adminHeaders?: Record<string, string>,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add JWT auth headers for user requests
  if (!adminHeaders) {
    Object.assign(headers, getAuthHeaders());
  }
  
  if (adminHeaders) {
    Object.assign(headers, adminHeaders);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const queryKeyString = queryKey.join("/");
    
    // Safari-specific throttling
    if (shouldThrottleRequest(queryKeyString)) {
      // Return cached data or throw to prevent request
      throw new Error("Request throttled for Safari");
    }
    
    const headers = getAuthHeaders();
    const res = await fetch(queryKeyString, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // Safari-specific configuration
      staleTime: isSafari() ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2 minutes for Safari, 5 for others
      cacheTime: isSafari() ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5 minutes for Safari, 10 for others
      retry: isSafari() ? 0 : 1, // No retries in Safari
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Safari-specific error handling
      useErrorBoundary: false,
      suspense: false,
    },
    mutations: {
      retry: isSafari() ? 0 : 1, // No retries in Safari for mutations
    },
  },
});
