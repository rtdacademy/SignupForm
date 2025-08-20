import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Search, Archive, RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2, Eye, X, Copy, ChevronDown, ChevronRight, FileJson, Wrench, BookOpen, Shield, Lock } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import { getAuth } from 'firebase/auth';

const ArchiveManagement = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [restoringCourses, setRestoringCourses] = useState(new Set());
  const [viewingData, setViewingData] = useState(new Set());
  const [archiveDataModal, setArchiveDataModal] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['stats']));
  const [fixingCourses, setFixingCourses] = useState(new Set());
  const [restoreOptionsModal, setRestoreOptionsModal] = useState(null);
  
  // Use staff claims hook to check permissions
  const { isStaff, loading: permissionsLoading, error: permissionsError } = useStaffClaims({ readOnly: true });
  const auth = getAuth();

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    setSearching(true);
    setError(null);
    setSuccessMessage(null);
    setSearchResults([]);

    try {
      const db = getDatabase();
      const sanitizedEmail = sanitizeEmail(searchEmail.trim());
      
      // Find the selected course info
      const courseInfo = COURSE_OPTIONS.find(c => c.value === selectedCourse);
      if (!courseInfo || !courseInfo.courseId) {
        setError('Invalid course selected');
        setSearching(false);
        return;
      }
      
      // Construct the summaryKey
      const summaryKey = `${sanitizedEmail}_${courseInfo.courseId}`;
      
      console.log(`Searching for summaryKey: ${summaryKey}`);
      
      // Query the specific studentCourseSummary
      const summaryRef = ref(db, `studentCourseSummaries/${summaryKey}`);
      const snapshot = await get(summaryRef);
      
      if (!snapshot.exists()) {
        setError(`No enrollment found for ${searchEmail} in ${courseInfo.label}`);
        setSearching(false);
        return;
      }

      const summary = snapshot.val();
      const status = summary.ActiveFutureArchived_Value || 'Unknown';
      
      // Check if archive info exists, regardless of status
      const hasArchiveInfo = summary.archiveInfo && summary.archiveInfo.archiveFilePath;
      
      // Determine if this should be treated as archived
      // Either the status is Archived OR archive info exists (handling out-of-sync cases)
      const shouldShowArchiveActions = status === 'Archived' || hasArchiveInfo;
      
      // Create result object
      const courseResult = {
        summaryKey: summaryKey,
        studentEmail: summary.StudentEmail || summary.originalEmail || searchEmail,
        courseId: courseInfo.courseId,
        courseName: courseInfo.label,
        studentName: `${summary.firstName || summary.FirstName || ''} ${summary.lastName || summary.LastName || ''}`.trim() || 'Unknown',
        asn: summary.asn || 'N/A',
        status: status,
        archiveInfo: summary.archiveInfo || {},
        archiveStatus: summary.archiveStatus || 'Unknown',
        archivedAt: summary.archiveInfo?.archivedAt || null,
        isArchived: shouldShowArchiveActions,
        hasArchiveInfo: hasArchiveInfo,
        isOutOfSync: hasArchiveInfo && status !== 'Archived', // Flag for out-of-sync status
        summaryData: summary // Include full data for reference
      };

      setSearchResults([courseResult]);
      
      if (courseResult.isOutOfSync) {
        setSuccessMessage(`Found ${status} enrollment with archive data for ${searchEmail} in ${courseInfo.label} (Status may be out of sync)`);
      } else if (courseResult.isArchived) {
        setSuccessMessage(`Found archived enrollment for ${searchEmail} in ${courseInfo.label}`);
      } else {
        setSuccessMessage(`Found ${status} enrollment for ${searchEmail} in ${courseInfo.label}`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleViewData = async (course) => {
    const courseKey = `${course.studentEmail}_${course.courseId}`;
    
    // Add to viewing set
    setViewingData(prev => new Set(prev).add(courseKey));
    setError(null);

    try {
      const functions = getFunctions();
      const viewArchivedData = httpsCallable(functions, 'viewArchivedData');
      
      console.log(`Viewing archived data for course ${course.courseId} for ${course.studentEmail}`);
      
      const result = await viewArchivedData({
        studentEmail: course.studentEmail,
        courseId: course.courseId
      });

      if (result.data.success) {
        setArchiveDataModal({
          course: course,
          data: result.data.data,
          stats: result.data.stats,
          currentSummaryData: result.data.currentSummaryData
        });
        // Expand stats section by default
        setExpandedSections(new Set(['stats']));
      } else {
        setError(`Failed to view data: ${result.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('View data error:', err);
      
      // Handle specific error codes
      if (err.code === 'unauthenticated') {
        setError('You must be authenticated to view archived data');
      } else if (err.code === 'not-found') {
        setError('Archive file not found. The data may have been permanently deleted.');
      } else if (err.code === 'failed-precondition') {
        setError('No archive information found or student is not archived.');
      } else {
        setError(`Failed to view data: ${err.message}`);
      }
    } finally {
      // Remove from viewing set
      setViewingData(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseKey);
        return newSet;
      });
    }
  };

  const handleRestore = async (course) => {
    const courseKey = `${course.studentEmail}_${course.courseId}`;
    
    // Add to restoring set
    setRestoringCourses(prev => new Set(prev).add(courseKey));
    setError(null);
    setSuccessMessage(null);

    try {
      const functions = getFunctions();
      const restoreArchivedStudent = httpsCallable(functions, 'restoreArchivedStudent');
      
      console.log(`Checking for existing data for course ${course.courseId}`);
      
      // First check if there's existing data
      const checkResult = await restoreArchivedStudent({
        studentEmail: course.studentEmail,
        courseId: course.courseId,
        mode: 'check'
      });

      if (checkResult.data.hasExistingData) {
        // Show options modal
        setRestoreOptionsModal({
          course: course,
          existingDataInfo: checkResult.data.existingDataInfo
        });
      } else {
        // No existing data, proceed with full restore
        console.log(`No existing data, proceeding with full restore`);
        
        const restoreResult = await restoreArchivedStudent({
          studentEmail: course.studentEmail,
          courseId: course.courseId,
          mode: 'full_restore'
        });

        if (restoreResult.data.success) {
          setSuccessMessage(`Successfully restored ${course.courseName} for ${course.studentName}`);
          
          // Remove from search results
          setSearchResults(prev => prev.filter(c => 
            `${c.studentEmail}_${c.courseId}` !== courseKey
          ));
          
          // Close modal if it was open for this course
          if (archiveDataModal?.course.summaryKey === course.summaryKey) {
            setArchiveDataModal(null);
          }
        } else {
          setError(`Failed to restore: ${restoreResult.data.message}`);
        }
      }
    } catch (err) {
      console.error('Restore error:', err);
      
      // Handle specific error codes
      if (err.code === 'unauthenticated') {
        setError('You must be authenticated to restore archived students');
      } else if (err.code === 'not-found') {
        setError('Archive file not found. The student data may have been permanently deleted.');
      } else if (err.code === 'failed-precondition') {
        setError('No archive information found. This student may not be properly archived.');
      } else {
        setError(`Restore failed: ${err.message}`);
      }
    } finally {
      // Remove from restoring set
      setRestoringCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseKey);
        return newSet;
      });
    }
  };

  const handleRestoreOption = async (mode) => {
    if (!restoreOptionsModal) return;
    
    const { course } = restoreOptionsModal;
    const courseKey = `${course.studentEmail}_${course.courseId}`;
    
    // Close the options modal
    setRestoreOptionsModal(null);
    
    // Add to restoring set
    setRestoringCourses(prev => new Set(prev).add(courseKey));
    setError(null);
    setSuccessMessage(null);

    try {
      const functions = getFunctions();
      const restoreArchivedStudent = httpsCallable(functions, 'restoreArchivedStudent');
      
      console.log(`Restoring with mode: ${mode}`);
      
      const result = await restoreArchivedStudent({
        studentEmail: course.studentEmail,
        courseId: course.courseId,
        mode: mode
      });

      if (result.data.success) {
        let message = '';
        switch(mode) {
          case 'merge_notes':
            message = `Successfully merged notes for ${course.courseName}. ${result.data.message}`;
            break;
          case 'full_restore':
            message = `Successfully restored ${course.courseName} (overwrote existing enrollment)`;
            // Remove from search results since it's fully restored
            setSearchResults(prev => prev.filter(c => 
              `${c.studentEmail}_${c.courseId}` !== courseKey
            ));
            break;
          case 'archive_current':
            message = `Successfully archived current enrollment and restored previous enrollment for ${course.courseName}`;
            // Remove from search results
            setSearchResults(prev => prev.filter(c => 
              `${c.studentEmail}_${c.courseId}` !== courseKey
            ));
            break;
          default:
            message = result.data.message;
        }
        setSuccessMessage(message);
      } else {
        setError(`Failed to restore: ${result.data.message}`);
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError(`Restore failed: ${err.message}`);
    } finally {
      // Remove from restoring set
      setRestoringCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseKey);
        return newSet;
      });
    }
  };

  const handleFixData = async (course) => {
    const courseKey = `${course.studentEmail}_${course.courseId}`;
    
    // Add to fixing set
    setFixingCourses(prev => new Set(prev).add(courseKey));
    setError(null);
    setSuccessMessage(null);

    try {
      const functions = getFunctions();
      const fixMisplacedArchivedData = httpsCallable(functions, 'fixMisplacedArchivedData');
      
      console.log(`Fixing misplaced data for course ${course.courseId} for ${course.studentEmail}`);
      
      const result = await fixMisplacedArchivedData({
        studentEmail: course.studentEmail,
        courseId: course.courseId
      });

      if (result.data.success) {
        setSuccessMessage(`Successfully fixed misplaced data for ${course.courseName}. Data moved from ${result.data.restoredFromTimestamp ? 'previousCourse/' + result.data.restoredFromTimestamp : 'previousCourse'} to root level.`);
        
        // Remove from search results since it's now fixed
        setSearchResults(prev => prev.filter(c => 
          `${c.studentEmail}_${c.courseId}` !== courseKey
        ));
      } else {
        setError(`Failed to fix data: ${result.data.message}`);
      }
    } catch (err) {
      console.error('Fix data error:', err);
      setError(`Fix failed: ${err.message}`);
    } finally {
      // Remove from fixing set
      setFixingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseKey);
        return newSet;
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle the string "Unknown" explicitly
    if (timestamp === 'Unknown') return 'Unknown';
    
    // Handle various timestamp formats
    let date;
    try {
      if (typeof timestamp === 'string') {
        // Check if it's a valid date string
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        // Handle numeric timestamps
        date = new Date(timestamp);
      } else if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
        // Handle Firestore timestamp objects
        date = new Date(timestamp._seconds * 1000);
      } else {
        return 'Unknown';
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date timestamp:', timestamp);
        return 'Unknown';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Timestamp:', timestamp);
      return 'Unknown';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setSuccessMessage('JSON data copied to clipboard');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Check permissions and show loading/error states
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!auth.currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 rounded-lg p-8 max-w-md text-center">
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">You must be logged in to access this feature.</p>
        </div>
      </div>
    );
  }

  // Check if user is not staff
  if (!isStaff()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 rounded-lg p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Staff Access Required</h2>
          <p className="text-gray-600 mb-4">
            This feature is only available to staff members with @rtdacademy.com or @rtd-connect.com email addresses.
          </p>
          <p className="text-sm text-gray-500">
            Current user: {auth.currentUser?.email || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  const renderJsonSection = (title, data, sectionKey) => {
    const isExpanded = expandedSections.has(sectionKey);
    const hasData = data && Object.keys(data).length > 0;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-900">{title}</span>
            {hasData && (
              <span className="text-sm text-gray-500">
                ({Object.keys(data).length} {Object.keys(data).length === 1 ? 'field' : 'fields'})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasData && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(data);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </button>
        
        {isExpanded && hasData && (
          <div className="border-t border-gray-200">
            <div className="max-h-96 overflow-auto">
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                customStyle={{
                  margin: 0,
                  fontSize: '0.875rem',
                }}
                wrapLongLines={true}
              >
                {JSON.stringify(data, null, 2)}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
        
        {isExpanded && !hasData && (
          <div className="p-4 text-gray-500 text-sm">No data available</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Student Course Data Management</h1>
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Staff Access</span>
          </div>
        </div>
        <p className="text-gray-600">Search for student course enrollments and manage archived data</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Student Email Address
            </label>
            <input
              id="email"
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="student@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={searching}
            />
          </div>
          
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              disabled={searching}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_OPTIONS.map((course) => (
                  <SelectItem key={course.courseId} value={course.value}>
                    <div className="flex items-center space-x-2">
                      {course.icon && <course.icon className="w-4 h-4" style={{ color: course.color }} />}
                      <span>{course.label}</span>
                      <span className="text-xs text-gray-500">(ID: {course.courseId})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={searching || !searchEmail.trim() || !selectedCourse}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {searching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {searchResults.map((course) => {
              const courseKey = `${course.studentEmail}_${course.courseId}`;
              const isRestoring = restoringCourses.has(courseKey);
              const isViewing = viewingData.has(courseKey);
              const isFixing = fixingCourses.has(courseKey);
              
              // Determine status color
              const getStatusColor = (status) => {
                // Special case for out-of-sync
                if (course.isOutOfSync) {
                  return 'text-yellow-600 bg-yellow-50';
                }
                switch(status) {
                  case 'Active': return 'text-green-600 bg-green-50';
                  case 'Archived': return 'text-gray-600 bg-gray-50';
                  case 'Pending': return 'text-yellow-600 bg-yellow-50';
                  default: return 'text-gray-600 bg-gray-50';
                }
              };
              
              return (
                <div key={courseKey} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {course.isArchived ? (
                          <Archive className="w-5 h-5 text-gray-400" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-blue-400" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">
                          {course.courseName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Student:</span> {course.studentName}</p>
                        <p><span className="font-medium">Email:</span> {course.studentEmail}</p>
                        <p><span className="font-medium">ASN:</span> {course.asn}</p>
                        <p><span className="font-medium">Course ID:</span> {course.courseId}</p>
                        
                        {course.isArchived && (
                          <>
                            <p><span className="font-medium">Archive Status:</span> {course.archiveStatus}</p>
                            <p><span className="font-medium">Archived:</span> {formatDate(course.archivedAt)}</p>
                          </>
                        )}
                        
                        {!course.isArchived && course.summaryData && (
                          <>
                            {course.summaryData.ScheduleStartDate && (
                              <p><span className="font-medium">Start Date:</span> {course.summaryData.ScheduleStartDate}</p>
                            )}
                            {course.summaryData.ScheduleEndDate && (
                              <p><span className="font-medium">End Date:</span> {course.summaryData.ScheduleEndDate}</p>
                            )}
                            {course.summaryData.PercentCompleteGradebook !== undefined && (
                              <p><span className="font-medium">Progress:</span> {course.summaryData.PercentCompleteGradebook}%</p>
                            )}
                          </>
                        )}
                        
                        {course.archiveInfo?.fileName && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Archive File:</span> {course.archiveInfo.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {/* Only show archive-specific actions for archived courses */}
                      {course.isArchived && (
                        <>
                          <button
                            onClick={() => handleViewData(course)}
                            disabled={isViewing}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {isViewing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>View Data</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRestore(course)}
                            disabled={isRestoring}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {isRestoring ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Restoring...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Restore</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleFixData(course)}
                            disabled={isFixing}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            title="Fix data incorrectly restored to previousCourse folder"
                          >
                            {isFixing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Fixing...</span>
                              </>
                            ) : (
                              <>
                                <Wrench className="w-4 h-4" />
                                <span>Fix Data</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                      
                      {/* Show warning for out-of-sync courses */}
                      {course.isOutOfSync && (
                        <div className="p-3 bg-yellow-50 rounded-md mb-2">
                          <p className="text-sm text-yellow-700 font-medium">⚠️ Status Out of Sync</p>
                          <p className="text-xs text-yellow-600 mt-1">Status shows {course.status} but archive data exists</p>
                        </div>
                      )}
                      
                      {/* Show informational message for active courses without archive data */}
                      {!course.isArchived && !course.hasArchiveInfo && (
                        <div className="p-3 bg-green-50 rounded-md">
                          <p className="text-sm text-green-700 font-medium">Course is currently active</p>
                          <p className="text-xs text-green-600 mt-1">No archive actions available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {course.isArchived && course.archiveInfo?.restorationData && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">Restoration Info:</p>
                          <p>Course data exists: {course.archiveInfo.restorationData.courseDataExists ? 'Yes' : 'No'}</p>
                          <p>Messages to restore: {course.archiveInfo.restorationData.messageCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && searchResults.length === 0 && searchEmail && selectedCourse && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No enrollment found</p>
          <p className="text-sm text-gray-500 mt-2">Try searching with a different email or course combination</p>
        </div>
      )}

      {/* Restore Options Modal */}
      {restoreOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900">Existing Enrollment Detected</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-3">
                  An active enrollment was found for <strong>{restoreOptionsModal.course.studentName}</strong> in <strong>{restoreOptionsModal.course.courseName}</strong>.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Current Enrollment Details:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• School Year: {restoreOptionsModal.existingDataInfo.schoolYear}</li>
                    <li>• Status: {restoreOptionsModal.existingDataInfo.status}</li>
                    <li>• Enrollment Date: {formatDate(restoreOptionsModal.existingDataInfo.enrollmentDate)}</li>
                    {restoreOptionsModal.existingDataInfo.hasNotes && (
                      <li>• Notes: {restoreOptionsModal.existingDataInfo.noteCount} existing notes</li>
                    )}
                  </ul>
                </div>
                
                <p className="text-gray-700 mb-4">
                  How would you like to proceed with the restoration?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleRestoreOption('merge_notes')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-medium">Merge Notes Only</div>
                    <div className="text-sm opacity-90">Keep current enrollment, merge historical notes</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRestoreOption('archive_current')}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-medium">Archive Current & Restore Old</div>
                    <div className="text-sm opacity-90">Save current enrollment, restore archived data</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRestoreOption('full_restore')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-medium">Overwrite Current</div>
                    <div className="text-sm opacity-90">Replace current enrollment with archived data</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setRestoreOptionsModal(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Data Modal */}
      {archiveDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileJson className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Archive Data Viewer</h2>
                  <p className="text-sm text-gray-600">
                    {archiveDataModal.course.courseName} - {archiveDataModal.course.studentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArchiveDataModal(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              {/* Statistics */}
              {archiveDataModal.stats && (
                <div className="mb-6">
                  {renderJsonSection('Archive Statistics', {
                    'File Size (Compressed)': formatBytes(archiveDataModal.stats.compressedSize),
                    'File Size (Decompressed)': formatBytes(archiveDataModal.stats.decompressedSize),
                    'Compression Ratio': archiveDataModal.stats.compressionRatio,
                    'Message Count': archiveDataModal.stats.messageCount,
                    'Student Notes': archiveDataModal.stats.noteCount,
                    'Has Previous Enrollments': archiveDataModal.stats.hasPreviousEnrollments ? 'Yes' : 'No',
                    'Archive Date': formatDate(archiveDataModal.stats.archiveDate),
                    'Archive File Path': archiveDataModal.stats.filePath
                  }, 'stats')}
                </div>
              )}

              <div className="space-y-4">
                {/* Archive Metadata */}
                {renderJsonSection('Archive Metadata', archiveDataModal.data.archiveMetadata, 'archiveMetadata')}
                
                {/* Student Course Summary */}
                {renderJsonSection('Student Course Summary', archiveDataModal.data.studentCourseSummary, 'studentCourseSummary')}
                
                {/* Course Data */}
                {renderJsonSection('Course Data', archiveDataModal.data.courseData, 'courseData')}
                
                {/* Course Messages */}
                {renderJsonSection(
                  `Course Messages (${Object.keys(archiveDataModal.data.courseMessages || {}).length})`, 
                  archiveDataModal.data.courseMessages, 
                  'courseMessages'
                )}
                
                {/* Current Summary Data */}
                {renderJsonSection('Current Summary Info', archiveDataModal.currentSummaryData, 'currentSummaryData')}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Use the arrows to expand/collapse sections
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => copyToClipboard(archiveDataModal.data)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy All Data</span>
                </button>
                <button
                  onClick={() => setArchiveDataModal(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveManagement;