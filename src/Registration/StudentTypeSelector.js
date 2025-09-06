import { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { AlertTriangle, HelpCircle, Check, InfoIcon, CreditCard } from "lucide-react";
import { CreditSummaryCard } from '../Dashboard/CreditSummaryCard';
import { Alert, AlertDescription } from "../components/ui/alert";
import { getStudentTypeInfo, STUDENT_TYPE_OPTIONS } from '../config/DropdownOptions';
import { GraduationCap, Home, Sun, User, Globe } from 'lucide-react';
import { sanitizeEmail } from '../utils/sanitizeEmail';

const questions = [
  {
    id: 'albertaCitizen',
    text: 'Are you a Canadian citizen or permanent resident?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 1 : 'International Student')
  },
  {
    id: 'albertaResident',
    text: 'Are you a resident of Alberta?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 2 : 'Adult Student')
  },
  {
    id: 'enrolledInSchool',
    text: 'Are you in grades 10-12 and enrolled in a high school in Alberta?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 3 : 4)
  },
  {
    id: 'summerIntentEnrolled',
    text: 'Do you intend to complete the course between July and August?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 'Summer School' : 'Non-Primary')
  },
  {
    id: 'homeEducation',
    text: 'Is your education parent-directed and part of a Home Education Program?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 5 : 'Adult Student')
  },
  {
    id: 'summerIntentHomeEd',
    text: 'Do you intend to complete the course between July and August?',
    options: ['Yes', 'No'],
    next: (answer) => (answer === 'Yes' ? 'Summer School' : 'Home Education')
  }
];

function StudentTypeSelector({ onStudentTypeSelect, selectedType, isFormComponent = false, importantDates, transitionCourse }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [currentView, setCurrentView] = useState(isFormComponent ? 'initial' : 'questionnaire');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedStudentType, setSelectedType] = useState(selectedType || '');
  const [error, setError] = useState(null);
  const [creditData, setCreditData] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [currentSchoolYear, setCurrentSchoolYear] = useState('');

  // Get current school year (for next year if transition, otherwise current)
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // If it's after September, we're in the current school year
    // If it's before September, we're still in the previous school year
    let startYear = month >= 9 ? year : year - 1;
    
    // If this is a transition course, we want next year
    if (transitionCourse) {
      startYear += 1;
    }
    
    const schoolYear = `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`;
    setCurrentSchoolYear(schoolYear);
  }, [transitionCourse]);

  // Fetch credit data when component mounts
  useEffect(() => {
    const fetchCreditData = async () => {
      if (!user?.email || !currentSchoolYear) return;
      
      setLoadingCredits(true);
      try {
        const db = getDatabase();
        const emailKey = sanitizeEmail(user.email);
        const schoolYearKey = currentSchoolYear.replace('/', '_');
        const creditRef = ref(db, `creditsPerStudent/${schoolYearKey}/${emailKey}`);
        const snapshot = await get(creditRef);
        
        if (snapshot.exists()) {
          setCreditData(snapshot.val());
        } else {
          // No credit data yet - initialize with zeros
          setCreditData({
            nonExemptCredits: 0,
            exemptCredits: 0,
            totalCredits: 0,
            freeCreditsUsed: 0,
            paidCreditsRequired: 0
          });
        }
      } catch (error) {
        console.error('Error fetching credit data:', error);
        // Don't show error to user, just assume no credits used
        setCreditData({
          nonExemptCredits: 0,
          exemptCredits: 0,
          totalCredits: 0,
          freeCreditsUsed: 0,
          paidCreditsRequired: 0
        });
      } finally {
        setLoadingCredits(false);
      }
    };

    if (isFormComponent && currentSchoolYear) {
      fetchCreditData();
    }
  }, [user, currentSchoolYear, isFormComponent]);

  const saveToPendingRegistration = async (type) => {
    if (!isFormComponent) return; // Only save if it's part of the form
    
    try {
      const db = getDatabase();
      const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
      await set(pendingRegRef, {
        studentType: type,
        currentStep: 'type-selection',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      throw error;
    }
  };

  const handleStudentTypeSelect = async (type) => {
    try {
      setError(null);
      
      if (isFormComponent) {
        await saveToPendingRegistration(type);
      }
      
      setSelectedType(type);
      onStudentTypeSelect(type);
    } catch (error) {
      setError('Failed to save student type. Please try again.');
      console.error('Error saving student type:', error);
    }
  };

  const handleAnswer = (answer) => {
    const nextStep = questions[currentQuestion].next(answer);
    
    if (typeof nextStep === 'string') {
      // Check if student is at credit limit for Non-Primary or Home Education
      const atCreditLimit = creditData?.nonExemptCredits >= 10;
      if (atCreditLimit && (nextStep === 'Non-Primary' || nextStep === 'Home Education')) {
        setError(`You have used all 10 free credits for ${currentSchoolYear}. Please select "Adult Student" to register for additional courses (payment required).`);
        // Automatically select Adult Student instead
        handleStudentTypeSelect('Adult Student');
      } else {
        // If result is a student type, select it
        handleStudentTypeSelect(nextStep);
      }
    } else {
      setCurrentQuestion(nextStep);
    }
  };

  const restartQuestionnaire = async () => {
    try {
      setError(null);
      if (isFormComponent) {
        const db = getDatabase();
        const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
        await set(pendingRegRef, null);
      }

      setCurrentView(isFormComponent ? 'initial' : 'questionnaire');
      setCurrentQuestion(0);
      setSelectedType('');
      onStudentTypeSelect('');
    } catch (error) {
      setError('Failed to restart questionnaire. Please try again.');
      console.error('Error restarting questionnaire:', error);
    }
  };

  const renderInitialView = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardContent className="space-y-4 pt-6">
        <Button
          onClick={() => setCurrentView('questionnaire')}
          className="w-full justify-start text-left h-auto p-4"
          variant="outline"
        >
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Help me determine my student type</span>
              <span className="text-sm text-gray-500">Answer a few questions to determine the best option</span>
            </div>
          </div>
        </Button>

        <Button
          onClick={() => setCurrentView('direct-select')}
          className="w-full justify-start text-left h-auto p-4"
          variant="outline"
        >
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">I already know my student type</span>
              <span className="text-sm text-gray-500">Select directly from the list of student types</span>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
  
  const renderQuestionnaireContent = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardHeader>
        <h3 className="text-lg font-semibold">Determine Your Student Type</h3>
        <p className="text-sm text-gray-600">
          Please answer these questions to help us determine your student type
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">{questions[currentQuestion].text}</p>
          <div className="grid gap-2">
            {questions[currentQuestion].options.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        
        {selectedStudentType && (
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${getStudentTypeInfo(selectedStudentType).color}15` }}>
            <div className="flex items-center gap-3">
              {(() => {
                const { color, icon: Icon } = getStudentTypeInfo(selectedStudentType);
                return Icon ? <Icon className="h-6 w-6" style={{ color }} /> : null;
              })()}
              <div>
                <h4 className="font-medium" style={{ color: getStudentTypeInfo(selectedStudentType).color }}>
                  {selectedStudentType} Student
                </h4>
                <p className="text-sm text-gray-600">{getStudentTypeInfo(selectedStudentType).description}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {selectedStudentType && (
        <CardFooter>
          <Button
            onClick={restartQuestionnaire}
            variant="outline"
            className="w-full"
          >
            Start Over
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  const renderDirectSelectContent = () => {
    // Check if Non-Primary or Home Education should be disabled
    const atCreditLimit = creditData?.nonExemptCredits >= 10;
    const remainingCredits = creditData ? Math.max(0, 10 - creditData.nonExemptCredits) : 10;
    
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
        <CardHeader>
          <h3 className="text-lg font-semibold">Select Your Student Type</h3>
          <p className="text-sm text-gray-600">
            Choose the option that best describes your situation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show credit usage for Non-Primary/Home Ed students */}
          {creditData && (creditData.nonExemptCredits > 0 || creditData.exemptCredits > 0) && (
            <CreditSummaryCard 
              schoolYear={currentSchoolYear}
              compactMode={true}
              fullWidth={true}
            />
          )}

          <RadioGroup
            value={selectedStudentType}
            onValueChange={handleStudentTypeSelect}
            className="space-y-4"
          >
            {STUDENT_TYPE_OPTIONS.map((type) => {
              const { color, icon: Icon } = getStudentTypeInfo(type.value);
              // Check if this option should be disabled
              const isDisabled = atCreditLimit && 
                (type.value === 'Non-Primary' || type.value === 'Home Education');
              
              return (
                <div 
                  key={type.value} 
                  className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : 'hover:bg-white/60 cursor-pointer'
                  } ${
                    selectedStudentType === type.value ? 'border-2' : 'border'
                  }`}
                  style={{ 
                    borderColor: selectedStudentType === type.value ? color : '',
                    backgroundColor: selectedStudentType === type.value ? `${color}10` : 
                      (isDisabled ? '#f9fafb' : '')
                  }}
                  onClick={() => {
                    if (isDisabled) {
                      setError(`You have used all 10 free credits for ${currentSchoolYear}. Please select "Adult Student" to register for additional courses (payment required).`);
                    }
                  }}
                >
                  <RadioGroupItem 
                    value={type.value} 
                    id={type.value} 
                    className="mt-1"
                    disabled={isDisabled}
                    style={{ 
                      borderColor: selectedStudentType === type.value ? color : '',
                      color: selectedStudentType === type.value ? color : ''
                    }} 
                  />
                  <div className="flex items-start gap-3 flex-1">
                    {Icon && (
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                    )}
                    <Label htmlFor={type.value} className="flex flex-col space-y-1 cursor-pointer flex-1">
                      <span className="font-medium">
                        {type.value} Student
                        {isDisabled && (
                          <span className="ml-2 text-xs text-orange-600 font-normal">
                            (Credit limit reached)
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">{type.description}</span>
                    </Label>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {selectedStudentType && (
            <Button
              onClick={restartQuestionnaire}
              variant="outline"
              className="w-full mt-4"
            >
              Start Over
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Main content renderer
  const renderContent = () => {
    if (isFormComponent) {
      switch (currentView) {
        case 'initial':
          return renderInitialView();
        case 'questionnaire':
          return renderQuestionnaireContent();
        case 'direct-select':
          return renderDirectSelectContent();
        default:
          return renderInitialView();
      }
    } else {
      return renderQuestionnaireContent();
    }
  };

  // If a student type is already selected, render a summary card
  const renderSelectedTypeSummary = () => {
    if (!selectedStudentType) return null;
    
    const { color, icon: Icon, description } = getStudentTypeInfo(selectedStudentType);
    
    return (
      <Card 
        className="border-2 shadow-md transition-all duration-200"
        style={{ borderColor: color }}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-full" 
              style={{ backgroundColor: `${color}20` }}
            >
              {Icon && <Icon className="h-6 w-6" style={{ color }} />}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color }}>
                {selectedStudentType} Student
              </h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {isFormComponent && (
            <Button
              onClick={restartQuestionnaire}
              variant="outline"
              className="w-full mt-4"
              size="sm"
            >
              Change Student Type
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Show transition context message */}
      {transitionCourse && (
        <Alert className="bg-orange-50 border-orange-200">
          <InfoIcon className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <p className="font-medium mb-1">Re-registering for {transitionCourse.courseName}</p>
            <p className="text-sm">
              You are transitioning to the next school year. Your circumstances may have changed, 
              so please select the student type that best describes your situation for the upcoming year.
            </p>
            {transitionCourse.currentStudentType && (
              <p className="text-xs mt-2 text-orange-600">
                Previous registration: {transitionCourse.currentStudentType} Student
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedStudentType && currentView !== 'direct-select' && renderSelectedTypeSummary()}
      {(!selectedStudentType || currentView === 'direct-select') && renderContent()}
    </div>
  );
}

export default StudentTypeSelector;