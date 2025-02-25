import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { AlertCircle, Copy, InfoIcon, PlusCircle, ExternalLink } from "lucide-react";
import { getDatabase, ref, onValue, off, set } from 'firebase/database';
import { toast } from "sonner";
import CreateStudent from '../Registration/CreateStudent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
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

const getErrorBadgeColor = (reason) => {
  switch (reason) {
    case 'No ASN Found':
      return 'bg-red-500';
    case 'Student course not found':
      return 'bg-yellow-500';
    case 'Unknown course code':
      return 'bg-purple-500';
    case 'Error processing record':
      return 'bg-red-700';
    default:
      if (reason.includes('invalid for PASI')) {
        return 'bg-orange-500';
      }
      return 'bg-gray-500';
  }
};

const ErrorBadge = ({ reason }) => {
  const getTooltipContent = (reason) => {
    switch (reason) {
      case 'Student course not found':
        return "This error often indicates that the student has multiple email addresses associated with one ASN. Check the student's card under 'ASN Issues' to resolve this.";
      case 'No ASN Found':
        return "This could mean either: 1) The student does not have an ASN in YourWay, or 2) The ASN is not in the correct 9-digit format. Check the student's profile to verify.";
      default:
        return null;
    }
  };

  const tooltipContent = getTooltipContent(reason);

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary"
              className={`${getErrorBadgeColor(reason)} text-white cursor-help`}
            >
              {reason}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge 
      variant="secondary"
      className={`${getErrorBadgeColor(reason)} text-white`}
    >
      {reason}
    </Badge>
  );
};

const TabFailedLinks = ({ data = { details: [] }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [failedLinks, setFailedLinks] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState({});
  const [hasIssues, setHasIssues] = useState({
    multipleEmails: false,
    asnMissing: false
  });
  const [createStudentDialog, setCreateStudentDialog] = useState({
    isOpen: false,
    data: null
  });

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const failedLinksRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed`);
    
    const unsubscribe = onValue(failedLinksRef, (snapshot) => {
      const rawData = snapshot.val() || [];
      
      // Check for both types of issues
      const issues = rawData.reduce((acc, record) => ({
        multipleEmails: acc.multipleEmails || record.reason === 'Student course not found',
        asnMissing: acc.asnMissing || record.reason === 'No ASN Found'
      }), { multipleEmails: false, asnMissing: false });

      setHasIssues(issues);
      
      setFailedLinks(rawData);
      
      const total = Math.ceil(rawData.length / ITEMS_PER_PAGE) || 1;
      setTotalPages(total);
      setCurrentPage(prev => Math.min(prev, total));
      
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setPaginatedData(rawData.slice(startIndex, endIndex));
    });

    return () => off(failedLinksRef);
  }, [currentPage, schoolYear]);

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const checkListeners = {};

    paginatedData.forEach((record, index) => {
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const checkedPath = `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed/${absoluteIndex}/checked`;

      const checkedRef = ref(db, checkedPath);
      const checkedCallback = onValue(checkedRef, (snapshot) => {
        const checked = snapshot.val();
        setCheckedStatus(prev => ({
          ...prev,
          [absoluteIndex]: checked || false
        }));
      });

      checkListeners[absoluteIndex] = {
        ref: checkedRef,
        callback: checkedCallback
      };
    });

    return () => {
      Object.values(checkListeners).forEach(({ ref, callback }) => off(ref, 'value', callback));
    };
  }, [paginatedData, currentPage, schoolYear]);

  const handleCheckChange = async (index, checked) => {
    if (!schoolYear) return;

    try {
      const db = getDatabase();
      const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      const checkedRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/failed/${absoluteIndex}/checked`);
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

  const handleCreateStudent = (record) => {
    const pasiRecord = record.data.pasiRecord;
    setCreateStudentDialog({
      isOpen: true,
      data: {
        asn: pasiRecord.asn,
        email: pasiRecord.email,
        schoolYear: schoolYear,
        status: pasiRecord.status,
        studentName: pasiRecord.studentName,
        courseCode: pasiRecord.courseCode,
        courseDescription: pasiRecord.courseDescription
      }
    });
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
          <span className="font-semibold">Failed Links:</span> These PASI records couldn't be linked to YourWay records.
          Showing {paginatedData.length} of {failedLinks.length} records.
        </AlertDescription>
      </Alert>

      {hasIssues.multipleEmails && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <InfoIcon className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="ml-2 text-yellow-800">
            <span className="font-semibold">"Student course not found" Issues Detected:</span> This error typically means 
            that a student has multiple email addresses associated with one ASN number. To resolve this:
            <ol className="mt-2 ml-4 list-decimal">
              <li>Go to the student's card</li>
              <li>Select "ASN Issues" from the menu</li>
              <li>Review and consolidate the student's email addresses under the correct ASN</li>
            </ol>
            <p className="mt-2 text-sm italic">Hover over the "Student course not found" badge for a quick reminder of this information.</p>
          </AlertDescription>
        </Alert>
      )}

      {hasIssues.asnMissing && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <InfoIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2 text-red-800">
            <span className="font-semibold">"No ASN Found" Issues Detected:</span> This error indicates potential ASN formatting issues:
            <ol className="mt-2 ml-4 list-decimal">
              <li>Check if the student has an ASN assigned in YourWay</li>
              <li>Verify that the ASN is exactly 9 digits long</li>
              <li>Update the ASN if needed in the student's profile</li>
            </ol>
            <p className="mt-2 text-sm italic">Hover over the "No ASN Found" badge for more details.</p>
          </AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Done</TableHead>
            <TableHead>PASI Name</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>PASI Exit Date</TableHead>
            <TableHead>Linked</TableHead>
            <TableHead>PASI Status</TableHead>
            <TableHead>PASI Grade</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((record, index) => {
            const pasiRecord = record.data.pasiRecord;
            const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
            
            return (
              <TableRow 
                key={index}
                className={checkedStatus[absoluteIndex] ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={checkedStatus[absoluteIndex] || false}
                    onCheckedChange={(checked) => handleCheckChange(index, checked)}
                  />
                </TableCell>
                <TableCell>{pasiRecord.studentName}</TableCell>
                <TableCell>
                  <ErrorBadge reason={record.reason} />
                </TableCell>
                <TableCell>{pasiRecord.courseDescription}</TableCell>
                <TableCell>{pasiRecord.exitDate || '-'}</TableCell>
                <TableCell>
                  <Badge variant={pasiRecord.linked ? "success" : "secondary"}>
                    {pasiRecord.linked ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{pasiRecord.status}</TableCell>
                <TableCell>{pasiRecord.value || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyData(pasiRecord.asn)}
                      title="Copy ASN"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenPASI(pasiRecord.asn)}
                      title="Open in PASI"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateStudent(record)}
                      title="Create Student"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {renderPagination()}

      <CreateStudent
        isOpen={createStudentDialog.isOpen}
        onClose={() => setCreateStudentDialog({ isOpen: false, data: null })}
        {...createStudentDialog.data}
      />
    </div>
  );
};

export default TabFailedLinks;
