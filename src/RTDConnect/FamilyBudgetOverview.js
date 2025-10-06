import React from 'react';
import { DollarSign, Users, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const FamilyBudgetOverview = ({ students, budgetData, familyPaymentEligibility, reimbursementAccount }) => {
  if (!students || students.length === 0) return null;

  // Use backend reimbursement account data if available, otherwise fall back to old calculation
  const totals = reimbursementAccount ? {
    totalAllocated: reimbursementAccount.summary_totalAllocation || 0,
    totalSpent: reimbursementAccount.summary_totalSpent || 0,
    totalRemaining: reimbursementAccount.summary_totalRemaining || 0
  } : students.reduce((acc, student) => {
    const budget = budgetData?.[student.id];
    if (budget) {
      acc.totalAllocated += budget.limit;
      acc.totalSpent += budget.spent;
      acc.totalRemaining += budget.remaining;
    }
    return acc;
  }, {
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0
  });

  const overallPercentageUsed = totals.totalAllocated > 0 
    ? (totals.totalSpent / totals.totalAllocated) * 100 
    : 0;

  // Get students with high budget usage
  const highUsageStudents = students.filter(student => {
    if (reimbursementAccount?.students?.[student.id]) {
      const studentData = reimbursementAccount.students[student.id];
      const percentageUsed = studentData.allocation > 0
        ? (studentData.spent / studentData.allocation) * 100
        : 0;
      return percentageUsed > 80;
    } else {
      const budget = budgetData?.[student.id];
      return budget && budget.percentageUsed > 80;
    }
  });

  const getOverallStatus = () => {
    if (overallPercentageUsed > 90) return { color: 'text-red-600', message: 'High Usage' };
    if (overallPercentageUsed > 70) return { color: 'text-yellow-600', message: 'Moderate Usage' };
    return { color: 'text-green-600', message: 'Good Standing' };
  };

  const status = getOverallStatus();

  // Helper function to get student percentage used
  const getStudentPercentageUsed = (student) => {
    if (reimbursementAccount?.students?.[student.id]) {
      const studentData = reimbursementAccount.students[student.id];
      return studentData.allocation > 0
        ? (studentData.spent / studentData.allocation) * 100
        : 0;
    } else {
      return budgetData?.[student.id]?.percentageUsed || 0;
    }
  };

  // Check if payment features are restricted
  const isRestricted = familyPaymentEligibility && !familyPaymentEligibility.canAccessPayments;
  const restrictionOverlay = isRestricted ? 'relative overflow-hidden' : '';

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6 ${restrictionOverlay}`}>
      {/* Payment Restriction Overlay */}
      {isRestricted && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Budget Tracking Locked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete all required forms to access budget and payment features
            </p>
            <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>
                  {familyPaymentEligibility?.studentsWithoutAccess?.length || 0} student(s) need forms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
          Family Budget Overview
          {isRestricted && (
            <Shield className="w-4 h-4 ml-2 text-red-500" />
          )}
        </h3>
        <div className={`text-sm font-medium ${isRestricted ? 'text-gray-400' : status.color}`}>
          {isRestricted ? 'Restricted Access' : status.message}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ${isRestricted ? 'opacity-40' : ''}`}>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            ${totals.totalAllocated.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Allocated</div>
          <div className="text-xs text-gray-500 mt-1">
            Across {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">
            ${totals.totalSpent.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-xs text-gray-500 mt-1">
            {overallPercentageUsed.toFixed(1)}% of budget
          </div>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            ${totals.totalRemaining.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Remaining</div>
          <div className="text-xs text-gray-500 mt-1">
            {(100 - overallPercentageUsed).toFixed(1)}% available
          </div>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-600">
            {students.length}
          </div>
          <div className="text-sm text-gray-600">Students</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
            <Users className="w-3 h-3 mr-1" />
            Active budgets
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`mb-4 ${isRestricted ? 'opacity-40' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Family Budget Usage</span>
          <span className="text-sm text-gray-600">{overallPercentageUsed.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-700 ${
              overallPercentageUsed > 90 ? 'bg-red-500' :
              overallPercentageUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(overallPercentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Alerts for High Usage Students */}
      {!isRestricted && highUsageStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Budget Alert
              </p>
              <p className="text-sm text-yellow-700">
                {highUsageStudents.length === 1 ? (
                  <>
                    <strong>{highUsageStudents[0].firstName}</strong> has used{' '}
                    <strong>{getStudentPercentageUsed(highUsageStudents[0]).toFixed(1)}%</strong> of their budget.
                  </>
                ) : (
                  <>
                    <strong>{highUsageStudents.length} students</strong> have used over 80% of their budgets:{' '}
                    {highUsageStudents.map((student, index) => (
                      <span key={student.id}>
                        {student.firstName} ({getStudentPercentageUsed(student).toFixed(1)}%)
                        {index < highUsageStudents.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`pt-3 border-t border-blue-200 ${isRestricted ? 'opacity-40' : ''}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-1 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span>{isRestricted ? 'Tracking paused' : 'Budget tracking active'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyBudgetOverview;