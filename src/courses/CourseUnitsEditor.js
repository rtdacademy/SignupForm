import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CourseUnitsEditor = ({ units, onUnitsChange, isEditing }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [showMultiplierInfo, setShowMultiplierInfo] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, unitIndex: null });
  const quillRefs = useRef({});

  // Ensure units is always an array
  const safeUnits = Array.isArray(units) ? units : [];

  /**
   * Handles changes to unit fields (e.g., name, section).
   * @param {number} unitIndex - Index of the unit being edited.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value for the field.
   */
  const handleUnitChange = useCallback((unitIndex, field, value) => {
    const newUnits = [...safeUnits];
    newUnits[unitIndex] = {
      ...newUnits[unitIndex],
      [field]: value,
    };
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

  /**
   * Handles changes to assessment item fields (e.g., title, type, multiplier).
   * @param {number} unitIndex - Index of the unit containing the item.
   * @param {number} itemIndex - Index of the item being edited.
   * @param {string} field - The field name to update.
   * @param {any} value - The new value for the field.
   */
  const handleItemChange = useCallback((unitIndex, itemIndex, field, value) => {
    const newUnits = [...safeUnits];
    newUnits[unitIndex] = {
      ...newUnits[unitIndex],
      items: [
        ...newUnits[unitIndex].items.slice(0, itemIndex),
        {
          ...newUnits[unitIndex].items[itemIndex],
          [field]: value,
        },
        ...newUnits[unitIndex].items.slice(itemIndex + 1),
      ],
    };
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

  /**
   * Handles changes to the ReactQuill editor content.
   * @param {number} unitIndex - Index of the unit containing the item.
   * @param {number} itemIndex - Index of the item being edited.
   */
  const handleQuillChange = useCallback((unitIndex, itemIndex) => {
    const quill = quillRefs.current[`${unitIndex}-${itemIndex}`];
    if (quill) {
      const content = quill.getEditor().root.innerHTML;
      handleItemChange(unitIndex, itemIndex, 'notes', content);
    }
  }, [handleItemChange]);

  /**
   * Toggles the expansion state of an assessment item.
   * @param {number} unitIndex - Index of the unit containing the item.
   * @param {number} itemIndex - Index of the item to toggle.
   */
  const toggleItemExpansion = useCallback((unitIndex, itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${unitIndex}-${itemIndex}`]: !prev[`${unitIndex}-${itemIndex}`]
    }));
  }, []);

  /**
   * Returns the appropriate background color class based on the assessment type.
   * @param {string} type - Type of the assessment (e.g., 'info', 'lesson').
   * @returns {string} - Tailwind CSS class for background color.
   */
  const getItemTypeColor = useCallback((type) => {
    switch (type) {
      case 'info':
        return 'bg-gray-100';
      case 'lesson':
        return 'bg-blue-100';
      case 'assignment':
        return 'bg-green-100';
      case 'exam':
        return 'bg-yellow-100';
      default:
        return '';
    }
  }, []);

  /**
   * Adds a new assessment item to a unit.
   * @param {number} unitIndex - Index of the unit to add the assessment to.
   * @param {number|null} insertIndex - Optional index to insert the assessment at.
   */
  const addAssessment = useCallback((unitIndex, insertIndex = null) => {
    const newUnits = [...safeUnits];
    const newItem = {
      title: 'New Assessment',
      type: 'lesson',
      multiplier: 1,
      hasMarking: false,
      notes: '',
      gradebookIndex: newUnits[unitIndex].items ? newUnits[unitIndex].items.length : 0,
      // Initialize gradebookIndex based on current items length
      sequence: (newUnits[unitIndex].items?.length || 0) + 1,
    };
    
    if (insertIndex === null) {
      // Add to the end of the unit
      newUnits[unitIndex].items = [...(newUnits[unitIndex].items || []), newItem];
    } else {
      // Insert at the specified index
      newUnits[unitIndex].items = [
        ...(newUnits[unitIndex].items || []).slice(0, insertIndex),
        newItem,
        ...(newUnits[unitIndex].items || []).slice(insertIndex)
      ];
      // Update gradebookIndex for all items
      newUnits[unitIndex].items.forEach((item, index) => {
        item.gradebookIndex = index;
        item.sequence = index + 1;
      });
    }
    
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

  /**
   * Removes an assessment item from a unit.
   * @param {number} unitIndex - Index of the unit containing the item.
   * @param {number} itemIndex - Index of the item to remove.
   */
  const removeAssessment = useCallback((unitIndex, itemIndex) => {
    const newUnits = [...safeUnits];
    newUnits[unitIndex].items = [
      ...newUnits[unitIndex].items.slice(0, itemIndex),
      ...newUnits[unitIndex].items.slice(itemIndex + 1)
    ];
    // Update gradebookIndex and sequence
    newUnits[unitIndex].items.forEach((item, index) => {
      item.gradebookIndex = index;
      item.sequence = index + 1;
    });
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

  /**
   * Adds a new unit to the course.
   */
  const addUnit = useCallback(() => {
    const newUnits = [...safeUnits];
    const newUnit = {
      name: 'New Unit',
      sequence: newUnits.length + 1,
      section: '',
      items: []
    };
    newUnits.push(newUnit);
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

  /**
   * Removes a unit from the course.
   * @param {number} unitIndex - Index of the unit to remove.
   */
  const removeUnit = useCallback((unitIndex) => {
    const newUnits = safeUnits.filter((_, index) => index !== unitIndex);
    // Update sequences for remaining units
    newUnits.forEach((unit, index) => {
      unit.sequence = index + 1;
    });
    onUnitsChange(newUnits);
    setDeleteConfirmation({ show: false, unitIndex: null });
  }, [safeUnits, onUnitsChange]);

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  /**
   * Synchronizes the ReactQuill editor content with the unit items.
   */
  useEffect(() => {
    safeUnits.forEach((unit, unitIndex) => {
      unit.items?.forEach((item, itemIndex) => {
        const quill = quillRefs.current[`${unitIndex}-${itemIndex}`];
        if (quill && quill.getEditor()) {
          const currentContent = quill.getEditor().root.innerHTML;
          if (item.notes && item.notes !== currentContent) {
            quill.getEditor().root.innerHTML = item.notes;
          }
        }
      });
    });
  }, [safeUnits]);

  // Render a message if no units are available
  if (!Array.isArray(units)) {
    return (
      <div>
        No units available.
        {isEditing && (
          <button
            onClick={addUnit}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <FaPlus className="inline mr-1" /> Add First Unit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Course Units</h3>
      {safeUnits.map((unit, unitIndex) => (
        <div key={unitIndex} className="border p-4 rounded">
          {/* Unit Header */}
          <div className="mb-4 bg-gray-100 p-2 rounded flex items-center space-x-2">
            <span className="font-bold text-lg">{unit.sequence}.</span>
            {isEditing ? (
              <input
                type="text"
                value={unit.name}
                onChange={(e) => handleUnitChange(unitIndex, 'name', e.target.value)}
                className="flex-grow p-1 border rounded"
              />
            ) : (
              <span className="font-bold text-lg">{unit.name}</span>
            )}
            {isEditing && (
              <>
                <div className="flex items-center">
                  <label className="mr-2">Section:</label>
                  <input
                    type="text"
                    value={unit.section || ''}
                    onChange={(e) => handleUnitChange(unitIndex, 'section', e.target.value)}
                    className="w-24 border rounded p-1"
                    placeholder="Section"
                  />
                </div>
                <button
                  onClick={() => setDeleteConfirmation({ show: true, unitIndex })}
                  className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
          
          {/* Assessments List */}
          <div className="space-y-1">
            {isEditing && (
              <button
                onClick={() => addAssessment(unitIndex, 0)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-1 flex items-center justify-center"
              >
                <FaPlus className="mr-1" size={10} /> Add Assessment
              </button>
            )}
            {unit.items?.map((item, itemIndex) => (
              <React.Fragment key={itemIndex}>
                <div className={`rounded ${getItemTypeColor(item.type)}`}>
                  {/* Assessment Header */}
                  <div className="flex items-center space-x-2 p-2">
                    {/* Display (gradebookIndex + 1) instead of sequence */}
                    <span className="w-8">{(item.gradebookIndex ?? 0) + 1}.</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(
                            unitIndex,
                            itemIndex,
                            'title',
                            e.target.value
                          )
                        }
                        className="flex-grow p-1 border rounded"
                      />
                    ) : (
                      <span className="flex-grow">{item.title}</span>
                    )}
                    {isEditing && (
                      <>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            handleItemChange(
                              unitIndex,
                              itemIndex,
                              'type',
                              e.target.value
                            )
                          }
                          className="border rounded p-1"
                        >
                          <option value="info">Info</option>
                          <option value="lesson">Lesson</option>
                          <option value="assignment">Assignment</option>
                          <option value="exam">Exam</option>
                        </select>
                        <div className="flex items-center">
                          <label className="mr-2">Multiplier:</label>
                          <input
                            type="number"
                            value={item.multiplier}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsedValue = parseFloat(value);
                              // Prevent NaN by setting a default value of 1 if parsing fails
                              handleItemChange(
                                unitIndex,
                                itemIndex,
                                'multiplier',
                                isNaN(parsedValue) ? 1 : parsedValue
                              );
                            }}
                            className="w-16 border rounded p-1"
                            step="0.1"
                            min="0"
                          />
                          <button
                            onClick={() => setShowMultiplierInfo(!showMultiplierInfo)}
                            className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            <FaInfoCircle />
                          </button>
                        </div>
                      </>
                    )}
                    {(item.type === 'assignment' || item.type === 'exam') && (
                      <div className="flex items-center ml-2">
                        <input
                          type="checkbox"
                          id={`hasMarking-${unitIndex}-${itemIndex}`}
                          checked={item.hasMarking || false}
                          onChange={(e) =>
                            handleItemChange(
                              unitIndex,
                              itemIndex,
                              'hasMarking',
                              e.target.checked
                            )
                          }
                          disabled={!isEditing}
                          className="mr-2"
                        />
                        <label htmlFor={`hasMarking-${unitIndex}-${itemIndex}`}>
                          Manual Marking
                        </label>
                      </div>
                    )}
                    <button
                      onClick={() => toggleItemExpansion(unitIndex, itemIndex)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {expandedItems[`${unitIndex}-${itemIndex}`] ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => removeAssessment(unitIndex, itemIndex)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  {/* Assessment Details (ReactQuill Editor) */}
                  {expandedItems[`${unitIndex}-${itemIndex}`] && (
                    <div className="p-2 bg-white border-t">
                      <ReactQuill
                        ref={(el) => {
                          quillRefs.current[`${unitIndex}-${itemIndex}`] = el;
                        }}
                        defaultValue={item.notes || ''}
                        onChange={() => handleQuillChange(unitIndex, itemIndex)}
                        modules={modules}
                        readOnly={!isEditing}
                        className="bg-white"
                        placeholder="Add notes for this assessment..."
                      />
                    </div>
                  )}
                </div>
                
                {/* Button to Add Assessment Below the Current Assessment */}
                {isEditing && (
                  <button
                    onClick={() => addAssessment(unitIndex, itemIndex + 1)}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm py-1 flex items-center justify-center"
                  >
                    <FaPlus className="mr-1" size={10} /> Add Assessment Below
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      
      {/* Button to Add New Unit */}
      {isEditing && (
        <button
          onClick={addUnit}
          className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition duration-300 flex items-center justify-center"
        >
          <FaPlus className="inline mr-2" /> Add New Unit
        </button>
      )}
      
      {/* Multiplier Information Modal */}
      {showMultiplierInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md">
            <h4 className="font-bold mb-2">Multiplier Information</h4>
            <p>
              The multiplier value allocates more time for an assessment in the schedule creator.
              A higher multiplier will result in more time being allocated for this item when
              generating the course schedule.
            </p>
            <button
              onClick={() => setShowMultiplierInfo(false)}
              className="mt-4 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md">
            <h4 className="font-bold mb-2">Confirm Deletion</h4>
            <p>
              Are you sure you want to delete this unit? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmation({ show: false, unitIndex: null })}
                className="bg-gray-300 text-gray-800 rounded px-4 py-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => removeUnit(deleteConfirmation.unitIndex)}
                className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseUnitsEditor;
