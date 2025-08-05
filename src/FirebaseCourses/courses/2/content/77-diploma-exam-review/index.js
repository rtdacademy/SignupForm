import React, { useState } from 'react';
import PDFViewer from '../../../../components/PDFViewer';
import { ChevronDown, ChevronRight, Download, BookOpen, FileText, Calendar } from 'lucide-react';

const DiplomaExamReview = () => {
  const [expandedSections, setExpandedSections] = useState({
    quickDownloads: false,
    releasedItems: false,
    pastExams: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Essential resources that are always visible
  const essentialResources = [
    {
      title: 'Physics 30 Information Bulletin (2024-25)',
      filename: '24-25-physics-30-info-bulletin.pdf',
      description: 'Current year exam format, dates, and important information'
    },
    {
      title: 'Physics 30 Data Booklet',
      filename: 'edc-physics30-data-booklet.pdf',
      description: 'Official formula sheet and constants provided during the exam'
    },
    {
      title: 'Diploma Exam Science 30 Guide',
      filename: 'ed-diploma-exam-science-30-guide.pdf',
      description: 'Comprehensive guide on exam structure and expectations'
    },
    {
      title: 'Diploma Exam Review Package',
      filename: 'Diploma Exam Review.pdf',
      description: 'Complete review material covering all units'
    }
  ];

  // Released items organized by year
  const releasedItems = [
    { year: '2015', filename: 'edc-physics30-released-items-2015.pdf' },
    { year: '2013', filename: 'edc-physics30-released-items-2013.pdf' },
    { year: '2012', filename: 'edc-physics30-released-items-2012.pdf' },
    { year: '2011', filename: 'edc-physics30-released-items-2011.pdf' },
    { year: '2010', filename: 'edc-physics30-released-items-2010.pdf' },
    { year: '2009', filename: 'edc-physics30-released-items-2009.pdf' }
  ];

  // Past exams organized by year and session
  const pastExams = [
    { year: '2001', sessions: ['June'] },
    { year: '1998', sessions: ['January', 'June'] },
    { year: '1997', sessions: ['January', 'June'] },
    { year: '1996', sessions: ['January', 'June'] },
    { year: '1995', sessions: ['January', 'June'] },
    { year: '1990', sessions: ['January', 'June'] }
  ];

  // Get all PDFs for quick downloads
  const allPDFs = [
    ...essentialResources,
    ...releasedItems.map(item => ({
      title: `Released Items ${item.year}`,
      filename: item.filename
    })),
    ...pastExams.flatMap(exam => 
      exam.sessions.map(session => ({
        title: `Diploma Exam ${exam.year} ${session}`,
        filename: `Diploma Exam ${exam.year} ${session}.pdf`
      }))
    )
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Physics 30 Diploma Exam Review</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Welcome to the diploma exam review section. Here you'll find all the essential resources
          to help you prepare for your Physics 30 diploma exam. Start with the essential resources
          below, then explore past exams and released items for additional practice.
        </p>
      </div>

      {/* Essential Resources Section - Always Visible */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Essential Resources</h2>
        </div>
        
        <div className="space-y-8">
          {essentialResources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <PDFViewer
                src={`/courses/2/content/77-diploma-exam-review/${resource.filename}`}
                title={resource.title}
                height="600px"
                showDownload={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Downloads Section - Collapsible */}
      <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('quickDownloads')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Quick Downloads</h3>
          </div>
          {expandedSections.quickDownloads ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {expandedSections.quickDownloads && (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600 mb-4">Download any resource directly:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allPDFs.map((pdf, index) => (
                <a
                  key={index}
                  href={`/courses/2/content/77-diploma-exam-review/${pdf.filename}`}
                  download
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-4 h-4" />
                  {pdf.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Released Items Section - Collapsible */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('releasedItems')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Released Items (2009-2015)</h3>
          </div>
          {expandedSections.releasedItems ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {expandedSections.releasedItems && (
          <div className="p-6 space-y-6 border-t border-gray-200">
            {releasedItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-3">Released Items {item.year}</h4>
                <PDFViewer
                  src={`/courses/2/content/77-diploma-exam-review/${item.filename}`}
                  title={`Released Items ${item.year}`}
                  height="600px"
                  showDownload={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Diploma Exams Section - Collapsible */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('pastExams')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Past Diploma Exams (1990-2001)</h3>
          </div>
          {expandedSections.pastExams ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {expandedSections.pastExams && (
          <div className="p-6 space-y-6 border-t border-gray-200">
            {pastExams.map((exam, examIndex) => (
              <div key={examIndex} className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">{exam.year} Exams</h4>
                {exam.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="text-md font-medium mb-3">{exam.year} {session} Exam</h5>
                    <PDFViewer
                      src={`/courses/2/content/77-diploma-exam-review/Diploma Exam ${exam.year} ${session}.pdf`}
                      title={`Diploma Exam ${exam.year} ${session}`}
                      height="600px"
                      showDownload={true}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Exam Preparation Tips</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Start by reviewing the Information Bulletin to understand the exam format and requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Familiarize yourself with the Data Booklet - know what formulas are provided</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Practice with released items to understand question types and difficulty levels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Time yourself when doing past exams to build exam stamina</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Review all units equally - the exam covers the entire course</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DiplomaExamReview;
