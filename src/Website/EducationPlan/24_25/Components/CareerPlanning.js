import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Briefcase, GraduationCap, BookOpen } from "lucide-react";

const CareerPlanning = () => {
  // Sample data - clearly marked
  const sampleCareerData = {
    interests: ["Engineering", "Technology", "Healthcare", "Research"],
    universities: [
      { name: "University of Alberta", program: "Computer Science", status: "Researching" },
      { name: "University of Calgary", program: "Mechanical Engineering", status: "Applied" },
      { name: "University of Toronto", program: "Pre-Med Program", status: "Interested" }
    ],
    careerExploration: [
      { activity: "Job Shadow - Software Developer", date: "November 2024", completed: true },
      { activity: "Engineering Summer Camp", date: "July 2025", completed: false },
      { activity: "Hospital Volunteer Program", date: "Ongoing", completed: true }
    ]
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Career Planning</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Career Interests (Sample)
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleCareerData.interests.map((interest, index) => (
              <Badge key={index} variant="secondary">{interest}</Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Sample career interests based on assessments and exploration activities
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Career Exploration Activities
          </h3>
          <ul className="space-y-3">
            {sampleCareerData.careerExploration.map((activity, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className={activity.completed ? 'text-gray-600' : ''}>{activity.activity}</span>
                <Badge variant={activity.completed ? "default" : "outline"} className="text-xs">
                  {activity.date}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          University Programs of Interest (Sample)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Institution</th>
                <th className="text-left py-2">Program</th>
                <th className="text-left py-2">Status</th>
              </try>
            </thead>
            <tbody>
              {sampleCareerData.universities.map((uni, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{uni.name}</td>
                  <td className="py-2">{uni.program}</td>
                  <td className="py-2">
                    <Badge variant={uni.status === "Applied" ? "default" : "secondary"}>
                      {uni.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};

export default CareerPlanning;