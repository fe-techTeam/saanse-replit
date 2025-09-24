// JWT token management utilities

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
}

export const setAuthToken = (token: AuthToken) => {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    localStorage.setItem(USER_KEY, JSON.stringify(token.user));
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

export const getAuthToken = (): AuthToken | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const getAuthUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error retrieving auth user:', error);
    return null;
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export const isTokenExpired = (token: AuthToken): boolean => {
  if (!token.expires_at) return false;
  return Date.now() >= token.expires_at * 1000;
};

export const getBearerToken = (): string | null => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return `${token.token_type} ${token.access_token}`;
};

// Create authorization headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const bearerToken = getBearerToken();
  return bearerToken ? { 'Authorization': bearerToken, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};