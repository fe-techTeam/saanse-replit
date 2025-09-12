import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./AdminAuthProvider";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminVideos from "./AdminVideos";
import AdminSeriesList from "./AdminSeriesList";
import AdminSeriesDetail from "./AdminSeriesDetail";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Login route - accessible without authentication */}
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Protected admin routes */}
          <Route path="/*" element={
            <AdminAuthGuard>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/videos" element={<AdminVideos />} />
                  <Route path="/series" element={<AdminSeriesList />} />
                  <Route path="/series/:id" element={<AdminSeriesDetail />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/analytics" element={<AdminAnalytics />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  <Route path="*" element={<div className="p-8 text-center text-gray-500">Admin page not found</div>} />
                </Routes>
              </AdminLayout>
            </AdminAuthGuard>
          } />
        </Routes>
      </div>
    </AdminAuthProvider>
  );
}