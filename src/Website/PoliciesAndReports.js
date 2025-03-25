import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import AERR2324 from './AERR/23_24/AERR2324';
import { 
  Shield, 
  AlertTriangle, 
  Heart, 
  GraduationCap, 
  Scale,
  Users,
  Map,
  FileText,
  Calculator,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

const handleBackClick = () => {
  window.location.href = 'https://www.rtdacademy.com/';
};

const PolicyLink = ({ icon: Icon, title, href }) => (
  <Button 
    variant="outline" 
    className="w-full flex items-center justify-start gap-3 p-6 h-auto"
    asChild
  >
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Icon className="h-6 w-6 flex-shrink-0" />
      <span className="text-left">{title}</span>
    </a>
  </Button>
);

const DocumentLink = ({ icon: Icon, title, href, date }) => (
  <Button 
    variant="outline" 
    className="w-full flex items-center justify-start gap-3 p-6 h-auto"
    asChild
  >
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3"
    >
      <Icon className="h-6 w-6 flex-shrink-0" />
      <div className="flex flex-col items-start">
        <span className="font-semibold">{title}</span>
        {date && <span className="text-sm text-gray-500">{date}</span>}
      </div>
    </a>
  </Button>
);

const PoliciesAndReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
  {/* Back Button */}
  <Button
          variant="ghost"
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Site
        </Button>
        <Card className="w-full">
          
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">RTD Academy Policies & Reports</CardTitle>
            
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="policies" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="aerr">AERR 23/24</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="policies">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">School Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PolicyLink 
                      icon={Shield}
                      title="Safe & Caring School"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EXQneL8kVxtNtRL1nRLd16wB6pcQkGFH5Mor1ITxfFKsMA?e=V2mLk7"
                    />
                    <PolicyLink 
                      icon={AlertTriangle}
                      title="Emergency Procedures"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EeLFulPeZXlIoT_2sVsYgNcBWjt0snVrciL5n3JxZObXdg?e=qVkY7z"
                    />
                    <PolicyLink 
                      icon={Heart}
                      title="Health Protocol Policy"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EU9_Rd6iHupGgy1z3f_LCYMBFRO55sVYX2T_D8XbX8MI4A?e=bCFLT7"
                    />
                    <PolicyLink 
                      icon={GraduationCap}
                      title="Assessment of Students"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EeKIQKTSaORGsDbpL2FWB_wBxnl7aclptk6fq1Sbfu33NA?e=rOE8DT"
                    />
                    <PolicyLink 
                      icon={Scale}
                      title="Discipline Policy"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EfXfyUrGddhIps8Rg5JJ-GMB8DbLoCmqbbmoeLdbVcwhuA?e=PLNjra"
                    />
                    <PolicyLink 
                      icon={Users}
                      title="Teacher Growth, Supervision & Evaluation"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/EWCYnziKGZdJruVblbLC7u8BYnGLvoYLyeaXXKpFRiKupQ?e=HkO6j2"
                    />
                    <PolicyLink 
                      icon={Map}
                      title="Safety for Field Trips"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDAdministration/Eecl8T_Ivb9GnH4fSo_EuFMB2RliovzepfEhgqs0jmRC9g?e=7EZxkx"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="aerr">
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Education Results Report 2023-24</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AERR2324 />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Important Documents</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <DocumentLink 
                      icon={BookOpen}
                      title="Education Plan"
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EYYUkFuBkcZLlnpBU2WwSD8B3XTunO3WRUVEjQJMQiJhQg?e=Q9R8T4"
                      date="Current"
                    />
                    <DocumentLink 
                      icon={Calculator}
                      title="Budget 2024-2025"
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EdmbZ58KeCVPpvn4rl9MZHQBgnIfNnnrCki8Be24DWwwQA?e=tny7Yr"
                      date="2024-2025"
                    />
                    <DocumentLink 
                      icon={FileText}
                      title="Previous AERR (2022-2023)"
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/ERJtO6M-KIdHqCj8ivnzGRYBl9P0JV05CGUyYToBLaVyew?e=xDC9uc"
                      date="2022-2023"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliciesAndReports;