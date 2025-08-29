import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // For development/testing purposes, create a mock admin session
  useEffect(() => {
    const mockAdmin: AdminUser = {
      id: 'ef73e6f2-a2b5-4eea-b73b-a115370bbfa9',
      email: 'harshadmadaye@firsteconomy.com',
      displayName: 'Harshad Madaye',
      role: 'super_admin'
    };
    
    const mockToken = `admin-token-${mockAdmin.id}`;
    
    setAdmin(mockAdmin);
    setToken(mockToken);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login for development
    if (email === 'admin@saanse.app' && password === 'admin123') {
      const mockAdmin: AdminUser = {
        id: 'admin-1',
        email: 'admin@saanse.app',
        displayName: 'Admin User',
        role: 'admin'
      };
      
      const mockToken = `admin-token-${mockAdmin.id}`;
      
      setAdmin(mockAdmin);
      setToken(mockToken);
      return { success: true, admin: mockAdmin, token: mockToken };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!admin || !token) return {};
    
    return {
      'x-admin-id': admin.id,
      'x-admin-token': token
    };
  };

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    getAuthHeaders
  };
}
