import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader, Plus, X, Info } from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDatabase, ref as dbRef, push, set, remove, get } from 'firebase/database';
// VERTEX AI DISABLED DUE TO COST ISSUES - Using Gemini API instead
// import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { useAuth } from '../context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  ScrollArea,
  ScrollBar,
} from "../components/ui/scroll-area";

const getStandardImageFunctionDeclarations = () => {
  return [
    {
      name: "getImageMetadata",
      description: "Get metadata about this image including name, size, type, and upload date",
      parameters: {
        type: "object",
        properties: {
          fields: {
            type: "array",
            description: "Specific metadata fields to retrieve. If empty, returns all metadata.",
            items: {
              type: "string",
              enum: ["name", "size", "type", "uploadedAt", "url"]
            }
          }
        }
      }
    },
    {
      name: "getImageContext",
      description: "Get the original context and AI analysis provided for this image",
      parameters: {
        type: "object",
        properties: {
          includeAiAnalysis: {
            type: "boolean",
            description: "Whether to include the AI's analysis of the image"
          }
        }
      }
    },
    {
      name: "getImageAnalysis",
      description: "Get specific aspects of the AI's analysis of this image",
      parameters: {
        type: "object",
        properties: {
          aspect: {
            type: "string",
            description: "Which aspect of the analysis to retrieve",
            enum: ["visual_elements", "teaching_suggestions", "key_details", "full_analysis"]
          }
        }
      }
    }
  ];
};


const IMAGE_SIZE_LIMIT = 5000000; // 5MB limit
const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

const EditableAIAnalysis = ({ analysis, onUpdate, imageId, firebaseApp }) => {
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
      await set(dbRef(db, `edbotz/images/${imageId}/aiAnalysis/response/candidates/0/content/parts/0/text`), editedText);
      
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
      <p key={index} className="mb-2">{line}</p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
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

const ImageUploadForm = ({ onUpload, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState('');
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError('Please select a PNG, JPEG, or WebP image.');
      return;
    }

    if (file.size > IMAGE_SIZE_LIMIT) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    // Set default name from file if not already set
    if (!imageName) {
      setImageName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image.');
      return;
    }

    if (!imageName.trim()) {
      setError('Please provide a name for the image.');
      return;
    }

    if (!context.trim()) {
      setError('Please provide context for the image.');
      return;
    }

    // Create a new file with the custom name while preserving the extension
    const extension = selectedFile.name.split('.').pop();
    const newFile = new File([selectedFile], `${imageName.trim()}.${extension}`, {
      type: selectedFile.type,
    });

    onUpload(newFile, context, imageName);
    
    // Reset form
    setSelectedFile(null);
    setPreview(null);
    setContext('');
    setImageName('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Image Name</Label>
        <Input
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          placeholder="Enter a name for this image..."
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Image Context</Label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the image and provide context to help the AI understand its purpose..."
          className="h-24 resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Select Image</Label>
        {preview ? (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
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
              <p className="text-xs text-gray-500">PNG, JPEG, WebP (max 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </label>
        )}
      </div>

      {preview && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <p>✨ Image selected! Click "Train Assistant" below to analyze and add this image to the assistant's knowledge.</p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!selectedFile || !context.trim() || !imageName.trim() || disabled}
        className="w-full"
      >
        Train Assistant with This Image
      </Button>
    </form>
  );
};

const ImageManagementSheet = ({ 
  open, 
  onOpenChange, 
  onImagesUploaded,
  existingImageIds = [],
  firebaseApp,
  userId,
  assistantId
}) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadStage, setUploadStage] = useState('idle');
  const { user } = useAuth();

  useEffect(() => {
    if (!existingImageIds.length) return;
  
    const db = getDatabase(firebaseApp);
    const loadImages = async () => {
      // Get the enabled/disabled status for all images
      const assistantImagesRef = assistantId && userId 
        ? await get(dbRef(db, `edbotz/assistants/${userId}/${assistantId}/images`))
        : null;
      const enabledImages = assistantImagesRef?.val() || {};
  
      // Only load images that are marked as true or don't exist in the status list
      const enabledImageIds = existingImageIds.filter(id => 
        enabledImages[id] === true || !assistantImagesRef
      );
  
      const loadedImages = await Promise.all(
        enabledImageIds.map(async (imageId) => {
          const snapshot = await get(dbRef(db, `edbotz/images/${imageId}`));
          if (snapshot.exists()) {
            return { id: imageId, ...snapshot.val() };
          }
          return null;
        })
      );
      setImages(loadedImages.filter(i => i !== null));
    };
  
    loadImages();
  }, [existingImageIds, firebaseApp, assistantId, userId]);

  useEffect(() => {
    const total = images.reduce((sum, img) => sum + (img.size || 0), 0);
    setTotalSize(total);
  }, [images]);

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: { 
            data: base64Data, 
            mimeType: file.type 
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzeImageWithAI = async (imagePart, context, imageName) => {  // Add imageName parameter
    // VERTEX AI DISABLED - Return placeholder analysis
    console.log('Vertex AI disabled - Image analysis temporarily unavailable');
    return {
      candidates: [{
        content: {
          role: 'model',
          parts: [{
            text: `Image Analysis Temporarily Disabled\n\nImage Name: ${imageName}\n\nContext: ${context}\n\nNote: AI image analysis is temporarily disabled for maintenance. The image has been uploaded successfully and will be available for reference once the AI features are restored.`
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
      const model = getGenerativeModel(vertexAI, {
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          topP: 0.95
        }
      });
  
      const prompt = `Image Name: ${imageName}
  Context for this image: ${context}
  
  Please analyze this image in relation to the provided name and context. Include:
  1) How the image relates to or supports the given context and name
  2) Key visual elements and their significance
  3) Any text or important details visible
  4) Suggestions for how this image could be effectively used in teaching or explanations`;
  
      const result = await model.generateContent([prompt, imagePart]);
      return result.response;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
    */
  };

  const uploadImage = useCallback(async (file, context, imageName) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStage('uploading');
    setStatusMessage(`Starting upload of ${file.name}`);
  
    try {
      const storage = getStorage(firebaseApp);
      const db = getDatabase(firebaseApp);
      
      const newImageRef = push(dbRef(db, 'edbotz/images'));
      const imageId = newImageRef.key;
      
      const imageRef = storageRef(storage, `images/${imageId}/${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);
  
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          setStatusMessage(`Uploading image: ${Math.round(progress)}% complete`);
        },
        (error) => {
          console.error('Upload error:', error);
          throw error;
        }
      );
  
      await uploadTask;
      setStatusMessage('Generating download URL...');
      const downloadURL = await getDownloadURL(imageRef);
  
      setUploadStage('analyzing');
      setStatusMessage('AI is analyzing the image with provided context...');
      
      const imagePart = await fileToGenerativePart(file);
      const aiResponse = await analyzeImageWithAI(imagePart, context, imageName);
      
      setStatusMessage('Saving image information...');
      const imageData = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        context: context,
        uploadedAt: Date.now(),
        aiAnalysis: {
          response: {
            candidates: aiResponse.candidates.map(candidate => ({
              content: {
                role: candidate.content.role,
                parts: candidate.content.parts.map(part => ({
                  text: part.text
                }))
              },
              finishReason: candidate.finishReason,
              index: candidate.index
            })),
            modelVersion: aiResponse.modelVersion,
            createTime: aiResponse.createTime
          }
        },
        // Add the function declarations to the image data
        functionDeclarations: getStandardImageFunctionDeclarations()
      };
  
      await set(dbRef(db, `edbotz/images/${imageId}`), imageData);
      
      onImagesUploaded([imageId]);
      setImages(prev => [...prev, { id: imageId, ...imageData }]);
      
      setUploadStage('complete');
      setStatusMessage('Image upload and processing complete!');
  
      setTimeout(() => {
        setStatusMessage('');
        setUploadStage('idle');
      }, 3000);
  
    } catch (error) {
      console.error('Error processing image:', error);
      setStatusMessage(`Error: ${error.message}`);
      setUploadStage('idle');
      alert('Failed to process image: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [firebaseApp, onImagesUploaded]);

  const handleImageDelete = useCallback(async (imageId, imageName) => {
    try {
      const db = getDatabase(firebaseApp);
      
      if (assistantId && userId) {
        // For existing assistants, just set the image to false in the assistant's list
        const assistantImagesRef = dbRef(db, `/edbotz/assistants/${userId}/${assistantId}/images/${imageId}`);
        await set(assistantImagesRef, false);
      } else {
        // For new assistants/images, completely remove the image from the database
        await remove(dbRef(db, `edbotz/images/${imageId}`));
        
        // Also need to remove from storage
        const storage = getStorage(firebaseApp);
        const imageRef = storageRef(storage, `images/${imageId}/${imageName}`);
        await deleteObject(imageRef);
      }
      
      // Update local state
      setImages(prev => prev.filter(i => i.id !== imageId));
      
      // Update parent component's state with remaining image IDs
      const remainingImageIds = existingImageIds.filter(id => id !== imageId);
      onImagesUploaded(remainingImageIds);
      
    } catch (error) {
      console.error('Error handling image deletion:', error);
      alert('Failed to remove image');
    }
  }, [firebaseApp, existingImageIds, onImagesUploaded, userId, assistantId]);



  const renderUploadStatus = () => {
    if (uploading || uploadStage !== 'idle') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {uploadStage !== 'idle' && <Loader className="w-4 h-4 animate-spin" />}
              <span className="text-sm font-medium text-gray-700">{statusMessage}</span>
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

  const remainingStorage = IMAGE_SIZE_LIMIT * 3 - totalSize;
  const storagePercentage = (totalSize / (IMAGE_SIZE_LIMIT * 3)) * 100;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Manage Assistant Images</SheetTitle>
          <SheetDescription>
            Upload images with context that this assistant can reference during conversations.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadForm
                  onUpload={uploadImage}
                  disabled={uploading || remainingStorage <= 0}
                />
                {renderUploadStatus()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images</CardTitle>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Storage used: {Math.round(totalSize / 1024)}KB of {Math.round((IMAGE_SIZE_LIMIT * 3) / 1024)}KB
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="p-4 bg-white border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                          <div className="space-y-1">
                            <span className="text-sm font-medium">{image.name}</span>
                            <p className="text-xs text-gray-500">{Math.round(image.size / 1024)}KB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImageDelete(image.id, image.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Image Context
                        </Label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {image.context}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-700">
                            AI's Understanding of the Image
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>This analysis sets the context for how the assistant will understand and reference this image during student conversations. You can edit it to refine the assistant's understanding.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <EditableAIAnalysis
                            analysis={image.aiAnalysis.response.candidates[0].content.parts[0].text}
                            onUpdate={(newText) => {
                              setImages(prev => prev.map(img => {
                                if (img.id === image.id) {
                                  return {
                                    ...img,
                                    aiAnalysis: {
                                      ...img.aiAnalysis,
                                      response: {
                                        ...img.aiAnalysis.response,
                                        candidates: [
                                          {
                                            ...img.aiAnalysis.response.candidates[0],
                                            content: {
                                              ...img.aiAnalysis.response.candidates[0].content,
                                              parts: [{ text: newText }]
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  };
                                }
                                return img;
                              }));
                            }}
                            imageId={image.id}
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
  );
};

export default ImageManagementSheet;