// src/StudentManagement/FilterPanel.js

import React from 'react';
import Select from 'react-select';

function FilterPanel({ filters, onFilterChange, studentSummaries, availableFilters }) {
  // Generate options for each filter
  const filterOptions = {};

  availableFilters.forEach(({ key, label }) => {
    const options = [
      ...new Set(
        studentSummaries
          .map((s) => s[key])
          .filter((v) => v !== null && v !== undefined && v !== '')
      ),
    ].sort();
    filterOptions[key] = options.map((option) => ({
      value: option,
      label: String(option),
    }));
  });

  const handleChange = (selectedOptions, { name }) => {
    onFilterChange({
      ...filters,
      [name]: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="flex flex-wrap gap-4">
        {availableFilters.map(({ key, label }) => (
          <div key={key} className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <Select
              isMulti
              name={key}
              options={filterOptions[key]}
              value={
                filters[key]
                  ? filterOptions[key].filter((option) => filters[key].includes(option.value))
                  : []
              }
              onChange={handleChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder={`Select ${label}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilterPanel;
