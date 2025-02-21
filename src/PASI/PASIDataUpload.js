import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Upload, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import { toast, Toaster } from 'sonner';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import PASIPreviewDialog from './PASIPreviewDialog';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, off, get, update } from 'firebase/database';

const PASIDataUpload = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asnEmails, setAsnEmails] = useState({});
  const [isLoadingAsns, setIsLoadingAsns] = useState(true);

  // Get school year options on mount
  useEffect(() => {
    const options = getSchoolYearOptions();
    setSchoolYearOptions(options);
    
    // Set default school year if available
    const defaultOption = options.find(opt => opt.isDefault);
    if (defaultOption) {
      setSelectedSchoolYear(defaultOption.value);
    }
  }, []);

  // Fetch ASNs
  useEffect(() => {
    let isMounted = true;
    
    const fetchAsns = async () => {
      if (!isMounted) return;
      
      try {
        const db = getDatabase();
        const asnsRef = ref(db, 'ASNs');
        const snapshot = await get(asnsRef);
        
        if (!snapshot.exists()) {
          throw new Error('No ASN data found');
        }
  
        const emailMapping = {};
        snapshot.forEach(childSnapshot => {
          const asn = childSnapshot.key;
          const data = childSnapshot.val();
          const emailKeys = data.emailKeys || {};
          const currentEmail = Object.entries(emailKeys)
            .find(([_, value]) => value === true)?.[0];
          
          if (currentEmail) {
            const formattedEmail = currentEmail.replace(/,/g, '.');
            emailMapping[asn] = formattedEmail;
          }
        });
      
        if (isMounted) {
          setAsnEmails(emailMapping);
        }
      } catch (error) {
        console.error('Error fetching ASNs:', error);
        toast.error("Failed to fetch ASN data: " + error.message);
      } finally {
        if (isMounted) {
          setIsLoadingAsns(false);
        }
      }
    };
  
    fetchAsns();
    return () => { isMounted = false; };
  }, []);

  // Convert school year format (e.g., "23/24" to "23_24")
  const formatSchoolYear = (year) => {
    return year.replace('/', '_');
  };

  // Set up database listener when school year changes
  useEffect(() => {
    if (!selectedSchoolYear) return;

    setIsLoading(true);
    setError(null);

    const db = getDatabase();
    const formattedYear = formatSchoolYear(selectedSchoolYear);
    
    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );

    const unsubscribe = onValue(schoolYearQuery, (snapshot) => {
      setIsLoading(false);
      
      if (!snapshot.exists()) {
        setPasiRecords([]);
        return;
      }

      const records = [];
      snapshot.forEach((child) => {
        records.push({
          id: child.key,
          ...child.val()
        });
      });

      records.sort((a, b) => a.studentName.localeCompare(b.studentName));
      setPasiRecords(records);
    }, (error) => {
      setError(error.message);
      setIsLoading(false);
    });

    return () => {
      off(schoolYearQuery);
    };
  }, [selectedSchoolYear]);

  // Calculate summary statistics
  const getSummary = () => {
    if (!pasiRecords.length) return null;

    return {
      total: pasiRecords.length,
      linked: pasiRecords.filter(r => r.linked).length,
      notLinked: pasiRecords.filter(r => !r.linked).length,
      uniqueStudents: new Set(pasiRecords.map(r => r.asn)).size,
      uniqueCourses: new Set(pasiRecords.map(r => r.courseCode)).size,
      missingPasiRecords: 0 // Placeholder as syncReport is removed
    };
  };

  const summary = getSummary();

  const extractSchoolYear = (enrollmentString) => {
    try {
      const matches = enrollmentString.match(/\((\d{4})\/\d{2}\/\d{2} to (\d{4})\/\d{2}\/\d{2}\)/);
      if (matches) {
        const startYear = matches[1];
        const endYear = matches[2];
        if (startYear === endYear) {
          return `${(parseInt(startYear) - 1).toString().slice(-2)}_${startYear.slice(-2)}`;
        } else {
          return `${startYear.slice(-2)}_${endYear.slice(-2)}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing school enrollment date:', error);
      return null;
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('Please select a file');
      return;
    }
  
    if (!selectedSchoolYear) {
      toast.error('Please select a school year before uploading');
      return;
    }
  
    setIsProcessing(true);
    setShowPreview(false); 

    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          if (!results?.data?.length) {
            throw new Error('No valid data found in CSV file');
          }
  
          const missingAsnRow = results.data.findIndex(row => !row['ASN']?.trim());
          if (missingAsnRow !== -1) {
            toast.error(`Missing ASN value in row ${missingAsnRow + 2}`);
            setIsProcessing(false);
            return;
          }
  
          const expectedSchoolYear = formatSchoolYear(selectedSchoolYear);
          const processedRecords = [];
  
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i];
            const extractedYear = extractSchoolYear(row['School Enrolment']);
            if (!extractedYear) {
              toast.error(`Invalid School Enrolment format in row ${i + 2}`);
              setIsProcessing(false);
              return;
            }
            
            if (extractedYear !== expectedSchoolYear) {
              toast.error(
                `School year mismatch in row ${i + 2}: Expected ${expectedSchoolYear}, found ${extractedYear}`
              );
              setIsProcessing(false);
              return;
            }
  
            const asn = row['ASN']?.trim() || '';
            const email = asnEmails[asn] || '-';
            const matchStatus = asnEmails[asn] ? 'Found in Database' : 'Not Found';
            const courseCode = row[' Code']?.trim().toUpperCase() || '';
            const period = row['Period']?.trim() || 'Regular';
            const schoolYear = expectedSchoolYear;
            const uniqueId = `${asn}_${courseCode.toLowerCase()}_${schoolYear}_${period.toLowerCase()}`;
            const existingRecord = pasiRecords.find(record => record.id === uniqueId);
            const isLinked = existingRecord?.linked === true ? true : false;
            
            processedRecords.push({
              asn,
              email,
              matchStatus,
              studentName: row['Student Name']?.trim() || '',
              courseCode,
              courseDescription: row[' Description']?.trim() || '',
              status: row['Status']?.trim() || 'Active',
              period,
              schoolYear,
              value: row['Value']?.trim() || '-',
              approved: row['Approved']?.trim() || 'No',
              assignmentDate: row['Assignment Date']?.trim() || '-',
              creditsAttempted: row['Credits Attempted']?.trim() || '-',
              deleted: row['Deleted']?.trim() || 'No',
              dualEnrolment: row['Dual Enrolment']?.trim() || 'No',
              exitDate: row['Exit Date']?.trim() || '-',
              fundingRequested: row['Funding Requested']?.trim() || 'No',
              term: row['Term']?.trim() || 'Full Year',
              lastUpdated: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              linked: isLinked,
              id: uniqueId
            });
          }
  
          setPreviewData(processedRecords);
          setShowPreview(true);
          event.target.value = '';
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast.error(error.message || 'Error processing CSV file');
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        toast.error('Failed to parse CSV file');
        setIsProcessing(false);
      }
    };
  
    Papa.parse(file, config);
  };

  const handleConfirmUpload = async () => {
    setIsProcessing(true);
    try {
      const db = getDatabase();
      const formattedYear = formatSchoolYear(selectedSchoolYear);
      const updates = {};
      
      pasiRecords.forEach(record => {
        updates[`pasiRecords/${record.id}`] = null;
      });
  
      previewData.forEach(record => {
        const uniqueId = `${record.asn}_${record.courseCode.toLowerCase()}_${record.schoolYear}_${record.period.toLowerCase()}`;
        updates[`pasiRecords/${uniqueId}`] = record;
      });
  
      await update(ref(db), updates);
      toast.success(`PASI records for ${selectedSchoolYear} replaced successfully`);
      setShowPreview(false);
    } catch (error) {
      console.error('Error replacing records:', error);
      toast.error(error.message || 'Failed to replace records');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PASI Records Upload</CardTitle>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Process Overview</h3>
              <p>Follow these steps to upload and manage PASI student records:</p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Visit the <a 
                  href="https://extranet.education.alberta.ca/PASI/PASIprep/course-enrolment/list" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  PASI Prep Course Enrollment List <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Select the current school year in PASI Prep</li>
                <li>Export the data as a CSV file</li>
                <li>Upload the CSV file using the button below</li>
                <li>Review and confirm the data in the preview window</li>
                <li>Once uploaded, go to the Sync Report page to sync with local records</li>
              </ol>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Select 
              value={selectedSchoolYear} 
              onValueChange={setSelectedSchoolYear}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {schoolYearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span style={{ color: option.color }}>
                      {option.value}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!selectedSchoolYear || isProcessing || isLoadingAsns}
            >
              <Upload className="h-4 w-4" />
              <label className="cursor-pointer">
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!selectedSchoolYear || isProcessing || isLoadingAsns}
                />
              </label>
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              Error: {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : pasiRecords.length > 0 ? (
            summary && (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-4">Current Records Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Records:</p>
                      <p className="font-medium">{summary.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total number of course enrollments in PASI</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Linked Records:</p>
                      <p className="font-medium">{summary.linked}</p>
                      <p className="text-xs text-muted-foreground mt-1">Records successfully matched to YourWay students</p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600">Not Linked:</p>
                      <p className="font-medium">{summary.notLinked}</p>
                      <p className="text-xs text-muted-foreground mt-1">Records pending matching with YourWay students</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Students:</p>
                      <p className="font-medium">{summary.uniqueStudents}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total number of individual students</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Courses:</p>
                      <p className="font-medium">{summary.uniqueCourses}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total number of distinct courses</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Missing PASI Records:</p>
                      <p className="font-medium">{summary.missingPasiRecords}</p>
                      <p className="text-xs text-muted-foreground mt-1">YourWay courses without PASI records</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No PASI records found for {selectedSchoolYear}
            </div>
          )}
        </CardContent>
    
        <PASIPreviewDialog 
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          records={previewData}
          currentRecords={pasiRecords}
          asnEmails={asnEmails}
          onConfirm={handleConfirmUpload}
          isConfirming={isProcessing}
          selectedSchoolYear={selectedSchoolYear}
        />
      </Card>
    </>
  );
};

export default PASIDataUpload;
