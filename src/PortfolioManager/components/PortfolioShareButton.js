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
  Link2 as Link
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';

const PortfolioShareButton = ({ entry, familyId, onUpdate, buttonSize = "sm", buttonVariant = "outline" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Current saved state from database
  const [savedIsPublic, setSavedIsPublic] = useState(entry?.sharingSettings?.isPublic === true);
  const [savedExpiresAt, setSavedExpiresAt] = useState(entry?.sharingSettings?.expiresAt || null);

  // Local UI state for unsaved changes
  const [localIsPublic, setLocalIsPublic] = useState(entry?.sharingSettings?.isPublic === true);
  const [localExpiresAt, setLocalExpiresAt] = useState('');
  const [neverExpires, setNeverExpires] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (localIsPublic !== savedIsPublic) return true;
    if (localIsPublic && !neverExpires) {
      return localExpiresAt !== (savedExpiresAt ? format(new Date(savedExpiresAt), "yyyy-MM-dd'T'HH:mm") : '');
    }
    return false;
  };

  // Initialize expiration date from existing settings
  useEffect(() => {
    if (entry?.sharingSettings?.expiresAt) {
      const expDate = new Date(entry.sharingSettings.expiresAt);
      setLocalExpiresAt(format(expDate, "yyyy-MM-dd'T'HH:mm"));
      setSavedExpiresAt(entry.sharingSettings.expiresAt);
      setNeverExpires(false);
    }
    setSavedIsPublic(entry?.sharingSettings?.isPublic === true);
    setLocalIsPublic(entry?.sharingSettings?.isPublic === true);
  }, [entry]);

  // Use rtd-connect.com for production portfolio sharing
  const getDomain = () => {
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return window.location.origin;
    }
    return 'https://rtd-connect.com';
  };

  const shareUrl = `${getDomain()}/portfolio/${familyId}/${entry?.id}`;

  // Generate a new sharing link
  const handleGenerateLink = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const functions = getFunctions();
      const generateLink = httpsCallable(functions, 'generatePortfolioShareLink');

      // Calculate expiration date if needed
      let expirationDate = null;
      if (!neverExpires && localExpiresAt) {
        expirationDate = new Date(localExpiresAt).toISOString();
      }

      const result = await generateLink({
        familyId,
        entryId: entry.id,
        expiresAt: expirationDate
      });

      if (result.data.success) {
        setSavedIsPublic(true);
        setSavedExpiresAt(expirationDate);
        setLocalIsPublic(true);
        setSuccessMessage('Share link generated successfully!');

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            ...entry,
            sharingSettings: result.data.sharingSettings
          });
        }
      } else {
        setError('Failed to generate share link');
      }
    } catch (err) {
      console.error('Error generating share link:', err);
      setError(err.message || 'Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing share link with new expiry
  const handleUpdateLink = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const functions = getFunctions();
      const updateLink = httpsCallable(functions, 'updatePortfolioShareLink');

      // Calculate expiration date if needed
      let expirationDate = null;
      if (!neverExpires && localExpiresAt) {
        expirationDate = new Date(localExpiresAt).toISOString();
      }

      const result = await updateLink({
        familyId,
        entryId: entry.id,
        expiresAt: expirationDate
      });

      if (result.data.success) {
        setSavedExpiresAt(expirationDate);
        setSuccessMessage('Share link updated successfully!');

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            ...entry,
            sharingSettings: result.data.sharingSettings
          });
        }
      } else {
        setError('Failed to update share link');
      }
    } catch (err) {
      console.error('Error updating share link:', err);
      setError(err.message || 'Failed to update share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Revoke sharing link
  const handleRevokeLink = async () => {
    if (!window.confirm('Are you sure you want to revoke this share link? Anyone with the link will no longer be able to access this entry.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const functions = getFunctions();
      const revokeLink = httpsCallable(functions, 'revokePortfolioShareLink');

      const result = await revokeLink({
        familyId,
        entryId: entry.id
      });

      if (result.data.success) {
        setSavedIsPublic(false);
        setSavedExpiresAt(null);
        setLocalIsPublic(false);
        setLocalExpiresAt('');
        setNeverExpires(true);
        setSuccessMessage('Share link revoked successfully.');

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            ...entry,
            sharingSettings: result.data.sharingSettings
          });
        }
      } else {
        setError('Failed to revoke share link');
      }
    } catch (err) {
      console.error('Error revoking share link:', err);
      setError(err.message || 'Failed to revoke share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!savedIsPublic) {
      setError('Please generate a share link first');
      return;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if sharing has expired
  const isExpired = () => {
    if (!savedExpiresAt) return false;
    return new Date(savedExpiresAt) < new Date();
  };

  // Format expiration date for display
  const formatExpirationDate = () => {
    if (!savedExpiresAt) return 'Never';
    const expDate = new Date(savedExpiresAt);
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
          {savedIsPublic && !isExpired() ? (
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
            {savedIsPublic && !isExpired() ? (
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
          {/* Success Message */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status */}
          {isExpired() && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                This sharing link expired on {formatExpirationDate()}.
                Generate a new link to re-enable sharing.
              </AlertDescription>
            </Alert>
          )}

          {/* Sharing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {localIsPublic ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {localIsPublic ? 'Enable public sharing' : 'Keep entry private'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {localIsPublic
                  ? 'Generate a link to share this entry publicly'
                  : 'This entry remains private to your family account'
                }
              </p>
            </div>
            <Switch
              checked={localIsPublic}
              onCheckedChange={setLocalIsPublic}
              disabled={loading}
            />
          </div>

          {/* Expiration Settings */}
          {localIsPublic && (
            <div className="space-y-3">
              <Label>Link Expiration</Label>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="never-expires"
                  checked={neverExpires}
                  onChange={(e) => setNeverExpires(e.target.checked)}
                  className="rounded border-gray-300"
                  disabled={loading}
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
                    value={localExpiresAt}
                    onChange={(e) => setLocalExpiresAt(e.target.value)}
                    min={getMinDateTime()}
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!savedIsPublic && localIsPublic && (
              <Button
                onClick={handleGenerateLink}
                disabled={loading || (!neverExpires && !localExpiresAt)}
                className="flex-1 gap-2"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    Generate Share Link
                  </>
                )}
              </Button>
            )}

            {savedIsPublic && localIsPublic && hasUnsavedChanges() && (
              <Button
                onClick={handleUpdateLink}
                disabled={loading || (!neverExpires && !localExpiresAt)}
                className="flex-1 gap-2"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    Update Share Link
                  </>
                )}
              </Button>
            )}

            {savedIsPublic && !localIsPublic && (
              <Button
                onClick={handleRevokeLink}
                disabled={loading}
                className="flex-1 gap-2"
                variant="destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Revoke Share Link
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Security Notice */}
          {localIsPublic && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> When public sharing is enabled:
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Anyone with the link can view this entry</li>
                  <li>The entry content and attachments will be accessible</li>
                  <li>Student name may be visible if included in the content</li>
                  {!neverExpires && localExpiresAt && (
                    <li>Link will expire: {format(new Date(localExpiresAt), 'MMM dd, yyyy h:mm a')}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Share Link (only show when saved as public and not expired) */}
          {savedIsPublic && !isExpired() && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Active Share Link
                {savedExpiresAt && (
                  <span className="text-xs text-gray-500">
                    (expires {formatExpirationDate()})
                  </span>
                )}
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
            <span>
              {hasUnsavedChanges()
                ? 'Unsaved changes - click action button to apply'
                : savedIsPublic
                ? 'Share link is active'
                : 'Entry is private'}
            </span>
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