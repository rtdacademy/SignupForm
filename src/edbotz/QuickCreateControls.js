import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";

const QuickCreateControls = ({ 
  fileCount, 
  imageCount, 
  uploadedFileIds, 
  uploadedImageIds,
  firebaseApp,
  onContextUpdate 
}) => {
  const [useFiles, setUseFiles] = useState(false);
  const [useImages, setUseImages] = useState(false);
  const [fileContexts, setFileContexts] = useState([]);
  const [imageContexts, setImageContexts] = useState([]);

  useEffect(() => {
    const fetchContexts = async () => {
      const db = getDatabase(firebaseApp);
      let filesData = [];
      let imagesData = [];

      if (useFiles && uploadedFileIds.length > 0) {
        filesData = await Promise.all(uploadedFileIds.map(async (fileId) => {
          const snapshot = await get(ref(db, `edbotz/files/${fileId}/aiAnalysis/response/candidates/0/content/parts/0/text`));
          return snapshot.val();
        }));
      }

      if (useImages && uploadedImageIds.length > 0) {
        imagesData = await Promise.all(uploadedImageIds.map(async (imageId) => {
          const snapshot = await get(ref(db, `edbotz/images/${imageId}/aiAnalysis/response/candidates/0/content/parts/0/text`));
          return snapshot.val();
        }));
      }

      setFileContexts(filesData.filter(Boolean));
      setImageContexts(imagesData.filter(Boolean));
      
      // Notify parent component of context changes
      onContextUpdate({
        files: useFiles ? filesData.filter(Boolean) : [],
        images: useImages ? imagesData.filter(Boolean) : []
      });
    };

    fetchContexts();
  }, [useFiles, useImages, uploadedFileIds, uploadedImageIds, firebaseApp, onContextUpdate]);

  return (
    <div className="space-y-4 mb-4">
      {fileCount > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="useFiles"
            checked={useFiles}
            onCheckedChange={setUseFiles}
          />
          <Label 
            htmlFor="useFiles"
            className="text-sm text-gray-600"
          >
            Use {fileCount} attached file{fileCount > 1 ? 's' : ''} to help create the assistant
          </Label>
        </div>
      )}
      
      {imageCount > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="useImages"
            checked={useImages}
            onCheckedChange={setUseImages}
          />
          <Label 
            htmlFor="useImages"
            className="text-sm text-gray-600"
          >
            Use {imageCount} attached image{imageCount > 1 ? 's' : ''} to help create the assistant
          </Label>
        </div>
      )}
    </div>
  );
};

export default QuickCreateControls;