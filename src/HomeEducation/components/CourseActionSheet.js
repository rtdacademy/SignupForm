import React, { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../../components/ui/sheet';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  CheckCircle2,
  Circle,
  FileText,
  GraduationCap,
  Trash2,
  Info,
  Loader2,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { updateCourseStatus, validateFinalMark, getCourseMetadata } from '../../utils/courseManagementUtils';
import PasiActionButtons from '../../components/PasiActionButtons';

/**
 * Sheet component for managing course status and PASI registration
 * @param {boolean} open - Whether the sheet is open
 * @param {function} onOpenChange - Callback when sheet open state changes
 * @param {Object} course - The course object
 * @param {string} studentName - The name of the student
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} asn - The student's ASN (Alberta Student Number)
 * @param {Object} initialStatus - Pre-loaded status from courseStatusSummary
 * @param {boolean} isRegistrarMode - Skip confirmation dialogs for registrar actions
 * @param {string} highlightAccordion - Accordion ID to highlight (e.g., 'step2')
 * @param {function} onRemoveCourse - Callback to remove the course
 * @param {function} onStatusUpdate - Callback after status is updated
 */
const CourseActionSheet = ({
  open,
  onOpenChange,
  course,
  studentName,
  familyId,
  schoolYear,
  studentId,
  asn,
  initialStatus,
  isRegistrarMode = false,
  highlightAccordion = null,
  onRemoveCourse,
  onStatusUpdate,
}) => {
  const [status, setStatus] = useState({
    committed: false,
    needsPasiRegistration: false,
    pasiRegistrationComment: '',
    registrarConfirmedRegistration: false,
    finalMark: '',
    registrarComment: '',
    registrarConfirmedMark: false,
    courseCodeVerified: false, // For Other Courses only
  });
  const [loading, setLoading] = useState(false);
  const [markError, setMarkError] = useState('');
  const [openAccordions, setOpenAccordions] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRegistrarChange, setPendingRegistrarChange] = useState(null);

  // Local state for text inputs before saving
  const [localFinalMark, setLocalFinalMark] = useState('');
  const [localPasiRegistrationComment, setLocalPasiRegistrationComment] = useState('');
  const [localRegistrarComment, setLocalRegistrarComment] = useState('');

  // Debug: Component mount
  useEffect(() => {
    console.log('🎬 CourseActionSheet component mounted');
    return () => {
      console.log('🎬 CourseActionSheet component unmounted');
    };
  }, []);

  // Extract course metadata once for inclusion in all status updates
  const courseMetadata = useMemo(() => getCourseMetadata(course), [course]);

  // Load course status from initialStatus prop when sheet opens
  useEffect(() => {
    console.log('=== INITIALIZE COURSE STATUS ===');
    console.log('Open:', open);
    console.log('Initial status:', initialStatus);

    // Only initialize when sheet opens and initialStatus is available
    if (!open || !initialStatus) {
      console.log('⏸️ Sheet closed or no initial status, skipping initialization');
      return;
    }

    console.log('✅ Initializing from prop...');

    const finalMarkValue = initialStatus.finalMark !== null && initialStatus.finalMark !== undefined
      ? String(initialStatus.finalMark)
      : '';
    const pasiRegistrationCommentValue = initialStatus.pasiRegistrationComment || '';
    const registrarCommentValue = initialStatus.registrarComment || '';

    const newStatus = {
      committed: initialStatus.committed || false,
      needsPasiRegistration: initialStatus.needsPasiRegistration || false,
      pasiRegistrationComment: pasiRegistrationCommentValue,
      registrarConfirmedRegistration: initialStatus.registrarConfirmedRegistration || false,
      finalMark: finalMarkValue,
      registrarComment: registrarCommentValue,
      registrarConfirmedMark: initialStatus.registrarConfirmedMark || false,
      courseCodeVerified: initialStatus.courseCodeVerified || false,
    };

    console.log('💾 Setting status state to:', newStatus);
    setStatus(newStatus);

    // Initialize local state for text inputs
    setLocalFinalMark(finalMarkValue);
    setLocalPasiRegistrationComment(pasiRegistrationCommentValue);
    setLocalRegistrarComment(registrarCommentValue);

    // Auto-open accordions that are not in their final state
    const accordionsToOpen = [];

    // Step 1 stays open until committed
    if (!initialStatus.committed) {
      accordionsToOpen.push('step1');
    }

    // Step 2 stays open until either not requested OR confirmed as registered
    if (initialStatus.committed && !initialStatus.registrarConfirmedRegistration) {
      accordionsToOpen.push('step2');
    }

    // Step 3 stays open until mark is submitted and confirmed
    if (initialStatus.committed && !initialStatus.registrarConfirmedMark) {
      accordionsToOpen.push('step3');
    }

    console.log('📂 Setting open accordions:', accordionsToOpen);
    setOpenAccordions(accordionsToOpen);
    console.log('=== INITIALIZATION COMPLETE ===');
  }, [open, initialStatus]);

  // Auto-save function for immediate updates (checkboxes)
  // Uses fire-and-forget pattern for instant UI response
  const autoSaveStatus = (updates) => {
    // Don't await - fire and forget for instant UI
    updateCourseStatus(familyId, schoolYear, studentId, course.id, updates)
      .then(() => {
        // Notify parent component after successful save
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      })
      .catch((error) => {
        console.error('Error saving course status:', error);
        // Optionally revert UI state on error
        alert('Failed to save course status. Please try again.');
      });
  };

  // Save final mark to database
  const saveFinalMark = async () => {
    const trimmedMark = localFinalMark.trim();

    // Validate mark if provided
    if (trimmedMark !== '' && !validateFinalMark(trimmedMark)) {
      setMarkError('Mark must be between 0 and 100');
      return;
    }

    setMarkError('');

    // If mark is cleared, also clear the registrar confirmation
    const newStatus = {
      ...status,
      ...courseMetadata,
      finalMark: trimmedMark !== '' ? trimmedMark : null,
      registrarConfirmedMark: trimmedMark === '' ? false : status.registrarConfirmedMark
    };
    setStatus(newStatus);

    await autoSaveStatus({
      ...newStatus,
      finalMark: trimmedMark !== '' ? Number(trimmedMark) : null,
    });
  };

  // Clear the mark and reset confirmation
  const handleClearMark = async () => {
    setLocalFinalMark('');
    const newStatus = {
      ...status,
      ...courseMetadata,
      finalMark: null,
      registrarConfirmedMark: false
    };
    setStatus(newStatus);
    await autoSaveStatus({
      ...newStatus,
      finalMark: null,
    });
  };

  // Save PASI registration comment to database
  const savePasiRegistrationComment = async () => {
    const newStatus = { ...status, ...courseMetadata, pasiRegistrationComment: localPasiRegistrationComment };
    setStatus(newStatus);
    // Ensure finalMark is properly converted for database (number or null, not string)
    await autoSaveStatus({
      ...newStatus,
      finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
    });
  };

  // Save registrar comment to database
  const saveRegistrarComment = async () => {
    const newStatus = { ...status, ...courseMetadata, registrarComment: localRegistrarComment };
    setStatus(newStatus);
    // Ensure finalMark is properly converted for database (number or null, not string)
    await autoSaveStatus({
      ...newStatus,
      finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
    });
  };

  const handleMarkChange = (value) => {
    setLocalFinalMark(value);
    setMarkError('');
  };

  const handleMarkKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger onBlur which will save
    }
  };

  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.target.blur(); // Trigger onBlur which will save
    }
  };

  // Handle registrar checkbox changes with confirmation
  const handleRegistrarCheckboxChange = (field, newValue, message) => {
    // Validate prerequisites when checking (not when unchecking)
    if (newValue) {
      if (field === 'registrarConfirmedRegistration' && !status.needsPasiRegistration) {
        alert('Cannot confirm PASI registration unless "Request PASI Registration" is checked first.');
        return;
      }
      if (field === 'registrarConfirmedMark') {
        // Validate all prerequisites for final confirmation
        if (!status.committed) {
          alert('Cannot confirm mark submission: Student must be committed to the course first.');
          return;
        }
        if (!status.finalMark || status.finalMark === '') {
          alert('Cannot confirm mark submission: A final mark must be entered first.');
          return;
        }
      }
    }

    // Skip confirmation dialog in registrar mode - apply changes directly
    if (isRegistrarMode) {
      let newStatus = {
        ...status,
        ...courseMetadata,
        [field]: newValue
      };

      // If confirming mark submission, also confirm registration (mark can't be in PASI without student being registered)
      if (field === 'registrarConfirmedMark' && newValue === true) {
        newStatus.registrarConfirmedRegistration = true;
      }

      setStatus(newStatus);
      autoSaveStatus({
        ...newStatus,
        finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
      });
    } else {
      // Show confirmation dialog for non-registrar mode
      setPendingRegistrarChange({ field, newValue, message });
      setConfirmDialogOpen(true);
    }
  };

  const confirmRegistrarChange = () => {
    if (pendingRegistrarChange) {
      let newStatus = {
        ...status,
        ...courseMetadata,
        [pendingRegistrarChange.field]: pendingRegistrarChange.newValue
      };

      // If confirming mark submission, also confirm registration (mark can't be in PASI without student being registered)
      if (pendingRegistrarChange.field === 'registrarConfirmedMark' && pendingRegistrarChange.newValue === true) {
        newStatus.registrarConfirmedRegistration = true;
      }

      setStatus(newStatus);
      autoSaveStatus({
        ...newStatus,
        finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
      });
    }
    setConfirmDialogOpen(false);
    setPendingRegistrarChange(null);
  };

  const cancelRegistrarChange = () => {
    setConfirmDialogOpen(false);
    setPendingRegistrarChange(null);
  };

  if (!course) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Course Registration</SheetTitle>
          <SheetDescription>
            <strong>{studentName}</strong>
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-4 py-6">
            {/* Course Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {!course.isAlbertaCourse && course.courseCode && (
                      <p><strong>Course Code:</strong> {course.courseCode}</p>
                    )}
                    {course.isAlbertaCourse && course.code && course.code !== 'N/A' && (
                      <p><strong>Course Code:</strong> {course.code}</p>
                    )}
                    {!course.isAlbertaCourse && course.courseName && (
                      <p><strong>Course Name:</strong> {course.courseName}</p>
                    )}
                    {course.credits && (
                      <p><strong>Credits:</strong> {course.credits}</p>
                    )}
                    {course.grade && (
                      <p><strong>Grade Level:</strong> {course.grade}</p>
                    )}
                    {course.description && (
                      <p className="mt-2 text-xs">{course.description}</p>
                    )}
                  </div>
                </div>
                {course.isAlbertaCourse ? (
                  <Badge className="bg-purple-600 text-white">Alberta Course</Badge>
                ) : (
                  <Badge className="bg-gray-600 text-white">Other Course</Badge>
                )}
              </div>
            </div>

            {/* Sequential Workflow Accordions */}
            <Accordion
              type="multiple"
              value={openAccordions}
              onValueChange={setOpenAccordions}
              className="space-y-3"
            >
              {/* Step 1: Course Commitment */}
              <AccordionItem value="step1" className="mb-2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {status.committed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          1
                        </div>
                      )}
                      <div className="text-left">
                        <div className="font-semibold">Course Commitment</div>
                        <div className="text-xs text-gray-500 font-normal">Confirm student is committed to this course</div>
                      </div>
                    </div>
                    {status.committed && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">Committed</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-6 pb-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="committed"
                        checked={status.committed}
                        onCheckedChange={(checked) => {
                          const newStatus = { ...status, ...courseMetadata, committed: checked };
                          setStatus(newStatus);
                          autoSaveStatus({
                            ...newStatus,
                            finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
                          });
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor="committed" className="font-medium cursor-pointer">
                          Student is committed to this course
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Distinguishes serious intent from exploratory course selection
                        </p>
                      </div>
                    </div>

                    {/* Course Code Verification - Only for Other Courses */}
                    {!course.isAlbertaCourse && (
                      <div className="border-t pt-3 mt-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Course Information (Parent Provided)</p>
                          <div className="space-y-1 text-xs text-blue-800">
                            {course.courseCode && <p><strong>Course Code:</strong> {course.courseCode}</p>}
                            {course.courseName && <p><strong>Course Name:</strong> {course.courseName}</p>}
                          </div>
                          <a
                            href="https://curriculum.learnalberta.ca/hs-courses/en/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View Alberta Approved Courses →
                          </a>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="courseCodeVerified"
                            checked={status.courseCodeVerified}
                            onCheckedChange={(checked) => {
                              const newStatus = { ...status, ...courseMetadata, courseCodeVerified: checked };
                              setStatus(newStatus);
                              autoSaveStatus({
                                ...newStatus,
                                finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
                              });
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor="courseCodeVerified" className="font-medium cursor-pointer">
                              Course code verified as correct
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Confirm this course code matches an approved Alberta course
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Step 2: Early PASI Registration (Optional) */}
              {status.committed && (
                <AccordionItem
                  value="step2"
                  className={`mb-2 ${highlightAccordion === 'step2' ? 'bg-blue-50 border-2 border-blue-300 rounded-lg' : ''}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {status.registrarConfirmedRegistration ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : status.needsPasiRegistration ? (
                          <UserCheck className="w-5 h-5 text-orange-500" />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            2
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-semibold">PASI Registration</div>
                          <div className="text-xs text-gray-500 font-normal">
                            Optional - for transcript purposes
                          </div>
                        </div>
                      </div>
                      {status.registrarConfirmedRegistration && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Registered
                        </Badge>
                      )}
                      {status.needsPasiRegistration && !status.registrarConfirmedRegistration && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          Pending Registrar
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-4 space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="needsPasiRegistration"
                          checked={status.needsPasiRegistration}
                          onCheckedChange={(checked) => {
                            const newStatus = { ...status, ...courseMetadata, needsPasiRegistration: checked };
                            setStatus(newStatus);
                            autoSaveStatus({
                              ...newStatus,
                              finalMark: newStatus.finalMark && newStatus.finalMark !== '' ? Number(newStatus.finalMark) : null,
                            });
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor="needsPasiRegistration" className="font-medium cursor-pointer">
                            Request PASI Registration
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">
                            For students needing course on transcript early (e.g., university applications)
                          </p>
                        </div>
                      </div>

                      {/* PASI Registration Comment */}
                      <div>
                        <Label htmlFor="pasiRegistrationComment">Comment (Optional)</Label>
                        <Textarea
                          id="pasiRegistrationComment"
                          value={localPasiRegistrationComment}
                          onChange={(e) => setLocalPasiRegistrationComment(e.target.value)}
                          onBlur={savePasiRegistrationComment}
                          onKeyDown={handleCommentKeyPress}
                          placeholder="Add any notes or context for PASI registration..."
                          rows={3}
                        />
                      </div>

                      <div className="border-t pt-3 mt-3 bg-amber-50 -mx-6 px-6 -mb-4 pb-4 rounded-b-lg">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="registrarConfirmedRegistration"
                            checked={status.registrarConfirmedRegistration}
                            onCheckedChange={(checked) =>
                              handleRegistrarCheckboxChange(
                                'registrarConfirmedRegistration',
                                checked,
                                checked
                                  ? 'Confirm that student has been registered in PASI?'
                                  : 'Remove confirmation that student was registered in PASI?'
                              )
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor="registrarConfirmedRegistration" className="font-medium cursor-pointer">
                              Student registered in PASI
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Registrar confirms student has been added to PASI
                            </p>
                          </div>
                        </div>

                        {/* PASI Action Buttons */}
                        {asn && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs text-gray-600 mb-2">Quick PASI Actions:</p>
                            <TooltipProvider>
                              <PasiActionButtons
                                asn={asn}
                                showYourWay={false}
                                showCopyLink={false}
                              />
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Step 3: Course Mark & PASI Submission */}
              {status.committed && (
                <AccordionItem value="step3" className="mb-2">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {status.registrarConfirmedMark ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : status.finalMark ? (
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            3
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-semibold">Course Mark & PASI Submission</div>
                          <div className="text-xs text-gray-500 font-normal">
                            Enter mark and confirm PASI submission
                            {status.finalMark && (
                              <span className="ml-2 font-semibold text-blue-600">
                                Mark: {status.finalMark}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {status.registrarConfirmedMark && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Complete
                        </Badge>
                      )}
                      {status.finalMark && !status.registrarConfirmedMark && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                          Mark Entered
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-4 space-y-4">
                      {/* Final Mark Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="finalMark">Final Mark (0-100)</Label>
                          {status.finalMark && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleClearMark}
                              className="text-xs h-6"
                            >
                              Clear Mark
                            </Button>
                          )}
                        </div>
                        <Input
                          id="finalMark"
                          type="number"
                          min="0"
                          max="100"
                          value={localFinalMark}
                          onChange={(e) => handleMarkChange(e.target.value)}
                          onBlur={saveFinalMark}
                          onKeyPress={handleMarkKeyPress}
                          placeholder="Enter final mark"
                          disabled={status.registrarConfirmedMark}
                          className={`${markError ? 'border-red-500' : ''} ${status.registrarConfirmedMark ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        {markError && (
                          <p className="text-xs text-red-600 mt-1">{markError}</p>
                        )}
                        {status.registrarConfirmedMark && (
                          <p className="text-xs text-amber-600 mt-1">
                            Mark has been confirmed and submitted to PASI. Click "Clear Mark" to edit.
                          </p>
                        )}
                      </div>

                      {/* Registrar Comment */}
                      <div>
                        <Label htmlFor="registrarComment">Comment for Registrar (Optional)</Label>
                        <Textarea
                          id="registrarComment"
                          value={localRegistrarComment}
                          onChange={(e) => setLocalRegistrarComment(e.target.value)}
                          onBlur={saveRegistrarComment}
                          onKeyDown={handleCommentKeyPress}
                          placeholder="Add any notes or context for the registrar..."
                          rows={3}
                        />
                      </div>

                      {/* PASI Reference Info */}
                      {course.code && course.code !== 'N/A' && (
                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-900 mb-1">PASI Reference</p>
                          <p className="text-gray-700 text-xs">
                            <strong>Course:</strong> {course.name} | <strong>Code:</strong> {course.code}
                          </p>
                        </div>
                      )}

                      {/* Registrar Confirmation */}
                      <div className="border-t pt-3 mt-3 bg-amber-50 -mx-6 px-6 -mb-4 pb-4 rounded-b-lg">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="registrarConfirmedMark"
                            checked={status.registrarConfirmedMark}
                            onCheckedChange={(checked) =>
                              handleRegistrarCheckboxChange(
                                'registrarConfirmedMark',
                                checked,
                                checked
                                  ? 'Confirm that mark has been submitted to PASI?'
                                  : 'Remove confirmation that mark was submitted to PASI?'
                              )
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor="registrarConfirmedMark" className="font-medium cursor-pointer">
                              Mark submitted to PASI
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Registrar confirms mark has been submitted to PASI
                            </p>
                          </div>
                        </div>

                        {/* PASI Action Buttons */}
                        {asn && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs text-gray-600 mb-2">Quick PASI Actions:</p>
                            <TooltipProvider>
                              <PasiActionButtons
                                asn={asn}
                                showYourWay={false}
                                showCopyLink={false}
                              />
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

            </Accordion>

            {/* Remove Course Section */}
            <div className="border-t pt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  onRemoveCourse(course);
                }}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Course
              </Button>
            </div>
          </div>
        )}

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Registrar Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRegistrarChange?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRegistrarChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegistrarChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};

export default CourseActionSheet;
