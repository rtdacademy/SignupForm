/**
 * Utility functions for sanitizing HTML content to prevent unwanted editable elements
 * and other potentially problematic attributes
 * this is particularly useful in applications where user-generated content is displayed
 * and you want to ensure that no contenteditable attributes or event handlers are present.
 */

/**
 * Sanitizes HTML content by removing contenteditable attributes and other problematic elements
 * 
 * @param {string} html - The HTML content to sanitize
 * @returns {string} Sanitized HTML content
 */
export const sanitizeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Select all elements in the document
    const allElements = doc.getElementsByTagName('*');
    
    // Loop through each element and remove problematic attributes
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const attributesToRemove = [];
      
      // Check all attributes of the current element
      for (let j = 0; j < element.attributes.length; j++) {
        const attr = element.attributes[j];
        const attrName = attr.name.toLowerCase();
        
        // Remove contenteditable attributes - this is the main culprit
        if (attrName === 'contenteditable') {
          attributesToRemove.push(attr.name);
        }
        
        // Remove event handlers (attributes starting with "on")
        if (attrName.startsWith('on')) {
          attributesToRemove.push(attr.name);
        }
        
        // Remove other potentially dangerous attributes
        if (['spellcheck', 'autocorrect', 'autocomplete', 'role'].includes(attrName)) {
          attributesToRemove.push(attr.name);
        }
      }
      
      // Remove the identified attributes
      attributesToRemove.forEach(attr => {
        element.removeAttribute(attr);
      });
    }
    
    // Get sanitized HTML from the body (to avoid duplicate html/body tags)
    return doc.body.innerHTML;
  };
  
  /**
   * Lightweight sanitization method that uses regex
   * This can be faster for simple cases but less thorough than the DOM-based approach
   * 
   * @param {string} html - The HTML content to sanitize
   * @returns {string} Sanitized HTML content
   */
  export const sanitizeHtmlRegex = (html) => {
    if (!html || typeof html !== 'string') return '';
    
    // Remove contenteditable attributes
    let sanitized = html.replace(/\s+contenteditable\s*=\s*["']?[^"'>\s]*["']?/gi, '');
    
    // Remove on* event handlers
    sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*["']?[^"'>\s]*["']?/gi, '');
    
    return sanitized;
  };
  
  export default sanitizeHtml;