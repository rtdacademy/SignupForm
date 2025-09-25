import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import ResourceCard from './ResourceCard';
import ResourceUploader from './ResourceUploader';
import { useResources } from '../hooks/useResources';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Library,
  FolderOpen,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Users,
  User,
  Clock,
  TrendingUp,
  FileText,
  Image,
  Video,
  Link2,
  Archive,
  Info
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

const ResourceDrop = ({
  level = 'entry',
  itemId,
  itemTitle = 'Resource Drop',
  familyId,
  studentId,
  showInheritedResources = true,
  parentStructure = null,
  isEditMode = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [inheritedResources, setInheritedResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  const {
    getResourcesForItem,
    createResource,
    updateResource,
    deleteResource,
    addResourceFromLibrary,
    libraryResources,
    getUserRole
  } = useResources(familyId, studentId);

  const userRole = getUserRole();
  const isStaff = userRole === 'facilitator';
  const canEdit = isEditMode || isStaff;
  const canDelete = isEditMode || isStaff;

  useEffect(() => {
    loadResources();
  }, [itemId, level]);

  const loadResources = async () => {
    if (!itemId || !familyId || !studentId) {
      setLoadingResources(false);
      return;
    }

    setLoadingResources(true);
    try {
      const itemResources = await getResourcesForItem(level, itemId);
      setResources(itemResources);

      if (showInheritedResources && parentStructure) {
        const inherited = [];
        let current = parentStructure;

        while (current) {
          const parentResources = await getResourcesForItem(
            current.type === 'portfolio' ? 'portfolio' : 'collection',
            current.id
          );
          inherited.push(...parentResources.map(r => ({
            ...r,
            inheritedFrom: current.title,
            inheritedLevel: current.type
          })));
          current = current.parent;
        }

        setInheritedResources(inherited);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    const allResources = activeTab === 'current' ? resources : inheritedResources;
    let filtered = [...allResources];

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

    if (filterSource !== 'all') {
      if (filterSource === 'facilitator') {
        filtered = filtered.filter(r => r.metadata?.createdByRole === 'facilitator');
      } else if (filterSource === 'parent') {
        filtered = filtered.filter(r => r.metadata?.createdByRole === 'parent');
      } else if (filterSource === 'library') {
        filtered = filtered.filter(r => r.library?.sourceLibraryId);
      }
    }

    setFilteredResources(filtered);
  }, [resources, inheritedResources, searchTerm, filterType, filterSource, activeTab]);

  const handleAddResource = async (resourceData, file) => {
    try {
      await createResource({
        ...resourceData,
        attachedTo: {
          level,
          id: itemId,
          path: itemTitle
        }
      }, file);
      await loadResources();
      setShowUploader(false);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleAddFromLibrary = async (libraryResource) => {
    try {
      await addResourceFromLibrary(libraryResource.id, {
        level,
        id: itemId,
        path: itemTitle
      });
      await loadResources();
      setShowLibrary(false);
    } catch (error) {
      console.error('Error adding from library:', error);
    }
  };

  const handleUpdateResource = async (resourceId, updates) => {
    try {
      await updateResource(resourceId, updates);
      await loadResources();
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(resourceId);
        await loadResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const getResourceCount = () => {
    return resources.length + (showInheritedResources ? inheritedResources.length : 0);
  };

  const getLevelIcon = () => {
    switch (level) {
      case 'portfolio':
        return <Archive className="w-4 h-4" />;
      case 'collection':
        return <FolderOpen className="w-4 h-4" />;
      case 'entry':
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getLevelColor = () => {
    switch (level) {
      case 'portfolio':
        return 'bg-purple-100 text-purple-700';
      case 'collection':
        return 'bg-blue-100 text-blue-700';
      case 'entry':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`resource-drop ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getLevelColor()}`}>
                  {getLevelIcon()}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Resource Drop
                    {getResourceCount() > 0 && (
                      <Badge variant="secondary">
                        {getResourceCount()} resources
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Learning resources for {itemTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUploader(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add New Resource</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLibrary(true);
                            }}
                          >
                            <Library className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add from Library</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t">
              <div className="p-4 space-y-4">
                {(resources.length > 0 || inheritedResources.length > 0) && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search resources..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
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
                      <Select value={filterSource} onValueChange={setFilterSource}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="facilitator">Facilitator</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="library">From Library</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {showInheritedResources && inheritedResources.length > 0 && (
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="current">
                            Current Level ({resources.length})
                          </TabsTrigger>
                          <TabsTrigger value="inherited">
                            Inherited ({inheritedResources.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="current" className="mt-4">
                          <ResourceList
                            resources={filteredResources.filter(r => !r.inheritedFrom)}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onEdit={setSelectedResource}
                            onDelete={handleDeleteResource}
                          />
                        </TabsContent>

                        <TabsContent value="inherited" className="mt-4">
                          <ResourceList
                            resources={filteredResources.filter(r => r.inheritedFrom)}
                            canEdit={false}
                            canDelete={false}
                            showInheritedFrom={true}
                          />
                        </TabsContent>
                      </Tabs>
                    )}

                    {(!showInheritedResources || inheritedResources.length === 0) && (
                      <ResourceList
                        resources={filteredResources}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={setSelectedResource}
                        onDelete={handleDeleteResource}
                      />
                    )}
                  </>
                )}

                {resources.length === 0 && inheritedResources.length === 0 && !loadingResources && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No resources added yet</p>
                    {canEdit && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowUploader(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Resource
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowLibrary(true)}
                        >
                          <Library className="w-4 h-4 mr-2" />
                          Browse Library
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {showUploader && (
        <ResourceUploader
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onSave={handleAddResource}
          level={level}
          itemTitle={itemTitle}
        />
      )}

      {showLibrary && (
        <LibraryBrowser
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          onSelect={handleAddFromLibrary}
          libraryResources={libraryResources}
        />
      )}

      {selectedResource && (
        <ResourceUploader
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          onSave={(updates) => handleUpdateResource(selectedResource.id, updates)}
          resource={selectedResource}
          level={level}
          itemTitle={itemTitle}
        />
      )}
    </div>
  );
};

const ResourceList = ({ resources, canEdit, canDelete, onEdit, onDelete, showInheritedFrom }) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No resources match your filters
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {resources.map((resource) => (
        <div key={resource.id}>
          {showInheritedFrom && resource.inheritedFrom && (
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Inherited from {resource.inheritedFrom}
            </div>
          )}
          <ResourceCard
            resource={resource}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit && !resource.inheritedFrom}
            canDelete={canDelete && !resource.inheritedFrom}
            compact={true}
          />
        </div>
      ))}
    </div>
  );
};

const LibraryBrowser = ({ isOpen, onClose, onSelect, libraryResources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredLibrary = libraryResources.filter(r => {
    const matchesSearch = !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || r.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>Resource Library</SheetTitle>
          <SheetDescription>
            Select resources from your library to add to this location
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
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
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {filteredLibrary.map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(resource)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {resource.type}
                    </Badge>
                  </div>
                  {resource.metadata?.usageCount > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Used {resource.metadata.usageCount} times
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {filteredLibrary.length === 0 && (
            <div className="text-center py-8">
              <Library className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchTerm ? 'No matching resources found' : 'Your library is empty'}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResourceDrop;