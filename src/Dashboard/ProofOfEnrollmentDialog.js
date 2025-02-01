import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { format } from 'date-fns';

const RTDLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 75 75" 
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
);

const formatDateSafely = (dateString) => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const ProofOfEnrollmentSheet = ({ 
  isOpen, 
  onOpenChange, 
  course, 
  studentProfile,
  onPrint 
}) => {
  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const currentDate = new Date();
  const formattedCurrentDate = format(currentDate, 'MMMM d, yyyy');
  const formattedCurrentTime = format(currentDate, 'h:mm a');

  const getStatus = () => {
    const currentStatus = course.ActiveFutureArchived?.Value;
    if (currentStatus !== 'Active') {
      return course.Status?.Value || 'Not available';
    }
    return currentStatus || 'Not available';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} side="right">
      <SheetContent className="w-full sm:max-w-3xl overflow-hidden flex flex-col h-full">
        <ScrollArea className="flex-grow my-6 pr-4">
          <div className="print-content">
            {/* Certificate Content */}
            <div className="p-6 print:p-0">
              {/* Letterhead */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 print:w-20 print:h-20">
                    <RTDLogo />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#008B8B]">RTD Academy</h1>
                    <p className="text-sm text-gray-600">Alberta School Code: 2444</p>
                    <p className="text-sm text-gray-600">Authority Code: 0402</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mt-2">Date Issued:</p>
                  <p className="font-medium">{formattedCurrentDate}</p>
                </div>
              </div>

              {/* Decorative Line */}
              <div className="h-1 w-full bg-gradient-to-r from-[#008B8B] via-[#20B2AA] to-[#E0FFFF] mb-8"></div>

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold uppercase text-[#008B8B]">
                  Official Certificate of Enrollment
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="text-base leading-relaxed">
                  This is to certify that{' '}
                  <span className="font-semibold">
                    {studentProfile?.preferredFirstName || studentProfile?.firstName}{' '}
                    {studentProfile?.lastName}
                  </span>{' '}
                  with Alberta Student Number (ASN): {studentProfile?.asn || 'Not Available'} is currently 
                  enrolled as a student at RTD Academy (Alberta School Code: 2444).
                </p>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#008B8B]">Official Enrollment Details:</h3>
                  <div className="pl-4 space-y-2">
                    <p><span className="font-medium">Course Name:</span> {course.Course?.Value || 'Not available'}</p>
                    <p><span className="font-medium">Start Date:</span> {formatDateSafely(course.ScheduleStartDate)}</p>
                    
                    <p><span className="font-medium">Current Status:</span> {getStatus()}</p>
                  </div>
                </div>

                <div className="mt-12">
                  <p className="mb-4">This enrollment can be verified through:</p>
                  <div className="space-y-1 text-sm">
                    <p>1. Alberta Education PASI/MyPass System</p>
                    <p>2. Contacting RTD Academy Registrar Office:</p>
                    <p className="pl-4">Email: info@rtdacademy.com</p>
                    <p className="pl-4">Website: www.rtdacademy.com</p>
                  </div>
                </div>

                {/* Official Signatures Section */}
                <div className="mt-16 grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-t-2 border-[#008B8B] w-48 mb-2"></div>
                    <p className="font-medium">Kyle Brown</p>
                    <p className="text-sm text-gray-600">Principal</p>
                    <p className="text-sm text-gray-600">RTD Academy</p>
                  </div>
                </div>

                {/* Official Validation */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    This document is valid for 30 days from the date of issue. The authenticity of this document 
                  </p>
                </div>

                {/* Decorative Footer */}
                <div className="mt-12 relative">
                  <div className="h-1 w-full bg-gradient-to-r from-[#E0FFFF] via-[#20B2AA] to-[#008B8B]"></div>
                  <div className="absolute -top-6 right-0 w-12 h-12 opacity-20">
                    <RTDLogo />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>This is an official document generated by RTD Academy's Student Information System.</p>
                  <p>Generated on {formattedCurrentDate} at {formattedCurrentTime}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 border-t pt-4 print:hidden">
          <Button onClick={handlePrint} className="w-full bg-[#008B8B] hover:bg-[#20B2AA]">
            Print Document
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProofOfEnrollmentSheet;