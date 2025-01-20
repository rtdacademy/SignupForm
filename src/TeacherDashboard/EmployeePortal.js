import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { getDatabase, ref as dbRef, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, FileText, Trash2 } from 'lucide-react';

const EmployeePortal = () => {
  const { user, isStaffUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [personalDocs, setPersonalDocs] = useState([]);
  const storage = getStorage();

  useEffect(() => {
    if (isStaffUser) {
      loadFiles();
      loadPersonalDocs();
    }
  }, [isStaffUser]);

  const loadFiles = async () => {
    try {
      // List shared documents
      const sharedDocsRef = ref(storage, 'shared-documents');
      const filesList = await listAll(sharedDocsRef);
      
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return {
            name: item.name,
            url,
            uploadedBy: metadata.customMetadata?.uploadedBy || 'Unknown',
            uploadedAt: metadata.timeCreated,
            size: metadata.size
          };
        })
      );
      
      setFiles(filesData);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load shared documents');
    }
  };

  const loadPersonalDocs = async () => {
    try {
      // List personal documents
      const personalDocsRef = ref(storage, `personal-documents/${user.email}`);
      const filesList = await listAll(personalDocsRef);
      
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return {
            name: item.name,
            url,
            uploadedAt: metadata.timeCreated,
            size: metadata.size
          };
        })
      );
      
      setPersonalDocs(filesData);
    } catch (err) {
      console.error('Error loading personal documents:', err);
      setError('Failed to load personal documents');
    }
  };

  const handleFileUpload = async (event, isPersonal = false) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const folderPath = isPersonal ? `personal-documents/${user.email}` : 'shared-documents';
      const storageRef = ref(storage, `${folderPath}/${file.name}`);
      
      // Upload file with metadata
      await uploadBytes(storageRef, file, {
        customMetadata: {
          uploadedBy: user.email
        }
      });

      // Log the upload in the database
      const db = getDatabase();
      const uploadsRef = dbRef(db, `document-uploads/${Date.now()}`);
      await set(uploadsRef, {
        fileName: file.name,
        uploadedBy: user.email,
        timestamp: Date.now(),
        isPersonal
      });

      // Refresh file lists
      if (isPersonal) {
        await loadPersonalDocs();
      } else {
        await loadFiles();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isStaffUser) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Access Denied. This portal is only accessible to staff members.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shared Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Shared Documents</span>
              <Button variant="outline" className="relative">
                <Upload className="w-4 h-4 mr-2" />
                Upload
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e, false)}
                  disabled={uploading}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded by {file.uploadedBy}
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Download
                  </a>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Personal Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Personal Documents</span>
              <Button variant="outline" className="relative">
                <Upload className="w-4 h-4 mr-2" />
                Upload
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e, true)}
                  disabled={uploading}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {personalDocs.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="font-medium">{file.name}</div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Download
                  </a>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EmployeePortal;