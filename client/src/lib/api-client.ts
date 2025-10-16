/**
 * Centralized API Client
 * This file provides a consistent way to make API calls with proper error handling
 */

// Get the current origin dynamically for API calls
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or build time
  return import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
}

// Helper function to get API URL with endpoint
function getApiUrl(endpoint: string = ''): string {
  const apiBase = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiBase}/api${cleanEndpoint}`;
}

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Remove /api prefix if it exists in endpoint since getApiUrl adds it
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
    const url = getApiUrl(cleanEndpoint);
    
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, options: ApiOptions = {}): Promise<T> {
    const { params, headers: optionHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    // Merge headers with Content-Type taking precedence
    const headers = {
      ...optionHeaders,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options: ApiOptions = {}): Promise<T> {
    const { params, headers: optionHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    // Merge headers with Content-Type taking precedence
    const headers = {
      ...optionHeaders,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any, options: ApiOptions = {}): Promise<T> {
    const { params, headers: optionHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const headers = {
      ...optionHeaders,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...fetchOptions,
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      const error: any = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  // Helper method to get the full API URL for a given endpoint
  getUrl(endpoint: string): string {
    return getApiUrl(endpoint);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };

// Helper function for authenticated requests
export function getAuthHeaders(): Record<string, string> {
  // This will be used by hooks that need authentication
  // The actual implementation depends on your auth system
  const token = localStorage.getItem('auth_token') || localStorage.getItem('supabase.auth.token');
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return {};
}
