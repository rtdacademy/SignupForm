import React from 'react';
import { CheckCircle2, AlertTriangle, Shield, ArrowRight, FileText, Upload, Users, DollarSign } from 'lucide-react';
import FormCompletionBadge from './FormCompletionBadge';

const PaymentEligibilityCard = ({ 
  familyEligibility,
  onTakeAction,
  className = ""
}) => {
  if (!familyEligibility) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-pulse bg-gray-300 rounded-full w-8 h-8"></div>
          <div className="animate-pulse bg-gray-300 h-4 w-32 rounded"></div>
        </div>
      </div>
    );
  }

  const { 
    canAccessPayments, 
    allStudentsComplete, 
    completionPercentage,
    studentsWithoutAccess,
    totalStudents,
    completedStudents
  } = familyEligibility;

  const getStatusConfig = () => {
    if (canAccessPayments && allStudentsComplete) {
      return {
        icon: CheckCircle2,
        iconColor: 'text-green-500',
        bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        title: 'Payment Features Unlocked',
        description: 'All students have completed their required forms',
        actionText: 'Submit Expenses',
        actionStyle: 'bg-green-600 hover:bg-green-700 text-white',
        actionIcon: DollarSign
      };
    }
    
    if (completionPercentage >= 50) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
        title: 'Almost Ready for Payments',
        description: `${completedStudents} of ${totalStudents} students ready`,
        actionText: 'Complete Forms',
        actionStyle: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        actionIcon: FileText
      };
    }
    
    return {
      icon: Shield,
      iconColor: 'text-red-500',
      bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
      borderColor: 'border-red-200',
      title: 'Payment Features Locked',
      description: 'Students must complete required forms first',
      actionText: 'Start Forms',
      actionStyle: 'bg-red-600 hover:bg-red-700 text-white',
      actionIcon: FileText
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;
  const ActionIcon = status.actionIcon;

  return (
    <div className={`${status.bgColor} border ${status.borderColor} rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border-2 ${status.borderColor}`}>
            <Icon className={`w-6 h-6 ${status.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {status.title}
            </h3>
            <p className="text-sm text-gray-600">
              {status.description}
            </p>
          </div>
        </div>
        
        <FormCompletionBadge 
          completionPercentage={completionPercentage}
          isComplete={allStudentsComplete}
          canAccessPayments={canAccessPayments}
          size="sm"
          showLabel={false}
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Family Form Completion
          </span>
          <span className="text-sm text-gray-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-700 ${
              completionPercentage >= 100 ? 'bg-green-500' :
              completionPercentage >= 66 ? 'bg-blue-500' :
              completionPercentage >= 33 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Students Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {completedStudents}
          </div>
          <div className="text-xs text-gray-600">Students Ready</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {totalStudents - completedStudents}
          </div>
          <div className="text-xs text-gray-600">Need Forms</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200 md:col-span-1 col-span-2">
          <div className="text-2xl font-bold text-purple-600">
            {totalStudents}
          </div>
          <div className="text-xs text-gray-600">Total Students</div>
        </div>
      </div>

      {/* Incomplete Students List */}
      {studentsWithoutAccess && studentsWithoutAccess.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
            Students Needing Forms
          </h4>
          <div className="space-y-2">
            {studentsWithoutAccess.map((student, index) => {
              const missingFormLabels = {
                'notification-form': 'Registration Form',
                'citizenship-docs': 'Citizenship Docs',
                'solo-plan': 'Program Plan'
              };
              
              const missingLabels = student.missing?.map(form => missingFormLabels[form]).join(', ') || 'Unknown forms';
              
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">Missing: {missingLabels}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormCompletionBadge 
                      completionPercentage={student.completionPercentage || 0}
                      isComplete={false}
                      canAccessPayments={false}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      {onTakeAction && (
        <button
          onClick={onTakeAction}
          disabled={canAccessPayments && !onTakeAction}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${status.actionStyle} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
        >
          <ActionIcon className="w-5 h-5" />
          <span>{status.actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PaymentEligibilityCard;