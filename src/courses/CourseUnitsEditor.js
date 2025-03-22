import React, { useState, useCallback, useEffect } from 'react';
import { FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import IMathASSetup from './IMathASSetup';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../firebase';
import PermissionIndicator from '../context/PermissionIndicator';
import { useAuth } from '../context/AuthContext';

const CourseUnitsEditor = ({ courseId, units, onUnitsChange, isEditing }) => {
  const { hasSuperAdminAccess } = useAuth();
  const [showMultiplierInfo, setShowMultiplierInfo] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, unitIndex: null });
  const [deleteLessonConfirmation, setDeleteLessonConfirmation] = useState({ show: false, unitIndex: null, itemIndex: null });
  const [hasEnrolledStudents, setHasEnrolledStudents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  

  const safeUnits = Array.isArray(units) ? units : [];

  // Check for enrolled students
  useEffect(() => {
    const checkEnrolledStudents = async () => {
      try {
        const summariesRef = ref(database, 'studentCourseSummaries');
        const courseQuery = query(
          summariesRef,
          orderByChild('CourseID'),
          equalTo(courseId)
        );
        
        const snapshot = await get(courseQuery);
        setHasEnrolledStudents(snapshot.exists());
      } catch (error) {
        console.error('Error checking enrolled students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      checkEnrolledStudents();
    }
  }, [courseId]);

  const handleUnitChange = useCallback((unitIndex, field, value) => {
    const newUnits = [...safeUnits];
    newUnits[unitIndex] = {
      ...newUnits[unitIndex],
      [field]: value,
    };
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange]);

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

  const addAssessment = useCallback((unitIndex, insertIndex = null) => {
    if (hasEnrolledStudents) {
      alert("Cannot add assessments while students are enrolled in the course.");
      return;
    }

    const newUnits = [...safeUnits];
    const newItem = {
      title: 'New Assessment',
      type: 'lesson',
      multiplier: 1,
      hasMarking: false,
      gradebookIndex: newUnits[unitIndex].items ? newUnits[unitIndex].items.length : 0,
      sequence: (newUnits[unitIndex].items?.length || 0) + 1,
    };

    if (insertIndex === null) {
      newUnits[unitIndex].items = [...(newUnits[unitIndex].items || []), newItem];
    } else {
      newUnits[unitIndex].items = [
        ...(newUnits[unitIndex].items || []).slice(0, insertIndex),
        newItem,
        ...(newUnits[unitIndex].items || []).slice(insertIndex)
      ];
      newUnits[unitIndex].items.forEach((item, index) => {
        item.gradebookIndex = index;
        item.sequence = index + 1;
      });
    }

    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange, hasEnrolledStudents]);

  const removeAssessment = useCallback((unitIndex, itemIndex) => {
    if (hasEnrolledStudents) {
      alert("Cannot remove assessments while students are enrolled in the course.");
      return;
    }

    const newUnits = [...safeUnits];
    newUnits[unitIndex].items = [
      ...newUnits[unitIndex].items.slice(0, itemIndex),
      ...newUnits[unitIndex].items.slice(itemIndex + 1)
    ];
    newUnits[unitIndex].items.forEach((item, index) => {
      item.gradebookIndex = index;
      item.sequence = index + 1;
    });
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange, hasEnrolledStudents]);

  const addUnit = useCallback(() => {
    if (!hasSuperAdminAccess()) {
      alert("Super Admin access required to add units");
      return;
    }
    
    if (hasEnrolledStudents) {
      alert("Cannot add units while students are enrolled in the course.");
      return;
    }

    const newUnits = [...safeUnits];
    const newUnit = {
      name: 'New Unit',
      sequence: newUnits.length + 1,
      section: '',
      items: []
    };
    newUnits.push(newUnit);
    onUnitsChange(newUnits);
  }, [safeUnits, onUnitsChange, hasEnrolledStudents, hasSuperAdminAccess]);

  const removeUnit = useCallback((unitIndex) => {
    if (hasEnrolledStudents) {
      alert("Cannot remove units while students are enrolled in the course.");
      return;
    }

    const newUnits = safeUnits.filter((_, index) => index !== unitIndex);
    newUnits.forEach((unit, index) => {
      unit.sequence = index + 1;
    });
    onUnitsChange(newUnits);
    setDeleteConfirmation({ show: false, unitIndex: null });
  }, [safeUnits, onUnitsChange, hasEnrolledStudents]);

  if (isLoading) {
    return <div>Loading course information...</div>;
  }

  if (!Array.isArray(units)) {
    return (
      <div>
        No units available.
        {isEditing && !hasEnrolledStudents && (
          <Button onClick={addUnit} className="mt-2">
            <FaPlus className="mr-2" /> Add First Unit
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasEnrolledStudents && isEditing && (
        <Alert className="mb-4">
          <AlertDescription>
            This course has enrolled students. You can edit existing items but cannot add, remove, or reorder units and assessments.
          </AlertDescription>
        </Alert>
      )}
      
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
                {!hasEnrolledStudents && (
                  <button
                    onClick={() => setDeleteConfirmation({ show: true, unitIndex })}
                    className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Assessments List */}
          <div className="space-y-1">
            {isEditing && !hasEnrolledStudents && (
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
                  <div className="p-2">
                    {/* Assessment Header */}
                    <div className="flex items-center space-x-2">
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
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <label className="mr-2">Multiplier:</label>
                              <input
                                type="number"
                                value={item.multiplier}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const parsedValue = parseFloat(value);
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
                            {item.type !== 'info' && (
                              <div className="flex items-center">
                                <label className="mr-2">Weight:</label>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {item.weight ? `${(item.weight * 100).toFixed(1)}%` : '0%'}
                                </span>
                              </div>
                            )}
                            {!hasEnrolledStudents && (
                              <button
                                onClick={() =>
                                  setDeleteLessonConfirmation({ show: true, unitIndex, itemIndex })
                                }
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                      {!isEditing && item.type !== 'info' && item.weight && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          Weight: {(item.weight * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Always Open IMathAS Setup */}
                    <IMathASSetup
                      item={item}
                      courseId={courseId}
                      unitIndex={unitIndex}
                      itemIndex={itemIndex}
                      onItemChange={handleItemChange}
                      isEditing={isEditing}
                    />
                  </div>
                </div>

                {/* Button to Add Assessment Below */}
                {isEditing && !hasEnrolledStudents && (
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

      {/* Add New Unit Button */}
      {isEditing && !hasEnrolledStudents && (
        <Button
          onClick={addUnit}
          className="w-full"
          variant="outline"
        >
          <FaPlus className="mr-2" /> Add New Unit
        </Button>
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
            <Button
              onClick={() => setShowMultiplierInfo(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

 {/* Unit Delete Confirmation Modal */}
      {deleteConfirmation.show && !hasEnrolledStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md">
            <h4 className="font-bold mb-2">Confirm Deletion</h4>
            <p>
              Are you sure you want to delete this unit? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({ show: false, unitIndex: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeUnit(deleteConfirmation.unitIndex)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Delete Confirmation Modal */}
      {deleteLessonConfirmation.show && !hasEnrolledStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md">
            <h4 className="font-bold mb-2">Confirm Deletion</h4>
            <p>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteLessonConfirmation({ show: false, unitIndex: null, itemIndex: null })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  removeAssessment(deleteLessonConfirmation.unitIndex, deleteLessonConfirmation.itemIndex);
                  setDeleteLessonConfirmation({ show: false, unitIndex: null, itemIndex: null });
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseUnitsEditor;