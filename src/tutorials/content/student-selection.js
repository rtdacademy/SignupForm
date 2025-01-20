// src/tutorials/content/student-selection.js
import React from 'react';
import { CheckSquare, Users, Mail, Filter } from 'lucide-react';

export default {
  title: 'Student Selection & Mass Email',
  content: (
    <div className="tutorial-content">
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Multi-Student Selection
        </h3>
        <p className="text-gray-700 leading-relaxed">
          The checkbox system allows you to select multiple students for batch actions. 
          When you select one or more students, you'll automatically be able to send 
          mass emails to your selected group.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Mass Email Features
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>When multiple students are selected:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Send a single email to all selected students</li>
            <li>Use templates to maintain consistent messaging</li>
            <li>Add personalization fields that adapt to each recipient</li>
            <li>Manage CC options for parents and guardians</li>
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Strategic Selection
        </h3>
        <div className="text-gray-700">
          <p className="mb-2">Combine with filters to select students by:</p>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Course</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Custom Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Student Type</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pro Tips
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Use "Select All" to quickly select everyone in your current view</li>
          <li>Apply filters first, then use "Select All" for targeted group selection</li>
          <li>Preview your email to see how personalization fields will appear</li>
          <li>Save frequently used messages as templates for future use</li>
        </ul>
      </section>
    </div>
  )
};