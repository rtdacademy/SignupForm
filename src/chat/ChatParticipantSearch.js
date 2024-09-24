import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, User, UserCog, ChevronDown, ChevronUp } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import Select from 'react-select';

export default function ChatParticipantSearch({ onParticipantsSelect, courseInfo, courseTeachers, courseSupportStaff }) {
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

            studentsList.push({
              id: childSnapshot.key,
              displayName: `${studentData.profile.firstName || ''} ${studentData.profile.lastName || ''}`.trim(),
              email: childSnapshot.key.replace(',', '.').toLowerCase(), // Ensure lowercase for consistency
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
          staffList.push({
            id: childSnapshot.key,
            displayName: staffData.displayName,
            email: staffData.email.toLowerCase(), // Ensure lowercase for consistency
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
        const sanitizedEmail = sanitizeEmail(email).toLowerCase(); // Ensure lowercase
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

  const filterParticipants = useCallback(() => {
    setIsSearching(true);
    let results = [];

    // Filter staff
    if (selectedUserType.value === 'all' || selectedUserType.value === 'staff') {
      const filteredStaff = allStaff.filter(staff => 
        staff.email !== user.email.toLowerCase() && // Case-insensitive comparison
        (matchesSearchTerm(staff.displayName, searchTerm) ||
         matchesSearchTerm(staff.email, searchTerm))
      );
      console.log('Filtered Staff:', filteredStaff); // Debugging log
      results = results.concat(filteredStaff);
    }

    // Filter students
    if (selectedUserType.value === 'all' || selectedUserType.value === 'student') {
      const filteredStudents = allStudents.filter(student => {
        const isInSelectedCourses = selectedCourses.length === 0 || 
          student.courses.some(course => selectedCourses.some(sc => sc.value === course.id));
        const isActive = !showOnlyActive || student.courses.some(course => course.isActive);
        const matchesSearch = !searchTerm || 
          matchesSearchTerm(student.displayName, searchTerm) || 
          matchesSearchTerm(student.email, searchTerm);
        return student.email !== user.email.toLowerCase() && isInSelectedCourses && isActive && matchesSearch;
      });
      console.log('Filtered Students:', filteredStudents); // Debugging log
      results = results.concat(filteredStudents);
    }

    console.log('Combined Results:', results); // Debugging log

    setSearchResults(results);
    setStudentCount(results.filter(r => r.type === 'student').length);
    setStaffCount(results.filter(r => r.type === 'staff').length);
    setIsSearching(false);
  }, [user.email, allStudents, allStaff, selectedCourses, searchTerm, showOnlyActive, selectedUserType]);

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      filterParticipants();
      setShowResults(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filterParticipants, searchTerm, selectedCourses, showOnlyActive, selectedUserType]);

  const handleParticipantSelect = (participant) => {
    if (!selectedParticipants.some(p => p.email === participant.email)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (participantToRemove) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.email !== participantToRemove.email));
  };

  const handleDoneSelecting = () => {
    const formattedParticipants = selectedParticipants.map(participant => ({
      ...participant,
      email: sanitizeEmail(participant.email) // Sanitize email for database key
    }));
    onParticipantsSelect(formattedParticipants);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    filterParticipants();
  };

  const renderActiveCourses = (activeCourses) => {
    if (!activeCourses || activeCourses.length === 0) return null;

    return activeCourses.map((course) => (
      <div key={course.id} className="text-xs text-gray-500">
        {course.name}
      </div>
    )).slice(0, 3); // Limit to 3 courses
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
              <div className="text-xs text-gray-500">Active Courses:</div>
              {renderActiveCourses(participant.courses)}
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
          <div key={participant.email} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
            <span className="text-sm">{participant.displayName}</span>
            <button
              onClick={() => handleRemoveParticipant(participant)}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
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
        <h3 className="text-sm font-semibold mb-2">Course Staff:</h3>
        <ul className="bg-white border rounded-md shadow-lg">
          {courseTeachers && courseTeachers.map((teacherEmail, index) => {
            const teacherDetails = courseStaffDetails[teacherEmail] || {};
            return (
              <li
                key={`teacher-${index}`}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleParticipantSelect({ 
                  email: teacherEmail.toLowerCase(), // Ensure lowercase
                  displayName: teacherDetails.displayName || teacherEmail, 
                  type: 'staff' 
                })}
              >
                <div className="flex items-center">
                  <UserCog size={16} className="mr-2 text-blue-500" />
                  <div>
                    <div className="font-semibold">{teacherDetails.displayName || teacherEmail}</div>
                    <div className="text-xs text-gray-500">Teacher</div>
                  </div>
                </div>
              </li>
            );
          })}
          {courseSupportStaff && courseSupportStaff.map((staffEmail, index) => {
            const staffDetails = courseStaffDetails[staffEmail] || {};
            return (
              <li
                key={`support-${index}`}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleParticipantSelect({ 
                  email: staffEmail.toLowerCase(), // Ensure lowercase
                  displayName: staffDetails.displayName || staffEmail, 
                  type: 'staff' 
                })}
              >
                <div className="flex items-center">
                  <UserCog size={16} className="mr-2 text-blue-500" />
                  <div>
                    <div className="font-semibold">{staffDetails.displayName || staffEmail}</div>
                    <div className="text-xs text-gray-500">Support Staff</div>
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
      <div className="flex items-center">
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
    <div className="w-full max-w-md">
      <div className="flex flex-col space-y-2 mb-4">
        {renderCourseStaff()}
        {!isStaff && (
          <button
            onClick={() => setShowAdvancedSearch(prev => !prev)} // Toggle the state
            className="mt-2 bg-gray-200 text-gray-700 rounded-full px-4 py-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out flex items-center justify-center"
          >
            {showAdvancedSearch ? 'Hide Other Participants' : 'Find Other Participants'} 
            {showAdvancedSearch ? <ChevronUp className="inline ml-2" size={16} /> : <ChevronDown className="inline ml-2" size={16} />}
          </button>
        )}
        {(isStaff || showAdvancedSearch) && (
          <>
            {renderAdvancedSearchOptions()}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full p-2 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Search for participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
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
                        key={participant.id || participant.email} // Use email as key if id is not present
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleParticipantSelect(participant);
                          setShowResults(false); // Close the search results list after selection
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
          <h3 className="text-sm font-semibold mb-2">Selected Participants:</h3>
          {renderParticipantList()}
        </div>
      )}
      {selectedParticipants.length > 0 && (
        <button
          onClick={handleDoneSelecting}
          className="mt-4 bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out w-full"
        >
          Start Chat
        </button>
      )}
    </div>
  );
}
