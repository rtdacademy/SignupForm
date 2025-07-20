import React, { useState, useRef } from 'react';
import { Upload, X, DollarSign, FileText, AlertCircle, CheckCircle2, Camera, File } from 'lucide-react';

const ReimbursementSubmissionForm = ({ 
  student,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'educational_materials',
    purchaseDate: new Date().toISOString().split('T')[0] // Today's date
  });

  const [receipts, setReceipts] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState([]);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'educational_materials', label: 'Educational Materials (Books, Supplies)' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'curriculum', label: 'Curriculum & Learning Resources' },
    { value: 'equipment', label: 'Educational Equipment' },
    { value: 'activities', label: 'Educational Activities & Field Trips' },
    { value: 'testing', label: 'Testing & Assessment Fees' },
    { value: 'other', label: 'Other Educational Expenses' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a valid positive number';
      } else if (amount > 5000) {
        newErrors.amount = 'Amount cannot exceed $5,000 per submission';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        newErrors.amount = 'Amount must have at most 2 decimal places';
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Receipt validation
    if (receipts.length === 0) {
      newErrors.receipts = 'At least one receipt is required';
    }

    // Purchase date validation
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    } else {
      const purchaseDate = new Date(formData.purchaseDate);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (purchaseDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
      } else if (purchaseDate < oneYearAgo) {
        newErrors.purchaseDate = 'Purchase date cannot be more than one year ago';
      }
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    // Format amount input
    if (field === 'amount') {
      // Allow only numbers and one decimal point
      value = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newUploadErrors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        newUploadErrors.push(`File ${file.name}: Only JPEG, PNG, GIF, and PDF files are allowed`);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        newUploadErrors.push(`File ${file.name}: File size must be less than 5MB`);
        return;
      }

      // Create preview
      const fileWithPreview = {
        file,
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null
      };

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      validFiles.push(fileWithPreview);
    });

    setUploadErrors(newUploadErrors);
    setReceipts(prev => [...prev, ...validFiles]);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear receipt error if files were added
    if (validFiles.length > 0 && errors.receipts) {
      setErrors(prev => ({ ...prev, receipts: '' }));
    }
  };

  const removeReceipt = (id) => {
    setReceipts(prev => {
      const updated = prev.filter(receipt => receipt.id !== id);
      // Revoke object URL to prevent memory leaks
      const receipt = prev.find(r => r.id === id);
      if (receipt && receipt.preview) {
        URL.revokeObjectURL(receipt.preview);
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      receipts: receipts.map(r => r.file),
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      submittedAt: new Date().toISOString()
    };

    onSubmit(submissionData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FormField = ({ label, error, children, required = false, info = null }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Submit Reimbursement Request
          </h3>
          <p className="text-sm text-gray-600">
            Request reimbursement for {student.firstName} {student.lastName}'s educational expenses
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Amount" 
            error={errors.amount} 
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border ${errors.amount ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField 
            label="Purchase Date" 
            error={errors.purchaseDate} 
            required
          >
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className={`w-full px-3 py-2 border ${errors.purchaseDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </FormField>
        </div>

        <FormField 
          label="Category" 
          error={errors.category} 
          required
        >
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField 
          label="Description" 
          error={errors.description} 
          required
        >
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            placeholder="Describe the educational purpose of this expense (minimum 10 characters)..."
          />
          <div className="text-right text-xs text-gray-500">
            {formData.description.length}/500
          </div>
        </FormField>

        <FormField 
          label="Receipts" 
          error={errors.receipts} 
          required
        >
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-4">
                JPEG, PNG, GIF, PDF up to 5MB each
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Camera className="w-4 h-4 mr-2" />
                Choose Files
              </button>
            </div>

            {/* Upload Errors */}
            {uploadErrors.length > 0 && (
              <div className="space-y-1">
                {uploadErrors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Receipts */}
            {receipts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Receipts:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        {receipt.preview ? (
                          <img
                            src={receipt.preview}
                            alt="Receipt preview"
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <File className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {receipt.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(receipt.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReceipt(receipt.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormField>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 border border-transparent rounded-md text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReimbursementSubmissionForm;