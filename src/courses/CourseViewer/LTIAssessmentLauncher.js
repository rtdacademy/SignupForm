import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { X, AlertCircle, BookOpen, FileText, ClipboardCheck, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

const typeColors = {
  lesson: 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
  assignment: 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
  exam: 'text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
  info: 'text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
};

const typeIcons = {
  lesson: <BookOpen className="h-5 w-5" />,
  assignment: <ClipboardCheck className="h-5 w-5" />,
  exam: <FileText className="h-5 w-5" />,
  info: <Lightbulb className="h-5 w-5" />,
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

  const getTypeIcon = () => {
    return typeIcons[type] || <Lightbulb className="h-5 w-5" />;
  };

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
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md z-10">
          <div className={`px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white shadow-sm flex items-center gap-2`}>
            {getTypeIcon()}
            <h2 className="text-lg font-semibold truncate max-w-md">{title}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Container with Padding */}
        <div className="flex-1 relative p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-xl shadow-xl border border-blue-100">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                <p className="text-blue-700 font-medium">Loading assessment...</p>
              </div>
            </div>
          )}

          {error ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
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