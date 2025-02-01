import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Link, Link2Off, UserCheck, UserX, HelpCircle, Search, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const PASIPreviewDialog = ({ 
  isOpen, 
  onClose, 
  records, 
  onConfirm, 
  isConfirming = false,
  selectedSchoolYear 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedFilter, setLinkedFilter] = useState('all');
  const [matchFilter, setMatchFilter] = useState('all');

  const StatusLegend = () => (
    <div className="flex items-center gap-6 text-sm p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-green-600" />
        <span>ASN Found</span>
      </div>
      <div className="flex items-center gap-2">
        <UserX className="h-4 w-4 text-red-600" />
        <span>ASN Not Found</span>
      </div>
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-green-600" />
        <span>Record Linked</span>
      </div>
      <div className="flex items-center gap-2">
        <Link2Off className="h-4 w-4 text-red-600" />
        <span>Link Broken</span>
      </div>
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <span>Never Linked</span>
      </div>
    </div>
  );

  const StatusIcon = ({ type, status }) => {
    let icon = null;
    let tooltipText = '';
    let colorClass = '';

    if (type === 'match') {
      if (status === 'Found in Database') {
        icon = <UserCheck className="h-4 w-4" />;
        tooltipText = 'ASN Found in Database';
        colorClass = 'text-green-600';
      } else {
        icon = <UserX className="h-4 w-4" />;
        tooltipText = 'ASN Not Found';
        colorClass = 'text-red-600';
      }
    } else if (type === 'linked') {
      if (status === true) {
        icon = <Link className="h-4 w-4" />;
        tooltipText = 'Record Linked';
        colorClass = 'text-green-600';
      } else if (status === false) {
        icon = <Link2Off className="h-4 w-4" />;
        tooltipText = 'Link Broken';
        colorClass = 'text-red-600';
      } else {
        icon = <HelpCircle className="h-4 w-4" />;
        tooltipText = 'Never Linked';
        colorClass = 'text-muted-foreground';
      }
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={colorClass}>{icon}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    
    // Apply match status filter
    if (matchFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.matchStatus === matchFilter
      );
    }

    // Apply linked status filter
    if (linkedFilter !== 'all') {
      if (linkedFilter === 'true') {
        filtered = filtered.filter(record => record.linked === true);
      } else if (linkedFilter === 'false') {
        filtered = filtered.filter(record => record.linked === false);
      } else if (linkedFilter === 'null') {
        filtered = filtered.filter(record => record.linked === null);
      }
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.asn?.toLowerCase().includes(searchLower) ||
        record.studentName?.toLowerCase().includes(searchLower) ||
        record.email?.toLowerCase().includes(searchLower)
      );
    }

    // Return first 10 records if no filters are active
    if (!searchTerm.trim() && linkedFilter === 'all' && matchFilter === 'all') {
      return filtered.slice(0, 10);
    }

    return filtered;
  }, [records, searchTerm, linkedFilter, matchFilter]);

  const totalRecords = records.length;
  const displayedRecords = filteredRecords.length;
  const matches = records.filter(row => row.matchStatus === 'Found in Database');
  const notMatched = records.filter(row => row.matchStatus === 'Not Found');

  const previewColumns = [
    { key: 'matchStatus', label: 'Match', type: 'icon' },
    { key: 'linked', label: 'Link', type: 'icon' },
    { key: 'asn', label: 'ASN' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseDescription', label: 'Description' },
    { key: 'schoolYear', label: 'School Year' },
    { key: 'period', label: 'Period' }
  ];

  const FilterBar = () => (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ASN, student name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={matchFilter} onValueChange={setMatchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by match status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Match Status</SelectItem>
            <SelectItem value="Found in Database">Found in Database</SelectItem>
            <SelectItem value="Not Found">Not Found</SelectItem>
          </SelectContent>
        </Select>

        <Select value={linkedFilter} onValueChange={setLinkedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by link status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Link Status</SelectItem>
            <SelectItem value="true">Linked</SelectItem>
            <SelectItem value="false">Not Linked</SelectItem>
            <SelectItem value="null">Never Linked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview PASI Records for {selectedSchoolYear}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will replace all existing PASI records for {selectedSchoolYear}. 
              Total records to upload: {totalRecords} ({matches.length} matched, {notMatched.length} not matched)
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">
                {(searchTerm || linkedFilter !== 'all' || matchFilter !== 'all') 
                  ? 'Matching records:' 
                  : 'Showing first 10 of'} {displayedRecords}
                {(!searchTerm && linkedFilter === 'all' && matchFilter === 'all') && ` (of ${totalRecords})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Unmatched ASNs:</span>
              <span className="font-medium ml-2 text-red-600">{notMatched.length}</span>
            </div>
          </div>

          <StatusLegend />
          <FilterBar />
          
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="min-w-max">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    {previewColumns.map(({ label }) => (
                      <TableHead key={label} className="whitespace-nowrap">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((row, index) => (
                    <TableRow 
                      key={index}
                      className={row.matchStatus === 'Not Found' ? 'bg-red-50' : ''}
                    >
                      {previewColumns.map(({ key, type }) => (
                        <TableCell key={key} className="whitespace-nowrap">
                          {type === 'icon' ? (
                            key === 'matchStatus' ? (
                              <StatusIcon type="match" status={row.matchStatus} />
                            ) : (
                              <StatusIcon type="linked" status={row.linked} />
                            )
                          ) : (
                            row[key] || '-'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {notMatched.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: This will REPLACE ALL existing PASI records for {selectedSchoolYear}. 
                {totalRecords} new records will be uploaded ({matches.length} matched, {notMatched.length} not matched).
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm} 
            disabled={isConfirming}
          >
            {isConfirming ? 'Replacing...' : `Replace All Records (${totalRecords})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PASIPreviewDialog;