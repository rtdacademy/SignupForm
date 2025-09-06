import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { 
  Save, 
  RefreshCw, 
  DollarSign, 
  CreditCard,
  AlertCircle,
  Check,
  X,
  Infinity,
  Calculator,
  Users,
  InfoIcon
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const STUDENT_TYPES = [
  { 
    key: 'nonPrimaryStudents', 
    label: 'Non-Primary Students',
    description: 'Students taking courses outside their primary school',
    color: 'blue'
  },
  { 
    key: 'homeEducationStudents', 
    label: 'Home Education Students',
    description: 'Students educated at home',
    color: 'amber'
  },
  { 
    key: 'summerSchoolStudents', 
    label: 'Summer School Students',
    description: 'Students enrolled in summer programs',
    color: 'green'
  },
  { 
    key: 'adultStudents', 
    label: 'Adult Students',
    description: 'Adult learners and continuing education',
    color: 'purple'
  },
  { 
    key: 'internationalStudents', 
    label: 'International Students',
    description: 'Students from international jurisdictions',
    color: 'pink'
  }
];

const PricingManager = () => {
  const [pricingData, setPricingData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [recalculating, setRecalculating] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState(null);
  const [showRecalcModal, setShowRecalcModal] = useState(false);
  const [singleStudentEmail, setSingleStudentEmail] = useState('');
  const [showSingleRecalc, setShowSingleRecalc] = useState(false);
  const [creditPricingData, setCreditPricingData] = useState({
    stripePriceId: '',
    priceInCents: 10000,
    currency: 'CAD'
  });
  const [paymentOptionsData, setPaymentOptionsData] = useState({
    onetime: {
      id: '',
      name: 'One-time Payment',
      amount: 650,
      description: 'Pay full amount upfront and save'
    },
    subscription: {
      id: '',
      name: 'Monthly Payments',
      amount: 233.33,
      total: 700,
      description: '3 monthly payments'
    }
  });

  // Load pricing data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const pricingRef = ref(db, 'pricing');
    
    const unsubscribe = onValue(pricingRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      // Load credit pricing data
      if (data.pricePerCredit) {
        setCreditPricingData({
          stripePriceId: data.pricePerCredit.stripePriceId || '',
          priceInCents: data.pricePerCredit.priceInCents || 10000,
          currency: data.pricePerCredit.currency || 'CAD'
        });
      }
      
      // Load payment options data
      if (data.paymentOptions) {
        setPaymentOptionsData({
          onetime: {
            id: data.paymentOptions.onetime?.id || '',
            name: data.paymentOptions.onetime?.name || 'One-time Payment',
            amount: data.paymentOptions.onetime?.amount || 650,
            description: data.paymentOptions.onetime?.description || 'Pay full amount upfront and save'
          },
          subscription: {
            id: data.paymentOptions.subscription?.id || '',
            name: data.paymentOptions.subscription?.name || 'Monthly Payments',
            amount: data.paymentOptions.subscription?.amount || 233.33,
            total: data.paymentOptions.subscription?.total || 700,
            description: data.paymentOptions.subscription?.description || '3 monthly payments'
          }
        });
      }
      
      // Ensure all student types have credit tracking fields
      const enhancedData = {};
      STUDENT_TYPES.forEach(type => {
        // Adult and International students should never have free credit limits
        const shouldHaveLimit = type.key === 'nonPrimaryStudents' || 
                               type.key === 'homeEducationStudents' || 
                               type.key === 'summerSchoolStudents';
        
        enhancedData[type.key] = {
          ...data[type.key],
          // Add credit tracking fields if missing
          freeCreditsLimit: type.key === 'adultStudents' || type.key === 'internationalStudents' 
            ? null  // Force null for adult and international
            : (data[type.key]?.freeCreditsLimit ?? (shouldHaveLimit ? 10 : null)),
          costPerCredit: data[type.key]?.costPerCredit ?? 
            (type.key === 'nonPrimaryStudents' || type.key === 'homeEducationStudents' ? 100 : 0),
          requiresPaymentAfterLimit: data[type.key]?.requiresPaymentAfterLimit ?? 
            (type.key === 'nonPrimaryStudents' || type.key === 'homeEducationStudents'),
          // Add rejoin fee for all student types
          rejoinFee: data[type.key]?.rejoinFee ?? 0
        };
      });
      
      setPricingData(enhancedData);
      setOriginalData({
        ...JSON.parse(JSON.stringify(enhancedData)),
        pricePerCredit: data.pricePerCredit || {
          stripePriceId: '',
          priceInCents: 10000,
          currency: 'CAD'
        },
        paymentOptions: data.paymentOptions || {
          onetime: {
            id: '',
            name: 'One-time Payment',
            amount: 650,
            description: 'Pay full amount upfront and save'
          },
          subscription: {
            id: '',
            name: 'Monthly Payments',
            amount: 233.33,
            total: 700,
            description: '3 monthly payments'
          }
        }
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFieldChange = (studentType, field, value) => {
    setPricingData(prev => ({
      ...prev,
      [studentType]: {
        ...prev[studentType],
        [field]: value
      }
    }));
    
    // Clear any existing error for this field
    setErrors(prev => ({
      ...prev,
      [`${studentType}.${field}`]: null
    }));
  };

  const handleCreditPricingChange = (field, value) => {
    setCreditPricingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any existing error for this field
    setErrors(prev => ({
      ...prev,
      [`creditPricing.${field}`]: null
    }));
  };

  const handlePaymentOptionChange = (optionType, field, value) => {
    setPaymentOptionsData(prev => ({
      ...prev,
      [optionType]: {
        ...prev[optionType],
        [field]: value
      }
    }));
    
    // Clear any existing error for this field
    setErrors(prev => ({
      ...prev,
      [`paymentOptions.${optionType}.${field}`]: null
    }));
  };

  const validateData = () => {
    const newErrors = {};
    
    // Validate credit pricing
    if (!creditPricingData.stripePriceId || creditPricingData.stripePriceId.trim() === '') {
      newErrors['creditPricing.stripePriceId'] = 'Stripe Price ID is required';
    }
    
    if (creditPricingData.priceInCents < 0) {
      newErrors['creditPricing.priceInCents'] = 'Price cannot be negative';
    }
    
    if (!creditPricingData.currency || creditPricingData.currency.trim() === '') {
      newErrors['creditPricing.currency'] = 'Currency is required';
    }
    
    // Validate payment options
    ['onetime', 'subscription'].forEach(optionType => {
      const option = paymentOptionsData[optionType];
      
      if (!option.id || option.id.trim() === '') {
        newErrors[`paymentOptions.${optionType}.id`] = 'Stripe Price ID is required';
      }
      
      if (option.amount < 0) {
        newErrors[`paymentOptions.${optionType}.amount`] = 'Amount cannot be negative';
      }
      
      if (optionType === 'subscription' && option.total < 0) {
        newErrors[`paymentOptions.${optionType}.total`] = 'Total cannot be negative';
      }
      
      if (!option.name || option.name.trim() === '') {
        newErrors[`paymentOptions.${optionType}.name`] = 'Name is required';
      }
    });
    
    STUDENT_TYPES.forEach(type => {
      const data = pricingData[type.key];
      
      // Validate costPerCredit is non-negative
      if (data.costPerCredit < 0) {
        newErrors[`${type.key}.costPerCredit`] = 'Cost per credit cannot be negative';
      }
      
      // Validate freeCreditsLimit is positive if not null
      if (data.freeCreditsLimit !== null && data.freeCreditsLimit < 0) {
        newErrors[`${type.key}.freeCreditsLimit`] = 'Credit limit cannot be negative';
      }
      
      // Validate rejoin fee
      if (data.rejoinFee !== undefined && data.rejoinFee < 0) {
        newErrors[`${type.key}.rejoinFee`] = 'Rejoin fee cannot be negative';
      }
      
      // Validate existing pricing fields if they exist
      if (data.monthlyPayment !== undefined && data.monthlyPayment < 0) {
        newErrors[`${type.key}.monthlyPayment`] = 'Monthly payment cannot be negative';
      }
      
      if (data.oneTimePrice !== undefined && data.oneTimePrice < 0) {
        newErrors[`${type.key}.oneTimePrice`] = 'One-time price cannot be negative';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateData()) {
      setSaveStatus({ type: 'error', message: 'Please fix validation errors before saving' });
      return;
    }
    
    setSaving(true);
    setSaveStatus(null);
    
    try {
      const db = getDatabase();
      const updates = {};
      
      // Add credit pricing data
      updates['pricing/pricePerCredit'] = {
        ...creditPricingData,
        lastUpdated: Date.now()
      };
      
      // Add payment options data
      updates['pricing/paymentOptions'] = {
        ...paymentOptionsData,
        lastUpdated: Date.now()
      };
      
      // Build update object with changes
      STUDENT_TYPES.forEach(type => {
        const data = pricingData[type.key];
        updates[`pricing/${type.key}`] = {
          ...data,
          lastUpdated: Date.now()
        };
      });
      
      await update(ref(db), updates);
      
      setOriginalData({
        ...JSON.parse(JSON.stringify(pricingData)),
        pricePerCredit: { ...creditPricingData },
        paymentOptions: { ...paymentOptionsData }
      });
      setSaveStatus({ type: 'success', message: 'Pricing configuration saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving pricing data:', error);
      setSaveStatus({ type: 'error', message: `Failed to save: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPricingData(JSON.parse(JSON.stringify(originalData)));
    setCreditPricingData(originalData.pricePerCredit || {
      stripePriceId: '',
      priceInCents: 10000,
      currency: 'CAD'
    });
    setPaymentOptionsData(originalData.paymentOptions || {
      onetime: {
        id: '',
        name: 'One-time Payment',
        amount: 650,
        description: 'Pay full amount upfront and save'
      },
      subscription: {
        id: '',
        name: 'Monthly Payments',
        amount: 233.33,
        total: 700,
        description: '3 monthly payments'
      }
    });
    setErrors({});
    setSaveStatus(null);
  };

  const handleMassRecalculation = async () => {
    setShowRecalcModal(true);
    setRecalculating(true);
    setRecalcStatus(null);
    
    try {
      const functions = getFunctions();
      const triggerRecalc = httpsCallable(functions, 'triggerMassCreditRecalculation');
      
      const result = await triggerRecalc();
      
      setRecalcStatus({
        type: 'success',
        data: result.data
      });
      
      // Auto close modal after 5 seconds on success
      setTimeout(() => {
        setShowRecalcModal(false);
        setRecalcStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error triggering mass recalculation:', error);
      setRecalcStatus({
        type: 'error',
        message: error.message || 'Failed to trigger credit recalculation'
      });
    } finally {
      setRecalculating(false);
    }
  };

  const handleSingleStudentRecalc = async () => {
    if (!singleStudentEmail || !singleStudentEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setRecalculating(true);
    setRecalcStatus(null);
    
    try {
      const db = getDatabase();
      const studentKey = sanitizeEmail(singleStudentEmail);
      
      // Trigger recalculation for single student
      await set(ref(db, `creditRecalculations/${studentKey}/trigger`), Date.now());
      
      setRecalcStatus({
        type: 'success',
        message: `Credit recalculation triggered for ${singleStudentEmail}`
      });
      
      // Clear input after success
      setSingleStudentEmail('');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowSingleRecalc(false);
        setRecalcStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error triggering single student recalculation:', error);
      setRecalcStatus({
        type: 'error',
        message: error.message || 'Failed to trigger recalculation'
      });
    } finally {
      setRecalculating(false);
    }
  };

  const hasChanges = JSON.stringify(pricingData) !== JSON.stringify(originalData) || 
                     JSON.stringify(creditPricingData) !== JSON.stringify(originalData.pricePerCredit || {}) ||
                     JSON.stringify(paymentOptionsData) !== JSON.stringify(originalData.paymentOptions || {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading pricing configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Pricing & Credit Configuration
        </h2>
        <p className="text-gray-600 mt-1">
          Manage pricing, credit limits, and payment requirements for different student types
        </p>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <Alert className={`mb-4 ${saveStatus.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {saveStatus.type === 'success' ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={saveStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {saveStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Stripe Credit Pricing Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Stripe Credit Pricing Configuration
          </h3>
          <p className="text-sm text-gray-600 mt-1">Configure the Stripe pricing for course credits</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stripe Price ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Price ID
              </label>
              <input
                type="text"
                value={creditPricingData.stripePriceId || ''}
                onChange={(e) => handleCreditPricingChange('stripePriceId', e.target.value)}
                placeholder="price_XXXXXXXXX"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors['creditPricing.stripePriceId'] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors['creditPricing.stripePriceId'] && (
                <p className="text-red-500 text-xs mt-1">{errors['creditPricing.stripePriceId']}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">The Price ID from your Stripe dashboard</p>
            </div>

            {/* Price in Cents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Credit (in cents)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={creditPricingData.priceInCents || 0}
                  onChange={(e) => handleCreditPricingChange('priceInCents', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors['creditPricing.priceInCents'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="100"
                />
              </div>
              {errors['creditPricing.priceInCents'] && (
                <p className="text-red-500 text-xs mt-1">{errors['creditPricing.priceInCents']}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ${((creditPricingData.priceInCents || 0) / 100).toFixed(2)} {creditPricingData.currency || 'CAD'}
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Code
              </label>
              <select
                value={creditPricingData.currency || 'CAD'}
                onChange={(e) => handleCreditPricingChange('currency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors['creditPricing.currency'] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
              {errors['creditPricing.currency'] && (
                <p className="text-red-500 text-xs mt-1">{errors['creditPricing.currency']}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Currency for credit pricing</p>
            </div>
          </div>
          
          {/* Info Alert */}
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Important:</strong> The Stripe Price ID must match a valid price object in your Stripe account. 
              The price in cents is used for display purposes in the UI. Make sure the Stripe price matches the amount configured here.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Payment Options Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Course Payment Options
          </h3>
          <p className="text-sm text-gray-600 mt-1">Configure one-time and subscription payment options for courses</p>
        </div>
        
        <div className="p-4 space-y-6">
          {/* One-time Payment Option */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-700 mb-3">One-time Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Price ID
                </label>
                <input
                  type="text"
                  value={paymentOptionsData.onetime.id || ''}
                  onChange={(e) => handlePaymentOptionChange('onetime', 'id', e.target.value)}
                  placeholder="price_XXXXXXXXX"
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors['paymentOptions.onetime.id'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['paymentOptions.onetime.id'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.onetime.id']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={paymentOptionsData.onetime.name || ''}
                  onChange={(e) => handlePaymentOptionChange('onetime', 'name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors['paymentOptions.onetime.name'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['paymentOptions.onetime.name'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.onetime.name']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={paymentOptionsData.onetime.amount || 0}
                  onChange={(e) => handlePaymentOptionChange('onetime', 'amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors['paymentOptions.onetime.amount'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors['paymentOptions.onetime.amount'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.onetime.amount']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={paymentOptionsData.onetime.description || ''}
                  onChange={(e) => handlePaymentOptionChange('onetime', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Subscription Payment Option */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-700 mb-3">Subscription Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stripe Price ID
                  </label>
                  <input
                    type="text"
                    value={paymentOptionsData.subscription.id || ''}
                    onChange={(e) => handlePaymentOptionChange('subscription', 'id', e.target.value)}
                    placeholder="price_XXXXXXXXX"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors['paymentOptions.subscription.id'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['paymentOptions.subscription.id'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.subscription.id']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={paymentOptionsData.subscription.name || ''}
                    onChange={(e) => handlePaymentOptionChange('subscription', 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors['paymentOptions.subscription.name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['paymentOptions.subscription.name'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.subscription.name']}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Amount ($)
                  </label>
                  <input
                    type="number"
                    value={paymentOptionsData.subscription.amount || 0}
                    onChange={(e) => handlePaymentOptionChange('subscription', 'amount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors['paymentOptions.subscription.amount'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {errors['paymentOptions.subscription.amount'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.subscription.amount']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total ($)
                  </label>
                  <input
                    type="number"
                    value={paymentOptionsData.subscription.total || 0}
                    onChange={(e) => handlePaymentOptionChange('subscription', 'total', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors['paymentOptions.subscription.total'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {errors['paymentOptions.subscription.total'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['paymentOptions.subscription.total']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    # of Payments
                  </label>
                  <input
                    type="text"
                    value="3"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fixed</p>
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={paymentOptionsData.subscription.description || ''}
                  onChange={(e) => handlePaymentOptionChange('subscription', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Info Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Note:</strong> Subscriptions are automatically limited to 3 monthly payments. The system will cancel the subscription after the third successful payment.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Student Type Cards */}
      <div className="space-y-6">
        {STUDENT_TYPES.map(type => {
          const data = pricingData[type.key] || {};
          const hasLimit = data.freeCreditsLimit !== null && data.freeCreditsLimit !== undefined;
          
          return (
            <div key={type.key} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className={`p-4 border-b border-gray-200 bg-${type.color}-50`}>
                <h3 className="font-semibold text-lg">{type.label}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Credit Tracking Section */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-700 mb-3">Credit Tracking Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Credits Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Free Credits Limit
                      </label>
                      {/* Disable for Adult and International students */}
                      {type.key === 'adultStudents' || type.key === 'internationalStudents' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="Not Applicable"
                            disabled
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                          />
                          <div className="p-2 rounded-md bg-gray-100">
                            <Infinity className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={hasLimit ? data.freeCreditsLimit : ''}
                            onChange={(e) => handleFieldChange(
                              type.key, 
                              'freeCreditsLimit', 
                              e.target.value === '' ? null : parseInt(e.target.value)
                            )}
                            placeholder="Unlimited"
                            className={`flex-1 px-3 py-2 border rounded-md ${
                              errors[`${type.key}.freeCreditsLimit`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="0"
                          />
                          <button
                            onClick={() => handleFieldChange(type.key, 'freeCreditsLimit', null)}
                            className={`p-2 rounded-md ${
                              !hasLimit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title="Set to unlimited"
                          >
                            <Infinity className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {errors[`${type.key}.freeCreditsLimit`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${type.key}.freeCreditsLimit`]}</p>
                      )}
                    </div>

                    {/* Cost Per Credit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Per Credit ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={data.costPerCredit || 0}
                          onChange={(e) => handleFieldChange(
                            type.key, 
                            'costPerCredit', 
                            parseFloat(e.target.value) || 0
                          )}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md ${
                            errors[`${type.key}.costPerCredit`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors[`${type.key}.costPerCredit`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${type.key}.costPerCredit`]}</p>
                      )}
                    </div>

                    {/* Payment Required Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment After Limit
                      </label>
                      <button
                        onClick={() => handleFieldChange(
                          type.key, 
                          'requiresPaymentAfterLimit', 
                          !data.requiresPaymentAfterLimit
                        )}
                        className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                          data.requiresPaymentAfterLimit
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {data.requiresPaymentAfterLimit ? 'Required' : 'Not Required'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Pricing Fields */}
                <div className="border-l-4 border-purple-500 pl-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Additional Pricing Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rejoin Fee - Always shown for all student types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rejoin Fee ($)
                      </label>
                      <input
                        type="number"
                        value={data.rejoinFee || 0}
                        onChange={(e) => handleFieldChange(
                          type.key, 
                          'rejoinFee', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    {data.monthlyPayment !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Payment ($)
                        </label>
                        <input
                          type="number"
                          value={data.monthlyPayment || 0}
                          onChange={(e) => handleFieldChange(
                            type.key, 
                            'monthlyPayment', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                    
                    {data.oneTimePrice !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          One-Time Price ($)
                        </label>
                        <input
                          type="number"
                          value={data.oneTimePrice || 0}
                          onChange={(e) => handleFieldChange(
                            type.key, 
                            'oneTimePrice', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          {hasChanges && (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              You have unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowSingleRecalc(true)}
            disabled={saving || recalculating}
            className="px-4 py-2 text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Recalculate credits for a single student"
          >
            <Calculator className="h-4 w-4" />
            Single Student
          </button>
          
          <button
            onClick={handleMassRecalculation}
            disabled={saving || recalculating}
            className="px-4 py-2 text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Recalculate credits for all students based on current pricing"
          >
            <Users className="h-4 w-4" />
            All Students
          </button>
          
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Reset Changes
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Single Student Recalc Modal */}
      {showSingleRecalc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Single Student Credit Recalculation
              </h3>
              {!recalculating && (
                <button
                  onClick={() => {
                    setShowSingleRecalc(false);
                    setSingleStudentEmail('');
                    setRecalcStatus(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {!recalcStatus && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter a student email to recalculate their credits. Use this for testing before running a full batch.
                </p>
                <input
                  type="email"
                  value={singleStudentEmail}
                  onChange={(e) => setSingleStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                  disabled={recalculating}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSingleStudentRecalc}
                    disabled={recalculating || !singleStudentEmail}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {recalculating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        Recalculate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSingleRecalc(false);
                      setSingleStudentEmail('');
                    }}
                    disabled={recalculating}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {recalcStatus?.type === 'success' && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-green-700">{recalcStatus.message}</p>
                <p className="text-xs text-gray-500 mt-2">Closing automatically...</p>
              </div>
            )}
            
            {recalcStatus?.type === 'error' && (
              <div className="py-4">
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{recalcStatus.message}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRecalcStatus(null);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mass Recalculation Modal */}
      {showRecalcModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Credit Recalculation
              </h3>
              {!recalculating && (
                <button
                  onClick={() => setShowRecalcModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {recalculating && !recalcStatus && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500 mb-3" />
                <p className="text-gray-600">Processing credit recalculation...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
              </div>
            )}
            
            {recalcStatus?.type === 'success' && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-700 mb-2">Recalculation Complete!</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Total Students: {recalcStatus.data.totalStudents}</p>
                  <p>Processed: {recalcStatus.data.processedCount}</p>
                  {recalcStatus.data.failedCount > 0 && (
                    <p className="text-red-600">Failed: {recalcStatus.data.failedCount}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">Window will close automatically</p>
              </div>
            )}
            
            {recalcStatus?.type === 'error' && (
              <div className="py-6">
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-semibold text-red-700">Recalculation Failed</h4>
                      <p className="text-sm text-red-600 mt-1">{recalcStatus.message}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecalcModal(false)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManager;