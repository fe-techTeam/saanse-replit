import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, ArrowLeft, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function TestOtpVerification() {
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [latestOtp, setLatestOtp] = useState("");
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const mobile = searchParams.get('mobile') || '';

  // Fetch the latest unused OTP from debug endpoint
  const fetchLatestOtp = async () => {
    setIsLoadingOtp(true);
    try {
      const data = await apiClient.get<{
        success: boolean;
        otp?: string;
        mobile?: string;
        used?: boolean;
        expired?: boolean;
        timeLeft?: number;
      }>('/auth/debug/latest-otp');
      
      if (data.success) {
        if (data.used) {
          toast({
            title: "OTP Already Used",
            description: `OTP ${data.otp} has been used. Generate a new OTP.`,
            variant: "destructive",
            duration: 5000,
          });
          setLatestOtp("");
        } else if (data.expired) {
          toast({
            title: "OTP Expired",
            description: `OTP ${data.otp} has expired. Generate a new OTP.`,
            variant: "destructive",
            duration: 5000,
          });
          setLatestOtp("");
        } else {
          setLatestOtp(data.otp);
          const minutesLeft = Math.floor(data.timeLeft / 60);
          const secondsLeft = data.timeLeft % 60;
          const timeDisplay = minutesLeft > 0 ? `${minutesLeft} minutes` : `${secondsLeft} seconds`;
          
          toast({
            title: "Fresh OTP Retrieved",
            description: `OTP: ${data.otp} (Valid for ${timeDisplay})`,
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Failed to get OTP",
          description: "Could not retrieve latest OTP from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching latest OTP:', error);
      toast({
        title: "Error",
        description: "Failed to fetch latest OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOtp(false);
    }
  };

  useEffect(() => {
    // Auto-fetch latest OTP when component mounts
    fetchLatestOtp();
  }, []);

  // Generate a new OTP
  const generateNewOtp = async () => {
    setIsLoadingOtp(true);
    try {
      const data = await apiClient.post<{
        success: boolean;
        message?: string;
        otpId?: string;
      }>('/auth/send-otp', {
        mobileNumber: mobile.length === 10 ? mobile : mobile.replace('91', ''),
      });

      if (data.success) {
        toast({
          title: "New OTP Generated",
          description: "A fresh OTP has been generated. Fetching it now...",
        });
        
        // Wait a moment then fetch the new OTP
        setTimeout(() => {
          fetchLatestOtp();
        }, 1000);
      } else {
        toast({
          title: "Failed to Generate OTP",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating new OTP:', error);
      toast({
        title: "Error",
        description: "Failed to generate new OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !mobile) {
      toast({
        title: "Missing Information",
        description: "Please enter OTP and ensure mobile number is provided.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Format mobile number to match database format (add country code 91)
      const formattedMobile = mobile.length === 10 ? `91${mobile}` : mobile;
      
      console.log('Verifying OTP:', { otp, mobile, formattedMobile });
      
      // Show success message immediately
      toast({
        title: "Verifying OTP...",
        description: "Please wait while we verify your OTP.",
      });
      
      // Navigate directly to the verification endpoint - let the browser handle the redirect
      const verificationUrl = apiClient.getUrl(`/auth/verify-otp?otp=${otp}&mobile=${encodeURIComponent(formattedMobile)}`);
      console.log('Navigating to:', verificationUrl);
      
      // Use window.location.href to navigate directly - this will handle the 302 redirect properly
      window.location.href = verificationUrl;
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/mobile-login')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mobile Login
        </Button>

        {/* Verification Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-dharma-gold rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-dharma-dark" />
            </div>
            <CardTitle className="text-2xl text-white">Verify OTP</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the OTP sent to your mobile number
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-2">Mobile Number:</p>
              <p className="text-dharma-gold font-semibold">+{mobile}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="otp" className="text-sm font-medium text-gray-300">
                  Enter OTP
                </label>
                <Button
                  onClick={fetchLatestOtp}
                  disabled={isLoadingOtp}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {isLoadingOtp ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-dharma-gold focus:ring-dharma-gold text-center text-2xl tracking-widest"
                maxLength={6}
              />
              {latestOtp ? (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Latest OTP from server:</p>
                  <Button
                    onClick={() => setOtp(latestOtp)}
                    variant="outline"
                    size="sm"
                    className="border-dharma-gold text-dharma-gold hover:bg-dharma-gold hover:text-dharma-dark"
                  >
                    Use OTP: {latestOtp}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">No valid OTP available</p>
                  <Button
                    onClick={generateNewOtp}
                    disabled={isLoadingOtp}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  >
                    Generate New OTP
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying || !otp || otp.length !== 6}
              className="w-full bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark font-semibold"
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                This is a test page. In production, you would receive the OTP via WhatsApp.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
