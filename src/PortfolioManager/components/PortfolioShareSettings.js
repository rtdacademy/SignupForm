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
  Link,
  Settings,
  BookOpen
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';

const PortfolioShareSettings = ({ familyId, courseId, courseTitle, courseData, onUpdate, isOpen, onClose, studentName }) => {
  // Remove internal isOpen state, use props instead
  const [isPublic, setIsPublic] = useState(courseData?.sharingSettings?.isPublic === true);
  const [includeAllEntries, setIncludeAllEntries] = useState(
    courseData?.sharingSettings?.includeAllEntries === true
  );
  const [expiresAt, setExpiresAt] = useState('');
  const [neverExpires, setNeverExpires] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Initialize expiration date from existing settings
  useEffect(() => {
    if (courseData?.sharingSettings?.expiresAt) {
      const expDate = new Date(courseData.sharingSettings.expiresAt);
      setExpiresAt(format(expDate, "yyyy-MM-dd'T'HH:mm"));
      setNeverExpires(false);
    }
  }, [courseData]);

  // Use rtd-connect.com for production portfolio sharing
  const getDomain = () => {
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return window.location.origin;
    }
    return 'https://rtd-connect.com';
  };

  const shareUrl = `${getDomain()}/portfolio/${familyId}/course/${courseId}`;

  const handleCreateOrUpdateLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const updateSharing = httpsCallable(functions, 'updatePortfolioLevelSharing');

      // Calculate expiration date if needed
      let expirationDate = null;
      if (!neverExpires && expiresAt) {
        expirationDate = new Date(expiresAt).toISOString();
      }

      const result = await updateSharing({
        familyId,
        courseId,
        isPublic: true,
        includeAllEntries,
        expiresAt: expirationDate
      });

      if (result.data.success) {
        setIsPublic(true);

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            sharingSettings: result.data.sharingSettings
          });
        }
      } else {
        setError('Failed to update sharing settings');
      }
    } catch (err) {
      console.error('Error updating portfolio sharing settings:', err);
      setError(err.message || 'Failed to update sharing settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSharing = async () => {
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const updateSharing = httpsCallable(functions, 'updatePortfolioLevelSharing');

      const result = await updateSharing({
        familyId,
        courseId,
        isPublic: false,
        includeAllEntries: false,
        expiresAt: null
      });

      if (result.data.success) {
        setIsPublic(false);

        // Call parent update callback if provided
        if (onUpdate) {
          onUpdate({
            sharingSettings: result.data.sharingSettings
          });
        }
      } else {
        setError('Failed to remove sharing');
      }
    } catch (err) {
      console.error('Error removing portfolio sharing:', err);
      setError(err.message || 'Failed to remove sharing. Please try again.');
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
    if (!courseData?.sharingSettings?.expiresAt) return false;
    return new Date(courseData.sharingSettings.expiresAt) < new Date();
  };

  // Format expiration date for display
  const formatExpirationDate = () => {
    if (!courseData?.sharingSettings?.expiresAt) return 'Never';
    const expDate = new Date(courseData.sharingSettings.expiresAt);
    return format(expDate, 'MMM dd, yyyy h:mm a');
  };

  // Calculate minimum date (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublic && !isExpired() ? (
              <>
                <Globe className="w-5 h-5 text-green-600" />
                Course is Publicly Shared
              </>
            ) : isExpired() ? (
              <>
                <Clock className="w-5 h-5 text-orange-600" />
                Course Sharing Expired
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-gray-600" />
                Private Course
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage sharing settings for {studentName ? `${studentName}'s ` : ''}{courseTitle || 'this course'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          {isExpired() && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                This course sharing link expired on {formatExpirationDate()}.
                Enable sharing again to generate a new link.
              </AlertDescription>
            </Alert>
          )}

          {/* Portfolio Sharing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic && !isExpired() ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="font-medium">
                  {isPublic && !isExpired() ? 'Course is public' : 'Course is private'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {isPublic && !isExpired()
                  ? 'Anyone with the link can view this course'
                  : 'Only family members and staff can view'}
              </p>
            </div>
          </div>

          {/* Include All Entries Option (only when enabling sharing) */}
          {!isPublic && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="include-all"
                  checked={includeAllEntries}
                  onChange={(e) => setIncludeAllEntries(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1">
                  <Label htmlFor="include-all" className="font-medium cursor-pointer">
                    Include all course entries
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    When checked, all entries in this course will be visible.
                    Otherwise, only entries marked as public individually will be shown.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expiration Settings */}
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
                <strong>Important:</strong> When course sharing is enabled:
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Anyone with the link can view this course structure</li>
                  <li>Course title and content will be visible</li>
                  {courseData?.sharingSettings?.includeAllEntries ? (
                    <li>All course entries are accessible</li>
                  ) : (
                    <li>Only individually shared entries are accessible</li>
                  )}
                  {courseData?.sharingSettings?.expiresAt && (
                    <li>Link expires: {formatExpirationDate()}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Share Link */}
          {isPublic && !isExpired() && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Course Share Link
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
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                This link provides access to view this course
              </p>
            </div>
          )}

          {/* Action Button */}
          {!isPublic || isExpired() ? (
            <Button
              onClick={handleCreateOrUpdateLink}
              disabled={loading || (!neverExpires && !expiresAt)}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  {isExpired() ? 'Update Shareable Link' : 'Create Shareable Link'}
                </>
              )}
            </Button>
          ) : null}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>
              {isPublic ? 'Link is active' : 'Settings will be applied when creating link'}
            </span>
          </div>
          {courseData?.sharingSettings?.sharedAt && (
            <span>
              First shared: {new Date(courseData.sharingSettings.sharedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioShareSettings;