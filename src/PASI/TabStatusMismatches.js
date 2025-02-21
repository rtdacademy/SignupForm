import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { AlertCircle, RotateCw, Copy, FileText } from "lucide-react";
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { toast } from "sonner";
import { STATUS_OPTIONS, getStatusColor } from '../config/DropdownOptions';
import PASIRecordDialog from './PASIRecordDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const TabStatusMismatches = ({ data = { details: [] }, schoolYear }) => {
  const [studentStatuses, setStudentStatuses] = useState({});
  const [selectedPasiRecord, setSelectedPasiRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const getStudentKeyFromSummaryKey = (summaryKey) => {
    return summaryKey.split('_')[0];
  };

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

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

  useEffect(() => {
    // Calculate total pages
    const total = Math.ceil(data.details.length / ITEMS_PER_PAGE) || 1;
    setTotalPages(total);

    // Ensure currentPage is within bounds
    setCurrentPage((prev) => Math.min(prev, total));

    // Update paginated data when page changes or data changes
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(data.details.slice(startIndex, endIndex));
  }, [data.details, currentPage]);

  useEffect(() => {
    const db = getDatabase();
    const listeners = {};

    // Only set up listeners for visible items
    paginatedData.forEach(mismatch => {
      const studentKey = getStudentKeyFromSummaryKey(mismatch.summaryKey);
      const statusPath = `students/${studentKey}/courses/${mismatch.courseId}/Status/Value`;
      const statusRef = ref(db, statusPath);

      const callback = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        setStudentStatuses(prev => ({
          ...prev,
          [`${studentKey}_${mismatch.courseId}`]: status
        }));
      });

      listeners[`${studentKey}_${mismatch.courseId}`] = {
        ref: statusRef,
        callback
      };
    });

    return () => {
      Object.values(listeners).forEach(({ ref, callback }) => {
        off(ref, 'value', callback);
      });
    };
  }, [paginatedData]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {pageNumbers.map((page) => (
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

  const StatusCell = ({ mismatch, studentKey }) => {
    const statusKey = `${studentKey}_${mismatch.courseId}`;
    const currentStatus = studentStatuses[statusKey] || mismatch.yourWayStatus;
    const hasChanged = currentStatus !== mismatch.yourWayStatus;

    return (
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus}
          onValueChange={(newStatus) => 
            handleStatusChange(studentKey, mismatch.courseId, newStatus)
          }
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
              onClick={() => handleResetStatus(studentKey, mismatch.courseId, mismatch.yourWayStatus)}
              title="Reset to original status"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <span className="font-semibold">Status Mismatches:</span> These records have incompatible statuses between YourWay and PASI. 
          Showing {paginatedData.length} of {data.details.length} records.
        </AlertDescription>
      </Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>YourWay Status</TableHead>
            <TableHead>PASI Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((mismatch, index) => {
            const studentKey = getStudentKeyFromSummaryKey(mismatch.summaryKey);
            
            return (
              <TableRow key={index}>
                <TableCell>{mismatch.studentName}</TableCell>
                <TableCell>{mismatch.courseDescription}</TableCell>
                <TableCell>
                  <StatusCell mismatch={mismatch} studentKey={studentKey} />
                </TableCell>
                <TableCell>{mismatch.pasiStatus}</TableCell>
                <TableCell>{mismatch.reason}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopyData(mismatch.asn)}
                      title="Copy ASN"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPasiRecord(mismatch.id)}
                      title="View PASI Details"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {renderPagination()}

      <PASIRecordDialog
  isOpen={!!selectedPasiRecord}
  onClose={() => setSelectedPasiRecord(null)}
  pasiRecordId={selectedPasiRecord}
  schoolYear={schoolYear}
/>
    </div>
  );
};

export default TabStatusMismatches;
