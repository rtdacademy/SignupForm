import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import { FileText, Users, Database, Loader2 } from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';

const PasiRecords = () => {
  // Get PASI records from context
  const { pasiStudentSummariesCombined, isLoadingStudents } = useSchoolYear();
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Handle record selection
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    console.log('Selected PASI Record:', record);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FileText className="mr-2" /> PASI Records Management
      </h1>
    
      
      {/* PASI Records Table */}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
       
        
        {isLoadingStudents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
            <span>Loading records...</span>
          </div>
        ) : pasiStudentSummariesCombined && pasiStudentSummariesCombined.length > 0 ? (
          <Table>
            <TableCaption>List of PASI Student Records</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ASN</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pasiStudentSummariesCombined.map((record, index) => (
                <TableRow 
                  key={record.id || index}
                  onClick={() => handleRecordSelect(record)}
                  className={`cursor-pointer hover:bg-gray-100 ${selectedRecord?.id === record.id ? 'bg-blue-50' : ''}`}
                >
                  <TableCell>{record.asn || 'N/A'}</TableCell>
                  <TableCell>{record.courseCode || 'N/A'}</TableCell>
                  <TableCell>{record.studentName || 'N/A'}</TableCell>
                  <TableCell>{record.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No PASI records found for the current school year.
          </div>
        )}
      </div>
      

    </div>
  );
};

export default PasiRecords;
