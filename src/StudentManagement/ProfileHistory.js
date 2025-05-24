import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Clock, 
  User, 
  ChevronDown, 
  ChevronUp,
  FileText,
  History
} from 'lucide-react';
import { formatDateForDisplay } from '../utils/timeZoneUtils';

const ProfileHistory = ({ studentEmailKey }) => {
  const [history, setHistory] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (!studentEmailKey) return;

    const db = getDatabase();
    const historyRef = ref(db, `students/${studentEmailKey}/profileHistory`);

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Separate summaries from individual changes
        const summariesData = data.summaries || {};
        const historyData = { ...data };
        delete historyData.summaries;

        // Convert summaries to array and sort by timestamp
        const summariesArray = Object.entries(summariesData).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.timestamp - a.timestamp);

        // Convert history to array and sort by timestamp
        const historyArray = Object.entries(historyData).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.changedAt - a.changedAt);

        setSummaries(summariesArray);
        setHistory(historyArray);
      } else {
        setSummaries([]);
        setHistory([]);
      }
      setLoading(false);
    });

    return () => {
      off(historyRef);
    };
  }, [studentEmailKey]);

  const formatFieldName = (fieldName) => {
    const fieldLabels = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'preferredFirstName': 'Preferred First Name',
      'StudentPhone': 'Phone Number',
      'gender': 'Gender',
      'birthday': 'Birthday',
      'address': 'Address',
      'asn': 'Alberta Student Number',
      'ParentFirstName': 'Parent First Name',
      'ParentLastName': 'Parent Last Name',
      'ParentPhone_x0023_': 'Parent Phone',
      'ParentEmail': 'Parent Email',
      'studentPhoto': 'Student Photo',
      'albertaResident': 'Alberta Resident',
      'parentRelationship': 'Parent Relationship',
      'isLegalGuardian': 'Legal Guardian',
      'hasLegalRestrictions': 'Legal Restrictions',
      'legalDocumentUrl': 'Legal Document',
      'indigenousIdentification': 'Indigenous Identification',
      'indigenousStatus': 'Indigenous Status',
      'citizenshipDocuments': 'Citizenship Documents',
      'howDidYouHear': 'How Did You Hear',
      'whyApplying': 'Why Applying',
      'internationalDocuments': 'International Documents'
    };
    return fieldLabels[fieldName] || fieldName;
  };

  const formatValue = (value, fieldName) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not set</span>;
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle address objects
    if (fieldName === 'address' && typeof value === 'object') {
      if (value.fullAddress) {
        return value.fullAddress;
      }
      return JSON.stringify(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">None</span>;
      }
      return value.join(', ');
    }

    // Handle objects
    if (typeof value === 'object') {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }

    return value;
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (loading) {
    return <div className="text-center py-4">Loading profile history...</div>;
  }

  if (history.length === 0 && summaries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No profile history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Profile History</h3>
            <Badge variant="secondary">{history.length} changes</Badge>
          </div>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Recent Update Summaries */}
          {summaries.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Recent Updates</h4>
              {summaries.slice(0, 5).map((summary) => (
                <div key={summary.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {formatDateForDisplay(new Date(summary.timestamp))}
                      </span>
                    </div>
                    <Badge variant="outline">{summary.changeCount} changes</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Fields: {summary.fieldsChanged.map(f => formatFieldName(f)).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Change History */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Detailed Changes</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.slice(0, 20).map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleItemExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">
                        {formatFieldName(item.fieldName)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDateForDisplay(new Date(item.changedAt))}
                      </span>
                      {expandedItems[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {expandedItems[item.id] && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium text-gray-600 mb-1">Previous Value:</div>
                          <div className="bg-red-50 p-2 rounded">
                            {formatValue(item.previousValue, item.fieldName)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600 mb-1">New Value:</div>
                          <div className="bg-green-50 p-2 rounded">
                            {formatValue(item.newValue, item.fieldName)}
                          </div>
                        </div>
                      </div>
                      {item.metadata && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                          <User className="h-3 w-3" />
                          Changed by: {item.metadata.userEmail || 'Unknown'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {history.length > 20 && (
            <p className="text-sm text-gray-500 text-center">
              Showing most recent 20 changes of {history.length} total
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProfileHistory;