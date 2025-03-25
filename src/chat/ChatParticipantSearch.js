// ChatParticipantSearch.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, User, UserCog, ChevronDown, ChevronUp } from 'lucide-react';
import { getDatabase, ref, query, orderByChild, startAt, endAt, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import Select from 'react-select';

// Helper function to safely lowercase and sanitize email
const safeEmailProcess = (email) => {
  if (typeof email !== 'string') {
    console.warn('Invalid email:', email);
    return '';
  }
  return sanitizeEmail(email.toLowerCase());
};

// Helper functions and component setup remain unchanged

function ChatParticipantSearch({ onStartNewChat, onOpenChatList, courseInfo, courseTeachers, courseSupportStaff }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState({ value: 'all', label: 'All Users' });
  const [courseStaffDetails, setCourseStaffDetails] = useState({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [courseStaff, setCourseStaff] = useState([]);

  const { user } = useAuth();
  const isStaff = user && /@rtdacademy\.com$/i.test(user.email); // Case-insensitive check

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
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesSnapshot = await get(ref(db, 'courses'));
        const coursesData = [];
        coursesSnapshot.forEach((courseSnapshot) => {
          const courseData = courseSnapshot.val();
          if (courseData.Title) {
            coursesData.push({
              value: courseData.LMSCourseID.toString(),
              label: courseData.Title
            });
          }
        });
        setCourses(coursesData);

        // Set default course based on courseInfo
        if (courseInfo && courseInfo.LMSCourseID) {
          const defaultCourse = coursesData.find(course => course.value === courseInfo.LMSCourseID.toString());
          if (defaultCourse) {
            setSelectedCourses([defaultCourse]);
          }
        }

        // Fetch all students
        const studentSnapshot = await get(ref(db, 'students'));
        const studentsList = [];
        studentSnapshot.forEach((childSnapshot) => {
          const studentData = childSnapshot.val();
          if (studentData && studentData.profile && studentData.courses) {
            const studentCourses = Object.entries(studentData.courses)
              .map(([courseId, courseData]) => ({
                id: courseId,
                name: courseData.Course?.Value || 'Unknown Course',
                isActive: courseData.ActiveFutureArchived?.Value === 'Active'
              }));

            const email = studentData.profile.email || childSnapshot.key;
            studentsList.push({
              id: childSnapshot.key,
              displayName: `${studentData.profile.firstName || ''} ${studentData.profile.lastName || ''}`.trim(),
              email: safeEmailProcess(email),
              asn: isStaff ? (studentData.profile.asn || '') : '',
              PrimaryID: isStaff ? (studentData.profile.PrimaryID || '') : '',
              courses: studentCourses,
              type: 'student'
            });
          }
        });
        setAllStudents(studentsList);

        // Fetch all staff
        const staffSnapshot = await get(ref(db, 'staff'));
        const staffList = [];
        staffSnapshot.forEach((childSnapshot) => {
          const staffData = childSnapshot.val();
          const email = staffData.email || childSnapshot.key;
          staffList.push({
            id: childSnapshot.key,
            displayName: staffData.displayName || email,
            email: safeEmailProcess(email),
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            type: 'staff'
          });
        });
        setAllStaff(staffList);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [db, isStaff, courseInfo]);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      const staffEmails = [...(courseTeachers || []), ...(courseSupportStaff || [])];
      const staffDetails = {};

      for (const email of staffEmails) {
        const sanitizedEmail = safeEmailProcess(email);
        const staffRef = ref(db, `staff/${sanitizedEmail}`);
        const staffSnapshot = await get(staffRef);
        if (staffSnapshot.exists()) {
          staffDetails[email] = staffSnapshot.val();
        }
      }

      setCourseStaffDetails(staffDetails);
    };

    fetchStaffDetails();
  }, [db, courseTeachers, courseSupportStaff]);

  useEffect(() => {
    const fetchCourseStaff = async () => {
      if (selectedCourses.length === 1) {
        const courseRef = ref(db, `courses/${selectedCourses[0].value}`);
        const courseSnapshot = await get(courseRef);
        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.val();
          const staffEmails = [...(courseData.Teachers || []), ...(courseData.SupportStaff || [])];
          const staffDetails = await Promise.all(staffEmails.map(async (email) => {
            const sanitizedEmail = safeEmailProcess(email);
            const staffRef = ref(db, `staff/${sanitizedEmail}`);
            const staffSnapshot = await get(staffRef);
            if (staffSnapshot.exists()) {
              const staffData = staffSnapshot.val();
              return {
                id: sanitizedEmail,
                displayName: staffData.displayName,
                email: sanitizedEmail, // Already sanitized and lowercased
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                type: 'staff'
              };
            }
            return null;
          }));
          setCourseStaff(staffDetails.filter(Boolean));
        }
      } else {
        setCourseStaff([]);
      }
    };

    fetchCourseStaff();
  }, [db, selectedCourses]);

  const searchParticipants = useCallback(async () => {
    setIsSearching(true);
    let results = [];

    try {
      // Search staff
      if (selectedUserType.value === 'all' || selectedUserType.value === 'staff') {
        if (selectedCourses.length === 1) {
          // Use course-specific staff
          results = courseStaff.filter(staff => 
            matchesSearchTerm(staff.displayName, searchTerm) ||
            matchesSearchTerm(staff.email, searchTerm)
          );
        } else {
          // Search all staff
          const staffRef = ref(db, 'staff');
          const staffSnapshot = await get(staffRef);
          staffSnapshot.forEach((childSnapshot) => {
            const staffData = childSnapshot.val();
            if (matchesSearchTerm(staffData.displayName, searchTerm) ||
                matchesSearchTerm(staffData.email, searchTerm)) {
              results.push({
                id: childSnapshot.key,
                displayName: staffData.displayName,
                email: safeEmailProcess(staffData.email), // Already sanitized and lowercased
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                type: 'staff'
              });
            }
          });
        }
      }

      // Search students
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
          // When no course is selected or searching all courses
          studentQuery = summariesRef; // Query all students
        }

        const studentSnapshot = await get(studentQuery);
        studentSnapshot.forEach((childSnapshot) => {
          const studentData = childSnapshot.val();
          const isActive = !showOnlyActive || studentData.ActiveFutureArchived_Value === 'Active';
          if (isActive && 
              (searchTerm === '' || // Include all students if search term is empty
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
    } catch (error) {
      console.error("Error searching participants:", error);
    }

    setSearchResults(results.filter(r => r.email !== safeEmailProcess(user.email)));
    setStudentCount(results.filter(r => r.type === 'student').length);
    setStaffCount(results.filter(r => r.type === 'staff').length);
    setIsSearching(false);
  }, [db, searchTerm, selectedCourses, showOnlyActive, selectedUserType, user.email, isStaff, courseStaff]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm || selectedCourses.length > 0) {
        searchParticipants();
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParticipants, searchTerm, selectedCourses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleParticipantSelect = (participant) => {
    const safeEmail = safeEmailProcess(participant.email);
    if (!selectedParticipants.some(p => p.email === safeEmail)) {
      const isStaffParticipant = safeEmail.includes('@rtdacademy.com');
      setSelectedParticipants([...selectedParticipants, { ...participant, email: safeEmail, isStaff: isStaffParticipant }]);
    }
  };

  const handleRemoveParticipant = (participantToRemove) => {
    setSelectedParticipants(selectedParticipants.filter(p => safeEmailProcess(p.email) !== safeEmailProcess(participantToRemove.email)));
  };

  // Added handleStartNewChat to initiate a new chat
  const handleStartNewChat = useCallback(() => {
    if (selectedParticipants.length > 0) {
      onStartNewChat(selectedParticipants);
    }
  }, [selectedParticipants, onStartNewChat]);

  // Added handleOpenChatList to open existing chat list
  const handleOpenChatList = useCallback(() => {
    if (selectedParticipants.length > 0) {
      onOpenChatList(selectedParticipants);
    }
  }, [selectedParticipants, onOpenChatList]);

  const handleClearSearch = () => {
    setSearchTerm('');
    searchParticipants();
  };

  // Updated rendering functions with improved color contrast

  const renderActiveCourses = (activeCourses) => {
    if (!activeCourses || activeCourses.length === 0) return null;

    return activeCourses.map((course) => (
      <div key={course.id} className="text-xs text-gray-600 dark:text-gray-300">
        {course.name}
      </div>
    )).slice(0, 3); // Limit to 3 courses
  };

  const renderParticipantInfo = (participant) => {
    const IconComponent = participant.type === 'staff' ? UserCog : User;
    const iconColor = participant.type === 'staff' ? 'text-primary' : 'text-secondary';
    return (
      <div className="flex items-center">
        <IconComponent size={16} className={`mr-2 ${iconColor}`} />
        <div>
          <div className="font-semibold text-gray-800 dark:text-gray-100">{participant.displayName}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {participant.type === 'staff' ? 'Staff' : 'Student'}
          </div>
          {participant.type === 'student' && (
            <>
              {isStaff && participant.asn && (
                <div className="text-xs text-gray-600 dark:text-gray-300">ASN: {participant.asn}</div>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-300">Course: {participant.Course_Value}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderParticipantList = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {selectedParticipants.map((participant) => (
          <div key={participant.email} className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded-full flex items-center">
            <span className="text-sm">{participant.displayName}</span>
            <button
              onClick={() => handleRemoveParticipant(participant)}
              className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderCourseStaff = () => {
    if ((!courseTeachers || courseTeachers.length === 0) && (!courseSupportStaff || courseSupportStaff.length === 0)) {
      return null;
    }

    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Course Staff:</h3>
        <ul className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {courseTeachers && courseTeachers.map((teacherEmail, index) => {
            const sanitizedEmail = safeEmailProcess(teacherEmail);
            const teacherDetails = courseStaffDetails[teacherEmail] || {};
            return (
              <li
                key={`teacher-${index}`}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleParticipantSelect({ 
                  email: sanitizedEmail,
                  displayName: teacherDetails.displayName || sanitizedEmail, 
                  type: 'staff' 
                })}
              >
                <div className="flex items-center">
                  <UserCog size={16} className="mr-2 text-primary dark:text-primary-light" />
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{teacherDetails.displayName || sanitizedEmail}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Teacher</div>
                  </div>
                </div>
              </li>
            );
          })}
          {courseSupportStaff && courseSupportStaff.map((staffEmail, index) => {
            const sanitizedEmail = safeEmailProcess(staffEmail);
            const staffDetails = courseStaffDetails[staffEmail] || {};
            return (
              <li
                key={`support-${index}`}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleParticipantSelect({ 
                  email: sanitizedEmail,
                  displayName: staffDetails.displayName || sanitizedEmail, 
                  type: 'staff' 
                })}
              >
                <div className="flex items-center">
                  <UserCog size={16} className="mr-2 text-primary dark:text-primary-light" />
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{staffDetails.displayName || sanitizedEmail}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Support Staff</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderAdvancedSearchOptions = () => (
    <>
      <div className="flex flex-wrap gap-2">
        <div className="flex-grow min-w-[200px]">
          <Select
            options={courses}
            value={selectedCourses}
            onChange={setSelectedCourses}
            placeholder="Select Courses"
            isMulti
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: 'white',
                borderColor: '#d1d5db',
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? '#e5e7eb' : 'white',
                color: '#1f2937',
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#e5e7eb',
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: '#1f2937',
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: '#1f2937',
                ':hover': {
                  backgroundColor: '#d1d5db',
                  color: '#1f2937',
                },
              }),
            }}
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
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: 'white',
                borderColor: '#d1d5db',
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? '#e5e7eb' : 'white',
                color: '#1f2937',
              }),
            }}
          />
        </div>
      </div>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="showOnlyActive"
          checked={showOnlyActive}
          onChange={(e) => setShowOnlyActive(e.target.checked)}
          className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="showOnlyActive" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Active only
        </label>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col space-y-2 mb-4">
        {renderCourseStaff()}
        {!isStaff && (
          <button
            onClick={() => setShowAdvancedSearch(prev => !prev)}
            className="mt-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition duration-150 ease-in-out flex items-center justify-center"
          >
            {showAdvancedSearch ? 'Hide Other Participants' : 'Find Other Participants'} 
            {showAdvancedSearch ? <ChevronUp className="inline ml-2" size={16} /> : <ChevronDown className="inline ml-2" size={16} />}
          </button>
        )}
        {(isStaff || showAdvancedSearch) && (
          <>
            {renderAdvancedSearchOptions()}
            <div className="relative mt-2">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full p-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light dark:text-white dark:bg-gray-800 text-gray-800"
                placeholder="Search for participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="flex-grow">
              {isSearching && (
                <div className="mt-2 text-center text-gray-600 dark:text-gray-300">Searching...</div>
              )}
              {showResults && !isSearching && (
                <>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Showing {studentCount} student{studentCount !== 1 ? 's' : ''} and {staffCount} staff member{staffCount !== 1 ? 's' : ''}
                  </div>
                  <ul ref={searchResultsRef} className="mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((participant) => (
                      <li
                        key={participant.id || participant.email}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          handleParticipantSelect(participant);
                          setShowResults(false);
                        }}
                      >
                        {renderParticipantInfo(participant)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {selectedParticipants.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Selected Participants:</h3>
          {renderParticipantList()}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleStartNewChat}
              className="flex-1 bg-primary text-white dark:text-gray-100 rounded-md p-2 hover:bg-primary-dark dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out"
            >
              Start New Chat
            </button>
            <button
              onClick={handleOpenChatList}
              className="flex-1 bg-secondary text-white dark:text-gray-100 rounded-md p-2 hover:bg-secondary-dark dark:hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-secondary transition duration-150 ease-in-out"
            >
              Select Existing Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatParticipantSearch;
