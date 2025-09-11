import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        localStorage.setItem('saanse_auth', encryptedData);

        // Show success message
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${userData.name || userData.displayName || 'User'}!`,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);

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

    processAuth();
  }, [token, userParam, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-dharma-gold animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Processing Authentication</h2>
            <p className="text-gray-400">Please wait while we log you in...</p>
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
            onClick={() => navigate('/')}
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
