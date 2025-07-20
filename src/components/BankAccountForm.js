import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

const BankAccountForm = ({ 
  onBankAccountSave, 
  existingBankAccount = null,
  isSubmitting = false,
  error = null,
  userProfile = null
}) => {
  // Pre-populate account holder name with user's profile name
  const defaultAccountHolderName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : '';
  
  const [accountHolderName, setAccountHolderName] = useState(
    existingBankAccount?.accountHolderName || defaultAccountHolderName || ''
  );
  const [institutionNumber, setInstitutionNumber] = useState(existingBankAccount?.institutionNumber || '');
  const [transitNumber, setTransitNumber] = useState(existingBankAccount?.transitNumber || '');
  const [accountNumber, setAccountNumber] = useState(existingBankAccount?.accountNumber || '');
  const [accountType, setAccountType] = useState(existingBankAccount?.accountType || 'checking');
  
  const [errors, setErrors] = useState({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!institutionNumber) {
      newErrors.institutionNumber = 'Institution number is required';
    } else if (!/^\d{3}$/.test(institutionNumber)) {
      newErrors.institutionNumber = 'Institution number must be 3 digits';
    }

    if (!transitNumber) {
      newErrors.transitNumber = 'Transit number is required';
    } else if (!/^\d{5}$/.test(transitNumber)) {
      newErrors.transitNumber = 'Transit number must be 5 digits';
    }

    if (!accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{7,12}$/.test(accountNumber)) {
      newErrors.accountNumber = 'Account number must be 7-12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const routingNumber = `${transitNumber}${institutionNumber}`;
    
    const bankAccountData = {
      accountHolderName: accountHolderName.trim(),
      routingNumber,
      accountNumber,
      accountType,
      country: 'CA',
      currency: 'cad'
    };

    onBankAccountSave(bankAccountData);
  };

  const handleNumberInput = (value, setter, maxLength) => {
    const numericValue = value.replace(/\D/g, '').slice(0, maxLength);
    setter(numericValue);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {existingBankAccount ? 'Update Bank Account' : 'Add Bank Account'}
          </h3>
          <p className="text-sm text-gray-600">
            Secure bank account information for reimbursement payments
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Your information is secure</p>
            <p className="text-blue-700">
              Bank account details are encrypted and processed securely through Stripe. 
              We never store your complete account information.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Holder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.accountHolderName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="John Doe"
          />
          <p className="text-xs text-gray-500 mt-1">Name as it appears on your bank account</p>
          {errors.accountHolderName && (
            <div className="flex items-center space-x-2 text-sm text-red-600 mt-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.accountHolderName}</span>
            </div>
          )}
        </div>

        {/* Institution and Transit Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Institution Number *
            </label>
            <input
              type="text"
              value={institutionNumber}
              onChange={(e) => handleNumberInput(e.target.value, setInstitutionNumber, 3)}
              className={`w-full px-3 py-2 border ${errors.institutionNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="001"
              maxLength={3}
            />
            <p className="text-xs text-gray-500 mt-1">3-digit bank identifier</p>
            {errors.institutionNumber && (
              <div className="flex items-center space-x-2 text-sm text-red-600 mt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.institutionNumber}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Transit Number *
            </label>
            <input
              type="text"
              value={transitNumber}
              onChange={(e) => handleNumberInput(e.target.value, setTransitNumber, 5)}
              className={`w-full px-3 py-2 border ${errors.transitNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="12345"
              maxLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">5-digit branch number</p>
            {errors.transitNumber && (
              <div className="flex items-center space-x-2 text-sm text-red-600 mt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.transitNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Account Number *
          </label>
          <div className="relative">
            <input
              type={showAccountNumber ? "text" : "password"}
              value={accountNumber}
              onChange={(e) => handleNumberInput(e.target.value, setAccountNumber, 12)}
              className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="1234567890"
              maxLength={12}
            />
            <button
              type="button"
              onClick={() => setShowAccountNumber(!showAccountNumber)}
              className="absolute right-3 top-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showAccountNumber ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">7-12 digits</p>
          {errors.accountNumber && (
            <div className="flex items-center space-x-2 text-sm text-red-600 mt-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.accountNumber}</span>
            </div>
          )}
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Account Type *
          </label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="checking">Checking Account</option>
            <option value="savings">Savings Account</option>
          </select>
        </div>

        {/* Routing Number Display */}
        {transitNumber && institutionNumber && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Routing Number:</strong> {transitNumber}{institutionNumber}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {existingBankAccount ? 'Updating...' : 'Adding Bank Account...'}
              </>
            ) : (
              <>
                {existingBankAccount ? 'Update Bank Account' : 'Add Bank Account'}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Information */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Need help finding your bank information?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Institution and transit numbers are found at the bottom of your cheques</li>
          <li>• You can also find this information in your online banking or by calling your bank</li>
          <li>• Account number is typically 7-12 digits and is also on your cheques</li>
        </ul>
      </div>
    </div>
  );
};

export default BankAccountForm;