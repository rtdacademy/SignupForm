import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChevronDown, ChevronUp, X, Maximize, Minimize, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FilterPanel({ filters: propFilters, onFilterChange, studentSummaries, availableFilters, isFullScreen, onFullScreenToggle, searchTerm, onSearchChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [localFilters, setLocalFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filterOptions = {};
  availableFilters.forEach(({ key, label }) => {
    const options = [...new Set(studentSummaries.map((s) => s[key]).filter((v) => v !== null && v !== undefined && v !== ''))].sort();
    filterOptions[key] = options.map((option) => ({ value: option, label: String(option) }));
  });

  useEffect(() => {
    const initialFilters = { ...propFilters };
    if (!initialFilters.ActiveFutureArchived_Value || initialFilters.ActiveFutureArchived_Value.length === 0) {
      initialFilters.ActiveFutureArchived_Value = ['Active'];
    }
    setLocalFilters(initialFilters);
    onFilterChange(initialFilters);
  }, [propFilters]);

  useEffect(() => {
    setActiveFilterCount(Object.values(localFilters).reduce((acc, curr) => acc + curr.length, 0));
  }, [localFilters]);

  const handleChange = (selectedOptions, { name }) => {
    const updatedFilters = {
      ...localFilters,
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : [],
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => ({
      ...acc,
      [key]: key === 'ActiveFutureArchived_Value' ? ['Active'] : []
    }), {});
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    onSearchChange('');
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#d1d5db',
      minHeight: '32px',
      height: 'auto',
    }),
    valueContainer: (provided) => ({ ...provided, padding: '0 6px' }),
    input: (provided) => ({ ...provided, margin: '0px' }),
    indicatorsContainer: (provided) => ({ ...provided, height: '32px' }),
    menu: (provided) => ({ ...provided, backgroundColor: 'white', zIndex: 9999 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#315369' : state.isFocused ? '#f0f4f7' : 'white',
      color: state.isSelected ? 'white' : '#315369',
    }),
    multiValue: (provided) => ({ ...provided, backgroundColor: '#f0f4f7' }),
    multiValueLabel: (provided) => ({ ...provided, color: '#315369' }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#315369',
      '&:hover': { backgroundColor: '#315369', color: 'white' },
    }),
  };

  return (
    <Card className="bg-[#f0f4f7] shadow-md">
      <CardHeader className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <CardTitle className="text-lg font-semibold text-[#315369] whitespace-nowrap">Filters</CardTitle>
        <div className="flex-grow relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-white w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!isMobile && (
          <div className="flex items-center space-x-2">
            {(activeFilterCount > 0 || searchTerm) && (
              <div className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount + (searchTerm ? 1 : 0)}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onFullScreenToggle} className="text-[#315369]" title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#315369]">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-[#315369]">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardHeader>
      {!isMobile && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="px-6 py-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {availableFilters.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={key} className="text-xs font-medium text-[#1fa6a7]">{label}</Label>
                      <div className="relative">
                        <Select
                          isMulti
                          name={key}
                          options={filterOptions[key]}
                          value={filterOptions[key].filter(option => localFilters[key]?.includes(option.value))}
                          onChange={(selectedOptions, action) => handleChange(selectedOptions, action)}
                          styles={customStyles}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder={`${label}`}
                        />
                        {localFilters[key] && localFilters[key].length > 0 && (
                          <div className="absolute -top-2 -right-2 h-4 w-4 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Card>
  );
}

export default FilterPanel;