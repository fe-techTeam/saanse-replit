import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import CategoryPage from "@/pages/CategoryPage";
import SeriesPage from "@/pages/SeriesPage";
import Library from "@/pages/Library";
import WatchList from "@/pages/WatchList";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MobileLogin from "@/pages/MobileLogin";
import AuthSuccess from "@/pages/AuthSuccess";
import AuthError from "@/pages/AuthError";
import TestOtpVerification from "@/pages/TestOtpVerification";
import AuthCallback from "@/pages/auth-callback";
import NotFound from "@/pages/not-found";
import AdminApp from "@/pages/admin/AdminApp";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-black text-white">
            <Toaster />
            <PWAInstallPrompt />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mobile-login" element={<MobileLogin />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/error" element={<AuthError />} />
              <Route path="/test-verify-otp" element={<TestOtpVerification />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/series/:id" element={<ProtectedRoute><SeriesPage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchList /></ProtectedRoute>} />
              
              {/* Admin routes (separate authentication) */}
              <Route path="/admin/*" element={<AdminApp />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;