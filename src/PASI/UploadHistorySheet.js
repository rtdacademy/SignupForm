import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Info,
  Calendar,
  FileSpreadsheet,
  User
} from 'lucide-react';

const UploadHistorySheet = ({ 
  isOpen, 
  onClose, 
  uploads = [], 
  formatRelativeTime, 
  formatDate, 
  formatDuration,
  getStatusBadge 
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Upload History
          </SheetTitle>
          <SheetDescription>
            View recent PASI data uploads and their status
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {uploads.length > 0 ? (
            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <div 
                  key={upload.id || index} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Upload header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {upload.uploadedBy}
                      </span>
                      {getStatusBadge(upload)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {upload.schoolYear || 'N/A'}
                    </Badge>
                  </div>

                  {/* Upload details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(upload.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span title={formatDate(upload.startTime)}>
                        {new Date(upload.startTime).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <FileSpreadsheet className="h-3 w-3" />
                      <span className="font-medium">
                        {upload.processedCount?.toLocaleString() || '0'} records
                      </span>
                    </div>

                    {upload.endTime && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <RefreshCw className="h-3 w-3" />
                        <span>
                          {formatDuration(upload.startTime, upload.endTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Error display if any */}
                  {upload.errorCount > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded-md">
                      <p className="text-xs text-red-600 font-medium">
                        {upload.errorCount} error{upload.errorCount > 1 ? 's' : ''} encountered
                      </p>
                    </div>
                  )}

                  {/* Upload ID for reference */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-400">
                      Upload ID: {upload.id || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <History className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No Upload History Available</p>
              <p className="text-xs mt-1">Upload history will appear here after your first upload</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default UploadHistorySheet;