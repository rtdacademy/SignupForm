import React from 'react';

const PDFViewer = ({ 
  src, 
  title, 
  height = '600px',
  showDownload = true,
  className = '' 
}) => {
  if (!src) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
        No PDF source provided
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        {/* Header with title and download button */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-medium text-gray-800">
            {title || 'PDF Document'}
          </h4>
          {showDownload && (
            <a
              href={src}
              download={title || 'document.pdf'}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </a>
          )}
        </div>
        
        {/* PDF iframe */}
        <div className="bg-gray-100">
          <iframe
            src={src}
            title={title || 'PDF Viewer'}
            width="100%"
            height={height}
            className="border-0"
            style={{ minHeight: height }}
          >
            <p className="p-4 text-center text-gray-600">
              Your browser does not support viewing PDFs. 
              <a href={src} className="text-blue-600 hover:underline ml-1">
                Download the PDF
              </a> to view it.
            </p>
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;