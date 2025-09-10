import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = admin !== null && token !== null;

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const savedAdminId = localStorage.getItem('adminId');
        const savedToken = localStorage.getItem('adminToken');

        if (savedAdminId && savedToken) {
          // Verify token with backend
          const response = await fetch('/api/admin/profile', {
            headers: {
              'x-admin-id': savedAdminId,
              'x-admin-token': savedToken
            }
          });

          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
            setToken(savedToken);
          } else {
            // Invalid credentials, clear them
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        setToken(data.token);
        localStorage.setItem('adminId', data.admin.id);
        localStorage.setItem('adminToken', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminToken');
  };

  const getAuthHeaders = () => {
    if (!admin || !token) return {};
    return {
      'x-admin-id': admin.id,
      'x-admin-token': token
    };
  };

  const value: AdminAuthContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}