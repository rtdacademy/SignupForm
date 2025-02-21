import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import EnrollmentCharts from './EnrollmentCharts'; 
import EnrollmentTiming from './EnrollmentTiming';
import RevenueProjections from './RevenueProjections';
import PrimarySchoolsView from './PrimarySchoolsView';

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
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="primary">Primary Schools</TabsTrigger>
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

        <TabsContent value="revenue" className="space-y-4">
          <RevenueProjections
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
        
        <TabsContent value="details">
          <div className="p-4 text-center text-muted-foreground">
            Detailed view coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnrollmentStatistics;