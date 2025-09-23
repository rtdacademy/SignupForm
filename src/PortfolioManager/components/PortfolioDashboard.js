import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import DevFileIndicator from './DevFileIndicator';
import {
  FileText,
  Image,
  Video,
  Paperclip,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Activity,
  CheckSquare,
  Package,
  Download,
  Share2,
  Plus,
  ChevronRight,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Users,
  FolderOpen,
  Sparkles,
  Grid3X3,
  Filter
} from 'lucide-react';

const PortfolioDashboard = ({
  student,
  portfolioMetadata,
  portfolioStructure,
  entries,
  soloplanData,
  onNavigateToBuilder
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [tagCoverage, setTagCoverage] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [progressStats, setProgressStats] = useState({});

  // Calculate tag coverage
  useEffect(() => {
    if (entries && soloplanData) {
      const coverage = {
        activities: {},
        assessments: {},
        resources: {}
      };

      // Count tag usage across all entries
      entries.forEach(entry => {
        if (entry.tags) {
          Object.keys(entry.tags).forEach(category => {
            entry.tags[category]?.forEach(tag => {
              if (!coverage[category][tag]) {
                coverage[category][tag] = 0;
              }
              coverage[category][tag]++;
            });
          });
        }
      });

      setTagCoverage(coverage);
    }
  }, [entries, soloplanData]);

  // Calculate recent activity
  useEffect(() => {
    if (entries) {
      const sorted = [...entries]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
      setRecentActivity(sorted);
    }
  }, [entries]);

  // Calculate progress statistics
  useEffect(() => {
    if (portfolioStructure && entries) {
      const stats = {
        totalSections: portfolioStructure.length,
        sectionsWithContent: 0,
        totalEntries: entries.length,
        entriesByType: {
          text: 0,
          image: 0,
          video: 0,
          file: 0
        },
        averageEntriesPerSection: 0,
        lastUpdated: null
      };

      // Count sections with content
      const sectionsWithEntries = new Set();
      entries.forEach(entry => {
        if (entry.structureId) {
          sectionsWithEntries.add(entry.structureId);
        }
        // Count by type
        if (entry.type) {
          stats.entriesByType[entry.type] = (stats.entriesByType[entry.type] || 0) + 1;
        }
        // Track last update
        if (!stats.lastUpdated || new Date(entry.updatedAt) > new Date(stats.lastUpdated)) {
          stats.lastUpdated = entry.updatedAt;
        }
      });

      stats.sectionsWithContent = sectionsWithEntries.size;
      stats.averageEntriesPerSection = stats.totalSections > 0 
        ? Math.round(stats.totalEntries / stats.totalSections * 10) / 10
        : 0;

      setProgressStats(stats);
    }
  }, [portfolioStructure, entries]);

  // Get completion percentage
  const getCompletionPercentage = () => {
    if (!soloplanData) return 0;
    
    const totalTags = 
      (soloplanData.activities?.length || 0) +
      (soloplanData.assessments?.length || 0) +
      (soloplanData.resources?.length || 0);
    
    const usedTags = 
      Object.keys(tagCoverage.activities || {}).length +
      Object.keys(tagCoverage.assessments || {}).length +
      Object.keys(tagCoverage.resources || {}).length;
    
    return totalTags > 0 ? Math.round((usedTags / totalTags) * 100) : 0;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  // Get entry type icon
  const getEntryTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'file':
        return <Paperclip className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Track {student?.firstName}'s learning journey and portfolio progress
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            size="sm"
            onClick={() => onNavigateToBuilder(null)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progressStats.totalEntries || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Across {progressStats.totalSections || 0} sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sections</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progressStats.sectionsWithContent || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress 
              value={(progressStats.sectionsWithContent / progressStats.totalSections) * 100 || 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tag Coverage</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {getCompletionPercentage()}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              SOLO Plan alignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {formatDate(progressStats.lastUpdated)}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Most recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content Types</span>
              <PieChart className="w-5 h-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(progressStats.entriesByType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getEntryTypeIcon(type)}
                  <span className="text-sm font-medium capitalize">{type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ 
                        width: `${(count / progressStats.totalEntries) * 100 || 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {progressStats.totalEntries === 0 && (
              <p className="text-center text-gray-500 py-4">
                No entries yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* SOLO Tag Coverage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SOLO Plan Coverage</span>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {soloplanData ? (
              <div className="space-y-4">
                {/* Activities */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Activities</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Object.keys(tagCoverage.activities || {}).length} of {soloplanData.activities?.length || 0}
                    </span>
                  </div>
                  <Progress 
                    value={(Object.keys(tagCoverage.activities || {}).length / (soloplanData.activities?.length || 1)) * 100}
                    className="h-2"
                  />
                </div>

                {/* Assessments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Assessments</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Object.keys(tagCoverage.assessments || {}).length} of {soloplanData.assessments?.length || 0}
                    </span>
                  </div>
                  <Progress 
                    value={(Object.keys(tagCoverage.assessments || {}).length / (soloplanData.assessments?.length || 1)) * 100}
                    className="h-2"
                  />
                </div>

                {/* Resources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Resources</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Object.keys(tagCoverage.resources || {}).length} of {soloplanData.resources?.length || 0}
                    </span>
                  </div>
                  <Progress 
                    value={(Object.keys(tagCoverage.resources || {}).length / (soloplanData.resources?.length || 1)) * 100}
                    className="h-2"
                  />
                </div>

                {/* Most Used Tags */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Most Used Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tagCoverage)
                      .flatMap(([category, tags]) => 
                        Object.entries(tags).map(([tag, count]) => ({
                          category,
                          tag,
                          count
                        }))
                      )
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((item, index) => (
                        <span 
                          key={index}
                          className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs
                            ${item.category === 'activities' ? 'bg-blue-100 text-blue-700' : ''}
                            ${item.category === 'assessments' ? 'bg-green-100 text-green-700' : ''}
                            ${item.category === 'resources' ? 'bg-purple-100 text-purple-700' : ''}
                          `}
                        >
                          {item.tag.replace(/_/g, ' ')}
                          <span className="ml-1 font-semibold">{item.count}</span>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No SOLO Plan data available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Complete your SOLO Education Plan to track coverage
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Clock className="w-5 h-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => onNavigateToBuilder(entry.structureId)}
                >
                  <div className="flex items-center space-x-3">
                    {getEntryTypeIcon(entry.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.title || 'Untitled Entry'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(entry.updatedAt)} • {entry.structureName || 'No section'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => onNavigateToBuilder(null)}
              >
                Create First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Portfolio Structure</span>
            <Grid3X3 className="w-5 h-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioStructure.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {portfolioStructure.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onNavigateToBuilder(section.id)}
                  className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${section.color}20`, color: section.color }}
                    >
                      {section.icon || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {section.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {section.entryCount || 0} entries
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No portfolio structure yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => onNavigateToBuilder(null)}
              >
                Create First Section
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <DevFileIndicator fileName="PortfolioDashboard.js" />
    </div>
  );
};

export default PortfolioDashboard;