import { useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const studentTypes = [
  { value: 'Non-Primary', label: 'Non-Primary Student' },
  { value: 'Home Education', label: 'Home Education Student' },
  { value: 'Summer School', label: 'Summer School Student' },
  { value: 'Adult Student', label: 'Adult Student' },
  { value: 'International Student', label: 'International Student' }
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

function StudentTypeSelector({ onStudentTypeSelect }) {
  const { user } = useAuth();
  const uid = user?.uid; // Extract uid from user
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState(null);

  const saveToPendingRegistration = async (type) => {
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
      await saveToPendingRegistration(value);
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
      handleStudentTypeChange(nextStep);
      setJustDetermined(true);
    } else {
      setCurrentQuestion(nextStep);
    }
  };

  const restartQuestionnaire = async () => {
    try {
      setError(null);
      const db = getDatabase();
      const pendingRegRef = ref(db, `users/${uid}/pendingRegistration`);
      await set(pendingRegRef, null); // Clear the pending registration

      setCurrentQuestion(0);
      setJustDetermined(false);
      setSelectedType('');
      onStudentTypeSelect('');
    } catch (error) {
      setError('Failed to restart questionnaire. Please try again.');
      console.error('Error restarting questionnaire:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">What type of student are you?</h2>
        <p className="text-sm text-muted-foreground">
          Please answer a few questions to determine your student type
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border-red-200 border p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!justDetermined && (
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-secondary-foreground">{questions[currentQuestion].text}</p>
            <div className="grid gap-2">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="inline-flex items-center justify-center rounded-md bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {justDetermined && selectedType && (
        <div className="space-y-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-primary">
              Based on your answers, you are a{' '}
              <span className="font-medium">
                {studentTypes.find((type) => type.value === selectedType)?.label}
              </span>
            </p>
          </div>
          <button
            onClick={restartQuestionnaire}
            className="w-full inline-flex items-center justify-center rounded-md bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Restart Questionnaire
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentTypeSelector;
