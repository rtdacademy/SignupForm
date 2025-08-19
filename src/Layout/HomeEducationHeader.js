import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  UserPlus, 
  AlertTriangle, 
  UserCheck, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  Menu,
  LogOut,
  User,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FilePenLine,
  UserCog,
  ClipboardCheck,
  Home as HomeIcon
} from 'lucide-react';
import { getAllFacilitators } from '../config/facilitators';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup
} from '../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../components/ui/sheet';
import TemplateManager from '../StudentManagement/TemplateManager';
import AdminUserManagement from '../TeacherDashboard/AdminUserManagement';

// RTD Logo component matching Header.js
const RTDLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 75 75" 
    className="h-12 w-12"
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
);

// RTD Connect Logo component matching the Dashboard.js styling
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-sm text-gray-600">Home Education Staff Portal</p>
    </div>
  </div>
);

function HomeEducationHeader({ 
  user, 
  onLogout,
  // Home Education specific props
  showMyFamiliesOnly,
  setShowMyFamiliesOnly,
  impersonatingFacilitator,
  setImpersonatingFacilitator,
  showImpersonationDropdown,
  setShowImpersonationDropdown,
  statusFilter,
  setStatusFilter,
  stats
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  // Determine current page
  const isOnRegistrarDashboard = location.pathname === '/registrar';
  const isOnFamilyDashboard = location.pathname === '/home-education-staff';
  
  // On registrar dashboard, we don't need the families toggle
  const showFamiliesToggle = !isOnRegistrarDashboard;
  const showImpersonation = !isOnRegistrarDashboard && (isAdmin || user?.email === 'kyle@rtdacademy.com');

  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left section - RTD Connect branding */}
          <div className="flex items-center space-x-6">
            <RTDConnectLogo />
          </div>

          {/* Center section - Filters */}
          <div className="flex items-center space-x-3">
            {/* Status Filter Dropdown - Always shown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2">
                  {statusFilter === 'active' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {statusFilter === 'inactive' && <XCircle className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm font-medium">
                    {statusFilter === 'active' && 'Active Families'}
                    {statusFilter === 'inactive' && 'Inactive Families'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('active')}
                  className={statusFilter === 'active' ? 'bg-green-50' : ''}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  <span>Active Families</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('inactive')}
                  className={statusFilter === 'inactive' ? 'bg-gray-50' : ''}
                >
                  <XCircle className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Inactive Families</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Families Toggle Switch - Only shown on family dashboard */}
            {showFamiliesToggle && (
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setShowMyFamiliesOnly(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    showMyFamiliesOnly 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="font-medium text-sm">My Families</span>
                  <span className={`font-bold ${showMyFamiliesOnly ? 'text-purple-100' : 'text-gray-500'}`}>
                    ({stats.myFamilies})
                  </span>
                </button>
                
                <button
                  onClick={() => setShowMyFamiliesOnly(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    !showMyFamiliesOnly 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium text-sm">All Families</span>
                  <span className={`font-bold ${!showMyFamiliesOnly ? 'text-blue-100' : 'text-gray-500'}`}>
                    ({stats.totalFamilies})
                  </span>
                </button>
              </div>
            )}
            
            {/* Registrar Dashboard Info - Only shown on registrar page */}
            {isOnRegistrarDashboard && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  All Families: {stats.totalFamilies}
                </span>
              </div>
            )}
            
            {/* Show impersonation indicator if active - Only on family dashboard */}
            {showImpersonation && impersonatingFacilitator && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700 hidden md:inline">
                  Testing as: {impersonatingFacilitator.name}
                </span>
                <span className="text-sm text-orange-700 md:hidden">
                  Testing
                </span>
              </div>
            )}
          </div>

          {/* Right section - Hamburger Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm hidden lg:inline">
                Welcome, {getUserDisplayName()}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Menu className="h-5 w-5 text-gray-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {/* User Info Section */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Navigation Section */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/teacher-dashboard')}>
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-6 h-6">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 75 75" 
                            className="w-full h-full"
                            role="img"
                            aria-label="RTD Academy Logo"
                          >
                            <g transform="translate(10, 25)">
                              <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
                              <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
                              <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
                            </g>
                          </svg>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold">RTD Academy Portal</span>
                          <span className="text-xs text-gray-500">Switch to Staff Dashboard</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    {/* Dynamic Dashboard Navigation - Changes based on current page */}
                    {isOnRegistrarDashboard ? (
                      <DropdownMenuItem onClick={() => navigate('/home-education-staff')}>
                        <div className="flex items-center space-x-3 w-full">
                          <HomeIcon className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">Family Dashboard</span>
                            <span className="text-xs text-gray-500">Switch to Family Management</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/registrar')}>
                        <div className="flex items-center space-x-3 w-full">
                          <ClipboardCheck className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">Registrar Dashboard</span>
                            <span className="text-xs text-gray-500">PASI Registration Management</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => setShowTemplateManager(true)}>
                      <div className="flex items-center space-x-3 w-full">
                        <FilePenLine className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold">Email Templates</span>
                          <span className="text-xs text-gray-500">Manage email templates</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setShowUserManagement(true)}>
                      <div className="flex items-center space-x-3 w-full">
                        <UserCog className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold">User Support</span>
                          <span className="text-xs text-gray-500">Help parents with account issues</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  {/* Admin Section - Test as Facilitator - Only on family dashboard */}
                  {showImpersonation && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserPlus className="w-4 h-4 mr-2" />
                            <span>Test as Facilitator</span>
                            {impersonatingFacilitator && (
                              <span className="ml-auto text-xs text-orange-600 font-medium">Active</span>
                            )}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-64">
                            <DropdownMenuLabel className="text-xs text-gray-500">
                              SELECT FACILITATOR
                            </DropdownMenuLabel>
                            {getAllFacilitators().map(facilitator => (
                              <DropdownMenuItem
                                key={facilitator.id}
                                onClick={() => {
                                  setImpersonatingFacilitator(facilitator);
                                  setShowImpersonationDropdown(false);
                                }}
                                className={impersonatingFacilitator?.id === facilitator.id ? 'bg-purple-50' : ''}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{facilitator.name}</span>
                                  <span className="text-xs text-gray-500">{facilitator.contact.email}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                            {impersonatingFacilitator && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setImpersonatingFacilitator(null);
                                    setShowImpersonationDropdown(false);
                                  }}
                                  className="text-red-600"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Stop Impersonating
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Sign Out */}
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Status Banner - Only on family dashboard */}
      {showImpersonation && impersonatingFacilitator && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              Testing Mode: Viewing as {impersonatingFacilitator.name} ({impersonatingFacilitator.contact.email})
            </span>
          </div>
        </div>
      )}
      
      {/* Template Manager - Rendered directly when opened from menu */}
      {showTemplateManager && (
        <TemplateManager 
          directOpen={true}
          onMessageChange={() => {}}
          defaultOpen={true}
          onClose={() => setShowTemplateManager(false)}
          context="family"
        />
      )}
      
      {/* User Management Sheet */}
      <Sheet open={showUserManagement} onOpenChange={setShowUserManagement}>
        <SheetContent size="xl" className="w-full sm:max-w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center">
              <UserCog className="w-5 h-5 mr-2" />
              User Account Support
            </SheetTitle>
            <SheetDescription>
              Help parents with account issues, reset passwords, and verify emails
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <AdminUserManagement defaultTargetSite="rtdconnect" />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export default HomeEducationHeader;