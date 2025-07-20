import React from 'react';
import { Card } from "../../components/ui/card";
import { Smartphone, Shield, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

const MobileDevicePolicy = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          RTD Math Academy – Personal Mobile-Device (PMD) & Cell-Phone Policy
        </h2>
        <p className="text-sm text-gray-600">
          Compliant with Alberta Ministerial Order 014/2024 – "Standards for the Use of Personal Mobile Devices and Social Media in Schools"
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">1. Purpose</h3>
        <p className="text-gray-700">
          To provide a safe, focused, and equitable digital learning environment by limiting personal mobile-device 
          distractions during instructional activities while still permitting legitimate educational, accessibility, 
          or medical uses—plus a controlled use case for exam proctoring.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">2. Scope</h3>
        <p className="text-gray-700 mb-2">
          Applies to every RTD Math Academy student (Grades 10-12), staff member, and guest whenever they participate in:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>live video/voice lessons, tutorials, office-hours, or one-to-one meetings;</li>
          <li>asynchronous work inside RTD course shells;</li>
          <li>assessments, including remotely proctored exams.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">3. Definitions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Term</th>
                <th className="text-left py-2 font-semibold">Definition</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Personal Mobile Device (PMD)</td>
                <td className="py-2 text-gray-700">Any personally owned device capable of wireless communication (e.g., cell phone, smart-watch, tablet).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Instructional Time</td>
                <td className="py-2 text-gray-700">Any period in which a teacher is actively engaging with students in real time (live sessions or proctored exams).</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Secondary-camera mode</td>
                <td className="py-2 text-gray-700">A teacher-directed configuration in which a student's PMD streams video of the student's workspace/room for test security.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">4. Policy Statements</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              4.1 General Prohibition
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Phones Off & Out of Reach</strong> – Students must keep PMDs silenced and out-of-view throughout instructional time.</li>
              <li><strong>No Social-Media Access</strong> – RTD platforms block social-media domains for students, and students may not bypass these controls.</li>
              <li><strong>No Recording</strong> – Audio or video recording of live sessions on a PMD is forbidden unless the teacher grants prior permission.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              4.2 Required Use for Exam Security
            </h4>
            <p className="text-gray-700 mb-2">
              During certain quizzes and section exams, teachers will require students to place their PMD in secondary-camera mode. Conditions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Device must join only the approved proctoring platform (e.g., Teams "second device").</li>
              <li>Phone set to Do Not Disturb; all other apps closed.</li>
              <li>Camera positioned to show hands, keyboard, notes, and immediate surroundings.</li>
              <li>Any deviation (unlocking phone, switching apps, muting camera) invalidates the attempt and may result in a mark of zero.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              4.3 Permitted Exceptions (non-exam)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Code</th>
                    <th className="text-left py-2 pr-4 font-semibold">Exception</th>
                    <th className="text-left py-2 font-semibold">Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4">A. Medical / Safety</td>
                    <td className="py-2 pr-4 text-gray-700">Monitoring a documented medical condition or receiving emergency alerts.</td>
                    <td className="py-2 text-gray-700">Teacher notified in advance; device on silent.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">B. Learning Tool</td>
                    <td className="py-2 pr-4 text-gray-700">Teacher-authorized app (calculator, authenticator, document scanner).</td>
                    <td className="py-2 text-gray-700">Phone in learning-only mode; closed after use.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">C. Accessibility</td>
                    <td className="py-2 pr-4 text-gray-700">Requirement written in an IPP or accommodation plan.</td>
                    <td className="py-2 text-gray-700">Parameters specified in the IPP.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">5. Responsibilities</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Role</th>
                <th className="text-left py-2 font-semibold">Responsibilities</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium align-top">Students</td>
                <td className="py-2 text-gray-700">Follow the prohibitions; prepare PMD for exam camera use when instructed; request exceptions early.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium align-top">Teachers</td>
                <td className="py-2 text-gray-700">Remind students of rules, approve/deny exceptions, enforce discipline ladder, provide exam-camera instructions.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium align-top">Parents/Guardians</td>
                <td className="py-2 text-gray-700">Communicate with students via LMS messaging rather than texting during instructional time; supervise compliance at home.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium align-top">Administration</td>
                <td className="py-2 text-gray-700">Maintain social-media filters, publish policy in handbook, train staff, review annually, and ensure Order 014/2024 compliance.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">6. Enforcement & Progressive Discipline</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li><strong>First infraction</strong> – verbal reminder; device powered off for the session.</li>
          <li><strong>Second infraction</strong> – email to parent/guardian; student submits a written reflection.</li>
          <li><strong>Further infractions</strong> – meeting with administration; potential suspension from next live session(s).</li>
          <li><strong>Assessment breaches</strong> (e.g., unlocking PMD while acting as camera) – exam attempt void; mark of zero; possible academic-misconduct review.</li>
        </ol>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">7. Communication Plan</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Pre-Exam Checklist</strong> emailed 48 h before each assessment (device charge level, camera placement diagram, test call link).</li>
          <li><strong>How-to Video</strong> in LMS demonstrating correct secondary-camera setup.</li>
          <li><strong>Banner Reminder</strong> visible on the LMS dashboard on days with scheduled live sessions/exams.</li>
        </ul>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <Calendar className="h-5 w-5" />
          <p className="font-semibold">
            Policy Approved: May 20, 2025
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MobileDevicePolicy;