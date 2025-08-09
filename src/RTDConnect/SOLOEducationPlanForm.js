import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { FileText, CheckCircle2, AlertCircle, AlertTriangle, GraduationCap, Calendar, X, Loader2, ChevronDown, Plus, Download, Save, BookOpen, Expand } from 'lucide-react';
import { getFacilitatorDropdownOptions, isValidFacilitator } from '../config/facilitators';
import { getEdmontonTimestamp, formatEdmontonTimestamp, toDateString, toEdmontonDate } from '../utils/timeZoneUtils';
import { FUNDING_RATES } from '../config/HomeEducation';
import { getCurrentSchoolYear } from '../config/importantDates';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';
import AlbertaCourseSelection from '../components/AlbertaCourseSelection';
import { getAlbertaCourseById } from '../config/albertaCourses';

const FormField = ({ label, error, children, required = false, description = null }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-sm text-gray-600">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const ExpandableActivityGroup = ({ 
  label, 
  options, 
  selectedValues, 
  activityDescriptions, 
  customActivities,
  onSelectionChange, 
  onDescriptionChange,
  onAddCustomActivity,
  onRemoveCustomActivity,
  required = false, 
  description = null 
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customActivityName, setCustomActivityName] = useState('');

  const handleAddCustomActivity = () => {
    if (customActivityName.trim()) {
      const customKey = `custom_${Date.now()}`;
      onAddCustomActivity(customKey, customActivityName.trim());
      
      // Auto-select the newly created custom activity
      onSelectionChange([...selectedValues, customKey]);
      
      setCustomActivityName('');
      setShowCustomInput(false);
    }
  };

  return (
    <FormField label={label} required={required} description={description}>
      <div className="space-y-3">
        {/* Predefined options */}
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <div key={option.value} className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange([...selectedValues, option.value]);
                      // Set starter text immediately when checked
                      if (!activityDescriptions[option.value] || activityDescriptions[option.value].trim() === '') {
                        onDescriptionChange(option.value, option.starterText);
                      }
                    } else {
                      onSelectionChange(selectedValues.filter(v => v !== option.value));
                    }
                  }}
                  className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
              </label>
              
              {/* Expandable description textarea */}
              {isSelected && (
                <div className="mt-3 ml-7">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    How will this method support your child's learning?
                  </label>
                  <textarea
                    value={activityDescriptions[option.value] || ''}
                    onChange={(e) => onDescriptionChange(option.value, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    rows={4}
                    placeholder="Describe how this activity will support learning..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: You can edit the suggested text above or write your own description.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Custom activities */}
        {customActivities.map((customActivity) => {
          const isSelected = selectedValues.includes(customActivity.key);
          return (
            <div key={customActivity.key} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange([...selectedValues, customActivity.key]);
                      // Set starter text for custom activities
                      if (!activityDescriptions[customActivity.key] || activityDescriptions[customActivity.key].trim() === '') {
                        onDescriptionChange(customActivity.key, `We will use ${customActivity.name.toLowerCase()} to support our child's learning. This activity will help develop specific skills and knowledge relevant to our educational goals.`);
                      }
                    } else {
                      onSelectionChange(selectedValues.filter(v => v !== customActivity.key));
                    }
                  }}
                  className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{customActivity.name}</span>
                  <span className="text-xs text-purple-600 ml-2">(Custom)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCustomActivity(customActivity.key)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </label>
              
              {/* Expandable description textarea for custom activities */}
              {isSelected && (
                <div className="mt-3 ml-7">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    How will this method support your child's learning?
                  </label>
                  <textarea
                    value={activityDescriptions[customActivity.key] || ''}
                    onChange={(e) => onDescriptionChange(customActivity.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    rows={4}
                    placeholder="Describe how this custom activity will support learning..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe your custom learning method and how it supports your educational goals.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Add custom activity section */}
        {!showCustomInput ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center">
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Activity</span>
            </button>
          </div>
        ) : (
          <div className="border border-purple-300 rounded-lg p-3 bg-purple-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Your Own Activity or Method
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomActivity();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Enter custom activity name..."
              />
              <button
                type="button"
                onClick={handleAddCustomActivity}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomActivityName('');
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
};

const CheckboxGroup = ({ label, options, values, onChange, required = false, description = null }) => (
  <FormField label={label} required={required} description={description}>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...values, option.value]);
              } else {
                onChange(values.filter(v => v !== option.value));
              }
            }}
            className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <div className="flex-1">
            <span className="text-sm text-gray-900">{option.label}</span>
            {option.description && (
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  </FormField>
);

// Helper function to determine the target school year for SOLO planning
const getTargetSchoolYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // If it's September (9) or October (10), plan for current school year
  // Otherwise, plan for next school year
  if (currentMonth === 9 || currentMonth === 10) {
    return getCurrentSchoolYear();
  } else {
    // Get next school year
    const currentSchoolYear = getCurrentSchoolYear();
    const startYear = parseInt('20' + currentSchoolYear.substr(0, 2));
    const nextStartYear = startYear + 1;
    return `${nextStartYear.toString().substr(-2)}/${(nextStartYear + 1).toString().substr(-2)}`;
  }
};

const SOLOEducationPlanForm = ({ isOpen, onOpenChange, student, familyId, schoolYear, selectedFacilitator = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentLastName: '',
    studentFirstName: '',
    grade: '',
    facilitatorName: '',
    conductingPersonName: '',
    activitiesAndMethods: [],
    activityDescriptions: {},
    customActivities: [],
    assessmentMethods: [],
    assessmentDescriptions: {},
    customAssessments: [],
    resourcesAndMaterials: [],
    resourceDescriptions: {},
    customResources: [],
    followAlbertaPrograms: false,
    selectedAlbertaCourses: {},
    otherCourses: [],
    acknowledgementRead: false,
    todaysDate: toDateString(new Date())
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [familyGuardians, setFamilyGuardians] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState(null);

  // Activity and method options with starter text
  const activityOptions = [
    { 
      value: 'self_directed', 
      label: 'Self-directed exploration',
      starterText: 'My child will pursue topics of personal interest through independent research and exploration. This approach develops critical thinking skills, fosters natural curiosity, and allows learning to follow the child\'s intrinsic motivation. They will set learning goals, manage their time, and take ownership of their educational journey.'
    },
    { 
      value: 'experiential', 
      label: 'Experiential learning / Field trips',
      starterText: 'We will provide hands-on learning experiences through field trips to museums, historical sites, nature centers, and community organizations. These real-world experiences help make abstract concepts concrete, enhance understanding through multiple senses, and connect classroom learning to practical applications.'
    },
    { 
      value: 'discussion_groups', 
      label: 'Discussion groups / Collaboration projects / Learning Pods',
      starterText: 'My child will participate in discussion groups and collaborative learning with peers. This develops communication skills, exposes them to different perspectives, and teaches teamwork. Group projects will encourage sharing of ideas and collaborative problem-solving skills.'
    },
    { 
      value: 'games', 
      label: 'Playing games',
      starterText: 'Educational games will be used to make learning engaging and fun. Games help develop strategic thinking, problem-solving skills, and can reinforce academic concepts in an enjoyable way. This includes board games, educational video games, and learning-based activities.'
    },
    { 
      value: 'direct_instruction', 
      label: 'Direct instruction',
      starterText: 'I will provide structured lessons and direct teaching when my child needs focused instruction on specific concepts. This ensures core skills are properly taught and understood, provides clear explanations of complex topics, and gives immediate feedback and guidance.'
    },
    { 
      value: 'research', 
      label: 'Research / Experiments',
      starterText: 'My child will conduct research projects and hands-on experiments to explore topics in depth. This develops research skills, scientific thinking, and the ability to gather and analyze information from multiple sources. Experiments will reinforce scientific concepts through practical application.'
    },
    { 
      value: 'volunteering', 
      label: 'Volunteering / Job opportunities',
      starterText: 'Community service and work opportunities will provide real-world learning experiences. This develops social responsibility, work ethic, and practical life skills while contributing to the community. These experiences will connect academic learning to meaningful service.'
    },
    { 
      value: 'worksheets', 
      label: 'Using worksheets / Workbooks / Textbooks',
      starterText: 'Structured materials such as worksheets, workbooks, and textbooks will provide systematic coverage of core subjects. These resources ensure comprehensive learning, provide practice opportunities, and offer clear progression through curriculum standards and learning objectives.'
    },
    { 
      value: 'media', 
      label: 'Engaging with Media (watching documentaries, videos, listening to audiobooks, podcasts...)',
      starterText: 'Educational media will supplement learning through documentaries, educational videos, audiobooks, and podcasts. This accommodates different learning styles, provides expert instruction from various sources, and makes learning accessible and engaging through multimedia approaches.'
    },
    { 
      value: 'in_person', 
      label: 'In-person courses / Tutoring / Lessons',
      starterText: 'My child will participate in structured classes, tutoring sessions, or specialized lessons taught by qualified instructors. This provides expert instruction in specific subjects, social interaction with peers, and access to specialized equipment or facilities not available at home.'
    },
    { 
      value: 'online_courses', 
      label: 'Taking online courses',
      starterText: 'Online courses will provide structured learning opportunities and access to specialized subjects. This offers flexibility in scheduling, access to expert instructors globally, and exposure to digital learning platforms that prepare students for modern educational environments.'
    }
  ];

  const assessmentOptions = [
    { 
      value: 'portfolio', 
      label: 'Dated portfolio of work / Projects completed',
      starterText: 'We will maintain a portfolio with dated samples of completed work and projects. This will include examples from all core subjects, showing progression over time. The portfolio will demonstrate skill development and learning achievements across different topics and will be organized chronologically to track growth throughout the school year.'
    },
    { 
      value: 'multimedia', 
      label: 'Videos / Photos / Multi-media presentation',
      starterText: 'We will document learning through videos, photos, and multimedia presentations. This includes recording presentations, capturing hands-on learning activities, field trip experiences, and project demonstrations. These visual records will showcase practical application of knowledge and provide evidence of engagement and understanding.'
    },
    { 
      value: 'journal', 
      label: 'Journal records / Descriptive reports',
      starterText: 'We will maintain detailed journal records and descriptive reports of learning activities and progress. This includes daily or weekly learning logs, reflective writing about experiences, and narrative reports describing skill development and knowledge acquisition in various subject areas.'
    },
    { 
      value: 'observation', 
      label: 'Parent observation',
      starterText: 'I will conduct regular observations of my child\'s learning and document their progress through detailed notes. This includes observing problem-solving approaches, social interactions during group activities, skill demonstrations, and noting areas of strength and growth in both academic and personal development.'
    },
    { 
      value: 'application', 
      label: 'Application of skills learned / Demonstration',
      starterText: 'My child will demonstrate learned skills through practical application and real-world scenarios. This includes showing math skills through everyday problem-solving, applying reading comprehension through discussions, demonstrating scientific understanding through experiments, and using knowledge in practical situations.'
    },
    { 
      value: 'certificates', 
      label: 'Course certificates',
      starterText: 'We will obtain certificates from completed courses, workshops, and educational programs. This includes online course completions, community education programs, skill-based workshops, and specialized training that complements our home education program and provides external validation of learning.'
    },
    { 
      value: 'tests', 
      label: 'Dated quizzes / Exams / Standardized tests / Chapter questions',
      starterText: 'We will use various forms of testing to assess understanding and knowledge retention. This includes curriculum-based quizzes, chapter review questions, practice exams, and age-appropriate standardized assessments. All tests will be dated and results recorded to track progress over time.'
    }
  ];

  const resourceOptions = [
    { 
      value: 'internet', 
      label: 'Internet (50% of monthly fee from Sept. to end of Aug.)',
      starterText: 'Internet access is essential for our home education program, providing access to online educational resources, virtual field trips, educational videos, research materials, and communication with facilitators and educational communities. We use it for curriculum delivery, assessment tools, and accessing digital libraries.'
    },
    { 
      value: 'books', 
      label: 'Books / Novels',
      starterText: 'We will use a variety of books and novels to support literacy development and subject-specific learning. This includes grade-appropriate fiction and non-fiction texts, reference books, and literature that enhances our curriculum across all subject areas and supports independent reading goals.'
    },
    { 
      value: 'field_trips', 
      label: 'Field trips / Admissions (max. 50% of funding)',
      starterText: 'Field trips and educational site visits provide hands-on learning experiences that complement our curriculum. We plan visits to museums, science centers, historical sites, nature centers, and cultural venues that directly support our learning objectives and provide real-world context for academic subjects.'
    },
    { 
      value: 'art_supplies', 
      label: 'Art / Craft supplies and equipment (e.g. sewing machine, camera)',
      starterText: 'Art and craft supplies support creative expression and hands-on learning across multiple subjects. These materials enable visual arts education, design projects, and creative activities that enhance learning in history, science, and language arts while developing fine motor skills and creativity.'
    },
    { 
      value: 'science_supplies', 
      label: 'Science supplies and equipment (e.g., microscopes, telescopes, kits)',
      starterText: 'Science equipment and supplies are essential for hands-on exploration and experimentation. This includes lab materials, microscopes, measuring tools, and experiment kits that allow us to conduct investigations, make observations, and apply scientific methods in our studies of biology, chemistry, physics, and earth sciences.'
    },
    { 
      value: 'workbooks', 
      label: 'Workbooks / Textbooks / Curriculum',
      starterText: 'Curriculum materials, workbooks, and textbooks provide structured learning content and practice opportunities. These resources ensure comprehensive coverage of core subjects and provide age-appropriate exercises, explanations, and assessments that support systematic skill development.'
    },
    { 
      value: 'tutoring', 
      label: 'Tutoring (group of individual lessons necessary for the student\'s program delivered by a subject matter expert who is not an immediate family member)',
      starterText: 'Professional tutoring provides specialized instruction in areas where expert knowledge is beneficial. This includes subject-specific tutoring in advanced mathematics, sciences, languages, or specialized skills that enhance our home education program and provide additional learning support.'
    },
    { 
      value: 'lessons', 
      label: 'Lessons (including but not limited to, music, swimming, and language lessons taught by a certified instructor)',
      starterText: 'Professional lessons provide structured instruction in specialized areas such as music, physical education, arts, or language learning. These lessons are taught by certified instructors and complement our home education program by providing expert instruction and skill development opportunities.'
    },
    { 
      value: 'games_puzzles', 
      label: 'Games / Puzzles / Manipulatives / Learning Aids',
      starterText: 'Educational games, puzzles, and manipulatives make learning engaging while developing critical thinking and problem-solving skills. These hands-on materials support mathematics, logic, spatial reasoning, and strategic thinking while making abstract concepts more concrete and enjoyable.'
    },
    { 
      value: 'online_courses_resource', 
      label: 'Online Courses',
      starterText: 'Online courses provide access to specialized subjects and expert instruction that complements our home education program. These structured digital learning experiences offer interactive content, assessments, and certification in specific subject areas or skill development.'
    },
    { 
      value: 'technology', 
      label: 'Computers / Technology ie. printers, computers, tablets',
      starterText: 'Technology equipment supports digital literacy and provides access to educational software, online resources, and creative tools. Computers, tablets, and peripheral devices enable research, content creation, programming, and digital communication skills essential for modern education.'
    },
    { 
      value: 'pe_equipment', 
      label: 'Phys Ed Equipment',
      starterText: 'Physical education equipment supports health and fitness goals and provides opportunities for skill development in various sports and physical activities. This includes sports equipment, fitness tools, and activity gear that promotes active lifestyle and physical literacy.'
    },
    { 
      value: 'instruments', 
      label: 'Musical Instruments',
      starterText: 'Musical instruments support music education and creative development. Learning to play instruments enhances cognitive development, provides artistic expression opportunities, and develops discipline and coordination while fostering appreciation for music and cultural arts.'
    },
    { 
      value: 'home_ec', 
      label: 'Home Economic Edibles (groceries used for children\'s cooking and baking projects)',
      starterText: 'Home economics supplies and edible materials support practical life skills education through cooking and baking projects. These activities teach nutrition, measurement, following instructions, food safety, and practical math applications while developing independence and life skills.'
    }
  ];

  // Initialize form data when student changes
  useEffect(() => {
    if (student && isOpen) {
      setFormData(prev => ({
        ...prev,
        studentLastName: student.lastName || '',
        studentFirstName: student.firstName || '',
        grade: student.grade || '',
        facilitatorName: selectedFacilitator?.name || prev.facilitatorName || ''
      }));
      loadExistingPlan();
      loadFamilyGuardians();
    }
  }, [student, isOpen, selectedFacilitator]);

  const loadFamilyGuardians = async () => {
    if (!familyId) return;

    try {
      const db = getDatabase();
      const guardiansRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/guardians`);
      const snapshot = await get(guardiansRef);

      if (snapshot.exists()) {
        const guardiansData = snapshot.val();
        const guardiansList = Object.values(guardiansData).map(guardian => ({
          id: guardian.emailKey || guardian.email,
          name: `${guardian.firstName} ${guardian.lastName}`,
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          email: guardian.email,
          guardianType: guardian.guardianType,
          relationToStudents: guardian.relationToStudents || 'Guardian'
        }));
        setFamilyGuardians(guardiansList);
      }
    } catch (error) {
      console.error('Error loading family guardians:', error);
    }
  };

  const loadExistingPlan = async () => {
    if (!student || !familyId || !schoolYear) return;

    setIsLoading(true);
    try {
      const db = getDatabase();
      const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
      const snapshot = await get(planRef);

      if (snapshot.exists()) {
        const existingPlan = snapshot.val();
        
        // Data migration: Convert old string format to new structured format
        let migratedPlan = { ...existingPlan };
        
        // Check if otherAlbertaCourses is a string (old format) and migrate it
        if (typeof existingPlan.otherAlbertaCourses === 'string' && existingPlan.otherAlbertaCourses.trim()) {
          const otherCoursesText = existingPlan.otherAlbertaCourses.trim();
          
          // Convert string to structured format
          const migratedCourses = otherCoursesText.split('\n')
            .filter(line => line.trim())
            .map((line, index) => ({
              id: `migrated_course_${Date.now()}_${index}`,
              courseName: line.trim(),
              courseCode: '',
              grade: '',
              credits: '',
              forCredit: true, // default assumption
              category: 'Other',
              description: ''
            }));
          
          migratedPlan.otherCourses = migratedCourses;
          
          // Save the migrated data back to Firebase
          const db = getDatabase();
          const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
          await set(planRef, migratedPlan);
          
          console.log('Migrated other courses from string to structured format');
        }
        
        // Ensure otherCourses exists and is an array
        if (!migratedPlan.otherCourses || !Array.isArray(migratedPlan.otherCourses)) {
          migratedPlan.otherCourses = [];
        }
        
        setFormData(prev => ({
          ...prev,
          ...migratedPlan
        }));
        setExistingSubmission(migratedPlan);
      }
    } catch (error) {
      console.error('Error loading existing SOLO plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate facilitator if not pre-selected
    if (!selectedFacilitator) {
      if (!formData.facilitatorName.trim()) {
        newErrors.facilitatorName = 'Please select a facilitator';
      } else if (!isValidFacilitator(formData.facilitatorName)) {
        newErrors.facilitatorName = 'Please select a valid facilitator from the list';
      }
    }

    if (!formData.conductingPersonName.trim()) {
      newErrors.conductingPersonName = 'Name of person conducting the program is required';
    }

    if (formData.activitiesAndMethods.length === 0) {
      newErrors.activitiesAndMethods = 'Please select at least one activity or method';
    }

    // Validate that selected activities have descriptions
    const missingDescriptions = formData.activitiesAndMethods.filter(activity => 
      !formData.activityDescriptions[activity] || !formData.activityDescriptions[activity].trim()
    );
    
    if (missingDescriptions.length > 0) {
      newErrors.activityDescriptions = 'Please provide descriptions for all selected activities';
    }

    if (formData.assessmentMethods.length === 0) {
      newErrors.assessmentMethods = 'Please select at least one assessment method';
    }

    // Validate that selected assessments have descriptions
    const missingAssessmentDescriptions = formData.assessmentMethods.filter(assessment => 
      !formData.assessmentDescriptions[assessment] || !formData.assessmentDescriptions[assessment].trim()
    );
    
    if (missingAssessmentDescriptions.length > 0) {
      newErrors.assessmentDescriptions = 'Please provide descriptions for all selected assessment methods';
    }

    if (formData.resourcesAndMaterials.length === 0) {
      newErrors.resourcesAndMaterials = 'Please select at least one resource';
    }

    // Validate that selected resources have descriptions
    const missingResourceDescriptions = formData.resourcesAndMaterials.filter(resource => 
      !formData.resourceDescriptions[resource] || !formData.resourceDescriptions[resource].trim()
    );
    
    if (missingResourceDescriptions.length > 0) {
      newErrors.resourceDescriptions = 'Please provide descriptions for all selected resources';
    }

    if (!formData.acknowledgementRead) {
      newErrors.acknowledgementRead = 'You must acknowledge reading and understanding the resource information';
    }

    if (!formData.todaysDate) {
      newErrors.todaysDate = 'Please enter today\'s date';
    }

    return newErrors;
  };

  // Generate PDF for SOLO Education Plan
  const generateSOLOPlanPDF = async (planData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Document Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Program Plan', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`School Year: ${planData.schoolYear}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Student Information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information', 20, yPosition);
      yPosition += 8;

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: [
          ['Student Name', `${planData.studentFirstName} ${planData.studentLastName}`],
          ['Grade', planData.grade],
          ['Alberta Student Number', planData.studentAsn || 'Not provided'],
          ['Facilitator Name', planData.facilitatorName],
          ['Person Conducting Program', planData.conductingPersonName],
          ['Plan Date', planData.todaysDate]
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 110 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Activities and Methods Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Activities and Methods', 20, yPosition);
      yPosition += 8;

      if (planData.activitiesAndMethods.length > 0) {
        const activityData = planData.activitiesAndMethods.map(activityKey => {
          const activity = [...activityOptions, ...planData.customActivities].find(a => a.value === activityKey || a.key === activityKey);
          const description = planData.activityDescriptions[activityKey] || '';
          const activityName = activity ? (activity.label || activity.name) : activityKey;
          return [activityName, description || 'No description provided'];
        });

        doc.autoTable({
          startY: yPosition,
          head: [['Activity/Method', 'Description']],
          body: activityData,
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
          },
          headStyles: { 
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 120 }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No activities selected', 20, yPosition);
        yPosition += 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Assessment Methods Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Assessment Methods', 20, yPosition);
      yPosition += 8;

      if (planData.assessmentMethods.length > 0) {
        const assessmentData = planData.assessmentMethods.map(assessmentKey => {
          const assessment = [...assessmentOptions, ...planData.customAssessments].find(a => a.value === assessmentKey || a.key === assessmentKey);
          const description = planData.assessmentDescriptions[assessmentKey] || '';
          const assessmentName = assessment ? (assessment.label || assessment.name) : assessmentKey;
          return [assessmentName, description || 'No description provided'];
        });

        doc.autoTable({
          startY: yPosition,
          head: [['Assessment Method', 'Description']],
          body: assessmentData,
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
          },
          headStyles: { 
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 120 }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No assessment methods selected', 20, yPosition);
        yPosition += 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Alberta Programs of Study Section (if enabled)
      if (planData.followAlbertaPrograms && (
        (planData.selectedAlbertaCourses && Object.keys(planData.selectedAlbertaCourses).length > 0) ||
        (planData.otherCourses && planData.otherCourses.length > 0)
      )) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Alberta Programs of Study Course Selections', 20, yPosition);
        yPosition += 8;

        const albertaCourseData = [];
        
        // Add selected courses from each subject
        if (planData.selectedAlbertaCourses) {
          Object.entries(planData.selectedAlbertaCourses).forEach(([subjectKey, courseIds]) => {
            if (courseIds && courseIds.length > 0) {
              courseIds.forEach(courseId => {
                const course = getAlbertaCourseById(courseId);
                if (course) {
                  albertaCourseData.push([
                    course.name,
                    course.code || 'N/A',
                    course.grade.toString(),
                    course.credits.toString()
                  ]);
                }
              });
            }
          });
        }

        if (albertaCourseData.length > 0) {
          doc.autoTable({
            startY: yPosition,
            head: [['Course Name', 'Course Code', 'Grade', 'Credits']],
            body: albertaCourseData,
            styles: { 
              fontSize: 8,
              cellPadding: 3,
              lineColor: [0, 0, 0],
              lineWidth: 0.5
            },
            headStyles: { 
              fillColor: [230, 230, 230],
              textColor: [0, 0, 0],
              fontStyle: 'bold'
            },
            columnStyles: {
              0: { cellWidth: 80 },
              1: { cellWidth: 30 },
              2: { cellWidth: 20 },
              3: { cellWidth: 20 }
            },
            margin: { left: 20, right: 20 }
          });

          yPosition = doc.lastAutoTable.finalY + 15;
        }

        // Add other courses if specified
        if (planData.otherCourses && planData.otherCourses.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Other Courses:', 20, yPosition);
          yPosition += 8;

          const otherCourseData = planData.otherCourses.map(course => [
            course.courseName,
            course.courseCode || 'N/A',
            course.grade || 'N/A',
            course.credits || 'N/A',
            course.forCredit ? 'Yes' : 'No',
            course.category || 'Other'
          ]);

          doc.autoTable({
            startY: yPosition,
            head: [['Course Name', 'Code', 'Grade', 'Credits', 'For Credit', 'Category']],
            body: otherCourseData,
            styles: { 
              fontSize: 8,
              cellPadding: 2,
              lineColor: [0, 0, 0],
              lineWidth: 0.5
            },
            headStyles: { 
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: 'bold'
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: 25 },
              2: { cellWidth: 20 },
              3: { cellWidth: 20 },
              4: { cellWidth: 20 },
              5: { cellWidth: 25 }
            },
            margin: { left: 20, right: 20 }
          });

          yPosition = doc.lastAutoTable.finalY + 15;

          // Add course descriptions if any courses have descriptions
          const coursesWithDescriptions = planData.otherCourses.filter(course => 
            course.description && course.description.trim()
          );
          
          if (coursesWithDescriptions.length > 0) {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Course Descriptions:', 20, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            coursesWithDescriptions.forEach(course => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
              }

              doc.setFont('helvetica', 'bold');
              doc.text(`${course.courseName}:`, 20, yPosition);
              yPosition += 4;

              doc.setFont('helvetica', 'normal');
              const splitDescription = doc.splitTextToSize(course.description, pageWidth - 40);
              doc.text(splitDescription, 20, yPosition);
              yPosition += splitDescription.length * 4 + 6;
            });

            yPosition += 10;
          }
        }

        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }
      }

      // Resources and Materials Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resources and Materials', 20, yPosition);
      yPosition += 8;

      if (planData.resourcesAndMaterials.length > 0) {
        const resourceData = planData.resourcesAndMaterials.map(resourceKey => {
          const resource = [...resourceOptions, ...planData.customResources].find(r => r.value === resourceKey || r.key === resourceKey);
          const description = planData.resourceDescriptions[resourceKey] || '';
          const resourceName = resource ? (resource.label || resource.name) : resourceKey;
          return [resourceName, description || 'No description provided'];
        });

        doc.autoTable({
          startY: yPosition,
          head: [['Resource/Material', 'Description']],
          body: resourceData,
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
          },
          headStyles: { 
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 120 }
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No resources selected', 20, yPosition);
        yPosition += 15;
      }

      // Footer
      doc.setFontSize(8);
      doc.text(`Family ID: ${planData.familyId}`, 20, pageHeight - 20);
      doc.text(`Student ID: ${planData.studentId}`, 20, pageHeight - 15);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 10);

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Save PDF to Firebase Storage
  const savePDFToStorage = async (pdfDoc, planData) => {
    try {
      const timestamp = Date.now();
      const filename = `solo_plan_${timestamp}_${planData.familyId}_${planData.studentId}.pdf`;
      const pdfBlob = pdfDoc.output('blob');
      
      const storage = getStorage();
      const fileRef = storageRef(storage, `rtdAcademy/homeEducationForms/${planData.familyId}/${planData.schoolYear.replace('/', '_')}/${planData.studentId}/${filename}`);
      
      const snapshot = await uploadBytes(fileRef, pdfBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        filename,
        generatedAt: timestamp,
        size: pdfBlob.size
      };
    } catch (error) {
      console.error('Error saving PDF to storage:', error);
      throw error;
    }
  };

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      
      const planData = {
        ...formData,
        studentId: student.id,
        studentAsn: student.asn,
        familyId,
        schoolYear
      };

      const pdfDoc = await generateSOLOPlanPDF(planData);
      pdfDoc.save(`Program_Plan_${schoolYear}_${student.firstName}_${student.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const planData = {
        ...formData,
        studentId: student.id,
        studentAsn: student.asn,
        familyId,
        schoolYear,
        submissionStatus: 'submitted',
        submittedAt: getEdmontonTimestamp(),
        submittedBy: user.uid,
        lastUpdated: getEdmontonTimestamp()
      };

      // Generate PDF
      setGeneratingPDF(true);
      const pdfDoc = await generateSOLOPlanPDF(planData);
      
      // Save PDF to cloud storage
      const pdfInfo = await savePDFToStorage(pdfDoc, planData);
      
      // Add PDF info to plan data
      planData.pdfVersions = [
        ...(existingSubmission?.pdfVersions || []),
        {
          ...pdfInfo,
          version: (existingSubmission?.pdfVersions?.length || 0) + 1
        }
      ];

      // Add submission status
      planData.submissionCompletedAt = getEdmontonTimestamp();

      // Save to database
      const db = getDatabase();
      const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
      await set(planRef, planData);

      toast.success('Program Plan submitted successfully!', {
        description: `Plan for ${student.firstName} ${student.lastName} has been completed and saved. You can download the PDF anytime from your dashboard.`
      });

      setExistingSubmission(planData);
      
      // Close the form
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting SOLO plan:', error);
      setErrors({ submit: 'Failed to submit education plan. Please try again.' });
      toast.error('Failed to submit plan. Please try again.');
    } finally {
      setIsSubmitting(false);
      setGeneratingPDF(false);
    }
  };

  const handleInputChange = async (field, value) => {
    // Update local state immediately for responsive UI
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Save to Firebase immediately if auto-save is enabled
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        // Create the complete data object with the new field value
        const updatedData = {
          ...formData,
          [field]: value, // Use the new value for this field
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved field: ${field}`);
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    }
  };

  const handleActivityDescriptionChange = async (activityValue, description) => {
    const updatedDescriptions = {
      ...formData.activityDescriptions,
      [activityValue]: description
    };
    
    setFormData(prev => ({ 
      ...prev, 
      activityDescriptions: updatedDescriptions 
    }));
    
    // Clear any description errors
    if (errors.activityDescriptions) {
      setErrors(prev => ({ ...prev, activityDescriptions: '' }));
    }
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          activityDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved activity description: ${activityValue}`);
      } catch (error) {
        console.error('Error auto-saving activity description:', error);
      }
    }
  };

  const handleAddCustomActivity = async (customKey, activityName) => {
    const newCustomActivity = {
      key: customKey,
      name: activityName
    };
    
    const updatedCustomActivities = [...formData.customActivities, newCustomActivity];
    
    setFormData(prev => ({
      ...prev,
      customActivities: updatedCustomActivities
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customActivities: updatedCustomActivities,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved custom activity: ${activityName}`);
      } catch (error) {
        console.error('Error auto-saving custom activity:', error);
      }
    }
  };

  const handleRemoveCustomActivity = async (customKey) => {
    const updatedCustomActivities = formData.customActivities.filter(activity => activity.key !== customKey);
    const updatedSelectedValues = formData.activitiesAndMethods.filter(value => value !== customKey);
    const updatedDescriptions = { ...formData.activityDescriptions };
    delete updatedDescriptions[customKey];
    
    setFormData(prev => ({
      ...prev,
      customActivities: updatedCustomActivities,
      activitiesAndMethods: updatedSelectedValues,
      activityDescriptions: updatedDescriptions
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customActivities: updatedCustomActivities,
          activitiesAndMethods: updatedSelectedValues,
          activityDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved removal of custom activity: ${customKey}`);
      } catch (error) {
        console.error('Error auto-saving custom activity removal:', error);
      }
    }
  };

  const handleConductingPersonChange = async (value) => {
    let newValue = '';
    
    if (value === 'custom') {
      setShowCustomInput(true);
      newValue = '';
    } else if (value === '') {
      setShowCustomInput(false);
      newValue = '';
    } else {
      setShowCustomInput(false);
      newValue = value;
    }
    
    setFormData(prev => ({ ...prev, conductingPersonName: newValue }));
    
    if (errors.conductingPersonName) {
      setErrors(prev => ({ ...prev, conductingPersonName: '' }));
    }
    
    // Auto-save immediately
    if (autoSaveEnabled && student && familyId && schoolYear && value !== 'custom') {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          conductingPersonName: newValue,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log('Auto-saved conducting person');
      } catch (error) {
        console.error('Error auto-saving conducting person:', error);
      }
    }
  };

  const handleAssessmentDescriptionChange = async (assessmentValue, description) => {
    const updatedDescriptions = {
      ...formData.assessmentDescriptions,
      [assessmentValue]: description
    };
    
    setFormData(prev => ({ 
      ...prev, 
      assessmentDescriptions: updatedDescriptions 
    }));
    
    // Clear any description errors
    if (errors.assessmentDescriptions) {
      setErrors(prev => ({ ...prev, assessmentDescriptions: '' }));
    }
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          assessmentDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved assessment description: ${assessmentValue}`);
      } catch (error) {
        console.error('Error auto-saving assessment description:', error);
      }
    }
  };

  const handleAddCustomAssessment = async (customKey, assessmentName) => {
    const newCustomAssessment = {
      key: customKey,
      name: assessmentName
    };
    
    const updatedCustomAssessments = [...formData.customAssessments, newCustomAssessment];
    
    setFormData(prev => ({
      ...prev,
      customAssessments: updatedCustomAssessments
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customAssessments: updatedCustomAssessments,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved custom assessment: ${assessmentName}`);
      } catch (error) {
        console.error('Error auto-saving custom assessment:', error);
      }
    }
  };

  const handleRemoveCustomAssessment = async (customKey) => {
    const updatedCustomAssessments = formData.customAssessments.filter(assessment => assessment.key !== customKey);
    const updatedSelectedValues = formData.assessmentMethods.filter(value => value !== customKey);
    const updatedDescriptions = { ...formData.assessmentDescriptions };
    delete updatedDescriptions[customKey];
    
    setFormData(prev => ({
      ...prev,
      customAssessments: updatedCustomAssessments,
      assessmentMethods: updatedSelectedValues,
      assessmentDescriptions: updatedDescriptions
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customAssessments: updatedCustomAssessments,
          assessmentMethods: updatedSelectedValues,
          assessmentDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved removal of custom assessment: ${customKey}`);
      } catch (error) {
        console.error('Error auto-saving custom assessment removal:', error);
      }
    }
  };

  const handleResourceDescriptionChange = async (resourceValue, description) => {
    const updatedDescriptions = {
      ...formData.resourceDescriptions,
      [resourceValue]: description
    };
    
    setFormData(prev => ({ 
      ...prev, 
      resourceDescriptions: updatedDescriptions 
    }));
    
    // Clear any description errors
    if (errors.resourceDescriptions) {
      setErrors(prev => ({ ...prev, resourceDescriptions: '' }));
    }
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          resourceDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved resource description: ${resourceValue}`);
      } catch (error) {
        console.error('Error auto-saving resource description:', error);
      }
    }
  };

  const handleAddCustomResource = async (customKey, resourceName) => {
    const newCustomResource = {
      key: customKey,
      name: resourceName
    };
    
    const updatedCustomResources = [...formData.customResources, newCustomResource];
    
    setFormData(prev => ({
      ...prev,
      customResources: updatedCustomResources
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customResources: updatedCustomResources,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved custom resource: ${resourceName}`);
      } catch (error) {
        console.error('Error auto-saving custom resource:', error);
      }
    }
  };

  const handleRemoveCustomResource = async (customKey) => {
    const updatedCustomResources = formData.customResources.filter(resource => resource.key !== customKey);
    const updatedSelectedValues = formData.resourcesAndMaterials.filter(value => value !== customKey);
    const updatedDescriptions = { ...formData.resourceDescriptions };
    delete updatedDescriptions[customKey];
    
    setFormData(prev => ({
      ...prev,
      customResources: updatedCustomResources,
      resourcesAndMaterials: updatedSelectedValues,
      resourceDescriptions: updatedDescriptions
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          customResources: updatedCustomResources,
          resourcesAndMaterials: updatedSelectedValues,
          resourceDescriptions: updatedDescriptions,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved removal of custom resource: ${customKey}`);
      } catch (error) {
        console.error('Error auto-saving custom resource removal:', error);
      }
    }
  };

  // Alberta Programs handlers
  const handleAlbertaCourseSelectionChange = async (subjectKey, courseIds) => {
    const updatedCourses = {
      ...formData.selectedAlbertaCourses,
      [subjectKey]: courseIds
    };
    
    setFormData(prev => ({ 
      ...prev, 
      selectedAlbertaCourses: updatedCourses 
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          selectedAlbertaCourses: updatedCourses,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log(`Auto-saved Alberta course selection for ${subjectKey}`);
      } catch (error) {
        console.error('Error auto-saving Alberta course selection:', error);
      }
    }
  };

  const handleOtherCoursesChange = async (courses) => {
    setFormData(prev => ({ 
      ...prev, 
      otherCourses: courses 
    }));
    
    // Auto-save to Firebase
    if (autoSaveEnabled && student && familyId && schoolYear) {
      try {
        const db = getDatabase();
        const planRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${student.id}`);
        
        const updatedData = {
          ...formData,
          otherCourses: courses,
          studentId: student.id,
          studentAsn: student.asn,
          familyId,
          schoolYear,
          submissionStatus: 'draft',
          lastUpdated: getEdmontonTimestamp(),
          updatedBy: user.uid
        };

        await set(planRef, updatedData);
        console.log('Auto-saved other courses');
      } catch (error) {
        console.error('Error auto-saving other courses:', error);
      }
    }
  };

  const handleShowFlowChart = () => {
    window.open('/prerequisite-flowchart', '_blank');
  };


  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[90vw] max-w-none overflow-y-auto">
        {/* Sticky Auto-save indicator */}
        {autoSaveEnabled && (
          <div className="sticky top-2 left-6 z-10 mb-4 flex justify-start">
            <div className="bg-white shadow-lg rounded-lg px-3 py-2 border border-green-200 max-w-fit">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="relative">
                    <CheckCircle2 className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="font-medium">Auto-save enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <span>Program Plan</span>
            </div>
          </SheetTitle>
          
          <SheetDescription className="text-left">
            Complete the Schedule of Learning Outcomes (SOLO) program plan for {student.firstName} {student.lastName} - {schoolYear} school year
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-600">Loading existing plan...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Program Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Program Plan Information</h3>
              <p className="text-sm text-blue-800 mb-3">
                This is the program plan used if a student is not doing any credits, regardless of age/grade. 
                Your program plan is an important document. It outlines your child's unique learning goals. 
                It is flexible and may be changed at any time throughout the year.
              </p>
              <p className="text-sm text-blue-800">
                This program plan template is based on the Schedule Of Learning Outcomes (SOLO) for students 
                receiving home education programs that do not follow the Alberta program of studies.
              </p>
            </div>

            {/* Basic Education Requirements */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Basic Education Requirements</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>1.</strong> A basic education must provide students with a solid core program including language arts, mathematics, science and social studies.</p>
                <p><strong>2.</strong> Students are expected to develop the knowledge skills and attitudes that will prepare them for life after high school. A basic education will allow students to:</p>
                <div className="ml-4 space-y-1 text-xs">
                  <p>(a) read for information, understanding and enjoyment</p>
                  <p>(b) write and speak clearly, accurately and appropriately for the context</p>
                  <p>(c) use mathematics to solve problems in business, science and daily life situations</p>
                  <p>(d) understand the physical world, ecology and the diversity of life</p>
                  <p>(e) understand the scientific method, the nature of science and technology and their application to daily life</p>
                  <p>(f) know the history and geography of Canada and have a general understanding of world history and geography</p>
                  <p>(g) understand Canada's political, social and economic systems within a global context</p>
                  <p>(h) respect the cultural diversity, the religious diversity and the common values of Canada</p>
                  <p>(i) demonstrate desirable personal characteristics such as respect, responsibility, fairness, honesty, caring, loyalty and commitment to democratic ideals</p>
                  <p>(j) recognize the importance of personal well-being and appreciate how family and others contribute to that well-being</p>
                  <p>(k) know the basic requirements of an active, healthful lifestyle</p>
                  <p>(l) understand and appreciate literature, the arts and the creative process</p>
                  <p>(m) research an issue thoroughly and evaluate the credibility and reliability of information sources</p>
                  <p>(n) demonstrate critical and creative thinking skills in problem solving and decision making</p>
                  <p>(o) demonstrate competence in using information technologies</p>
                  <p>(p) know how to work independently and as part of a team</p>
                  <p>(q) manage time and other resources needed to complete a task</p>
                  <p>(r) demonstrate initiative, leadership, flexibility and persistence</p>
                  <p>(s) evaluate their own endeavours and continually strive to improve</p>
                  <p>(t) have the desire and realize the need for life-long learning</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Student's Last Name" required>
                <input
                  type="text"
                  value={formData.studentLastName}
                  onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  readOnly
                />
              </FormField>

              <FormField label="Student's Given Name" required>
                <input
                  type="text"
                  value={formData.studentFirstName}
                  onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  readOnly
                />
              </FormField>

              <FormField label="Grade (as of September)" required>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  readOnly
                />
              </FormField>
            </div>

            {selectedFacilitator ? (
              // Show read-only facilitator info when pre-selected
              <FormField 
                label="Your facilitator" 
                required
                description="This is the facilitator you selected during registration."
              >
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedFacilitator.image} 
                      alt={selectedFacilitator.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">{selectedFacilitator.name}</h4>
                      <p className="text-sm text-green-700 mb-2">{selectedFacilitator.title}</p>
                      <p className="text-xs text-green-600">{selectedFacilitator.experience}</p>
                      <p className="text-sm text-green-800 mt-2">{selectedFacilitator.description}</p>
                    </div>
                  </div>
                </div>
              </FormField>
            ) : (
              // Show dropdown if no facilitator pre-selected (fallback)
              <FormField 
                label="Choose your facilitator's name" 
                error={errors.facilitatorName} 
                required
                description="Select the facilitator you would like to work with for your home education program."
              >
                <div className="relative">
                  <select
                    value={formData.facilitatorName}
                    onChange={(e) => handleInputChange('facilitatorName', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border ${errors.facilitatorName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none`}
                  >
                    {getFacilitatorDropdownOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Show facilitator description when one is selected */}
                {formData.facilitatorName && formData.facilitatorName !== '' && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    {(() => {
                      const selectedOption = getFacilitatorDropdownOptions()
                        .find(option => option.value === formData.facilitatorName);
                      return selectedOption?.description && (
                        <p className="text-sm text-blue-800">
                          <strong>{selectedOption.label}:</strong> {selectedOption.description}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </FormField>
            )}

            <FormField 
              label="Name of person(s) conducting the home learning program" 
              error={errors.conductingPersonName} 
              required
              description="Select a family guardian or enter a custom name"
            >
              {!showCustomInput ? (
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={formData.conductingPersonName}
                      onChange={(e) => handleConductingPersonChange(e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border ${errors.conductingPersonName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none`}
                    >
                      <option value="">Select a family guardian</option>
                      {familyGuardians.map((guardian) => (
                        <option key={guardian.id} value={guardian.name}>
                          {guardian.name} ({guardian.relationToStudents})
                        </option>
                      ))}
                      <option value="custom">Someone else (enter manually)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Show selected guardian info */}
                  {formData.conductingPersonName && formData.conductingPersonName !== '' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      {(() => {
                        const selectedGuardian = familyGuardians.find(g => g.name === formData.conductingPersonName);
                        return selectedGuardian && (
                          <div className="text-sm text-green-800">
                            <p><strong>{selectedGuardian.name}</strong></p>
                            <p>{selectedGuardian.relationToStudents} • {selectedGuardian.email}</p>
                            {selectedGuardian.guardianType === 'primary_guardian' && (
                              <p className="text-xs text-green-600 mt-1">Primary Guardian</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.conductingPersonName}
                    onChange={(e) => handleInputChange('conductingPersonName', e.target.value)}
                    className={`w-full px-3 py-2 border ${errors.conductingPersonName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter name of person conducting the program"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setFormData(prev => ({ ...prev, conductingPersonName: '' }));
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    ← Back to family guardian selection
                  </button>
                </div>
              )}
            </FormField>

            {/* Step 1: Educational Path Selection */}
            <div className="space-y-6">
              <div className="text-center border-t border-gray-200 pt-8">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <span className="font-medium text-gray-900">Choose Your Educational Approach</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOLO Only Path */}
                <div 
                  className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200 ${
                    !formData.followAlbertaPrograms 
                      ? 'border-green-500 bg-green-50 shadow-lg sm:scale-105' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleInputChange('followAlbertaPrograms', false)}
                >
                  {!formData.followAlbertaPrograms && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 text-base sm:text-lg mb-2">SOLO Only</h3>
                      <p className="text-xs sm:text-sm text-green-800 mb-3 sm:mb-4">
                        Follow the Schedule of Learning Outcomes with complete flexibility. Focus on learning outcomes 
                        rather than specific courses.
                      </p>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-green-700 leading-tight sm:leading-normal">Maximum flexibility in learning approach</span>
                        </div>
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-green-700 leading-tight sm:leading-normal">No formal course requirements</span>
                        </div>
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-green-700 leading-tight sm:leading-normal">Focus on competency-based learning</span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100 rounded-lg">
                        <p className="text-xs text-green-700 leading-relaxed">
                          <strong>Best for:</strong> Families wanting complete educational freedom, younger students, 
                          or those not planning traditional post-secondary education.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="educationalPath"
                        checked={!formData.followAlbertaPrograms}
                        onChange={() => handleInputChange('followAlbertaPrograms', false)}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-green-900">Choose SOLO Only</span>
                    </label>
                  </div>
                </div>

                {/* SOLO + Alberta Programs Path */}
                <div 
                  className={`relative border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200 ${
                    formData.followAlbertaPrograms 
                      ? 'border-blue-500 bg-blue-50 shadow-lg sm:scale-105' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleInputChange('followAlbertaPrograms', true)}
                >
                  {formData.followAlbertaPrograms && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-base sm:text-lg mb-2">SOLO + Alberta Programs</h3>
                      <p className="text-xs sm:text-sm text-blue-800 mb-3 sm:mb-4">
                        Combine SOLO flexibility with structured Alberta high school courses. 
                        Plan specific courses for credits toward graduation.
                      </p>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-blue-700 leading-tight sm:leading-normal">Structured course progression</span>
                        </div>
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-blue-700 leading-tight sm:leading-normal">Earn credits toward Alberta diploma</span>
                        </div>
                        <div className="flex items-start sm:items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                          <span className="text-blue-700 leading-tight sm:leading-normal">Clear pathway to post-secondary</span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-700 leading-relaxed">
                          <strong>Best for:</strong> High school students planning university/college, 
                          families wanting structured progression, or those seeking recognized credentials.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="educationalPath"
                        checked={formData.followAlbertaPrograms}
                        onChange={() => handleInputChange('followAlbertaPrograms', true)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-blue-900">Choose SOLO + Alberta Programs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: High School Course Planning */}
            {formData.followAlbertaPrograms && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <span className="font-medium text-gray-900">Plan Your High School Courses</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-blue-900 text-xl">High School Course Planning</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-blue-800 mb-3">
                        Now that you've chosen to include Alberta Programs of Study, let's plan which specific 
                        high school courses your student will work on this school year for credit.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700">Choose courses for this year only</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700">Focus on earning specific credits</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700">Build toward graduation requirements</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Course Planning Tips</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Start with core subjects (Math, English, Science, Social)</li>
                        <li>• Consider prerequisite requirements</li>
                        <li>• Plan 3-8 courses based on your family's capacity</li>
                        <li>• You need 100 total credits to receive a high school diploma</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-blue-200">
                  <AlbertaCourseSelection
                    selectedCourses={formData.selectedAlbertaCourses}
                    onCourseSelectionChange={handleAlbertaCourseSelectionChange}
                    onShowFlowChart={handleShowFlowChart}
                    otherCourses={formData.otherCourses}
                    onOtherCoursesChange={handleOtherCoursesChange}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Learning Activities and Methods */}
            <div className="space-y-6 pt-8">
              <div className="text-center border-t border-gray-200 pt-8">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {formData.followAlbertaPrograms ? '3' : '2'}
                  </div>
                  <span className="font-medium text-gray-900">Plan Learning Activities and Methods</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Alberta Home Education Regulation Requirements</h4>
                <p className="text-sm text-yellow-800 mb-2">Where a parent is providing a supervised home education program, the parent must provide a description of the program that includes:</p>
                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                  <li>A list of the activities and an explanation as to how those activities will enable the student to achieve the applicable outcomes.</li>
                  <li>The instructional methods and resources to be used.</li>
                  <li>The means of conducting evaluations of the student's progress.</li>
                  <li>The name of the person instructing the home education program, if not the parent.</li>
                </ul>
              </div>
            </div>

            <ExpandableActivityGroup
              label="What activities and/or instructional method(s) will you use to ensure that coverage of the 4 core subjects as well as the SOLO outcomes are being met?"
              options={activityOptions}
              selectedValues={formData.activitiesAndMethods}
              activityDescriptions={formData.activityDescriptions}
              customActivities={formData.customActivities}
              onSelectionChange={(values) => handleInputChange('activitiesAndMethods', values)}
              onDescriptionChange={handleActivityDescriptionChange}
              onAddCustomActivity={handleAddCustomActivity}
              onRemoveCustomActivity={handleRemoveCustomActivity}
              required
              description="Select all activities you plan to use. For each selected activity, describe how it will support your child's learning."
            />
            {errors.activitiesAndMethods && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.activitiesAndMethods}</span>
              </div>
            )}
            {errors.activityDescriptions && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.activityDescriptions}</span>
              </div>
            )}

            {/* Step 4: Assessment Methods */}
            <div className="space-y-6 pt-8">
              <div className="text-center border-t border-gray-200 pt-8">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {formData.followAlbertaPrograms ? '4' : '3'}
                  </div>
                  <span className="font-medium text-gray-900">Plan Assessment Methods</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Assessment Requirements</h4>
                <p className="text-sm text-blue-800 mb-2">According to the Alberta Home Education Regulation - A parent providing a home education program to a student:</p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>(a) must conduct an evaluation of the progress of the student at regular intervals and maintain a record of the methods and dates of those evaluations,</li>
                  <li>(b) must maintain dated samples of student work and a general record of the student's activities.</li>
                </ul>
              </div>
            </div>

            <ExpandableActivityGroup
              label="What methods of assessment do you intend to use?"
              options={assessmentOptions}
              selectedValues={formData.assessmentMethods}
              activityDescriptions={formData.assessmentDescriptions}
              customActivities={formData.customAssessments}
              onSelectionChange={(values) => handleInputChange('assessmentMethods', values)}
              onDescriptionChange={handleAssessmentDescriptionChange}
              onAddCustomActivity={handleAddCustomAssessment}
              onRemoveCustomActivity={handleRemoveCustomAssessment}
              required
              description="Please keep these items to guide the discussion with your facilitator during your visits. For each selected method, describe how you will use it to assess your child's progress."
            />
            {errors.assessmentMethods && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.assessmentMethods}</span>
              </div>
            )}
            {errors.assessmentDescriptions && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.assessmentDescriptions}</span>
              </div>
            )}

            {/* Step 5: Resources and Materials */}
            <div className="space-y-6 pt-8">
              <div className="text-center border-t border-gray-200 pt-8">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {formData.followAlbertaPrograms ? '5' : '4'}
                  </div>
                  <span className="font-medium text-gray-900">Select Resources and Materials</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Resources For Reimbursement</h4>
                <div className="text-sm text-green-800 space-y-2">
                  <p><strong>READ THE FOLLOWING CAREFULLY:</strong></p>
                  <p>For the {getTargetSchoolYear()} school year, the funding amount for each (funded) home education student is as follows:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Grade 1 to 12: {FUNDING_RATES.GRADES_1_TO_12.formatted} *subject to change as per gov't funding.</li>
                    <li>Kindergarten: {FUNDING_RATES.KINDERGARTEN.formatted} *subject to change as per gov't funding.</li>
                  </ul>
                  <p>According to the Standards for Home Education Reimbursement - this is based on three conditions:</p>
                  <ol className="list-decimal list-inside ml-4">
                    <li>Necessary for and related to the student's program.</li>
                    <li>Supported by receipt or invoice marked PAID.</li>
                    <li>Not usually paid for by parents of students in a brick-and-mortar school and/or not a form of remuneration to the parent.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Important Alert for Resources */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-2">Important: Resource Approval Required</h4>
                  <p className="text-sm text-amber-800">
                    These resources must align with your program plan and be listed here and approved by RTD-Connect so that we can process your reimbursement claims in a timely manner. For each selected resource, describe how it will support your child's learning.
                  </p>
                </div>
              </div>
            </div>

            <ExpandableActivityGroup
              label="What resources / materials do you plan to use and/or purchase to enhance the program?"
              options={resourceOptions}
              selectedValues={formData.resourcesAndMaterials}
              activityDescriptions={formData.resourceDescriptions}
              customActivities={formData.customResources}
              onSelectionChange={(values) => handleInputChange('resourcesAndMaterials', values)}
              onDescriptionChange={handleResourceDescriptionChange}
              onAddCustomActivity={handleAddCustomResource}
              onRemoveCustomActivity={handleRemoveCustomResource}
              required
              description="Select the resources you plan to use in your home education program. Detailed descriptions help ensure faster approval and processing."
            />
            {errors.resourcesAndMaterials && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.resourcesAndMaterials}</span>
              </div>
            )}
            {errors.resourceDescriptions && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.resourceDescriptions}</span>
              </div>
            )}

            {/* Acknowledgement */}
            <div className="space-y-4">
              <FormField label="Confirmation and Agreement" error={errors.acknowledgementRead} required>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acknowledgementRead}
                      onChange={(e) => handleInputChange('acknowledgementRead', e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">
                      I have thoroughly read and understand the above resource claim information. If I have any questions I will reach out to my facilitator for clarification.
                    </span>
                  </label>
                </div>
              </FormField>

              <FormField label="Today's Date" error={errors.todaysDate} required>
                <input
                  type="date"
                  value={formData.todaysDate}
                  onChange={(e) => handleInputChange('todaysDate', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.todaysDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </FormField>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Form Status and Downloads */}
            {existingSubmission && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Form Status & Downloads</h3>
                </div>
                
                {/* Submission Status */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm text-green-800">
                        {existingSubmission.submissionStatus === 'submitted' ? 'Plan Submitted' : 'Plan Saved'}
                      </p>
                      <p className="text-xs text-green-600">
                        {existingSubmission.submissionCompletedAt ? 
                          `Completed: ${formatEdmontonTimestamp(existingSubmission.submissionCompletedAt)}` :
                          `Last Updated: ${formatEdmontonTimestamp(existingSubmission.lastUpdated)}`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Current PDF */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-sm text-blue-800">Download Current Plan</p>
                    <p className="text-xs text-blue-600">
                      Generate PDF with current plan data
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={generatingPDF}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {generatingPDF ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Previous PDF Versions */}
                {existingSubmission.pdfVersions && existingSubmission.pdfVersions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Previous PDF Versions</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {existingSubmission.pdfVersions.map((pdf, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Version {pdf.version}</p>
                            <p className="text-xs text-gray-500">
                              Generated: {new Date(pdf.generatedAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => window.open(pdf.url, '_blank')}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || generatingPDF}
                className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                  isSubmitting || generatingPDF
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
              >
                {isSubmitting || generatingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {generatingPDF ? 'Generating PDF...' : 'Submitting Education Plan...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {existingSubmission?.submissionStatus === 'submitted' ? 'Update Program Plan' : 'Submit Program Plan'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </SheetContent>

    </Sheet>
  );
};

export default SOLOEducationPlanForm;