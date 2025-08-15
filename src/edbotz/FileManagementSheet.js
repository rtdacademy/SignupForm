import React, { useState, useCallback, useEffect } from 'react';
import {
  Upload,
  File as FileIcon,
  Trash2,
  Loader,
  X,
  Info,
} from 'lucide-react';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  remove,
  get,
} from 'firebase/database';
// VERTEX AI DISABLED DUE TO COST ISSUES - Using Gemini API instead
// import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';

import promptOptions from './Prompts/promptOptions';
import { AI_MODEL_MAPPING } from './utils/settings';

const FILE_SIZE_LIMIT = 10485760; // 10MB limit

// EditableAIAnalysis – lets the user view and edit the AI’s summary
const EditableAIAnalysis = ({ analysis, onUpdate, fileId, firebaseApp }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setEditedText(analysis);
    }
  }, [isEditing, analysis]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const db = getDatabase(firebaseApp);
      await set(
        dbRef(
          db,
          `edbotz/files/${fileId}/aiAnalysis/response/candidates/0/content/parts/0/text`
        ),
        editedText
      );
      onUpdate(editedText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating analysis:', error);
      alert(`Failed to update analysis: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ));
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="min-h-[200px] w-full"
          placeholder="Edit analysis..."
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="prose prose-sm max-w-none text-gray-600">
        {formatAnalysisText(analysis)}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0"
      >
        Edit
      </Button>
    </div>
  );
};

// FileUploadForm – similar to the image form but for PDFs
const FileUploadForm = ({ onUpload, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState('');
  // New state for the prompt option selection (default is custom)
  const [selectedPrompt, setSelectedPrompt] = useState('custom');

  // When the prompt option changes, prepopulate the context (if not custom)
  useEffect(() => {
    const option = promptOptions.find((opt) => opt.value === selectedPrompt);
    if (option) {
      setContext(option.text);
    }
  }, [selectedPrompt]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    if (file.size > FILE_SIZE_LIMIT) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    if (!fileName) {
      // Default file name without extension
      setFileName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }
    if (!fileName.trim()) {
      setError('Please provide a name for the file.');
      return;
    }
    if (!context.trim()) {
      setError('Please provide context for the file.');
      return;
    }

    // Create a new file with the custom name while preserving the extension
    const extension = selectedFile.name.split('.').pop();
    const newFile = new File([selectedFile], `${fileName.trim()}.${extension}`, {
      type: selectedFile.type,
    });

    onUpload(newFile, context, `${fileName.trim()}.${extension}`);

    // Reset form
    setSelectedFile(null);
    setFileName('');
    setContext('');
    setError('');
    setSelectedPrompt('custom');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>File Name</Label>
        <Input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter a name for this file..."
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>File Context</Label>
        {/* Quick select dropdown appears just below the label */}
        <select
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
          className="block w-full p-2 border rounded"
        >
          {promptOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the file and provide context to help the AI understand its purpose..."
          className="h-24 resize-y"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Select File</Label>
        {selectedFile ? (
          <div className="relative p-4 border rounded-lg bg-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="bg-white/80 hover:bg-white/90"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF (max 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </label>
        )}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button
        type="submit"
        disabled={!selectedFile || !context.trim() || !fileName.trim() || disabled}
        className="w-full"
      >
        Train Assistant with This File
      </Button>
    </form>
  );
};

const FileManagementSheet = ({
  open,
  onOpenChange,
  onFilesUploaded,
  existingFileIds = [],
  firebaseApp,
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadStage, setUploadStage] = useState('idle'); // idle, uploading, analyzing, complete
  const [pendingFileData, setPendingFileData] = useState(null); // { file, context, fileName }
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [processingFile, setProcessingFile] = useState(null);

  // Load existing files from Firebase Database
  useEffect(() => {
    if (!existingFileIds.length) return;
    const db = getDatabase(firebaseApp);
    const loadFiles = async () => {
      const loadedFiles = await Promise.all(
        existingFileIds.map(async (fileId) => {
          const snapshot = await get(dbRef(db, `edbotz/files/${fileId}`));
          if (snapshot.exists()) {
            return { id: fileId, ...snapshot.val() };
          }
          return null;
        })
      );
      setFiles(loadedFiles.filter((f) => f !== null));
    };
    loadFiles();
  }, [existingFileIds, firebaseApp]);

  // Calculate total storage used
  useEffect(() => {
    const total = files.reduce((sum, file) => sum + (file.size || 0), 0);
    setTotalSize(total);
  }, [files]);

  // Generates an AI summary for the uploaded PDF - DISABLED
  const generateDocumentSummary = async (fileUrl, mimeType, fileName, context) => {
    // VERTEX AI DISABLED - Return placeholder summary
    console.log('Vertex AI disabled - File analysis temporarily unavailable');
    return {
      candidates: [{
        content: {
          role: 'model',
          parts: [{
            text: `File Analysis Temporarily Disabled\n\nFile Name: ${fileName}\n\nContext: ${context}\n\nNote: AI document analysis is temporarily disabled for maintenance. The file has been uploaded successfully and will be available for reference once the AI features are restored.`
          }]
        },
        finishReason: 'STOP',
        index: 0
      }],
      modelVersion: 'disabled',
      createTime: new Date().toISOString()
    };
    
    /* DISABLED CODE - DO NOT REMOVE YET
    try {
      const vertexAI = getVertexAI(firebaseApp);
      // Always use the advanced model as defined in the settings
      const model = getGenerativeModel(vertexAI, {
        model: AI_MODEL_MAPPING.advanced.name,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192 , 
          topP: 0.95,
        },
      });
  
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `File Name: ${fileName}
  Context: ${context}
  
  You are analyzing an educational document to create a comprehensive knowledge base that will be used by another AI assistant to help students and teachers. Extract and structure all relevant information with special attention to mathematical notation:
  
  1) Document Overview:
     - Core subject/topic
     - Target audience
     - Learning objectives
  
  2) Essential Content:
     - Extract and preserve ALL key text passages
     - Format ALL mathematical expressions using these conventions:
       * For inline math, use single dollar signs: $x^2 + y^2 = z^2$
       * For display/block math, use double dollar signs:
         $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
       * For complex equations, use display math with aligned environments:
         $$\\begin{aligned}
         x &= a + b \\\\
         y &= c + d
         \\end{aligned}$$
       * Preserve ALL mathematical symbols and notation exactly as written
       * Include ALL variables, constants, and operators
     - Describe ALL images, diagrams, and visual elements
     - Include ALL examples, problems, or practice materials
     - Note ALL formulas, equations, or specialized notation
  
  3) Structure:
     - Maintain the document's organizational hierarchy
     - Preserve section headings and subheadings
     - Note any numbering systems or internal references
     - Keep mathematical expressions in their original context
  
  4) Special Instructions for Math:
     - Use proper LaTeX notation for all mathematical symbols
     - Include extra backslash for special characters (\\alpha instead of \alpha)
     - Format matrices and tables using appropriate LaTeX environments
     - Preserve any step-by-step mathematical derivations
     - Include any important mathematical definitions or theorems
  
  Format your response with clear hierarchical organization and explicit section markers. Include verbatim quotes when exact wording is important, especially for mathematical content.`,
            },
            {
              fileData: {
                mimeType: mimeType,
                fileUri: fileUrl,
              },
            },
          ],
        },
      ];
  
      const result = await model.generateContent({ contents });
      return result.response;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
    */
  };
  // Handles uploading the file to storage, analyzing it with AI, and saving its data
  const uploadFile = useCallback(
    async (file, context, fileName) => {
      setUploading(true);
      setUploadProgress(0);
      setProcessingFile(fileName);
      setUploadStage('uploading');
      setStatusMessage(`Starting upload of ${fileName}`);

      try {
        const storage = getStorage(firebaseApp);
        const db = getDatabase(firebaseApp);

        const newFileRef = push(dbRef(db, 'edbotz/files'));
        const fileId = newFileRef.key;

        const fileRef = storageRef(storage, `files/${fileId}/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            setStatusMessage(
              `Uploading file: ${Math.round(progress)}% complete`
            );
          },
          (error) => {
            console.error('Upload error:', error);
            throw error;
          }
        );

        await uploadTask;
        setStatusMessage('Generating download URL...');
        const downloadURL = await getDownloadURL(fileRef);

        setUploadStage('analyzing');
        setStatusMessage(
          'AI is analyzing the document with provided context...'
        );
        const aiResponse = await generateDocumentSummary(
          downloadURL,
          file.type,
          fileName,
          context
        );

        setStatusMessage('Saving file information...');
        const fileData = {
          name: fileName,
          type: file.type,
          size: file.size,
          url: downloadURL,
          context,
          uploadedAt: Date.now(),
          aiAnalysis: {
            response: {
              candidates: aiResponse.candidates.map((candidate) => ({
                content: {
                  role: candidate.content.role,
                  parts: candidate.content.parts.map((part) => ({
                    text: part.text,
                  })),
                },
                finishReason: candidate.finishReason,
                index: candidate.index,
              })),
              modelVersion: aiResponse.modelVersion,
              createTime: aiResponse.createTime,
            },
          },
        };

        await set(dbRef(db, `edbotz/files/${fileId}`), fileData);

        setFiles((prev) => {
          const newFiles = [...prev, { id: fileId, ...fileData }];
          onFilesUploaded(newFiles.map((f) => f.id));
          return newFiles;
        });

        setUploadStage('complete');
        setStatusMessage('File upload and processing complete!');

        setTimeout(() => {
          setStatusMessage('');
          setUploadStage('idle');
        }, 3000);
      } catch (error) {
        console.error('Error processing file:', error);
        setStatusMessage(`Error: ${error.message}`);
        setUploadStage('idle');
        alert('Failed to process file: ' + error.message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
        setPendingFileData(null);
        setProcessingFile(null);
      }
    },
    [firebaseApp, onFilesUploaded]
  );

  // Deletes a file from storage and database
  const handleFileDelete = useCallback(
    async (fileId, fileName) => {
      try {
        const db = getDatabase(firebaseApp);
        const storage = getStorage(firebaseApp);

        const fileRef = storageRef(storage, `files/${fileId}/${fileName}`);
        await deleteObject(fileRef);
        await remove(dbRef(db, `edbotz/files/${fileId}`));

        setFiles((prev) => {
          const newFiles = prev.filter((f) => f.id !== fileId);
          onFilesUploaded(newFiles.map((f) => f.id));
          return newFiles;
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file');
      }
    },
    [firebaseApp, onFilesUploaded]
  );

  // Called when the FileUploadForm submits a file
  const handleFileUpload = useCallback(
    (file, context, fileName) => {
      // Check for a duplicate by name
      const duplicate = files.find((f) => f.name === fileName);
      if (duplicate) {
        setPendingFileData({ file, context, fileName });
        setShowReplaceDialog(true);
      } else {
        uploadFile(file, context, fileName);
      }
    },
    [files, uploadFile]
  );

  const handleReplaceConfirm = () => {
    if (pendingFileData) {
      uploadFile(
        pendingFileData.file,
        pendingFileData.context,
        pendingFileData.fileName
      );
    }
    setShowReplaceDialog(false);
  };

  const renderUploadStatus = () => {
    if (uploading || uploadStage !== 'idle') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {uploadStage !== 'idle' && (
                <Loader className="w-4 h-4 animate-spin" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {statusMessage}
              </span>
            </div>
          </div>
          {uploadStage === 'uploading' && (
            <Progress value={uploadProgress} className="h-2" />
          )}
          {uploadStage === 'analyzing' && (
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const remainingStorage = FILE_SIZE_LIMIT - totalSize;
  const storagePercentage = (totalSize / FILE_SIZE_LIMIT) * 100;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Manage Assistant Files</SheetTitle>
            <SheetDescription>
              Upload PDF documents with context that this assistant can reference
              during conversations.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New File</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadForm
                    onUpload={handleFileUpload}
                    disabled={uploading || remainingStorage <= 0}
                  />
                  {renderUploadStatus()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files</CardTitle>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Storage used: {Math.round(totalSize / 1024)}KB of{' '}
                      {Math.round(FILE_SIZE_LIMIT / 1024)}KB
                    </div>
                    <Progress value={storagePercentage} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-white border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <FileIcon className="w-5 h-5 text-gray-500" />
                            <div className="space-y-1">
                              <span className="text-sm font-medium">
                                {file.name}
                              </span>
                              <p className="text-xs text-gray-500">
                                {Math.round(file.size / 1024)}KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleFileDelete(file.id, file.name)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            File Context
                          </Label>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {file.context}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-gray-700">
                              AI's Summary of the Document
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>
                                    This summary sets the context for how the
                                    assistant will reference this document during
                                    conversations. You can edit it to refine the
                                    assistant's understanding.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <EditableAIAnalysis
                              analysis={
                                file.aiAnalysis?.response?.candidates[0]?.content
                                  ?.parts[0]?.text
                              }
                              onUpdate={(newText) => {
                                setFiles((prev) =>
                                  prev.map((f) => {
                                    if (f.id === file.id) {
                                      return {
                                        ...f,
                                        aiAnalysis: {
                                          ...f.aiAnalysis,
                                          response: {
                                            ...f.aiAnalysis.response,
                                            candidates: [
                                              {
                                                ...f.aiAnalysis.response
                                                  .candidates[0],
                                                content: {
                                                  ...f.aiAnalysis.response
                                                    .candidates[0].content,
                                                  parts: [{ text: newText }],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      };
                                    }
                                    return f;
                                  })
                                );
                              }}
                              fileId={file.id}
                              firebaseApp={firebaseApp}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <ScrollBar />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Existing File?</AlertDialogTitle>
            <AlertDialogDescription>
              A file with the name "{pendingFileData?.fileName}" already exists.
              Uploading this file will replace the existing version. Do you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowReplaceDialog(false);
                setPendingFileData(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>
              Replace File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileManagementSheet;
