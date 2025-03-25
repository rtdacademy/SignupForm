// src/tutorials/content/template-manager.js
import React from 'react';
import { FilePenLine, Grid2X2, ListFilter, Archive, PlusCircle, Eye, Pencil } from 'lucide-react';

export default {
  title: 'Message Template Manager',
  content: (
    <div className="tutorial-content">
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Overview</h3>
        <p className="text-gray-700 leading-relaxed">
          The Template Manager helps you create, organize, and manage reusable message templates. 
          Templates can be categorized by type, customized with colors and fields, and easily accessed 
          when sending messages to students.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Creating Templates</h3>
        <div className="space-y-3 text-gray-700">
          <p>To create a new template:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click "Create New" in the tab menu</li>
            <li>Enter a template name and optional subject</li>
            <li>Select a template type for organization</li>
            <li>Choose a color for visual identification</li>
            <li>Compose your message using the rich text editor</li>
            <li>Add personalization fields using the "Insert Field" button</li>
          </ol>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Template Types</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Grid2X2 className="h-5 w-5 mt-1 text-blue-500" />
            <div>
              <p className="font-medium">Organizing by Type</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
                <li>Create custom template types for different message categories</li>
                <li>Assign icons and colors to types for easy recognition</li>
                <li>Group templates by type for better organization</li>
                <li>Switch between type and name views using the organization buttons</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Managing Templates</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2">Available Actions:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>Preview template content</span>
            </div>
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-blue-500" />
              <span>Edit template details</span>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-blue-500" />
              <span>Archive unused templates</span>
            </div>
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-blue-500" />
              <span>Add new template types</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-primary">Personalization Fields</h3>
        <div className="text-gray-700">
          <p className="mb-2">Available fields that automatically populate with student data:</p>
          <ul className="grid grid-cols-2 gap-2 text-sm bg-white p-3 rounded border">
            <li>[firstName] - Preferred name</li>
            <li>[lastName] - Last name</li>
            <li>[courseName] - Course title</li>
            <li>[startDate] - Schedule start</li>
            <li>[endDate] - Schedule end</li>
            <li>[status] - Current status</li>
            <li>[studentType] - Student type</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">Best Practices</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>Create clear template names that indicate their purpose</li>
            <li>Use consistent types to maintain organized template library</li>
            <li>Preview templates before saving to verify formatting</li>
            <li>Archive outdated templates instead of deleting them</li>
            <li>Use personalization fields to create more engaging messages</li>
          </ul>
        </div>
      </section>
    </div>
  )
};