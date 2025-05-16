import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Users, Calendar, Globe, BookOpen, Laptop } from 'lucide-react';

const SchoolProfile = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">School Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            About RTD Academy
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Founded</p>
              <p className="font-medium">September 2022</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">School Type</p>
              <p className="font-medium">Online Private School</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Learning Model</p>
              <p className="font-medium">Asynchronous, Self-Paced</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Area</p>
              <p className="font-medium">Province-wide (Alberta)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Demographics (2023-24)
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Total Unique Students</span>
              <Badge variant="secondary">806</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Course Enrollments</span>
              <Badge variant="secondary">1,294</Badge>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Non-Primary Students</span>
                <span>635 (78.8%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Summer School Students</span>
                <span>197 (24.4%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Primary Students</span>
                <span>62 (7.7%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Adult Students</span>
                <span>63 (7.8%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Home Education Students</span>
                <span>47 (5.8%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>First Nations Students</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Laptop className="h-5 w-5" />
          Educational Focus & Offerings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Core Subject Areas</h4>
            <ul className="space-y-1 text-sm">
              <li>• High School Mathematics (10-3 through 31)</li>
              <li>• Technology & Computer Programming</li>
              <li>• STEM-focused curriculum</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Unique Features</h4>
            <ul className="space-y-1 text-sm">
              <li>• Year-round enrollment</li>
              <li>• Flexible scheduling</li>
              <li>• Interactive online courses</li>
              <li>• Expert math teacher support</li>
              <li>• Custom learning management system</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Organizational Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Governance</h4>
            <ul className="space-y-1 text-sm">
              <li>• Board Chair: Nikki Allen</li>
              <li>• Treasurer: Danielle Wilson</li>
              <li>• Directors: Candace Perras, Sherry Haarstad, Toni-Lee Hazlett</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Funding Model</h4>
            <ul className="space-y-1 text-sm">
              <li>• Primary funding: Non-primary distance education grant</li>
              <li>• Grant funding: 96.4% of revenue</li>
              <li>• Tuition income: 3.6% of revenue</li>
              <li>• Free courses for Alberta students</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Three-Year Planning Context</h4>
            <p className="text-sm text-blue-800">
              This education plan represents the third and final year of our current planning cycle (2023-2026), 
              building on two years of operational experience and continuous improvement. Our evolution from startup 
              to serving over 800 students demonstrates our commitment to accessible, high-quality online STEM education.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SchoolProfile;