import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, Copy, RotateCw, ExternalLink } from "lucide-react";
import { getDatabase, ref, onValue, off, set } from 'firebase/database';
import { toast } from "sonner";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { STATUS_OPTIONS, getStatusColor, COURSE_OPTIONS } from '../config/DropdownOptions';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const PASI_URL = 'https://extranet.education.alberta.ca/PASI/PASIprep/view-student';

const formatASNForURL = (asn) => {
  return asn ? asn.replace(/-/g, '') : '';
};

const handleOpenPASI = (asn) => {
  const formattedASN = formatASNForURL(asn);
  const url = `${PASI_URL}/${formattedASN}`;
  window.open(url, 'pasiWindow');
};

// Helper function to get course information
const getCourseInfo = (courseId) => {
  const course = COURSE_OPTIONS.find(course => course.courseId === parseInt(courseId));
  return course || { value: 'Unknown Course', color: '#666666' };
};

const StatusCell = ({ record, studentKey, currentStatus, originalStatus, onStatusChange, onReset }) => {
  const hasChanged = currentStatus !== originalStatus;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentStatus}
        onValueChange={(newStatus) => onStatusChange(studentKey, record.courseId, newStatus)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            <span style={{ color: getStatusColor(currentStatus) }}>
              {currentStatus}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              <span style={{ color: option.color }}>
                {option.value}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasChanged && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6">
            Changed
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onReset}
            title="Reset to original status"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const CourseCell = ({ courseId }) => {
  const courseInfo = getCourseInfo(courseId);
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: courseInfo.color }}>
        {courseInfo.value}
      </span>
      <span className="text-xs text-muted-foreground">
        ({courseInfo.pasiCode || 'No PASI Code'})
      </span>
    </div>
  );
};

const TabMissingRecords = ({ data = { details: [], total: 0 }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [checkedStatus, setCheckedStatus] = useState({});
  const [originalStatuses, setOriginalStatuses] = useState({});
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [recordSchoolYear, setRecordSchoolYear] = useState('');
  const [activeStatus, setActiveStatus] = useState('');

  useEffect(() => {
    const total = Math.ceil(data.details.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(total);
    setCurrentPage((prev) => Math.min(prev, total));
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(data.details.slice(startIndex, endIndex));
  }, [data.details, currentPage]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    
    const schoolYearRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/0/schoolYear`);
    const activeStatusRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/0/activeStatus`);
    
    const schoolYearCallback = onValue(schoolYearRef, (snapshot) => {
      setRecordSchoolYear(snapshot.val() || '');
    });

    const activeStatusCallback = onValue(activeStatusRef, (snapshot) => {
      setActiveStatus(snapshot.val() || '');
    });

    return () => {
      off(schoolYearRef, 'value', schoolYearCallback);
      off(activeStatusRef, 'value', activeStatusCallback);
    };
  }, [schoolYear]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const listeners = {};
    const checkListeners = {};
    const originalStatusListeners = {};

    paginatedData.forEach((record, index) => {
      const studentKey = sanitizeEmail(record.email);
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const statusPath = `students/${studentKey}/courses/${record.courseId}/Status/Value`;
      const checkedPath = `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/checked`;
      const originalStatusPath = `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/status`;

      // Set up listeners for status, checked status, and original status
      const setupListener = (path, callback) => {
        const reference = ref(db, path);
        const valueCallback = onValue(reference, (snapshot) => {
          callback(snapshot.val());
        });
        return { ref: reference, callback: valueCallback };
      };

      listeners[`${studentKey}_${record.courseId}`] = setupListener(
        statusPath,
        (status) => setStudentStatuses(prev => ({ ...prev, [`${studentKey}_${record.courseId}`]: status }))
      );

      checkListeners[absoluteIndex] = setupListener(
        checkedPath,
        (checked) => setCheckedStatus(prev => ({ ...prev, [absoluteIndex]: checked || false }))
      );

      originalStatusListeners[`${studentKey}_${record.courseId}`] = setupListener(
        originalStatusPath,
        (status) => setOriginalStatuses(prev => ({ ...prev, [`${studentKey}_${record.courseId}`]: status }))
      );
    });

    return () => {
      Object.values(listeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
      Object.values(checkListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
      Object.values(originalStatusListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
    };
  }, [paginatedData, currentPage, schoolYear]);

  const handleStatusChange = async (studentKey, courseId, newStatus) => {
    try {
      const db = getDatabase();
      const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/Status/Value`);
      await set(statusRef, newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleResetStatus = async (studentKey, courseId, originalStatus) => {
    try {
      await handleStatusChange(studentKey, courseId, originalStatus);
      toast.success('Status reset to original value');
    } catch (error) {
      toast.error('Failed to reset status');
    }
  };

  const handleCheckChange = async (index, checked) => {
    if (!schoolYear) return;

    try {
      const db = getDatabase();
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const checkedRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/studentCourseSummariesMissingPasi/details/${absoluteIndex}/checked`);
      await set(checkedRef, checked);
      toast.success('Record status updated');
    } catch (error) {
      console.error('Error updating checked status:', error);
      toast.error('Failed to update record status');
    }
  };

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <span className="font-semibold">Missing PASI Records:</span> These are courses in YourWay that don't have any corresponding PASI record.
          Showing {paginatedData.length} of {data.details.length} records.
          {recordSchoolYear && <span className="ml-2">School Year: {recordSchoolYear}</span>}
          {activeStatus && <span className="ml-2">State: {activeStatus}</span>}
        </AlertDescription>
      </Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Done</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>School Year</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((record, index) => {
            const studentKey = sanitizeEmail(record.email);
            const statusKey = `${studentKey}_${record.courseId}`;
            const currentStatus = studentStatuses[statusKey] || record.status;
            const originalStatus = originalStatuses[statusKey] || record.status;
            const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
            
            return (
              <TableRow key={index} className={checkedStatus[absoluteIndex] ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={checkedStatus[absoluteIndex] || false}
                    onCheckedChange={(checked) => handleCheckChange(index, checked)}
                  />
                </TableCell>
                <TableCell>{record.studentName}</TableCell>
                <TableCell>
                  <CourseCell courseId={record.courseId} />
                </TableCell>
                <TableCell>{record.email}</TableCell>
                <TableCell>
                  <StatusCell 
                    record={record}
                    studentKey={studentKey}
                    currentStatus={currentStatus}
                    originalStatus={originalStatus}
                    onStatusChange={handleStatusChange}
                    onReset={() => handleResetStatus(studentKey, record.courseId, originalStatus)}
                  />
                </TableCell>
                <TableCell>{recordSchoolYear}</TableCell>
                <TableCell>{activeStatus}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyData(record.asn)}
                      title="Copy ASN"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenPASI(record.asn)}
                      title="Open in PASI"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {renderPagination()}
    </div>
  );
};

export default TabMissingRecords;
