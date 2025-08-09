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
import { Download } from 'lucide-react';
import { EXECUTIVE_DIRECTOR, SCHOOL_AUTHORITY_INFO } from '../config/signatures';
import jsPDF from 'jspdf';

// RTD Connect Logo component
const RTDConnectLogo = () => (
  <img 
    src="/connectImages/Connect.png" 
    alt="RTD Connect Logo"
    className="h-16 w-auto print:h-20"
  />
);

const formatDateSafely = (dateString) => {
  if (!dateString) return format(new Date(), 'M/d/yyyy');
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return format(new Date(), 'M/d/yyyy');
    }
    return format(date, 'M/d/yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return format(new Date(), 'M/d/yyyy');
  }
};

const AcceptanceLetterDialog = ({ 
  isOpen, 
  onOpenChange, 
  familyData,
  activeSchoolYear,
  parentName,
  onPrint 
}) => {
  const handlePrint = async () => {
    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Load images first
      const logoImg = await loadImage('/connectImages/Connect.png');
      const signatureImg = await loadImage('/Kyle/signature.png');

      // Header with logo
      pdf.addImage(logoImg, 'PNG', margin, yPos, 12, 12);
      
      // Company info next to logo
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RTD Connect', margin + 18, yPos + 5);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Home Education Portal', margin + 18, yPos + 10);
      pdf.text(`Part of ${SCHOOL_AUTHORITY_INFO.name}`, margin + 18, yPos + 14);

      // Date on right
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Date: ${formattedCurrentDate}`, pageWidth - margin - 40, yPos + 8, { align: 'right' });

      yPos += 25;

      // Horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Letter content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Dear ${primaryParentName},`, margin, yPos);
      yPos += 10;

      pdf.setFont('helvetica', 'normal');
      
      // Paragraph 1
      const para1 = `Thank you for your ${activeSchoolYear || '2024-25'} registration with RTD Connect Home Education. We are pleased to supervise ${hasMultipleStudents ? 'your students' : 'your student'} in ${hasMultipleStudents ? 'their chosen programs' : 'their chosen program'} for the coming school year.`;
      const para1Lines = pdf.splitTextToSize(para1, contentWidth);
      pdf.text(para1Lines, margin, yPos);
      yPos += (para1Lines.length * 5) + 5;

      // Student acceptance
      pdf.setFont('helvetica', 'bold');
      const acceptanceLine = `${studentNamesList} ${hasMultipleStudents ? 'have' : 'has'} been accepted to RTD Academy's RTD Connect Home Education program for the ${activeSchoolYear || '2024-25'} school year.`;
      const acceptanceLines = pdf.splitTextToSize(acceptanceLine, contentWidth);
      pdf.text(acceptanceLines, margin, yPos);
      yPos += (acceptanceLines.length * 5) + 8;

      pdf.setFont('helvetica', 'normal');
      
      // Documents paragraph
      const para3 = "In accordance with Alberta Education's Home Education requirements, we have received and approved all required documents for your registration:";
      const para3Lines = pdf.splitTextToSize(para3, contentWidth);
      pdf.text(para3Lines, margin, yPos);
      yPos += (para3Lines.length * 5) + 5;

      // Document checklist with proper bullets
      pdf.text('•', margin + 5, yPos);
      pdf.text('Notification Form', margin + 10, yPos);
      yPos += 5;
      pdf.text('•', margin + 5, yPos);
      pdf.text('Program Plan Document with digital signature', margin + 10, yPos);
      yPos += 5;
      pdf.text('•', margin + 5, yPos);
      pdf.text(`Copy of your ${hasMultipleStudents ? "children's Birth Certificates" : "child's Birth Certificate"}`, margin + 10, yPos);
      yPos += 10;

      // Support paragraph
      const para4 = `We look forward to a successful year with ${hasMultipleStudents ? 'your children' : 'your child'}, supporting their educational journey in the home and community. If you have any questions or need assistance with planning and resources, please don't hesitate to contact your assigned facilitator through the RTD Connect portal.`;
      const para4Lines = pdf.splitTextToSize(para4, contentWidth);
      pdf.text(para4Lines, margin, yPos);
      yPos += (para4Lines.length * 5) + 10;

      // Welcome box
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(147, 51, 234);
      pdf.rect(margin, yPos, contentWidth, 25, 'FD');
      pdf.setDrawColor(147, 51, 234);
      pdf.setLineWidth(2);
      pdf.line(margin, yPos, margin, yPos + 25);
      pdf.setLineWidth(0.2);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Welcome to the family!', pageWidth / 2, yPos + 8, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`This is confirmation of registration for the ${activeSchoolYear || '2024-25'} Home Education year`, pageWidth / 2, yPos + 15, { align: 'center' });
      pdf.text('(to be kept for your files)', pageWidth / 2, yPos + 20, { align: 'center' });
      yPos += 35;

      // Signature section
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Yours truly
      pdf.text('Yours truly,', margin, yPos);
      yPos += 8;

      // Signature image
      if (signatureImg) {
        pdf.addImage(signatureImg, 'PNG', margin, yPos, 30, 8);
      }
      yPos += 10;

      // Signature line
      pdf.setDrawColor(150, 150, 150);
      pdf.line(margin, yPos, margin + 30, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'bold');
      pdf.text(EXECUTIVE_DIRECTOR.name, margin, yPos);
      yPos += 5;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(EXECUTIVE_DIRECTOR.title, margin, yPos);
      yPos += 4;
      pdf.text(SCHOOL_AUTHORITY_INFO.name, margin, yPos);

      // Contact info on right side
      const contactX = pageWidth - margin - 60;
      const contactY = yPos - 20;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Contact Information:', contactX, contactY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('Email: info@rtdacademy.com', contactX, contactY + 5);
      pdf.text(`Alberta School Code: ${SCHOOL_AUTHORITY_INFO.schoolCode}`, contactX, contactY + 10);
      pdf.text(`Authority Code: ${SCHOOL_AUTHORITY_INFO.authorityCode}`, contactX, contactY + 15);

      // Save/download the PDF
      const fileName = `RTD_Connect_Acceptance_Letter_${studentNames.join('_').replace(/\s+/g, '_')}_${activeSchoolYear?.replace('/', '-') || '2024-25'}.pdf`;
      pdf.save(fileName);

      if (onPrint) onPrint();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating acceptance letter. Please try again.');
    }
  };

  // Helper function to load images
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // Return null if image fails to load
      img.src = src;
    });
  };

  const currentDate = new Date();
  const formattedCurrentDate = formatDateSafely(currentDate);
  
  // Get the primary parent name
  const primaryParentName = parentName || 
    (familyData?.guardians?.[0] ? `${familyData.guardians[0].firstName} ${familyData.guardians[0].lastName}` : 'Parent/Guardian');

  // Get all student names
  const studentNames = familyData?.students?.map(student => 
    `${student.firstName} ${student.lastName}`
  ) || [];

  const studentNamesList = studentNames.length > 1 
    ? studentNames.slice(0, -1).join(', ') + ` and ${studentNames[studentNames.length - 1]}`
    : studentNames[0] || 'Student';

  const hasMultipleStudents = studentNames.length > 1;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-hidden flex flex-col h-full">
        <SheetHeader className="print-hide">
          <SheetTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-purple-600" />
            <span>Home Education Acceptance Letter</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-grow my-6 pr-4">          
          <div className="p-6 print:p-0 bg-white" data-print-content>
            {/* Letter Content */}
            <div className="max-w-4xl mx-auto print:max-w-full">
              {/* Letterhead */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12">
                    <RTDConnectLogo />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent print:text-gray-900">
                      RTD Connect
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">Home Education Portal</p>
                    <p className="text-xs text-gray-500">Part of {SCHOOL_AUTHORITY_INFO.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Date: {formattedCurrentDate}</p>
                </div>
              </div>

              {/* Letter Body */}
              <div className="space-y-4 text-sm leading-normal">
                <p className="text-base"><strong>Dear {primaryParentName},</strong></p>

                <p>
                  Thank you for your {activeSchoolYear || '2024-25'} registration with <strong>RTD Connect Home Education</strong>. 
                  We are pleased to supervise {hasMultipleStudents ? 'your students' : 'your student'} in {hasMultipleStudents ? 'their chosen programs' : 'their chosen program'} for the coming school year.
                </p>

                <p>
                  <strong>{studentNamesList}</strong> {hasMultipleStudents ? 'have' : 'has'} been accepted to 
                  RTD Academy's RTD Connect Home Education program for the {activeSchoolYear || '2024-25'} school year.
                </p>

                <p>
                  In accordance with Alberta Education's Home Education requirements, we have received and approved 
                  all required documents for your registration:
                </p>

                <div className="pl-4 space-y-1">
                  <p>✓ Notification Form</p>
                  <p>✓ Program Plan Document with digital signature</p>
                  <p>✓ Copy of your {hasMultipleStudents ? "children's Birth Certificates" : "child's Birth Certificate"}</p>
                </div>

                <p>
                  We look forward to a successful year with {hasMultipleStudents ? 'your children' : 'your child'}, 
                  supporting their educational journey in the home and community. If you have any questions or need assistance 
                  with planning and resources, please don't hesitate to contact your assigned facilitator through the RTD Connect portal.
                </p>

                {/* Highlighted Welcome Section */}
                <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 p-4 rounded-lg border-l-4 border-purple-500 my-6 print:bg-gray-50 print:border-gray-400">
                  <p className="text-center font-bold text-lg">Welcome to the family!</p>
                  <p className="text-center text-sm mt-2 font-medium">
                    This is confirmation of registration for the {activeSchoolYear || '2024-25'} Home Education year
                  </p>
                  <p className="text-center text-xs text-gray-600 mt-1">(to be kept for your files)</p>
                </div>

                {/* Signature Section */}
                <div className="mt-8 pt-4 border-t border-gray-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="mb-3">Yours truly,</p>
                      
                      {/* Signature */}
                      <div className="mb-3 h-10 flex items-center">
                        <img 
                          src="/Kyle/signature.png" 
                          alt="Kyle Brown Signature" 
                          className="h-8 max-w-32 object-contain" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="text-lg font-bold text-blue-800 italic" 
                          style={{fontFamily: 'cursive', display: 'none'}}
                        >
                          {EXECUTIVE_DIRECTOR.name}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-400 w-32 mb-2"></div>
                      <p className="font-bold">{EXECUTIVE_DIRECTOR.name}</p>
                      <p className="text-sm text-gray-600">{EXECUTIVE_DIRECTOR.title}</p>
                      <p className="text-sm text-gray-600">{SCHOOL_AUTHORITY_INFO.name}</p>
                    </div>

                    <div className="text-right text-sm text-gray-600">
                      <p className="mb-1"><strong>Contact Information:</strong></p>
                      <p>Email: info@rtdacademy.com</p>
                      <p>Alberta School Code: {SCHOOL_AUTHORITY_INFO.schoolCode}</p>
                      <p>Authority Code: {SCHOOL_AUTHORITY_INFO.authorityCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 border-t pt-4 print-hide">
          <Button 
            onClick={handlePrint} 
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Acceptance Letter (PDF)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AcceptanceLetterDialog;