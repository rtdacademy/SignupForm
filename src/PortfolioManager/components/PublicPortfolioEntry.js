import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Calendar,
  FileText,
  Image,
  Video,
  Tag,
  User,
  School,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  Share2
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

const PublicPortfolioEntry = () => {
  const { familyId, entryId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Debug logging
  console.log('PublicPortfolioEntry loaded with:', { familyId, entryId });

  useEffect(() => {
    const loadPortfolioEntry = async () => {
      if (!familyId || !entryId) {
        setError('Invalid portfolio link');
        setLoading(false);
        return;
      }

      try {
        // Use the Cloud Function to fetch the public portfolio entry
        const functions = getFunctions();
        const getPublicEntry = httpsCallable(functions, 'getPublicPortfolioEntry');

        const result = await getPublicEntry({ familyId, entryId });

        if (!result.data.success) {
          setError(result.data.error || 'Failed to load portfolio entry');
          setLoading(false);
          return;
        }

        // Set the entry data with signed URLs from the function
        setEntry(result.data.entry);

        // Set student info if available
        if (result.data.studentInfo) {
          setStudent(result.data.studentInfo);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading portfolio entry:', err);
        setError(err.message || 'Failed to load portfolio entry');
        setLoading(false);
      }
    };

    loadPortfolioEntry();
  }, [familyId, entryId]);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get entry type icon
  const getTypeIcon = () => {
    switch (entry?.type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'unified':
      case 'text':
      case 'combined':
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Render HTML content with Quill styles
  const renderHTMLContent = (content) => {
    if (!content) return null;

    return (
      <div className="ql-snow">
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            padding: '12px 15px',
            minHeight: 'auto',
            fontSize: '16px',
            lineHeight: '1.6'
          }}
        />
      </div>
    );
  };

  // Copy share link
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Count total tags
  const getTotalTagCount = () => {
    if (!entry?.tags) return 0;
    const activities = entry.tags.activities?.length || 0;
    const assessments = entry.tags.assessments?.length || 0;
    const resources = entry.tags.resources?.length || 0;
    return activities + assessments + resources;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio entry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <School className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portfolio Entry</h1>
                {student && (
                  <p className="text-sm text-gray-600">
                    {student.firstName}'s Portfolio {student.schoolYear && `• ${student.schoolYear}`}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          {/* Entry Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                {getTypeIcon()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{entry.title}</h2>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.date)}
                  </span>
                  {getTotalTagCount() > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {getTotalTagCount()} tags
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Entry Content */}
          <div className="p-6 space-y-6">
            {/* Images */}
            {entry.type === 'image' && entry.files?.length > 0 && (
              <div className="space-y-4">
                <img
                  src={entry.files[currentImageIndex]?.url}
                  alt={entry.files[currentImageIndex]?.name}
                  className="w-full rounded-lg shadow-lg"
                />
                {entry.files.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {entry.files.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {entry.type === 'video' && entry.files?.length > 0 && (
              <div className="rounded-lg overflow-hidden bg-black">
                <video
                  src={entry.files[0]?.url}
                  className="w-full"
                  controls
                />
              </div>
            )}

            {/* Text Content */}
            {entry.content && (
              <div className="bg-gray-50 rounded-lg p-6">
                {renderHTMLContent(entry.content)}
              </div>
            )}

            {/* Files/Attachments */}
            {entry.files?.length > 0 && entry.type !== 'image' && entry.type !== 'video' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Attachments</h3>
                <div className="space-y-2">
                  {entry.files.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="flex-1 text-sm font-medium">{file.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reflections */}
            {entry.reflections && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-2">Reflections</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.reflections}</p>
              </div>
            )}

            {/* Tags */}
            {getTotalTagCount() > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Learning Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.tags?.activities?.map((tag, i) => (
                    <Badge key={`a-${i}`} className="bg-blue-100 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                  {entry.tags?.assessments?.map((tag, i) => (
                    <Badge key={`as-${i}`} className="bg-green-100 text-green-700 border-green-200">
                      {tag}
                    </Badge>
                  ))}
                  {entry.tags?.resources?.map((tag, i) => (
                    <Badge key={`r-${i}`} className="bg-purple-100 text-purple-700 border-purple-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              This portfolio entry is part of a student's learning journey at RTD Academy
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PublicPortfolioEntry;