import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Star, Users, Heart } from "lucide-react";

const PersonalDevelopment = () => {
  // Sample data - clearly marked
  const sampleDevelopmentData = {
    skills: [
      { skill: "Time Management", level: "Developing" },
      { skill: "Public Speaking", level: "Beginning" },
      { skill: "Leadership", level: "Intermediate" },
      { skill: "Critical Thinking", level: "Advanced" }
    ],
    activities: [
      { name: "Math Club - President", type: "Leadership" },
      { name: "Robotics Team - Lead Programmer", type: "Technical" },
      { name: "Hospital Volunteer", type: "Community Service" },
      { name: "Debate Team", type: "Communication" }
    ],
    achievements: [
      { title: "Math Competition Winner", date: "March 2024" },
      { title: "Volunteer of the Month", date: "January 2024" },
      { title: "Robotics Regional Champion", date: "May 2024" }
    ]
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginning: "text-blue-600 bg-blue-100",
      Developing: "text-yellow-600 bg-yellow-100",
      Intermediate: "text-orange-600 bg-orange-100",
      Advanced: "text-green-600 bg-green-100"
    };
    return colors[level] || "text-gray-600 bg-gray-100";
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Personal Development</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Skills Development (Sample)
          </h3>
          <div className="space-y-3">
            {sampleDevelopmentData.skills.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.skill}</span>
                <Badge className={getLevelColor(item.level)}>{item.level}</Badge>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Extracurricular Activities (Sample)
          </h3>
          <ul className="space-y-3">
            {sampleDevelopmentData.activities.map((activity, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{activity.name}</span>
                <Badge variant="outline">{activity.type}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Achievements & Recognition (Sample)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleDevelopmentData.achievements.map((achievement, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-1">{achievement.title}</div>
              <div className="text-sm text-gray-600">{achievement.date}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default PersonalDevelopment;