import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function MobileLogin() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobileNumber(formatted);
  };

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber.replace(/\D/g, ''), // Send only digits
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Sent Successfully!",
          description: "Check your WhatsApp for the verification link. Click the link to complete login.",
          duration: 5000,
        });
        
        // Show success message - user should check WhatsApp for verification link
        // No navigation needed as verification happens via WhatsApp link
        
        // For testing purposes, show a test verification link
        setTimeout(() => {
          toast({
            title: "Test Mode",
            description: "WhatsApp API not configured. Click here to test verification manually.",
            action: (
              <button
                onClick={() => navigate(`/test-verify-otp?mobile=${encodeURIComponent(mobileNumber.replace(/\D/g, ''))}`)}
                className="text-dharma-gold hover:underline font-semibold"
              >
                Test Verification
              </button>
            ),
            duration: 10000,
          });
        }, 2000);
      } else {
        toast({
          title: "Failed to Send OTP",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Login Card */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-dharma-gold rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-dharma-dark" />
            </div>
            <CardTitle className="text-2xl text-white">Login with Mobile</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your mobile number to receive OTP via WhatsApp
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-sm font-medium text-gray-300">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  +91
                </span>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="999-999-9999"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  className="pl-12 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-dharma-gold focus:ring-dharma-gold"
                  maxLength={12} // XXX-XXX-XXXX format
                />
              </div>
              <p className="text-xs text-gray-500">
                We'll send you a verification code via WhatsApp
              </p>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={isLoading || !mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10}
              className="w-full bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Send OTP via WhatsApp
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have WhatsApp?{" "}
                <button
                  onClick={() => navigate('/login')}
                  className="text-dharma-gold hover:underline"
                >
                  Use Email Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Why WhatsApp OTP?</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-dharma-gold rounded-full"></div>
              <span>Instant delivery to your WhatsApp</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-dharma-gold rounded-full"></div>
              <span>No need to remember passwords</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-dharma-gold rounded-full"></div>
              <span>Secure one-time verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
