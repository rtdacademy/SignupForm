import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  Menu,
  LogOut,
  User,
  Home,
  BookOpen,
  Settings,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '../components/ui/dropdown-menu';

function RTDLearningHeader({ 
  user, 
  onLogout,
  profile,
  onProfileClick,
  isAdmin = false
}) {
  const navigate = useNavigate();
  
  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className={`bg-white shadow-sm border-b ${isAdmin ? 'border-gray-200' : 'border-emerald-100'}`}>
      <div className={isAdmin ? 'px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className="flex justify-between items-center py-4">
          {/* Left section - RTD Learning branding */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://rtdlearning.com/cdn/shop/files/RTD_FINAL_LOGO.png?v=1727549428&width=160"
              alt="RTD Learning Logo"
              className={isAdmin ? "h-10 w-auto" : "h-12 w-auto"}
            />
            {!isAdmin && (
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  RTD Learning
                </h1>
                <p className="text-xs text-gray-600">Student Portal</p>
              </div>
            )}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Admin Portal</span>
              </div>
            )}
          </div>

          {/* Center section - placeholder for future features */}
          <div className="flex-1 flex justify-center items-center">
            {/* This area is intentionally left blank for future additions */}
          </div>

          {/* Right section - User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {!isAdmin && (
                <span className="text-gray-700 text-sm hidden lg:inline">
                  Welcome, {getUserDisplayName()}
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center justify-center p-2 rounded-lg border ${isAdmin ? 'border-gray-300 hover:bg-gray-100' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                  <Menu className="h-5 w-5 text-gray-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* User Info Section */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center space-x-2">
                      {isAdmin ? <Shield className="h-4 w-4 text-gray-500" /> : <User className="h-4 w-4 text-gray-500" />}
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{isAdmin ? 'Administrator' : getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Navigation Section */}
                  <DropdownMenuGroup>
                    {isAdmin ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/rtd-learning-admin-dashboard')}>
                          <Shield className="w-4 h-4 mr-2" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => navigate('/rtd-learning-admin-dashboard#users')}>
                          <Users className="w-4 h-4 mr-2" />
                          <span>Manage Users</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => navigate('/rtd-learning-admin-dashboard#analytics')}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          <span>Analytics</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/rtd-learning-dashboard')}>
                          <Home className="w-4 h-4 mr-2" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => navigate('/rtd-learning-dashboard#courses')}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          <span>Browse Courses</span>
                        </DropdownMenuItem>
                        
                        {onProfileClick && (
                          <DropdownMenuItem onClick={onProfileClick}>
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Profile Settings</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Other Portals */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      OTHER PORTALS
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      <div className="flex items-center space-x-2">
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
                        <span className="text-sm">RTD Academy</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
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
    </header>
  );
}

export default RTDLearningHeader;