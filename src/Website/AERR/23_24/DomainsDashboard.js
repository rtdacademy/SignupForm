import React from 'react';
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

const DomainsDashboard = () => {
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
          including measures of student achievement, teaching quality, learning supports, 
          and governance.
        </p>
        
        <Tabs defaultValue="growth" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="growth">Student Growth</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="supports">Learning Supports</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="context">Local Context</TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Student Growth & Achievement</h3>
                
                {/* Diploma Exam Results Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Diploma Examination Results</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Math 30-1 Results</h5>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-600">Acceptable Standard</p>
                            <p className="text-xl font-bold text-blue-600">60.9%</p>
                            <p className="text-xs text-gray-500">vs Provincial: 81.5%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Standard of Excellence</p>
                            <p className="text-xl font-bold text-purple-600">16.7%</p>
                            <p className="text-xs text-gray-500">vs Provincial: 22.6%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Analysis</h5>
                      <p className="text-sm text-gray-600">
                        While showing improvement from previous years (50.0% to 60.9%), 
                        our diploma results indicate an area requiring continued focus. 
                        We are implementing targeted interventions including free diploma 
                        preparation sessions and enhanced practice opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Learning Engagement Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Student Learning Engagement</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Overall Engagement</h5>
                        <p className="text-xl font-bold text-blue-600">89%</p>
                        <p className="text-sm text-gray-600">of students actively engaged in learning</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Key Findings</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• High engagement in technology courses (92%)</li>
                        <li>• Strong participation in asynchronous activities</li>
                        <li>• Areas for improvement in peer collaboration</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* High School Completion Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">High School Completion</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Course Completion Rate</p>
                        <p className="text-xl font-bold text-green-600">77.8%</p>
                        <p className="text-xs text-gray-500">Improved from previous year</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Success Factors</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Flexible pacing options</li>
                        <li>• Individual learning support</li>
                        <li>• Enhanced communication systems</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teaching">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Teaching & Leading</h3>
                
                {/* Education Quality Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Education Quality Measures</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Overall Quality Rating</h5>
                        <p className="text-xl font-bold text-blue-600">8.5/10</p>
                        <p className="text-sm text-gray-600">Based on stakeholder feedback</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Highlights</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Strong technology integration</li>
                        <li>• Innovative teaching methods</li>
                        <li>• Regular professional development</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Professional Development Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Development</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Key Initiatives</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Online teaching methodology training</li>
                        <li>• Assessment strategies workshops</li>
                        <li>• Technology integration sessions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Impact</h5>
                      <p className="text-sm text-gray-600">
                        Enhanced teacher capacity in online instruction, 
                        resulting in improved student engagement and achievement.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="supports">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Learning Supports</h3>
                
                {/* Safe Learning Environment Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Learning Environment</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Student Safety Rating</h5>
                        <p className="text-xl font-bold text-blue-600">98%</p>
                        <p className="text-sm text-gray-600">Feel safe in online environment</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Key Features</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Secure learning platform</li>
                        <li>• Regular monitoring</li>
                        <li>• Clear communication channels</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Support Services Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Support Services</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Available Services</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• One-on-one tutoring</li>
                        <li>• Technical support</li>
                        <li>• Academic counseling</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Usage Statistics</h5>
                      <p className="text-sm text-gray-600">
                        Over 80% of students accessed support services 
                        at least once during the academic year.
                      </p>
                    </div>
                  </div>
                </div>

                {/* First Nations Support Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">First Nations, Métis and Inuit Support</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Initiatives</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Culturally responsive teaching</li>
                        <li>• Flexible scheduling options</li>
                        <li>• Dedicated support staff</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Outcomes</h5>
                      <p className="text-sm text-gray-600">
                        Growing enrollment and success rates among 
                        First Nations, Métis and Inuit students.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Governance</h3>
                
                {/* Parental Involvement Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Parental Involvement</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">Parent Engagement</h5>
                        <p className="text-xl font-bold text-blue-600">76%</p>
                        <p className="text-sm text-gray-600">Regular platform access</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Engagement Methods</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Weekly progress updates</li>
                        <li>• Parent portal access</li>
                        <li>• Regular feedback channels</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Financial Overview Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Financial Management</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Budget Overview</h5>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-lg font-bold text-green-600">$200,410</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Expenses</p>
                          <p className="text-lg font-bold text-red-600">$196,869</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Financial Allocation</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Staff Development: $10,531</li>
                        <li>• Educational Resources: $45,234</li>
                        <li>• Technology Infrastructure: $38,652</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stakeholders">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Stakeholder Engagement</h3>
                
                {/* Engagement Methods */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Methods</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Communication Channels</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Weekly progress reports</li>
                        <li>• Bi-annual surveys</li>
                        <li>• Regular stakeholder meetings</li>
                        <li>• Online feedback forms</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Participation Metrics</h5>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Survey Response Rate</p>
                          <p className="text-lg font-bold text-blue-600">82%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Parent Portal Usage</p>
                          <p className="text-lg font-bold text-green-600">76%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Implementation */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Feedback Implementation</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Key Actions Taken</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Enhanced communication software</li>
                        <li>• Expanded support hours</li>
                        <li>• Additional learning resources</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Impact Assessment</h5>
                      <p className="text-sm text-gray-600">
                        Implementation of stakeholder feedback has led to measurable 
                        improvements in student engagement and satisfaction rates.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="context">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Local and Societal Context</h3>
                
                {/* Demographics */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Student Demographics</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Regional Distribution</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Calgary Region: 34.47%</li>
                        <li>• Edmonton Region: 32.77%</li>
                        <li>• Central Alberta: 21.36%</li>
                        <li>• Southern Alberta: 5.10%</li>
                        <li>• Northern Alberta: 4.37%</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Student Composition</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Urban Students: 69.64%</li>
                        <li>• Rural Students: 29.11%</li>
                        <li>• First Nations Students: 6.07%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Community Impact */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Community Impact</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Educational Access</h5>
                      <p className="text-sm text-gray-600">
                        Providing essential STEM education access to rural and remote 
                        communities through our online platform, particularly following 
                        the closure of ADLC.
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Future Initiatives</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Expanding course offerings</li>
                        <li>• Enhanced rural outreach</li>
                        <li>• Community partnerships</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DomainsDashboard;