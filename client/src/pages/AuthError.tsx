import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const message = searchParams.get('message') || 'Authentication failed';

  useEffect(() => {
    // Show error toast
    toast({
      title: "Authentication Failed",
      description: message,
      variant: "destructive",
    });
  }, [message, toast]);

  const handleRetry = () => {
    navigate('/mobile-login', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Authentication Failed</CardTitle>
          <CardDescription className="text-gray-400">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-gray-300">
            <p className="mb-4">
              We couldn't verify your OTP. This could be due to:
            </p>
            <ul className="text-left text-sm space-y-2 text-gray-400">
              <li>• OTP has expired (valid for 10 minutes)</li>
              <li>• OTP has already been used</li>
              <li>• Invalid OTP code</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <button
                onClick={() => navigate('/contact')}
                className="text-dharma-gold hover:underline"
              >
                Contact Support
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
