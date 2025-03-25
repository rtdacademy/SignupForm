import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

const typeColors = {
    lesson: 'text-blue-600 bg-blue-50 border-blue-200',
    assignment: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    exam: 'text-purple-600 bg-purple-50 border-purple-200',
    info: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  
  const LTIAssessmentLauncher = ({ 
    isOpen, 
    onOpenChange, 
    title,
    type = 'assignment',
    launchUrl
  }) => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      setError(null);
      setIsLoading(true);
    }, [launchUrl]);
  
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom"
          className="h-[100vh] p-0 flex flex-col bg-white inset-0"
          style={{
            width: '100vw',
            marginLeft: 0,
            marginRight: 0,
            maxWidth: '100vw',
            borderRadius: 0
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
            <div className={`px-3 py-2 rounded-lg ${typeColors[type]}`}>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
  
          {/* Content Container with Padding */}
          <div className="flex-1 relative p-6 bg-gray-50">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="text-gray-600">Loading assessment...</p>
                </div>
              </div>
            )}
  
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
                <iframe
                  src={launchUrl}
                  className="w-full h-full border-0"
                  allow="camera *; microphone *; fullscreen *"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('Failed to load assessment');
                    setIsLoading(false);
                  }}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  export default LTIAssessmentLauncher;