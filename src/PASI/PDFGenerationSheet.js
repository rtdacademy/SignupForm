import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Loader2, 
  Download, 
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  File
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, database, storage } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

const PDFGenerationSheet = ({ 
  isOpen, 
  onOpenChange, 
  filteredRecords,
  selectedRecords = [],
  schoolYear
}) => {
  const [documentTitle, setDocumentTitle] = useState('Official Student Registration Document');
  const [documentSubtitle, setDocumentSubtitle] = useState(`Academic Year ${schoolYear}`);
  const [customProperties, setCustomProperties] = useState([
    { key: 'Parent Approved', value: 'Yes', description: 'Confirmation that parent/guardian has approved student enrollment' },
    { key: 'Alberta Resident Verified', value: 'Yes', description: 'Verification of Alberta residency status for funding eligibility' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrls, setDownloadUrls] = useState([]);

  // Get records to process (either selected or all filtered)
  const recordsToProcess = selectedRecords.length > 0 ? selectedRecords : filteredRecords;
  
  // Group by unique ASN to get student count
  const uniqueStudents = [...new Set(recordsToProcess.map(r => r.asn).filter(Boolean))];
  const studentCount = uniqueStudents.length;

  // Add a new custom property
  const addCustomProperty = () => {
    setCustomProperties([...customProperties, { key: '', value: '', description: '' }]);
  };

  // Remove a custom property
  const removeCustomProperty = (index) => {
    setCustomProperties(customProperties.filter((_, i) => i !== index));
  };

  // Update a custom property
  const updateCustomProperty = (index, field, value) => {
    const updated = [...customProperties];
    updated[index][field] = value;
    setCustomProperties(updated);
  };

  // Monitor job progress
  useEffect(() => {
    if (jobStatus?.jobId) {
      const jobRef = ref(database, `pdfGenerationJobs/${jobStatus.jobId}`);
      
      const unsubscribe = onValue(jobRef, (snapshot) => {
        const jobData = snapshot.val();
        if (jobData) {
          const progressPercent = (jobData.progress?.completed / jobData.progress?.total) * 100;
          setProgress(progressPercent);
          
          if (jobData.status === 'completed') {
            console.log('Job completed:', jobData);
            setIsGenerating(false);
            setDownloadUrls(jobData.downloadUrls || []);
            
            if (jobData.failedStudents && jobData.failedStudents.length > 0) {
              toast.warning(`PDF generation completed: ${jobData.downloadUrls?.length || 0} successful, ${jobData.failedStudents.length} failed. Check results below.`);
            } else {
              toast.success(`PDF generation completed successfully! ${jobData.downloadUrls?.length || 0} documents generated.`);
            }
          } else if (jobData.status === 'failed') {
            console.log('Job failed:', jobData);
            setIsGenerating(false);
            const errorMsg = jobData.error ? `PDF generation failed: ${jobData.error}` : 'PDF generation failed. Please try again.';
            toast.error(errorMsg);
          } else if (jobData.status === 'processing') {
            // Update progress for ongoing job
            setIsGenerating(true);
          }
        }
      });

      return () => off(jobRef, 'value', unsubscribe);
    }
  }, [jobStatus?.jobId]);

  // Generate PDFs
  const handleGeneratePDFs = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setDownloadUrls([]);

      // Validate custom properties and include descriptions
      const validCustomProps = customProperties.filter(p => p.key && p.value);
      const customPropsObject = validCustomProps.reduce((acc, prop) => {
        acc[prop.key] = {
          value: prop.value,
          description: prop.description || ''
        };
        return acc;
      }, {});

      // Prepare student data with all courses per student
      const studentsData = uniqueStudents.map(asn => {
        // Get all records for this student
        const studentRecords = recordsToProcess.filter(r => r.asn === asn);
        
        // Use the first record for basic student info (should be same across all records)
        const baseStudent = studentRecords[0];
        
        // Include all course records for this student
        return {
          ...baseStudent,
          allCourseRecords: studentRecords  // Pass all course records
        };
      });

      // Call cloud function
      const generatePDFs = httpsCallable(functions, 'generateRegistrationPDFs');
      const result = await generatePDFs({
        students: studentsData,
        documentConfig: {
          title: documentTitle,
          subtitle: documentSubtitle,
          customProperties: customPropsObject,
          schoolYear: schoolYear
        }
      });

      setJobStatus(result.data);
      
      // If the job completed immediately, handle it
      if (result.data.success && result.data.downloadUrls) {
        setIsGenerating(false);
        setDownloadUrls(result.data.downloadUrls);
        
        if (result.data.failedCount > 0) {
          toast.warning(`PDF generation completed with ${result.data.failedCount} failures.`);
        } else {
          toast.success('PDF generation completed successfully!');
        }
      } else {
        toast.info(`Processing ${studentCount} students...`);
      }

    } catch (error) {
      console.error('Error generating PDFs:', error);
      setIsGenerating(false);
      
      // Extract more detailed error message
      let errorMessage = 'Failed to start PDF generation';
      if (error.code === 'functions/internal') {
        errorMessage = 'Internal server error occurred during PDF generation';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Download all PDFs individually 
  const handleDownloadAll = async () => {
    for (const item of downloadUrls) {
      await handleDownloadSingle(item);
      // Small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Download single PDF using Firebase Storage SDK
  const handleDownloadSingle = async (item) => {
    try {
      if (!item.filePath) {
        toast.error('File path not available for download');
        return;
      }

      // Create Firebase Storage reference
      const fileRef = storageRef(storage, item.filePath);
      
      // Get download URL with proper authentication
      const downloadURL = await getDownloadURL(fileRef);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = item.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      
      let errorMessage = 'Failed to download file';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Access denied. You must be logged in as RTD staff to download this file.';
      } else if (error.code === 'storage/object-not-found') {
        errorMessage = 'File not found. It may have been moved or deleted.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Download all PDFs as ZIP
  const handleDownloadZip = async () => {
    if (!jobStatus?.jobId) {
      toast.error('No job ID available for ZIP download');
      return;
    }

    try {
      toast.info('Creating ZIP file...');
      
      const downloadPDFs = httpsCallable(functions, 'downloadRegistrationPDFs');
      const result = await downloadPDFs({
        jobId: jobStatus.jobId,
        selectedAsns: [] // Empty means all PDFs
      });

      if (result.data.success) {
        // Use Firebase Storage SDK to get proper download URL
        const zipFileRef = storageRef(storage, result.data.filePath);
        const downloadURL = await getDownloadURL(zipFileRef);
        
        // Create download link
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = result.data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`ZIP file with ${result.data.fileCount} PDFs ready for download!`);
      }
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create ZIP file: ' + error.message);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#008B8B]" />
            Generate Registration PDFs
          </SheetTitle>
          <SheetDescription>
            Configure and generate official registration documents for selected students
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="space-y-6">
            {/* Student Count Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{studentCount} unique students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="font-medium">{recordsToProcess.length} total records</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Document Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Document Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Document Subtitle</Label>
                <Input
                  id="subtitle"
                  value={documentSubtitle}
                  onChange={(e) => setDocumentSubtitle(e.target.value)}
                  placeholder="Enter document subtitle"
                />
              </div>
            </div>

            <Separator />

            {/* Custom Properties */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Custom Properties</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomProperty}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Property
                </Button>
              </div>

              <div className="space-y-4">
                {customProperties.map((prop, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-md bg-gray-50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Property name (e.g., 'Parent Approved')"
                        value={prop.key}
                        onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Property value (e.g., 'Yes')"
                        value={prop.value}
                        onChange={(e) => updateCustomProperty(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomProperty(index)}
                        className="h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Description (optional) - appears as secondary text on the PDF"
                      value={prop.description}
                      onChange={(e) => updateCustomProperty(index, 'description', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              {customProperties.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No custom properties added. Click "Add Property" to include additional fields with descriptions.
                </p>
              )}
            </div>

            {/* Progress Section */}
            {isGenerating && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Generation Progress</h3>
                    {jobStatus?.jobId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="text-xs"
                      >
                        Refresh Status
                      </Button>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Processing {Math.floor((progress / 100) * studentCount)} of {studentCount} students... ({Math.round(progress)}%)
                  </p>
                  {jobStatus?.jobId && (
                    <p className="text-xs text-gray-500 text-center">
                      Job ID: {jobStatus.jobId}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Download Section */}
            {downloadUrls.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Generation Complete
                    </h3>
                    <Badge variant="success">{downloadUrls.length} PDFs</Badge>
                  </div>
                  
                  <Alert>
                    <Download className="h-4 w-4" />
                    <AlertDescription>
                      Your registration documents have been generated and saved to Cloud Storage.
                      Download individual PDFs or all at once.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDownloadAll}
                        className="flex-1"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Individually
                      </Button>
                      <Button 
                        onClick={handleDownloadZip}
                        className="flex-1"
                        variant="default"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download ZIP
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {downloadUrls.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.fileName}</p>
                            <p className="text-xs text-gray-500">ASN: {item.asn}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadSingle(item)}
                            className="ml-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 border-t pt-4">
          <Button
            onClick={handleGeneratePDFs}
            disabled={isGenerating || studentCount === 0}
            className="w-full bg-[#008B8B] hover:bg-[#20B2AA]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDFs...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate {studentCount} Registration PDFs
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PDFGenerationSheet;