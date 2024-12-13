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
                <TabsTrigger value="aerr">Current AERR</TabsTrigger>
                <TabsTrigger value="documents">Documents & Archive</TabsTrigger>
              </TabsList>
              
              <TabsContent value="policies">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">School Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PolicyLink 
                      icon={Shield}
                      title="Safe & Caring School"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EfL2P1EAyrJNo4gxv5XhiJEBpgsZSs8iolelYnOx8dTr6w?e=aLeXHC"
                    />
                    <PolicyLink 
                      icon={AlertTriangle}
                      title="Emergency Procedures"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EUzxdzSaR0tFolUul0Fw1U0BKDEUuAtnFAK2Giw-S8sZhg?e=t7gQFv"
                    />
                    <PolicyLink 
                      icon={Heart}
                      title="Health Protocol Policy"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/Eb3gwMHWKlBJgEXaODAQzNEBbezap7g8femmch86azCsOw?e=eLPVKe"
                    />
                    <PolicyLink 
                      icon={GraduationCap}
                      title="Assessment of Students"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EUbYacmcLntAvluWc_SXASIBE1IBu3cIomifVSr6DUGA1Q?e=bT4yjB"
                    />
                    <PolicyLink 
                      icon={Scale}
                      title="Discipline Policy"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EXpp_XX1_MZFgCHsj_o8hO4Bt3fTFBHQR1q45tSrgBp2yA?e=cdGdq7"
                    />
                    <PolicyLink 
                      icon={Users}
                      title="Teacher Growth, Supervision & Evaluation"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EUFg7DPK6HtBncVYQmt9RM4By5MWArRJFbYMKo4N9uEzRA?e=HCaq89"
                    />
                    <PolicyLink 
                      icon={Map}
                      title="Safety for Field Trips"
                      href="https://rtdacademy.sharepoint.com/:w:/s/RTDMathAcademy/EcfAUREsGn9Jtw8rmg-QV2QBeV3-Ip0rSacrzLP-cvM9Zw?e=NKmCua"
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
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDMathAcademy/EXJhl1q5gfdCpdLRlUALWnEBBpre3_3IB0Vlrcrum7vp3g?e=EeB91R"
                      date="Current"
                    />
                    <DocumentLink 
                      icon={Calculator}
                      title="Budget 2024-2025"
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDMathAcademy/EfaSg3pjUPZOsS0z8VVsNmQBpYVDpyIS_RiMR4dYICVe6w?e=gZgE76"
                      date="2024-2025"
                    />
                    <DocumentLink 
                      icon={FileText}
                      title="Previous AERR (2022-2023)"
                      href="https://rtdacademy.sharepoint.com/:b:/s/RTDMathAcademy/Ec01JbLmKXVAkTYjdlPJGDMBuOt7rqhp-riGc3aY9hpzLg?e=XTzfRp"
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