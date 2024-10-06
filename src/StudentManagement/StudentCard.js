import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { CheckCircleIcon, CalendarIcon, BookOpenIcon, MessageSquare } from 'lucide-react';
import Select from 'react-select';
import { getDatabase, ref, set } from 'firebase/database';
import { STATUS_OPTIONS, getStatusColor } from '../config/DropdownOptions';
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import ChatApp from '../chat/ChatApp';

const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
  '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
  '#F06292', '#BA68C8', '#4FC3F7', '#4DB6AC', '#FFF176',
  '#FF8A65', '#A1887F', '#90A4AE', '#E57373', '#64B5F6'
];

const getColorFromInitials = (initials) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

const ProgressBar = ({ percent, icon, label }) => {
  const isValidPercent = typeof percent === 'number' && !isNaN(percent);
  
  if (!isValidPercent) return null;

  return (
    <div className="flex items-center mt-2">
      {icon}
      <div className="ml-2 flex-grow">
        <div className="text-[10px] text-gray-500 mb-1">{label}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
      <div className="ml-2 text-[10px] font-semibold">{percent}%</div>
    </div>
  );
};

const StudentCard = React.memo(({ student, index, selectedStudentId, onStudentSelect, courseInfo, courseTeachers, courseSupportStaff }) => {
  const isSelected = student.id === selectedStudentId;
  const bgColor = isSelected ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const avatarColor = getColorFromInitials(initials);

  const [statusValue, setStatusValue] = useState(student.Status_Value);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setStatusValue(student.Status_Value);
  }, [student.Status_Value]);

  const handleStatusChange = useCallback(async (selectedOption) => {
    const newStatus = selectedOption.value;
    const db = getDatabase();

    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);

    const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/Status/Value`);

    try {
      await set(statusRef, newStatus);
      setStatusValue(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }, [student.id]);

  const statusOptions = STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: option.value,
    color: option.color
  }));

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '28px',
      height: '28px',
      boxShadow: state.isFocused ? '0 0 0 2px #3B82F6' : 'none',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      '&:hover': {
        borderColor: '#3B82F6'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '28px',
      padding: '0 6px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '0 6px'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '12px',
      padding: '4px 8px',
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#E5E7EB' : 'white',
      color: state.isSelected ? 'white' : state.data.color,
      '&:active': {
        backgroundColor: '#3B82F6'
      }
    }),
    singleValue: (provided, { data }) => ({
      ...provided,
      fontSize: '12px',
      color: data.color,
      fontWeight: '600'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

  const lastWeekStatus = student.StatusCompare;
  const lastWeekColor = getStatusColor(lastWeekStatus);

  const handleCardClick = useCallback((event) => {
    onStudentSelect(student);
  }, [onStudentSelect, student]);

  const handleSelectClick = useCallback((event) => {
    event.stopPropagation();
    if (!isSelected) {
      onStudentSelect(student);
    }
  }, [isSelected, onStudentSelect, student]);

  const handleOpenChat = useCallback((event) => {
    event.stopPropagation();
    setIsChatOpen(true);
  }, []);

  return (
    <>
      <Card
        className={`cursor-pointer transition-shadow duration-200 ${bgColor} hover:shadow-md mb-3`}
        onClick={handleCardClick}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback 
                className="text-sm font-medium" 
                style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium truncate">
                {student.firstName} {student.lastName}
              </CardTitle>
              <p className="text-xs text-gray-500 truncate">{student.StudentEmail}</p>
            </div>
            {isSelected && <CheckCircleIcon className="w-5 h-5 text-blue-500" />}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-xs mb-2">
            <p><span className="font-medium">Course:</span> {student.Course_Value}</p>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-grow" onClick={handleSelectClick}>
              <Select
                value={statusOptions.find(option => option.value === statusValue)}
                onChange={handleStatusChange}
                options={statusOptions}
                styles={customStyles}
                isSearchable={false}
                className="w-full text-xs"
                classNamePrefix="select-small"
                menuPlacement="auto"
                menuPosition="fixed"
              />
            </div>
            <div className="flex-shrink-0 text-center" style={{ minWidth: '50px' }}>
              <div className="text-[9px] text-gray-500 leading-tight">Last Week</div>
              <div className="text-[10px] font-semibold" style={{ color: lastWeekColor }}>{lastWeekStatus}</div>
            </div>
          </div>
          <ProgressBar
            percent={student.PercentScheduleComplete}
            icon={<CalendarIcon className="w-4 h-4 text-blue-500" />}
            label="Schedule Progress"
          />
          <ProgressBar
            percent={student.PercentCompleteGradebook}
            icon={<BookOpenIcon className="w-4 h-4 text-green-500" />}
            label="Gradebook Progress"
          />
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleOpenChat}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-[1000px] h-[800px]">
          <DialogHeader>
            <DialogTitle>Chat with {student.firstName} {student.lastName}</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-hidden">
            <ChatApp
              courseInfo={courseInfo}
              courseTeachers={courseTeachers}
              courseSupportStaff={courseSupportStaff}
              initialParticipants={[{
                email: student.StudentEmail,
                displayName: `${student.firstName} ${student.lastName}`,
                type: 'student'
              }]}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default StudentCard;