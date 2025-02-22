import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { AlertCircle, Copy, ExternalLink } from "lucide-react";
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const TabManualMapping = ({ data = { details: [] }, schoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [mappingRecords, setMappingRecords] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (!schoolYear) return;

    const db = getDatabase();
    const mappingRef = ref(db, `pasiSyncReport/schoolYear/${schoolYear}/newLinks/needsManualCourseMapping`);
    const categoryRef = ref(db, `teacherCategories/info@rtdacademy,com/PASI_Course_Link/name`);
    
    const unsubscribe = onValue(mappingRef, (snapshot) => {
      const data = snapshot.val() || [];
      setMappingRecords(data);
      
      // Update pagination
      const total = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
      setTotalPages(total);
      setCurrentPage(prev => Math.min(prev, total));
      
      // Update paginated data
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setPaginatedData(data.slice(startIndex, endIndex));
    });

    // Get category name
    const categoryUnsubscribe = onValue(categoryRef, (snapshot) => {
      setCategoryName(snapshot.val() || 'PASI Course Link');
    });

    return () => {
      off(mappingRef);
      off(categoryRef);
    };
  }, [currentPage, schoolYear]);

  const handleCopyData = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleOpenDashboard = () => {
    window.open('https://yourway.rtdacademy.com/teacher-dashboard', '_blank');
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
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Needs Manual Course Mapping:</span> These PASI records have course codes that need to be manually mapped to YourWay courses.
              Showing {paginatedData.length} of {mappingRecords.length} records.
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>To link these students:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>Go to the <Button 
                    variant="link" 
                    className="h-auto p-0 text-sm font-normal text-blue-500 hover:text-blue-700"
                    onClick={handleOpenDashboard}
                  >
                    Teacher Dashboard <ExternalLink className="h-3 w-3 inline ml-1" />
                  </Button>
                </li>
                <li>Filter by the category "<span className="font-medium">{categoryName}</span>"</li>
                <li>You will see all students that need to be linked to a PASI record</li>
              </ol>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Code</TableHead>
            <TableHead>ASN</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>School Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((record, index) => (
            <TableRow key={index}>
              <TableCell>{record.courseCode}</TableCell>
              <TableCell>{record.asn}</TableCell>
              <TableCell>{record.email}</TableCell>
              <TableCell>{record.schoolYear}</TableCell>
              <TableCell>
                <Badge 
                  variant={record.flaggedForReview ? "warning" : "secondary"}
                  className={record.flaggedForReview ? "bg-yellow-500 text-white" : ""}
                >
                  {record.flaggedForReview ? "Flagged for Review" : "Needs Mapping"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopyData(record.asn)}
                  title="Copy ASN"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {renderPagination()}
    </div>
  );
};

export default TabManualMapping;