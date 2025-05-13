import React, { useRef, useEffect, useState } from 'react';
import SimpleReadButton from './SimpleReadButton';

/**
 * A simplified read-aloud container that uses the global audio context
 */
const SimpleReadAloudText = ({ 
  children, 
  buttonText = "Read Aloud",
  buttonVariant = "outline",
  iconPosition = "left",
  className = "",
  buttonClassName = ""
}) => {
  const textRef = useRef(null);
  const [textContent, setTextContent] = useState('');
  
  // Extract text content after initial render
  useEffect(() => {
    if (textRef.current) {
      const content = textRef.current.innerText || textRef.current.textContent || '';
      setTextContent(content);
    }
  }, [children]);

  return (
    <div className={`read-aloud-section ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <SimpleReadButton 
          text={textContent}
          buttonText={buttonText}
          buttonVariant={buttonVariant}
          iconPosition={iconPosition}
          className={buttonClassName}
        />
      </div>
      
      <div ref={textRef} className="read-aloud-content">
        {children}
      </div>
    </div>
  );
};

export default SimpleReadAloudText;