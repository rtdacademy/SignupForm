// src/components/ImportantDatesCard.js
import React, { useState, useEffect } from 'react';
import { Calendar, Info, AlertTriangle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { getStudentTypeInfo } from '../config/DropdownOptions';
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Alert, AlertDescription } from "../components/ui/alert";

export function ImportantDatesCard({ importantDates: importantDatesData }) {
  const [importantDates, setImportantDates] = useState([]);
  const [nextYearDescription, setNextYearDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPastDates, setShowPastDates] = useState(false);

  // Get today's date formatted nicely
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Process important dates when the prop changes
  useEffect(() => {
    try {
      setLoading(true);
      
      if (!importantDatesData) {
        setImportantDates([]);
        setLoading(false);
        return;
      }
      
      // Format dates for display
      const formattedDates = Object.entries(importantDatesData).map(([key, date]) => {
        // Parse the start date correctly in local time
        const [year, month, day] = date.displayDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        // Parse end date if it exists
        let endDateObj = null;
        if (date.endDateDisplayDate) {
          const [endYear, endMonth, endDay] = date.endDateDisplayDate.split('-').map(Number);
          endDateObj = new Date(endYear, endMonth - 1, endDay);
        }
        
        return {
          id: key,
          title: date.title,
          date: dateObj,
          displayDate: date.displayDate,
          description: date.description || '',
          // Add end date information if available
          endDate: endDateObj,
          endDateDisplay: date.endDateDisplayDate,
          // Add the applicable student types, defaulting to empty array if not present
          applicableStudentTypes: date.applicableStudentTypes || [],
          formattedDate: dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          formattedEndDate: endDateObj ? endDateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : null
        };
      });
      
      // Sort dates by chronological order
      formattedDates.sort((a, b) => a.date - b.date);
      
      setImportantDates(formattedDates);
      
      // Find the next year registration description
      const nextYearRegDate = formattedDates.find(
        date => date.title === "Next School Year Registration Opens"
      );
      
      if (nextYearRegDate) {
        setNextYearDescription(nextYearRegDate.description || '');
      }
    } catch (err) {
      console.error("Error processing important dates:", err);
      setError("Failed to process dates");
    } finally {
      setLoading(false);
    }
  }, [importantDatesData]);
  
  // Rest of the component remains the same...
  
  // Filter dates based on toggle
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get future and today's dates (including dates where the end date is in the future)
  const futureDates = importantDates.filter(date => {
    const dateWithoutTime = new Date(date.date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    
    // Include if start date is today or in future
    if (dateWithoutTime >= today) return true;
    
    // Include if there's an end date and it's today or in the future
    if (date.endDate) {
      const endDateWithoutTime = new Date(date.endDate);
      endDateWithoutTime.setHours(0, 0, 0, 0);
      return endDateWithoutTime >= today;
    }
    
    return false;
  });
  
  // Get past dates (where both start and end dates are in the past)
  const pastDates = importantDates.filter(date => {
    const dateWithoutTime = new Date(date.date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    
    // If there's an end date, only consider it past if the end date is in the past
    if (date.endDate) {
      const endDateWithoutTime = new Date(date.endDate);
      endDateWithoutTime.setHours(0, 0, 0, 0);
      return endDateWithoutTime < today;
    }
    
    // Otherwise, just check the start date
    return dateWithoutTime < today;
  });
  
  // Combine based on toggle state
  const displayDates = showPastDates 
    ? [...futureDates, ...pastDates].sort((a, b) => a.date - b.date)
    : futureDates;
  
  // Function to determine if a date is approaching (within 14 days)
  const isDateApproaching = (dateObj) => {
    if (!dateObj) return false;
    const daysDifference = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
    return daysDifference > 0 && daysDifference <= 14;
  };
  
  // Function to render student type badges with improved clarification
  const renderStudentTypeBadges = (types) => {
    if (!types || types.length === 0) return null;
    
    return (
      <div className="mt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center text-xs text-gray-500 cursor-help">
                <Info className="h-3 w-3 mr-1" />
                <span>Only applies to these student types</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white p-2 shadow-md rounded-md border border-gray-200">
              <p className="text-xs">This date is only relevant if you are or will become one of these student types</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-wrap gap-1 mt-1">
          {types.map((type) => {
            const { color, icon: Icon } = getStudentTypeInfo(type);
            return (
              <span 
                key={type} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${color}20`, color: color }}
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {type}
              </span>
            );
          })}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse flex flex-col space-y-3">
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4">
        <div className="flex items-center text-red-600 space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Today's Date Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3">
        <div>
          <p className="text-sm text-gray-500">{todayFormatted}</p>
        </div>
        {pastDates.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 md:mt-0"
            onClick={() => setShowPastDates(!showPastDates)}
          >
            {showPastDates ? (
              <span className="flex items-center">
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Past Dates
              </span>
            ) : (
              <span className="flex items-center">
                <ChevronDown className="h-4 w-4 mr-1" />
                Past
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Dates List without a fixed height ScrollArea */}
      <div className="rounded-md border">
        <div className="p-4">
          {displayDates.length > 0 ? (
            <ul className="space-y-3">
              {displayDates.map((date) => {
                const isPast = date.date < today;
                const isToday = date.date.toDateString() === today.toDateString();
                const isActive = date.endDate ? 
                  (date.date <= today && date.endDate >= today) : 
                  (date.date === today);
                const isStartApproaching = isDateApproaching(date.date);
                const isEndApproaching = isDateApproaching(date.endDate);
                
                return (
                  <li key={date.id} className={`flex items-start py-2 border-b border-gray-100 ${isPast && !isActive ? 'opacity-70' : ''}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      isPast && !isActive
                        ? 'bg-gray-100 text-gray-500' 
                        : isToday || isActive
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {date.title}
                        {isToday && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded">
                            Today
                          </span>
                        )}
                        {isActive && !isToday && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {/* Date display with possible range */}
                      <div className="text-sm text-gray-600">
                        {date.formattedDate}
                        {date.formattedEndDate && (
                          <> - {date.formattedEndDate}</>
                        )}
                      </div>
                      
                      {/* Approaching warnings */}
                      {isStartApproaching && !isActive && (
                        <Alert variant="warning" className="mt-2 py-2 bg-amber-50 border-amber-200">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-700">
                            Start date is approaching!
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {isEndApproaching && isActive && (
                        <Alert variant="warning" className="mt-2 py-2 bg-red-50 border-red-200">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-xs text-red-700">
                            Deadline approaching! Ends on {date.formattedEndDate}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {date.description && (
                        <div className="text-sm text-gray-500 mt-1">{date.description}</div>
                      )}
                      
                      {/* Updated Student Type Badges with better clarification */}
                      {renderStudentTypeBadges(date.applicableStudentTypes)}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No upcoming dates at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}