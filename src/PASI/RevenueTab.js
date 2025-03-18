import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DollarSign, GraduationCap, Home, SunMedium, User, Globe } from 'lucide-react';

// Import revenue tab components
import NonPrimaryRevenueTab from './NonPrimaryRevenueTab';
import HomeEducationRevenueTab from './HomeEducationRevenueTab';
import SummerSchoolRevenueTab from './SummerSchoolRevenueTab';
import AdultStudentRevenueTab from './AdultStudentRevenueTab';
import InternationalStudentRevenueTab from './InternationalStudentRevenueTab';

const RevenueTab = ({ records }) => {
  const [activeTab, setActiveTab] = useState("non-primary");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-green-600" />
            Revenue Analysis Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analysis of revenue from different student categories
          </p>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="non-primary" 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-1 mb-6">
              <TabsTrigger value="non-primary" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Non-Primary
              </TabsTrigger>
              <TabsTrigger value="home-education" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home Education
              </TabsTrigger>
              <TabsTrigger value="summer-school" className="flex items-center gap-2">
                <SunMedium className="h-4 w-4" />
                Summer School
              </TabsTrigger>
              <TabsTrigger value="adult-student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Adult Student
              </TabsTrigger>
              <TabsTrigger value="international-student" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                International Student
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="non-primary">
              <NonPrimaryRevenueTab records={records} />
            </TabsContent>
            
            <TabsContent value="home-education">
              <HomeEducationRevenueTab records={records} />
            </TabsContent>
            
            <TabsContent value="summer-school">
              <SummerSchoolRevenueTab records={records} />
            </TabsContent>
            
            <TabsContent value="adult-student">
              <AdultStudentRevenueTab records={records} />
            </TabsContent>
            
            <TabsContent value="international-student">
              <InternationalStudentRevenueTab records={records} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueTab;