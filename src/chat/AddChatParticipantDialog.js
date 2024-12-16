import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, X, User, UserCog, ChevronDown, ChevronUp } from 'lucide-react';
import { getDatabase, ref, query, orderByChild, startAt, endAt, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import Select from 'react-select';

const safeEmailProcess = (email) => {
  if (typeof email !== 'string') {
    console.warn('Invalid email:', email);
    return '';
  }
  return sanitizeEmail(email.toLowerCase());
};

const AddChatParticipantDialog = ({ isOpen, onClose, onAddParticipant, currentParticipants, courseInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState({ value: 'all', label: 'All Users' });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const { user } = useAuth();
  const isStaff = user && /@rtdacademy\.com$/i.test(user.email);

  const db = getDatabase();
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const userTypeOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'student', label: 'Students' },
    { value: 'staff', label: 'Staff' }
  ];

  const normalizeSearchTerm = (term) => {
    return term.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  };

  const matchesSearchTerm = (value, term) => {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const normalizedValue = normalizeSearchTerm(value.toString());
    const normalizedTerm = normalizeSearchTerm(term);
    return normalizedValue.includes(normalizedTerm);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnapshot = await get(ref(db, 'courses'));
        const coursesData = [];
        
        coursesSnapshot.forEach((courseSnapshot) => {
          // Skip the 'sections' entry
          if (courseSnapshot.key === 'sections') {
            return;
          }
  
          const courseData = courseSnapshot.val();
          // Only require that we have some identifiable information
          if (courseData) {
            try {
              // Use the snapshot key (courseId) if LMSCourseID is not available
              const courseId = courseData.LMSCourseID ?? courseSnapshot.key;
              const courseTitle = courseData.Title ?? `Course ${courseId}`;
              
              coursesData.push({
                value: String(courseId),
                label: courseTitle
              });
            } catch (err) {
              console.warn('Error processing course:', courseData, err);
            }
          }
        });
        
        setCourses(coursesData);
  
        // Handle the case where courseInfo exists and has an LMSCourseID
        if (courseInfo?.LMSCourseID != null) {
          const defaultCourse = coursesData.find(
            course => course.value === String(courseInfo.LMSCourseID)
          );
          if (defaultCourse) {
            setSelectedCourses([defaultCourse]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]); // Set empty array on error
      }
    };
  
    fetchCourses();
  }, [db, courseInfo]);

  const searchParticipants = useCallback(async () => {
    if (!isOpen) return;

    setIsSearching(true);
    let results = [];

    try {
      if (selectedUserType.value === 'all' || selectedUserType.value === 'staff') {
        const staffRef = ref(db, 'staff');
        const staffSnapshot = await get(staffRef);
        staffSnapshot.forEach((childSnapshot) => {
          const staffData = childSnapshot.val();
          if (matchesSearchTerm(staffData.displayName, searchTerm) ||
              matchesSearchTerm(staffData.email, searchTerm)) {
            results.push({
              id: childSnapshot.key,
              displayName: staffData.displayName,
              email: safeEmailProcess(staffData.email),
              firstName: staffData.firstName,
              lastName: staffData.lastName,
              type: 'staff'
            });
          }
        });
      }

      if (selectedUserType.value === 'all' || selectedUserType.value === 'student') {
        const summariesRef = ref(db, 'studentCourseSummaries');
        let studentQuery;

        if (selectedCourses.length === 1) {
          studentQuery = query(
            summariesRef, 
            orderByChild('Course_Value'), 
            startAt(selectedCourses[0].label), 
            endAt(selectedCourses[0].label + '\uf8ff')
          );
        } else {
          studentQuery = summariesRef;
        }

        const studentSnapshot = await get(studentQuery);
        studentSnapshot.forEach((childSnapshot) => {
          const studentData = childSnapshot.val();
          const isActive = !showOnlyActive || studentData.ActiveFutureArchived_Value === 'Active';
          if (isActive && 
              (searchTerm === '' ||
               matchesSearchTerm(studentData.firstName, searchTerm) ||
               matchesSearchTerm(studentData.lastName, searchTerm) ||
               matchesSearchTerm(studentData.StudentEmail, searchTerm))) {
            results.push({
              id: childSnapshot.key,
              displayName: `${studentData.firstName} ${studentData.lastName}`,
              email: safeEmailProcess(studentData.StudentEmail),
              asn: isStaff ? (studentData.asn || '') : '',
              Course_Value: studentData.Course_Value,
              type: 'student'
            });
          }
        });
      }

      results = results.filter(r => !currentParticipants.includes(safeEmailProcess(r.email)));
      setSearchResults(results);
      setStudentCount(results.filter(r => r.type === 'student').length);
      setStaffCount(results.filter(r => r.type === 'staff').length);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching participants:", error);
    } finally {
      setIsSearching(false);
    }
  }, [isOpen, db, searchTerm, selectedCourses, showOnlyActive, selectedUserType, isStaff, currentParticipants]);

  useEffect(() => {
    if (isOpen) {
      // Reset search state when dialog opens
      setSearchTerm('');
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (searchTerm || selectedCourses.length > 0)) {
      const delayDebounceFn = setTimeout(() => {
        searchParticipants();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [isOpen, searchTerm, selectedCourses, searchParticipants]);

  const handleClearSearch = () => {
    setSearchTerm('');
    searchParticipants();
  };

  const handleAddParticipant = (participant) => {
    onAddParticipant(participant);
    onClose(); // Close the dialog after adding a participant
  };

  const renderParticipantInfo = (participant) => {
    const IconComponent = participant.type === 'staff' ? UserCog : User;
    return (
      <div className="flex items-center">
        <IconComponent size={16} className={`mr-2 ${participant.type === 'staff' ? 'text-blue-500' : 'text-green-500'}`} />
        <div>
          <div className="font-semibold">{participant.displayName}</div>
          <div className="text-xs text-gray-500">
            {participant.type === 'staff' ? 'Staff' : 'Student'}
          </div>
          {participant.type === 'student' && (
            <>
              {isStaff && participant.asn && (
                <div className="text-xs text-gray-500">ASN: {participant.asn}</div>
              )}
              <div className="text-xs text-gray-500">Course: {participant.Course_Value}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAdvancedSearchOptions = () => (
    <>
      <div className="flex flex-wrap gap-2 mb-2">
        <div className="flex-grow min-w-[200px]">
          <Select
            options={courses}
            value={selectedCourses}
            onChange={setSelectedCourses}
            placeholder="Select Courses"
            isMulti
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div className="flex-grow min-w-[200px]">
          <Select
            options={userTypeOptions}
            value={selectedUserType}
            onChange={setSelectedUserType}
            placeholder="Select User Type"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="showOnlyActive"
          checked={showOnlyActive}
          onChange={(e) => setShowOnlyActive(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="showOnlyActive" className="text-sm text-gray-700 whitespace-nowrap">
          Active only
        </label>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Participant to Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isStaff && (
            <button
              onClick={() => setShowAdvancedSearch(prev => !prev)}
              className="w-full bg-gray-200 text-gray-700 rounded-full px-4 py-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out flex items-center justify-center"
            >
              {showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'} 
              {showAdvancedSearch ? <ChevronUp className="inline ml-2" size={16} /> : <ChevronDown className="inline ml-2" size={16} />}
            </button>
          )}
          {(isStaff || showAdvancedSearch) && renderAdvancedSearchOptions()}
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="flex-grow">
            {isSearching && (
              <div className="mt-2 text-center text-gray-500">Searching...</div>
            )}
            {showResults && !isSearching && (
              <>
                <div className="mt-2 text-sm text-gray-600">
                  Showing {studentCount} student{studentCount !== 1 ? 's' : ''} and {staffCount} staff member{staffCount !== 1 ? 's' : ''}
                </div>
                <ul ref={searchResultsRef} className="mt-2 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((participant) => (
                    <li
                      key={participant.id || participant.email}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddParticipant(participant)}
                    >
                      {renderParticipantInfo(participant)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChatParticipantDialog;
