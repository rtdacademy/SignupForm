// src/components/PasiActionButtons.js
import React from 'react';
import { Button } from "./ui/button";
import { ExternalLink, Edit } from 'lucide-react';
import { openManagedWindow } from '../utils/windowUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Helper to remove dashes from ASN and ensure it's a string
const formatAsnForUrl = (asn) => {
  if (asn === null || asn === undefined) return '';
  return String(asn).replace(/-/g, '');
};

// Helper to check if a value is present and not a placeholder
const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  const stringValue = String(value).trim();
  return stringValue !== '' && stringValue !== 'N/A' && stringValue !== '-';
};

const PasiActionButtons = ({ asn, referenceNumber }) => {
  const validAsn = isValidValue(asn);
  const validReferenceNumber = isValidValue(referenceNumber);

  const handleOpenPasi = () => {
    if (!validAsn) return;

    let url;
    if (validReferenceNumber) {
      // Link to the specific course enrollment
      url = `https://extranet.education.alberta.ca/PASI/PASIprep/course-enrolment/${referenceNumber}`;
    } else {
      // Fallback to the student view
      const asnWithoutDashes = formatAsnForUrl(asn);
      url = `https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${asnWithoutDashes}`;
    }
    openManagedWindow(url, 'pasiWindow');
  };

  const handleEditPasi = () => {
    // This button is only rendered if validReferenceNumber is true,
    // but we double-check here for safety.
    if (!validReferenceNumber) return;

    const url = `https://extranet.education.alberta.ca/PASI/PASIprep/course-enrolment/${referenceNumber}/edit`;
    openManagedWindow(url, 'pasiWindow'); // Reuse the same named window
  };

  return (
    <TooltipProvider>
      <div className="flex h-7">
        {/* Container for connected buttons with light green background */}
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          {/* Main PASI Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleOpenPasi}
                className="h-full flex-1 p-0 px-2 flex items-center justify-center rounded-r-none bg-emerald-50/80 hover:bg-emerald-100/90"
                disabled={!validAsn}
              >
                <ExternalLink className="h-4 w-4 text-emerald-700" />
                
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{validReferenceNumber ? "Open PASI Enrollment" : "Open Student in PASI"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Divider line between buttons */}
          {validReferenceNumber && (
            <div className="w-px h-full bg-emerald-200"></div>
          )}

          {/* Edit PASI Enrollment Button - Conditionally Rendered */}
          {validReferenceNumber && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleEditPasi}
                  className="h-full w-8 p-0 flex items-center justify-center rounded-l-none bg-emerald-50/80 hover:bg-emerald-100/90"
                  disabled={!validAsn}
                >
                  <Edit className="h-4 w-4 text-emerald-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit PASI Enrollment</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PasiActionButtons;