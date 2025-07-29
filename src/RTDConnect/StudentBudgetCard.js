import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const StudentBudgetCard = ({ student, budgetInfo, reimbursementStatus }) => {
  if (!budgetInfo) return null;

  const getProgressColor = () => {
    if (budgetInfo.percentageUsed > 95) return 'bg-red-500';
    if (budgetInfo.percentageUsed > 80) return 'bg-yellow-500';
    if (budgetInfo.percentageUsed > 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (budgetInfo.percentageUsed > 95) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (budgetInfo.percentageUsed > 80) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (budgetInfo.percentageUsed > 95) return 'Budget nearly exhausted';
    if (budgetInfo.percentageUsed > 80) return 'Budget running low';
    if (budgetInfo.percentageUsed > 60) return 'Good progress';
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
              {budgetInfo.fundingLabel}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {budgetInfo.fundingFormatted}
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
            {budgetInfo.percentageUsed.toFixed(1)}% used
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(budgetInfo.percentageUsed, 100)}%` }}
          />
        </div>

        {/* Budget Breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-green-600">
              ${budgetInfo.remaining.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          <div>
            <div className="text-sm font-medium text-blue-600">
              ${budgetInfo.spent.toFixed(2)}
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