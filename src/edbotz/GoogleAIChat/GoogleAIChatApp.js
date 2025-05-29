import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Loader, 
  Bot, 
  Info, 
  RotateCcw, 
  Image as ImageIcon, 
  X, 
  Youtube, 
  Link,
  FileIcon,
  FileText,
  File,
  Upload,
  Copy, 
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as syntaxTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
  fontSize: 14,
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  }
});

// Add global styles for markdown content in chat bubbles
const markdownStyles = document.createElement('style');
markdownStyles.textContent = `
  /* Markdown styling for chat bubbles */
  .markdown-content h1 {
    font-size: 1.5rem !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .markdown-content h2 {
    font-size: 1.25rem !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .markdown-content h3 {
    font-size: 1.1rem !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .markdown-content p {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }
  
  .markdown-content pre {
    background-color: #f5f5f5 !important;
    padding: 0.5rem !important;
    border-radius: 0.25rem !important;
    overflow-x: auto !important;
    max-width: 100% !important;
    border: 1px solid #e0e0e0 !important;
  }
  
  .markdown-content code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    font-size: 0.9em !important;
    color: #333 !important;
  }
  
  .markdown-content pre code {
    color: #333 !important;
    background-color: transparent !important;
  }
  
  .markdown-content img {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 0.25rem !important;
    margin: 0.5rem 0 !important;
  }
  
  .markdown-content blockquote {
    border-left: 3px solid #e5e7eb !important;
    padding-left: 0.75rem !important;
    color: #4b5563 !important;
    font-style: italic !important;
    margin: 0.5rem 0 !important;
  }
  
  .markdown-content ul,
  .markdown-content ol {
    padding-left: 1.5rem !important;
    margin: 0.25rem 0 !important;
  }
  
  .markdown-content li {
    margin: 0.125rem 0 !important;
  }
  
  /* Enhanced table styling */
  .markdown-content table {
    border-collapse: collapse !important;
    width: 100% !important;
    font-size: 0.875rem !important;
    margin: 0.5rem 0 !important;
    table-layout: fixed !important;
    overflow-x: auto !important;
  }
  
  .markdown-content table * {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  .markdown-content th,
  .markdown-content td {
    border: 1px solid #e5e7eb !important;
    padding: 0.25rem 0.5rem !important;
    text-align: left !important;
    min-width: 80px !important;
    max-width: 300px !important;
  }
  
  .markdown-content th {
    background-color: #f3f4f6 !important;
    font-weight: 600 !important;
  }
  
  /* Add scrolling to tables that exceed container width */
  .markdown-content .table-container {
    width: 100% !important;
    overflow-x: auto !important;
    margin: 0.5rem 0 !important;
    border-radius: 0.25rem !important;
  }
  
  .markdown-content .table-container table {
    margin: 0 !important;
  }
  
  /* Customize table row styling for better readability */
  .markdown-content tr:nth-child(odd) {
    background-color: rgba(0, 0, 0, 0.02) !important;
  }
  
  .markdown-content tr:hover {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  
  /* Definition list styling */
  .markdown-content dl {
    margin: 0.5rem 0 !important;
  }
  
  .markdown-content dt {
    font-weight: 600 !important;
    margin-top: 0.5rem !important;
  }
  
  .markdown-content dd {
    margin-left: 1.5rem !important;
    margin-bottom: 0.25rem !important;
  }
  
  /* Details/Summary styling */
  .markdown-content details {
    border: 1px solid #e5e7eb !important;
    border-radius: 0.375rem !important;
    padding: 0.5rem !important;
    margin: 0.5rem 0 !important;
  }
  
  .markdown-content summary {
    font-weight: 600 !important;
    cursor: pointer !important;
    padding: 0.25rem !important;
  }
  
  .markdown-content summary:hover {
    background-color: rgba(0, 0, 0, 0.02) !important;
  }
  
  /* Mermaid diagram styling */
  .markdown-content .mermaid-diagram {
    overflow-x: auto !important;
    max-width: 100% !important;
    margin: 1rem 0 !important;
    text-align: center !important;
  }
  
  /* Task list styling */
  .markdown-content input[type="checkbox"] {
    margin-right: 0.5rem !important;
  }
  
  /* Emoji styling */
  .markdown-content .emoji {
    display: inline-block !important;
    vertical-align: middle !important;
    font-size: 1.25em !important;
  }
`;
document.head.appendChild(markdownStyles);
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { AI_MODEL_MAPPING } from '../utils/settings';
import { Input } from '../../components/ui/input';
import { 
  ImageScanningAnimation, 
  DocumentReadingAnimation, 
  VideoWatchingAnimation, 
  AIThinkingAnimation,
  getProcessingAnimation
} from './ProcessingAnimations';

// Helper function to extract YouTube video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to match YouTube video IDs from various URL formats
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[1].length === 11) ? match[1] : null;
};

// Get file icon based on mime type or extension
const getFileIcon = (file) => {
  if (!file) return <FileIcon />;
  
  const fileName = file.name || '';
  const mimeType = file.type || '';
  
  // Check by mime type first
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType.startsWith('video/')) return <Youtube />;
  if (mimeType.startsWith('audio/')) return <FileIcon />;
  if (mimeType.includes('pdf')) return <FileText />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <FileText />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return <FileText />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <FileText />;
  
  // Check by extension as fallback
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) return <FileText />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) return <FileText />;
  if (['ppt', 'pptx', 'odp'].includes(extension)) return <FileText />;
  
  // Default file icon
  return <File />;
};

// Get friendly file size
const getFormattedSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// YouTube embed component
const YouTubeEmbed = ({ videoId, className }) => {
  if (!videoId) return null;
  
  return (
    <div className={cn("relative w-full pt-[56.25%]", className)}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

// Code component with syntax highlighting and copy button
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button 
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        customStyle={{
          borderRadius: '0.375rem',
          padding: '1rem',
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          backgroundColor: '#f5f5f5', // Lighter background
          color: '#333', // Darker text color for better contrast
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// Mermaid diagram component
const MermaidDiagram = ({ value, className }) => {
  const [svgContent, setSvgContent] = useState('');
  const uniqueId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(uniqueId.current, value);
        setSvgContent(svg);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        setSvgContent(`<pre class="text-red-500 p-2 bg-red-50 rounded">Error rendering diagram: ${error.message}</pre>`);
      }
    };

    renderDiagram();
  }, [value]);

  return (
    <div 
      className={cn("mermaid-diagram my-4 overflow-auto max-w-full", className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

// Sample message component
// Helper function to detect markdown
const containsMarkdown = (text) => {
  if (!text) return false;
  
  // Look for more precise patterns to reduce false positives
  const markdownPatterns = [
    /^#+\s+.+$/m,                  // Headers: # Header
    /\*\*.+\*\*/,                  // Bold: **bold**
    /\*.+\*/,                      // Italic: *italic*
    /```[\s\S]*```/,               // Code block: ```code```
    /`[^`]+`/,                     // Inline code: `code`
    /\[.+\]\(.+\)/,                // Links: [text](url)
    /\|[^|]+\|[^|]+\|/,            // Tables: |cell|cell|
    /^\s*>\s+.+$/m,                // Blockquotes: > quote
    /^\s*-\s+.+$/m,                // Unordered lists: - item
    /^\s*\d+\.\s+.+$/m,            // Ordered lists: 1. item
    /!\[.+\]\(.+\)/,               // Images: ![alt](url)
    /~~.+~~/,                      // Strikethrough: ~~text~~
    /\$\$.+\$\$/,                  // Math blocks: $$math$$
    /\$.+\$/,                      // Inline math: $math$
    /\\[a-zA-Z]+/,                 // LaTeX commands: \alpha, \beta, etc.
    /\\begin\{/,                   // LaTeX environments: \begin{...}
    /\\end\{/,                     // LaTeX environments: \end{...}
    /\\frac\{/,                    // LaTeX fractions: \frac{...}
    /\\sqrt/,                      // LaTeX square roots: \sqrt{...}
    /\\left/,                      // LaTeX brackets: \left(...
    /\\right/,                     // LaTeX brackets: \right)...
  ];
  
  // Check for simple text indicators first for better performance
  const quickCheck = (
    text.includes('#') || 
    text.includes('**') || 
    text.includes('*') ||
    text.includes('```') ||
    text.includes('`') ||
    text.includes('[') ||
    text.includes('|') ||
    text.includes('> ') ||
    text.includes('- ') ||
    text.includes('1. ') ||
    text.includes('$') ||  // Math delimiters
    text.includes('\\')    // LaTeX commands
  );
  
  // If quick check passes, do more precise checking
  if (quickCheck) {
    // Check for common markdown patterns
    for (const pattern of markdownPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    // Special case for tables which can be tricky to detect
    if (text.includes('|')) {
      // Count pipe characters in the text
      const pipeCount = (text.match(/\|/g) || []).length;
      // If there are multiple pipe characters, it's likely a table
      if (pipeCount >= 4) {
        return true;
      }
    }
  }
  
  return false;
};

// Helper function to prepare text for remark-gfm table processing
const formatMarkdownTables = (text) => {
  if (!text || !text.includes('|')) return text;
  
  // Simple processing: just ensure tables have proper newlines and separator rows
  
  // First, remove any blockquote markers (>) which could interfere with table parsing
  let cleanedText = text.replace(/^>\s*/gm, '').replace(/\n>\s*/g, '\n');
  
  // Split into lines for processing
  const lines = cleanedText.split('\n');
  const newLines = [];
  let inTable = false;
  let tableStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      newLines.push('');
      continue;
    }
    
    // Count pipe characters to detect table rows
    const pipeCount = (line.match(/\|/g) || []).length;
    
    // If this looks like a table row (at least two pipes)
    if (pipeCount >= 2) {
      // New table detected
      if (!inTable) {
        inTable = true;
        tableStartIndex = newLines.length;
      }
      
      // Clean and normalize the row format
      // Ensure there's a space after each pipe for better GFM compatibility
      let cleanedLine = line;
      cleanedLine = cleanedLine.replace(/\|(\S)/g, '| $1'); // Add space after pipes
      cleanedLine = cleanedLine.replace(/(\S)\|/g, '$1 |'); // Add space before pipes
      
      // Ensure the line starts and ends with a pipe
      if (!cleanedLine.startsWith('|')) {
        cleanedLine = '| ' + cleanedLine;
      }
      if (!cleanedLine.endsWith('|')) {
        cleanedLine = cleanedLine + ' |';
      }
      
      newLines.push(cleanedLine);
      
      // Check if we need to add a separator row after the header
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const hasHeaderSeparator = nextLine.includes('|') && nextLine.includes('-');
      
      // If this looks like a header row and the next line is not a separator, add one
      if (inTable && tableStartIndex === newLines.length - 1 && !hasHeaderSeparator) {
        // Determine column count from pipes
        const columns = cleanedLine.split('|').filter(Boolean).length;
        let separator = '|';
        for (let j = 0; j < columns; j++) {
          separator += ' --- |';
        }
        newLines.push(separator);
      }
    } else {
      // Not a table row
      if (inTable) {
        // We were in a table, but this line isn't part of it
        inTable = false;
      }
      newLines.push(line);
    }
  }
  
  return newLines.join('\n');
};

// Helper function to enhance links in HTML content
const enhanceLinks = (htmlContent) => {
  if (!htmlContent) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  
  // Process all links
  const links = div.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    // Add necessary attributes for security and styling
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.classList.add('text-blue-600');
    link.style.textDecoration = 'underline';
    link.style.fontWeight = 'bold';
  });
  
  // Process all images
  const images = div.getElementsByTagName('img');
  Array.from(images).forEach(img => {
    // Add responsive classes
    img.classList.add('max-w-full', 'rounded-lg', 'my-2');
    img.style.maxHeight = '300px';
    img.style.objectFit = 'contain';
  });
  
  // Process all iframes (YouTube embeds)
  const iframes = div.getElementsByTagName('iframe');
  Array.from(iframes).forEach(iframe => {
    // Add responsive wrapper if not already wrapped
    if (iframe.parentElement && !iframe.parentElement.classList.contains('youtube-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('youtube-wrapper', 'relative', 'w-full', 'pt-[56.25%]', 'my-4');
      iframe.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'rounded-lg');
      
      // Replace the iframe with the wrapped iframe
      iframe.parentNode.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    }
  });
  
  // Enhance code blocks for better readability
  const preElements = div.getElementsByTagName('pre');
  Array.from(preElements).forEach(pre => {
    pre.classList.add('bg-gray-100', 'p-2', 'rounded-md', 'overflow-auto', 'my-2', 'text-sm', 'max-h-[200px]', 'border', 'border-gray-200');
    pre.style.backgroundColor = '#f5f5f5';
    pre.style.color = '#333';
  });
  
  const codeElements = div.getElementsByTagName('code');
  Array.from(codeElements).forEach(code => {
    if (code.parentElement.tagName !== 'PRE') {
      code.classList.add('bg-gray-100', 'px-1', 'py-0.5', 'rounded', 'text-sm');
      code.style.color = '#333';
    } else {
      // For code blocks inside pre elements
      code.style.color = '#333';
      code.style.backgroundColor = 'transparent';
    }
  });
  
  // Enhance blockquotes
  const blockquotes = div.getElementsByTagName('blockquote');
  Array.from(blockquotes).forEach(blockquote => {
    blockquote.classList.add('border-l-4', 'border-l-gray-300', 'pl-4', 'italic', 'my-2');
  });
  
  // Enhance lists for better spacing
  const ulElements = div.getElementsByTagName('ul');
  Array.from(ulElements).forEach(ul => {
    ul.classList.add('my-1', 'pl-5');
  });
  
  const olElements = div.getElementsByTagName('ol');
  Array.from(olElements).forEach(ol => {
    ol.classList.add('my-1', 'pl-5');
  });
  
  return div.innerHTML;
};

const MessageBubble = ({ 
  message, 
  isStreaming = false, 
  isProcessing = false,
  processingMedia = null,
  userName = 'You', 
  assistantName = 'Google AI Assistant'
}) => {
  const isUser = message.sender === 'user';
  
  // Helper function to render media content
  const renderMedia = (media) => {
    if (!media || !media.length) return null;
    
    return (
      <div className="flex flex-col gap-2 mb-2 w-full">
        {media.map((item, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
            {item.type === 'image' && (
              <img 
                src={item.url} 
                alt="Uploaded image" 
                className="max-w-full max-h-[300px] object-contain"
              />
            )}
            {item.type === 'youtube' && (
              <div className="w-full max-w-xl">
                <YouTubeEmbed 
                  videoId={extractYouTubeVideoId(item.url)} 
                  className="mb-2"
                />
                <div className="text-xs text-gray-500 mb-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    {item.url}
                  </a>
                </div>
              </div>
            )}
            {item.type === 'document' && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                {getFileIcon(item)}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">{getFormattedSize(item.size)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render processing animations when the AI is analyzing
  const renderProcessingAnimations = () => {
    if (!isProcessing || !processingMedia) return null;
    
    if (Array.isArray(processingMedia)) {
      // If processing multiple media items, group them by type
      const mediaTypes = {};
      processingMedia.forEach(item => {
        mediaTypes[item.type] = true;
      });
      
      return (
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {mediaTypes.image && <ImageScanningAnimation />}
          {mediaTypes.document && <DocumentReadingAnimation />}
          {(mediaTypes.youtube || mediaTypes.video) && <VideoWatchingAnimation />}
        </div>
      );
    } else {
      // If processing a single media item
      return getProcessingAnimation(processingMedia);
    }
  };
  
  // Render the message content
  const renderMessageContent = () => {
    // If the message is flagged as HTML content (from Quill editor)
    if (message.isHtml || (message.text && message.text.includes('<') && message.text.includes('>'))) {
      return (
        <div 
          className={cn(
            "prose prose-sm max-w-none chat-content-html",
            isUser && "text-white [&_*]:text-white [&_a]:text-white"
          )}
          dangerouslySetInnerHTML={{ __html: enhanceLinks(message.text) }}
        />
      );
    }
    
    // Check if the message might be markdown or contains math
    if (message.text && (containsMarkdown(message.text) || message.text.includes('$') || message.text.includes('\\'))) {
      // Format tables properly if present
      const formattedText = formatMarkdownTables(message.text);
      
      return (
        <div className={cn(
          "prose prose-sm max-w-none markdown-content",
          isUser && "text-white [&_*]:text-white [&_a]:text-white [&_code]:bg-blue-800 [&_pre]:bg-blue-600",
          !isUser && "[&_pre]:bg-gray-100 [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_pre_code]:text-gray-800 [&_blockquote]:border-l-4 [&_blockquote]:border-l-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
            rehypePlugins={[
              [rehypeSanitize, {
                // Standard HTML elements plus additional elements for admonitions and details/summary
                allowedElements: [
                  // Standard markdown elements
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                  'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                  'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span',
                  // Additional elements we want to allow
                  'details', 'summary', 'dl', 'dt', 'dd'
                ],
                // Allow certain attributes
                allowedAttributes: {
                  // Allow href and target for links
                  a: ['href', 'target', 'rel'],
                  // Allow src and alt for images
                  img: ['src', 'alt', 'title'],
                  // Allow class and style for common elements
                  div: ['className', 'class', 'style'],
                  span: ['className', 'class', 'style'],
                  code: ['className', 'class', 'language'],
                  pre: ['className', 'class'],
                  // Allow open attribute for details
                  details: ['open']
                }
              }],
              rehypeKatex,
              rehypeRaw
            ]}
            components={{
              // Make headings slightly smaller in chat bubbles
              h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-1 mb-2" {...props} />,
              h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-1 mb-2" {...props} />,
              h3: ({node, ...props}) => <h4 className="text-base font-bold mt-1 mb-1" {...props} />,
              
              // Enhanced code blocks with syntax highlighting
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const value = String(children).replace(/\n$/, '');
                
                // For inline code
                if (inline) {
                  return <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-800" {...props}>{children}</code>
                }
                
                // Check if this is a mermaid diagram
                if (language === 'mermaid') {
                  return <MermaidDiagram value={value} />
                }
                
                // Return syntax highlighted code block
                return <CodeBlock language={language} value={value} />
              },
              
              // Make lists more compact
              ul: ({node, ...props}) => <ul className="my-1 pl-5" {...props} />,
              ol: ({node, ...props}) => <ol className="my-1 pl-5" {...props} />,
              li: ({node, ...props}) => <li className="my-0.5" {...props} />,
              
              // Make links open in new tab and have proper styling
              a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="font-medium underline" {...props} />,
              
              // Style tables to fit in bubbles with horizontal scrolling
              table: ({node, ...props}) => (
                <div className="table-container">
                  <table className="border-collapse border border-gray-300 text-sm" {...props} />
                </div>
              ),
              th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
              td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
              
              // Handle details/summary elements
              details: ({node, ...props}) => <details className="border rounded-md p-2 my-2" {...props} />,
              summary: ({node, ...props}) => <summary className="font-medium cursor-pointer" {...props} />,
              
              // Definition lists
              dl: ({node, ...props}) => <dl className="my-2" {...props} />,
              dt: ({node, ...props}) => <dt className="font-bold mt-2" {...props} />,
              dd: ({node, ...props}) => <dd className="ml-4 mt-1" {...props} />,
              
              // Default component to handle HTML directly
              div: ({node, className, ...props}) => {
                // Special handling for admonitions
                if (className?.includes('admonition')) {
                  const type = className.includes('note') ? 'note' : 
                              className.includes('warning') ? 'warning' : 
                              className.includes('danger') ? 'danger' : 'info';
                  
                  const colors = {
                    note: 'bg-blue-50 border-blue-300 text-blue-800',
                    info: 'bg-green-50 border-green-300 text-green-800',
                    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
                    danger: 'bg-red-50 border-red-300 text-red-800'
                  };
                  
                  return <div className={`${colors[type]} p-3 border-l-4 rounded my-3`} {...props} />;
                }
                
                return <div className={className} {...props} />;
              }
            }}
          >
            {formattedText}
          </ReactMarkdown>
          {isStreaming && !isProcessing && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded"></span>
          )}
        </div>
      );
    }
    
    // Otherwise, check if user's message might contain math expressions
    const mightContainMath = message.text && (message.text.includes('$') || message.text.includes('\\'));
    
    // If it's a user message and contains math or we want consistent rendering, render with markdown
    if (isUser && mightContainMath) {
      const formattedText = formatMarkdownTables(message.text);
      
      return (
        <div className={cn(
          "prose prose-sm max-w-none markdown-content",
          "text-white [&_*]:text-white [&_a]:text-white"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
            rehypePlugins={[
              [rehypeSanitize, {
                allowedElements: [
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                  'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                  'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span',
                  'details', 'summary', 'dl', 'dt', 'dd'
                ],
                allowedAttributes: {
                  a: ['href', 'target', 'rel'],
                  img: ['src', 'alt', 'title'],
                  div: ['className', 'class', 'style'],
                  span: ['className', 'class', 'style'],
                  code: ['className', 'class', 'language'],
                  pre: ['className', 'class'],
                  details: ['open']
                }
              }],
              rehypeKatex,
              rehypeRaw
            ]}
            components={{
              // Style components for light-on-dark theme for user messages
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const value = String(children).replace(/\\n$/, '');
                
                if (inline) {
                  return <code className="px-1 py-0.5 rounded text-sm font-mono bg-blue-800 text-white" {...props}>{children}</code>
                }
                
                if (language === 'mermaid') {
                  return <MermaidDiagram value={value} />
                }
                
                // For code blocks in user messages, use a dark theme with light text
                return <div className="relative group">
                  <SyntaxHighlighter
                    language={language}
                    style={syntaxTheme}
                    customStyle={{
                      borderRadius: '0.375rem',
                      padding: '1rem',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#2d3748', // Dark background
                      color: '#e2e8f0', // Light text
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              },
              // Other component customizations for user bubbles
              a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="font-medium underline text-white" {...props} />,
              // Maintain other component styles matching the AI bubble style
            }}
          >
            {formattedText}
          </ReactMarkdown>
          {isStreaming && !isProcessing && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded"></span>
          )}
        </div>
      );
    }
    
    // Otherwise, render as plain text
    return (
      <div className={cn(
        "prose prose-sm max-w-none",
        isUser && "text-white [&_*]:text-white"
      )}>
        {message.text}
        {isStreaming && !isProcessing && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded"></span>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn(
      "group flex gap-3 relative transition-all duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
        isUser ? "bg-blue-500" : "bg-gradient-to-br from-purple-600 to-indigo-600"
      )}>
        {isUser ? <Send className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
          {isUser ? userName : assistantName}
          {isStreaming && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              {isProcessing ? "Thinking" : "Generating"}
            </span>
          )}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none",
          isStreaming && "border border-indigo-200",
          !isUser && message.text && containsMarkdown(message.text) && "px-5 py-3" // More padding for formatted content
        )}>
          {/* Render media items if present */}
          {message.media && renderMedia(message.media)}
          
          {/* Show processing animations for AI responses */}
          {!isUser && isProcessing && renderProcessingAnimations()}
          
          {/* Render message content */}
          {renderMessageContent()}
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Local storage keys - these will be updated to use sessionIdentifier inside the component

// Main component
const GoogleAIChatApp = ({ 
  firebaseApp = getApp(),
  instructions = "You are a helpful AI assistant that provides clear, accurate information.",
  firstMessage = "Hello! I'm your AI assistant. I can help you with a variety of tasks. Would you like to: hear a joke, learn about a topic, or get help with a question? Just let me know how I can assist you today!",
  showYouTube = true,
  showUpload = true,
  YouTubeURL = null,
  YouTubeDisplayName = null, // Display name for the YouTube video
  predefinedFiles = [],
  predefinedFilesDisplayNames = {}, // Map of file URLs to display names
  allowContentRemoval = true,
  showResourcesAtTop = true, // Whether to show predefined resources at the top
  context = null, // Context object for Genkit API
  sessionIdentifier = 'default', // Unique identifier for this chat session
  aiChatContext = null // Additional context for AI chat
}) => {
  // Generate session-specific localStorage keys
  const STORAGE_KEY_SESSION_ID = `google_ai_chat_session_id_${sessionIdentifier}`;
  const STORAGE_KEY_MESSAGES = `google_ai_chat_messages_${sessionIdentifier}`;
  
  // Load saved session ID from localStorage if available
  const getSavedSessionId = () => {
    try {
      return localStorage.getItem(STORAGE_KEY_SESSION_ID);
    } catch (e) {
      console.warn("Could not access localStorage:", e);
      return null;
    }
  };
  
  // Load saved messages from localStorage if available
  const getSavedMessages = () => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) {
      console.warn("Could not load saved messages:", e);
      return [];
    }
  };

  // Combine instructions and firstMessage into a single system message
  const getSystemMessage = useCallback(() => {
    return `${instructions} Your first message to the user was: "${firstMessage}" Continue the conversation based on the user's responses, remembering that you've already greeted them with this message.`;
  }, [instructions, firstMessage]);

  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    // Initialize with saved messages or create initial message
    const savedMessages = getSavedMessages();
    
    // If there are no saved messages, create an initial AI greeting message
    if (savedMessages.length === 0) {
      return [{
        id: Date.now(),
        sender: 'ai',
        text: firstMessage,
        timestamp: Date.now(),
      }];
    }
    
    return savedMessages;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMedia, setProcessingMedia] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [addingYouTube, setAddingYouTube] = useState(false);
  const [youtubeURLs, setYoutubeURLs] = useState([]);
  const [sessionId, setSessionId] = useState(getSavedSessionId); // Load saved session ID
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize Firebase Functions
  const functions = getFunctions(firebaseApp, 'us-central1');
  const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
  
  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save messages to localStorage:", e);
    }
  }, [messages]);
  
  // Save session ID to localStorage
  useEffect(() => {
    if (sessionId) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);
        console.log(`Session ID saved to localStorage: ${sessionId}`);
      } catch (e) {
        console.warn("Could not save session ID to localStorage:", e);
      }
    }
  }, [sessionId]);

  // Set initial YouTube URL if provided
  const loadedYouTubeRef = useRef(false);
  
  useEffect(() => {
    // Only load YouTube URL once to prevent duplicates
    if (YouTubeURL && !loadedYouTubeRef.current) {
      loadedYouTubeRef.current = true;
      
      const videoId = extractYouTubeVideoId(YouTubeURL);
      if (videoId) {
        setYoutubeURLs([{
          url: YouTubeURL,
          type: 'youtube',
          displayName: YouTubeDisplayName, // Use the custom display name if provided
          isPredefined: true // Mark as predefined so we know not to allow removal
        }]);
      }
    }
    
    // Reset flag when component unmounts
    return () => {
      loadedYouTubeRef.current = false;
    };
  }, []); // Empty dependency array to run only once on mount


  // Reset chat
  const handleReset = useCallback(() => {
    // Create a new AI greeting message instead of clearing all messages
    const initialAiMessage = {
      id: Date.now(),
      sender: 'ai',
      text: firstMessage,
      timestamp: Date.now(),
    };
    
    setMessages([initialAiMessage]);
    setError(null);
    setUploadedFiles([]);
    setYoutubeURLs([]);
    setYoutubeURL('');
    setAddingYouTube(false);
    setIsProcessing(false);
    setProcessingMedia(null);
    setSessionId(null); // Clear the session ID to start a fresh conversation
    
    // Also clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION_ID);
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([initialAiMessage]));
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
  }, [firstMessage]);
  
  // Get file type based on mime type or extension
  const getFileType = (file) => {
    if (!file) return 'file';
    
    const mimeType = file.type || '';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    // Document types
    if (mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('document') ||
        mimeType.includes('spreadsheet') || 
        mimeType.includes('excel') || 
        mimeType.includes('csv') ||
        mimeType.includes('presentation') || 
        mimeType.includes('powerpoint')) {
      return 'document';
    }
    
    // Check by extension as fallback
    const extension = file.name?.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ods', 'ppt', 'pptx', 'odp'].includes(extension)) {
      return 'document';
    }
    
    return 'file';
  };
  
  // Helper function to convert a Firebase Storage URL (gs://) to an HTTPS URL
  const convertGsUrlToHttps = async (gsUrl) => {
    if (typeof gsUrl !== 'string' || !gsUrl.startsWith('gs://')) {
      return gsUrl; // Not a valid gs:// URL, return as is
    }
    
    try {
      // In a production environment, you would use Firebase Storage getDownloadURL here
      // For this example, we'll use a placeholder implementation
      // This would be replaced with actual Firebase Storage code
      
      // Import these at the top of your file:
      // import { getStorage, ref, getDownloadURL, getMetadata } from "firebase/storage";
      // const storage = getStorage(firebaseApp);
      
      // Example of how this would be implemented with Firebase:
      // const fileRef = ref(storage, gsUrl);
      // const httpUrl = await getDownloadURL(fileRef);
      // const metadata = await getMetadata(fileRef);
      // return { url: httpUrl, metadata };
      
      // For now, we'll simulate this by returning a placeholder URL
      console.log(`Converting ${gsUrl} to HTTPS URL`);
      
      // This simulates the URL pattern that would be returned by getDownloadURL
      // Format: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/FILE_PATH?alt=media&token=TOKEN
      const withoutPrefix = gsUrl.replace('gs://', '');
      const [bucket, ...pathParts] = withoutPrefix.split('/');
      const filePath = pathParts.join('/');
      const encodedPath = encodeURIComponent(filePath);
      
      // Just a mock URL for demonstration - in production this would come from Firebase
      return {
        url: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`,
        contentType: getContentTypeFromFileName(filePath)
      };
    } catch (error) {
      console.error(`Error converting gs:// URL to HTTPS: ${error}`);
      return gsUrl; // Return original URL on error
    }
  };
  
  // Helper to guess content type from filename
  const getContentTypeFromFileName = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Map common extensions to MIME types
    const mimeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'csv': 'text/csv'
    };
    
    return mimeMap[extension] || 'application/octet-stream';
  };

  // Load predefined files from Firebase Storage URLs if provided
  // Using a ref to track if files were already loaded to prevent duplicates
  const loadedFilesRef = useRef(false);
  
  useEffect(() => {
    // Only load files if we have predefined files and they haven't been loaded yet
    if (predefinedFiles && predefinedFiles.length > 0 && !loadedFilesRef.current) {
      const loadPredefinedFiles = async () => {
        // Set flag to true to prevent reloading
        loadedFilesRef.current = true;
        console.log('Loading predefined files, count:', predefinedFiles.length);
        
        // Process each predefined file URL
        const filePromises = predefinedFiles.map(async (fileUrl) => {
          try {
            // Convert gs:// URL to HTTPS and get metadata
            const { url, contentType } = await convertGsUrlToHttps(fileUrl);
            
            // Extract file name from URL or use custom display name if provided
            const fileName = fileUrl.split('/').pop() || 'Predefined document';
            // Get custom display name if it exists
            const displayName = predefinedFilesDisplayNames[fileUrl] || fileName;
            
            // Create a Genkit-compatible document object
            return {
              url,
              type: 'document',
              name: fileName,
              displayName: displayName, // Custom display name
              mimeType: contentType,
              contentType: contentType, // For Genkit API compatibility
              isPredefined: true, // Mark as predefined so it can't be removed
              // For Genkit API format:
              mediaObject: {
                url,
                contentType
              }
            };
          } catch (error) {
            console.error(`Error processing predefined file ${fileUrl}:`, error);
            return null;
          }
        });
        
        // Wait for all conversions to complete and filter out any nulls
        const processedFiles = (await Promise.all(filePromises)).filter(Boolean);
        
        // Add the processed files to uploadedFiles state
        if (processedFiles.length > 0) {
          setUploadedFiles(prev => {
            // Filter out any duplicate files based on URL
            const newFiles = processedFiles.filter(
              newFile => !prev.some(existingFile => existingFile.url === newFile.url)
            );
            
            console.log('Adding predefined files:', newFiles.length);
            if (newFiles.length === 0) return prev; // No new files to add
            return [...prev, ...newFiles];
          });
        }
      };
      
      loadPredefinedFiles();
    }
    
    // Reset the loaded flag when component is unmounted
    return () => {
      loadedFilesRef.current = false;
    };
  }, []); // Empty dependency array so it only runs once on mount

  // Handle file selection for uploads
  const handleFileSelect = (e) => {
    if (!showUpload) return;
    
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Process each file - convert to data URL if it's an image, handle differently for documents
    files.forEach(file => {
      // Size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File '${file.name}' exceeds 10MB size limit.`);
        return;
      }
      
      const fileType = getFileType(file);
      
      // Use FileReader for images and small text files
      if (fileType === 'image' || (fileType === 'document' && file.size < 1 * 1024 * 1024 && file.type.includes('text'))) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          setUploadedFiles(prev => [...prev, {
            file,
            url: dataUrl,
            type: fileType,
            name: file.name,
            size: file.size,
            mimeType: file.type
          }]);
        };
        
        reader.onerror = () => {
          setError(`Failed to read file '${file.name}'.`);
        };
        
        reader.readAsDataURL(file);
      } else {
        // For other document types, we'll just keep track of metadata and send the file directly
        setUploadedFiles(prev => [...prev, {
          file,
          // For documents, we'll create a data URL when sending to the backend
          url: null,  
          type: fileType,
          name: file.name,
          size: file.size,
          mimeType: file.type
        }]);
      }
    });
    
    // Clear the file input
    e.target.value = '';
  };
  
  // Handle adding YouTube URL
  const handleAddYouTubeURL = () => {
    if (!youtubeURL.trim()) return;
    
    // Validate URL is a YouTube URL
    const videoId = extractYouTubeVideoId(youtubeURL);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }
    
    // Add the YouTube URL to the list
    setYoutubeURLs(prev => [...prev, {
      url: youtubeURL,
      type: 'youtube'
    }]);
    
    // Clear the input
    setYoutubeURL('');
    setAddingYouTube(false);
  };
  
  // Prepare files for sending to the backend
  const prepareFilesForSending = async () => {
    const preparedFiles = await Promise.all(
      uploadedFiles.map(async fileItem => {
        // If URL is already set (like for images or predefined files), adjust format for Genkit if needed
        if (fileItem.url) {
          // If this is a predefined file with a mediaObject property, format it for Genkit
          if (fileItem.isPredefined && fileItem.mediaObject) {
            return {
              ...fileItem,
              // Ensure the right format for Genkit Document API
              media: {
                url: fileItem.url,
                contentType: fileItem.contentType || fileItem.mimeType
              }
            };
          }
          return fileItem;
        }
        
        // For documents without URLs, create a data URL
        try {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                ...fileItem,
                url: reader.result,
                // Include media property for Genkit Document API compatibility
                media: {
                  url: reader.result,
                  contentType: fileItem.mimeType
                }
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(fileItem.file);
          });
        } catch (err) {
          console.error(`Error converting file ${fileItem.name} to data URL:`, err);
          return fileItem; // Return original if conversion fails
        }
      })
    );
    
    return preparedFiles;
  };
  
  // Remove a file
  const removeFile = (index) => {
    // If content removal is not allowed, don't allow removing any files
    if (!allowContentRemoval) return;
    
    setUploadedFiles(prev => {
      // Don't remove if it's a predefined file
      if (prev[index]?.isPredefined) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };
  
  // Remove a YouTube URL
  const removeYouTubeURL = (index) => {
    // If content removal is not allowed, don't allow removing any YouTube URLs
    if (!allowContentRemoval) return;
    
    setYoutubeURLs(prev => {
      // Don't remove if it's a predefined URL
      if (prev[index]?.isPredefined) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };
  
  // Trigger file input click
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  // Toggle YouTube URL input
  const toggleYouTubeInput = () => {
    if (!showYouTube) return;
    setAddingYouTube(prev => !prev);
  };
  
  // Simulate the AI's analysis of media with realistic timing
  const simulateMediaAnalysis = async (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      return;
    }
    
    // Set processing state and keep track of which media is being processed
    setIsProcessing(true);
    setProcessingMedia(mediaItems);
    
    // Calculate a realistic wait time based on file types and sizes
    let maxWaitTime = 0;
    
    mediaItems.forEach(item => {
      let waitTime = 0;
      
      if (item.type === 'youtube') {
        // Videos take longer to process
        waitTime = 3000 + (Math.random() * 2000);
      } else if (item.type === 'image') {
        // Images are usually faster
        waitTime = 2000 + (Math.random() * 1000);
      } else if (item.type === 'document') {
        // Documents take time based on size
        const sizeInMB = (item.size || 0) / (1024 * 1024);
        waitTime = 2000 + (sizeInMB * 500) + (Math.random() * 1500);
      }
      
      maxWaitTime = Math.max(maxWaitTime, waitTime);
    });
    
    // Ensure a minimum wait time for the animation to be visible
    maxWaitTime = Math.max(maxWaitTime, 2000);
    
    // Wait for the calculated time - we don't need to actually wait here anymore
    // as we'll keep the animations going until we get a response from the server
    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for visual effect
    
    // We're not going to disable the processing state here anymore
    // Instead we'll keep showing the animations and maintain the processing state
    // setIsProcessing(false);
    // setProcessingMedia(null);
  };
  
 // Send message to Google AI
const handleSendMessage = async () => {
  if (!inputMessage.trim() && uploadedFiles.length === 0 && youtubeURLs.length === 0) return;
  setError(null);
  
  // Prepare all files (convert to data URLs if needed)
  const preparedFiles = await prepareFilesForSending();
  
  // Combine prepared files and YouTube URLs
  const allMedia = [...preparedFiles, ...youtubeURLs];
  
  const userMessage = {
    id: Date.now(),
    sender: 'user',
    text: inputMessage,
    timestamp: Date.now(),
    media: allMedia.length > 0 ? allMedia : undefined
  };
  
  // Create a copy of the input message before clearing it
  const messageToSend = inputMessage;
  const mediaItemsToSend = [...allMedia];
  
  // Update UI immediately
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setUploadedFiles([]);
  setYoutubeURLs([]);
  setYoutubeURL('');
  setAddingYouTube(false);
  setIsLoading(true);
  
  // Create empty AI message placeholder for streaming
  const aiMessageId = Date.now() + 1;
  setMessages(prev => [...prev, {
    id: aiMessageId,
    sender: 'ai',
    text: '',
    timestamp: Date.now() + 1,
  }]);

  // Set streaming state
  setIsStreaming(true);
  
  try {
    // Start showing media analysis animations if there are media items
    if (mediaItemsToSend.length > 0) {
      // Show media processing animations and keep them showing
      await simulateMediaAnalysis(mediaItemsToSend);
    } else {
      // If there's no media, just proceed without showing animations
      setIsProcessing(false);
      setProcessingMedia(null);
    }
    
    // Get the combined system message
    const systemMessage = getSystemMessage();
    
    // Log what we're sending to help debug
    console.log("Sending to AI:", {
      message: messageToSend,
      model: AI_MODEL_MAPPING.livechat.name,
      systemInstruction: systemMessage,
      streaming: true, // Enable streaming mode
      mediaItems: mediaItemsToSend.map(item => ({
        url: item.url,
        type: item.type,
        name: item.name,
        mimeType: item.mimeType
      })),
      hasContext: context !== null // Log if context is being provided
    });
    
    // If context exists, log it
    if (context) {
      console.log("Passing context to AI via Genkit context object:", context);
      console.log("Note: This uses the Genkit context mechanism, not system message embedding");
    }
    
    const result = await sendChatMessage({
      message: messageToSend, // The actual text message to send
      model: AI_MODEL_MAPPING.livechat.name, // Using the live chat model from settings
      systemInstruction: systemMessage, // Using our combined system message
      streaming: true, // Enable streaming mode
      mediaItems: mediaItemsToSend.map(item => {
        // Format specifically for Genkit Document API
        if (item.media) {
          return {
            url: item.url,
            type: item.type,
            name: item.name,
            mimeType: item.mimeType || item.contentType,
            media: item.media // Include properly formatted media object for Genkit
          };
        }
        
        return {
          url: item.url,
          type: item.type,
          name: item.name,
          mimeType: item.mimeType
        };
      }),
      sessionId: sessionId, // Pass the session ID if we have one
      context: {
        ...context, // Spread existing context if it exists
        ...(aiChatContext && { aiChatContext }) // Include aiChatContext if provided
      }
    });
    
    // Now that we have a response, stop the processing animations
    setIsProcessing(false);
    setProcessingMedia(null);
    
    // Update the AI message with the response
    const aiResponse = result.data.text;
    
    // Save the session ID if provided by the server
    if (result.data.sessionId) {
      setSessionId(result.data.sessionId);
      console.log(`Chat session established with ID: ${result.data.sessionId}`);
    }
    
    // Simulate progressive typing effect
    if (result.data.streaming) {
      let displayedText = '';
      const fullText = aiResponse;
      const words = fullText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        displayedText += words[i] + ' ';
        
        // Update message with current text
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: displayedText } : msg
          )
        );
        
        // Small delay to simulate typing
        // This creates a visual effect of streaming
        if (i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } else {
      // Debug table formatting
      if (aiResponse.includes('|')) {
        console.log('=== TABLE DEBUGGING INFO ===');
        console.log('Raw table content:');
        const tableLines = aiResponse.split('\n').filter(line => line.includes('|'));
        console.log(tableLines.join('\n'));
        
        console.log('\nFormatted table content:');
        const formattedText = formatMarkdownTables(aiResponse);
        const formattedTableLines = formattedText.split('\n').filter(line => line.includes('|'));
        console.log(formattedTableLines.join('\n'));
      }
      
      // Regular non-streaming update
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
        )
      );
    }
    
  } catch (err) {
    console.error('Error sending message:', err);
    const errorDetails = err.message || 'Failed to send message. Please try again.';
    setError(errorDetails);
    
    // Show detailed error information in the UI for debugging
    const errorMessage = err.code === 'functions/invalid-argument' 
      ? `API Error: ${errorDetails}` 
      : `I'm sorry, I encountered an error: ${errorDetails}`;
      
    // Update the AI message with the error
    setMessages(prev =>
      prev.map(msg =>
        msg.id === aiMessageId ? { 
          ...msg, 
          text: errorMessage
        } : msg
      )
    );
    
    // Always ensure processing animations are stopped when there's an error
    setIsProcessing(false);
    setProcessingMedia(null);
  } finally {
    setIsLoading(false);
    setIsStreaming(false);
    scrollToBottom();
    
    // Focus the input textarea after sending a message
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }
};
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !addingYouTube) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Component to display uploaded files (excluding predefined files if they're shown at the top)
  const FilePreview = () => {
    // Filter out predefined files if they're shown at the top
    const filesToShow = showResourcesAtTop 
      ? uploadedFiles.filter(file => !file.isPredefined) 
      : uploadedFiles;
    
    if (filesToShow.length === 0) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">Uploaded Files</div>
        <div className="flex flex-wrap gap-2">
          {filesToShow.map((fileItem, index) => {
            // Get the actual index in the full uploadedFiles array for removal
            const actualIndex = uploadedFiles.findIndex(file => file === fileItem);
            
            // Different preview based on file type
            if (fileItem.type === 'image') {
              return (
                <div key={actualIndex} className="relative group">
                  <img 
                    src={fileItem.url} 
                    alt={`Uploaded ${fileItem.name || actualIndex}`} 
                    className="h-20 w-auto rounded-md border border-gray-200 object-cover"
                  />
                  {(allowContentRemoval && !fileItem.isPredefined) && (
                    <button
                      onClick={() => removeFile(actualIndex)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            } else {
              // Document or other file type
              return (
                <div key={actualIndex} className="relative flex items-center gap-2 pl-2 pr-7 py-2 bg-gray-50 rounded-md border border-gray-200">
                  {getFileIcon(fileItem)}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[150px]">{fileItem.name}</span>
                    <span className="text-xs text-gray-500">{getFormattedSize(fileItem.size)}</span>
                  </div>
                  {(allowContentRemoval && !fileItem.isPredefined) && (
                    <button
                      onClick={() => removeFile(actualIndex)}
                      className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };
  
  // Component to display YouTube URLs (excluding predefined ones if shown at the top)
  const YouTubePreview = () => {
    // Filter out predefined YouTube URLs if they're shown at the top
    const videosToShow = showResourcesAtTop 
      ? youtubeURLs.filter(item => !item.isPredefined) 
      : youtubeURLs;
    
    if (videosToShow.length === 0) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">YouTube Videos</div>
        <div className="flex flex-col gap-2">
          {videosToShow.map((item, index) => {
            // Get the actual index in the full youtubeURLs array for removal
            const actualIndex = youtubeURLs.findIndex(video => video === item);
            const videoId = extractYouTubeVideoId(item.url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
            
            return (
              <div key={actualIndex} className="relative flex items-center gap-2 bg-gray-50 rounded-md p-2 border border-gray-200">
                {thumbnailUrl && (
                  <img 
                    src={thumbnailUrl} 
                    alt="YouTube thumbnail" 
                    className="h-12 w-auto rounded-md object-cover"
                  />
                )}
                <div className="flex-1 truncate text-sm text-gray-700">
                  {item.displayName || item.url}
                </div>
                {(allowContentRemoval && !item.isPredefined) && (
                  <button
                    onClick={() => removeYouTubeURL(actualIndex)}
                    className="shrink-0 text-red-500 hover:text-red-700"
                    title="Remove YouTube URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // YouTube URL input
  const YouTubeURLInput = () => {
    if (!addingYouTube) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">Add YouTube Video</div>
        <div className="flex gap-2">
          <Input
            value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)}
            placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddYouTubeURL();
              }
            }}
          />
          <Button 
            onClick={handleAddYouTubeURL}
            disabled={!youtubeURL.trim()}
            className="shrink-0 bg-red-600 hover:bg-red-700"
          >
            Add
          </Button>
          <Button 
            onClick={() => setAddingYouTube(false)}
            variant="outline"
            className="shrink-0"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };
  
  // Component to display predefined resources at the top
  const PredefinedResourcesPanel = () => {
    // Only show if we have predefined files or YouTube URLs and showResourcesAtTop is true
    const hasPredefinedFiles = uploadedFiles.some(file => file.isPredefined);
    const hasPredefinedYouTube = youtubeURLs.some(item => item.isPredefined);
    
    if (!showResourcesAtTop || (!hasPredefinedFiles && !hasPredefinedYouTube)) {
      return null;
    }
    
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 border-b">
        <div className="text-sm font-medium text-purple-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Resources
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Display predefined YouTube videos */}
          {youtubeURLs.filter(item => item.isPredefined).map((item, index) => {
            const videoId = extractYouTubeVideoId(item.url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
            
            return (
              <div key={`yt-${index}`} 
                   className="relative bg-white rounded-md shadow-sm overflow-hidden flex flex-col w-56 border border-gray-200 hover:border-purple-300 transition-colors">
                {thumbnailUrl && (
                  <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}>
                    <img 
                      src={thumbnailUrl} 
                      alt="YouTube thumbnail" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white p-2 rounded-full"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                )}
                <div className="p-2">
                  <div className="text-sm font-medium line-clamp-1 text-gray-900">
                    {item.displayName || 'YouTube Video'}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Display predefined document files */}
          {uploadedFiles.filter(file => file.isPredefined).map((file, index) => (
            <div key={`file-${index}`} 
                 className="relative bg-white rounded-md shadow-sm overflow-hidden flex items-center p-2 border border-gray-200 hover:border-purple-300 transition-colors">
              {getFileIcon(file)}
              <div className="ml-2 flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-gray-900 max-w-[200px]">
                  {file.displayName || file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {getFormattedSize(file.size)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      <Card className="flex flex-col h-full border-0 rounded-none bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-br from-purple-50 to-indigo-50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-900">
                Edbotz AI Chat
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isLoading || messages.length === 0}
                className="hover:bg-purple-100 text-purple-600"
                title="Reset Chat"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Display predefined resources at the top */}
        <PredefinedResourcesPanel />
        
        <div className="flex-1 min-h-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full"
          >
            <div className="p-4 space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && message === messages[messages.length - 1] && message.sender === 'ai'}
                  isProcessing={isProcessing && message === messages[messages.length - 1] && message.sender === 'ai'}
                  processingMedia={processingMedia}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <CardFooter className="flex-shrink-0 border-t bg-white p-4 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          
          {/* File and image preview area */}
          <FilePreview />
          
          {/* YouTube URL preview */}
          <YouTubePreview />
          
          {/* YouTube URL input */}
          <YouTubeURLInput />
          
          <div className="flex gap-2 w-full">
            {showUpload && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={openFileDialog}
                disabled={isLoading || isInitializing}
                className="shrink-0 self-end border-gray-300"
                title="Upload File or Image"
              >
                <Upload className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            
            {showYouTube && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={toggleYouTubeInput}
                disabled={isLoading || isInitializing || addingYouTube}
                className="shrink-0 self-end border-gray-300"
                title="Add YouTube Video"
              >
                <Youtube className="w-5 h-5 text-red-600" />
              </Button>
            )}
            
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "Initializing..." : "Type your message... (Press Enter to send)"}
              className="resize-none min-h-[80px]"
              disabled={isLoading || isInitializing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(uploadedFiles.length === 0 && youtubeURLs.length === 0 && !inputMessage.trim()) || isLoading || isInitializing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0 self-end"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isProcessing ? 'Processing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GoogleAIChatApp;