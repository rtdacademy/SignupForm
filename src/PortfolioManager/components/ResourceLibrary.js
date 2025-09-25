import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import ResourceCard from './ResourceCard';
import ResourceUploader from './ResourceUploader';
import { useResources } from '../hooks/useResources';
import { useAuth } from '../../context/AuthContext';
import {
  Library,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Star,
  Clock,
  TrendingUp,
  Users,
  User,
  Download,
  Share2,
  Archive,
  FolderOpen,
  BookOpen,
  FileText,
  Image,
  Video,
  Link2,
  X,
  ChevronRight,
  BarChart3,
  Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';

const ResourceLibrary = ({
  isOpen,
  onClose,
  familyId,
  studentId,
  onAddToLocation = null
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [libraryStats, setLibraryStats] = useState(null);

  const {
    libraryResources,
    loadingLibrary,
    createResource,
    updateResource,
    deleteResource,
    shareResourceToFamily,
    getUserRole
  } = useResources(familyId, studentId);

  const userRole = getUserRole();
  const isStaff = userRole === 'facilitator';

  useEffect(() => {
    calculateLibraryStats();
  }, [libraryResources]);

  const calculateLibraryStats = () => {
    if (!libraryResources || libraryResources.length === 0) {
      setLibraryStats(null);
      return;
    }

    const stats = {
      total: libraryResources.length,
      byType: {},
      byCategory: {},
      totalUsage: 0,
      recentlyUsed: [],
      mostUsed: []
    };

    libraryResources.forEach(resource => {
      stats.byType[resource.type] = (stats.byType[resource.type] || 0) + 1;

      const category = resource.libraryMetadata?.category || 'general';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      stats.totalUsage += resource.metadata?.usageCount || 0;
    });

    stats.recentlyUsed = libraryResources
      .filter(r => r.metadata?.lastUsedAt)
      .sort((a, b) => {
        const dateA = a.metadata.lastUsedAt?.toDate ? a.metadata.lastUsedAt.toDate() : new Date(a.metadata.lastUsedAt);
        const dateB = b.metadata.lastUsedAt?.toDate ? b.metadata.lastUsedAt.toDate() : new Date(b.metadata.lastUsedAt);
        return dateB - dateA;
      })
      .slice(0, 5);

    stats.mostUsed = libraryResources
      .filter(r => r.metadata?.usageCount > 0)
      .sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0))
      .slice(0, 5);

    setLibraryStats(stats);
  };

  const getFilteredResources = () => {
    let filtered = [...libraryResources];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(r =>
        (r.libraryMetadata?.category || 'general') === filterCategory
      );
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = a.metadata?.createdAt?.toDate ? a.metadata.createdAt.toDate() : new Date(a.metadata?.createdAt || 0);
          const dateB = b.metadata?.createdAt?.toDate ? b.metadata.createdAt.toDate() : new Date(b.metadata?.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'most-used':
        filtered.sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0));
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    return filtered;
  };

  const handleCreateResource = async (resourceData, file) => {
    try {
      await createResource({
        ...resourceData,
        addToLibrary: true
      }, file);
      setShowUploader(false);
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleUpdateResource = async (resourceId, updates) => {
    try {
      await updateResource(resourceId, updates);
      setSelectedResource(null);
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource from your library? This cannot be undone.')) {
      try {
        await deleteResource(resourceId);
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const handleShareResource = async (resource, targetFamilyId) => {
    try {
      await shareResourceToFamily(resource.id, targetFamilyId);
      alert('Resource shared successfully!');
    } catch (error) {
      console.error('Error sharing resource:', error);
      alert('Failed to share resource');
    }
  };

  const filteredResources = getFilteredResources();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[800px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  Resource Library
                </SheetTitle>
                <SheetDescription>
                  {isStaff ? 'Your personal teaching resources' : 'Family learning resources'}
                </SheetDescription>
              </div>
              <Button onClick={() => setShowUploader(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </SheetHeader>

          {libraryStats && (
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {libraryStats.total}
                  </div>
                  <div className="text-xs text-gray-600">Total Resources</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {libraryStats.totalUsage}
                  </div>
                  <div className="text-xs text-gray-600">Total Uses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(libraryStats.byType).length}
                  </div>
                  <div className="text-xs text-gray-600">Resource Types</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(libraryStats.byCategory).length}
                  </div>
                  <div className="text-xs text-gray-600">Categories</div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-3 border-b">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="link">Links</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="lesson-plans">Lesson Plans</SelectItem>
                    <SelectItem value="worksheets">Worksheets</SelectItem>
                    <SelectItem value="references">References</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                    <SelectItem value="assessments">Assessments</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="presentations">Presentations</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="most-used">Most Used</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {loadingLibrary ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Library className="w-12 h-12 mx-auto text-gray-400 animate-pulse" />
                  <p className="mt-2 text-gray-500">Loading library...</p>
                </div>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={(r) => setSelectedResource(r)}
                    onDelete={handleDeleteResource}
                    onAddToLocation={onAddToLocation}
                    canEdit={true}
                    canDelete={true}
                    canShare={isStaff}
                    compact={viewMode === 'list'}
                    showMetadata={viewMode === 'grid'}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Library className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                    ? 'No matching resources found'
                    : 'Your library is empty'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add resources to build your library'}
                </p>
                {!searchTerm && filterType === 'all' && filterCategory === 'all' && (
                  <Button onClick={() => setShowUploader(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Resource
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>

          {libraryStats && (libraryStats.recentlyUsed.length > 0 || libraryStats.mostUsed.length > 0) && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {libraryStats.recentlyUsed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Recently Used
                    </h4>
                    <div className="space-y-1">
                      {libraryStats.recentlyUsed.slice(0, 3).map(r => (
                        <div key={r.id} className="text-xs text-gray-600 truncate">
                          {r.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {libraryStats.mostUsed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Most Used
                    </h4>
                    <div className="space-y-1">
                      {libraryStats.mostUsed.slice(0, 3).map(r => (
                        <div key={r.id} className="text-xs text-gray-600 truncate flex items-center justify-between">
                          <span className="truncate">{r.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {r.metadata?.usageCount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {showUploader && (
        <ResourceUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onSave={handleCreateResource}
          level="library"
          itemTitle="Library"
        />
      )}

      {selectedResource && (
        <ResourceUploader
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          onSave={(updates) => handleUpdateResource(selectedResource.id, updates)}
          resource={selectedResource}
          level="library"
          itemTitle="Library"
        />
      )}
    </Sheet>
  );
};

export default ResourceLibrary;