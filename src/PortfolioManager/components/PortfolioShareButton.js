import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
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
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  Share2,
  Lock,
  Unlock,
  Copy,
  CheckCircle,
  AlertTriangle,
  Globe,
  Shield,
  Loader2,
  Calendar,
  Clock,
  Link
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';

const PortfolioShareButton = ({ entry, familyId, onUpdate, buttonSize = "sm", buttonVariant = "outline" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(entry?.sharingSettings?.isPublic === true);
  const [expiresAt, setExpiresAt] = useState('');
  const [neverExpires, setNeverExpires] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Initialize expiration date from existing settings
  useEffect(() => {
    if (entry?.sharingSettings?.expiresAt) {
      const expDate = new Date(entry.sharingSettings.expiresAt);
      setExpiresAt(format(expDate, "yyyy-MM-dd'T'HH:mm"));
      setNeverExpires(false);
    }
  }, [entry]);

  // Use rtd-connect.com for production portfolio sharing
  const getDomain = () => {
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return window.location.origin;
    }
    return 'https://rtd-connect.com';
  };

  const shareUrl = `${getDomain()}/portfolio/${familyId}/${entry?.id}`;

  const handleToggleSharing = async () => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const updateSharing = httpsCallable(functions, 'updatePortfolioSharing');

      // Calculate expiration date if needed
      let expirationDate = null;
      if (!isPublic && !neverExpires && expiresAt) {
        expirationDate = new Date(expiresAt).toISOString();
      }

      const result = await updateSharing({
        familyId,
        entryId: entry.id,
        isPublic: !isPublic,
        expiresAt: !isPublic ? expirationDate : null
      });

      if (result.data.success) {
        setIsPublic(!isPublic);

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            ...entry,
            sharingSettings: result.data.sharingSettings
          });
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
    if (!isPublic) {
      setError('Please enable public sharing first');
      return;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if sharing has expired
  const isExpired = () => {
    if (!entry?.sharingSettings?.expiresAt) return false;
    return new Date(entry.sharingSettings.expiresAt) < new Date();
  };

  // Format expiration date for display
  const formatExpirationDate = () => {
    if (!entry?.sharingSettings?.expiresAt) return 'Never';
    const expDate = new Date(entry.sharingSettings.expiresAt);
    return format(expDate, 'MMM dd, yyyy h:mm a');
  };

  // Calculate minimum date (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute from now
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className="gap-2">
          {isPublic && !isExpired() ? (
            <>
              <Globe className="w-4 h-4 text-green-600" />
              <span>Shared</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublic && !isExpired() ? (
              <>
                <Globe className="w-5 h-5 text-green-600" />
                Public Sharing Enabled
              </>
            ) : isExpired() ? (
              <>
                <Clock className="w-5 h-5 text-orange-600" />
                Sharing Link Expired
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-gray-600" />
                Private Entry
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage sharing settings for "{entry?.title || 'this entry'}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          {isExpired() && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                This sharing link expired on {formatExpirationDate()}.
                Enable sharing again to generate a new link.
              </AlertDescription>
            </Alert>
          )}

          {/* Sharing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic && !isExpired() ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {isPublic && !isExpired() ? 'Anyone with link can view' : 'Only family members can view'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {isPublic && !isExpired()
                  ? 'This entry is visible to anyone with the link'
                  : 'This entry is private to your family account'
                }
              </p>
            </div>
            <Switch
              checked={isPublic && !isExpired()}
              onCheckedChange={handleToggleSharing}
              disabled={loading}
            />
          </div>

          {/* Expiration Settings (only when enabling sharing) */}
          {!isPublic && (
            <div className="space-y-3">
              <Label>Link Expiration</Label>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="never-expires"
                  checked={neverExpires}
                  onChange={(e) => setNeverExpires(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="never-expires" className="font-normal cursor-pointer">
                  Never expires
                </Label>
              </div>

              {!neverExpires && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={getMinDateTime()}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          {isPublic && !isExpired() && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> When public sharing is enabled:
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Anyone with the link can view this entry</li>
                  <li>The entry content and attachments will be accessible</li>
                  <li>Student name may be visible if included in the content</li>
                  {entry?.sharingSettings?.expiresAt && (
                    <li>Link expires: {formatExpirationDate()}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Share Link (only show when public and not expired) */}
          {isPublic && !isExpired() && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Share Link
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
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
              First shared: {new Date(entry.sharingSettings.sharedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioShareButton;