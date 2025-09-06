import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import NotificationCenter from './NotificationCenter';

const NotificationCenterSheet = ({ 
  courses, 
  profile, 
  markNotificationAsSeen, 
  submitSurveyResponse, 
  forceRefresh, 
  allNotifications 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate notification counts for the badge
  const activeNotifications = allNotifications?.filter(n => n.active && !n.hasSeen) || [];
  const hasUnreadNotifications = activeNotifications.length > 0;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50 px-3"
        >
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {hasUnreadNotifications && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-sm font-medium">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" size="lg" className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <NotificationCenter
            courses={courses}
            profile={profile}
            markNotificationAsSeen={markNotificationAsSeen}
            submitSurveyResponse={submitSurveyResponse}
            forceRefresh={forceRefresh}
            allNotifications={allNotifications}
            renderAsSheet={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenterSheet;