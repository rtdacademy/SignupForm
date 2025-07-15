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
              <span>Citizenship Documents</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Upload and manage citizenship verification documents for {student.firstName} {student.lastName}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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
                  ? `${documents.length} citizenship document(s) uploaded for this student.`
                  : 'No citizenship documents uploaded yet. Please upload required documents to complete verification.'
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