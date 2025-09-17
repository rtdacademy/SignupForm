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
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Globe,
  Lock,
  Clock,
  BookOpen
} from 'lucide-react';

const PublicPortfolioView = () => {
  const { familyId, courseId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [structure, setStructure] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const loadPublicPortfolio = async () => {
      if (!familyId || !courseId) {
        setError('Invalid portfolio link');
        setLoading(false);
        return;
      }

      try {
        // Use Cloud Function to fetch public portfolio
        const functions = getFunctions();
        const getPublicPortfolio = httpsCallable(functions, 'getPublicPortfolio');

        const result = await getPublicPortfolio({ familyId, courseId });

        if (!result.data.success) {
          setError(result.data.error || 'Failed to load portfolio');
          setLoading(false);
          return;
        }

        setPortfolio(result.data.portfolio);
        setStructure(result.data.structure || []);
        setEntries(result.data.entries || []);

        // Auto-expand sections with entries
        const sectionsWithEntries = new Set();
        result.data.entries?.forEach(entry => {
          if (entry.structureId) {
            sectionsWithEntries.add(entry.structureId);
          }
        });
        setExpandedSections(sectionsWithEntries);

        setLoading(false);
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError(err.message || 'Failed to load portfolio');
        setLoading(false);
      }
    };

    loadPublicPortfolio();
  }, [familyId, courseId]);

  // Build hierarchical structure
  const buildHierarchy = () => {
    const structureMap = {};
    structure.forEach(item => {
      structureMap[item.id] = { ...item, children: [], entries: [] };
    });

    // Add entries to their structure items
    entries.forEach(entry => {
      if (structureMap[entry.structureId]) {
        structureMap[entry.structureId].entries.push(entry);
      }
    });

    // Build parent-child relationships
    const rootItems = [];
    structure.forEach(item => {
      if (item.parentId && structureMap[item.parentId]) {
        structureMap[item.parentId].children.push(structureMap[item.id]);
      } else if (!item.parentId) {
        rootItems.push(structureMap[item.id]);
      }
    });

    // Sort by order
    const sortItems = (items) => {
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    rootItems.forEach(item => {
      item.children = sortItems(item.children);
      item.children.forEach(child => {
        child.children = sortItems(child.children);
      });
    });

    return sortItems(rootItems);
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if portfolio has expired
  const isExpired = () => {
    if (!portfolio?.sharingSettings?.expiresAt) return false;
    return new Date(portfolio.sharingSettings.expiresAt) < new Date();
  };

  // Render structure item
  const renderStructureItem = (item, level = 0) => {
    const isExpanded = expandedSections.has(item.id);
    const hasChildren = item.children?.length > 0;
    const hasEntries = item.entries?.length > 0;
    const hasContent = hasChildren || hasEntries;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 ${hasContent ? 'cursor-pointer' : ''}`}
          onClick={() => hasContent && toggleSection(item.id)}
        >
          {hasContent && (
            isExpanded ?
              <ChevronDown className="w-4 h-4 text-gray-500" /> :
              <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          {!hasContent && <div className="w-4" />}

          {isExpanded ?
            <FolderOpen className="w-4 h-4 text-purple-600" /> :
            <Folder className="w-4 h-4 text-gray-600" />
          }

          <span className="font-medium text-gray-900">{item.title}</span>

          {hasEntries && (
            <Badge variant="secondary" className="ml-auto">
              {item.entries.length}
            </Badge>
          )}
        </div>

        {isExpanded && (
          <div className="mt-1">
            {/* Render entries */}
            {item.entries?.map(entry => (
              <div
                key={entry.id}
                className="ml-10 p-2 flex items-center gap-2 hover:bg-purple-50 rounded-lg cursor-pointer"
                onClick={() => navigate(`/portfolio/${familyId}/${entry.id}`)}
              >
                {getTypeIcon(entry.type)}
                <span className="text-sm text-gray-700">{entry.title}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
            ))}

            {/* Render child sections */}
            {item.children?.map(child => renderStructureItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Portfolio</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isExpired()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Link Expired</h2>
          <p className="text-gray-600 mb-6">
            This portfolio sharing link has expired. Please contact the portfolio owner for a new link.
          </p>
        </Card>
      </div>
    );
  }

  const hierarchy = buildHierarchy();
  const totalEntries = entries.length;

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
                <h1 className="text-xl font-bold text-gray-900">
                  {portfolio?.courseTitle || 'Portfolio'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{portfolio?.studentName || 'Student'}'s Portfolio</span>
                  {portfolio?.schoolYear && (
                    <span>• {portfolio.schoolYear}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {totalEntries} {totalEntries === 1 ? 'Entry' : 'Entries'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4 text-green-600" />
              <span>Public Course</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Portfolio Structure */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Course Contents</h2>
              {hierarchy.length > 0 ? (
                <div className="space-y-1">
                  {hierarchy.map(item => renderStructureItem(item))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No content available</p>
              )}
            </Card>

            {/* Portfolio Stats */}
            <Card className="p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Course Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-medium">{totalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{structure.length}</span>
                </div>
                {portfolio?.sharingSettings?.sharedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shared Since:</span>
                    <span className="font-medium">
                      {formatDate(portfolio.sharingSettings.sharedAt)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {portfolio?.courseTitle || 'Portfolio'}
                </h2>
                <p className="text-lg text-gray-700 mb-2">
                  {portfolio?.studentName || 'Student'}'s Learning Journey
                </p>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  This course portfolio showcases learning progress and achievements.
                  Click on any section in the sidebar to explore the content,
                  or click on individual entries to view them in detail.
                </p>

                {totalEntries > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className="bg-purple-100 text-purple-700">
                      {entries.filter(e => e.type === 'image').length} Images
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {entries.filter(e => e.type === 'video').length} Videos
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      {entries.filter(e => e.type === 'text' || e.type === 'unified').length} Documents
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Entries */}
            {entries.length > 0 && (
              <Card className="p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Entries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.slice(0, 6).map(entry => (
                    <div
                      key={entry.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/portfolio/${familyId}/${entry.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded">
                          {getTypeIcon(entry.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{entry.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(entry.createdAt)}
                          </p>
                          {entry.tags && (
                            <div className="flex gap-1 mt-2">
                              <Tag className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {Object.values(entry.tags).flat().length} tags
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 mt-12 py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 text-center">
            This course portfolio is shared publicly as part of {portfolio?.studentName || 'the student'}'s
            educational journey at RTD Academy
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolioView;