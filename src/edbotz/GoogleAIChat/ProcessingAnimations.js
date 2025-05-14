import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scan, 
  FileText, 
  Film, 
  Eye, 
  Search, 
  FileSearch,
  Youtube,
  BrainCircuit 
} from 'lucide-react';

// Base processing animation container
const AnimationContainer = ({ children, label, className = "" }) => (
  <div className={`flex flex-col items-center space-y-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100 ${className}`}>
    {children}
    <p className="text-xs text-indigo-700 font-medium animate-pulse">{label}</p>
  </div>
);

// Scanning animation for images
export const ImageScanningAnimation = () => (
  <AnimationContainer label="Analyzing image...">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <Scan className="text-indigo-600 w-10 h-10" />
      <motion.div 
        className="absolute w-full h-0.5 bg-indigo-500"
        initial={{ top: 0 }}
        animate={{ 
          top: ['0%', '100%', '0%'],
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-indigo-300"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0, 0.5, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
    </div>
  </AnimationContainer>
);

// Document reading animation
export const DocumentReadingAnimation = () => (
  <AnimationContainer label="Reading document...">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <FileText className="text-indigo-600 w-10 h-10" />
      <motion.div 
        className="absolute left-0 w-full h-0.5 bg-indigo-500"
        initial={{ top: "20%" }}
        animate={{ 
          top: ['20%', '35%', '50%', '65%', '80%', '65%', '50%', '35%', '20%'], 
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div 
        className="absolute w-2 h-2 rounded-full bg-indigo-600 left-0"
        animate={{ 
          left: ['10%', '90%', '10%'] 
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute inset-0 border-2 border-indigo-300 rounded"
        animate={{ 
          borderColor: ['rgba(165, 180, 252, 0.5)', 'rgba(165, 180, 252, 1)', 'rgba(165, 180, 252, 0.5)']
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    </div>
  </AnimationContainer>
);

// Video watching animation
export const VideoWatchingAnimation = () => (
  <AnimationContainer label="Watching video...">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <Youtube className="text-red-600 w-10 h-10" />
      <motion.div 
        className="absolute w-12 h-8 border-2 border-indigo-600 rounded"
        animate={{ 
          scale: [1, 1.1, 1],
          borderColor: ['rgb(79, 70, 229)', 'rgb(99, 102, 241)', 'rgb(79, 70, 229)']
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute w-2 h-2 rounded-full bg-indigo-600"
        style={{ top: '50%', left: '50%', marginLeft: -4, marginTop: -4 }}
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7] 
        }}
        transition={{ 
          duration: 1.2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    </div>
  </AnimationContainer>
);

// AI thinking animation
export const AIThinkingAnimation = () => (
  <AnimationContainer label="Thinking..." className="max-w-md mx-auto my-2">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <BrainCircuit className="text-indigo-600 w-10 h-10" />
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-indigo-300"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3],
          borderColor: ['rgb(165, 180, 252)', 'rgb(99, 102, 241)', 'rgb(165, 180, 252)']
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute w-1 h-1 rounded-full bg-indigo-600"
        style={{ top: '30%', left: '30%' }}
        animate={{ 
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          delay: 0.2,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute w-1 h-1 rounded-full bg-indigo-600"
        style={{ top: '60%', left: '40%' }}
        animate={{ 
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          delay: 0.5,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute w-1 h-1 rounded-full bg-indigo-600"
        style={{ top: '40%', left: '70%' }}
        animate={{ 
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          delay: 0.8,
          ease: "easeInOut" 
        }}
      />
    </div>
  </AnimationContainer>
);

// Function to get the right animation based on file type
export const getProcessingAnimation = (mediaItem) => {
  if (!mediaItem) return null;
  
  const { type } = mediaItem;
  
  if (type === 'image') {
    return <ImageScanningAnimation />;
  } else if (type === 'document' || type === 'file') {
    return <DocumentReadingAnimation />;
  } else if (type === 'youtube' || type === 'video') {
    return <VideoWatchingAnimation />;
  }
  
  return null;
};