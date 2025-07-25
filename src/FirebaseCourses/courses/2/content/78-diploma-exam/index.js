import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, BookOpenIcon, CalculatorIcon, PencilIcon, BriefcaseIcon, XCircleIcon, CalendarIcon, ArrowPathIcon, EnvelopeIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const DiplomaExam = () => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [readSections, setReadSections] = useState(() => {
    const saved = localStorage.getItem('diploma-exam-read');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [confirmedItems, setConfirmedItems] = useState(() => {
    const saved = localStorage.getItem('diploma-exam-confirmed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [visitedLinks, setVisitedLinks] = useState(() => {
    const saved = localStorage.getItem('diploma-exam-visited');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const totalSections = 10;
  const totalConfirmations = 3;
  const totalLinks = 2;

  const progress = Math.round(((readSections.size + confirmedItems.size + visitedLinks.size) / (totalSections + totalConfirmations + totalLinks)) * 100);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    const newRead = new Set(readSections);
    
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
      // Mark as read when expanded for the first time
      newRead.add(sectionId);
    }
    
    setExpandedSections(newExpanded);
    setReadSections(newRead);
    localStorage.setItem('diploma-exam-read', JSON.stringify([...newRead]));
  };

  const toggleConfirmation = (itemId) => {
    const newConfirmed = new Set(confirmedItems);
    if (newConfirmed.has(itemId)) {
      newConfirmed.delete(itemId);
    } else {
      newConfirmed.add(itemId);
    }
    setConfirmedItems(newConfirmed);
    localStorage.setItem('diploma-exam-confirmed', JSON.stringify([...newConfirmed]));
  };

  const handleLinkClick = (linkId) => {
    const newVisited = new Set(visitedLinks);
    newVisited.add(linkId);
    setVisitedLinks(newVisited);
    localStorage.setItem('diploma-exam-visited', JSON.stringify([...newVisited]));
  };

  const AccordionSection = ({ id, icon: Icon, title, children }) => {
    const isExpanded = expandedSections.has(id);
    const isRead = readSections.has(id);

    return (
      <div className="border border-gray-200 rounded-lg mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {isRead && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="px-6 pb-6 pt-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ConfirmationCheckbox = ({ id, children }) => {
    const isChecked = confirmedItems.has(id);
    return (
      <label className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleConfirmation(id)}
          className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
        />
        <span className="text-sm text-yellow-800 font-medium">{children}</span>
      </label>
    );
  };

  const ExternalLink = ({ id, href, children }) => {
    const isVisited = visitedLinks.has(id);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleLinkClick(id)}
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          isVisited 
            ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
            : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
        }`}
      >
        <span>{children}</span>
        {isVisited && <CheckCircleIcon className="h-4 w-4" />}
      </a>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Physics 30 Diploma Exam: What You Need to Know</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Reading Progress</h2>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {progress}% Complete
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Click through each section, confirm important items, and review the external resources to complete your exam preparation.
          </p>
        </div>
      </div>

      <AccordionSection id="overview" icon={BookOpenIcon} title="What's on the Exam?">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Exam Structure:</h4>
            <ul className="space-y-2 text-gray-700">
              <li><strong>36 Multiple-Choice Questions</strong></li>
              <li><strong>14 Numerical-Response Questions</strong></li>
              <li><strong>Total: 50 Machine-Scored Questions</strong></li>
            </ul>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Time Allowed:</h4>
              <p className="text-blue-700">Up to 6 Hours (most students finish in ~3 hours)</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Weighting:</h4>
              <p className="text-green-700">30% of your final course mark<br />Your in-course grade is worth 70%</p>
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="preparation" icon={AcademicCapIcon} title="How to Prepare">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Stay on track with your schedule:</strong> Make steady progress through lessons, labs, and review content.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Use practice exams:</strong> Previous questions and samples are available at Quest A+.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Study the data booklet:</strong> The Physics 30 exam includes built-in reference pages.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Be exam-ready:</strong> Practice solving problems in new contexts—not just repeating memorized formulas.
              </div>
            </div>
          </div>
          <div className="mt-6">
            <ExternalLink id="data-booklet" href="#">
              Physics 30 Data Booklet (PDF)
            </ExternalLink>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="calculator" icon={CalculatorIcon} title="Calculator Rules">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Approved Calculators:</h4>
            <ul className="space-y-2 text-green-700">
              <li>• TI-84 Plus models</li>
              <li>• TI-Nspire CX II (CAS mode must be OFF)</li>
              <li>• Casio fx-9750 GII or GIII (must be in Examination Mode)</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-3">Restrictions:</h4>
            <ul className="space-y-2 text-red-700">
              <li>• No CAS, symbolic solvers, built-in formulas, or apps</li>
              <li>• No cases or stored memory—your calculator will be cleared/reset by an exam supervisor</li>
            </ul>
          </div>
          <div className="mt-6">
            <ExternalLink id="calculator-info" href="#">
              2024–2025 Calculator Info (PDF)
            </ExternalLink>
          </div>
          <div className="mt-6">
            <ConfirmationCheckbox id="calculator-confirm">
              I understand my calculator must be approved and will be cleared/reset before the exam
            </ConfirmationCheckbox>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="tips" icon={PencilIcon} title="Exam Writing Tips">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Multiple Choice:</h4>
            <p className="text-gray-700">Think through the question before reviewing the options. Eliminate incorrect choices.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Numerical Response:</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Pay close attention to rounding, significant digits, and units</li>
              <li>• Some questions may accept more than one valid answer format</li>
              <li>• Use your exam booklet to work through problems. Final answers must be bubbled on the answer sheet</li>
              <li>• Ensure all answers are recorded before time is up—you can't fill in the sheet after time ends</li>
            </ul>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="exam-items" icon={BriefcaseIcon} title="What You Can and Can't Bring">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">✓ Allowed Items:</h4>
            <ul className="space-y-2 text-green-700">
              <li>• HB pencil and eraser</li>
              <li>• Blue or black pen</li>
              <li>• Highlighter (optional)</li>
              <li>• Ruler and protractor (optional)</li>
              <li>• Approved calculator, properly cleared/reset</li>
              <li>• Water bottle</li>
              <li>• Light, bite-sized snack (like cut-up granola bar pieces or apple slices)</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-3">✗ Prohibited Items:</h4>
            <ul className="space-y-2 text-red-700">
              <li>• Phones, smartwatches, earbuds, or any electronics</li>
              <li>• Notes, textbooks, papers, cheat sheets, or blank scrap paper</li>
              <li>• Calculator cases or unapproved calculator models</li>
              <li>• Sticky notes, reference charts, or printed formula guides</li>
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <ConfirmationCheckbox id="phone-confirm">
            I understand that bringing a cellphone (even turned off) may invalidate my exam
          </ConfirmationCheckbox>
        </div>
      </AccordionSection>

      <AccordionSection id="dates" icon={CalendarIcon} title="Exam Dates and Locations">
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 mb-4">Physics 30 diploma exams are scheduled 5 times per year:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {['November', 'January', 'April', 'June', 'August'].map((month) => (
                <div key={month} className="bg-blue-50 p-3 rounded-lg text-center">
                  <span className="font-semibold text-blue-800">{month}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              Exams typically begin at 9:00 AM. Specific dates are posted on Alberta Education's website.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-3">Important: Online School Registration Process</h4>
            <div className="space-y-3 text-orange-700">
              <p>
                <strong>As we are an online school, each student is required to sign up for their own exam location through MyPass.</strong>
              </p>
              <p>
                Please ensure you have:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contacted your chosen writing center directly</li>
                <li>Confirmed availability for your preferred exam date</li>
                <li>Obtained the correct address and room number</li>
                <li>Verified any specific requirements or procedures for that location</li>
              </ul>
              <p className="font-medium">
                Complete this process well before your exam day to avoid any last-minute complications.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Finding Writing Centers:</h4>
            <p className="text-blue-700">
              Use MyPass to locate approved diploma exam writing centers in your area. Choose a location that is convenient and confirm their exam schedule matches your preferred date.
            </p>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="rewrite" icon={ArrowPathIcon} title="Rewriting or Rescoring">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Rewriting:</h4>
            <p className="text-blue-700">You may rewrite the diploma exam to improve your score—your highest mark will be used.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Rescoring:</h4>
            <p className="text-yellow-700">You may also request a rescore if you think an error occurred, but the new score will be final—even if it's lower.</p>
          </div>
          <p className="text-gray-700">Rewrite fees are paid through myPass.</p>
        </div>
      </AccordionSection>

      <AccordionSection id="accommodations" icon={EnvelopeIcon} title="Accommodations">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800">
            If you require accommodations, please email your teacher as early as possible to begin the application process.
          </p>
        </div>
      </AccordionSection>

      <AccordionSection id="grades" icon={ChartBarIcon} title="Checking Your Grades">
        <div className="space-y-4">
          <p className="text-gray-700">Diploma exam results are available about 3 to 4 weeks after the exam.</p>
          <p className="text-gray-700">Visit myPass to check your scores, view your transcript, or print official records.</p>
        </div>
      </AccordionSection>

      <AccordionSection id="final-note" icon={AcademicCapIcon} title="A Final Note from Your Teacher">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="space-y-4 text-gray-700">
            <p>You've made it to the end of Physics 30. This course asked you to think deeply, problem-solve, and apply what you've learned in new ways. You've worked hard, and now it's your time to show what you know on the diploma exam.</p>
            <p>Remember to stay calm, stay focused, and trust your preparation. You are ready for this.</p>
            <p className="font-semibold text-gray-800">Thank you for your effort and commitment throughout the course. Best of luck on your exam!</p>
          </div>
        </div>
        <div className="mt-6">
          <ConfirmationCheckbox id="final-confirm">
            I have read all the exam information and understand the requirements
          </ConfirmationCheckbox>
        </div>
      </AccordionSection>

      {progress === 100 && (
        <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Exam Preparation Complete!</h3>
          <p className="text-green-700">
            You've reviewed all the important information about the Physics 30 Diploma Exam.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiplomaExam;
