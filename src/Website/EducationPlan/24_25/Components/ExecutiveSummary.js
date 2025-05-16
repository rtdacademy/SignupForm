import React from 'react';
import { Card } from "../../../../components/ui/card";

const ExecutiveSummary = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Executive Summary</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            This Education Plan represents the culmination of RTD Academy's three-year planning cycle (2023-2026) and 
            provides the foundation for our transition to the next strategic planning period. As an innovative online 
            school specializing in mathematics and STEM education, we have grown from our founding in September 2022 
            to serve 806 unique students with 1,294 course enrollments in the 2023-24 school year.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <Card className="p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">Key Achievements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>89% student satisfaction rate</li>
                <li>90% parent satisfaction rate</li>
                <li>77.6% overall completion rate (+8.1% from previous year)</li>
                <li>Province-wide accessibility through asynchronous delivery</li>
                <li>Custom technology platform development</li>
              </ul>
            </Card>
            
            <Card className="p-4 bg-amber-50">
              <h3 className="font-semibold text-amber-900 mb-2">Priority Focus Areas</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Math diploma exam results (60.9% vs 81.5% provincial)</li>
                <li>Mathematics 10C and 20-2 performance enhancement</li>
                <li>Early identification systems for at-risk students</li>
                <li>Indigenous education strategy development</li>
                <li>Technology integration expansion</li>
              </ul>
            </Card>
          </div>
          
          <p className="leading-relaxed">
            Our third-year plan builds on the successes of our asynchronous learning model while addressing critical 
            performance gaps identified in our 2023-24 Annual Education Results Report. With a focus on improving 
            mathematics achievement, enhancing support systems, and expanding our technology integration, we aim to 
            ensure every student has the opportunity to excel in STEM education.
          </p>
          
          <p className="leading-relaxed">
            The five key priorities outlined in this plan align with Alberta Education's Assurance Framework and 
            respond directly to stakeholder feedback. Our commitment to continuous improvement, data-driven decision 
            making, and responsive educational practices positions RTD Academy to continue serving Alberta's diverse 
            student population with excellence and innovation.
          </p>
        </div>
      </Card>
    </section>
  );
};

export default ExecutiveSummary;