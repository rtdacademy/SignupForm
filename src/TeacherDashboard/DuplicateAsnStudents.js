import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AlertCircle, Download, Copy, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import Papa from 'papaparse';
import { toast } from 'sonner';
import { useSchoolYear, getStudentsWithDuplicateAsn } from '../context/SchoolYearContext';

const DuplicateAsnStudents = () => {
  const { duplicateAsnStudents, isLoadingStudents } = useSchoolYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'asn', direction: 'asc' });

  // Group students by ASN for better visualization
  const studentsByAsn = useMemo(() => {
    if (!duplicateAsnStudents || duplicateAsnStudents.length === 0) return {};

    const grouped = {};
    duplicateAsnStudents.forEach(student => {
      if (!student.asn) return;
      
      if (!grouped[student.asn]) {
        grouped[student.asn] = [];
      }
      grouped[student.asn].push(student);
    });

    return grouped;
  }, [duplicateAsnStudents]);

  // Get a flat list of ASNs that have duplicates
  const duplicateAsns = useMemo(() => {
    return Object.keys(studentsByAsn).sort();
  }, [studentsByAsn]);

  // Filter ASNs based on search term
  const filteredAsns = useMemo(() => {
    if (!searchTerm) return duplicateAsns;
    
    return duplicateAsns.filter(asn => {
      const matchAsn = asn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStudents = studentsByAsn[asn].some(student => 
        (student.StudentName && student.StudentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.FirstName && student.FirstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.LastName && student.LastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.StudentEmail && student.StudentEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return matchAsn || matchStudents;
    });
  }, [duplicateAsns, studentsByAsn, searchTerm]);

  // Sort the student records for each ASN
  const sortRecords = (records) => {
    if (!records) return [];
    
    return [...records].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle special cases
      if (sortConfig.key === 'name') {
        aValue = a.StudentName || `${a.FirstName || ''} ${a.LastName || ''}`.trim();
        bValue = b.StudentName || `${b.FirstName || ''} ${b.LastName || ''}`.trim();
      } else if (sortConfig.key === 'email') {
        aValue = a.StudentEmail || '';
        bValue = b.StudentEmail || '';
      }
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Request sorting by column
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle exporting the data to CSV
  const handleExportCsv = () => {
    if (!duplicateAsnStudents || duplicateAsnStudents.length === 0) {
      toast.error('No duplicate ASNs to export');
      return;
    }

    const csvData = duplicateAsnStudents.map(student => ({
      ASN: student.asn || '',
      StudentName: student.StudentName || `${student.FirstName || ''} ${student.LastName || ''}`.trim(),
      Email: student.StudentEmail || '',
      CourseID: student.CourseID || '',
      School_Year: student.School_x0020_Year_Value || '',
      Status: student.Status_Value || '',
      ActiveFutureArchived: student.ActiveFutureArchived_Value || '',
      LastAccessed: student.LastAccessed_Value || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'duplicate_asn_students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file downloaded successfully');
  };

  // Copy an ASN to clipboard
  const handleCopyAsn = (asn) => {
    navigator.clipboard.writeText(asn);
    toast.success(`ASN ${asn} copied to clipboard`);
  };

  if (isLoadingStudents) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center w-full sm:w-auto max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ASN, name or email..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportCsv}
          disabled={!duplicateAsnStudents || duplicateAsnStudents.length === 0}
          className="shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {filteredAsns.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No duplicate ASNs found</AlertTitle>
          <AlertDescription>
            {searchTerm 
              ? 'No results match your search criteria. Try adjusting your search term.' 
              : 'There are currently no students with duplicate ASNs but different email addresses.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
            <h3 className="text-amber-800 font-medium mb-1">Found {duplicateAsns.length} ASNs with multiple student accounts</h3>
            
          </div>

          {filteredAsns.map(asn => (
            <Card key={asn} className="overflow-hidden">
              <CardHeader className="bg-muted py-2 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center">
                    ASN: {asn}
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                      {studentsByAsn[asn].length} accounts
                    </Badge>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopyAsn(asn)}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer" 
                          onClick={() => requestSort('name')}
                        >
                          Student Name
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => requestSort('email')}
                        >
                          Email
                          {sortConfig.key === 'email' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </TableHead>
                        <TableHead>Course ID</TableHead>
                        <TableHead>School Year</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortRecords(studentsByAsn[asn]).map((student, index) => (
                        <TableRow key={`${student.asn}-${student.StudentEmail}-${index}`}>
                          <TableCell className="font-medium">
                            {student.StudentName || `${student.FirstName || ''} ${student.LastName || ''}`.trim() || 'N/A'}
                          </TableCell>
                          <TableCell>{student.StudentEmail || 'N/A'}</TableCell>
                          <TableCell>{student.CourseID || 'N/A'}</TableCell>
                          <TableCell>{student.School_x0020_Year_Value || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={student.Status_Value?.includes('Locked') ? 'destructive' : 
                                     student.Status_Value?.includes('Completed') || 
                                     student.Status_Value?.includes('Removed') ? 'outline' : 'default'}
                            >
                              {student.Status_Value || 'N/A'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DuplicateAsnStudents;