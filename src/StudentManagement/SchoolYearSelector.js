import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getSchoolYearOptions } from '../config/DropdownOptions';

const SchoolYearSelector = ({ selectedYear, onYearChange }) => {
    const yearOptions = getSchoolYearOptions();
    const defaultYear = yearOptions.find(option => option.isDefault)?.value;
    const selectedOption = yearOptions.find(option => option.value === (selectedYear || defaultYear));
    const selectedColor = selectedOption?.color;
  
    return (
      <Card className="bg-[#f0f4f7] shadow-md w-[105px]">
        <CardContent className="py-2 px-2">
          <div className="flex items-center space-x-2">
            <Select
              value={selectedYear || defaultYear}
              onValueChange={onYearChange}
            >
              <SelectTrigger 
                className="bg-white shadow-md w-[90px]"
                style={{ color: selectedColor }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    style={{ color: option.color }}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default SchoolYearSelector;