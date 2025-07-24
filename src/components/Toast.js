import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircle2,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: Info,
          iconColor: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: Info,
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 pr-12 max-w-md`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 p-1 rounded-md hover:bg-white/50 transition-colors`}
        >
          <X className={`w-4 h-4 ${styles.text}`} />
        </button>
      </div>
    </div>
  );
};

export default Toast;