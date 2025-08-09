import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { FileText, Upload, CheckCircle2, AlertTriangle, X, Loader2, Sparkles, Eye, Shield, AlertCircle } from 'lucide-react';
import CitizenshipDocuments from '../Registration/CitizenshipDocuments';
import { toast } from 'sonner';

const StudentCitizenshipDocuments = ({ 
  isOpen, 
  onOpenChange, 
  student, 
  familyId,
  onDocumentsUpdated,
  aiAnalyze = false // New prop to enable AI analysis
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [hasExistingDocs, setHasExistingDocs] = useState(false);
  
  // AI Analysis state
  const [analyzingDocuments, setAnalyzingDocuments] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [analysisErrors, setAnalysisErrors] = useState({});
  const [manualOverrides, setManualOverrides] = useState({});

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
          const docData = snapshot.val();
          const existingDocs = docData.documents || [];
          setDocuments(existingDocs);
          setHasExistingDocs(existingDocs.length > 0);
          
          // Load existing AI analysis results if available
          if (aiAnalyze && docData.aiAnalysisEnabled) {
            setAnalysisResults(docData.aiAnalysisResults || {});
            setAnalysisErrors(docData.analysisErrors || {});
            setManualOverrides(docData.manualOverrides || {});
          }
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
  }, [isOpen, student, familyId, aiAnalyze]);

  const handleDocumentsChange = (field, newDocuments) => {
    setDocuments(newDocuments);
    
    // If AI analysis is enabled, analyze new documents
    if (aiAnalyze && newDocuments.length > 0) {
      // Find newly added documents
      const existingFileUrls = new Set(documents.map(doc => doc.fileUrl));
      const newDocs = newDocuments.filter(doc => !existingFileUrls.has(doc.fileUrl));
      
      // Analyze each new document
      newDocs.forEach(doc => {
        analyzeDocumentWithAI(doc);
      });
    }
  };

  const analyzeDocumentWithAI = async (document) => {
    if (!aiAnalyze || !student || !document) return;

    const docId = document.fileId || document.fileName;
    
    // Clear previous analysis for this document
    setAnalysisResults(prev => ({ ...prev, [docId]: null }));
    setAnalysisErrors(prev => ({ ...prev, [docId]: null }));
    setAnalyzingDocuments(prev => ({ ...prev, [docId]: true }));

    const toastId = toast.loading('Analyzing document with AI...', {
      description: 'Verifying document belongs to student and checking document type'
    });

    try {
      const functions = getFunctions();
      const analyzeFunc = httpsCallable(functions, 'analyzeCitizenshipDocument');

      console.log('Analyzing citizenship document:', document.fileName);

      const result = await analyzeFunc({
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        mimeType: document.fileType,
        studentName: `${student.firstName} ${student.lastName}`,
        studentBirthDate: student.birthDate || null,
        expectedDocumentType: document.documentType || null // From CitizenshipDocuments component
      });

      if (result.data.success) {
        const analysis = result.data.analysis;
        
        setAnalysisResults(prev => ({
          ...prev,
          [docId]: {
            ...analysis,
            documentId: docId
          }
        }));

        // Show more forgiving toast with verification results
        const nameMatch = analysis.studentNameMatch;
        const typeMatch = analysis.documentTypeMatch;
        const overallScore = analysis.overallScore;
        const hasValidType = ['birth_certificate', 'citizenship_certificate', 'citizenship_card', 
                             'passport', 'status_card', 'immigration_document'].includes(analysis.detectedDocumentType);
        const isLegible = analysis.textLegibility > 70 || overallScore >= 50;

        if (hasValidType && isLegible) {
          toast.success('Document uploaded and verified!', {
            id: toastId,
            description: `✓ Valid document type detected and text is legible. Score: ${overallScore}%`
          });
        } else if (hasValidType) {
          toast.warning('Document uploaded - legibility concerns', {
            id: toastId,
            description: `⚠️ Document type verified but text quality needs review. Score: ${overallScore}%`
          });
        } else if (isLegible) {
          toast.warning('Document uploaded - type verification needed', {
            id: toastId,
            description: `⚠️ Text is legible but document type needs verification. Score: ${overallScore}%`
          });
        } else {
          toast.info('Document uploaded - manual review required', {
            id: toastId,
            description: `ℹ️ Document saved but may need manual verification. Score: ${overallScore}%`
          });
        }

        // Clear analysis errors
        setAnalysisErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[docId];
          return newErrors;
        });

      } else {
        throw new Error(result.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing citizenship document:', error);
      
      setAnalysisErrors(prev => ({
        ...prev,
        [docId]: error.message
      }));

      toast.error('AI analysis failed', {
        id: toastId,
        description: 'Document uploaded successfully, but AI verification failed. Manual review will be required.'
      });
    } finally {
      setAnalyzingDocuments(prev => {
        const newAnalyzing = { ...prev };
        delete newAnalyzing[docId];
        return newAnalyzing;
      });
    }
  };

  const handleManualOverride = (docId, overrideData) => {
    setManualOverrides(prev => ({
      ...prev,
      [docId]: overrideData
    }));

    toast.success('Manual verification recorded', {
      description: 'Your verification override has been saved with the document.'
    });
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
      
      // Add AI validation status to each document
      const documentsWithValidation = documents.map(doc => {
        const docId = doc.fileId || doc.fileName;
        const analysis = analysisResults[docId];
        const override = manualOverrides[docId];
        
        // Determine if document is AI validated based on analysis or manual override
        let aiValidated = false;
        if (aiAnalyze && analysis) {
          // More forgiving validation: accept if it's a valid document type and legible
          const hasValidType = ['birth_certificate', 'citizenship_certificate', 'citizenship_card', 
                               'passport', 'status_card', 'immigration_document'].includes(analysis.detectedDocumentType);
          const isLegible = analysis.textLegibility > 70 || analysis.overallScore >= 50;
          aiValidated = hasValidType && isLegible;
        }
        
        // Manual override takes precedence
        if (override?.studentNameConfirmed && override?.documentTypeConfirmed) {
          aiValidated = true;
        }
        
        return {
          ...doc,
          aiValidated: aiValidated,
          completionStatus: aiValidated ? 'completed' : 'pending'
        };
      });
      
      // Overall completion status: completed if at least one document is AI validated
      const hasValidatedDocument = documentsWithValidation.some(doc => doc.aiValidated === true);
      const overallCompletionStatus = hasValidatedDocument ? 'completed' : 'pending';
      
      const documentData = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        documents: documentsWithValidation,
        completionStatus: overallCompletionStatus,
        lastUpdated: new Date().toISOString(),
        // Include AI analysis results if available
        ...(aiAnalyze && {
          aiAnalysisResults: analysisResults,
          analysisErrors: analysisErrors,
          manualOverrides: manualOverrides,
          aiAnalysisEnabled: true
        })
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
            {aiAnalyze && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800 font-medium">AI verification enabled - documents will be automatically analyzed</span>
              </div>
            )}
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
                  ? `✓ ${documents.length} citizenship document(s) uploaded for ${student.firstName}. Your child's citizenship has been verified for school registration.`
                  : `⚠️ No citizenship documents uploaded yet for ${student.firstName}. Please upload at least one required document to complete school registration verification.`
                }
              </AlertDescription>
            </div>
          </Alert>

          {/* Document Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Accepted Documents</h3>
            <p className="text-sm text-blue-800 mb-2">Upload ONE of the following documents for school registration:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li><strong>Birth Certificate:</strong> Canadian birth certificate</li>
              <li><strong>Canadian Citizenship Certificate or Card:</strong> For naturalized citizens</li>
              <li><strong>Canadian Passport:</strong> Valid passport showing Canadian citizenship</li>
              <li><strong>Status Card (Indigenous):</strong> Secure Certificate of Indian Status for First Nations people registered under the Indian Act</li>
              <li><strong>Immigration Documents:</strong> Permanent resident card, visa, or other legal status documents</li>
            </ul>
          </div>

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

              {/* AI Analysis Results */}
              {aiAnalyze && documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    AI Document Verification
                  </h3>
                  
                  {documents.map(document => {
                    const docId = document.fileId || document.fileName;
                    const analysis = analysisResults[docId];
                    const isAnalyzing = analyzingDocuments[docId];
                    const error = analysisErrors[docId];
                    const override = manualOverrides[docId];

                    return (
                      <div key={docId} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{document.fileName}</h4>
                            <p className="text-sm text-gray-500">{document.fileType}</p>
                          </div>
                          
                          {/* Analysis Status Badge */}
                          <div className="ml-3">
                            {isAnalyzing ? (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing...</span>
                              </div>
                            ) : analysis ? (
                              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                                analysis.overallScore >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : analysis.overallScore >= 50
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {analysis.overallScore >= 80 ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <AlertCircle className="w-4 h-4" />
                                )}
                                <span>Score: {analysis.overallScore}%</span>
                              </div>
                            ) : error ? (
                              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center space-x-2">
                                <X className="w-4 h-4" />
                                <span>Analysis Failed</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Analysis Results */}
                        {analysis && (
                          <div className="space-y-3">
                            {/* Name Verification */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Student Name Match:</span>
                                {analysis.studentNameMatch ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-medium ${
                                  analysis.studentNameMatch ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {analysis.studentNameMatch ? 'Verified' : 'Mismatch'}
                                </p>
                                {analysis.detectedName && (
                                  <p className="text-xs text-gray-600">
                                    Found: {analysis.detectedName}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Document Type Verification */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Document Type:</span>
                                {analysis.documentTypeMatch ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {analysis.detectedDocumentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Confidence: {Math.round(analysis.documentTypeConfidence * 100)}%
                                </p>
                              </div>
                            </div>

                            {/* Reasoning */}
                            {(analysis.nameMatchReasoning || analysis.typeMatchReasoning) && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <h5 className="text-sm font-medium text-blue-900 mb-2">Analysis Notes:</h5>
                                {analysis.nameMatchReasoning && (
                                  <p className="text-sm text-blue-800 mb-1">
                                    <strong>Name:</strong> {analysis.nameMatchReasoning}
                                  </p>
                                )}
                                {analysis.typeMatchReasoning && (
                                  <p className="text-sm text-blue-800">
                                    <strong>Type:</strong> {analysis.typeMatchReasoning}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Validation Issues */}
                            {analysis.validationIssues && analysis.validationIssues.length > 0 && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <h5 className="text-sm font-medium text-yellow-900 mb-2">Concerns Identified:</h5>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                  {analysis.validationIssues.map((issue, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Manual Override Option */}
                            {analysis.requiresManualReview && !override && (
                              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="text-sm font-medium text-orange-900">Manual Review Required</h5>
                                    <p className="text-sm text-orange-800 mt-1">
                                      This document needs manual verification. If you believe this document is correct, you can override the AI assessment.
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleManualOverride(docId, {
                                      studentNameConfirmed: true,
                                      documentTypeConfirmed: true,
                                      reasoning: 'Manual override by parent/guardian'
                                    })}
                                    className="ml-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Confirm Valid
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Manual Override Display */}
                            {override && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <h5 className="text-sm font-medium text-green-900 flex items-center">
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Manually Verified
                                </h5>
                                <p className="text-sm text-green-800 mt-1">
                                  Document has been manually confirmed as valid.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error Display */}
                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <h5 className="text-sm font-medium text-red-900 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Analysis Failed
                            </h5>
                            <p className="text-sm text-red-800 mt-1">{error}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => analyzeDocumentWithAI(document)}
                              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              Retry Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

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