// src/components/PasiActionButtons.js
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { ExternalLink, Edit, ChevronDown, Database, X, Layers, BookOpen, ArrowRightCircle } from 'lucide-react';
import { openManagedWindow } from '../utils/windowUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

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

// Multiple PASI Records component for displaying records with multiple entries
export const MultipleRecordsDisplay = ({ records, asn, onSelect, selectedRecord }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sort records by exitDate (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    if (!a.exitDate) return 1;
    if (!b.exitDate) return -1;
    return new Date(b.exitDate) - new Date(a.exitDate);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className="h-7 px-2 flex items-center gap-1 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 border-indigo-200"
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{records.length}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-500" />
            Multiple PASI Records ({records.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {sortedRecords.map((record) => (
              <div 
                key={record.referenceNumber} 
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedRecord && selectedRecord.referenceNumber === record.referenceNumber 
                    ? "bg-blue-50 border-blue-300" 
                    : "hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => {
                  onSelect(record);
                  setIsOpen(false); // Close dialog after selection
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {record.term || "No Term"}
                    </Badge>
                    {record.value && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {record.value}%
                      </Badge>
                    )}
                  </div>
                  
                  <PasiActionButtons 
                    asn={asn} 
                    referenceNumber={record.referenceNumber} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className="font-medium">{record.status || "N/A"}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Exit Date:</span>{" "}
                    <span className="font-medium">{record.exitDate || "N/A"}</span>
                  </div>
                  
                  {record.approved && (
                    <div>
                      <span className="text-gray-500">Approved:</span>{" "}
                      <span className="font-medium">{record.approved}</span>
                    </div>
                  )}
                  
                  {record.deleted && (
                    <div>
                      <span className="text-gray-500">Deleted:</span>{" "}
                      <span className="font-medium">{record.deleted}</span>
                    </div>
                  )}
                </div>
                
                {/* Ref number at bottom for reference */}
                <div className="mt-2 text-xs text-gray-500 truncate">
                  Ref: {record.referenceNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
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

  const handleViewAllCourses = () => {
    if (!validAsn) return;
    
    const asnWithoutDashes = formatAsnForUrl(asn);
    const url = `https://extranet.education.alberta.ca/PASI/PASIprep/view-student/${asnWithoutDashes}?useDefault=true&left=Courses%20%26%20Marks&view-44c81633-77e8-4ac8-aafe-6c1302479f6c=All%20Marks`;
    openManagedWindow(url, 'pasiWindow');
  };

  const handleOpenYourWay = () => {
    if (!validAsn) return;
    // Changed from window.location.href to openManagedWindow with unique window name
    const url = `/teacher-dashboard?asn=${asn}`;
    openManagedWindow(url, 'yourWayWindow');
  };

  return (
    <TooltipProvider>
      <div className="flex h-7 gap-1">
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
              <p>{validReferenceNumber 
                ? "Open PASI Enrollment - View, edit, delete, approve or clone this record" 
                : "Open Student in PASI"}</p>
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
                  className="h-full w-8 p-0 flex items-center justify-center rounded-l-none rounded-r-none bg-emerald-50/80 hover:bg-emerald-100/90"
                  disabled={!validAsn}
                >
                  <Edit className="h-4 w-4 text-emerald-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit PASI Enrollment - Go directly to edit screen for this record</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Divider line between buttons */}
          {validAsn && (
            <div className="w-px h-full bg-emerald-200"></div>
          )}

          {/* View All Courses Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleViewAllCourses}
                className="h-full w-8 p-0 flex items-center justify-center rounded-l-none bg-emerald-50/80 hover:bg-emerald-100/90"
                disabled={!validAsn}
              >
                <BookOpen className="h-4 w-4 text-emerald-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View All Courses - See all course registrations for this student</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* YourWay Button - Separate with different color */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleOpenYourWay}
              className="h-full w-8 p-0 flex items-center justify-center border border-gray-200 rounded-md bg-blue-50/80 hover:bg-blue-100/90"
              disabled={!validAsn}
            >
              <ArrowRightCircle className="h-4 w-4 text-blue-700" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open in YourWay</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default PasiActionButtons;