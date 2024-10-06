import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

const CourseUnitsEditor = ({ units, onUnitsChange, isEditing }) => {
  const handleUnitSequenceChange = (unitIndex, newSequence) => {
    let newUnits = [...units];
    const [movedUnit] = newUnits.splice(unitIndex, 1);
    newUnits.splice(newSequence - 1, 0, movedUnit);
    newUnits = newUnits.map((unit, idx) => ({ ...unit, sequence: idx + 1 }));
    onUnitsChange(newUnits);
  };

  const handleItemSequenceChange = (unitIndex, itemIndex, newSequence) => {
    let newUnits = [...units];
    let items = [...newUnits[unitIndex].items];
    const [movedItem] = items.splice(itemIndex, 1);
    items.splice(newSequence - 1, 0, movedItem);
    items = items.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    newUnits[unitIndex].items = items;
    onUnitsChange(newUnits);
  };

  const handleUnitChange = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    onUnitsChange(newUnits);
  };

  const handleItemChange = (unitIndex, itemIndex, field, value) => {
    const newUnits = [...units];
    newUnits[unitIndex].items[itemIndex][field] = value;
    onUnitsChange(newUnits);
  };

  const addUnit = (e) => {
    e.preventDefault();
    const newUnit = {
      name: `Unit ${units.length + 1}`,
      sequence: units.length + 1,
      items: []
    };
    onUnitsChange([...units, newUnit]);
  };

  const deleteUnit = (e, index) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
      let newUnits = units.filter((_, i) => i !== index);
      newUnits = newUnits.map((unit, idx) => ({ ...unit, sequence: idx + 1 }));
      onUnitsChange(newUnits);
    }
  };

  const addItem = (e, unitIndex) => {
    e.preventDefault();
    const newUnits = [...units];
    const newItem = {
      title: "New Item",
      type: "lesson",
      sequence: newUnits[unitIndex].items.length + 1,
      multiplier: 1
    };
    newUnits[unitIndex].items.push(newItem);
    onUnitsChange(newUnits);
  };

  const deleteItem = (e, unitIndex, itemIndex) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      const newUnits = [...units];
      newUnits[unitIndex].items = newUnits[unitIndex].items.filter((_, i) => i !== itemIndex);
      newUnits[unitIndex].items = newUnits[unitIndex].items.map((item, idx) => ({
        ...item,
        sequence: idx + 1
      }));
      onUnitsChange(newUnits);
    }
  };

  const getItemTypeColor = (type) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-100';
      case 'assignment':
        return 'bg-green-100';
      case 'exam':
        return 'bg-yellow-100';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Course Units</h3>
      {units.sort((a, b) => a.sequence - b.sequence).map((unit, unitIndex) => (
        <div key={unitIndex} className="border p-4 rounded">
          <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded">
            <div className="flex items-center flex-grow">
              {isEditing && (
                <select
                  value={unit.sequence}
                  onChange={(e) =>
                    handleUnitSequenceChange(unitIndex, parseInt(e.target.value))
                  }
                  className="mr-2 border rounded p-1"
                >
                  {Array.from({ length: units.length }, (_, i) => i + 1).map(
                    (seqNum) => (
                      <option key={seqNum} value={seqNum}>
                        {seqNum}
                      </option>
                    )
                  )}
                </select>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={unit.name}
                  onChange={(e) =>
                    handleUnitChange(unitIndex, 'name', e.target.value)
                  }
                  className="font-bold w-full p-1 border rounded"
                />
              ) : (
                <span className="font-bold text-lg">
                  {unit.sequence}. {unit.name}
                </span>
              )}
            </div>
            {isEditing && (
              <button
                onClick={(e) => deleteUnit(e, unitIndex)}
                className="text-red-500 ml-2"
              >
                <FaTrash />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {unit.items
              .sort((a, b) => a.sequence - b.sequence)
              .map((item, itemIndex) => (
                <div key={itemIndex} className={`flex items-center space-x-2 p-2 rounded ${getItemTypeColor(item.type)}`}>
                  {isEditing ? (
                    <>
                      <select
                        value={item.sequence}
                        onChange={(e) =>
                          handleItemSequenceChange(
                            unitIndex,
                            itemIndex,
                            parseInt(e.target.value)
                          )
                        }
                        className="border rounded p-1"
                      >
                        {Array.from(
                          { length: unit.items.length },
                          (_, i) => i + 1
                        ).map((seqNum) => (
                          <option key={seqNum} value={seqNum}>
                            {seqNum}
                          </option>
                        ))}
                      </select>
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
                        <option value="lesson">Lesson</option>
                        <option value="assignment">Assignment</option>
                        <option value="exam">Exam</option>
                      </select>
                      <input
                        type="number"
                        value={item.multiplier}
                        onChange={(e) =>
                          handleItemChange(
                            unitIndex,
                            itemIndex,
                            'multiplier',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-16 border rounded p-1"
                        step="0.1"
                      />
                      <button
                        onClick={(e) => deleteItem(e, unitIndex, itemIndex)}
                        className="text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <span>
                      {item.sequence}. {item.title} ({item.type}, multiplier:{' '}
                      {item.multiplier})
                    </span>
                  )}
                </div>
              ))}
            {isEditing && (
              <button
                onClick={(e) => addItem(e, unitIndex)}
                className="mt-2 flex items-center text-green-500"
              >
                <FaPlus className="mr-1" /> Add Item
              </button>
            )}
          </div>
        </div>
      ))}
      {isEditing && (
        <button onClick={addUnit} className="mt-4 flex items-center text-blue-500">
          <FaPlus className="mr-1" /> Add Unit
        </button>
      )}
    </div>
  );
};

export default CourseUnitsEditor;