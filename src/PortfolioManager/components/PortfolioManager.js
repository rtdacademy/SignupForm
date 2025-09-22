import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio, useSOLOIntegration } from '../hooks/usePortfolio';
import PortfolioSidebar from './PortfolioSidebar';
import PortfolioBuilder from './PortfolioBuilder';
import PortfolioQuickAdd from './PortfolioQuickAdd';
import PortfolioAccessGate from './PortfolioAccessGate';
import SOLOEducationPlanForm from '../../RTDConnect/SOLOEducationPlanForm';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import {
  Plus,
  Menu,
  BookOpen,
  Loader2,
  AlertCircle,
  Camera,
  Upload,
  FolderPlus,
  Zap,
  ExternalLink
} from 'lucide-react';

const PortfolioManager = ({ student, familyId, schoolYear, onClose, onQuickAddOpen, isStandalone = false }) => {
  const { user } = useAuth();

  // Try to use routing hooks - they'll be available in standalone mode
  let navigate = null;
  let location = null;
  let params = {};

  try {
    navigate = useNavigate();
    location = useLocation();
    params = useParams();
  } catch (error) {
    // Not in a Router context, that's fine for embedded mode
  }

  const [selectedSection, setSelectedSection] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSOLOPlan, setShowSOLOPlan] = useState(false);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Use ref to prevent update loops between URL and state
  const isUpdatingFromUrl = React.useRef(false);
  
  // Get initial structure ID from URL params if in standalone mode
  const initialStructureId = isStandalone && params.structureId ? params.structureId : null;

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
    reorderEntries,
    getStructureHierarchy,
    generateFromAlbertaCourses,
    createQuickEntry,
    initializeStructureFromEntries,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    comments,
    loadingComments
  } = usePortfolio(familyId, student?.id, schoolYear, initialStructureId);

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
    resourceDescriptions,
    customActivities,
    customAssessments,
    customResources
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

  // Update URL when structure selection changes (standalone mode ONLY)
  useEffect(() => {
    if (!isStandalone || !navigate || isUpdatingFromUrl.current) return;

    // Convert schoolYear format from "25/26" to "25_26" for URL
    const urlSchoolYear = schoolYear ? schoolYear.replace('/', '_') : '';
    const baseUrl = `/portfolio/${familyId}/${student?.id}/${urlSchoolYear}`;
    const newUrl = selectedStructureId
      ? `${baseUrl}/${selectedStructureId}`
      : baseUrl;

    // Only update if URL actually changed to avoid unnecessary history entries
    if (location && location.pathname !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [selectedStructureId, isStandalone, familyId, student?.id, schoolYear, navigate, location]);

  // Handle URL parameter changes (browser back/forward) - standalone mode ONLY
  useEffect(() => {
    if (!isStandalone) return;

    const structureFromUrl = params.structureId || null;

    // Only update if the URL structureId is different from current selection
    if (structureFromUrl !== selectedStructureId) {
      isUpdatingFromUrl.current = true;

      // If there's a structure ID in URL, validate it exists
      if (structureFromUrl) {
        const structureExists = portfolioStructure.some(s => s.id === structureFromUrl);
        if (structureExists) {
          setSelectedStructureId(structureFromUrl);
        }
      } else {
        // No structure in URL, clear selection
        setSelectedStructureId(null);
      }

      // Reset flag after a small delay
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 100);
    }
  }, [params.structureId, isStandalone, portfolioStructure]); // Remove selectedStructureId from deps to avoid loop


  // Quick action handlers
  const handleQuickAdd = () => {
    setShowQuickAdd(true);
  };
  
  // Notify parent when quick add is requested
  useEffect(() => {
    if (onQuickAddOpen) {
      onQuickAddOpen(() => setShowQuickAdd(true));
    }
  }, [onQuickAddOpen]);


  // Open SOLO Education Plan form
  const handleOpenSOLOPlan = () => {
    setShowSOLOPlan(true);
  };

  // Check if user is staff
  const isStaff = user?.role === 'staff' || user?.customClaims?.role === 'staff' ||
                  user?.email?.includes('@rtdacademy.com') || user?.email?.includes('@rtdlearning.ca');

  // Handle access granted
  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  // Handle opening in new tab
  const handleOpenInNewTab = () => {
    // Convert schoolYear format from "25/26" to "25_26" for URL
    const urlSchoolYear = schoolYear ? schoolYear.replace('/', '_') : '';
    const baseUrl = `/portfolio/${familyId}/${student?.id}/${urlSchoolYear}`;
    const fullUrl = selectedStructureId ? `${baseUrl}/${selectedStructureId}` : baseUrl;
    window.open(fullUrl, '_blank');
  };

  // Show access gate if no access yet
  if (!hasAccess) {
    return (
      <PortfolioAccessGate
        onAccessGranted={handleAccessGranted}
        studentName={student?.firstName || 'Student'}
        isStaff={isStaff}
      />
    );
  }

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

        {/* Action Buttons in header */}
        <div className="flex items-center space-x-2">
          {/* Open in New Tab button - only show in embedded mode */}
          {!isStandalone && (
            <Button
              onClick={handleOpenInNewTab}
              size="sm"
              variant="outline"
              className="gap-2"
              title="Open portfolio in new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Open in New Tab</span>
            </Button>
          )}

          {/* Quick Add Button */}
          <Button
            onClick={handleQuickAdd}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden md:inline">Quick Add</span>
          </Button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}>
            <PortfolioSidebar
              structure={getStructureHierarchy()}
              selectedId={selectedStructureId}
              onSelectStructure={(id) => {
                setSelectedStructureId(id);
                // Scroll to top on navigation
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCreateStructure={createStructureItem}
              onUpdateStructure={updateStructureItem}
              onDeleteStructure={deleteStructureItem}
              onRestoreStructure={restoreStructureItem}
              onGetArchivedItems={getArchivedStructure}
              onReorder={reorderStructure}
              metadata={portfolioMetadata}
              onOpenSOLOPlan={handleOpenSOLOPlan}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
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
            customActivities={customActivities}
            customAssessments={customAssessments}
            customResources={customResources}
            student={student}
            portfolioStructure={portfolioStructure}
            onSelectStructure={setSelectedStructureId}
            familyId={familyId}
            loadComments={loadComments}
            createComment={createComment}
            updateComment={updateComment}
            deleteComment={deleteComment}
            comments={comments}
            loadingComments={loadingComments}
            onCreateStructure={createStructureItem}
            onUpdateStructure={updateStructureItem}
            onDeleteStructure={deleteStructureItem}
            onReorderStructure={reorderStructure}
            onReorderEntries={reorderEntries}
            onInitializeStructure={initializeStructureFromEntries}
            onPresentationModeChange={(isPresenting) => {
              // Only auto-collapse once per session when entering presentation mode
              if (isPresenting && !sidebarCollapsed && !hasAutoCollapsed) {
                setSidebarCollapsed(true);
                setHasAutoCollapsed(true);
              }
              // Reset the auto-collapse flag when leaving presentation mode
              if (!isPresenting) {
                setHasAutoCollapsed(false);
              }
            }}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="px-8"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="text-xs ml-1">Sections</span>
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
              // Scroll to top on navigation
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={handleQuickAdd}
          >
            <Zap className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Quick Add Modal */}
      <PortfolioQuickAdd
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        portfolioStructure={portfolioStructure}
        getStructureHierarchy={getStructureHierarchy}
        onCreateEntry={createQuickEntry}
        activities={activities}
        assessments={assessments}
        resources={resources}
        activityDescriptions={activityDescriptions}
        assessmentDescriptions={assessmentDescriptions}
        resourceDescriptions={resourceDescriptions}
        getTagSuggestions={getTagSuggestions}
        customActivities={customActivities}
        customAssessments={customAssessments}
        customResources={customResources}
        preselectedStructureId={selectedStructureId}
      />

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
