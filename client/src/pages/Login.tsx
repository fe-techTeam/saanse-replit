import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Please enter email and password",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with:', { email });
      const success = await signIn(email, password);
      console.log('Sign in result:', success);
      
      if (success) {
        toast({
          title: "Welcome to MythosStream!",
          description: "Successfully signed in. Redirecting to home...",
        });
        // Navigation will be handled by the useEffect when isAuthenticated becomes true
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error?.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background with movie posters blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Netflix logo */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-red-600 text-3xl font-bold tracking-wide">MYTHOSSTREAM</h1>
      </div>
      
      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-black/75 backdrop-blur-sm rounded-md p-12">
          <h2 className="text-white text-3xl font-semibold mb-8">
            Sign In to MythosStream
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded focus:bg-gray-600 focus:border-white focus:ring-0"
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded focus:bg-gray-600 focus:border-white focus:ring-0"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-base transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center text-gray-400 text-sm">OR</div>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600 rounded"
              onClick={() => {
                // Google sign-in functionality can be added here
                toast({
                  title: "Google Sign-in",
                  description: "Google sign-in feature coming soon!",
                });
              }}
            >
              Use a sign-in code
            </Button>
          </form>
          
          <div className="mt-4">
            <a href="#" className="text-white hover:underline text-sm">
              Forgot password?
            </a>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              className="border-gray-400"
            />
            <label htmlFor="remember" className="text-white text-sm">
              Remember me
            </label>
          </div>
          
          <div className="mt-8 text-gray-400 text-sm">
            New to MythosStream?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-white hover:underline"
            >
              Sign up now.
            </button>
          </div>
          
          <div className="mt-8 text-gray-400 text-xs leading-relaxed">
            This page is protected by Google reCAPTCHA to ensure
            you're not a bot.{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Learn more.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}