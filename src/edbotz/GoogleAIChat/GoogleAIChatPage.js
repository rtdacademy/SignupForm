import React from 'react';
import GoogleAIChatApp from './GoogleAIChatApp';

// Simple wrapper component for the Google AI Chat application
const GoogleAIChatPage = () => {
  // Define instructions and first message
  const instructions = "You are an educational AI assistant that helps users learn about various topics. Provide clear, accurate, and concise explanations.";
  const firstMessage = "Hello! I'm your Edbotz AI tutor. I can help you understand concepts, answer questions, or provide learning resources. What would you like to learn about today?";
  
  // Test props for the GoogleAIChatApp component
  // These would be provided dynamically in production
  const showYouTube = false;
  const showUpload = false;
  const YouTubeURL = "https://www.youtube.com/watch?v=hg6d1Jcm3w0";
  const YouTubeDisplayName = "Introduction to Online Learning"; // Custom display name for the YouTube video
  const allowContentRemoval = false; // Set to false to prevent users from removing any content
  const showResourcesAtTop = true; // Display predefined resources at the top
  
  // Example of predefined files that would come from Firebase Storage
  const predefinedFiles = [
    "gs://rtd-academy.appspot.com/files/-OJJIPFxZBlVilWdgQGg/Proof of Enrollment.pdf"
  ];
  
  // Custom display names for the predefined files (maps file URLs to display names)
  const predefinedFilesDisplayNames = {
    "gs://rtd-academy.appspot.com/files/-OJJIPFxZBlVilWdgQGg/Proof of Enrollment.pdf": "Course Enrollment Document"
  };
  
  // Example context object according to Genkit documentation
  // This would typically come from authentication or user state in production
  const context = {
    auth: {
      uid: "test-student-123",
      token: {
        email: "teststudent@example.com",
        name: "Test Student"
      }
    },
    // Additional context information about the student
    userInfo: {
      studentName: "John Doe",
      gradeLevel: "Grade 10",
      currentCourse: "Mathematics 10-1"
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <GoogleAIChatApp 
          instructions={instructions}
          firstMessage={firstMessage}
          showYouTube={showYouTube}
          showUpload={showUpload}
          //YouTubeURL={YouTubeURL}
          //YouTubeDisplayName={YouTubeDisplayName}
          //predefinedFiles={predefinedFiles}
          //predefinedFilesDisplayNames={predefinedFilesDisplayNames}
          allowContentRemoval={allowContentRemoval}
          showResourcesAtTop={showResourcesAtTop}
          context={context}
        />
      </div>
    </div>
  );
};

export default GoogleAIChatPage;