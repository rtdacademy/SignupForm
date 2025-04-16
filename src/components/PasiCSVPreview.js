import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Component to preview PASI CSV data before uploading
 * 
 * @param {Object} props Component props
 * @param {Object} props.previewData The data to preview
 * @returns {JSX.Element} The preview component
 */
const PasiCSVPreview = ({ previewData }) => {
  if (!previewData || !previewData.data) {
    return <div>No data to preview</div>;
  }

  const data = previewData.data;
  const stats = previewData.stats || {};
  
  // Get a sample of records to display
  const sampleRecords = data.slice(0, 5);
  
  // Extract headers from first record or use defaults
  let headers = [];
  if (sampleRecords.length > 0) {
    headers = Object.keys(sampleRecords[0])
      .filter(header => !header.startsWith('_') && header !== 'id' && header !== 'lastUpdated')
      .slice(0, 6); // Limit to first 6 headers for display
  }

  return (
    <div className="space-y-4">
      {/* Upload stats if available */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-muted rounded-md">
          {stats.total && (
            <div>
              <p className="text-sm font-medium">Total Records:</p>
              <p className="text-xl">{stats.total}</p>
            </div>
          )}
          {stats.new !== undefined && (
            <div>
              <p className="text-sm font-medium text-green-600">New Records:</p>
              <p className="text-xl">{stats.new}</p>
            </div>
          )}
          {stats.updated !== undefined && (
            <div>
              <p className="text-sm font-medium text-blue-600">Updated Records:</p>
              <p className="text-xl">{stats.updated}</p>
            </div>
          )}
          {stats.removed !== undefined && (
            <div>
              <p className="text-sm font-medium text-red-600">Removed Records:</p>
              <p className="text-xl">{stats.removed}</p>
            </div>
          )}
          {stats.linked !== undefined && (
            <div>
              <p className="text-sm font-medium">Linked Records:</p>
              <p className="text-xl">{stats.linked}</p>
            </div>
          )}
          {stats.duplicateCount !== undefined && stats.duplicateCount > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-600">Duplicates:</p>
              <p className="text-xl">{stats.duplicateCount}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Missing fields warning */}
      {previewData.missingFields && previewData.missingFields.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Missing Fields</p>
              <p className="text-sm text-amber-700 mt-1">
                The following required fields are missing from the CSV:
              </p>
              <ul className="list-disc pl-5 mt-1 text-sm text-amber-700">
                {previewData.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Sample data table */}
      <div className="border rounded-md overflow-hidden">
        <p className="p-2 text-sm font-medium border-b bg-muted">Sample Data (First 5 Records)</p>
        <div className="max-h-60 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header} className="text-xs whitespace-nowrap py-2">
                    {header}
                  </TableHead>
                ))}
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRecords.map((record, index) => (
                <TableRow key={index}>
                  {headers.map(header => (
                    <TableCell key={header} className="text-xs py-1.5">
                      {record[header] ? 
                        (typeof record[header] === 'string' && record[header].length > 20 ? 
                          `${record[header].substring(0, 20)}...` : 
                          record[header]) : 
                        '-'}
                    </TableCell>
                  ))}
                  <TableCell>
                    {record._status === 'new' ? (
                      <Badge className="bg-green-100 text-green-800">New</Badge>
                    ) : record._status === 'updated' ? (
                      <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
                    ) : record._status === 'unchanged' ? (
                      <Badge className="bg-gray-100 text-gray-800">Unchanged</Badge>
                    ) : record._status === 'linked' ? (
                      <Badge className="bg-purple-100 text-purple-800">Linked</Badge>
                    ) : (
                      <Badge>Unknown</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Total results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {sampleRecords.length} of {data.length} records
        </p>
        
        {previewData.hasAllRequiredFields === false ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            Missing required fields
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Data looks good
          </div>
        )}
      </div>
    </div>
  );
};

export default PasiCSVPreview;