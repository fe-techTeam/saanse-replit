import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [authProcessed, setAuthProcessed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();

  const token = searchParams.get('token');
  const userParam = searchParams.get('user');

  useEffect(() => {
    const processAuth = async () => {
      try {
        if (!token || !userParam) {
          throw new Error('Missing authentication data');
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Store authentication data in the format expected by useAuth
        const authData = {
          access_token: token,
          refresh_token: token, // Use same token as refresh token for mobile auth
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          user: {
            id: userData.supabase_uid, // Use supabase_uid as the main ID
            email: userData.email,
            name: userData.display_name,
            avatar: userData.photo_url,
          }
        };

        // Use the same encryption as useAuth
        const encryptData = (data: string): string => {
          const key = 'SAANSE_2024_SECURE';
          return btoa(data.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
          ).join(''));
        };

        const encryptedData = encryptData(JSON.stringify(authData));
        
        // Safari-compatible storage with fallback
        try {
          localStorage.setItem('saanse_auth', encryptedData);
        } catch (error) {
          console.warn('localStorage not available, using sessionStorage:', error);
          sessionStorage.setItem('saanse_auth', encryptedData);
        }

        // Don't dispatch storage events to prevent auth loops in Safari
        // The auth hook will detect the stored data on its own

        // Show success message
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.name || userData.displayName || 'User'}!`,
        });

        console.log('Auth data stored successfully, marking as processed');
        // Mark auth as processed
        setAuthProcessed(true);

      } catch (error) {
        console.error('Auth processing error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to process authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/mobile-login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process auth once
    if (authProcessed) {
      return;
    }

    processAuth();
  }, [token, userParam, navigate, toast, authProcessed, isProcessing]);

  // Handle redirect after authentication is confirmed
  useEffect(() => {
    if (authProcessed && !loading && isAuthenticated && !redirecting) {
      console.log('Auth confirmed, starting redirect...');
      setRedirecting(true);
      
      // Wait a moment for the auth state to fully propagate
      const redirectTimer = setTimeout(() => {
        console.log('Redirecting to home page...');
        navigate('/', { replace: true });  // Use navigate instead of window.location
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [authProcessed, loading, isAuthenticated, redirecting, navigate]);

  // Fallback redirect after 8 seconds to prevent infinite loops
  useEffect(() => {
    if (authProcessed && !redirecting) {
      const fallbackTimer = setTimeout(() => {
        console.log('Fallback redirect triggered');
        setRedirecting(true);
        navigate('/', { replace: true });  // Use navigate instead of window.location
      }, 8000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [authProcessed, redirecting, navigate]);

  if (isProcessing || redirecting || (authProcessed && (loading || !isAuthenticated))) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-dharma-gold animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              {isProcessing ? "Processing Authentication" : redirecting ? "Redirecting..." : "Completing Login"}
            </h2>
            <p className="text-gray-400">
              {isProcessing ? "Please wait while we log you in..." : redirecting ? "Taking you to the dashboard..." : "Redirecting to dashboard..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Login Successful!</CardTitle>
          <CardDescription className="text-gray-400">
            You have been successfully authenticated via WhatsApp OTP
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-gray-300 mb-6">
            Redirecting you to your dashboard...
          </p>
          
          <Button
            onClick={() => {
              setRedirecting(true);
              navigate('/', { replace: true });
            }}
            className="bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark font-semibold"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
