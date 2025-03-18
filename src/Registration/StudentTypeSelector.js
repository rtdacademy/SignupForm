import { useState, useEffect } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { AlertTriangle, InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useRegistrationPeriod, RegistrationPeriod } from '../utils/registrationPeriods';

const studentTypes = [
  { value: 'Non-Primary', label: 'Non-Primary Student', description: 'Students enrolled in another Alberta school' },
  { value: 'Home Education', label: 'Home Education Student', description: 'Students registered with a home education provider' },
  { value: 'Summer School', label: 'Summer School Student', description: 'Students completing courses between July and August' },
  { value: 'Adult Student', label: 'Adult Student', description: 'Students who are 20 years or older' },
  { value: 'International Student', label: 'International Student', description: 'Students without Canadian citizenship or permanent residency' }
];

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
    text: 'Are you enrolled in another junior high or high school in Alberta?',
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

function StudentTypeSelector({ onStudentTypeSelect, selectedType, isFormComponent = false }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [currentView, setCurrentView] = useState(isFormComponent ? 'initial' : 'questionnaire');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);
  const [selectedStudentType, setSelectedType] = useState(selectedType || '');
  const [error, setError] = useState(null);
  const { 
    period, 
    cutoffDates, 
    nextYearRegistrationDate, 
    canRegisterForNextYear, 
    loading: periodLoading 
  } = useRegistrationPeriod();

  // Filter student types based on the current period
  const getAvailableStudentTypes = () => {
    // Adult and International are always available
    const alwaysAvailable = studentTypes.filter(type => 
      type.value === 'Adult Student' || type.value === 'International Student'
    );
    
    switch (period) {
      case RegistrationPeriod.SUMMER:
        // In summer period, only Summer School, Adult, and International are available
        return [
          ...studentTypes.filter(type => type.value === 'Summer School'),
          ...alwaysAvailable
        ];
      
      case RegistrationPeriod.NEXT_REGULAR:
        // After summer, no Summer School option
        return studentTypes.filter(type => type.value !== 'Summer School');
      
      default:
        // During regular period, all types are available
        return studentTypes;
    }
  };
  
  // Get period-specific message to display to the user
  const getPeriodMessage = () => {
    if (!cutoffDates || !nextYearRegistrationDate) return null;
    
    const formatDate = (date) => date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    switch (period) {
      case RegistrationPeriod.REGULAR:
        if (canRegisterForNextYear) {
          return `You can now register for the next school year. Registration for Summer School begins on ${formatDate(cutoffDates.regularToSummer)}.`;
        } else {
          return `Regular registration period is active. Registration for next school year opens on ${formatDate(nextYearRegistrationDate)}. After ${formatDate(cutoffDates.regularToSummer)}, only Summer School registrations will be accepted.`;
        }
      
      case RegistrationPeriod.SUMMER:
        return `We are currently in the Summer School registration period (until ${formatDate(cutoffDates.summerToRegular)}). Non-Primary and Home Education students must register as Summer School students during this time.`;
      
      case RegistrationPeriod.NEXT_REGULAR:
        return `Summer School registration for this year has ended. You can register as a Non-Primary or Home Education student for the next school year.`;
      
      default:
        return null;
    }
  };

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

  const handleStudentTypeChange = async (value) => {
    try {
      setError(null);
      
      // Check if type is valid for current period
      const availableTypes = getAvailableStudentTypes().map(t => t.value);
      if (!availableTypes.includes(value)) {
        if (period === RegistrationPeriod.SUMMER &&
            (value === 'Non-Primary' || value === 'Home Education')) {
          setError("During summer registration period, you must register as a Summer School student.");
          value = 'Summer School';
        } else if (period === RegistrationPeriod.NEXT_REGULAR && value === 'Summer School') {
          setError("Summer School registration is closed. You must register as a Non-Primary or Home Education student.");
          value = 'Non-Primary';
        }
      }
      
      if (isFormComponent) {
        await saveToPendingRegistration(value);
      }
      setSelectedType(value);
      setJustDetermined(true);
      onStudentTypeSelect(value);
    } catch (error) {
      setError('Failed to save student type. Please try again.');
      console.error('Error saving student type:', error);
    }
  };

  const handleAnswer = (answer) => {
    const nextStep = questions[currentQuestion].next(answer);
    
    if (typeof nextStep === 'string') {
      // If result is a student type, check if it's available in current period
      const availableTypes = getAvailableStudentTypes().map(t => t.value);
      
      if (availableTypes.includes(nextStep)) {
        handleStudentTypeChange(nextStep);
      } else {
        // Suggest an alternative type
        if (period === RegistrationPeriod.SUMMER && 
            (nextStep === 'Non-Primary' || nextStep === 'Home Education')) {
          handleStudentTypeChange('Summer School');
        } else if (period === RegistrationPeriod.NEXT_REGULAR && 
                  nextStep === 'Summer School') {
          handleStudentTypeChange('Non-Primary');
        }
      }
      setJustDetermined(true);
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
      setJustDetermined(false);
      setSelectedType('');
      onStudentTypeSelect('');
    } catch (error) {
      setError('Failed to restart questionnaire. Please try again.');
      console.error('Error restarting questionnaire:', error);
    }
  };

  const renderInitialView = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardHeader>
        <h3 className="text-lg font-semibold">Student Type Selection</h3>
        <p className="text-sm text-gray-600">
          Choose how you would like to determine your student type
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!periodLoading && cutoffDates && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              {getPeriodMessage()}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => setCurrentView('questionnaire')}
          className="w-full justify-start text-left h-auto p-4"
          variant="outline"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">Help me determine my student type</span>
            <span className="text-sm text-gray-500">Answer a few questions to determine the best option</span>
          </div>
        </Button>

        <Button
          onClick={() => setCurrentView('direct-select')}
          className="w-full justify-start text-left h-auto p-4"
          variant="outline"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">I already know my student type</span>
            <span className="text-sm text-gray-500">Select directly from the list of student types</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );

  const renderQuestionnaire = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardHeader>
        <h3 className="text-lg font-semibold">Determine Your Student Type</h3>
        <p className="text-sm text-gray-600">
          Please answer these questions to help us determine your student type
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!periodLoading && cutoffDates && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              {getPeriodMessage()}
            </AlertDescription>
          </Alert>
        )}
        
        {!justDetermined ? (
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
        ) : (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                Based on your answers, you are a{' '}
                <span className="font-medium">
                  {studentTypes.find((type) => type.value === selectedStudentType)?.label}
                </span>
              </AlertDescription>
            </Alert>
            <Button
              onClick={restartQuestionnaire}
              variant="outline"
              className="w-full"
            >
              Start Over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDirectSelect = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-200 border-t-4 border-t-blue-400">
      <CardHeader>
        <h3 className="text-lg font-semibold">Select Your Student Type</h3>
        <p className="text-sm text-gray-600">
          Choose the option that best describes your situation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!periodLoading && cutoffDates && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              {getPeriodMessage()}
            </AlertDescription>
          </Alert>
        )}
      
        <RadioGroup
          value={selectedStudentType}
          onValueChange={handleStudentTypeChange}
          className="space-y-4"
        >
          {getAvailableStudentTypes().map((type) => (
            <div key={type.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value} className="flex flex-col space-y-1 cursor-pointer">
                <span className="font-medium">{type.label}</span>
                <span className="text-sm text-gray-500">{type.description}</span>
              </Label>
            </div>
          ))}
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

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isFormComponent ? (
        <>
          {currentView === 'initial' && renderInitialView()}
          {currentView === 'questionnaire' && renderQuestionnaire()}
          {currentView === 'direct-select' && renderDirectSelect()}
        </>
      ) : (
        renderQuestionnaire()
      )}
    </div>
  );
}

export default StudentTypeSelector;