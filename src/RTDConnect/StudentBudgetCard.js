import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Ban } from 'lucide-react';

const StudentBudgetCard = ({ student, budgetInfo, reimbursementStatus, studentReimbursementData }) => {
  // Use backend reimbursement data if available, otherwise fall back to budgetInfo
  const backendData = studentReimbursementData;

  // Check if student is not eligible for funding
  if (backendData && !backendData.fundingEligible) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 opacity-75">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Grade {student.grade}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-red-600">
              <Ban className="w-5 h-5" />
              <span className="text-lg font-bold">$0.00</span>
            </div>
            <div className="text-xs text-gray-500">No Funding</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
          <p className="text-xs text-red-700 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {backendData.ageCategory === 'too_young'
              ? 'Student is too young for funding'
              : backendData.ageCategory === 'too_old'
              ? 'Student exceeds age limit for funding'
              : 'Not eligible for funding based on age requirements'}
          </p>
        </div>
      </div>
    );
  }

  if (student.fundingEligible === false) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 opacity-75">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Grade {student.grade}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-red-600">
              <Ban className="w-5 h-5" />
              <span className="text-lg font-bold">$0.00</span>
            </div>
            <div className="text-xs text-gray-500">No Funding</div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
          <p className="text-xs text-red-700 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {student.fundingAmount === 0 && student.grade === 'K' 
              ? 'Student is too young for kindergarten funding'
              : student.fundingAmount === 0 && student.grade === '12'
              ? 'Student exceeds age limit for funding'
              : 'Not eligible for funding based on age requirements'}
          </p>
        </div>
      </div>
    );
  }

  // Create effective budget info from backend data or budgetInfo
  const effectiveBudget = backendData ? {
    fundingAmount: backendData.allocation || 0,
    fundingFormatted: `$${(backendData.allocation || 0).toFixed(2)}`,
    fundingLabel: backendData.ageCategory === 'kindergarten' ? 'Kindergarten' : 'Grades 1-12',
    spent: backendData.spent || 0,
    remaining: backendData.remaining || 0,
    percentageUsed: backendData.allocation > 0 ? (backendData.spent / backendData.allocation) * 100 : 0
  } : budgetInfo;

  if (!effectiveBudget) return null;

  // Also check if budget is 0 (shouldn't happen after above check, but just in case)
  if (effectiveBudget.fundingFormatted === '$0.00' || effectiveBudget.fundingAmount === 0) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 opacity-75">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Grade {student.grade}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-500">$0.00</div>
            <div className="text-xs text-gray-500">No Budget</div>
          </div>
        </div>
      </div>
    );
  }

  const getProgressColor = () => {
    if (effectiveBudget.percentageUsed > 95) return 'bg-red-500';
    if (effectiveBudget.percentageUsed > 80) return 'bg-yellow-500';
    if (effectiveBudget.percentageUsed > 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (effectiveBudget.percentageUsed > 95) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (effectiveBudget.percentageUsed > 80) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (effectiveBudget.percentageUsed > 95) return 'Budget nearly exhausted';
    if (effectiveBudget.percentageUsed > 80) return 'Budget running low';
    if (effectiveBudget.percentageUsed > 60) return 'Good progress';
    return 'Plenty of budget remaining';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Student Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Grade {student.grade}</span>
            <span>•</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {effectiveBudget.fundingLabel}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {effectiveBudget.fundingFormatted}
          </div>
          <div className="text-xs text-gray-500">Total Budget</div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="space-y-3">
        {/* Status and Percentage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-600">{getStatusMessage()}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {effectiveBudget.percentageUsed.toFixed(1)}% used
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(effectiveBudget.percentageUsed, 100)}%` }}
          />
        </div>

        {/* Budget Breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-green-600">
              ${effectiveBudget.remaining.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          <div>
            <div className="text-sm font-medium text-blue-600">
              ${effectiveBudget.spent.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Spent</div>
          </div>
          <div>
            <div className="text-sm font-medium text-purple-600">
              {reimbursementStatus?.pending || 0}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Recent Activity */}
        {reimbursementStatus?.latestSubmission && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Latest: {new Date(reimbursementStatus.latestSubmission.submittedAt).toLocaleDateString()}
              {reimbursementStatus.latestSubmission.studentAllocation && (
                <span className="ml-1">
                  (${reimbursementStatus.latestSubmission.studentAllocation.amount.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBudgetCard;