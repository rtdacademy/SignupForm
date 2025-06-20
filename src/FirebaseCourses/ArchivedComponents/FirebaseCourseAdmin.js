import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { FaPlus, FaSave, FaArrowLeft, FaQuestion, FaListAlt } from 'react-icons/fa';

/**
 * Admin interface for managing Firebase courses
 */
const FirebaseCourseAdmin = () => {
  const { courseId } = useParams();
  const { isStaff, hasSuperAdminAccess } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [questionBanks, setQuestionBanks] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    stem: '',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' }
    ],
    correctOptionId: '',
    explanation: '',
    difficulty: 1,
    tags: []
  });
  const [selectedBankId, setSelectedBankId] = useState('');
  const [bankName, setBankName] = useState('');

  // Load course data and question banks
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const db = getDatabase();
        
        // Load course data
        const courseRef = ref(db, `courses/${courseId}`);
        const courseSnapshot = await get(courseRef);
        
        if (courseSnapshot.exists()) {
          setCourse(courseSnapshot.val());
        } else {
          console.error('Course not found');
        }
        
        // Load question banks for this course
        const questionBanksRef = ref(db, `courses/${courseId}/questionBanks`);
        const banksSnapshot = await get(questionBanksRef);
        
        if (banksSnapshot.exists()) {
          const banks = banksSnapshot.val();
          const banksList = Object.keys(banks).map(id => ({
            id,
            name: banks[id].name || id,
            questions: banks[id].questions ? Object.keys(banks[id].questions).length : 0
          }));
          setQuestionBanks(banksList);
          
          if (banksList.length > 0) {
            setSelectedBankId(banksList[0].id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading course data:', error);
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId]);

  // Handle adding a new question bank
  const handleAddQuestionBank = async () => {
    if (!bankName.trim()) return;
    
    try {
      const db = getDatabase();
      const newBankId = `bank_${Date.now()}`;
      const bankRef = ref(db, `courses/${courseId}/questionBanks/${newBankId}`);
      
      await set(bankRef, {
        name: bankName,
        created: new Date().toISOString()
      });
      
      setQuestionBanks([
        ...questionBanks,
        { id: newBankId, name: bankName, questions: 0 }
      ]);
      
      setSelectedBankId(newBankId);
      setBankName('');
    } catch (error) {
      console.error('Error creating question bank:', error);
    }
  };

  // Handle option change in question editor
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index].text = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  // Handle saving the current question
  const handleSaveQuestion = async () => {
    if (!currentQuestion.stem || !currentQuestion.correctOptionId) {
      alert('Please provide a question and select a correct answer');
      return;
    }
    
    try {
      const db = getDatabase();
      const questionId = `q_${Date.now()}`;
      const questionRef = ref(db, `courses/${courseId}/questionBanks/${selectedBankId}/questions/${questionId}`);
      
      await set(questionRef, {
        ...currentQuestion,
        created: new Date().toISOString()
      });
      
      // Update question count in the UI
      setQuestionBanks(questionBanks.map(bank => 
        bank.id === selectedBankId 
          ? { ...bank, questions: bank.questions + 1 }
          : bank
      ));
      
      // Reset form
      setCurrentQuestion({
        stem: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' }
        ],
        correctOptionId: '',
        explanation: '',
        difficulty: 1,
        tags: []
      });
      
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="mr-4"
        >
          <FaArrowLeft className="mr-2" /> Back to Courses
        </Button>
        <h1 className="text-2xl font-bold">Firebase Course Management</h1>
      </div>
      
      {course && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{course.Title || `Course #${courseId}`}</CardTitle>
              <CardDescription>
                {course.description || 'No description available'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Course Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic information about the course</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Course ID: {courseId}</p>
              <p>Title: {course?.Title || 'No title'}</p>
              <p>Firebase Course: {course?.firebaseCourse ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Question Banks Panel */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Question Banks</span>
                  <FaListAlt />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <Input 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="New bank name"
                    />
                    <Button onClick={handleAddQuestionBank}>
                      <FaPlus className="mr-2" /> Add
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {questionBanks.length > 0 ? (
                      questionBanks.map(bank => (
                        <div 
                          key={bank.id}
                          className={`p-3 rounded-md border cursor-pointer ${
                            selectedBankId === bank.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                          }`}
                          onClick={() => setSelectedBankId(bank.id)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bank.name}</span>
                            <span className="text-gray-500 text-sm">{bank.questions} questions</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">No question banks yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Question Editor */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Question Editor</span>
                  <FaQuestion />
                </CardTitle>
                <CardDescription>
                  {selectedBankId 
                    ? `Creating question for: ${questionBanks.find(b => b.id === selectedBankId)?.name}`
                    : 'Select a question bank first'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBankId ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question-text">Question</Label>
                      <Textarea 
                        id="question-text"
                        value={currentQuestion.stem}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, stem: e.target.value})}
                        placeholder="Enter the question text"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-3 mt-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-3">
                            <input 
                              type="radio"
                              id={`option-${option.id}`}
                              name="correctOption"
                              checked={currentQuestion.correctOptionId === option.id}
                              onChange={() => setCurrentQuestion({...currentQuestion, correctOptionId: option.id})}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`option-${option.id}`} className="w-6">{option.id})</Label>
                            <Input 
                              value={option.text}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${option.id}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea 
                        id="explanation"
                        value={currentQuestion.explanation}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                        placeholder="Explain why the correct answer is correct"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Input 
                        id="difficulty"
                        type="number"
                        min={1}
                        max={5}
                        value={currentQuestion.difficulty}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, difficulty: parseInt(e.target.value)})}
                        className="w-20 mt-1"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button onClick={handleSaveQuestion} className="w-full">
                        <FaSave className="mr-2" /> Save Question
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    Please select or create a question bank to add questions
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Answer data is secured using Firebase security rules. Students can only access their own answers
                and cannot view correct answers until after submission.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseCourseAdmin;