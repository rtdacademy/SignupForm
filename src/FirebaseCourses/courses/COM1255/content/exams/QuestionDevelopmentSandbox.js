import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { useAuth } from '../../../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../../components/ui/tabs';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';
import { Textarea } from '../../../../../components/ui/textarea';
import { Switch } from '../../../../../components/ui/switch';
import MultipleChoiceQuestion from '../../../../components/assessments/MultipleChoiceQuestion';
import DynamicQuestionExample from '../../../../components/assessments/DynamicQuestionExample';

/**
 * This component is a sandbox for staff to develop and test questions
 * Only visible to staff in dev mode
 */
const QuestionDevelopmentSandbox = ({ isStaffView, devMode, courseId }) => {
  const { currentUser, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [question, setQuestion] = useState({
    questionText: 'What is the main benefit of e-learning?',
    options: [
      { id: 'a', text: 'Flexibility in time and location' },
      { id: 'b', text: 'Always requires expensive technology' },
      { id: 'c', text: 'No need for self-discipline' },
      { id: 'd', text: 'Limited content availability' }
    ],
    correctOptionId: 'a',
    explanation: 'E-learning provides flexibility allowing students to learn at their own pace and from any location with internet access.'
  });
  const [showPreview, setShowPreview] = useState(true);

  // If not a staff member in dev mode, show a restricted message
  if (!isStaffView || !devMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>E-Learning Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <MultipleChoiceQuestion
              questionId="sample-q1"
              questionText="What is the main benefit of e-learning?"
              options={[
                { id: 'a', text: 'Flexibility in time and location' },
                { id: 'b', text: 'Always requires expensive technology' },
                { id: 'c', text: 'No need for self-discipline' },
                { id: 'd', text: 'Limited content availability' }
              ]}
              correctOptionId="a"
              explanation="E-learning provides flexibility allowing students to learn at their own pace and from any location with internet access."
              showFeedback={true}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestion({ ...question, [name]: value });
  };

  // Handle option changes
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index].text = value;
    setQuestion({ ...question, options: updatedOptions });
  };

  // Handle correct option selection
  const handleCorrectOptionChange = (id) => {
    setQuestion({ ...question, correctOptionId: id });
  };

  // Add a new option
  const handleAddOption = () => {
    if (question.options.length >= 6) return; // Limit to 6 options

    const newOptionId = String.fromCharCode(97 + question.options.length); // a, b, c, etc.
    const updatedOptions = [
      ...question.options,
      { id: newOptionId, text: '' }
    ];
    setQuestion({ ...question, options: updatedOptions });
  };

  // Remove an option
  const handleRemoveOption = (index) => {
    if (question.options.length <= 2) return; // Minimum 2 options
    
    const updatedOptions = question.options.filter((_, i) => i !== index);
    
    // Reassign IDs to ensure they're sequential
    const reindexedOptions = updatedOptions.map((option, i) => ({
      ...option,
      id: String.fromCharCode(97 + i)
    }));
    
    let correctOptionId = question.correctOptionId;
    // If we removed the correct option, reset it
    if (!reindexedOptions.find(opt => opt.id === correctOptionId)) {
      correctOptionId = reindexedOptions[0].id;
    }
    
    setQuestion({ 
      ...question, 
      options: reindexedOptions,
      correctOptionId
    });
  };

  // Save question to Firebase database
  const handleSaveQuestion = async () => {
    if (!courseId) return;
    
    try {
      const db = getDatabase();
      
      // Create a new question ID
      const questionBankRef = ref(db, `courses/${courseId}/questionBanks/quiz1/questions`);
      const newQuestionRef = push(questionBankRef);
      
      const questionData = {
        stem: question.questionText,
        options: question.options,
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        created: new Date().toISOString(),
        createdBy: currentUser?.email || 'unknown'
      };
      
      await set(newQuestionRef, questionData);
      
      alert('Question saved successfully!');
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question: ' + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Question Development Sandbox</span>
          <div className="text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Staff Dev Mode
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Question</TabsTrigger>
            <TabsTrigger value="test">Test Dynamic Questions</TabsTrigger>
            <TabsTrigger value="database">Database Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6 pb-8">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 p-2">
              <h3 className="text-lg font-medium">Question Editor</h3>
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-preview">Show Preview</Label>
                <Switch
                  id="show-preview"
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6 overflow-visible">
                <div>
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    name="questionText"
                    value={question.questionText}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Options</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddOption}
                      disabled={question.options.length >= 6}
                    >
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name="correctOption"
                          checked={question.correctOptionId === option.id}
                          onChange={() => handleCorrectOptionChange(option.id)}
                          className="rounded-full h-4 w-4"
                        />
                        <Label 
                          htmlFor={`option-${option.id}`}
                          className="w-6"
                        >
                          {option.id})
                        </Label>
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          disabled={question.options.length <= 2}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    name="explanation"
                    value={question.explanation}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleSaveQuestion}
                  className="w-full"
                >
                  Save Question to Database
                </Button>
              </div>
              
              {showPreview && (
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Preview</h3>
                  <MultipleChoiceQuestion
                    questionId="preview"
                    questionText={question.questionText}
                    options={question.options}
                    correctOptionId={question.correctOptionId}
                    explanation={question.explanation}
                    showFeedback={true}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <DynamicQuestionExample
              courseId={courseId}
              assessmentId="dynamic-test-1"
            />
          </TabsContent>
          
          <TabsContent value="database">
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h3 className="font-medium text-blue-800 mb-2">Database Management</h3>
              <p className="text-blue-700 text-sm">
                From here, staff can directly access the database to manage question banks,
                test new question types, and manage course content.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Question Banks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm mb-4">
                    This will be populated with the question banks for this course.
                  </p>
                  <Button variant="outline">Load Question Banks</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Database Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Course ID:</span>
                      <span className="font-medium">{courseId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Staff User:</span>
                      <span className="font-medium">{currentUser?.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Access Level:</span>
                      <span className="font-medium">Read/Write</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuestionDevelopmentSandbox;