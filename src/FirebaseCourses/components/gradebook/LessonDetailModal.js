import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, CheckCircle, XCircle, Clock, Award, RotateCcw, Eye, ChevronLeft, FileText, Save, Edit3 } from 'lucide-react';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import { formatScore } from '../../utils/gradeUtils';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { ScrollArea } from '../../../components/ui/scroll-area';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Helper function to detect if text contains markdown patterns
 */
const containsMarkdown = (text) => {
  if (!text) return false;
  
  // Look for more precise patterns to reduce false positives
  const markdownPatterns = [
    /^#+\s+.+$/m,                  // Headers: # Header
    /\*\*.+\*\*/,                  // Bold: **bold**
    /\*.+\*/,                      // Italic: *italic*
    /```[\s\S]*```/,               // Code block: ```code```
    /`[^`]+`/,                     // Inline code: `code`
    /\[.+\]\(.+\)/,                // Links: [text](url)
    /\|[^|]+\|[^|]+\|/,            // Tables: |cell|cell|
    /^\s*>\s+.+$/m,                // Blockquotes: > quote
    /^\s*-\s+.+$/m,                // Unordered lists: - item
    /^\s*\d+\.\s+.+$/m,            // Ordered lists: 1. item
    /!\[.+\]\(.+\)/,               // Images: ![alt](url)
    /~~.+~~/,                      // Strikethrough: ~~text~~
    /\$\$.+\$\$/,                  // Math blocks: $$math$$
    /\$.+\$/,                      // Inline math: $math$
    /\\[a-zA-Z]+/,                 // LaTeX commands: \alpha, \beta, etc.
    /\\begin\{/,                   // LaTeX environments: \begin{...}
    /\\end\{/,                     // LaTeX environments: \end{...}
    /\\frac\{/,                    // LaTeX fractions: \frac{...}
    /\\sqrt/,                      // LaTeX square roots: \sqrt{...}
    /\\left/,                      // LaTeX brackets: \left(...
    /\\right/,                     // LaTeX brackets: \right)...
  ];
  
  // Check for simple text indicators first for better performance
  const quickCheck = (
    text.includes('#') || 
    text.includes('**') || 
    text.includes('*') ||
    text.includes('```') ||
    text.includes('`') ||
    text.includes('[') ||
    text.includes('|') ||
    text.includes('> ') ||
    text.includes('- ') ||
    text.includes('1. ') ||
    text.includes('$') ||  // Math delimiters
    text.includes('\\')    // LaTeX commands
  );
  
  // If quick check passes, do more precise checking
  if (quickCheck) {
    // Check for common markdown patterns
    for (const pattern of markdownPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    // Special case for tables which can be tricky to detect
    if (text.includes('|')) {
      // Count pipe characters in the text
      const pipeCount = (text.match(/\|/g) || []).length;
      // If there are multiple pipe characters, it's likely a table
      if (pipeCount >= 4) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Helper function to format scientific notation for display
 */
const formatScientificNotation = (text) => {
  if (!text) return text;
  
  // Pattern to match scientific notation (e.g., 3.4e+8, 1.2e-5, 6.02e23)
  const scientificPattern = /(\d+\.?\d*)[eE]([+-]?\d+)/g;
  
  return text.replace(scientificPattern, (match, coefficient, exponent) => {
    // Remove leading + from exponent if present
    const cleanExponent = exponent.replace(/^\+/, '');
    // Format as proper scientific notation with × and superscript using HTML
    return `${coefficient} × 10<sup>${cleanExponent}</sup>`;
  });
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  // First, format any scientific notation
  text = formatScientificNotation(text);
  
  // If text contains markdown patterns, use ReactMarkdown with enhanced configuration
  if (containsMarkdown(text)) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
          rehypePlugins={[
            [rehypeSanitize, {
              // Standard HTML elements plus additional elements for enhanced content
              allowedElements: [
                // Standard markdown elements
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span',
                // Additional elements we want to allow
                'details', 'summary', 'dl', 'dt', 'dd',
                // Scientific notation formatting
                'sup', 'sub'
              ],
              // Allow certain attributes
              allowedAttributes: {
                // Allow href and target for links
                a: ['href', 'target', 'rel'],
                // Allow src and alt for images
                img: ['src', 'alt', 'title'],
                // Allow class and style for common elements
                div: ['className', 'class', 'style'],
                span: ['className', 'class', 'style'],
                code: ['className', 'class', 'language'],
                pre: ['className', 'class'],
                // Allow open attribute for details
                details: ['open']
              }
            }],
            rehypeKatex,
            rehypeRaw
          ]}
          components={{
            // Make headings slightly smaller in question contexts
            h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-1 mb-2" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-1 mb-2" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-base font-bold mt-1 mb-1" {...props} />,
            
            // Enhanced code handling
            code: ({node, inline, className, children, ...props}) => {
              if (inline) {
                return <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-800" {...props}>{children}</code>
              }
              return <code {...props}>{children}</code>
            },
            
            // Make lists more compact
            ul: ({node, ...props}) => <ul className="my-1 pl-5" {...props} />,
            ol: ({node, ...props}) => <ol className="my-1 pl-5" {...props} />,
            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
            
            // Make sure paragraphs preserve spacing
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            
            // Make links open in new tab and have proper styling
            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="font-medium underline" {...props} />,
            
            // Style tables to fit in content areas
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-2">
                <table className="border-collapse border border-gray-300 text-sm" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
            
            // Handle details/summary elements
            details: ({node, ...props}) => <details className="border rounded-md p-2 my-2" {...props} />,
            summary: ({node, ...props}) => <summary className="font-medium cursor-pointer" {...props} />,
            
            // Definition lists
            dl: ({node, ...props}) => <dl className="my-2" {...props} />,
            dt: ({node, ...props}) => <dt className="font-bold mt-2" {...props} />,
            dd: ({node, ...props}) => <dd className="ml-4 mt-1" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }
  
  // For simple text without markdown, preserve line breaks and handle any HTML we added (like sup tags)
  return (
    <div 
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

const LessonDetailModal = ({ isOpen, onClose, lesson, course, isStaffView = false }) => {
  if (!lesson) return null;

  const assessments = course?.Assessments || {};
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  // Get selected session data if viewing a specific session
  const selectedSession = selectedSessionId 
    ? lesson.sessionData?.sessions?.find(s => s.sessionId === selectedSessionId)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={`${
          lesson?.activityType === 'lab' 
            ? 'w-full sm:w-full md:w-full lg:w-full xl:w-full' 
            : 'w-full sm:w-full md:w-[90%] lg:w-[90%] xl:w-[90%]'
        } sm:max-w-none p-0 flex flex-col`}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {selectedSession && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSessionId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Overview
              </Button>
            )}
            <div>
              <SheetTitle className="text-xl">
                {selectedSession 
                  ? `${lesson.lessonTitle} - Session Details`
                  : lesson.lessonTitle
                }
              </SheetTitle>
              <SheetDescription>
                {selectedSession 
                  ? `Attempt ${lesson.sessionData.sessions.findIndex(s => s.sessionId === selectedSessionId) + 1} • ${new Date(selectedSession.finalResults?.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                  : `${lesson.lessonId} • ${lesson.activityType}`
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1">
          {selectedSession ? (
            /* Session Details View */
            <SessionDetailView 
              session={selectedSession}
              lesson={lesson}
              course={course}
              assessments={assessments}
              attemptNumber={lesson.sessionData.sessions.findIndex(s => s.sessionId === selectedSessionId) + 1}
              isStaffView={isStaffView}
            />
          ) : (
            /* Overview - existing content */
            <>
           

              {/* Session Information for Assignments/Exams/Quizzes */}
              {lesson.sessionData && ['assignment', 'exam', 'quiz'].includes(lesson.activityType) && (
                <div className="px-6 py-4 border-b bg-blue-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Session History
                  </h3>

                  {/* Grading Method Info */}
                  {(() => {
                    const sessionScoring = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[lesson.lessonId]?.assessmentSettings?.sessionScoring || 'takeHighest';
                    const scoringMethods = {
                      'takeHighest': { label: 'Highest Score', icon: '🏆', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                      'latest': { label: 'Latest Score', icon: '🕐', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                      'average': { label: 'Average Score', icon: '📊', color: 'bg-purple-50 border-purple-200 text-purple-800' }
                    };
                    const method = scoringMethods[sessionScoring];

                    return (
                      <div className={`mb-4 p-3 rounded-lg border ${method.color}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{method.icon}</span>
                          <span className="font-medium">Grading Method: {method.label}</span>
                        </div>
                        <div className="text-sm mt-1">
                          {sessionScoring === 'takeHighest' && 'Your final grade is based on your best attempt'}
                          {sessionScoring === 'latest' && 'Your final grade is based on your most recent attempt'}
                          {sessionScoring === 'average' && 'Your final grade is the average of all your attempts'}
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{lesson.sessionData.sessionCount}</div>
                      <div className="text-sm text-gray-600">Total Attempts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatScore(lesson.sessionData.latestSession.finalResults.percentage)}%
                      </div>
                      <div className="text-sm text-gray-600">Latest Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatScore(Math.max(...lesson.sessionData.sessions.map(s => s.finalResults.percentage)))}%
                      </div>
                      <div className="text-sm text-gray-600">Best Score</div>
                    </div>
                  </div>

                  {/* Session List */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-700">All Sessions</h4>
                    {lesson.sessionData.sessions.map((session, index) => {
                      // Determine if this session is used for final grade
                      const sessionScoring = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[lesson.lessonId]?.assessmentSettings?.sessionScoring || 'takeHighest';
                      let isUsedForGrade = false;
                      
                      if (sessionScoring === 'takeHighest') {
                        const highestSession = lesson.sessionData.sessions.reduce((highest, current) => 
                          (current.finalResults?.percentage || 0) > (highest.finalResults?.percentage || 0) ? current : highest
                        );
                        isUsedForGrade = session.sessionId === highestSession.sessionId;
                      } else if (sessionScoring === 'latest') {
                        const latestSession = lesson.sessionData.sessions[lesson.sessionData.sessions.length - 1];
                        isUsedForGrade = session.sessionId === latestSession.sessionId;
                      } else if (sessionScoring === 'average') {
                        isUsedForGrade = true; // All sessions contribute
                      }

                      return (
                        <SessionCard 
                          key={session.sessionId || index} 
                          session={session} 
                          attemptNumber={index + 1}
                          onViewDetails={() => setSelectedSessionId(session.sessionId)}
                          showViewButton={true}
                          isUsedForGrade={isUsedForGrade}
                          gradingMethod={sessionScoring}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lesson Questions for lesson type activities */}
              {lesson.activityType === 'lesson' && (
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Lesson Questions
                  </h3>
                  
                  <div className="space-y-4">
                    {(() => {
                      // Get questions from course config
                      const itemConfig = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[lesson.lessonId];
                      const questions = itemConfig?.questions || [];
                      
                      if (questions.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            No questions found for this lesson.
                          </div>
                        );
                      }
                      
                      return questions.map((question, index) => {
                        const questionId = question.questionId;
                        const assessmentData = assessments[questionId];
                        
                        if (!assessmentData) return null;
                        
                        return (
                          <LessonQuestionCard
                            key={questionId}
                            questionNumber={index + 1}
                            assessmentData={assessmentData}
                            questionId={questionId}
                            isStaffView={isStaffView}
                            course={course}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Lab Activities */}
              {lesson.activityType === 'lab' && (
                <div className="flex flex-col h-full">
               
                  
                  {/* Lab Component */}
                  <div className="flex-1 overflow-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto p-6">
                      <div className="bg-white rounded-lg shadow">
                        <LabComponentLoader 
                          lessonId={lesson.lessonId} 
                          courseId={course?.courseId || '2'}
                          course={course}
                          isStaffView={isStaffView}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// Helper function to truncate question text for security
const truncateQuestionText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Session Detail View Component
const SessionDetailView = ({ session, lesson, course, assessments, attemptNumber, isStaffView = false }) => {
  console.log('🎬 SessionDetailView rendered', {
    sessionId: session?.sessionId,
    studentKey: course?.studentKey,
    CourseID: course?.CourseID,
    isStaffView,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Memoize stable course properties to prevent unnecessary effect re-runs
  const stableCourseProps = useMemo(() => ({
    studentKey: course?.studentKey,
    CourseID: course?.CourseID
  }), [course?.studentKey, course?.CourseID]);
  
  // Memoize stable session property to prevent unnecessary effect re-runs
  const stableSessionId = useMemo(() => session?.sessionId, [session?.sessionId]);
  
  // Real-time listeners for session score and percentage
  const [realtimeScore, setRealtimeScore] = useState(session.finalResults?.score || 0);
  const [realtimePercentage, setRealtimePercentage] = useState(session.finalResults?.percentage || 0);
  
  // Manual score override state
  const [isManualOverrideMode, setIsManualOverrideMode] = useState(false);
  const [manualScore, setManualScore] = useState('');
  const [isEditingManualScore, setIsEditingManualScore] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'
  
  // Component mount/unmount tracking
  useEffect(() => {
    console.log('🎬 SessionDetailView mounted');
    return () => {
      console.log('🎭 SessionDetailView unmounted');
    };
  }, []);

  // Set up real-time listeners for session finalResults
  useEffect(() => {
    if (!stableCourseProps.studentKey || !stableCourseProps.CourseID || !stableSessionId) {
      return;
    }

    const db = getDatabase();
    
    // Listen to score changes
    const scoreRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/score`);
    const scoreUnsubscribe = onValue(scoreRef, (snapshot) => {
      const score = snapshot.val();
      if (score !== null && score !== undefined) {
        setRealtimeScore(score);
      }
    });

    // Listen to percentage changes
    const percentageRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/percentage`);
    const percentageUnsubscribe = onValue(percentageRef, (snapshot) => {
      const percentage = snapshot.val();
      if (percentage !== null && percentage !== undefined) {
        setRealtimePercentage(percentage);
      }
    });

    // Listen to manual override mode state
    const overrideModeRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/isManualOverrideMode`);
    const overrideModeUnsubscribe = onValue(overrideModeRef, (snapshot) => {
      const overrideMode = snapshot.val();
      if (overrideMode !== null && overrideMode !== undefined) {
        setIsManualOverrideMode(overrideMode);
        if (overrideMode) {
          setManualScore(realtimeScore.toString());
        }
      }
    });

    // Cleanup listeners on unmount
    return () => {
      scoreUnsubscribe();
      percentageUnsubscribe();
      overrideModeUnsubscribe();
    };
  }, [stableCourseProps.studentKey, stableCourseProps.CourseID, stableSessionId, realtimeScore]);

  // Load initial toggle state from Firebase on component mount
  useEffect(() => {
    const loadInitialToggleState = async () => {
      if (!stableCourseProps.studentKey || !stableCourseProps.CourseID || !stableSessionId) {
        return;
      }

      try {
        const db = getDatabase();
        const overrideModeRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/isManualOverrideMode`);
        const snapshot = await get(overrideModeRef);
        
        if (snapshot.exists()) {
          const savedOverrideMode = snapshot.val();
          setIsManualOverrideMode(savedOverrideMode);
          if (savedOverrideMode) {
            setManualScore(realtimeScore.toString());
          }
        }
        // If no saved state exists, default to false (individual mode)
      } catch (error) {
        console.error('Error loading initial toggle state:', error);
        // Default to individual mode on error
        setIsManualOverrideMode(false);
      }
    };

    loadInitialToggleState();
  }, [stableCourseProps.studentKey, stableCourseProps.CourseID, stableSessionId, realtimeScore]);

  // Handle manual score override toggle - use useCallback to prevent recreation
  const handleToggleOverrideMode = useCallback(async () => {
    console.log('🔄 handleToggleOverrideMode called', {
      stableCourseProps,
      stableSessionId,
      isStaffView,
      currentMode: isManualOverrideMode
    });
    
    if (!stableCourseProps.studentKey || !stableCourseProps.CourseID || !stableSessionId || !isStaffView) {
      console.log('❌ handleToggleOverrideMode early return - missing data');
      return;
    }

    const newOverrideMode = !isManualOverrideMode;
    
    try {
      const db = getDatabase();
      const overrideModeRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/isManualOverrideMode`);
      
      // Save the toggle state to Firebase
      await set(overrideModeRef, newOverrideMode);
      
      // Update local state
      setIsManualOverrideMode(newOverrideMode);
      
      if (newOverrideMode) {
        // Switching to manual override mode
        setManualScore(realtimeScore.toString());
      } else {
        // Switching back to individual mode
        setIsEditingManualScore(false);
        setManualScore('');
        setSaveStatus(null);
      }
    } catch (error) {
      console.error('Error saving override mode state:', error);
      // Could optionally show an error message to the user
    }
  }, [stableCourseProps.studentKey, stableCourseProps.CourseID, stableSessionId, isStaffView, isManualOverrideMode]);

  // Handle manual score save - use useCallback to prevent recreation
  const handleSaveManualScore = useCallback(async () => {
    console.log('💾 handleSaveManualScore called', {
      stableCourseProps,
      stableSessionId,
      isStaffView,
      manualScore,
      saveStatus
    });
    
    if (!stableCourseProps.studentKey || !stableCourseProps.CourseID || !stableSessionId || !isStaffView) {
      console.log('❌ handleSaveManualScore early return - missing data');
      return;
    }

    const scoreValue = parseFloat(manualScore);
    if (isNaN(scoreValue) || scoreValue < 0) {
      console.log('❌ handleSaveManualScore - invalid score value');
      setSaveStatus('error');
      return;
    }

    const maxScore = session.finalResults?.maxScore || 0;
    if (scoreValue > maxScore) {
      console.log('❌ handleSaveManualScore - score exceeds max');
      setSaveStatus('error');
      return;
    }

    console.log('💾 Starting save process...');
    setSaveStatus('saving');

    try {
      const db = getDatabase();
      const scoreRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/score`);
      
      await set(scoreRef, scoreValue);
      
      // Also calculate and update percentage
      const percentage = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0;
      const percentageRef = ref(db, `students/${stableCourseProps.studentKey}/courses/${stableCourseProps.CourseID}/ExamSessions/${stableSessionId}/finalResults/percentage`);
      await set(percentageRef, percentage);

      setSaveStatus('success');
      setIsEditingManualScore(false);
      
      // Clear success status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error saving manual score:', error);
      setSaveStatus('error');
    }
  }, [stableCourseProps.studentKey, stableCourseProps.CourseID, stableSessionId, isStaffView, manualScore, session.finalResults?.maxScore]);

  // Handle manual score cancel - use useCallback to prevent recreation
  const handleCancelManualScore = useCallback(() => {
    setManualScore(realtimeScore.toString());
    setIsEditingManualScore(false);
    setSaveStatus(null);
  }, [realtimeScore]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get session scoring method
  const getSessionScoringInfo = () => {
    const sessionScoring = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[lesson.lessonId]?.assessmentSettings?.sessionScoring || 'takeHighest';
    
    const scoringMethods = {
      'takeHighest': {
        label: 'Highest Score',
        description: 'Your final grade is based on your best attempt',
        icon: '🏆'
      },
      'latest': {
        label: 'Latest Score',
        description: 'Your final grade is based on your most recent attempt',
        icon: '🕐'
      },
      'average': {
        label: 'Average Score',
        description: 'Your final grade is the average of all your attempts',
        icon: '📊'
      }
    };

    return {
      method: sessionScoring,
      ...scoringMethods[sessionScoring]
    };
  };

  const scoringInfo = getSessionScoringInfo();

  // Calculate which session contributes to final grade
  const getFinalGradeSession = () => {
    if (!lesson.sessionData?.sessions?.length) return null;

    const sessions = lesson.sessionData.sessions;
    
    switch (scoringInfo.method) {
      case 'takeHighest':
        return sessions.reduce((highest, current) => 
          (current.finalResults?.percentage || 0) > (highest.finalResults?.percentage || 0) ? current : highest
        );
      case 'latest':
        return sessions[sessions.length - 1]; // Last session in array
      case 'average':
        return null; // Average doesn't use a single session
      default:
        return sessions.reduce((highest, current) => 
          (current.finalResults?.percentage || 0) > (highest.finalResults?.percentage || 0) ? current : highest
        );
    }
  };

  const finalGradeSession = getFinalGradeSession();
  const isCurrentSessionUsedForGrade = finalGradeSession?.sessionId === session.sessionId;

  const formatDuration = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return 'N/A';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const percentage = realtimePercentage;
  const score = realtimeScore;
  const maxScore = session.finalResults?.maxScore || 0;

  return (
    <>
      {/* Session Summary */}
      <div className="px-6 py-4 border-b bg-blue-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Summary</h3>
        
        {/* Grade Contribution Banner */}
        {isCurrentSessionUsedForGrade && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-lg">{scoringInfo.icon}</span>
              <span className="font-medium">This session counts toward your final grade</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Grading Method: {scoringInfo.label} - {scoringInfo.description}
            </div>
          </div>
        )}
        
        {!isCurrentSessionUsedForGrade && scoringInfo.method !== 'average' && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">{scoringInfo.icon}</span>
              <span className="font-medium">This session does not count toward your final grade</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Grading Method: {scoringInfo.label} - {scoringInfo.description}
            </div>
          </div>
        )}
        
        {scoringInfo.method === 'average' && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">{scoringInfo.icon}</span>
              <span className="font-medium">All sessions contribute to your final grade</span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Grading Method: {scoringInfo.label} - {scoringInfo.description}
            </div>
          </div>
        )}
        
        {/* Score Editing Mode Toggle - Staff Only */}
        {isStaffView && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-purple-800">Score Editing Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleOverrideMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      isManualOverrideMode ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isManualOverrideMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-purple-700">
                    {isManualOverrideMode ? 'Manual Total Score' : 'Individual Questions'}
                  </span>
                </div>
              </div>
              
              {isManualOverrideMode && (
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Award className="h-4 w-4" />
                  <span>Override Mode Active</span>
                </div>
              )}
            </div>
            
            {/* Mode Description */}
            <div className="mt-2 text-xs text-purple-600">
              {isManualOverrideMode ? (
                <span>✓ You can manually set the total session score. Individual question editing is disabled.</span>
              ) : (
                <span>✓ You can edit individual question scores. Total score is calculated automatically.</span>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            {isManualOverrideMode && isStaffView ? (
              <div className="space-y-2">
                {/* Manual Score Editor */}
                {isEditingManualScore ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={manualScore}
                        onChange={(e) => setManualScore(e.target.value)}
                        min="0"
                        max={maxScore}
                        step="0.5"
                        className="w-20 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="font-medium">/ {maxScore}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSaveManualScore}
                        disabled={saveStatus === 'saving'}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Clock className="h-3 w-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelManualScore}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {saveStatus === 'error' && (
                      <div className="text-xs text-red-600">
                        Invalid score. Must be between 0 and {maxScore}.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold px-3 py-1 rounded border ${getScoreColor(percentage)} cursor-pointer hover:bg-opacity-80`}
                         onClick={() => setIsEditingManualScore(true)}>
                      {formatScore(score)} / {maxScore}
                    </div>
                    <button
                      onClick={() => setIsEditingManualScore(true)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mx-auto"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit Score
                    </button>
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <div className="text-xs text-green-600 flex items-center gap-1 justify-center">
                    <CheckCircle className="h-3 w-3" />
                    Score updated!
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className={`text-2xl font-bold px-3 py-1 rounded border ${getScoreColor(percentage)}`}>
                  {formatScore(score)} / {maxScore}
                </div>
                <div className="text-sm text-gray-600 mt-1">{formatScore(percentage)}%</div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{session.finalResults?.totalQuestions || 0}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {session.createdAt && session.finalResults?.completedAt 
                ? formatDuration(session.finalResults.completedAt - session.createdAt)
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">#{attemptNumber}</div>
            <div className="text-sm text-gray-600">Attempt</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Started:</strong> {formatDate(session.createdAt)}</div>
          <div><strong>Completed:</strong> {formatDate(session.finalResults?.completedAt)}</div>
          <div><strong>Session ID:</strong> {session.sessionId?.slice(-12) || 'N/A'}</div>
        </div>
      </div>

      {/* Session Questions */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions in This Session</h3>
          {isManualOverrideMode && isStaffView && (
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <Award className="h-4 w-4" />
              <span>Individual editing disabled</span>
            </div>
          )}
        </div>
        
        {session.finalResults?.questionResults?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No question results found for this session.
          </div>
        ) : (
          <div className="space-y-4">
            {session.finalResults?.questionResults?.map((questionResult, index) => (
              <SessionQuestionCard 
                key={questionResult.questionId || index}
                questionResult={questionResult}
                assessmentData={assessments[questionResult.questionId]}
                questionNumber={index + 1}
                activityType={lesson.activityType}
                isStaffView={isStaffView}
                course={course}
                session={session}
                isManualOverrideMode={isManualOverrideMode}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Session-specific Question Card (limited info for security)
const SessionQuestionCard = ({ questionResult, assessmentData, questionNumber, activityType, isStaffView = false, course, session, isManualOverrideMode = false }) => {
  const getScoreColor = (score, maxScore) => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (pct >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (pct >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (questionResult.isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  // Show full details for assignments or when staff is viewing
  const showDetailedInfo = activityType === 'assignment' || isStaffView;
  
  // Get question text - full text for staff, truncated for students
  const displayQuestionText = assessmentData?.questionText 
    ? (isStaffView ? assessmentData.questionText : assessmentData.questionText.substring(0, 50) + '...') 
    : null;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Question {questionNumber}</span>
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          </div>
          
          <h4 className="font-medium text-gray-900">
            {questionResult.questionText || `Question ${questionNumber}`}
          </h4>
          
          {displayQuestionText && (
            <div className="text-sm text-gray-600 mt-1">
              {showDetailedInfo ? renderEnhancedText(displayQuestionText) : displayQuestionText}
              {!showDetailedInfo && !isStaffView && (
                <span className="italic text-gray-500"> (preview only)</span>
              )}
            </div>
          )}
          
          {!showDetailedInfo && !isStaffView && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Full question details are not shown for {activityType}s to maintain assessment integrity
            </p>
          )}
          
          {isStaffView && activityType !== 'assignment' && (
            <p className="text-xs text-purple-600 mt-1 italic">
              Staff View: Full question details shown
            </p>
          )}
        </div>
      </div>

      {/* Student Answer Details - Only for Staff */}
      {isStaffView && questionResult && (
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-2">
            {/* Check if this is a long answer question by checking if studentAnswer contains HTML */}
            {questionResult.studentAnswer && questionResult.studentAnswer.includes('<') ? (
              /* Long Answer Question Display */
              <>
                <div>
                  <span className="text-sm font-medium text-gray-700">Student's Answer:</span>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div 
                      className="prose prose-sm max-w-none prose-gray"
                      dangerouslySetInnerHTML={{ __html: questionResult.studentAnswer }}
                    />
                  </div>
                </div>
                
                {/* Feedback section for long answer questions */}
                {questionResult.feedback && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Instructor Feedback:</span>
                    <div className="text-sm mt-1 p-2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {questionResult.feedback}
                    </div>
                  </div>
                )}
                
                {/* Points Earned */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Points Earned:</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    questionResult.points === questionResult.maxPoints 
                      ? 'text-green-600 bg-green-100' 
                      : questionResult.points > 0 
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-red-600 bg-red-100'
                  }`}>
                    {questionResult.points || 0} / {questionResult.maxPoints || 1}
                  </span>
                </div>
              </>
            ) : (
              /* Multiple Choice Question Display */
              <>
                {/* Student's Selected Answer */}
                <div>
                  <span className="text-sm font-medium text-gray-700">Student's Answer:</span>
                  {(() => {
                    // Find the selected option text from assessmentData
                    const selectedOption = assessmentData?.options?.find(opt => opt.id === questionResult.studentAnswer);
                    const selectedText = selectedOption?.text || 'No answer selected';
                    
                    return (
                      <div className={`text-sm mt-1 p-2 rounded border ${
                        questionResult.isCorrect 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        <span className="font-medium">{questionResult.studentAnswer?.toUpperCase() || 'N/A'}:</span>{' '}
                        {selectedText}
                      </div>
                    );
                  })()}
                </div>
                
                {/* Correct Answer - Only show if student was incorrect */}
                {!questionResult.isCorrect && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                    {(() => {
                      // Find the correct option text from assessmentData
                      const correctOption = assessmentData?.options?.find(opt => opt.id === questionResult.correctAnswer);
                      const correctText = correctOption?.text || 'Answer not available';
                      
                      return (
                        <div className="text-sm mt-1 p-2 rounded bg-green-50 text-green-800 border border-green-200">
                          <span className="font-medium">{questionResult.correctAnswer?.toUpperCase() || 'N/A'}:</span>{' '}
                          {correctText}
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* Points Earned */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Points Earned:</span>
                  <span className={`font-medium ${questionResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {questionResult.points || 0} / {questionResult.maxPoints || 1}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* All Answer Options - Only for Staff and Multiple Choice Questions */}
      {isStaffView && assessmentData?.options && assessmentData.options.length > 0 && !(questionResult.studentAnswer && questionResult.studentAnswer.includes('<')) && (
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">All Answer Options:</span>
            <div className="space-y-1">
              {assessmentData.options.map((option) => {
                const isCorrect = option.id === questionResult?.correctAnswer;
                const isSelected = option.id === questionResult?.studentAnswer;
                
                return (
                  <div 
                    key={option.id} 
                    className={`text-sm p-2 rounded-md border ${
                      isCorrect && isSelected
                        ? 'bg-green-50 border-green-300 text-green-800' 
                        : isCorrect
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : isSelected 
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{option.id.toUpperCase()})</span> {renderEnhancedText(option.text)}
                    {isCorrect && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-red-600 font-medium">✗ Selected</span>}
                    {isSelected && isCorrect && <span className="ml-2 text-green-600 font-medium">✓ Selected & Correct</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Session Grade Editor for Session Questions */}
      <div className="mt-3">
        {isManualOverrideMode ? (
          /* Manual Override Mode - Individual editing disabled */
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Award className="h-4 w-4" />
              <span className="text-sm">Individual question editing is disabled while manual score override is active</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm font-medium text-gray-600">
                Points: {formatScore(questionResult.points || 0)} / {questionResult.maxPoints || 1}
              </span>
            </div>
          </div>
        ) : (
          /* Normal Mode - Individual editing enabled */
          <SessionGradeEditor
            questionResult={questionResult}
            questionIndex={questionNumber - 1} // Convert to 0-based index
            sessionId={session?.sessionId}
            course={course}
            isStaffView={isStaffView}
            onGradeUpdate={(questionIndex, grade, updatedResults) => {
              // Grade update will be reflected in parent component on next data refresh
              console.log(`Session question ${questionIndex} grade updated: ${grade}`, updatedResults);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Individual Session Card Component
const SessionCard = ({ session, attemptNumber, onViewDetails, showViewButton = false, isUsedForGrade = false, gradingMethod = 'takeHighest' }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return 'N/A';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const percentage = session.finalResults?.percentage || 0;
  const score = session.finalResults?.score || 0;
  const maxScore = session.finalResults?.maxScore || 0;

  // Get styling based on whether this session is used for final grade
  const getCardStyling = () => {
    if (!isUsedForGrade || gradingMethod === 'average') {
      return {
        cardClass: "border rounded-lg p-4 bg-white hover:bg-gray-50",
        badgeClass: ""
      };
    }
    
    // Highlight the session used for final grade
    return {
      cardClass: "border-2 border-green-300 rounded-lg p-4 bg-green-25 hover:bg-green-50 shadow-sm",
      badgeClass: "bg-green-100 text-green-800 border-green-300"
    };
  };

  const styling = getCardStyling();

  return (
    <div className={styling.cardClass}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Attempt {attemptNumber}</span>
            <Badge variant="outline" className="text-xs">
              {session.status === 'completed' ? 'Completed' : session.status}
            </Badge>
            {isUsedForGrade && gradingMethod !== 'average' && (
              <Badge className={`text-xs ${styling.badgeClass}`}>
                Used for Grade
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Completed: {formatDate(session.finalResults?.completedAt)}
          </div>
          {session.createdAt && (
            <div className="text-xs text-gray-500">
              Started: {formatDate(session.createdAt)}
            </div>
          )}
        </div>
        
        <div className="text-right ml-4">
          <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(percentage)}`}>
            {formatScore(score)} / {maxScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">{formatScore(percentage)}%</div>
        </div>
      </div>

      {/* Session Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Questions:</span>
          <div className="text-gray-600">{session.finalResults?.totalQuestions || 0}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Duration:</span>
          <div className="text-gray-600">
            {session.createdAt && session.finalResults?.completedAt 
              ? formatDuration(session.finalResults.completedAt - session.createdAt)
              : 'N/A'}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Session ID:</span>
          <div className="text-gray-600 text-xs break-all">
            {session.sessionId ? session.sessionId.slice(-8) : 'N/A'}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Item ID:</span>
          <div className="text-gray-600 text-xs">
            {session.examItemId || 'N/A'}
          </div>
        </div>
      </div>

      {/* View Details Button */}
      {showViewButton && onViewDetails && (
        <div className="mt-3 pt-3 border-t">
          <Button
            onClick={onViewDetails}
            size="sm"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Question Details
          </Button>
        </div>
      )}
    </div>
  );
};

// Lesson Question Card Component (for lesson type activities)
const LessonQuestionCard = ({ questionNumber, assessmentData, questionId, isStaffView = false, course }) => {
  const getStatusIcon = () => {
    if (assessmentData.status === 'completed' && assessmentData.correctOverall) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (assessmentData.status === 'completed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (assessmentData.attempts > 0) {
      return <RotateCcw className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getScoreColor = (isCorrect) => {
    if (isCorrect) return 'text-green-700 bg-green-50 border-green-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Question {questionNumber}</span>
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {assessmentData.status === 'completed' ? 'Completed' : 
               assessmentData.attempts > 0 ? 'In Progress' : 'Not Started'}
            </Badge>
          </div>
          
          <h4 className="font-medium text-gray-900 mb-1">
            {questionId.split('_').slice(-1)[0].replace('question', 'Question ')}
          </h4>
          
          {/* Full question text for lessons */}
          <div className="text-sm text-gray-700 mb-3">
            {renderEnhancedText(assessmentData.questionText || 'No question text')}
          </div>
          
          {/* Answer options */}
          {assessmentData.options && assessmentData.options.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-sm font-medium text-gray-600">Answer Options:</div>
              {assessmentData.options.map((option) => {
                const isCorrect = assessmentData.lastSubmission?.correctOptionId === option.id;
                const isSelected = assessmentData.lastSubmission?.answer === option.id;
                
                return (
                  <div 
                    key={option.id} 
                    className={`text-sm p-2 rounded-md border ${
                      isCorrect 
                        ? 'bg-green-50 border-green-300 text-green-800' 
                        : isSelected 
                          ? 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{option.id.toUpperCase()})</span> {option.text}
                    {isCorrect && <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Submission info and feedback */}
          {assessmentData.status === 'completed' && assessmentData.lastSubmission && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
              <div className="font-medium text-gray-700 mb-1">Feedback:</div>
              <div className="text-gray-600">{assessmentData.lastSubmission.feedback}</div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Display/Editor */}
      <div className="mt-3">
        <StaffGradeEditor
          questionId={questionId}
          currentGrade={course?.Grades?.assessments?.[questionId] || 0}
          maxPoints={1}
          course={course}
          isStaffView={isStaffView}
          onGradeUpdate={(id, grade) => {
            // Grade update will be reflected in parent component on next data refresh
            console.log(`Grade updated for ${id}: ${grade}`);
          }}
        />
      </div>
    </div>
  );
};

// Individual Question Card Component
const QuestionCard = ({ question, assessmentData, questionNumber, activityType, isStaffView = false, course }) => {
  // Determine if we should show detailed information
  // Show detailed info for assignments, limited info for exams and quizzes
  const showDetailedInfo = activityType === 'assignment';
  
  // Helper to get question status based on new data structure
  const getQuestionStatus = () => {
    if (!question.attempted) {
      return 'not_started';
    } else if (question.actualGrade === question.points) {
      return 'completed_perfect';
    } else {
      return 'completed';
    }
  };

  const getStatusIcon = () => {
    const status = getQuestionStatus();
    if (status === 'completed_perfect') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    } else if (question.attempted) {
      return <RotateCcw className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getScoreColor = (score, maxScore) => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (pct >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (pct >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not attempted';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Question {questionNumber}</span>
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {getQuestionStatus().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <h4 className="font-medium text-gray-900">{question.title}</h4>
          {showDetailedInfo && assessmentData?.questionText && (
            <div className="text-sm text-gray-600 mt-1">{renderEnhancedText(assessmentData.questionText)}</div>
          )}
          {!showDetailedInfo && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Question details are not shown for {activityType}s to maintain assessment integrity
            </p>
          )}
        </div>
        
        <div className="text-right ml-4">
          {question.attempted ? (
            <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(question.actualGrade, question.points)}`}>
              {formatScore(question.actualGrade)} / {question.points}
            </div>
          ) : (
            <div className="text-sm text-gray-400 px-3 py-1 bg-gray-50 rounded border">
              Not Started
            </div>
          )}
        </div>
      </div>


      {/* Last Submission Details - Only show for assignments */}
      {showDetailedInfo && assessmentData?.lastSubmission && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Last Submission:</span>
            <span className="text-xs text-gray-500">{formatDate(assessmentData.lastSubmission.timestamp)}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            {(() => {
              // Find the actual option text for student's answer and correct answer
              const studentAnswerId = assessmentData.lastSubmission.answer;
              const correctAnswerId = assessmentData.lastSubmission.correctOptionId;
              const isCorrect = assessmentData.lastSubmission.isCorrect;
              
              // Find option texts from the available options
              const studentOption = assessmentData.options?.find(opt => opt.id === studentAnswerId);
              const correctOption = assessmentData.options?.find(opt => opt.id === correctAnswerId);
              
              const studentAnswerText = studentOption?.text || studentAnswerId;
              const correctAnswerText = correctOption?.text || correctAnswerId;
              
              if (isCorrect) {
                // If correct, only show one answer since they're the same
                return (
                  <div>
                    <span className="font-medium text-gray-600">Selected Answer:</span>
                    <div className="text-green-800 bg-green-50 p-2 rounded border border-green-200 mt-1">
                      <span className="font-medium">{studentAnswerId?.toUpperCase()}:</span> <div className="inline">{renderEnhancedText(studentAnswerText)}</div>
                    </div>
                  </div>
                );
              } else {
                // If incorrect, show both answers
                return (
                  <>
                    <div>
                      <span className="font-medium text-gray-600">Your Answer:</span>
                      <div className="text-red-800 bg-red-50 p-2 rounded border border-red-200 mt-1">
                        <span className="font-medium">{studentAnswerId?.toUpperCase()}:</span> <div className="inline">{renderEnhancedText(studentAnswerText)}</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Correct Answer:</span>
                      <div className="text-green-800 bg-green-50 p-2 rounded border border-green-200 mt-1">
                        <span className="font-medium">{correctAnswerId?.toUpperCase()}:</span> <div className="inline">{renderEnhancedText(correctAnswerText)}</div>
                      </div>
                    </div>
                  </>
                );
              }
            })()}
          </div>
          
          {assessmentData.lastSubmission.feedback && (
            <div className="mt-2">
              <span className="font-medium text-gray-600">Feedback:</span>
              <div className={`text-sm mt-1 p-2 rounded ${
                assessmentData.lastSubmission.isCorrect 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {renderEnhancedText(assessmentData.lastSubmission.feedback)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Limited info for exams and quizzes */}
      {!showDetailedInfo && question.attempted && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Submission recorded:</span> {formatDate(assessmentData?.lastSubmission?.timestamp)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Detailed answer information is not shown for {activityType}s
          </div>
        </div>
      )}

      {/* Answer Options (if available and not yet attempted) - Only show for assignments */}
      {showDetailedInfo && assessmentData?.options && !question.attempted && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-sm font-medium text-gray-700">Answer Options:</span>
          <div className="mt-2 space-y-1">
            {assessmentData.options.map((option) => (
              <div key={option.id} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-medium">{option.id.toUpperCase()}:</span>
                <div className="flex-1">{renderEnhancedText(option.text)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Grade Editor for Individual Questions */}
      {isStaffView && question.id && (
        <div className="mt-3">
          <StaffGradeEditor
            questionId={question.id}
            currentGrade={question.actualGrade || 0}
            maxPoints={question.points || 1}
            course={course}
            onGradeUpdate={(id, grade) => {
              // Grade update will be reflected in parent component on next data refresh
              console.log(`Individual question grade updated for ${id}: ${grade}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

// Lab Component Loader - Dynamically loads lab components
const LabComponentLoader = ({ lessonId, courseId, course, isStaffView = false }) => {
  const [LabComponent, setLabComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLabComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Map lessonId to the correct lab component path
        const labPathMap = {
          'lab_momentum_conservation': '07-lab-momentum-conservation',
          'lab_electrostatic': '27-lab-electrostatic',
          'lab_electric_fields': '33-lab-electric-fields',
          'lab_electromagnet': '43-lab-electromagnet',
          'lab_plancks_constant': '54-lab-plancks-constant',
          'lab_millikans_oil_drop': '56-lab-millikans-oil-drop',
          'lab_marshmallow_speed_light': '58-lab-marshmallow-speed-light',
          'lab_half_life': '68-lab-half-life',
          'lab_mirrors_lenses': '15-lab-mirrors-lenses',
          'lab_laser_wavelength': '20-lab-laser-wavelength'
        };
        
        const labPath = labPathMap[lessonId];
        
        if (!labPath) {
          throw new Error(`Lab component not found for lesson: ${lessonId}`);
        }
        
        // Dynamically import the lab component
        const module = await import(`../../courses/${courseId}/content/${labPath}/index.js`);
        setLabComponent(() => module.default);
        
      } catch (err) {
        console.error('Error loading lab component:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadLabComponent();
  }, [lessonId, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lab content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading lab: {error}</div>
      </div>
    );
  }

  if (!LabComponent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lab component not found</div>
      </div>
    );
  }

  // Render the lab component with required props
  return <LabComponent courseId={courseId} course={course} isStaffView={isStaffView} />;
};

// Grade Display/Editor Component
const StaffGradeEditor = ({ questionId, currentGrade, maxPoints, course, isStaffView = false, onGradeUpdate }) => {
  const [editedGrade, setEditedGrade] = useState(currentGrade?.toString() || '');
  const [originalGrade, setOriginalGrade] = useState(currentGrade?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  
  const database = getDatabase();
  const { user } = useAuth();

  // Update state when currentGrade prop changes
  useEffect(() => {
    const gradeStr = currentGrade?.toString() || '';
    setEditedGrade(gradeStr);
    setOriginalGrade(gradeStr);
    setHasChanges(false);
  }, [currentGrade]);

  // Handle grade input changes with validation
  const handleGradeChange = (value) => {
    // Allow empty string for clearing
    if (value === '') {
      setEditedGrade('');
      setHasChanges(originalGrade !== '');
      setError(null);
      return;
    }

    // Parse and validate the input
    const numValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    // Check bounds
    if (numValue < 0) {
      setError('Grade cannot be negative');
      return;
    }
    
    if (numValue > maxPoints) {
      setError(`Grade cannot exceed ${maxPoints} points`);
      return;
    }
    
    // Check decimal places (max 1 decimal place)
    const decimalParts = value.split('.');
    if (decimalParts.length > 2) {
      setError('Invalid decimal format');
      return;
    }
    if (decimalParts[1] && decimalParts[1].length > 1) {
      setError('Maximum 1 decimal place allowed');
      return;
    }
    
    // Clear error and update the grade
    setError(null);
    setEditedGrade(value);
    setHasChanges(value !== originalGrade);
  };

  // Save grade to Firebase
  const saveGrade = async () => {
    if (!course?.studentKey || !course?.CourseID || !questionId) {
      setError('Missing required course data');
      return;
    }

    const grade = parseFloat(editedGrade);
    if (isNaN(grade) || grade < 0 || grade > maxPoints) {
      setError('Invalid grade value');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const studentKey = course.studentKey;
      const courseId = course.CourseID;
      const timestamp = Date.now();
      
      // Save the grade
      const gradeRef = ref(database, `students/${studentKey}/courses/${courseId}/Grades/assessments/${questionId}`);
      await set(gradeRef, grade);
      
      // Update the assessment data to reflect the manual grade
      const assessmentPointsRef = ref(database, `students/${studentKey}/courses/${courseId}/Assessments/${questionId}/pointsValue`);
      await set(assessmentPointsRef, grade);
      
      // Update the assessment status to indicate manual grading
      const assessmentStatusRef = ref(database, `students/${studentKey}/courses/${courseId}/Assessments/${questionId}/status`);
      await set(assessmentStatusRef, 'manually_graded');
      
      // Add manual grading timestamp to assessment
      const manualGradingRef = ref(database, `students/${studentKey}/courses/${courseId}/Assessments/${questionId}/manuallyGradedAt`);
      await set(manualGradingRef, timestamp);
      
      // Add grader information to assessment
      const gradedByRef = ref(database, `students/${studentKey}/courses/${courseId}/Assessments/${questionId}/gradedBy`);
      await set(gradedByRef, user?.email || 'unknown_staff');
      
      // Save metadata
      const metadataRef = ref(database, `students/${studentKey}/courses/${courseId}/Grades/metadata/${questionId}`);
      const metadata = {
        currentScore: grade,
        bestScore: grade,
        previousBestScore: originalGrade ? parseFloat(originalGrade) : 0,
        pointsValue: maxPoints,
        lastGradedAt: timestamp,
        gradedBy: user?.email || 'unknown_staff',
        gradeHistory: [{
          score: grade,
          timestamp: timestamp,
          gradedBy: user?.email || 'unknown_staff',
          gradedByRole: 'staff_manual',
          sourceActivityType: 'manual_grade_entry',
          sourceAssessmentId: questionId
        }],
        gradeUpdatePolicy: 'manual_override',
        wasImprovement: !originalGrade || grade > parseFloat(originalGrade)
      };
      
      await set(metadataRef, metadata);
      
      // Update local state
      setOriginalGrade(editedGrade);
      setHasChanges(false);
      
      // Notify parent component of the update
      if (onGradeUpdate) {
        onGradeUpdate(questionId, grade);
      }
      
    } catch (err) {
      console.error('Error saving grade:', err);
      setError('Failed to save grade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Revert to original grade
  const revertGrade = () => {
    setEditedGrade(originalGrade);
    setHasChanges(false);
    setError(null);
  };

  const getScoreColor = (grade, max) => {
    if (!grade || !max) return 'border-gray-300';
    const pct = (grade / max) * 100;
    if (pct >= 90) return 'border-green-500 focus:border-green-600';
    if (pct >= 80) return 'border-blue-500 focus:border-blue-600';
    if (pct >= 70) return 'border-yellow-500 focus:border-yellow-600';
    if (pct >= 60) return 'border-orange-500 focus:border-orange-600';
    return 'border-red-500 focus:border-red-600';
  };

  if (!isStaffView) {
    // Student read-only view
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-sm font-medium text-gray-700">Grade:</span>
          <div className="flex items-center gap-2">
            <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(parseFloat(currentGrade), maxPoints)}`}>
              {formatScore(currentGrade || '0')} / {maxPoints}
            </div>
            {currentGrade && (
              <span className="text-xs text-gray-600 font-medium">
                ({formatScore((parseFloat(currentGrade) / maxPoints) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Original Grade Display */}
      {originalGrade && hasChanges && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
          Original: {originalGrade} / {maxPoints} points
        </div>
      )}
      
      {/* Grade Input */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">Grade:</span>
        <input
          type="number"
          min="0"
          max={maxPoints}
          step="0.1"
          value={editedGrade}
          onChange={(e) => handleGradeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hasChanges && !isSaving && !error) {
              saveGrade();
            }
          }}
          className={`w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center ${getScoreColor(parseFloat(editedGrade), maxPoints)}`}
          placeholder="0"
        />
        <span className="text-xs text-blue-600">
          / {maxPoints} points
        </span>
        {editedGrade && !error && (
          <span className="text-xs text-blue-700 font-medium">
            ({formatScore((parseFloat(editedGrade) / maxPoints) * 100)}%)
          </span>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-600 mb-2">{error}</div>
      )}
      
      {/* Action Buttons */}
      {hasChanges && !error && (
        <div className="flex items-center gap-2">
          <button
            onClick={saveGrade}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            {isSaving ? 'Saving...' : 'Save Grade'}
          </button>
          
          {originalGrade && (
            <button
              onClick={revertGrade}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Revert
            </button>
          )}
        </div>
      )}
      
      {/* Save Status */}
      {!hasChanges && !isSaving && originalGrade && !error && (
        <div className="flex items-center gap-1 justify-center">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-600">Grade saved</span>
        </div>
      )}
    </div>
  );
};

// Session Grade Editor Component - for session-based questions
const SessionGradeEditor = ({ 
  questionResult, 
  questionIndex, 
  sessionId, 
  course, 
  isStaffView = false, 
  onGradeUpdate 
}) => {
  // Store essential data from initial props to avoid dependency on changing course prop
  const [sessionConfig] = useState(() => ({
    studentKey: course?.studentKey,
    courseId: course?.CourseID,
    sessionId,
    questionIndex
  }));
  
  // Initialize with questionResult data if available, fallback to '0'
  const initialGrade = questionResult?.points !== undefined ? questionResult.points.toString() : '0';
  
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [editedGrade, setEditedGrade] = useState(initialGrade);
  const [originalGrade, setOriginalGrade] = useState(initialGrade);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const database = getDatabase();
  const { user } = useAuth();
  const maxPoints = questionResult?.maxPoints || 1;
  
  // Get the direct Firebase path using stored config (independent of course prop changes)
  const pointsPath = sessionConfig.studentKey && sessionConfig.courseId && sessionConfig.sessionId ? 
    `students/${sessionConfig.studentKey}/courses/${sessionConfig.courseId}/ExamSessions/${sessionConfig.sessionId}/finalResults/questionResults/${sessionConfig.questionIndex}/points` : 
    null;

  // Set up real-time listener for the grade value
  useEffect(() => {
    if (!pointsPath) {
      console.log('🔍 SessionGradeEditor: No pointsPath available', { 
        studentKey: sessionConfig.studentKey, 
        courseId: sessionConfig.courseId, 
        sessionId: sessionConfig.sessionId, 
        questionIndex: sessionConfig.questionIndex 
      });
      return;
    }
    
    console.log('🔍 SessionGradeEditor: Setting up listener for path:', pointsPath);
    
    const pointsRef = ref(database, pointsPath);
    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const points = snapshot.val();
      const gradeStr = points !== null && points !== undefined ? points.toString() : '0';
      
      console.log('🔍 SessionGradeEditor: Firebase listener received data:', {
        path: pointsPath,
        rawValue: points,
        gradeStr,
        questionIndex
      });
      
      setCurrentGrade(gradeStr);
      setEditedGrade(gradeStr);
      setOriginalGrade(gradeStr);
      setHasChanges(false);
      setIsLoading(false);
    }, (error) => {
      console.error('Error reading session grade:', error);
      setError('Failed to load grade data');
      setIsLoading(false);
    });

    return () => {
      console.log('🔍 SessionGradeEditor: Cleaning up listener for path:', pointsPath);
      unsubscribe();
    };
  }, [pointsPath, database]);

  // Handle grade input changes with validation
  const handleGradeChange = (value) => {
    // Allow empty string for clearing
    if (value === '') {
      setEditedGrade('');
      setHasChanges(originalGrade !== '');
      setError(null);
      return;
    }

    // Parse and validate the input
    const numValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    // Check bounds
    if (numValue < 0) {
      setError('Grade cannot be negative');
      return;
    }
    
    if (numValue > maxPoints) {
      setError(`Grade cannot exceed ${maxPoints} points`);
      return;
    }
    
    // Check decimal places (max 1 decimal place)
    const decimalParts = value.split('.');
    if (decimalParts.length > 2) {
      setError('Invalid decimal format');
      return;
    }
    if (decimalParts[1] && decimalParts[1].length > 1) {
      setError('Maximum 1 decimal place allowed');
      return;
    }
    
    // Clear error and update the grade
    setError(null);
    setEditedGrade(value);
    setHasChanges(value !== originalGrade);
  };


  // Save grade directly to Firebase
  const saveGrade = async () => {
    if (!pointsPath) {
      setError('Missing required session data');
      return;
    }

    const grade = parseFloat(editedGrade);
    if (isNaN(grade) || grade < 0 || grade > maxPoints) {
      setError('Invalid grade value');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      // Simple direct write to Firebase
      const pointsRef = ref(database, pointsPath);
      await set(pointsRef, grade);
      
      // Add metadata for tracking manual grading
      if (sessionConfig.studentKey && sessionConfig.courseId && sessionConfig.sessionId) {
        const timestamp = Date.now();
        const metadataUpdates = {
          [`students/${sessionConfig.studentKey}/courses/${sessionConfig.courseId}/ExamSessions/${sessionConfig.sessionId}/manuallyGradedAt`]: timestamp,
          [`students/${sessionConfig.studentKey}/courses/${sessionConfig.courseId}/ExamSessions/${sessionConfig.sessionId}/gradedBy`]: user?.email || 'unknown_staff'
        };
        
        await Promise.all(
          Object.entries(metadataUpdates).map(([path, value]) => 
            set(ref(database, path), value)
          )
        );
      }
      
      // The real-time listener will automatically update local state
      // Notify parent component of the update
      if (onGradeUpdate) {
        onGradeUpdate(questionIndex, grade);
      }
      
    } catch (err) {
      console.error('Error saving session grade:', err);
      setError('Failed to save grade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Revert to original grade
  const revertGrade = () => {
    setEditedGrade(originalGrade);
    setHasChanges(false);
    setError(null);
  };

  const getScoreColor = (grade, max) => {
    if (!grade || !max) return 'border-gray-300';
    const pct = (grade / max) * 100;
    if (pct >= 90) return 'border-green-500 focus:border-green-600';
    if (pct >= 80) return 'border-blue-500 focus:border-blue-600';
    if (pct >= 70) return 'border-yellow-500 focus:border-yellow-600';
    if (pct >= 60) return 'border-orange-500 focus:border-orange-600';
    return 'border-red-500 focus:border-red-600';
  };

  if (!isStaffView) {
    // Student read-only view
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-sm font-medium text-gray-700">Grade:</span>
          <div className="flex items-center gap-2">
            <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(parseFloat(currentGrade), maxPoints)}`}>
              {formatScore(currentGrade || '0')} / {maxPoints}
            </div>
            {currentGrade && (
              <span className="text-xs text-gray-600 font-medium">
                ({formatScore((parseFloat(currentGrade) / maxPoints) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
      {/* Original Grade Display */}
      {originalGrade && hasChanges && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
          Original: {originalGrade} / {maxPoints} points
        </div>
      )}
      
      {/* Grade Input */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">Session Grade:</span>
        <input
          type="number"
          min="0"
          max={maxPoints}
          step="0.1"
          value={editedGrade}
          onChange={(e) => handleGradeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hasChanges && !isSaving && !error) {
              saveGrade();
            }
          }}
          className={`w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-center ${getScoreColor(parseFloat(editedGrade), maxPoints)}`}
          placeholder="0"
        />
        <span className="text-xs text-purple-600">
          / {maxPoints} points
        </span>
        {editedGrade && !error && (
          <span className="text-xs text-purple-700 font-medium">
            ({formatScore((parseFloat(editedGrade) / maxPoints) * 100)}%)
          </span>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-600 mb-2">{error}</div>
      )}
      
      {/* Action Buttons */}
      {hasChanges && !error && (
        <div className="flex items-center gap-2">
          <button
            onClick={saveGrade}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            {isSaving ? 'Saving...' : 'Save Grade'}
          </button>
          
          {originalGrade && (
            <button
              onClick={revertGrade}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Revert
            </button>
          )}
        </div>
      )}
      
      {/* Save Status */}
      {!hasChanges && !isSaving && originalGrade && !error && (
        <div className="flex items-center gap-1 justify-center">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-600">Session grade saved</span>
        </div>
      )}
    </div>
  );
};

export default LessonDetailModal;