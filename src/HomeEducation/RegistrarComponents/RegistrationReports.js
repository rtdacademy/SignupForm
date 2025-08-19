import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationReports = ({ isOpen, onClose, families, schoolYear }) => {
  const [reportType, setReportType] = useState('all-students');
  const [exporting, setExporting] = useState(false);
  const dbSchoolYear = schoolYear.replace('/', '_');

  const handleExport = () => {
    setExporting(true);
    
    try {
      const data = generateReportData();
      const csv = convertToCSV(data);
      downloadCSV(csv, `pasi-registration-${reportType}-${Date.now()}.csv`);
      toast.success('Report exported successfully');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const generateReportData = () => {
    const rows = [];
    
    Object.entries(families).forEach(([familyId, family]) => {
      if (family.students) {
        Object.values(family.students).forEach(student => {
          const notificationForm = family.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id];
          const citizenshipDocs = family.STUDENT_CITIZENSHIP_DOCS?.[student.id];
          const soloPlan = family.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
          const pasiReg = family.PASI_REGISTRATIONS?.[dbSchoolYear]?.[student.id];
          const primaryGuardian = family.guardians ? 
            Object.values(family.guardians).find(g => g.guardianType === 'primary_guardian') : null;
          
          // Apply filters based on report type
          if (reportType === 'missing-asn' && student.asn) return;
          if (reportType === 'ready-for-pasi' && (!student.asn || !notificationForm || !citizenshipDocs)) return;
          if (reportType === 'completed' && pasiReg?.status !== 'completed') return;
          
          rows.push({
            // Student Information
            'Student ID': student.id,
            'First Name': student.firstName,
            'Last Name': student.lastName,
            'Preferred Name': student.preferredName || '',
            'ASN': student.asn || 'MISSING',
            'Birthday': student.birthday,
            'Gender': student.gender,
            'Grade': student.grade,
            
            // Family Information
            'Family Name': family.familyName,
            'Family ID': familyId,
            'Facilitator': family.facilitatorEmail || 'Unassigned',
            
            // Guardian Information
            'Guardian First Name': primaryGuardian?.firstName || '',
            'Guardian Last Name': primaryGuardian?.lastName || '',
            'Guardian Email': primaryGuardian?.email || '',
            'Guardian Phone': primaryGuardian?.phone || '',
            
            // Address
            'Street Address': primaryGuardian?.address?.streetAddress || '',
            'City': primaryGuardian?.address?.city || '',
            'Province': primaryGuardian?.address?.province || '',
            'Postal Code': primaryGuardian?.address?.postalCode || '',
            
            // Document Status
            'Notification Form': notificationForm?.submissionStatus === 'submitted' ? 'Yes' : 'No',
            'Citizenship Docs': citizenshipDocs?.staffApproval?.isApproved ? 'Approved' : 'Pending',
            'Education Plan': soloPlan?.submissionStatus === 'submitted' ? 'Yes' : 'No',
            'Following Alberta Curriculum': soloPlan?.followAlbertaPrograms ? 'Yes' : 'No',
            
            // PASI Status
            'PASI Registration Status': pasiReg?.status === 'completed' ? 'Completed' : 'Pending',
            'PASI Registration Date': pasiReg?.registeredAt ? new Date(pasiReg.registeredAt).toLocaleDateString() : '',
            'PASI Registered By': pasiReg?.registeredBy || ''
          });
        });
      }
    });
    
    return rows;
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Registration Data</DialogTitle>
          <DialogDescription>
            Generate CSV reports for PASI registration and tracking
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-students">All Students</SelectItem>
                <SelectItem value="missing-asn">Students Missing ASN</SelectItem>
                <SelectItem value="ready-for-pasi">Ready for PASI Registration</SelectItem>
                <SelectItem value="completed">Completed Registrations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-1">Export will include:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Student information (name, ASN, birthday, grade)</li>
              <li>Family and guardian details</li>
              <li>Current address</li>
              <li>Document status</li>
              <li>PASI registration status</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationReports;