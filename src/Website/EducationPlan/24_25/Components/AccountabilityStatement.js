import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { FileSignature, ExternalLink } from 'lucide-react';

const AccountabilityStatement = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Accountability Statement</h2>
      
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <FileSignature className="h-6 w-6 text-gray-700 mt-1" />
            <h3 className="text-xl font-semibold">Accountability Statement for the 2023-2026 Education Plan</h3>
          </div>
          <Button
            variant="outline"
            size="default"
            className="flex flex-col items-center gap-1 px-4 py-3"
            asChild
          >
            <a 
              href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EU2AfZvjJGxBoHTKaS9Z-vYBv5T_ZMFcxnUCcJ0yTts-3A?e=1ckgoy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="text-sm">View Signed Document</span>
            </a>
          </Button>
        </div>
        
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The Education Plan for RTD Academy commencing September 1, 2025 was prepared under the 
            direction of the Board of Directors in accordance with the responsibilities under the Private 
            Schools Regulation and the Ministerial Grants Regulation. This plan was developed in the 
            context of the provincial government's business and fiscal plans. The Board has used its 
            performance results to develop the plan and is committed to implementing the strategies 
            contained within the plan to improve student learning and results.
          </p>
          
        </div>
      </Card>
    </section>
  );
};

export default AccountabilityStatement;