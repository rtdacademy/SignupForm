import React from 'react';
import { Card } from "../../components/ui/card";
import { Scale, Users, AlertTriangle, Shield, Calendar } from 'lucide-react';

const ConflictOfInterestPolicy = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Conflict of Interest Policy
        </h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Purpose</h3>
        <p className="text-gray-700">
          This policy outlines the expectations and procedures at RTD Math Academy for identifying, disclosing, 
          managing, and resolving conflicts of interest to ensure transparent, fair, and ethical decision-making 
          and compliance with Alberta Private Schools Regulation 127/2022.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Definitions</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Conflict of Interest:</strong> A conflict of interest arises when a Board member, employee, 
            or senior manager has a direct or indirect personal or financial interest in a decision or action 
            undertaken in their official role at RTD Math Academy, potentially affecting their objectivity or loyalty.
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Scope</h3>
        <p className="text-gray-700">
          This policy applies to all Board members, owners, senior managers, and employees of RTD Math Academy.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Policy Guidelines</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Identification of Conflicts
            </h4>
            <p className="text-gray-700 mb-2">Conflicts of interest may include, but are not limited to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Decisions affecting employment, compensation, or contracts involving oneself, family members, close friends, or business associates.</li>
              <li>Related-party transactions involving owners, board members, or senior management.</li>
              <li>Situations where personal gain could be perceived as a motivation influencing professional judgment.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Disclosure Requirements</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Any actual, perceived, or potential conflict of interest must be disclosed in writing to the Head of School or the Board Chair immediately upon identification.</li>
              <li>Board members must disclose conflicts prior to discussion or voting on related matters.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Management of Conflicts</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Individuals with disclosed conflicts must recuse themselves from decision-making processes, including discussions and voting, involving the conflict.</li>
              <li>The Board of Directors, upon notification, will review conflicts and determine appropriate mitigation actions.</li>
              <li>Decisions related to conflicts of interest will be documented clearly in Board minutes or relevant records.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Users className="h-5 w-5" />
          Special Conditions for School Owners
        </h3>
        <p className="text-gray-700 mb-2">
          Given the nonprofit ownership structure (Kyle Brown, Marc Lambert, and Stan Scott), the following additional safeguards apply:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>Owners shall serve as non-voting members of the Board to ensure decisions remain unbiased and objective.</li>
          <li>All transactions involving owners or their immediate family members must be disclosed and approved explicitly by a vote of the Board of Directors, excluding the non-voting owners.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Hiring and Employment Decisions</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Hiring of immediate family members or close friends must follow standard procedures and will require prior approval from the Board, ensuring transparency and fairness.</li>
          <li>If the Head of School intends to terminate an owner's employment, the employee shall have the right to present their case to the Board of Directors prior to termination.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-red-600" />
          Enforcement
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Non-compliance with this policy can result in disciplinary actions, including removal from the Board or termination of employment, depending on the severity and nature of the conflict.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Monitoring and Review</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>The Board of Directors will review this policy annually for effectiveness, clarity, and regulatory compliance.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Approval and Public Availability</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>This policy is approved by the Board of Directors of RTD Math Academy.</li>
        </ul>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <Calendar className="h-5 w-5" />
          <p className="font-semibold">
            Policy Approved: May 20, 2025
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ConflictOfInterestPolicy;