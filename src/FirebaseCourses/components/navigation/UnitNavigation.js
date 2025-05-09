import React from 'react';
import { FaCheckCircle, FaCircle, FaCaretRight, FaLock } from 'react-icons/fa';
import { Button } from '../../../components/ui/button';
import { useProgress } from '../../context/CourseProgressContext';

/**
 * Course unit navigation component
 * 
 * @param {Object} props
 * @param {Array} props.units - Course units array
 * @param {String} props.activeItemId - Currently active item ID
 * @param {Function} props.onItemSelect - Callback when an item is selected
 * @param {Boolean} props.sequential - Whether units must be completed sequentially
 */
const UnitNavigation = ({ 
  units = [], 
  activeItemId, 
  onItemSelect,
  sequential = false 
}) => {
  const { progress } = useProgress();
  
  const isUnitAccessible = (unitIndex) => {
    if (!sequential || unitIndex === 0) return true;
    
    // For sequential access, check if previous unit is completed
    const previousUnit = units[unitIndex - 1];
    if (!previousUnit) return true;
    
    // Check if all items in previous unit are completed
    return previousUnit.items.every(item => progress[item.itemId]?.completed);
  };
  
  const isItemAccessible = (unitIndex, itemIndex) => {
    // First check if the unit is accessible
    if (!isUnitAccessible(unitIndex)) return false;
    
    // If sequential within units, check if previous items are completed
    if (sequential && itemIndex > 0) {
      const previousItems = units[unitIndex].items.slice(0, itemIndex);
      return previousItems.every(item => progress[item.itemId]?.completed);
    }
    
    return true;
  };
  
  const getItemStatus = (itemId) => {
    if (!progress[itemId]) return 'not-started';
    if (progress[itemId].completed) return 'completed';
    return 'in-progress';
  };
  
  return (
    <div className="space-y-4">
      {units.map((unit, unitIndex) => {
        const isUnitCompleted = unit.items.every(
          item => progress[item.itemId]?.completed
        );
        const unitAccessible = isUnitAccessible(unitIndex);
        
        return (
          <div key={unit.unitId} className="border rounded-lg overflow-hidden">
            <div className={`p-3 flex items-center justify-between ${
              isUnitCompleted 
                ? 'bg-green-50 border-b border-green-100' 
                : unitAccessible
                ? 'bg-gray-50 border-b border-gray-100'
                : 'bg-gray-100 border-b border-gray-200'
            }`}>
              <h3 className={`font-medium flex items-center ${
                unitAccessible ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {isUnitCompleted ? (
                  <FaCheckCircle className="text-green-500 mr-2" />
                ) : !unitAccessible ? (
                  <FaLock className="text-gray-400 mr-2" />
                ) : (
                  <FaCircle className="text-blue-400 mr-2" />
                )}
                {unit.name}
              </h3>
              <div className="text-sm text-gray-500">
                {unit.items.length} {unit.items.length === 1 ? 'item' : 'items'}
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {unit.items.map((item, itemIndex) => {
                const status = getItemStatus(item.itemId);
                const isActive = activeItemId === item.itemId;
                const isAccessible = isItemAccessible(unitIndex, itemIndex);
                
                return (
                  <Button
                    key={item.itemId}
                    variant="ghost"
                    className={`w-full justify-start py-3 px-4 rounded-none text-left ${
                      !isAccessible 
                        ? 'opacity-60 cursor-not-allowed' 
                        : status === 'completed'
                        ? 'text-green-700 hover:text-green-800 hover:bg-green-50' 
                        : ''
                    } ${
                      isActive ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => isAccessible && onItemSelect(item.itemId, item.type)}
                    disabled={!isAccessible}
                  >
                    <div className="flex items-center">
                      {status === 'completed' ? (
                        <FaCheckCircle className="text-green-500 mr-3" />
                      ) : !isAccessible ? (
                        <FaLock className="text-gray-400 mr-3" />
                      ) : isActive ? (
                        <FaCaretRight className="text-blue-500 mr-3" />
                      ) : (
                        <div className="w-4 h-4 mr-3" />
                      )}
                      
                      <div>
                        <span className="block font-medium">{item.title}</span>
                        <span className="block text-xs mt-0.5 text-gray-500 capitalize">
                          {item.type}
                          {item.weight ? ` • ${item.weight * 100}%` : ''}
                        </span>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UnitNavigation;