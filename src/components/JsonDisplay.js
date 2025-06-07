import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const JsonDisplay = ({ data, title, subtitle, filePath }) => {
  const [copied, setCopied] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderValue = (value, key = '', depth = 0) => {
    const indent = depth * 20;

    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className={value ? "text-green-600" : "text-red-600"}>{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-purple-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(`${key}_${depth}`);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(`${key}_${depth}`)}
            className="flex items-center text-sm hover:bg-gray-100 p-1 rounded"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-gray-600 ml-1">[{value.length} items]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-200 pl-4 mt-2">
              {value.length === 0 ? (
                <div className="text-gray-500 text-sm">Empty array</div>
              ) : (
                value.map((item, index) => (
                  <div key={index} className="mb-2">
                    <span className="text-gray-500 text-sm">{index}: </span>
                    {renderValue(item, `${key}_${index}`, depth + 1)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const isExpanded = expandedKeys.has(`${key}_${depth}`);
      
      return (
        <div>
          <button
            onClick={() => toggleExpanded(`${key}_${depth}`)}
            className="flex items-center text-sm hover:bg-gray-100 p-1 rounded"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-gray-600 ml-1">{`{${keys.length} properties}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-200 pl-4 mt-2">
              {keys.length === 0 ? (
                <div className="text-gray-500 text-sm">Empty object</div>
              ) : (
                keys.map((objKey) => (
                  <div key={objKey} className="mb-3">
                    <div className="flex items-start">
                      <span className="font-medium text-gray-800 text-sm min-w-0">
                        "{objKey}":
                      </span>
                      <div className="ml-2 flex-1">
                        {renderValue(value[objKey], `${key}_${objKey}`, depth + 1)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
            {renderValue(data, 'root', 0)}
          </div>
          {filePath && (
            <div className="text-xs text-gray-500 mt-2">
              File: {filePath}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonDisplay;