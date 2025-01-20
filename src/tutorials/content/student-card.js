// src/tutorials/content/student-card.js
import React from 'react';
import { 
  CheckCircle, Zap, MessageSquare, History, UserCheck, Circle,
  BookOpen, Users, Plus, AlertCircle 
} from 'lucide-react';
import categoriesButtonImg from '../pics/CategoriesButtonLocation.png';

export default {
  title: 'Student Card & Status Management',
  content: (
    <div className="tutorial-content">
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Card Overview</h3>
        <p className="text-gray-700 leading-relaxed">
          Each student card provides quick access to essential information and actions. 
          The card shows student details, course information, current status, and tools 
          for student management.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Status Management</h3>
        <p className="text-gray-700 mb-3">
          The status system is crucial for tracking student progress and automating communications.
          Statuses are organized into categories:
        </p>
        
        {/* Administrative Statuses */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Administrative</h4>
          <div className="grid gap-2">
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
              <span className="text-sm">Newly Enrolled - Initial status for new students</span>
            </div>
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#14B8A6" }} />
              <span className="text-sm">Starting on (Date) - Future start date set</span>
            </div>
          </div>
        </div>

        {/* Progress Statuses */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Progress</h4>
          <div className="grid gap-2">
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#10B981" }} />
              <span className="text-sm">On Track - Student is progressing as scheduled</span>
            </div>
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#059669" }} />
              <span className="text-sm">Rocking it! - Exceeding expectations</span>
            </div>
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#EF4444" }} />
              <span className="text-sm">Behind - Falling behind schedule</span>
            </div>
          </div>
        </div>

        {/* Schedule-related Statuses */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Schedule-related</h4>
          <div className="grid gap-2">
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#6366F1" }} />
              <span className="text-sm">Updated Schedule - Recent schedule changes</span>
            </div>
            <div className="flex items-center p-2 bg-white rounded-lg border">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F59E0B" }} />
              <span className="text-sm">No Orientation Yet - Needs to complete orientation</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <span className="font-medium">Automation Note:</span> Status changes can trigger automated 
              actions and communications with students and parents. Keeping statuses up-to-date ensures 
              proper system automation.
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Auto Status
        </h3>
        <div className="text-gray-700 space-y-2">
          <p>
            The Auto Status toggle enables automatic status updates based on student activity 
            and progress. When enabled, the system will automatically adjust the student's 
            status according to pre-defined rules.
          </p>
          <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>This feature is coming soon and will enhance automated student tracking.</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Categories
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>
            Categories help organize students for efficient filtering and batch actions. 
            Add custom categories to track specific groups or situations.
          </p>
          <div className="bg-white p-3 border rounded-lg">
  <img 
    src={categoriesButtonImg} 
    alt="Categories Button Location" 
    className="w-full rounded-lg shadow-sm"
  />
  <p className="text-sm text-gray-500 mt-2">
    Access category management from the button shown above
  </p>
</div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">Card Actions</h3>
        <div className="grid gap-3">
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <MessageSquare className="h-4 w-4 mt-1" />
            <div>
              <span className="font-medium">Chat</span>
              <p className="text-sm text-gray-600">Direct messaging with students (Coming soon)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <History className="h-4 w-4 mt-1" />
            <div>
              <span className="font-medium">Status History</span>
              <p className="text-sm text-gray-600">View complete status change timeline</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <UserCheck className="h-4 w-4 mt-1" />
            <div>
              <span className="font-medium">Emulate</span>
              <p className="text-sm text-gray-600">View the system as this student for testing and support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
};