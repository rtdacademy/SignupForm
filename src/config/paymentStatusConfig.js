import { 
  CheckCircle, 
  DollarSign, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  CreditCard,
  TrendingUp,
  Package
} from 'lucide-react';

/**
 * Payment status configuration for badges
 * Each status has a unique color scheme and icon
 */
export const PAYMENT_STATUS_CONFIG = {
  // === SUBSCRIPTION STATUSES ===
  // Active subscriptions (Green - good standing)
  'sub_active_0': {
    label: 'Sub Active (0/3)',
    icon: RefreshCw,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Subscription active - No payments received yet'
  },
  'sub_active_1': {
    label: 'Sub Active (1/3)',
    icon: RefreshCw,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Subscription active - 1 of 3 payments received'
  },
  'sub_active_2': {
    label: 'Sub Active (2/3)',
    icon: RefreshCw,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Subscription active - 2 of 3 payments received'
  },
  'sub_complete': {
    label: 'Sub Complete',
    icon: CheckCircle,
    color: '#059669', // emerald-600
    bgColor: '#A7F3D0', // emerald-200
    tooltip: 'All 3 subscription payments completed'
  },
  
  // Canceled subscriptions (Yellow - partial payment)
  'sub_canceled_0': {
    label: 'Sub Canceled (0/3)',
    icon: AlertCircle,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Subscription canceled - No payments received'
  },
  'sub_canceled_1': {
    label: 'Sub Canceled (1/3)',
    icon: AlertCircle,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Subscription canceled - 1 of 3 payments received'
  },
  'sub_canceled_2': {
    label: 'Sub Canceled (2/3)',
    icon: AlertCircle,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Subscription canceled - 2 of 3 payments received'
  },
  
  // Past due subscriptions (Red - payment issues)
  'sub_past_due_1': {
    label: 'Sub Past Due (1/3)',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'Subscription past due - 1 payment received, next payment failed'
  },
  'sub_past_due_2': {
    label: 'Sub Past Due (2/3)',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'Subscription past due - 2 payments received, next payment failed'
  },
  
  // Other subscription statuses
  'sub_incomplete': {
    label: 'Sub Pending',
    icon: Clock,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Subscription created but first payment pending'
  },
  'sub_no_stripe': {
    label: 'Sub Not Found',
    icon: HelpCircle,
    color: '#6B7280', // gray-500
    bgColor: '#F3F4F6', // gray-100
    tooltip: 'Subscription data not found in Stripe'
  },
  
  // === ONE-TIME PAYMENT STATUSES ===
  'one_time_paid': {
    label: 'One-Time Paid',
    icon: DollarSign,
    color: '#059669', // emerald-600
    bgColor: '#A7F3D0', // emerald-200
    tooltip: 'One-time payment completed'
  },
  'one_time_unpaid': {
    label: 'One-Time Unpaid',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'One-time payment required'
  },
  'unpaid': {
    label: 'Unpaid',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'Payment required'
  },
  'trial_period': {
    label: 'Trial Period',
    icon: Clock,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Free trial period active'
  },
  'unpaid_before_start_date': {
    label: 'Unpaid (Not Started)',
    icon: Pause,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Trial ended, course not yet started'
  },
  'one_time_no_stripe': {
    label: 'Payment Not Found',
    icon: HelpCircle,
    color: '#6B7280', // gray-500
    bgColor: '#F3F4F6', // gray-100
    tooltip: 'Payment data not found in Stripe'
  },
  
  // === CREDIT-BASED STATUSES ===
  'credit_free': {
    label: 'Within Credits',
    icon: Package,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Course is within free credit limit'
  },
  'credit_requires_payment': {
    label: 'Credits Required',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'Additional credits required for this course'
  },
  'credit_paid': {
    label: 'Credits Paid',
    icon: Package,
    color: '#059669', // emerald-600
    bgColor: '#A7F3D0', // emerald-200
    tooltip: 'Credits purchased - Course accessible'
  },
  'credit_partial': {
    label: 'Partial Credits',
    icon: Clock,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Some credits purchased but more needed'
  },
  'credit_override': {
    label: 'Credit Override',
    icon: ShieldCheck,
    color: '#8B5CF6', // violet-500
    bgColor: '#EDE9FE', // violet-100
    tooltip: 'Additional free credits granted'
  },
  
  // === EXISTING STATUSES (kept for backward compatibility) ===
  // Fully paid/free statuses (green variants)
  'free': {
    label: 'Free',
    icon: CheckCircle,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Course is free or within free credits limit'
  },
  'free_with_credits': {
    label: 'Using Credits',
    icon: Package,
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    tooltip: 'Using free credits'
  },
  'paid': {
    label: 'Paid',
    icon: DollarSign,
    color: '#059669', // emerald-600
    bgColor: '#A7F3D0', // emerald-200
    tooltip: 'Course has been paid for'
  },
  
  // Carried over status (blue)
  'carried_over': {
    label: 'Carried Over',
    icon: RefreshCw,
    color: '#3B82F6', // blue-500
    bgColor: '#DBEAFE', // blue-100
    tooltip: 'Payment carried over from previous school year'
  },
  
  // Override status (purple)
  'override': {
    label: 'Override',
    icon: ShieldCheck,
    color: '#8B5CF6', // violet-500
    bgColor: '#EDE9FE', // violet-100
    tooltip: 'Manual payment override applied'
  },
  
  // Partial payment (amber)
  'partial': {
    label: 'Partial',
    icon: Clock,
    color: '#F59E0B', // amber-500
    bgColor: '#FED7AA', // amber-100
    tooltip: 'Partial payment made, additional credits needed'
  },
  
  // Requires payment (red)
  'requires_payment': {
    label: 'Payment Required',
    icon: AlertCircle,
    color: '#EF4444', // red-500
    bgColor: '#FEE2E2', // red-100
    tooltip: 'Payment required to access this course'
  },
  
  // Default/unknown status (gray)
  'unknown': {
    label: 'Unknown',
    icon: HelpCircle,
    color: '#6B7280', // gray-500
    bgColor: '#F3F4F6', // gray-100
    tooltip: 'Payment status unknown'
  }
};

/**
 * Payment model badges for additional context
 */
export const PAYMENT_MODEL_CONFIG = {
  'per_course': {
    label: 'Per Course',
    icon: CreditCard,
    color: '#6366F1', // indigo-500
    tooltip: 'Pays per course'
  },
  'credit_based': {
    label: 'Credit Based',
    icon: TrendingUp,
    color: '#8B5CF6', // violet-500
    tooltip: 'Uses credit system'
  }
};

/**
 * Get payment status configuration
 * @param {string} status - The payment status
 * @returns {Object} Status configuration with icon, colors, and label
 */
export function getPaymentStatusConfig(status) {
  if (!status) return PAYMENT_STATUS_CONFIG.unknown;
  
  // Handle case where status might still be an object (for backwards compatibility)
  let statusString = status;
  if (typeof status === 'object' && status.status) {
    statusString = status.status;
  }
  
  // Ensure we have a string
  if (typeof statusString !== 'string') {
    return PAYMENT_STATUS_CONFIG.unknown;
  }
  
  const config = PAYMENT_STATUS_CONFIG[statusString.toLowerCase()];
  return config || PAYMENT_STATUS_CONFIG.unknown;
}

/**
 * Get payment model configuration
 * @param {string} model - The payment model
 * @returns {Object} Model configuration with icon, color, and label
 */
export function getPaymentModelConfig(model) {
  if (!model) return null;
  return PAYMENT_MODEL_CONFIG[model.toLowerCase()] || null;
}

/**
 * Format payment status tooltip with additional details
 * @param {string} status - The payment status
 * @param {Object} details - Additional payment details
 * @returns {string} Formatted tooltip text
 */
export function formatPaymentTooltip(status, details = {}) {
  const baseConfig = getPaymentStatusConfig(status);
  let tooltip = baseConfig.tooltip;
  
  // Add carried over information
  if (status === 'carried_over' && details.carriedOverFrom) {
    tooltip += ` from ${details.carriedOverFrom}`;
  }
  
  // Add partial payment progress
  if (status === 'partial' && details.creditsPaid !== undefined && details.creditsRequired !== undefined) {
    tooltip += ` (${details.creditsPaid}/${details.creditsRequired} credits)`;
  }
  
  // Add override information
  if (status === 'override' && details.overrideDetails?.reason) {
    tooltip += `: ${details.overrideDetails.reason}`;
  }
  
  // Add payment model
  if (details.paymentModel) {
    const modelConfig = getPaymentModelConfig(details.paymentModel);
    if (modelConfig) {
      tooltip += ` • ${modelConfig.label}`;
    }
  }
  
  return tooltip;
}

/**
 * Check if a payment status indicates the course is accessible
 * @param {string} status - The payment status
 * @returns {boolean} True if course is accessible
 */
export function isPaymentStatusAccessible(status) {
  const accessibleStatuses = ['free', 'paid', 'carried_over', 'override'];
  return accessibleStatuses.includes(status?.toLowerCase() || '');
}

/**
 * Check if a payment status indicates payment is needed
 * @param {string} status - The payment status
 * @returns {boolean} True if payment is needed
 */
export function isPaymentRequired(status) {
  const paymentRequiredStatuses = ['requires_payment', 'partial'];
  return paymentRequiredStatuses.includes(status?.toLowerCase() || '');
}

/**
 * Get credit usage color based on percentage used
 * @param {number} used - Credits used
 * @param {number} limit - Credit limit
 * @returns {Object} Color configuration
 */
export function getCreditUsageColor(used, limit) {
  if (!limit || limit === 0) {
    return { color: '#3B82F6', bgColor: '#DBEAFE' }; // Light blue for no limit
  }
  
  const percentage = (used / limit) * 100;
  
  if (percentage <= 100) {
    // Light blue for anything at or under the limit (includes 20/20)
    return { color: '#3B82F6', bgColor: '#DBEAFE' }; // Light blue
  } else {
    // Red only when OVER the limit (e.g., 23/20)
    return { color: '#EF4444', bgColor: '#FEE2E2' }; // Red
  }
}

/**
 * Format credit usage display
 * @param {Object} creditsSummary - Credits summary object
 * @returns {string} Formatted display string
 */
export function formatCreditUsage(creditsSummary) {
  if (!creditsSummary) return '';
  
  // Use nonExemptCredits as the total credits used
  const totalCreditsUsed = creditsSummary.nonExemptCredits || 0;
  const { freeCreditsLimit, totalPaidCredits } = creditsSummary;
  
  // If they have paid credits, show total available
  if (totalPaidCredits > 0) {
    const totalAvailable = freeCreditsLimit + totalPaidCredits;
    return `${totalCreditsUsed}/${totalAvailable} credits`;
  }
  
  // Otherwise just show free credits
  return `${totalCreditsUsed}/${freeCreditsLimit} credits`;
}

/**
 * Get enhanced status configuration for credit-based students
 * @param {string} status - The payment status
 * @param {Object} creditsSummary - Credits summary data
 * @returns {Object|null} Enhanced status configuration or null to hide badge
 */
export function getEnhancedStatusConfig(status, creditsSummary) {
  // Ensure status is a string
  let statusString = status;
  if (typeof status === 'object' && status !== null && status.status) {
    statusString = status.status;
  }
  
  const baseConfig = getPaymentStatusConfig(statusString);
  
  // For credit-based students with credit summary
  if (creditsSummary) {
    // Use nonExemptCredits as the actual total credits used
    const totalCreditsUsed = creditsSummary.nonExemptCredits || 0;
    
    // Only show badge if using credits OR payment is required
    if (status === 'free' && totalCreditsUsed === 0) {
      // Return null to indicate badge should be hidden
      return null;
    }
    
    // For any credit-based student using credits, show enhanced display with proper colors
    if (totalCreditsUsed > 0) {
      // Use total available credits (free + paid) for color calculation
      const totalAvailable = creditsSummary.freeCreditsLimit + (creditsSummary.totalPaidCredits || 0);
      const colors = getCreditUsageColor(totalCreditsUsed, totalAvailable);
      const creditDisplay = `${totalCreditsUsed}/${totalAvailable} credits`;
      
      // Determine the base tooltip based on the status
      let baseTooltip = baseConfig.tooltip;
      
      if (creditsSummary.totalPaidCredits > 0) {
        // Student has paid credits, show breakdown
        baseTooltip = `Using ${totalCreditsUsed} of ${totalAvailable} total credits (${creditsSummary.freeCreditsLimit} free + ${creditsSummary.totalPaidCredits} paid)`;
      } else {
        // Only free credits
        baseTooltip = `Using ${totalCreditsUsed} of ${creditsSummary.freeCreditsLimit} free credits`;
      }
      
      const result = {
        ...baseConfig,
        label: creditDisplay,
        icon: Package,
        color: colors.color,
        bgColor: colors.bgColor,
        tooltip: baseTooltip
      };
      return result;
    }
  }
  
  return baseConfig;
}