import { useState } from 'react';

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
    next: (answer) => answer === 'Yes' ? 1 : 'International Student'
  },
  {
    id: 'albertaResident',
    text: 'Are you a resident of Alberta?',
    options: ['Yes', 'No'],
    next: (answer) => answer === 'Yes' ? 2 : 'Adult Student'
  },
  {
    id: 'enrolledInSchool',
    text: 'Are you enrolled in another junior high or high school in Alberta?',
    options: ['Yes', 'No'],
    next: (answer) => answer === 'Yes' ? 3 : 4
  },
  {
    id: 'summerIntentEnrolled',
    text: 'Do you intend to complete the course between July and August?',
    options: ['Yes', 'No'],
    next: (answer) => answer === 'Yes' ? 'Summer School' : 'Non-Primary'
  },
  {
    id: 'homeEducation',
    text: 'Is your education parent-directed and part of a Home Education Program?',
    options: ['Yes', 'No'],
    next: (answer) => answer === 'Yes' ? 5 : 'Adult Student'
  },
  {
    id: 'summerIntentHomeEd',
    text: 'Do you intend to complete the course between July and August?',
    options: ['Yes', 'No'],
    next: (answer) => answer === 'Yes' ? 'Summer School' : 'Home Education'
  }
];

function StudentTypeSelector({ onStudentTypeSelect }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [justDetermined, setJustDetermined] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const handleStudentTypeChange = (value) => {
    setSelectedType(value);
    setJustDetermined(true);
    onStudentTypeSelect(value);
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

  const restartQuestionnaire = () => {
    setCurrentQuestion(0);
    setJustDetermined(false);
    setSelectedType('');
    onStudentTypeSelect('');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">What type of student are you?</h2>
        <p className="text-sm text-muted-foreground">
          Please answer a few questions to determine your student type
        </p>
      </div>
      
      {!justDetermined && (
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-secondary-foreground">{questions[currentQuestion].text}</p>
            <div className="grid gap-2">
              {questions[currentQuestion].options.map(option => (
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
                {studentTypes.find(type => type.value === selectedType)?.label}
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