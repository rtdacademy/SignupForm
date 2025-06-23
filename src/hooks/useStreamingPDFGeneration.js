import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

export const useStreamingPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const generatePDFs = useCallback(async (studentsData, documentConfig, csvConfig) => {
    setIsGenerating(true);
    setProgress(0);
    setDownloadUrls([]);
    setCsvDownloadUrl(null);
    setJobStatus(null);

    try {
      // Get the current user's ID token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Determine the correct URL based on environment
      const isDevelopment = window.location.hostname === 'localhost';
      const baseUrl = isDevelopment 
        ? 'http://127.0.0.1:5001/rtd-academy/us-central1' 
        : 'https://us-central1-rtd-academy.cloudfunctions.net';
      
      const url = `${baseUrl}/generateRegistrationPDFsStreaming`;

      // Create the request payload
      const payload = {
        students: studentsData,
        documentConfig,
        csvConfig,
        idToken
      };

      console.log('Starting streaming PDF generation...');

      // Use fetch with ReadableStream to handle Server-Sent Events
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      
      // Read the stream
      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream completed');
              break;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete events from buffer
            let eventEnd;
            while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
              const eventText = buffer.slice(0, eventEnd);
              buffer = buffer.slice(eventEnd + 2);
              
              // Parse SSE format
              const lines = eventText.split('\n');
              let eventType = 'message';
              let eventData = '';
              
              for (const line of lines) {
                if (line.startsWith('event: ')) {
                  eventType = line.slice(7);
                } else if (line.startsWith('data: ')) {
                  eventData = line.slice(6);
                }
              }
              
              if (eventData) {
                try {
                  const data = JSON.parse(eventData);
                  console.log(`Event ${eventType}:`, data);
                  
                  if (eventType === 'progress') {
                    setProgress((data.completed / data.total) * 100);
                    
                    if (data.status === 'processing' && data.currentStudent) {
                      toast.info(`Processing student ${data.currentStudent}... (${data.completed}/${data.total})`);
                    } else if (data.status === 'generating_csv') {
                      toast.info('Generating CSV export...');
                    } else if (data.status === 'starting') {
                      toast.info(data.message);
                    }
                  } else if (eventType === 'completed') {
                    setIsGenerating(false);
                    setDownloadUrls(data.downloadUrls || []);
                    setCsvDownloadUrl(data.csvDownloadUrl || null);
                    setJobStatus(data);
                    
                    if (data.failedStudents && data.failedStudents.length > 0) {
                      toast.warning(`PDF generation completed: ${data.downloadUrls?.length || 0} successful, ${data.failedStudents.length} failed.`);
                    } else {
                      toast.success(`PDF generation completed successfully! ${data.downloadUrls?.length || 0} documents generated.`);
                    }
                    return; // Exit the loop
                  } else if (eventType === 'error') {
                    console.error('Generation error:', data);
                    toast.error(data.message || 'PDF generation failed');
                    setIsGenerating(false);
                    return; // Exit the loop
                  }
                } catch (parseError) {
                  console.error('Error parsing event data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading stream:', error);
          toast.error('Connection error during PDF generation');
          setIsGenerating(false);
        }
      };

      // Start reading the stream
      readStream();

      // Return a cleanup function
      return () => {
        reader.cancel();
        setIsGenerating(false);
      };

    } catch (error) {
      console.error('Error starting PDF generation:', error);
      setIsGenerating(false);
      toast.error(`Failed to start PDF generation: ${error.message}`);
    }
  }, []);

  return {
    generatePDFs,
    isGenerating,
    progress,
    downloadUrls,
    csvDownloadUrl,
    jobStatus
  };
};