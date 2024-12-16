import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import PlanAlignment from './Domains/PlanAlignment';
import StudentGrowth from './Domains/StudentGrowth';
import TeachingDomain from './Domains/TeachingDomain';
import LearningSupports from './Domains/LearningSupports';
import GovernanceDomain from './Domains/GovernanceDomain';
import StakeholderEngagement from './Domains/StakeholderEngagement';
import LocalContext from './Domains/LocalContext';
import ProvincialMeasures from './Domains/ProvincialMeasures';

const DomainsDashboard = () => {
  const tabs = [
    { value: "alignment", label: "Plan Alignment", component: <PlanAlignment /> },
    { value: "measures", label: "Measures", component: <ProvincialMeasures /> },
    { value: "growth", label: "Student Growth", component: <StudentGrowth /> },
    { value: "teaching", label: "Teaching", component: <TeachingDomain /> },
    { value: "supports", label: "Learning Supports", component: <LearningSupports /> },
    { value: "governance", label: "Governance", component: <GovernanceDomain /> },
    { value: "stakeholders", label: "Stakeholders", component: <StakeholderEngagement /> },
    { value: "context", label: "Local Context", component: <LocalContext /> }
  ];

  return (
    <div className="bg-slate-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Required Domains Analysis</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          2023-24 Results
        </span>
      </div>
      
      <div className="bg-white rounded-lg p-4">
        <p className="text-gray-600 mb-6">
          Analysis of our performance across Alberta Education's required assurance domains, 
          including alignment with our education plan, measures of student achievement, 
          teaching quality, learning supports, governance, and alignment with provincial requirements.
        </p>
        
        <Tabs defaultValue="alignment" className="w-full">
          {/* On mobile: vertical stack or horizontal scroll */}
          <div className="md:hidden overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-full">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* On desktop: grid layout */}
          <div className="hidden md:block">
            <TabsList className="grid grid-cols-8">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab content */}
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default DomainsDashboard;