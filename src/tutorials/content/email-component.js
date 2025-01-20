import React from 'react';

export default {
  title: 'Mass Email System',
  content: (
    <div className="tutorial-content">
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p className="text-gray-700">
          The mass email system allows you to efficiently communicate with multiple students
          or guardians simultaneously. This powerful tool supports template-based messaging
          and customizable content for different recipient groups.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Key Features</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Template Management</li>
          <li>Recipient Group Selection</li>
          <li>Custom Variable Support</li>
          <li>Email Preview</li>
          <li>Scheduling Options</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Common Use Cases</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Assignment reminders to specific course groups</li>
          <li>Parent-teacher meeting notifications</li>
          <li>Course updates and announcements</li>
          <li>Progress report distribution</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Step-by-Step Guide</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Select recipient group(s) from the dropdown menu</li>
          <li>Choose a template or create a new message</li>
          <li>Customize content using available variables</li>
          <li>Preview the email for different recipients</li>
          <li>Schedule or send immediately</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Always preview emails before sending</li>
          <li>Use appropriate templates for different communication types</li>
          <li>Verify recipient groups before sending mass emails</li>
          <li>Consider timing when scheduling emails</li>
        </ul>
      </section>
    </div>
  )
};