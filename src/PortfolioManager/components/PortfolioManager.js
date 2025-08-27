import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio, useSOLOIntegration } from '../hooks/usePortfolio';
import PortfolioSidebar from './PortfolioSidebar';
import PortfolioBuilder from './PortfolioBuilder';
import PortfolioDashboard from './PortfolioDashboard';
import SOLOEducationPlanForm from '../../RTDConnect/SOLOEducationPlanForm';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { 
  Plus,
  Menu,
  Home,
  Settings,
  Download,
  Share2,
  BookOpen,
  Grid3X3,
  ChevronRight,
  Loader2,
  AlertCircle,
  Camera,
  Upload,
  FolderPlus
} from 'lucide-react';

const PortfolioManager = ({ student, familyId, schoolYear, onClose }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, builder, viewer
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSOLOPlan, setShowSOLOPlan] = useState(false);
  
  // Portfolio hooks
  const {
    portfolioMetadata,
    portfolioStructure,
    portfolioEntries,
    loading: portfolioLoading,
    error: portfolioError,
    selectedStructureId,
    setSelectedStructureId,
    createStructureItem,
    updateStructureItem,
    deleteStructureItem,
    restoreStructureItem,
    getArchivedStructure,
    createPortfolioEntry,
    updatePortfolioEntry,
    deletePortfolioEntry,
    reorderStructure,
    getStructureHierarchy,
    generateFromAlbertaCourses
  } = usePortfolio(familyId, student?.id, schoolYear);

  // SOLO plan integration
  const {
    soloplanData,
    loading: soloLoading,
    getTagSuggestions,
    activities,
    assessments,
    resources,
    activityDescriptions,
    assessmentDescriptions,
    resourceDescriptions
  } = useSOLOIntegration(familyId, student?.id, schoolYear);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Quick action handlers
  const handleQuickAdd = (type) => {
    if (type === 'structure') {
      // Open structure creation modal
      createStructureItem({
        type: 'module',
        title: 'New Module',
        description: '',
        parentId: null,
        icon: 'Folder',
        color: '#6B7280'
      });
    } else if (type === 'entry') {
      // Open entry creation modal
      if (selectedStructureId) {
        setViewMode('builder');
      } else {
        // Prompt to select or create structure first
        alert('Please select or create a section first');
      }
    }
  };

  // Export portfolio
  const handleExportPortfolio = () => {
    // TODO: Implement PDF/ZIP export
    console.log('Exporting portfolio...');
  };

  // Share portfolio
  const handleSharePortfolio = () => {
    // TODO: Generate share link for facilitator
    console.log('Sharing portfolio...');
  };

  // Open SOLO Education Plan form
  const handleOpenSOLOPlan = () => {
    setShowSOLOPlan(true);
  };

  if (portfolioLoading || soloLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (portfolioError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Error Loading Portfolio</h2>
          <p className="mt-2 text-gray-600">{portfolioError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {student?.firstName}'s Portfolio
              </h1>
              <p className="text-xs text-gray-500">{schoolYear} School Year</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
              className="px-3 py-1"
            >
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <Button
              variant={viewMode === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('builder')}
              className="px-3 py-1"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Builder
            </Button>
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSharePortfolio}
            className="hidden md:flex"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPortfolio}
            className="hidden md:flex"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 bg-white border-r border-gray-200">
            <PortfolioSidebar
              structure={getStructureHierarchy()}
              selectedId={selectedStructureId}
              onSelectStructure={setSelectedStructureId}
              onCreateStructure={createStructureItem}
              onUpdateStructure={updateStructureItem}
              onDeleteStructure={deleteStructureItem}
              onRestoreStructure={restoreStructureItem}
              onGetArchivedItems={getArchivedStructure}
              onReorder={reorderStructure}
              metadata={portfolioMetadata}
              onOpenSOLOPlan={handleOpenSOLOPlan}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'dashboard' && (
            <PortfolioDashboard
              student={student}
              portfolioMetadata={portfolioMetadata}
              portfolioStructure={portfolioStructure}
              entries={portfolioEntries}
              soloplanData={soloplanData}
              onNavigateToBuilder={(structureId) => {
                setSelectedStructureId(structureId);
                setViewMode('builder');
              }}
            />
          )}

          {viewMode === 'builder' && (
            <PortfolioBuilder
              selectedStructure={portfolioStructure.find(s => s.id === selectedStructureId)}
              entries={portfolioEntries}
              onCreateEntry={createPortfolioEntry}
              onUpdateEntry={updatePortfolioEntry}
              onDeleteEntry={deletePortfolioEntry}
              soloplanData={soloplanData}
              getTagSuggestions={getTagSuggestions}
              activities={activities}
              assessments={assessments}
              resources={resources}
              activityDescriptions={activityDescriptions}
              assessmentDescriptions={assessmentDescriptions}
              resourceDescriptions={resourceDescriptions}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
              className="flex-1"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('builder')}
              className="flex-1"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="flex-1"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSharePortfolio}
              className="flex-1"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen && isMobile} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[80%] sm:w-[385px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Portfolio Structure</SheetTitle>
          </SheetHeader>
          <PortfolioSidebar
            structure={getStructureHierarchy()}
            selectedId={selectedStructureId}
            onSelectStructure={(id) => {
              setSelectedStructureId(id);
              setSidebarOpen(false);
              setViewMode('builder');
            }}
            onCreateStructure={createStructureItem}
            onUpdateStructure={updateStructureItem}
            onDeleteStructure={deleteStructureItem}
            onRestoreStructure={restoreStructureItem}
            onGetArchivedItems={getArchivedStructure}
            onReorder={reorderStructure}
            metadata={portfolioMetadata}
            onOpenSOLOPlan={handleOpenSOLOPlan}
          />
        </SheetContent>
      </Sheet>

      {/* Floating Action Button (Mobile) */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 z-10">
          <div className="relative">
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={() => handleQuickAdd('entry')}
            >
              <Plus className="w-6 h-6" />
            </Button>
            
            {/* Quick action menu */}
            <div className="absolute bottom-16 right-0 hidden">
              <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAdd('photo')}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAdd('upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAdd('entry')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOLO Education Plan Form */}
      <SOLOEducationPlanForm
        isOpen={showSOLOPlan}
        onOpenChange={setShowSOLOPlan}
        student={student}
        familyId={familyId}
        schoolYear={schoolYear}
        readOnly={false}
        staffMode={false}
      />

    </div>
  );
};

export default PortfolioManager;