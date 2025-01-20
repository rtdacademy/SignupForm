import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { TutorialButton } from '../components/TutorialButton';
import Papa from 'papaparse';

const IMathASGradeImporter = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { hasAdminAccess } = useAuth();

  const processCSV = async (file) => {
    setUploading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        });
      });

      const db = getFirestore();
      const records = results.data;
      let processed = 0;
      
      // Process in batches of 500 (Firestore batch limit)
      for (let i = 0; i < records.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = records.slice(i, i + 500);
        
        chunk.forEach(record => {
          // Create a compound ID using assessmentid and userid
          const docId = `${record.assessmentid}_${record.userid}`;
          const docRef = doc(collection(db, 'imathas_grades'), docId);
          
          batch.set(docRef, {
            assessmentId: parseInt(record.assessmentid),
            userId: parseInt(record.userid),
            score: parseFloat(record.score) || 0,
            status: parseInt(record.status),
            startTime: parseInt(record.starttime) || 0,
            lastChange: parseInt(record.lastchange) || 0,
            timeOnTask: parseInt(record.timeontask) || 0,
            version: parseInt(record.ver) || 1,
            // Store original values as well
            agroupid: record.agroupid,
            lti_sourcedid: record.lti_sourcedid,
            timelimitexp: record.timelimitexp,
            scoreddata: record.scoreddata,
            practicedata: record.practicedata,
            // Metadata
            imported: true,
            importedAt: new Date().toISOString()
          });
        });

        await batch.commit();
        processed += chunk.length;
        setProgress({ processed, total: records.length });
      }

      setSuccess(true);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processCSV(file);
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Access Denied. You do not have the necessary permissions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>IMathAS Grade Import</CardTitle>
            <TutorialButton tutorialId="email-component" className="mt-0.5" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Upload the IMathAS grades CSV file to import assessment records into Firestore
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!uploading && (
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Button asChild>
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select CSV File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing records...</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Processed {progress.processed} of {progress.total} records
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(progress.processed / progress.total) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>
                  Successfully imported {progress.total} assessment records
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IMathASGradeImporter;