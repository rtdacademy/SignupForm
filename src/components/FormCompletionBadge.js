import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';

const FormCompletionBadge = ({ 
  completionPercentage = 0, 
  isComplete = false, 
  canAccessPayments = false,
  size = 'md',
  showPercentage = true,
  showLabel = true
}) => {
  const getStatusConfig = () => {
    if (canAccessPayments && isComplete) {
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Payment Ready',
        description: 'All forms complete'
      };
    }
    
    if (completionPercentage >= 66) {
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Nearly Ready',
        description: 'Forms in progress'
      };
    }
    
    if (completionPercentage >= 33) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Forms Started',
        description: 'More forms needed'
      };
    }
    
    return {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Forms Required',
      description: 'No forms completed'
    };
  };

  const sizeConfig = {
    sm: {
      container: 'px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    md: {
      container: 'px-3 py-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    lg: {
      container: 'px-4 py-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      badge: 'text-sm px-2.5 py-1'
    }
  };

  const status = getStatusConfig();
  const sizes = sizeConfig[size];
  const Icon = status.icon;

  return (
    <div className={`flex items-center space-x-2 rounded-lg border ${status.bgColor} ${status.borderColor} ${sizes.container}`}>
      <Icon className={`${status.color} ${sizes.icon}`} />
      
      {showLabel && (
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${status.color} ${sizes.text}`}>
            {status.label}
          </div>
          {size !== 'sm' && (
            <div className={`text-gray-500 ${sizes.text === 'text-base' ? 'text-sm' : 'text-xs'}`}>
              {status.description}
            </div>
          )}
        </div>
      )}
      
      {showPercentage && completionPercentage > 0 && (
        <div className={`${status.color} font-medium ${sizes.badge} bg-white rounded-full border ${status.borderColor}`}>
          {completionPercentage}%
        </div>
      )}
    </div>
  );
};

// Compact version for tight spaces
export const CompactFormCompletionBadge = ({ 
  completionPercentage = 0, 
  isComplete = false, 
  canAccessPayments = false 
}) => {
  const getStatusConfig = () => {
    if (canAccessPayments && isComplete) {
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: '✓'
      };
    }
    
    if (completionPercentage >= 66) {
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: Math.round(completionPercentage) + '%'
      };
    }
    
    if (completionPercentage >= 33) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: Math.round(completionPercentage) + '%'
      };
    }
    
    return {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: '!'
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  return (
    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${status.bgColor} ${status.color}`}>
      {completionPercentage > 0 && completionPercentage < 100 ? (
        <span className="text-xs font-bold">{Math.round(completionPercentage)}</span>
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
    </div>
  );
};

export default FormCompletionBadge;