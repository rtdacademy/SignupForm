// src/tutorials/content/student-messaging.js
import React from 'react';
import { MessageSquare, Mail, Users, Send, Save } from 'lucide-react';

export default {
  title: 'Student Messaging System',
  content: (
    <div className="tutorial-content">
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Overview</h3>
        <p className="text-gray-700 leading-relaxed">
          The student messaging system allows you to send personalized emails to individual students or groups. 
          You can use templates, add custom content, include personalization fields, and manage CC recipients 
          efficiently.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Recipients Panel</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 mt-1 text-blue-500" />
            <div>
              <p className="font-medium">Selected Recipients</p>
              <p className="text-sm">The recipients panel shows all selected students with their details:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                <li>Student name appears on each recipient chip</li>
                <li>Mail icon indicates when parent/guardian emails are available</li>
                <li>Hover over a recipient to see all associated email addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Messaging Options</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start gap-2">
            <Mail className="h-5 w-5 mt-1 text-blue-500" />
            <div>
              <p className="font-medium">Email Configuration</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                <li>Use "Add Template" to select from saved message templates</li>
                <li>"CC Options" allows you to include parents, guardians, or staff in your message</li>
                <li>"Send as Do Not Reply" option prevents recipient replies</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Personalization Fields</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
          <p className="font-medium">Available Fields:</p>
          <ul className="grid grid-cols-2 gap-2">
            <li>[firstName] - Student's preferred name</li>
            <li>[lastName] - Student's last name</li>
            <li>[courseName] - Course title</li>
            <li>[startDate] - Schedule start date</li>
            <li>[endDate] - Schedule end date</li>
            <li>[status] - Current status</li>
            <li>[studentType] - Type of student</li>
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Email Signature</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>Your email signature can be:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Edited and saved for future use</li>
            <li>Automatically appended to all messages</li>
            <li>Formatted using the rich text editor</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">Best Practices</h3>
        <div className="space-y-3 text-gray-700 text-sm">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-1 text-blue-500" />
            <p>Always preview your message before sending to ensure personalization fields are working correctly.</p>
          </div>
          <div className="flex items-start gap-2">
            <Save className="h-4 w-4 mt-1 text-blue-500" />
            <p>Save frequently used messages as templates to maintain consistency and save time.</p>
          </div>
          <div className="flex items-start gap-2">
            <Send className="h-4 w-4 mt-1 text-blue-500" />
            <p>Double-check CC recipients, especially when sending sensitive information.</p>
          </div>
        </div>
      </section>
    </div>
  )
};