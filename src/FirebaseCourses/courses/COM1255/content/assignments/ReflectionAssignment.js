import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Textarea } from '../../../../../components/ui/textarea';
import { Button } from '../../../../../components/ui/button';

const ReflectionAssignment = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>E-Learning Reflection Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assignment Overview</h3>
            <p>
              In this assignment, you will reflect on your own experiences with e-learning 
              and how they relate to the concepts we've covered in the introduction.
            </p>
            
            <h3 className="text-lg font-medium mt-6">Instructions</h3>
            <div className="space-y-2">
              <p>Write a 500-word reflection addressing the following points:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your prior experience with online learning (if any)</li>
                <li>Which benefits of e-learning are most important to you personally</li>
                <li>Which challenges you anticipate facing in this course</li>
                <li>Strategies you plan to use to overcome these challenges</li>
                <li>How you think e-learning will evolve in the next 5-10 years</li>
              </ul>
            </div>
            
            <h3 className="text-lg font-medium mt-6">Submission</h3>
            <div className="border rounded-md p-4 bg-gray-50">
              <Textarea 
                placeholder="Enter your reflection here..." 
                className="min-h-[300px]"
              />
              <div className="flex justify-end mt-4">
                <Button>Save Draft</Button>
                <Button className="ml-2" variant="default">Submit</Button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-6">Grading Criteria</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Thoughtful reflection on personal experience (25%)</li>
              <li>Understanding of e-learning concepts (25%)</li>
              <li>Realistic assessment of challenges and strategies (25%)</li>
              <li>Quality of writing and organization (15%)</li>
              <li>Adherence to word count and submission guidelines (10%)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReflectionAssignment;