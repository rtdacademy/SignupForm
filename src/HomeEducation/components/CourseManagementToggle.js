import React from 'react';
import { GraduationCap, Users } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

/**
 * Toggle button to switch between standard view and course registration management mode
 * @param {boolean} isActive - Whether course management mode is active
 * @param {function} onToggle - Callback when toggle is clicked
 * @param {number} pendingCount - Optional count of students with pending course actions
 */
const CourseManagementToggle = ({ isActive, onToggle, pendingCount = 0 }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${isActive
            ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        {isActive ? (
          <>
            <GraduationCap className="w-4 h-4" />
            <span>Course Registration Mode</span>
          </>
        ) : (
          <>
            <Users className="w-4 h-4" />
            <span>Standard View</span>
          </>
        )}
      </button>

      {isActive && pendingCount > 0 && (
        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
          {pendingCount} pending {pendingCount === 1 ? 'action' : 'actions'}
        </Badge>
      )}
    </div>
  );
};

export default CourseManagementToggle;
