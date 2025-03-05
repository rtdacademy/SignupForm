import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import EnrollmentCharts from './EnrollmentCharts'; 
import EnrollmentTiming from './EnrollmentTiming';
import RevenueProjections from './RevenueProjections';
import PrimarySchoolsView from './PrimarySchoolsView';
import UserActivity from './UserActivity';
import PermissionIndicator from '../context/PermissionIndicator';
import { useAuth } from '../context/AuthContext';

const getCurrentSchoolYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const startYear = month < 9 ? year - 1 : year;
  const shortStartYear = startYear.toString().slice(-2);
  const shortEndYear = (startYear + 1).toString().slice(-2);
  return `${shortStartYear}/${shortEndYear}`;
};

const EnrollmentStatistics = () => {
  const [summariesData, setSummariesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(getCurrentSchoolYear());
  const [activeTab, setActiveTab] = useState("charts");
  const { requiresAdminAccess } = useAuth();
  const isAdmin = requiresAdminAccess();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDatabase();
        const summariesRef = ref(db, 'studentCourseSummaries');
        
        onValue(summariesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = [];
            snapshot.forEach((childSnapshot) => {
              const value = childSnapshot.val();
              if (value && value.School_x0020_Year_Value) {
                data.push(value);
              }
            });

            const years = [...new Set(data
              .map(item => item.School_x0020_Year_Value)
              .filter(Boolean)
            )];

            const sortedYears = years.sort((a, b) => {
              const [aStart] = a.split('/').map(Number);
              const [bStart] = b.split('/').map(Number);
              return bStart - aStart;
            });

            setSchoolYears(sortedYears);
            setSummariesData(data);

            if (sortedYears.length > 0 && !sortedYears.includes(selectedSchoolYear)) {
              setSelectedSchoolYear(sortedYears[0]);
            }
          } else {
            setError('No data available');
          }
          setLoading(false);
        }, (error) => {
          console.error('Error loading data:', error);
          setError('Error loading data');
          setLoading(false);
        });
      } catch (error) {
        console.error('Error in fetch:', error);
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSchoolYearChange = (event) => {
    setSelectedSchoolYear(event.target.value);
  };

  // Check if a tab with admin access is currently active but user doesn't have admin rights
  useEffect(() => {
    if (!isAdmin && (activeTab === "revenue" || activeTab === "user-activity")) {
      setActiveTab("charts");
    }
  }, [isAdmin, activeTab]);

  if (loading) {
    return (
      <Alert>
        <AlertDescription>Loading statistics...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold">School Year</h2>
        <select
          value={selectedSchoolYear}
          onChange={handleSchoolYearChange}
          className="px-3 py-2 border rounded-md w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {schoolYears.map((year) => (
            <option key={year} value={year}>
              20{year}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="charts" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="charts">Overview</TabsTrigger>
          <TabsTrigger value="timing">Enrollment Timing</TabsTrigger>
          <TabsTrigger value="primary">Primary Schools</TabsTrigger>
          
          {/* Admin-only tabs with permission indicators */}
          <TabsTrigger value="revenue" disabled={!isAdmin} className="relative">
            Revenue
            {!isAdmin && <PermissionIndicator type="ADMIN" className="ml-1" />}
          </TabsTrigger>
          
          <TabsTrigger value="user-activity" disabled={!isAdmin} className="relative">
            User Activity
            {!isAdmin && <PermissionIndicator type="ADMIN" className="ml-1" />}
          </TabsTrigger>
          
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <EnrollmentCharts 
            summariesData={summariesData}
            selectedSchoolYear={selectedSchoolYear}
          />
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <EnrollmentTiming
            summariesData={summariesData}
            selectedSchoolYear={selectedSchoolYear}
          />
        </TabsContent>

        <TabsContent value="primary" className="space-y-4">
          <PrimarySchoolsView
            summariesData={summariesData}
            selectedSchoolYear={selectedSchoolYear}
          />
        </TabsContent>

        {/* Admin-only content */}
        <TabsContent value="revenue" className="space-y-4">
          {isAdmin ? (
            <RevenueProjections
              summariesData={summariesData}
              selectedSchoolYear={selectedSchoolYear}
            />
          ) : (
            <AdminAccessRequired />
          )}
        </TabsContent>

        <TabsContent value="user-activity" className="space-y-4">
          {isAdmin ? (
            <UserActivity
              summariesData={summariesData}
              selectedSchoolYear={selectedSchoolYear}
            />
          ) : (
            <AdminAccessRequired />
          )}
        </TabsContent>
        
        <TabsContent value="details">
          <div className="p-4 text-center text-muted-foreground">
            Detailed view coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component to show when admin access is required but not available
const AdminAccessRequired = () => {
  const { PERMISSION_INDICATORS } = useAuth();
  const Icon = PERMISSION_INDICATORS.ADMIN.icon;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{PERMISSION_INDICATORS.ADMIN.label}</h3>
      <p className="text-muted-foreground max-w-md">
        {PERMISSION_INDICATORS.ADMIN.description}. Please contact an administrator if you need access to this feature.
      </p>
    </div>
  );
};

export default EnrollmentStatistics;