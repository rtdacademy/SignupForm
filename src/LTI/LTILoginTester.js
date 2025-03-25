import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";

const LTILoginTester = ({ baseUrl }) => {
    // Basic state
    const [userId, setUserId] = useState('');
    const [courseId, setCourseId] = useState(''); 
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Student-specific state
    const [testUserId, setTestUserId] = useState('');
    const [firstName, setFirstName] = useState('Kyle');
    const [lastName, setLastName] = useState('Fake');
    const [email, setEmail] = useState('kyle.e.brown13@gmail.com');
    const [deepLinks, setDeepLinks] = useState([]);
    const [selectedDeepLink, setSelectedDeepLink] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Instructor-specific state
    const [allowDirectLogin, setAllowDirectLogin] = useState(true);

    // Fetch deep links effect
    useEffect(() => {
        const fetchDeepLinks = async () => {
            if (courseId && role === 'student') {
                try {
                    setLoading(true);
                    const response = await fetch(`${baseUrl}/getLTILinks?courseId=${courseId}`);
                    const data = await response.json();
                    setDeepLinks(data.links || []);
                    setSelectedDeepLink('');
                    setSelectedAssignment(null);
                } catch (error) {
                    console.error('Error fetching deep links:', error);
                    setError('Failed to fetch assignments');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDeepLinks();
    }, [courseId, role, baseUrl]);

    // Update selected assignment details
    useEffect(() => {
        if (selectedDeepLink) {
            const assignment = deepLinks.find(link => link.id === selectedDeepLink);
            setSelectedAssignment(assignment);
        } else {
            setSelectedAssignment(null);
        }
    }, [selectedDeepLink, deepLinks]);

    const launchLTI = async () => {
        if (!userId || !courseId) {
            setError('Please provide User ID and Course ID.');
            return;
        }
    
        if (role === 'student' && !selectedDeepLink) {
            setError('Please select an assignment to launch.');
            return;
        }
    
        try {
            setLoading(true);
            setError(null);
    
            const launchParams = {
                user_id: userId,
                course_id: courseId,
                role: role,
                allow_direct_login: allowDirectLogin ? "1" : "0"
            };

            // Add test user parameters only for student role
            if (role === 'student') {
                launchParams.deep_link_id = selectedDeepLink;
                launchParams.firstname = firstName;
                launchParams.lastname = lastName;
                launchParams.email = email;
                if (testUserId) {
                    launchParams.test_user_id = testUserId;
                }
            }
    
            const params = new URLSearchParams(launchParams);
            const launchUrl = `${baseUrl}/ltiLogin?${params.toString()}`;
            console.log('Launch URL:', launchUrl);
            
            window.location.href = launchUrl;
    
        } catch (error) {
            console.error('Launch error:', error);
            setError(`Launch failed: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>LTI Launch Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                    <Label>Launch Type</Label>
                    <RadioGroup 
                        value={role} 
                        onValueChange={setRole}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id="student" />
                            <Label htmlFor="student">Student Assignment Launch</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="instructor" id="instructor" />
                            <Label htmlFor="instructor">Instructor Course Setup</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* User ID */}
                <div className="space-y-2">
                    <Label htmlFor="userId">
                        {role === 'student' ? 'Student ID' : 'Instructor ID'}
                    </Label>
                    <Input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder={`Enter ${role === 'student' ? 'Student' : 'Instructor'} ID`}
                    />
                </div>

                {/* Course ID */}
                <div className="space-y-2">
                    <Label htmlFor="courseId">Course ID</Label>
                    <Input
                        id="courseId"
                        type="text"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        placeholder="Enter Course ID"
                    />
                </div>

                {/* Student-specific fields */}
                {role === 'student' && (
                    <>
                        {/* Test User Section */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium">Test User Settings</h3>
                            <div className="space-y-2">
                                <Label htmlFor="testUserId">Test User ID (Optional)</Label>
                                <Input
                                    id="testUserId"
                                    value={testUserId}
                                    onChange={(e) => setTestUserId(e.target.value)}
                                    placeholder="Enter test user ID (e.g., test123)"
                                />
                                <p className="text-sm text-gray-600">
                                    For testing only: Enter a test ID to create a new IMathAS account linkage
                                </p>
                            </div>
                        </div>

                        {/* User Details Section */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium">User Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assignment Selection */}
                        <div className="space-y-2">
                            <Label>Select Assignment</Label>
                            <Select 
                                value={selectedDeepLink} 
                                onValueChange={setSelectedDeepLink}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an assignment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deepLinks.map((link) => (
                                        <SelectItem key={link.id} value={link.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{link.title}</span>
                                                {link.lineItem && (
                                                    <Badge variant="secondary">
                                                        Points: {link.lineItem.scoreMaximum}
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedAssignment && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-md">
                                    <h4 className="font-medium mb-2">Assignment Details:</h4>
                                    <div className="space-y-1 text-sm">
                                        <p>Title: {selectedAssignment.title}</p>
                                        {selectedAssignment.lineItem && (
                                            <>
                                                <p>Maximum Score: {selectedAssignment.lineItem.scoreMaximum}</p>
                                                <p>Grade Sync: Enabled</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Instructor-specific fields */}
                {role === 'instructor' && (
                    <div className="space-y-2">
                        <Label>Student Login Options</Label>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="allowLogin"
                                checked={allowDirectLogin}
                                onCheckedChange={setAllowDirectLogin}
                            />
                            <Label htmlFor="allowLogin">
                                Allow students to link existing IMathAS accounts
                            </Label>
                        </div>
                        <p className="text-sm text-gray-600">
                            When enabled, students can link their existing IMathAS accounts. 
                            When disabled, temporary accounts will be created automatically.
                        </p>
                    </div>
                )}

                {/* Launch Button */}
                <Button
                    onClick={launchLTI}
                    disabled={loading || !userId || !courseId || (role === 'student' && !selectedDeepLink)}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Launching...
                        </>
                    ) : (
                        role === 'instructor' ? 'Launch Course Setup' : 'Launch Assignment'
                    )}
                </Button>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Process Explanation */}
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-900">
                    <h4 className="font-medium mb-2">Launch Process:</h4>
                    <ol className="list-decimal ml-4 space-y-1">
                        {role === 'instructor' ? (
                            <>
                                <li>Creates or connects to IMathAS course</li>
                                <li>Opens course configuration interface</li>
                                <li>Select assignments to create deep links</li>
                                <li>Deep links are stored for student access</li>
                            </>
                        ) : (
                            <>
                                <li>Select a pre-configured assignment</li>
                                <li>Launches to the assignment interface</li>
                                <li>Grades sync back automatically</li>
                            </>
                        )}
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
};

export default LTILoginTester;