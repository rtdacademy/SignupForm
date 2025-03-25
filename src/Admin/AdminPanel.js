// src/Admin/AdminPanel.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBook, FaUsers, FaChartBar } from 'react-icons/fa';

function AdminPanel() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  if (!user || !isStaff(user)) {
    navigate('/login');
    return null;
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="p-4 bg-gray-50">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h1>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => handleNavigate('/courses')}
            className="flex items-center w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 text-sm"
          >
            <FaBook className="mr-2" /> Manage Courses
          </button>
        </li>
        {/* Add more navigation buttons as needed */}
        {/* Example: */}
        <li>
          <button
            onClick={() => handleNavigate('/students')}
            className="flex items-center w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 text-sm"
          >
            <FaUsers className="mr-2" /> Manage Students
          </button>
        </li>
        <li>
          <button
            onClick={() => handleNavigate('/reports')}
            className="flex items-center w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-200 text-sm"
          >
            <FaChartBar className="mr-2" /> View Reports
          </button>
        </li>
      </ul>
    </div>
  );
}

export default AdminPanel;
