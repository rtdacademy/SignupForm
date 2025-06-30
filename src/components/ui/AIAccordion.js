import React, { useRef } from 'react';
import { Bot, ChevronDown } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

/**
 * AI-Enhanced Accordion Component
 * 
 * Extends the base accordion with integrated "Ask AI" functionality that extracts
 * content from the accordion body and sends it to the AI chat with proper context.
 */

/**
 * Process DOM elements to remove interactivity and make them static for chat display
 * @param {Element} element - DOM element to process
 * @returns {string} - Cleaned HTML string
 */
const processElementForStaticDisplay = (element) => {
  if (!element) return '';
  
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true);
  
  // Remove all event handlers and interactive attributes
  const removeInteractivity = (el) => {
    // Remove event handler attributes
    const eventAttribs = ['onclick', 'onmouseover', 'onmouseout', 'onhover', 'onfocus', 'onblur', 'onchange'];
    eventAttribs.forEach(attr => {
      if (el.hasAttribute && el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });
    
    // Remove data attributes that might be used for event handling
    if (el.hasAttribute && el.hasAttribute('data-tooltip')) {
      // Convert tooltip to visible content
      const tooltipContent = el.getAttribute('data-tooltip');
      if (tooltipContent) {
        // Create a span with the tooltip content made visible
        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltip-content-static text-xs text-gray-600 italic ml-1';
        tooltipSpan.textContent = `(${tooltipContent})`;
        el.appendChild(tooltipSpan);
      }
      el.removeAttribute('data-tooltip');
    }
    
    // Handle common tooltip/popover patterns
    if (el.className && typeof el.className === 'string') {
      // Remove hover and focus classes that might trigger tooltips
      el.className = el.className
        .replace(/hover:[^\s]*/g, '')
        .replace(/focus:[^\s]*/g, '')
        .replace(/group-hover:[^\s]*/g, '')
        .replace(/tooltip[^\s]*/g, '')
        .replace(/popover[^\s]*/g, '');
      
      // Remove tooltip containers that should not appear in static content
      if (el.className.includes('opacity-0') || 
          el.className.includes('group-hover:opacity-100') ||
          el.className.includes('absolute') && el.className.includes('pointer-events-none')) {
        // This is likely a tooltip container - remove it entirely
        el.remove();
        return null;
      }
    }
    
    // Convert buttons to spans to remove interactivity
    if (el.tagName === 'BUTTON') {
      const span = document.createElement('span');
      span.innerHTML = el.innerHTML;
      span.className = el.className + ' static-button';
      return span;
    }
    
    // Handle specific tooltip patterns (like ⓘ symbols)
    if (el.textContent === 'ⓘ' || el.innerHTML === 'ⓘ') {
      // Look for associated tooltip content in siblings or data attributes
      let tooltipText = '';
      
      // Check for tooltip in title attribute
      if (el.title) {
        tooltipText = el.title;
      }
      
      // Check for tooltip in aria-label
      if (el.getAttribute && el.getAttribute('aria-label')) {
        tooltipText = el.getAttribute('aria-label');
      }
      
      // Check for React tooltip props (common patterns)
      if (el.getAttribute && el.getAttribute('data-tip')) {
        tooltipText = el.getAttribute('data-tip');
      }
      
      // Look for hover tooltip content in sibling elements (like your example)
      const parent = el.parentElement;
      if (parent) {
        // Look for tooltip content in nested divs with opacity classes
        const tooltipDiv = parent.querySelector('div[class*="opacity-0"], div[class*="group-hover:opacity-100"]');
        if (tooltipDiv) {
          const tooltipTextContent = tooltipDiv.textContent || tooltipDiv.innerText || '';
          if (tooltipTextContent.trim()) {
            tooltipText = tooltipTextContent.trim();
          }
        }
        
        // Also check for tooltip content in absolute positioned elements
        const absoluteTooltip = parent.querySelector('div[class*="absolute"]');
        if (absoluteTooltip && !tooltipText) {
          const tooltipTextContent = absoluteTooltip.textContent || absoluteTooltip.innerText || '';
          if (tooltipTextContent.trim()) {
            tooltipText = tooltipTextContent.trim();
          }
        }
      }
      
      if (tooltipText) {
        // Replace the ⓘ with the actual content
        el.innerHTML = `<span class="tooltip-expanded text-xs text-gray-600 italic">(${tooltipText})</span>`;
      } else {
        // If no tooltip content found, remove the ⓘ entirely
        el.remove();
        return null;
      }
    }
    
    // Handle other common interactive elements
    if (el.tagName === 'A' && el.getAttribute('href')) {
      // Convert links to plain text with URL shown
      const href = el.getAttribute('href');
      const linkText = el.textContent || el.innerText || '';
      if (href.startsWith('http') && href !== linkText) {
        el.innerHTML = `${linkText} (${href})`;
      }
      el.removeAttribute('href');
      // Convert to span
      const span = document.createElement('span');
      span.innerHTML = el.innerHTML;
      span.className = el.className + ' static-link text-blue-600';
      return span;
    }
    
    // Handle form inputs by showing their values as static text
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      const value = el.value || el.getAttribute('value') || el.getAttribute('placeholder') || '';
      const span = document.createElement('span');
      span.className = 'static-input bg-gray-100 px-2 py-1 rounded text-sm';
      span.textContent = value || '[Input field]';
      return span;
    }
    
    // Recursively process child elements
    if (el.children) {
      Array.from(el.children).forEach(child => {
        const result = removeInteractivity(child);
        if (result === null) {
          // Child was removed
          return;
        } else if (result && result !== child) {
          // Child was replaced
          el.replaceChild(result, child);
        }
      });
    }
    
    return el;
  };
  
  const processedElement = removeInteractivity(clonedElement);
  return processedElement ? processedElement.outerHTML : '';
};

const AIAccordionItem = ({ 
  children, 
  title, 
  value,
  onAskAI = null,
  askAIButtonText = "Ask AI",
  className = "",
  ...props 
}) => {
  const contentRef = useRef(null);

  const handleAskAI = () => {
    if (!onAskAI) {
      console.warn('onAskAI callback not provided to AIAccordionItem');
      return;
    }

    try {
      // Extract content from the accordion body
      const contentElement = contentRef.current;
      if (!contentElement) {
        console.warn('Content element not found');
        return;
      }

      // Extract original JSX by processing and cleaning the children element
      let originalJSX = null;
      try {
        // Get the children element content
        const childrenElement = contentElement.querySelector('.px-5.py-4') || contentElement;
        if (childrenElement && childrenElement.children.length > 0) {
          
          // Create a cleaned HTML version by processing the DOM
          let cleanedHTML = '';
          Array.from(childrenElement.children).forEach((child) => {
            cleanedHTML += processElementForStaticDisplay(child);
          });
          
          // Create static JSX from cleaned HTML
          if (cleanedHTML.trim()) {
            originalJSX = React.createElement('div', {
              className: 'accordion-content-display static-content',
              key: 'extracted-content',
              dangerouslySetInnerHTML: { __html: cleanedHTML }
            });
          }
        }
      } catch (jsxError) {
        console.warn('Failed to extract original JSX:', jsxError);
        originalJSX = null;
      }

      // Get the raw HTML content first to preserve structure
      let htmlContent = contentElement.innerHTML || '';
      
      // Clean up zero-width spaces and other problematic Unicode characters
      htmlContent = htmlContent
        .replace(/\u200B/g, '')  // Remove zero-width space (8203)
        .replace(/\u00A0/g, ' ') // Replace non-breaking space with regular space
        .replace(/\u2060/g, '')  // Remove word joiner
        .replace(/\uFEFF/g, ''); // Remove byte order mark
      
      // Extract and preserve math expressions with improved detection
      const extractedMath = [];
      const mathPlaceholder = '___MATH_PLACEHOLDER___';
      let workingContent = htmlContent;
      
      // First, look for any existing LaTeX delimiters in the HTML before KaTeX processing
      const latexPatterns = [
        { pattern: /\$\$([^$]+)\$\$/g, isBlock: true },  // Block math $$...$$
        { pattern: /\$([^$\n]+)\$/g, isBlock: false },   // Inline math $...$
        { pattern: /\\\\?\[([^\]]+)\\\\?\]/g, isBlock: true },  // LaTeX brackets \[...\]
        { pattern: /\\\\?\(([^)]+)\\\\?\)/g, isBlock: false }   // LaTeX parens \(...\)
      ];

      // Extract any existing LaTeX expressions
      latexPatterns.forEach(({ pattern, isBlock }) => {
        let match;
        while ((match = pattern.exec(workingContent)) !== null) {
          extractedMath.push({
            original: match[0],
            content: match[1],
            isBlock: isBlock,
            placeholder: `${mathPlaceholder}${extractedMath.length}${mathPlaceholder}`
          });
          workingContent = workingContent.replace(match[0], extractedMath[extractedMath.length - 1].placeholder);
        }
      });

      // Second, handle rendered KaTeX spans by looking for MathML annotations
      const katexSpans = workingContent.match(/<span[^>]*class="[^"]*katex[^"]*"[^>]*>.*?<\/span>/gs) || [];
      
      katexSpans.forEach((span) => {
        // Try to find the original LaTeX in MathML annotation
        const annotationMatch = span.match(/<annotation[^>]*encoding="application\/x-tex"[^>]*>([^<]*)<\/annotation>/);
        
        if (annotationMatch) {
          // Found original LaTeX in annotation - this is the most reliable
          let mathContent = annotationMatch[1];
          // Clean problematic Unicode characters from math content
          mathContent = mathContent
            .replace(/\u200B/g, '')  // Remove zero-width space (8203)
            .replace(/\u00A0/g, ' ') // Replace non-breaking space with regular space
            .replace(/\u2060/g, '')  // Remove word joiner
            .replace(/\uFEFF/g, ''); // Remove byte order mark
          
          const isBlock = span.includes('katex-display');
          const mathObj = {
            original: span,
            content: mathContent,
            isBlock: isBlock,
            placeholder: `${mathPlaceholder}${extractedMath.length}${mathPlaceholder}`
          };
          extractedMath.push(mathObj);
          // Replace the entire KaTeX span with just the placeholder - this prevents duplicate text
          workingContent = workingContent.replace(span, mathObj.placeholder);
        } else {
          // Fallback: if no annotation found, try to extract clean visible text
          // but only if it looks like a simple variable or short expression
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = span;
          const visibleText = tempDiv.textContent || tempDiv.innerText || '';
          
          if (visibleText && visibleText.trim()) {
            const cleanText = visibleText.trim();
            // Only keep if it's a simple variable/expression (not a long formula)
            if (cleanText.length <= 20 && !cleanText.includes('=')) {
              // This looks like a variable name - keep it as plain text
              workingContent = workingContent.replace(span, cleanText);
            } else {
              // This is likely a complex expression - remove to avoid duplication
              workingContent = workingContent.replace(span, '');
            }
          } else {
            workingContent = workingContent.replace(span, '');
          }
        }
      });
      
      // Also remove any remaining KaTeX-related elements that might create duplicates
      workingContent = workingContent
        // Remove any remaining katex spans that weren't caught above
        .replace(/<span[^>]*katex[^>]*>.*?<\/span>/gs, '')
        // Remove any mathml elements
        .replace(/<math[^>]*>.*?<\/math>/gs, '')
        // Remove annotation elements
        .replace(/<annotation[^>]*>.*?<\/annotation>/gs, '');
      
      // Now get clean text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = workingContent;
      let textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Smart text cleaning - be more conservative
      textContent = textContent
        // Remove tooltip indicators and info symbols
        .replace(/ⓘ/g, '')
        .replace(/\s*ⓘ\s*/g, ' ')
        
        // Remove "Click to expand" and similar UI text
        .replace(/Click to expand/gi, '')
        .replace(/This is approximately[^!]*!/g, '')
        
        // Remove all backticks to prevent AI from using code formatting
        .replace(/`/g, '')
        
        // Clean up broken variable assignments (like "Initial velocity: 0=0 m/s")
        .replace(/:\s*=([^=])/g, ': $1')  // Fix ": =" to ": "
        .replace(/:\s*([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*)\s*=\s*/g, ': $1 = ')  // Fix double equals
        
        // Clean up excessive whitespace while preserving structure
        .replace(/\s+/g, ' ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*\.\s*/g, '. ')
        .trim();

      // Restore math expressions with proper markdown formatting
      extractedMath.forEach((mathObj) => {
        let mathMarkdown;
        
        if (mathObj.isBlock) {
          mathMarkdown = `\n$$${mathObj.content}$$\n`;
        } else {
          mathMarkdown = `$${mathObj.content}$`;
        }
        
        textContent = textContent.replace(mathObj.placeholder, mathMarkdown);
      });

      // Create structured markdown with better section detection
      let markdownContent = textContent;
      
      // Add markdown structure more intelligently
      markdownContent = markdownContent
        // Main sections
        .replace(/^(Problem|Solution|Given|Find|Answer|Final answer):\s*/gm, '\n## $1:\n')
        .replace(/^(Step \d+|Part [A-Z]):\s*/gm, '\n### $1:\n')
        
        // Format standalone equations (not mixed with text)
        .replace(/^([a-zA-Z_]\w*\s*=\s*[^,\n]+)$/gm, '\n$$$1$$\n')
        
        // Clean up spacing and structure
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\n+/, '')  // Remove leading newlines
        .replace(/\n+$/, '')  // Remove trailing newlines
        .trim();

      // Create a cleaner preview (first 200 chars)
      const cleanPreview = markdownContent
        .replace(/#{1,3}\s*/g, '')  // Remove markdown headers for preview
        .replace(/`([^`]+)`/g, '$1')  // Remove any remaining code formatting for preview
        .substring(0, 200);

      // Structure the extracted content
      const extractedContent = {
        title: title || 'Content',
        content: markdownContent,
        originalJSX: originalJSX, // Include the original JSX for proper rendering
        type: 'accordion-content',
        wordCount: markdownContent.split(' ').filter(word => word.length > 0).length,
        preview: cleanPreview + (markdownContent.length > 200 ? '...' : '')
      };

      // Call the provided callback with the extracted content
      onAskAI(extractedContent);
      
    } catch (error) {
      console.error('Error extracting content from accordion:', error);
      
      // Fallback to simple title-based question
      onAskAI({
        title: title || 'Content',
        content: `Can you help me understand: ${title}`,
        type: 'fallback',
        wordCount: 0,
        preview: `Can you help me understand: ${title}`
      });
    }
  };

  return (
    <AccordionItem 
      value={value} 
      className={`${className} !bg-transparent !rounded-none !border-0 !shadow-none !m-0 !p-0 transition-all duration-200 overflow-hidden`}
      {...props}
    >
      <AccordionTrigger className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 rounded-lg group-data-[state=open]:!rounded-b-none border border-purple-600 relative [&>svg]:hidden shadow-md hover:shadow-lg">
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-left font-semibold text-white">{title}</span>
          
          {/* Ask AI Button - Only visible when accordion is open */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle
              handleAskAI();
            }}
            className="ml-3 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 opacity-0 group-data-[state=open]:opacity-100 invisible group-data-[state=open]:visible"
            title="Ask AI about this content"
          >
            <Bot className="w-4 h-4" />
            {askAIButtonText}
          </button>
        </div>
        {/* Custom White Chevron - positioned absolutely to override the default */}
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 shrink-0 text-white stroke-[3] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </AccordionTrigger>
      
      <AccordionContent className="!p-0">
        <div ref={contentRef} className="px-5 py-4 bg-white border-x border-b border-purple-300 rounded-b-lg shadow-md">
          {children}
          
          {/* Bottom AI Button */}
          <div className="mt-6 pt-4 border-t border-purple-200 flex justify-center">
            <button
              onClick={handleAskAI}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              title="Ask AI about this content"
            >
              <Bot className="w-4 h-4" />
              Ask AI about this content
            </button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AIAccordion = ({ children, className = "", ...props }) => {
  return (
    <Accordion 
      type="single" 
      collapsible 
      className={`space-y-0 ${className}`} 
      {...props}
    >
      {children}
    </Accordion>
  );
};

// Export both the container and item components
AIAccordion.Item = AIAccordionItem;

export { AIAccordion, AIAccordionItem };
export default AIAccordion;