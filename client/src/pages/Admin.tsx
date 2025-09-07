import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout";
import VideoManager from "../components/admin/VideoManager";
import UserManager from "../components/admin/UserManager";
import Analytics from "../components/admin/Analytics";
import Settings from "../components/admin/Settings";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminId = localStorage.getItem('adminId');
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminId && adminToken) {
      // Verify token with backend
      fetch('/api/admin/profile', {
        headers: {
          'x-admin-id': adminId,
          'x-admin-token': adminToken
        }
      })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          return res.json();
        } else {
          // Clear invalid credentials
          localStorage.removeItem('adminId');
          localStorage.removeItem('adminToken');
          throw new Error('Invalid credentials');
        }
      })
      .then(data => {
        setAdminData(data.admin);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
    }
  }, []);

  const handleLogin = (admin: any, token: string) => {
    localStorage.setItem('adminId', admin.id);
    localStorage.setItem('adminToken', token);
    setAdminData(admin);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminToken');
    setAdminData(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout admin={adminData} onLogout={handleLogout}>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/videos" component={() => <VideoManager />} />
        <Route path="/admin/series" component={() => <div>Series Management</div>} />
        <Route path="/admin/users" component={() => <UserManager />} />
        <Route path="/admin/admins" component={() => <div>Admins Management</div>} />
        <Route path="/admin/analytics" component={() => <Analytics />} />
        <Route path="/admin/settings" component={() => <Settings />} />
        <Route component={() => <div>404 - Admin Page Not Found</div>} />
      </Switch>
    </AdminLayout>
  );
}
