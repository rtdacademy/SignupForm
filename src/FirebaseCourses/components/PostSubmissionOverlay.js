import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, BarChart3, ArrowRight, X, Edit3, Save, MessageSquare } from 'lucide-react';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

// Import QuillEditor directly
import QuillEditor from '../../courses/CourseEditor/QuillEditor';

// Import Accordion components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

/**
 * Post-Submission Overlay Component
 * 
 * Shows a congratulatory overlay after lab submission that:
 * - Prevents students from modifying their work
 * - Allows staff members to continue interacting with the component
 * - Provides next steps and completion feedback
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether the overlay should be shown
 * @param {boolean} props.isStaffView - Whether the current user is staff
 * @param {Object} props.submissionData - Data about the submission
 * @param {string} props.submissionData.labTitle - Title of the completed lab
 * @param {number} props.submissionData.completionPercentage - Percentage completed (0-100)
 * @param {string} props.submissionData.status - Submission status ('completed', 'in-progress')
 * @param {string} props.submissionData.timestamp - Submission timestamp
 * @param {Object} props.course - Course data object for grading (staff only)
 * @param {string} props.questionId - Question ID for this assessment
 * @param {Function} props.onContinue - Callback for "Continue to Next Lesson" action
 * @param {Function} props.onViewGradebook - Callback for "View Gradebook" action
 * @param {Function} props.onClose - Callback for closing overlay (staff only)
 */
const PostSubmissionOverlay = ({
  isVisible,
  isStaffView = false,
  submissionData = {},
  course = null,
  questionId = null,
  onContinue,
  onViewGradebook,
  onClose
}) => {
  // Don't render overlay when not visible
  if (!isVisible) {
    return null;
  }

  // State for staff grading
  const [currentGrade, setCurrentGrade] = useState('');
  const [originalGrade, setOriginalGrade] = useState('');
  const [maxPoints, setMaxPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Use a ref to track if we just saved to prevent grade reset
  const justSavedRef = React.useRef(false);
  
  
  // State for teacher comments
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [teacherComment, setTeacherComment] = useState('');
  const [originalComment, setOriginalComment] = useState('');
  const [isCommentSaving, setIsCommentSaving] = useState(false);
  
  // State for teacher comment accordion
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  // Auto-open/close accordion based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY <= 50 && !isAccordionOpen) {
        // Open when at top of page
        setIsAccordionOpen(true);
      } else if (scrollY > 50 && isAccordionOpen) {
        // Close when scrolled down
        setIsAccordionOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAccordionOpen]);
  
  const database = getDatabase();
  const { user } = useAuth();

  // Helper function to resolve itemId from questionId
  const resolveItemIdFromQuestionId = (questionId, course) => {
    if (!questionId || !course) return null;
    
    // First search in course.courseDetails structure (new path)
    if (course?.courseDetails?.["course-config"]?.courseStructure?.units) {
      for (const unit of course.courseDetails["course-config"].courseStructure.units) {
        if (unit.items) {
          for (const item of unit.items) {
            if (item.questions?.[0]?.questionId === questionId) {
              return item.itemId;
            }
          }
        }
      }
    }
    
    // Then search in Gradebook itemStructure (legacy path)
    const itemStructure = course?.Gradebook?.courseConfig?.gradebook?.itemStructure;
    if (itemStructure) {
      for (const [itemId, itemConfig] of Object.entries(itemStructure)) {
        if (itemConfig?.questions?.[0]?.questionId === questionId) {
          return itemId;
        }
      }
    }
    
    // Fallback: try to extract itemId from questionId pattern
    // e.g., "course2_lab_momentum_conservation" -> "lab_momentum_conservation"
    const questionIdParts = questionId.split('_');
    if (questionIdParts.length > 1) {
      // Remove course prefix (e.g., "course2") and rejoin
      const possibleItemId = questionIdParts.slice(1).join('_');
      
      // Check if this itemId exists in either structure
      if (itemStructure && itemStructure[possibleItemId]) {
        return possibleItemId;
      }
      
      // Also check in Gradebook items
      if (course?.Gradebook?.items?.[possibleItemId]) {
        return possibleItemId;
      }
      
      return possibleItemId; // Return it anyway as last resort
    }
    
    return null;
  };

  // Extract grading data and set initial grade
  useEffect(() => {
    if (course && questionId) {
      // Resolve itemId first
      const itemId = resolveItemIdFromQuestionId(questionId, course);
      
      // Get max points - try multiple sources
      let points = 0;
      
      // First try: course.courseDetails structure (preferred)
      if (course?.courseDetails?.["course-config"]?.courseStructure?.units) {
        for (const unit of course.courseDetails["course-config"].courseStructure.units) {
          if (unit.items) {
            const foundItem = unit.items.find(item => 
              item.questions?.[0]?.questionId === questionId
            );
            if (foundItem?.questions?.[0]?.points) {
              points = foundItem.questions[0].points;
              break;
            }
          }
        }
      }
      
      // Second try: Gradebook itemStructure (legacy)
      if (!points && itemId) {
        const itemStructure = course?.Gradebook?.courseConfig?.gradebook?.itemStructure;
        if (itemStructure?.[itemId]?.questions?.[0]?.points) {
          points = itemStructure[itemId].questions[0].points;
        }
      }
      
      // Third try: Gradebook items total
      if (!points && itemId && course?.Gradebook?.items?.[itemId]?.total) {
        points = course.Gradebook.items[itemId].total;
      }
      
      if (points > 0) {
        setMaxPoints(points);
      }

      // Set initial grade - check multiple sources in priority order
      let existingGrade = null;
      
      // First priority: Check Gradebook/items path for existing score
      if (itemId && course?.Gradebook?.items?.[itemId]?.score !== undefined) {
        existingGrade = course.Gradebook.items[itemId].score;
      }
      
      // Second priority: Check Grades/assessments path
      if (existingGrade === null || existingGrade === undefined) {
        existingGrade = course.Grades?.assessments?.[questionId];
      }
      
      // Set the grade if found
      // Skip updating if we just saved (prevents flickering)
      if (justSavedRef.current) {
        console.log('⏭️ Skipping grade update - just saved');
        justSavedRef.current = false; // Reset flag
        return;
      }

      if (existingGrade !== undefined && existingGrade !== null) {
        const gradeStr = existingGrade.toString();
        setCurrentGrade(gradeStr);
        setOriginalGrade(gradeStr);
      } else {
        // Only reset if we're not currently editing
        if (!hasChanges) {
          setCurrentGrade('');
          setOriginalGrade('');
        }
      }
    }
  }, [course, questionId, hasChanges]);


  // Load teacher comment from course object or Firebase
  useEffect(() => {
    if (!course?.CourseID || !questionId) return;
    
    // First, check if comments are already available in the course object
    // This matches the structure we fixed in CollapsibleNavigation
    if (course?.TeacherComments) {
      const commentData = course.TeacherComments[questionId]?.lab_review;
      if (commentData?.content && commentData.content.trim()) {
        console.log('📄 Found teacher comment in course object:', commentData);
        setTeacherComment(commentData.content);
        setOriginalComment(commentData.content);
        return; // Found in course object, no need to check Firebase
      }
    }
    
    // If not found in course object, fall back to Firebase database loading
    // For teacher view, we need to get the student key from teacherViewStudent
    // For student view, we can use the logged-in user's email
    let studentIdentifier = null;
    let commentPath = null;
    
    if (isStaffView && course?.studentKey) {
      // Teacher viewing student's work - use course.studentKey
      studentIdentifier = course.studentKey;
      commentPath = `students/${studentIdentifier}/courses/${course.CourseID}/TeacherComments/${questionId}/lab_review`;
      console.log('📄 Teacher view - loading comment from Firebase:', commentPath);
    } else if (!isStaffView && user?.email) {
      // Student viewing their own work - check Firebase database paths
      const emailKey = user.email.replace(/[.#$[\]]/g, '_');
      
      // Based on your data structure, the correct path should be:
      // students/{emailKey}/courses/{courseId}/TeacherComments/{questionId}/lab_review
      const studentCommentPath = `students/${emailKey}/courses/${course.CourseID}/TeacherComments/${questionId}/lab_review`;
      
      console.log('📄 Student view - loading comment from Firebase path:', studentCommentPath);
      
      const studentCommentRef = ref(database, studentCommentPath);
      
      const unsubscribe = onValue(studentCommentRef, (snapshot) => {
        const data = snapshot.val();
        console.log('📄 Firebase snapshot data:', data);
        if (data?.content && data.content.trim()) {
          console.log('📄 Found comment in student Firebase path:', data);
          setTeacherComment(data.content);
          setOriginalComment(data.content);
        } else {
          console.log('📄 No comment content found or content is empty');
          setTeacherComment('');
          setOriginalComment('');
        }
      }, (error) => {
        console.error('📄 Error loading teacher comment:', error);
      });

      return () => {
        off(studentCommentRef, 'value', unsubscribe);
      };
    }
    
    if (commentPath && studentIdentifier) {
      console.log('📄 Loading teacher comment from Firebase:', commentPath);
      const commentRef = ref(database, commentPath);
      
      const unsubscribe = onValue(commentRef, (snapshot) => {
        const data = snapshot.val();
        if (data?.content) {
          console.log('📄 Found comment in Firebase:', data);
          setTeacherComment(data.content);
          setOriginalComment(data.content);
        }
      });

      return () => off(commentRef, 'value', unsubscribe);
    }
  }, [course, questionId, database, isStaffView, user]);

  // Save grade to database with metadata
  const saveGrade = async () => {
    console.log('💾 saveGrade called:', {
      isStaffView,
      hasCourse: !!course,
      questionId,
      currentGrade,
      originalGrade,
      hasChanges,
      isSaving,
      maxPoints
    });

    if (!isStaffView) {
      console.log('❌ Not staff view, cannot save');
      return;
    }
    if (!course) {
      console.log('❌ No course object');
      return;
    }
    if (!questionId) {
      console.log('❌ No questionId');
      return;
    }
    if (!currentGrade) {
      console.log('❌ No currentGrade');
      return;
    }

    const grade = parseFloat(currentGrade);
    if (isNaN(grade)) {
      console.log('❌ Grade is not a number:', currentGrade);
      return;
    }
    if (grade < 0 || grade > maxPoints) {
      console.log('❌ Grade out of bounds:', { grade, maxPoints });
      return;
    }

    console.log('🚀 Starting save process:', { grade, questionId });
    setIsSaving(true);
    
    try {
      const studentKey = course.studentKey;
      const courseId = course.CourseID;
      const timestamp = Date.now();
      
      if (!studentKey) {
        console.log('❌ No studentKey in course object');
        throw new Error('Cannot determine student key for grade save');
      }
      
      console.log('📍 Save details:', {
        studentKey,
        courseId,
        questionId,
        grade,
        path: `students/${studentKey}/courses/${courseId}/Grades/assessments/${questionId}`
      });
      
      // Save the grade
      const gradeRef = ref(database, `students/${studentKey}/courses/${courseId}/Grades/assessments/${questionId}`);
      console.log('💾 About to save grade to Firebase...');
      await set(gradeRef, grade);
      console.log('✅ Grade saved to Firebase successfully');
      
      // Save metadata
      const metadataRef = ref(database, `students/${studentKey}/courses/${courseId}/Grades/metadata/${questionId}`);
      const metadata = {
        currentScore: grade,
        bestScore: grade,
        previousBestScore: originalGrade ? parseFloat(originalGrade) : 0,
        pointsValue: maxPoints,
        lastGradedAt: timestamp,
        gradedBy: user?.email || 'unknown_staff',
        gradeHistory: [
          {
            score: grade,
            timestamp: timestamp,
            gradedBy: user?.email || 'unknown_staff',
            gradedByRole: 'staff_manual',
            sourceActivityType: 'lab_submission',
            sourceAssessmentId: questionId
          }
        ],
        gradeUpdatePolicy: 'manual_override',
        wasImprovement: !originalGrade || grade > parseFloat(originalGrade)
      };
      
      await set(metadataRef, metadata);
      
      console.log('✅ Grade and metadata saved successfully:', { questionId, grade, studentKey, courseId });

      // Update local state after successful save
      console.log('🔄 Updating local state:', {
        oldOriginalGrade: originalGrade,
        newOriginalGrade: currentGrade,
        oldHasChanges: hasChanges,
        newHasChanges: false
      });

      // Set flag to prevent grade reset when course data updates
      justSavedRef.current = true;

      setOriginalGrade(currentGrade);
      setHasChanges(false);
      
      console.log('✅ Local state updated - ready for next grade change');
      
    } catch (error) {
      console.error('❌ Error saving grade:', error);
    } finally {
      console.log('🏁 Setting isSaving to false');
      setIsSaving(false);
    }
  };

  // Handle grade input changes with validation
  const handleGradeChange = (value) => {
    console.log('🎯 handleGradeChange called:', {
      newValue: value,
      currentGrade,
      originalGrade,
      hasChanges,
      maxPoints
    });

    // Allow empty string for clearing
    if (value === '') {
      console.log('📝 Clearing grade input');
      setCurrentGrade('');
      setHasChanges(originalGrade !== '');
      return;
    }

    // Parse and validate the input
    const numValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      console.log('❌ Invalid number:', value);
      return;
    }
    
    // Check bounds
    if (numValue < 0 || numValue > maxPoints) {
      console.log('❌ Value out of bounds:', { numValue, maxPoints });
      return;
    }
    
    // Check decimal places (max 1 decimal place)
    const decimalParts = value.split('.');
    if (decimalParts.length > 2) {
      console.log('❌ Too many decimal points');
      return;
    }
    if (decimalParts[1] && decimalParts[1].length > 1) {
      console.log('❌ Too many decimal places');
      return;
    }
    
    // Update the grade
    const newHasChanges = value !== originalGrade;
    console.log('✅ Setting new grade:', {
      newValue: value,
      originalGrade,
      newHasChanges
    });
    
    setCurrentGrade(value);
    setHasChanges(newHasChanges);
  };

  // Revert to original grade
  const revertGrade = () => {
    setCurrentGrade(originalGrade);
    setHasChanges(false);
  };

  // Save teacher comment to Firebase
  const saveTeacherComment = async () => {
    if (!isStaffView || !course?.studentKey || !course?.CourseID || !questionId) return;

    setIsCommentSaving(true);
    try {
      const commentPath = `students/${course.studentKey}/courses/${course.CourseID}/TeacherComments/${questionId}/lab_review`;
      const timestamp = Date.now();
      
      const commentData = {
        content: teacherComment,
        lastModified: timestamp,
        teacherEmail: user?.email || 'unknown_staff',
        context: 'Lab Review Comment',
        version: 1
      };

      await set(ref(database, commentPath), commentData);
      setOriginalComment(teacherComment);
      console.log('✅ Teacher comment saved successfully');
    } catch (error) {
      console.error('❌ Error saving teacher comment:', error);
    } finally {
      setIsCommentSaving(false);
    }
  };

  // Handle comment content change
  const handleCommentChange = (content) => {
    console.log('Comment content changed:', content);
    setTeacherComment(content);
  };

  // Handle save and close from QuillEditor
  const handleCommentSaveAndClose = async (contentToSave = null) => {
    // Use the passed content or fall back to current state (now properly tracked via onContentChange)
    const content = contentToSave || teacherComment;
    console.log('💾 Attempting to save and close with content:', content);
    
    // Update the state first
    setTeacherComment(content);
    
    // Then save to Firebase
    if (!isStaffView || !course?.CourseID || !questionId) {
      console.log('❌ Missing required data for save:', { isStaffView, courseId: course?.CourseID, questionId });
      return;
    }

    // Use course.studentKey directly
    if (!course?.studentKey) {
      console.log('❌ No student key found in course object. Available data:', {
        courseKeys: course ? Object.keys(course) : 'course is null',
        studentKey: course?.studentKey
      });
      return;
    }
    
    const commentPath = `students/${course.studentKey}/courses/${course.CourseID}/TeacherComments/${questionId}/lab_review`;
    console.log('📍 Using course.studentKey:', course.studentKey, 'for path:', commentPath);

    setIsCommentSaving(true);
    try {
      const timestamp = Date.now();
      
      const commentData = {
        content: content,
        lastModified: timestamp,
        teacherEmail: user?.email || 'unknown_staff',
        context: 'Lab Review Comment',
        version: 1
      };

      console.log('💾 Saving to path:', commentPath, 'with data:', commentData);
      await set(ref(database, commentPath), commentData);
      setOriginalComment(content);
      console.log('✅ Teacher comment saved and closing modal');
      
      // Close the modal after successful save
      setShowCommentModal(false);
    } catch (error) {
      console.error('❌ Error saving teacher comment:', error);
    } finally {
      setIsCommentSaving(false);
    }
  };


  const {
    labTitle = 'Lab Assignment',
    completionPercentage = 100,
    status = 'completed',
    timestamp
  } = submissionData;

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Get completion message based on percentage
  const getCompletionMessage = (percentage) => {
    if (percentage >= 100) {
      return "Excellent work! You've completed this lab assignment.";
    } else if (percentage >= 80) {
      return "Great job! You've successfully submitted your lab work.";
    } else {
      return "Lab submitted! Your work has been saved for review.";
    }
  };

  // Get completion color based on percentage
  const getCompletionColor = (percentage) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <>
      {/* Notification badge in top-right corner */}
      <div className="fixed top-16 right-4 z-[9999] pointer-events-auto">
        <div className={`${isStaffView ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'} border rounded-lg p-3 shadow-lg pointer-events-auto ${
          !isStaffView && teacherComment?.trim() 
            ? 'min-w-96 max-w-2xl' 
            : 'min-w-64'
        }`}>
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${isStaffView ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isStaffView ? 'text-blue-800' : 'text-gray-800'}`}>
                  {isStaffView ? 'Final Grade' : (currentGrade && maxPoints > 0 ? 'Lab Graded' : 'Lab Submitted')}
                </span>
              </div>
              
              {/* Comment button - only show for staff */}
              {isStaffView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('💬 Comment button clicked, teacherComment:', teacherComment);
                    setShowCommentModal(true);
                  }}
                  className={`staff-only relative p-1.5 rounded-md transition-all duration-200 cursor-pointer pointer-events-auto z-[10000] ${
                    teacherComment?.trim()
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  title="Add/Edit teacher comment"
                >
                  <MessageSquare className="w-3 h-3" />
                </button>
              )}
            </div>


            {/* Grading Interface */}
            {maxPoints > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                {isStaffView ? (
                  /* Staff Grading Interface */
                  <>
                    {/* Original Grade Display */}
                    {originalGrade && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        Original: {originalGrade} / {maxPoints} points
                      </div>
                    )}
                    
                    {/* Grade Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={maxPoints}
                        step="0.1"
                        value={currentGrade}
                        onChange={(e) => handleGradeChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && hasChanges && !isSaving) {
                            saveGrade();
                          }
                        }}
                        className="staff-only w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
                        placeholder="0"
                      />
                      <span className="text-xs text-blue-600">
                        / {maxPoints} points
                      </span>
                      {currentGrade && (
                        <span className="text-xs text-blue-700 font-medium">
                          ({Math.round((parseFloat(currentGrade) / maxPoints) * 100)}%)
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {hasChanges && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveGrade}
                          disabled={isSaving}
                          className="staff-only flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="w-3 h-3" />
                          {isSaving ? 'Saving...' : 'Save Grade'}
                        </button>

                        {originalGrade && (
                          <button
                            onClick={revertGrade}
                            className="staff-only flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            Revert
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Save Status */}
                    {!hasChanges && !isSaving && originalGrade && (
                      <div className="flex items-center gap-1 justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Grade saved</span>
                      </div>
                    )}
                  </>
                ) : (
                  /* Student Grade Display */
                  <div className="text-center">
                    {currentGrade && parseFloat(currentGrade) > 0 ? (
                      <>
                        <div className="text-2xl font-bold text-gray-800">
                          {currentGrade} / {maxPoints}
                        </div>
                        <div className="text-lg font-semibold text-blue-600">
                          {Math.round((parseFloat(currentGrade) / maxPoints) * 100)}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round((parseFloat(currentGrade) / maxPoints) * 100) >= 80 ? 'Great work!' : 
                           Math.round((parseFloat(currentGrade) / maxPoints) * 100) >= 60 ? 'Good effort!' : 
                           'Keep improving!'}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Lab submitted - awaiting grade
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        
        {/* Teacher Comment Accordion - Below Badge */}
        {!isStaffView && teacherComment?.trim() && (
          <div className="mt-3">
            <Accordion 
              type="single" 
              value={isAccordionOpen ? "comment" : ""} 
              className="w-full"
            >
              <AccordionItem value="comment" className="border-0 bg-blue-50 rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-blue-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Teacher Feedback</span>
                    <span className="text-xs text-blue-600 ml-auto">(Auto-opens at top)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4">
                    <div 
                      className="prose prose-sm max-w-none p-4 bg-white rounded-lg border border-blue-200 max-h-80 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: teacherComment }}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>


      {/* Teacher Comment Modal */}
      {showCommentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 teacher-comment-modal"
          style={{ pointerEvents: 'auto' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            /* Ensure all modal content remains interactive */
            .teacher-comment-modal * {
              pointer-events: auto !important;
              opacity: 1 !important;
            }

            .teacher-comment-modal input,
            .teacher-comment-modal button,
            .teacher-comment-modal select,
            .teacher-comment-modal textarea,
            .teacher-comment-modal .ql-toolbar button,
            .teacher-comment-modal .ql-toolbar .ql-picker,
            .teacher-comment-modal .ql-container {
              pointer-events: auto !important;
              opacity: 1 !important;
              cursor: pointer !important;
            }

            /* Fix cursor for Quill toolbar buttons and pickers */
            .teacher-comment-modal .ql-toolbar button,
            .teacher-comment-modal .ql-toolbar .ql-picker-label,
            .teacher-comment-modal .ql-toolbar .ql-picker-options {
              cursor: pointer !important;
            }

            .teacher-comment-modal .ql-toolbar button:hover {
              background-color: #e5e7eb !important;
              cursor: pointer !important;
            }

            .teacher-comment-modal .ql-toolbar button.ql-active {
              background-color: #dbeafe !important;
              cursor: pointer !important;
            }

            /* Ensure dropdowns and all interactive elements show pointer cursor */
            .teacher-comment-modal .ql-picker:hover,
            .teacher-comment-modal .ql-picker-label:hover,
            .teacher-comment-modal .ql-formats button:hover {
              cursor: pointer !important;
            }
          `}} />
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden" style={{ pointerEvents: 'auto' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isStaffView ? 'Add Teacher Comment' : 'Teacher Comment'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isStaffView 
                      ? 'Provide feedback and comments for this lab submission'
                      : 'Feedback and comments from your teacher'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowCommentModal(false)}
                className="staff-only p-2 hover:bg-gray-200 rounded-full transition-colors pointer-events-auto"
                style={{ pointerEvents: 'auto' }}
                title="Close comment modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-160px)]">
              {isStaffView ? (
                /* Staff Comment Editor */
                <div className="space-y-4">
                  <QuillEditor
                    courseId={course?.CourseID}
                    unitId="teacher_comments"
                    itemId={`${questionId}_lab_review`}
                    initialContent={teacherComment}
                    onSave={handleCommentChange}
                    onContentChange={handleCommentChange}
                    onError={(error) => console.error('Quill error:', error)}
                    fixedHeight="300px"
                    hideSaveButton={true}
                  />
                  
               
                </div>
              ) : (
                /* Student Comment Display */
                <div>
                  {teacherComment?.trim() ? (
                    <div 
                      className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]"
                      dangerouslySetInnerHTML={{ __html: teacherComment }}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No teacher comments yet</p>
                      <p className="text-sm">Your teacher hasn't added any feedback for this lab.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {isStaffView ? (
                  <span>Use "Save & Close" to save comments, or × to discard changes</span>
                ) : (
                  'This feedback was provided by your teacher'
                )}
              </div>
              
              <button
                onClick={isStaffView ? () => {
                  console.log('🔘 Save & Close button clicked');
                  handleCommentSaveAndClose();
                } : () => setShowCommentModal(false)}
                disabled={isCommentSaving}
                className={`staff-only px-4 py-2 text-white rounded-md transition-colors pointer-events-auto ${
                  isStaffView
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                {isStaffView ? (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    {isCommentSaving ? 'Saving...' : 'Save & Close'}
                  </>
                ) : (
                  'Close'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostSubmissionOverlay;