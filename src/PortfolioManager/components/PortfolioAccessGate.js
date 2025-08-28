import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../components/ui/alert';
import {
  Lock,
  Unlock,
  Info,
  AlertCircle,
  Sparkles,
  BookOpen,
  Camera,
  FolderOpen,
  Users,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Construction,
  Rocket
} from 'lucide-react';

const PortfolioAccessGate = ({ 
  onAccessGranted, 
  studentName = "Student",
  isStaff = false 
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check if already has access from localStorage
  useEffect(() => {
    const storedAccess = localStorage.getItem('portfolioAccess');
    const accessExpiry = localStorage.getItem('portfolioAccessExpiry');
    
    if (storedAccess === 'granted' && accessExpiry) {
      const expiryDate = new Date(accessExpiry);
      const now = new Date();
      
      // Check if access hasn't expired (24 hours)
      if (expiryDate > now) {
        setHasAccess(true);
        onAccessGranted();
      } else {
        // Clear expired access
        localStorage.removeItem('portfolioAccess');
        localStorage.removeItem('portfolioAccessExpiry');
      }
    }
  }, [onAccessGranted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    // Simulate unlock animation
    setTimeout(() => {
      if (password.toLowerCase() === 'connect') {
        // Grant access
        setHasAccess(true);
        
        // Store access in localStorage with 24 hour expiry
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);
        localStorage.setItem('portfolioAccess', 'granted');
        localStorage.setItem('portfolioAccessExpiry', expiryDate.toISOString());
        
        // Notify parent component after animation
        setTimeout(() => {
          onAccessGranted();
        }, 500);
      } else {
        setError('Incorrect password. Please try again.');
        setIsUnlocking(false);
      }
    }, 1000);
  };

  // If already has access, don't show gate
  if (hasAccess) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Access Granted</p>
          <p className="text-sm text-gray-500 mt-1">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-2 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Portfolio Preview
          </h1>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 gap-1 mt-1">
            <Construction className="w-3 h-3" />
            Coming Soon
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <div className="p-5">
            {/* Coming Soon Notice */}
            <Alert className="mb-3 border-purple-200 bg-purple-50 py-2">
              <Rocket className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-700 text-xs">
                Portfolio Manager coming soon! Preview available below.
              </AlertDescription>
            </Alert>

            {/* Quick Features - Compact */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              <div className="text-center">
                <Camera className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600 block">Upload</span>
              </div>
              <div className="text-center">
                <FolderOpen className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600 block">Organize</span>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600 block">Comment</span>
              </div>
              <div className="text-center">
                <CheckCircle className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600 block">Track</span>
              </div>
            </div>

            {/* Password Form */}
            <div className="border-t pt-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Preview Password
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Contact your facilitator for access
                  </p>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="pr-10"
                      disabled={isUnlocking}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      disabled={isUnlocking}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-9 text-sm"
                  disabled={!password || isUnlocking}
                >
                  {isUnlocking ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2 animate-pulse" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Access Preview
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Info for Parents - Compact */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">Parents:</p>
                  <p>Continue using your current method while we finalize this feature.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-3">
          Full version launching soon
        </p>
      </div>
    </div>
  );
};

export default PortfolioAccessGate;