import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";

const ASNVerification = () => {
    const [asnData, setAsnData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const db = getDatabase();
          
          // Fetch ASNs
          const asnRef = ref(db, 'ASNs');
          const asnSnapshot = await get(asnRef);
          const asnEntries = asnSnapshot.val() || {};
  
          // Create an array to store all promises for student profile fetches
          const profilePromises = Object.entries(asnEntries).map(async ([asn, emailObj]) => {
            const studentEmailKey = Object.keys(emailObj)[0];
            const studentRef = ref(db, `students/${studentEmailKey}/profile`);
            const studentSnapshot = await get(studentRef);
            const studentProfile = studentSnapshot.val() || {};
  
            return {
              asn,
              studentEmailKey,
              email: studentProfile.StudentEmail || '',
              firstName: studentProfile.firstName || '',
              lastName: studentProfile.lastName || '',
            };
          });
  
          // Wait for all profile fetches to complete
          const resolvedData = await Promise.all(profilePromises);
          setAsnData(resolvedData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    const filteredData = asnData.filter(item => 
      item.asn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Loading ASN data...</div>;
    }
  
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">ASN Verification</h2>
          <Input
            placeholder="Search ASNs or student info..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
  
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ASN</TableHead>
                <TableHead>Student Email</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.asn}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.firstName}</TableCell>
                  <TableCell>{item.lastName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };
  
  export default ASNVerification;