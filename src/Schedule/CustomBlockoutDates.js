// src/Schedule/CustomBlockoutDates.js

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format as formatDate } from 'date-fns';
import { Label } from '../components/ui/label';
import { Trash2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const CustomBlockoutDates = ({ customBlockoutDates, setCustomBlockoutDates }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const addDateRange = (start, end) => {
    if (end < start) {
      alert('End date cannot be before start date.');
      return;
    }
    setCustomBlockoutDates([
      ...customBlockoutDates,
      { startDate: start, endDate: end },
    ]);
    setStartDate(null);
    setEndDate(null);
  };

  const removeDateRange = (index) => {
    const newDates = [...customBlockoutDates];
    newDates.splice(index, 1);
    setCustomBlockoutDates(newDates);
  };

  return (
    <div className="mb-4">
      <Label>Custom Blockout Dates</Label>
      <div className="flex items-center mb-2 space-x-2">
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            setEndDate(null); // Reset end date when start date changes
          }}
          dateFormat="MMM dd, yyyy"
          placeholderText="Start Date"
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
        {startDate && (
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              if (startDate && date) {
                addDateRange(startDate, date);
              }
            }}
            dateFormat="MMM dd, yyyy"
            placeholderText="End Date"
            minDate={startDate}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        )}
      </div>
      {customBlockoutDates.length > 0 && (
        <div className="mt-2">
          <ul className="space-y-1">
            {customBlockoutDates.map((range, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>
                  {formatDate(range.startDate, 'MMM dd, yyyy')} to{' '}
                  {formatDate(range.endDate, 'MMM dd, yyyy')}
                </span>
                <button
                  onClick={() => removeDateRange(index)}
                  className="text-red-500"
                  title="Remove Date Range"
                >
                  <Trash2 size={20} />
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
