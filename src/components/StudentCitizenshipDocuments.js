import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { FileText, Upload, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import CitizenshipDocuments from '../Registration/CitizenshipDocuments';
import { toast } from 'sonner';

const StudentCitizenshipDocuments = ({ 
  isOpen, 
  onOpenChange, 
  student, 
  familyId,
  onDocumentsUpdated 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [hasExistingDocs, setHasExistingDocs] = useState(false);

  // Load existing documents when component opens
  useEffect(() => {
    if (!isOpen || !student || !familyId) return;

    const loadExistingDocuments = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
        const snapshot = await get(docsRef);
        
        if (snapshot.exists()) {
          const existingDocs = snapshot.val().documents || [];
          setDocuments(existingDocs);
          setHasExistingDocs(existingDocs.length > 0);
        } else {
          setDocuments([]);
          setHasExistingDocs(false);
        }
      } catch (error) {
        console.error('Error loading student citizenship documents:', error);
        toast.error('Failed to load existing documents');
      } finally {
        setLoading(false);
      }
    };

    loadExistingDocuments();
  }, [isOpen, student, familyId]);

  const handleDocumentsChange = (field, newDocuments) => {
    setDocuments(newDocuments);
  };

  const handleSaveDocuments = async () => {
    if (documents.length === 0) {
      toast.error('Please upload at least one citizenship document');
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
      
      const documentData = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        documents: documents,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid,
        completionStatus: 'completed'
      };

      await set(docsRef, documentData);
      
      toast.success('Documents saved successfully!');
      setHasExistingDocs(true);
      
      // Notify parent component of update
      if (onDocumentsUpdated) {
        onDocumentsUpdated(student.id, documents);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving citizenship documents:', error);
      toast.error('Failed to save documents. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAllDocuments = async () => {
    if (!window.confirm('Are you sure you want to remove all citizenship documents for this student?')) {
      return;
    }

    setSaving(true);
    try {
      const db = getDatabase();
      const docsRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/STUDENT_CITIZENSHIP_DOCS/${student.id}`);
      
      await set(docsRef, {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        documents: [],
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid,
        completionStatus: 'pending'
      });
      
      setDocuments([]);
      setHasExistingDocs(false);
      toast.success('All documents removed successfully');
      
      // Notify parent component of update
      if (onDocumentsUpdated) {
        onDocumentsUpdated(student.id, []);
      }
      
    } catch (error) {
      console.error('Error removing citizenship documents:', error);
      toast.error('Failed to remove documents. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Citizenship Documents for School Registration</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Upload required citizenship documents for {student.firstName} {student.lastName}'s school registration in Alberta.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Why These Documents Are Required
            </h3>
            <div className="text-sm text-blue-800 space-y-3">
              <p>
                <strong>Alberta Education requires schools to verify each student's identity, age, and legal status</strong> before enrollment. 
                These documents provide official proof of your child's citizenship or legal status in Canada.
              </p>
              
              <div>
                <p className="font-medium mb-2">For school registration in Alberta, you must provide ONE of the following:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Birth Certificate:</strong> Most common document. Shows your child was born in Canada and is a Canadian citizen.</li>
                  <li><strong>Canadian Passport:</strong> Official proof of Canadian citizenship. Accepted by all schools.</li>
                  <li><strong>Canadian Citizenship Certificate or Card:</strong> Official proof for naturalized Canadian citizens.</li>
                  <li><strong>Immigration Documents:</strong> For non-Canadian citizens, including permanent resident cards, visas, or other legal immigration documentation.</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> These documents are required by Alberta Education regulations. 
                  Without proper citizenship verification, your child cannot be enrolled in school.
                </p>
              </div>
            </div>
          </div>

          {/* Document Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
              Document Guidelines
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Original or certified copies</strong> are preferred, but clear photos or scans are acceptable for initial submission</li>
                <li><strong>All text must be clearly readable</strong> - avoid blurry or cropped images</li>
                <li><strong>Include all four corners</strong> of the document in your photo/scan</li>
                <li><strong>File formats:</strong> PDF, JPEG, or PNG files only</li>
                <li><strong>File size:</strong> Maximum 5MB per file</li>
                <li><strong>Multiple documents:</strong> You can upload multiple documents if needed (e.g., both sides of a card)</li>
              </ul>
            </div>
          </div>

          {/* Current Status Alert */}
          <Alert className={`${hasExistingDocs ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center">
              {hasExistingDocs ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription className={`ml-2 ${hasExistingDocs ? 'text-green-800' : 'text-orange-800'}`}>
                {hasExistingDocs 
                  ? `✓ ${documents.length} citizenship document(s) uploaded for ${student.firstName}. Your child's citizenship has been verified for school registration.`
                  : `⚠️ No citizenship documents uploaded yet for ${student.firstName}. Please upload at least one required document to complete school registration verification.`
                }
              </AlertDescription>
            </div>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-600">Loading documents...</span>
            </div>
          ) : (
            <>
              {/* Document Upload Component */}
              <CitizenshipDocuments
                onUploadComplete={handleDocumentsChange}
                initialDocuments={documents}
                error={null}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={handleSaveDocuments}
                  disabled={saving || documents.length === 0}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Save Documents
                    </>
                  )}
                </Button>
                
                {hasExistingDocs && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAllDocuments}
                    disabled={saving}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove All
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentCitizenshipDocuments;