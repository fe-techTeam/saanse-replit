import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('password');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signUp(email, password);
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account, then sign in.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background with movie posters */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6">
        <h1 className="text-red-600 text-3xl font-bold tracking-wide">MYTHOSSTREAM</h1>
        <div className="flex items-center space-x-4">
          <select className="bg-transparent border border-gray-500 text-white px-3 py-1 rounded text-sm">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <Button
            onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm rounded"
          >
            Sign In
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          {step === 'email' ? (
            <>
              {/* Email Step */}
              <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
                Unlimited devotional content, stories and more
              </h1>
              <p className="text-white text-xl md:text-2xl mb-6">
                Starts at ₹149. Cancel at any time.
              </p>
              <p className="text-white text-lg mb-8">
                Ready to watch? Enter your email to create or restart your membership.
              </p>
              
              <form onSubmit={handleEmailSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 bg-white/10 backdrop-blur-sm border-gray-500 text-white placeholder-gray-300 rounded-sm focus:bg-white/20 focus:border-white"
                  required
                />
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 h-14 rounded-sm text-lg md:text-xl flex items-center gap-2"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Password Step */}
              <div className="bg-black/75 backdrop-blur-sm rounded-md p-8 max-w-md mx-auto">
                <h2 className="text-white text-3xl font-semibold mb-6">
                  Create your account
                </h2>
                <p className="text-gray-400 mb-6">
                  Just a few more steps and you're finished!
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  MythosStream is personalized for you.
                </p>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full h-12 bg-gray-700 border-gray-600 text-white rounded focus:bg-gray-600 focus:border-white focus:ring-0"
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Add a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded focus:bg-gray-600 focus:border-white focus:ring-0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded focus:bg-gray-600 focus:border-white focus:ring-0"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-base transition-colors mt-6"
                  >
                    {isLoading ? 'Creating Account...' : 'Start Membership'}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Use a different email
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
            </>
          )}
        </div>
      </div>
      
      {step === 'email' && (
        <>
          {/* Trending Now Section */}
          <div className="relative z-10 bg-gray-900 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-white text-2xl font-semibold mb-8">Trending Now</h2>
              <div className="flex space-x-4 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative flex-shrink-0 w-32 h-48">
                    <div className="bg-gray-700 rounded w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-orange-500">{i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* More reasons to join Section */}
          <div className="relative z-10 bg-black py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-white text-2xl font-semibold mb-8">More reasons to join</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-b from-purple-900 to-purple-700 p-6 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Enjoy on your TV</h3>
                  <p className="text-gray-300 text-sm">Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, and more.</p>
                </div>
                <div className="bg-gradient-to-b from-blue-900 to-blue-700 p-6 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Download your shows to watch offline</h3>
                  <p className="text-gray-300 text-sm">Save your favorites easily and always have something to watch.</p>
                </div>
                <div className="bg-gradient-to-b from-red-900 to-red-700 p-6 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Watch everywhere</h3>
                  <p className="text-gray-300 text-sm">Stream unlimited devotional content on your phone, tablet, laptop, and TV.</p>
                </div>
                <div className="bg-gradient-to-b from-pink-900 to-pink-700 p-6 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Create profiles for kids</h3>
                  <p className="text-gray-300 text-sm">Send kids on adventures with their favorite characters in a safe space.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="relative z-10 bg-black py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-white text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  "What is MythosStream?",
                  "How much does MythosStream cost?",
                  "Where can I watch?",
                  "How do I cancel?",
                  "What can I watch on MythosStream?",
                  "Is MythosStream good for kids?"
                ].map((question, index) => (
                  <div key={index} className="bg-gray-800 p-6 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-lg">{question}</span>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom CTA */}
              <div className="text-center mt-16">
                <p className="text-white text-lg mb-6">
                  Ready to watch? Enter your email to create or restart your membership.
                </p>
                <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="flex-1 h-12 bg-white/10 backdrop-blur-sm border-gray-500 text-white placeholder-gray-300 rounded-sm"
                  />
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 h-12 rounded-sm">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}