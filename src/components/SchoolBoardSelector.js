import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Building, Building2, Check, X, ArrowRight } from 'lucide-react';
import { searchAuthorities, getAllAuthorities, getAllPublicAuthorities, getAllSeparateAuthorities } from '../config/albertaSchoolBoards';

const SchoolBoardSelector = ({ 
  value, 
  onChange, 
  error, 
  placeholder = "Search by school board name or code (e.g. 2245)...", 
  required = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Initialize search term from value if it's a full authority name
  useEffect(() => {
    if (value && !searchTerm) {
      // Get all authorities for validation and display
      const allAuthorities = getAllAuthorities();
      // Check if value is an authority name
      const authorityEntry = Object.entries(allAuthorities).find(([code, name]) => name === value);
      if (authorityEntry) {
        setSearchTerm(value);
      }
    }
  }, [value, searchTerm]);
  
  // Update filtered options when search term changes
  useEffect(() => {
    if (searchTerm) {
      // Search by both name and code
      let results = searchAuthorities(searchTerm);
      
      // Also check if search term matches any authority codes
      const searchTermUpper = searchTerm.toUpperCase();
      const allAuthorities = getAllAuthorities();
      Object.entries(allAuthorities).forEach(([code, name]) => {
        if (code.includes(searchTermUpper) && !results.find(r => r.code === code)) {
          results.push({ code, name });
        }
      });
      
      // Limit to 10 results for performance
      setFilteredOptions(results.slice(0, 10));
    } else {
      setFilteredOptions([]);
    }
  }, [searchTerm]);
  
  // Handle search input changes
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    // If empty, clear the value
    if (!term) {
      onChange('');
    }
  };
  
  // Handle selection from dropdown
  const handleSelect = (authority) => {
    setSearchTerm(authority.name);
    onChange(authority.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };
  
  // Handle clearing the selection
  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };
  
  // Handle manual entry
  const handleManualEntry = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get current authority code if value matches an authority name
  const getCurrentAuthorityCode = () => {
    if (!value) return '';
    const allAuthorities = getAllAuthorities();
    const authorityEntry = Object.entries(allAuthorities).find(([code, name]) => name === value);
    return authorityEntry ? authorityEntry[0] : '';
  };
  
  // Check if authority is public or separate
  const getAuthorityType = (code) => {
    const publicAuthorities = getAllPublicAuthorities();
    const separateAuthorities = getAllSeparateAuthorities();
    if (publicAuthorities[code]) return 'public';
    if (separateAuthorities[code]) return 'separate';
    return 'unknown';
  };
  
  // Group filtered options by type
  const groupedOptions = {
    public: filteredOptions.filter(option => getAuthorityType(option.code) === 'public'),
    separate: filteredOptions.filter(option => getAuthorityType(option.code) === 'separate')
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Show selection interface only when no value is selected */}
      {!value && (
        <>
          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                role="combobox"
              />
              
              <ChevronDown 
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
        
        {/* Dropdown */}
        {isOpen && (filteredOptions.length > 0 || searchTerm.trim()) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
            {/* Public Authorities */}
            {groupedOptions.public.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    Public School Authorities
                  </div>
                </div>
                {groupedOptions.public.map((option, index) => {
                  const globalIndex = filteredOptions.indexOf(option);
                  return (
                    <div
                      key={option.code}
                      onClick={() => handleSelect(option)}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-blue-50 ${
                        selectedIndex === globalIndex ? 'bg-blue-100' : ''
                      }`}
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500">Code: {option.code}</div>
                      </div>
                      {value === option.name && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Separate Authorities */}
            {groupedOptions.separate.length > 0 && (
              <div>
                {groupedOptions.public.length > 0 && <div className="border-t" />}
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    Separate (Catholic) School Authorities
                  </div>
                </div>
                {groupedOptions.separate.map((option, index) => {
                  const globalIndex = filteredOptions.indexOf(option);
                  return (
                    <div
                      key={option.code}
                      onClick={() => handleSelect(option)}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-purple-50 ${
                        selectedIndex === globalIndex ? 'bg-purple-100' : ''
                      }`}
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500">Code: {option.code}</div>
                      </div>
                      {value === option.name && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Manual Entry Option - Always show when there's search text */}
            {searchTerm.trim() && (
              <div className="border-t">
                <div
                  onClick={handleManualEntry}
                  className="px-3 py-3 cursor-pointer hover:bg-gray-50 flex items-center space-x-2"
                  role="option"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Can't find your school board?
                    </div>
                    <div className="text-xs text-gray-500">
                      Click to use "{searchTerm.trim()}" as entered
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>
          )}
          </div>
        </>
      )}
      
      {/* Current Selection Display */}
      {value && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-900">{value}</div>
              {getCurrentAuthorityCode() && (
                <div className="text-xs text-green-700">
                  Authority Code: {getCurrentAuthorityCode()} • 
                  {getAuthorityType(getCurrentAuthorityCode()) === 'public' ? ' Public' : ' Separate (Catholic)'}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-green-600 hover:text-green-800 transition-colors p-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolBoardSelector;