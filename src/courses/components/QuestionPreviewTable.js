import React from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes, FaInfoCircle } from 'react-icons/fa';

const QuestionPreviewTable = ({ previewItems, summary }) => {
  if (!previewItems || previewItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaInfoCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
        <p>No questions to preview</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <FaCheck className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <FaTimes className="h-4 w-4 text-red-500" />;
      default:
        return <FaInfoCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaInfoCircle className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-900">Import Summary</span>
          </div>
          <div className="text-sm text-blue-700">
            {summary.totalQuestions} total • {summary.validQuestions} valid
            {summary.duplicates > 0 && ` • ${summary.duplicates} duplicates`}
            {summary.errors > 0 && ` • ${summary.errors} errors`}
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h4 className="font-medium text-gray-900">Questions to Import</h4>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Question Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">
                  Points
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Generated Question ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {previewItems.map((item, index) => {
                const hasWarnings = item.warnings && item.warnings.length > 0;
                const hasErrors = item.errors && item.errors.length > 0;
                const status = hasErrors ? 'error' : (hasWarnings ? 'warning' : 'valid');
                
                return (
                  <tr key={index} className={`${getStatusBg(status)} border-l-4`}>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        {getStatusIcon(status)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {item.title}
                        </div>
                        
                        {/* Error Messages */}
                        {hasErrors && (
                          <div className="space-y-1">
                            {item.errors.map((error, errorIndex) => (
                              <div key={errorIndex} className="text-xs text-red-600 flex items-center gap-1">
                                <FaTimes className="h-3 w-3" />
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Warning Messages */}
                        {hasWarnings && (
                          <div className="space-y-1">
                            {item.warnings.map((warning, warningIndex) => (
                              <div key={warningIndex} className="text-xs text-yellow-600 flex items-center gap-1">
                                <FaExclamationTriangle className="h-3 w-3" />
                                {warning}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.points}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {item.questionId}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{summary.totalQuestions}</div>
          <div className="text-xs text-blue-600">Total Questions</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{summary.validQuestions}</div>
          <div className="text-xs text-green-600">Valid Questions</div>
        </div>
        {summary.duplicates > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{summary.duplicates}</div>
            <div className="text-xs text-yellow-600">Duplicates</div>
          </div>
        )}
        {summary.errors > 0 && (
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
            <div className="text-xs text-red-600">Errors</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPreviewTable;