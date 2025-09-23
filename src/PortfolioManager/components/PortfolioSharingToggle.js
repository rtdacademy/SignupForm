import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import DevFileIndicator from './DevFileIndicator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Share2,
  Lock,
  Unlock,
  Copy,
  CheckCircle,
  AlertTriangle,
  Globe,
  Shield,
  Loader2
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const PortfolioSharingToggle = ({ entry, familyId, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(entry?.sharingSettings?.isPublic || false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const shareUrl = `${window.location.origin}/portfolio/${familyId}/${entry.id}`;

  const handleToggleSharing = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the Cloud Function to update sharing settings
      const functions = getFunctions();
      const updateSharing = httpsCallable(functions, 'updatePortfolioSharing');

      const result = await updateSharing({
        familyId,
        entryId: entry.id,
        isPublic: !isPublic
      });

      if (result.data.success) {
        setIsPublic(!isPublic);

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({ sharingSettings: result.data.sharingSettings });
        }
      } else {
        setError('Failed to update sharing settings');
      }
    } catch (err) {
      console.error('Error updating sharing settings:', err);
      setError(err.message || 'Failed to update sharing settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublic ? (
              <>
                <Globe className="w-5 h-5 text-green-600" />
                Public Sharing Enabled
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-gray-600" />
                Private Entry
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Control who can view this portfolio entry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sharing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {isPublic ? 'Anyone with link can view' : 'Only family members can view'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {isPublic
                  ? 'This entry is visible to anyone with the link'
                  : 'This entry is private to your family account'
                }
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggleSharing}
              disabled={loading}
            />
          </div>

          {/* Security Notice */}
          {isPublic && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> When public sharing is enabled:
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Anyone with the link can view this entry</li>
                  <li>The entry content and attachments will be accessible</li>
                  <li>Student name may be visible if included in the content</li>
                  <li>You can disable sharing at any time</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Share Link */}
          {isPublic && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  onClick={copyShareLink}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Changes are saved automatically</span>
          </div>
          {entry?.sharingSettings?.sharedAt && (
            <span>
              Shared on {new Date(entry.sharingSettings.sharedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <DevFileIndicator fileName="PortfolioSharingToggle.js" />
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioSharingToggle;