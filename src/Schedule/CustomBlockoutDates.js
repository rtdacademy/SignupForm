import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format as formatDate } from 'date-fns';
import { Label } from '../components/ui/label';
import { Trash2, Calendar, Info } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

// Custom Calendar Container component
const CalendarContainer = ({ className, children }) => {
  return (
    <div className="space-y-2">
      <div className="p-3 bg-blue-50 border-b border-blue-100 rounded-t">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-blue-700 font-medium">
              How to select break dates:
            </p>
            <ol className="text-sm text-blue-600 list-decimal pl-4 space-y-0.5">
              <li>Click a start date</li>
              <li>Click an end date to complete the range</li>
            </ol>
          </div>
        </div>
      </div>
      <div className={className}>
        {children}
      </div>
    </div>
  );
};

const CustomBlockoutDates = ({ customBlockoutDates, setCustomBlockoutDates }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const addDateRange = (start, end) => {
    if (!start || !end) return;
    
    if (end < start) {
      toast.error('End date cannot be before start date.');
      return;
    }
    
    setCustomBlockoutDates([
      ...customBlockoutDates,
      { startDate: start, endDate: end },
    ]);
    setDateRange([null, null]); // Reset the date range after adding
  };

  const removeDateRange = (index) => {
    const newDates = [...customBlockoutDates];
    newDates.splice(index, 1);
    setCustomBlockoutDates(newDates);
  };

  return (
    <div className="mb-4">
      <div className="space-y-2">
        <div className="flex-1">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
              // If both dates are selected, automatically add the range
              if (update[0] && update[1]) {
                addDateRange(update[0], update[1]);
              }
            }}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select break dates"
            className="w-full border border-gray-300 rounded px-2 py-2"
           
           
            calendarContainer={CalendarContainer}
          />
        </div>
        
        {/* Show helper message when only start date is selected */}
        {startDate && !endDate && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Info className="h-4 w-4" />
            <span>Now click an end date to complete your break period</span>
          </div>
        )}
      </div>

      {customBlockoutDates.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-2">
            {customBlockoutDates.map((range, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">
                    {formatDate(range.startDate, 'MMM dd, yyyy')} - {formatDate(range.endDate, 'MMM dd, yyyy')}
                  </span>
                </span>
                <button
                  onClick={() => removeDateRange(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove Break Period"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomBlockoutDates;