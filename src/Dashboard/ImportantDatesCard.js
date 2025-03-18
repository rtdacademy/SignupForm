// src/components/ImportantDatesCard.js
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Calendar, Info, AlertTriangle } from "lucide-react";
import { useRegistrationPeriod } from '../utils/registrationPeriods';

export function ImportantDatesCard() {
  const { 
    period, 
    nextYearRegistrationDate,
    canRegisterForNextYear
  } = useRegistrationPeriod();
  
  const [importantDates, setImportantDates] = useState([]);
  const [nextYearDescription, setNextYearDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all important dates
  useEffect(() => {
    const fetchImportantDates = async () => {
      try {
        setLoading(true);
        const db = getDatabase();
        const importantDatesRef = ref(db, 'ImportantDates');
        const snapshot = await get(importantDatesRef);

        if (snapshot.exists()) {
          const datesData = snapshot.val();
          
          // Format dates for display
          const formattedDates = Object.entries(datesData).map(([key, date]) => {
            // Parse the date correctly in local time
            const [year, month, day] = date.displayDate.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            
            return {
              id: key,
              title: date.title,
              date: dateObj,
              displayDate: date.displayDate,
              description: date.description || '',
              formattedDate: dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
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
        }
      } catch (err) {
        console.error("Error fetching important dates:", err);
        setError("Failed to load upcoming dates");
      } finally {
        setLoading(false);
      }
    };

    fetchImportantDates();
  }, []);
  
  if (loading) {
    return (
      <Card className="bg-white shadow hover:shadow-md transition-all duration-200">
        <CardHeader className="bg-gradient-to-br from-background to-muted pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="animate-pulse flex flex-col space-y-3">
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow hover:shadow-md transition-all duration-200">
        <CardHeader className="bg-gradient-to-br from-background to-muted pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center text-red-600 space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter to show only future/current dates and a limited number of past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // First get future dates
  const futureDates = importantDates.filter(date => date.date >= today);
  
  // Then get past dates (within the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  const recentPastDates = importantDates.filter(date => 
    date.date < today && date.date >= sevenDaysAgo
  );
  
  // Combine and sort them
  const filteredDates = [...futureDates, ...recentPastDates].sort((a, b) => a.date - b.date);
  
  return (
    <Card className="bg-white shadow hover:shadow-md transition-all duration-200">
      <CardHeader className="bg-gradient-to-br from-background to-muted pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Upcoming Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* If we have a description for next year registration, show it */}
        {nextYearDescription && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <Info className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-1">Next School Year Registration Information</p>
                <p>{nextYearDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Important Dates List */}
        <div className="space-y-3">
          {filteredDates.length > 0 ? (
            <ul className="space-y-2">
              {filteredDates.map((date) => {
                const isPast = date.date < new Date();
                const isToday = date.date.toDateString() === new Date().toDateString();
                
                return (
                  <li key={date.id} className={`flex items-start py-2 border-b border-gray-100 ${isPast ? 'opacity-70' : ''}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      isPast 
                        ? 'bg-gray-100 text-gray-500' 
                        : isToday 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {date.title}
                        {isToday && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{date.formattedDate}</div>
                      {date.description && (
                        <div className="text-sm text-gray-500 mt-1">{date.description}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No upcoming dates at this time.</p>
          )}
        </div>
        
        {/* Current Registration Period Status */}
        <div className="rounded-md border p-3 bg-gray-50">
          <h4 className="font-medium text-gray-700 text-sm mb-1">Current Registration Status</h4>
          <p className="text-sm text-gray-600">
            {period === 'REGULAR' && !canRegisterForNextYear && (
              <>Current Year Registration Only</>
            )}
            {period === 'REGULAR' && canRegisterForNextYear && (
              <>Current Year and Next Year Registration Available</>
            )}
            {period === 'SUMMER' && (
              <>Summer School Registration Period</>
            )}
            {period === 'NEXT_REGULAR' && (
              <>Next School Year Registration Period</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}