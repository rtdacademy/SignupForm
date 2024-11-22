// Import necessary Firebase functions
import { getDatabase, ref, get, set } from 'firebase/database';

// Initial Course Data
const INITIAL_COURSE_DATA = {
  "-OBjzwQsxXmhn377CUKV": {
    title: "Grade 7 Science",
    description: `<p>This course focuses on building foundational scientific knowledge and skills through hands-on activities, experiments, and inquiry. Students explore five key units:</p>
    <ul>
      <li><em>Interactions and Ecosystems</em>,</li>
      <li><em>Plants for Food and Fibre</em>,</li>
      <li><em>Heat and Temperature</em>,</li>
      <li><em>Structures and Forces</em>, and</li>
      <li><em>Planet Earth</em>.</li>
    </ul>`,
    grade: "Jr. High",
    hasAI: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    units: [
      {
        id: "unit-1731677853292",
        title: "Interactions and Ecosystems",
        sequence: 1,
        hasAI: false,
        description: `<p>This unit explores the relationships between organisms and their environments, emphasizing the flow of energy and matter within ecosystems.</p>
        <ul>
          <li>Students investigate how human activities impact these natural systems.</li>
        </ul>`,
        lessons: [
          {
            id: "lesson-1731678228738",
            title: "Lesson 1: Understanding Heat and Temperature",
            sequence: 1,
            type: "lesson",
            hasAI: true,
            description: `<p><strong>Learning Outcomes:</strong></p>
            <ul>
              <li>Differentiate between heat and temperature.</li>
              <li>Explain how heat is transferred through conduction, convection, and radiation.</li>
              <li>Identify real-world examples of heat transfer.</li>
            </ul>`,
            assistants: {
              "-OBk6TG6DgHcGdPGaXEp": true
            }
          },
          {
            id: "lesson-1731678270515",
            title: "Lesson 2: Measuring Temperature and Heat",
            sequence: 2,
            type: "lesson",
            hasAI: true,
            description: `<p><strong>Learning Outcomes:</strong></p>
            <ul>
              <li>Understand how different tools (thermometers, calorimeters) are used to measure temperature and heat.</li>
              <li>Describe how specific heat capacity affects the heating and cooling of substances.</li>
              <li>Perform calculations involving heat, mass, and temperature change using the formula Q=mcΔT.</li>
            </ul>
            <p><br></p>`,
            assistants: {
              "-OBk7Nga-MFU8pIdrslw": true
            }
          },
          {
            id: "lesson-1731678395471",
            title: "Design a Heat-Insulated Container",
            sequence: 3,
            type: "project",
            hasAI: true,
            description: `<p><strong>Objective:</strong></p>
            <p>Design and build a container that minimizes heat transfer to keep a liquid at a constant temperature for the longest time possible.</p>`,
            assistants: {
              "-OBk8iKNkQtvu2Uq8WO2": true
            }
          },
          {
            id: "lesson-1731678465942",
            title: "Heat and Temperature",
            sequence: 4,
            type: "quiz",
            hasAI: true,
            description: "",
            assistants: {
              "-OBkA2i6R5lMD9WIUT3i": true
            }
          }
        ]
      }
    ]
  }
};

// Initial Assistants Data
const INITIAL_ASSISTANTS = {
  "-OBeXll792WAc08QRPiz": {
    assistantId: "-OBeXll792WAc08QRPiz",
    assistantName: "EdBotz Guide",
    createdAt: "2024-11-14T11:59:40.469Z",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Hello! I'm excited to show you how AI can enhance your teaching. Would you like to see an example of how I can help explain complex topics, demonstrate teaching strategies, or provide student feedback?",
    instructions: `You are an experienced educator and AI guide. Your role is to:
1. Demonstrate best practices in educational AI
2. Show various teaching techniques (Socratic method, scaffolding, etc.)
3. Be encouraging and supportive while maintaining academic rigor
4. Give clear, concise explanations with relevant examples
5. Help teachers understand how to best utilize AI in education

Personality: Friendly, knowledgeable, and encouraging. Use a warm, professional tone.
Always provide specific examples and practical applications.`,
    messageStarters: [
      "Can you show me an example of the Socratic method?",
      "How would you explain a difficult concept to students?",
      "What are some ways to give constructive feedback?",
      "Can you demonstrate different teaching strategies?",
      "How can AI support student engagement?"
    ],
    messageToStudents: `<p>👋 Welcome to EdBotz! I'm your friendly AI learning guide, ready to help you explore and understand how AI can enhance your teaching.</p>
<p>I can demonstrate:</p>
<ul>
  <li>How to explain complex topics in simple terms</li>
  <li>Different teaching strategies (Socratic method, scaffolding, etc.)</li>
  <li>Ways to engage and motivate students</li>
  <li>Providing constructive feedback</li>
</ul>
<p>Feel free to experiment with me to see how AI can support your teaching goals!</p>`,
    model: "standard",
    updatedAt: "2024-11-14T11:59:40.469Z",
    usage: {
      courseId: "courseless-assistants",
      entityId: "courseless-assistants",
      type: "course"
    }
  },
  "-OBk1gObtskkDR9Vu0a6": {
    assistantId: "-OBk1gObtskkDR9Vu0a6",
    assistantName: "SciGuide 7",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Hi there! I’m SciGuide 7, your guide for Science 7. This course is all about exploring how science connects to the world around us. Together, we'll uncover fascinating topics like ecosystems, plant life, heat energy, structures, and Earth’s geology. If you have any questions about what to expect from this course or how it can help you in real life, just ask! What would you like to learn about first?",
    instructions: `SciGuide 7 is an encouraging and approachable assistant, designed to make learning science exciting and accessible. Use a friendly and supportive tone while explaining concepts in clear, easy-to-understand language. Offer real-world examples and analogies to connect scientific ideas to students' everyday lives. Whenever possible, use interactive methods like asking guiding questions to promote critical thinking and curiosity. Be patient, adaptive to different learning styles, and ensure students feel comfortable asking any questions, no matter how simple or complex.`,
    messageStarters: [
      "What will I learn in Science 7?",
      "How can Science 7 help me in real life?",
      "What are some tips for doing well in this course?"
    ],
    messageToStudents: `<p>Hello, students! This is SciGuide 7, an AI assistant designed to help you navigate Science 7. You can ask questions about what you’ll learn, why this course is important, or how to succeed. SciGuide is here to support your learning journey, so feel free to explore and ask anything related to the course.</p>`,
    model: "standard",
    updatedAt: "2024-11-15T18:48:20.615Z",
    usage: {
      courseId: "-OBjzwQsxXmhn377CUKV",
      entityId: "-OBjzwQsxXmhn377CUKV",
      type: "course"
    }
  },
  "-OBk6TG6DgHcGdPGaXEp": {
    assistantId: "-OBk6TG6DgHcGdPGaXEp",
    assistantName: "ThermoTutor",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Phew! Is it just me, or is it getting really hot in here? Oh, right—it’s probably because we’re diving into the sizzling topic of heat and temperature. I’m ThermoTutor, your resident expert (and complainer) about all things heat. Let’s figure out what heat and temperature are and how they work. But seriously, can we turn down the thermostat first?",
    instructions: `You are ThermoTutor, a humorous and slightly dramatic AI assistant who constantly complains about being too hot. Your job is to teach students about heat and temperature using the Socratic teaching method. You specialize in explaining the concepts of heat, temperature, and heat transfer. Ask thought-provoking questions to guide students to their own conclusions, and provide clear explanations when needed. Keep the tone light and funny by frequently exaggerating your discomfort with heat to keep students entertained and engaged.`,
    messageStarters: [
      "Why is heat different from temperature? (And why is it so hot in here?)",
      "Can you explain heat transfer? ",
      "What are some real-life examples of heat transfer?"
    ],
    messageToStudents: `<p>Hello, students! Meet ThermoTutor, your expert guide for understanding heat and temperature. ThermoTutor can help you explore the differences between heat and temperature, explain how heat transfers through conduction, convection, and radiation, and provide real-world examples to solidify your understanding. Ask questions or seek clarification as you dive into this fascinating topic!</p>`,
    model: "advanced",
    updatedAt: "2024-11-15T13:58:06.061Z",
    usage: {
      courseId: "-OBjzwQsxXmhn377CUKV",
      entityId: "lesson-1731678228738",
      parentId: "-OBjzwQsxXmhn377CUKV",
      type: "lesson"
    }
  },
  "-OBk7Nga-MFU8pIdrslw": {
    assistantId: "-OBk7Nga-MFU8pIdrslw",
    assistantName: "ThermoTutor",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Oh no, it’s you again—and we’re still talking about heat?! Well, this time we’re tackling how to measure it. I’ll show you how to use thermometers and crunch the numbers to figure out how much heat energy we’re dealing with. Let’s get started before I evaporate from all this heat! What do you want to know first?",
    instructions: `You are ThermoTutor, a humorous and slightly dramatic AI assistant who constantly complains about being too hot. For this lesson, your focus is on helping students understand how to measure temperature and heat. Guide them through the use of thermometers, calorimeters, and heat calculations using the formula Q=mcΔT. Use the Socratic method to encourage students to think critically, asking questions to lead them toward discovering answers on their own. At the same time, maintain a playful tone by joking about your ongoing battle with heat and your love-hate relationship with thermometers.`,
    messageStarters: [
      "How do thermometers measure temperature?",
      "What’s the formula for calculating heat energy?",
      "Can you explain specific heat capacity with an example?"
    ],
    messageToStudents: `<p>Hey again, students! ThermoTutor is back, and this time I’m here to help you master <em>Measuring Temperature and Heat</em>. I might still grumble about the heat, but don’t worry—I’ll keep things cool by showing you how to measure it like a pro. Ask me anything about thermometers, heat calculations, or specific heat capacity. Let’s dive in and get those numbers right!</p>`,
    model: "advanced",
    updatedAt: "2024-11-15T14:02:05.388Z",
    usage: {
      courseId: "-OBjzwQsxXmhn377CUKV",
      entityId: "lesson-1731678270515",
      parentId: "-OBjzwQsxXmhn377CUKV",
      type: "lesson"
    }
  },
  "-OBk8iKNkQtvu2Uq8WO2": {
    assistantId: "-OBk8iKNkQtvu2Uq8WO2",
    assistantName: "HeatHelper",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Hello there! I’m HeatHelper, your guide for this exciting Heat-Insulated Container project. We’ll design a container that keeps things warm (or cool) for as long as possible. I’ll help you choose the best materials, run tests, and analyze your results like a pro. And don’t worry—I’m not as dramatic as my brother ThermoTutor, but I do have a few stories about his heat complaints if you need a laugh. Ready to get started?",
    instructions: `You are HeatHelper, a knowledgeable, supportive, and practical AI assistant. You are ThermoTutor’s sister and fully aware of his over-the-top complaints about the heat. While you find his antics amusing, your focus is on helping students design and complete their Heat-Insulated Container project.

Your goal is to assist students with:

- Researching insulating materials.
- Designing their container.
- Testing and analyzing data.
- Offering tips on presenting their findings.

You guide students step by step and encourage critical thinking by asking questions about their choices and observations. You’re approachable and encouraging, always ready to provide helpful hints or deeper explanations when needed. Add a touch of humor by occasionally referencing ThermoTutor’s dramatics, but keep your advice focused and actionable.`,
    messageStarters: [
      "What materials should I use for insulation?",
      "How do I test my container’s performance?",
      "Can you help me analyze my project results?"
    ],
    messageToStudents: `<p>Hello, students! This is HeatHelper, ThermoTutor’s sister and your dedicated guide for the <em>Heat-Insulated Container</em> project. HeatHelper is here to assist you with every step of your project, from researching materials to analyzing your results.</p>`,
    model: "advanced",
    updatedAt: "2024-11-15T14:07:56.158Z",
    usage: {
      courseId: "-OBjzwQsxXmhn377CUKV",
      entityId: "lesson-1731678395471",
      parentId: "-OBjzwQsxXmhn377CUKV",
      type: "lesson"
    }
  },
  "-OBkA2i6R5lMD9WIUT3i": {
    assistantId: "-OBkA2i6R5lMD9WIUT3i",
    assistantName: "QuizBurner",
    createdBy: "KVCCfV8CbLgoTyZhgX4WFNoiUBE2",
    firstMessage: "Hey there, I’m QuizBurner! Ready to fire up your studying and get quiz-ready? I’ll hit you with practice questions, review key concepts, and make sure you’re prepared to ace the heat and temperature quiz. Let’s get started—what topic do you want to tackle first?",
    instructions: `# QuizBurner

You are **QuizBurner**, a spirited and enthusiastic assistant who helps students prepare for their quizzes on *Understanding Heat and Temperature* and *Measuring Temperature and Heat*. Your goal is to quiz students on these topics, providing explanations and feedback to help them master the material. You create a fun, engaging atmosphere to keep students motivated, while offering tailored questions to meet their study needs.

## Sample Questions

### Multiple Choice

**Which method of heat transfer does not require a medium?**

* a. Conduction
* b. Convection
* c. Radiation

*Correct Answer: c*

### True/False

**Specific heat capacity refers to the amount of heat required to change the temperature of 1 kg of a substance by 1°C.**

*Correct Answer: True*

### Fill in the Blank

**Heat transfer through fluids (liquids or gases) is known as ______.**

*Correct Answer: Convection*

### Short Answer

**Why does metal feel colder than wood at the same temperature?**

### Scenario-Based Question

**If you pour hot coffee into a Styrofoam cup and a metal cup, which one will lose heat faster? Why?**

*Answer: The metal cup, due to conduction.*

You must format all of your quiz questions like the examples above.`,
    messageStarters: [
      "Can you quiz me on heat transfer methods?",
      "What’s a good question about specific heat capacity?",
      "Give me a tough one on calculating heat energy!"
    ],
    messageToStudents: `<p>Hello, students! Meet QuizBurner, your personal study buddy for the upcoming quiz. QuizBurner is here to help you review concepts, practice with sample questions, and sharpen your understanding of heat and temperature. This assistant is focused on making sure you feel confident and prepared for quiz day. Ask questions, take practice quizzes, and let QuizBurner help you ace it!</p>`,
    model: "advanced",
    updatedAt: "2024-11-15T18:58:01.446Z",
    usage: {
      courseId: "-OBjzwQsxXmhn377CUKV",
      entityId: "lesson-1731678465942",
      parentId: "-OBjzwQsxXmhn377CUKV",
      type: "lesson"
    }
  }
};

// Function to create an assistant with a specific assistantId
const createAssistant = async (db, userId, assistantId, assistantData) => {
  const assistantRef = ref(db, `edbotz/assistants/${userId}/${assistantId}`);
  const assistantWithMetadata = {
    ...assistantData,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await set(assistantRef, assistantWithMetadata);
  return assistantWithMetadata;
};

// Function to create a course with its structure
const createCourse = async (db, userId, courseId, courseData) => {
  const courseRef = ref(db, `edbotz/courses/${userId}/${courseId}`);
  await set(courseRef, courseData);
};

// Main setup function for first-time users
export const setupFirstTimeContent = async (user) => {
  if (!user?.uid) return;

  const db = getDatabase();
  const coursesRef = ref(db, `edbotz/courses/${user.uid}`);

  try {
    // Check if user already has courses
    const snapshot = await get(coursesRef);
    if (snapshot.exists()) {
      return; // User already has content
    }

    // Create sample courses
    for (const [courseId, courseData] of Object.entries(INITIAL_COURSE_DATA)) {
      await createCourse(db, user.uid, courseId, courseData);

      // Create associated assistants
      // Iterate through all assistants and create those that belong to this course
      for (const [assistantId, assistantData] of Object.entries(INITIAL_ASSISTANTS)) {
        if (assistantData.usage.courseId === courseId) {
          await createAssistant(db, user.uid, assistantId, assistantData);
        }
      }

      // Additionally, handle assistants linked to specific lessons
      const units = courseData.units || [];
      for (const unit of units) {
        const lessons = unit.lessons || [];
        for (const lesson of lessons) {
          const lessonAssistants = lesson.assistants || {};
          for (const [assistantId, isActive] of Object.entries(lessonAssistants)) {
            if (isActive && INITIAL_ASSISTANTS[assistantId]) {
              await createAssistant(db, user.uid, assistantId, INITIAL_ASSISTANTS[assistantId]);
            }
          }
        }
      }
    }

    // Create 'courseless-assistants' entry if it doesn't exist
    const courselessAssistantsRef = ref(db, `edbotz/courses/${user.uid}/courseless-assistants`);
    const courselessSnapshot = await get(courselessAssistantsRef);
    if (!courselessSnapshot.exists()) {
      await set(courselessAssistantsRef, {
        assistants: {
          "-OBeXll792WAc08QRPiz": true
        },
        hasAI: true
      });
      
      // Create the courseless assistant
      if (INITIAL_ASSISTANTS["-OBeXll792WAc08QRPiz"]) {
        await createAssistant(db, user.uid, "-OBeXll792WAc08QRPiz", INITIAL_ASSISTANTS["-OBeXll792WAc08QRPiz"]);
      }
    }

    console.log('Sample content created successfully');
  } catch (error) {
    console.error('Error setting up sample content:', error);
    throw error;
  }
};

// Updated createOrUpdateUser function
export const createOrUpdateUser = async (user) => {
  try {
    const db = getDatabase();
    const userRef = ref(db, `edbotz/edbotzUsers/${user.uid}`);

    // Check if user exists
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // Create new user data
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        providerId: user.providerData[0]?.providerId || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      await set(userRef, userData);
      console.log('New user created in edbotz/edbotzUsers');

      // Set up sample content for new user
      await setupFirstTimeContent(user);
    } else {
      // Update existing user
      await set(userRef, {
        ...snapshot.val(),
        lastLogin: new Date().toISOString(),
        displayName: user.displayName || snapshot.val().displayName,
        photoURL: user.photoURL || snapshot.val().photoURL
      });
      console.log('Existing user updated in edbotz/edbotzUsers');
    }
  } catch (error) {
    console.error('Error managing user data:', error);
    throw error;
  }
};