import React from 'react';
import { Card } from "../../../../components/ui/card";
import { FileSignature } from 'lucide-react';

const AccountabilityStatement = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Accountability Statement</h2>
      
      <Card className="p-8">
        <div className="flex items-start gap-3 mb-6">
          <FileSignature className="h-6 w-6 text-gray-700 mt-1" />
          <h3 className="text-xl font-semibold">Accountability Statement for the 2024-2027 Education Plan</h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The Education Plan for RTD Academy commencing September 1, 2024 was prepared under the 
            direction of the Board of Directors in accordance with the responsibilities under the Private 
            Schools Regulation and the Ministerial Grants Regulation. This plan was developed in the 
            context of the provincial government's business and fiscal plans. The Board has used its 
            performance results to develop the plan and is committed to implementing the strategies 
            contained within the plan to improve student learning and results.
          </p>
          
          <p className="text-lg">
            The Board approved the 2024/2027 Education Plan on ____________________
          </p>
          
          <div className="mt-8 space-y-4">
            <div>
              <p className="font-medium">Board Chair: Nikki Allen</p>
            </div>
            
            <div>
              <p className="font-medium">Board Chair Signature: ______________________</p>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-gray-600">Review Date: May 31, 2025</p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AccountabilityStatement;