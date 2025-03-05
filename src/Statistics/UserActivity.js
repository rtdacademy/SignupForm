import React, { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, limitToLast, get } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Activity, BookOpen, Clock, User, Mail, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const UserActivity = ({ summariesData, selectedSchoolYear }) => {
  // This is just sample data - in a real implementation, you would fetch actual user activity
  const activityStats = {
    totalLogins: 2437,
    averageDailyLogins: 82,
    averageSessionTime: '27 minutes',
    mostActiveModule: 'Math 30-1: Trigonometry',
    completionRate: '68%'
  };

  // State for staff email statistics
  const [loading, setLoading] = useState(false);
  const [emailStatsLoading, setEmailStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [groupedEmails, setGroupedEmails] = useState([]);
  const [allGroupedEmails, setAllGroupedEmails] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [queryLimit, setQueryLimit] = useState(100);
  
  // Fetch all staff members
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setLoading(true);
        const db = getDatabase();
        const staffRef = ref(db, 'staff');
        const snapshot = await get(staffRef);
        
        if (snapshot.exists()) {
          const staffData = [];
          snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            if (data.email && data.firstName && data.lastName) {
              staffData.push({
                emailKey: key,
                email: data.email,
                name: `${data.firstName} ${data.lastName}`
              });
            }
          });
          
          staffData.sort((a, b) => a.name.localeCompare(b.name));
          setStaffMembers(staffData);
          
          if (staffData.length > 0) {
            setSelectedStaff(staffData[0].emailKey);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Could not load staff members");
        setLoading(false);
      }
    };
    
    fetchStaffMembers();
  }, []);

  // Fetch emails for selected staff member and group them
  useEffect(() => {
    const fetchStaffEmails = async () => {
      if (!selectedStaff) return;
      
      try {
        setEmailStatsLoading(true);
        const staffMember = staffMembers.find(s => s.emailKey === selectedStaff);
        
        if (!staffMember) {
          setEmailStatsLoading(false);
          return;
        }
        
        const db = getDatabase();
        const emailsRef = ref(db, 'sendGridTracking');
        const emailQuery = query(
          emailsRef, 
          orderByChild('senderKey'), 
          equalTo(selectedStaff),
          limitToLast(queryLimit)
        );
        
        const snapshot = await get(emailQuery);
        
        if (snapshot.exists()) {
          const emails = [];
          
          snapshot.forEach((childSnapshot) => {
            emails.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          
          // Sort by timestamp descending (most recent first)
          emails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          // Group emails sent within 1 minute of each other
          const groups = [];
          let currentGroup = null;
          
          emails.forEach(email => {
            if (!currentGroup) {
              currentGroup = {
                id: `group-${email.id}`,
                timestamp: email.timestamp,
                subject: email.subject,
                senderName: email.senderName,
                senderEmail: email.senderEmail,
                metadata: email.metadata,
                emails: [email]
              };
            } else {
              // Check if current email was sent within 1 minute of the group
              const timeDiff = Math.abs(currentGroup.timestamp - email.timestamp);
              const oneMinuteInMs = 60 * 1000;
              
              if (timeDiff <= oneMinuteInMs && currentGroup.subject === email.subject) {
                // Add to current group
                currentGroup.emails.push(email);
              } else {
                // Start a new group
                groups.push(currentGroup);
                currentGroup = {
                  id: `group-${email.id}`,
                  timestamp: email.timestamp,
                  subject: email.subject,
                  senderName: email.senderName,
                  senderEmail: email.senderEmail,
                  metadata: email.metadata,
                  emails: [email]
                };
              }
            }
          });
          
          // Don't forget to add the last group
          if (currentGroup) {
            groups.push(currentGroup);
          }
          
          setAllGroupedEmails(groups);
          setGroupedEmails(groups.slice(0, displayLimit));
        } else {
          setAllGroupedEmails([]);
          setGroupedEmails([]);
        }
        setEmailStatsLoading(false);
      } catch (err) {
        console.error("Error fetching staff emails:", err);
        setError("Could not load email data");
        setEmailStatsLoading(false);
      }
    };
    
    fetchStaffEmails();
  }, [selectedStaff, staffMembers, queryLimit]);

  // Update displayed emails when display limit changes
  useEffect(() => {
    setGroupedEmails(allGroupedEmails.slice(0, displayLimit));
  }, [displayLimit, allGroupedEmails]);

  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  const handleDisplayLimitChange = (event) => {
    setDisplayLimit(Number(event.target.value));
  };

  const handleQueryLimitChange = (event) => {
    const newLimit = Number(event.target.value);
    setQueryLimit(newLimit);
    // Reset display limit if it's higher than the new query limit
    if (displayLimit > newLimit) {
      setDisplayLimit(newLimit);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if date is in the current year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's an older date, show the full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) +
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lms-activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lms-activity">LMS Activity</TabsTrigger>
          <TabsTrigger value="staff-emails">Staff Communication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lms-activity" className="space-y-4">
          <Alert>
            <AlertDescription>
              Showing LMS user activity for school year 20{selectedSchoolYear}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Logins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{activityStats.totalLogins}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Daily Logins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{activityStats.averageDailyLogins}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-2xl font-bold">{activityStats.averageSessionTime}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">{activityStats.completionRate}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Module</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{activityStats.mostActiveModule}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff-emails" className="space-y-4">
          {loading ? (
            <Alert>
              <AlertDescription>Loading staff members...</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Staff Email Activity</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <select
                    value={selectedStaff}
                    onChange={handleStaffChange}
                    className="px-3 py-2 border rounded-md w-full sm:w-[240px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={emailStatsLoading}
                  >
                    {staffMembers.map((staff) => (
                      <option key={staff.emailKey} value={staff.emailKey}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-purple-500" />
                  <h2 className="text-md font-medium">Display Options</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                  <div className="flex items-center gap-2">
                    <label htmlFor="displayLimit" className="text-sm whitespace-nowrap">Show:</label>
                    <select
                      id="displayLimit"
                      value={displayLimit}
                      onChange={handleDisplayLimitChange}
                      className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="10">10 groups</option>
                      <option value="20">20 groups</option>
                      <option value="50">50 groups</option>
                      <option value="100">100 groups</option>
                      {queryLimit > 100 && <option value={queryLimit}>All {queryLimit} groups</option>}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="queryLimit" className="text-sm whitespace-nowrap">Fetch:</label>
                    <select
                      id="queryLimit"
                      value={queryLimit}
                      onChange={handleQueryLimitChange}
                      className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="100">Last 100 emails</option>
                      <option value="250">Last 250 emails</option>
                      <option value="500">Last 500 emails</option>
                      <option value="1000">Last 1000 emails</option>
                    </select>
                  </div>
                </div>
              </div>

              {emailStatsLoading ? (
                <Alert>
                  <AlertDescription>Loading email data...</AlertDescription>
                </Alert>
              ) : groupedEmails.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-muted-foreground">
                    Displaying {groupedEmails.length} of {allGroupedEmails.length} email groups
                  </div>
                
                  <Accordion type="single" collapsible className="space-y-4">
                    {groupedEmails.map((group) => (
                      <AccordionItem key={group.id} value={group.id} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex flex-col md:flex-row md:justify-between w-full text-left">
                            <div className="font-semibold">{group.subject || 'No Subject'}</div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatDate(group.timestamp)}</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                {group.emails.length} {group.emails.length === 1 ? 'recipient' : 'recipients'}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-4 pt-2">
                            {group.metadata && group.metadata.courseName && (
                              <div className="mb-3 text-sm">
                                <span className="font-medium">Course:</span> {group.metadata.courseName}
                              </div>
                            )}
                            <div className="mb-3 text-sm">
                              <span className="font-medium">From:</span> {group.senderName || group.senderEmail || 'Unknown'}
                            </div>
                            <h4 className="text-sm font-semibold my-2">Recipients:</h4>
                            <div className="max-h-60 overflow-y-auto border rounded-md bg-gray-50">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {group.emails.map((email) => (
                                    <tr key={email.id}>
                                      <td className="px-4 py-2 text-sm">{email.recipientEmail}</td>
                                      <td className="px-4 py-2 text-sm">
                                        {email.events && email.events.sent && email.events.sent.success ? (
                                          <span className="text-green-600">✓ Sent</span>
                                        ) : (
                                          <span className="text-red-600">✗ Failed</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground bg-gray-50 rounded-lg">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No emails found</h3>
                  <p>No email records for this staff member</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivity;