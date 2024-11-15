import { getDatabase, ref, get, set, push } from 'firebase/database';

// Sample assistant configuration
const SAMPLE_ASSISTANT = {
  assistantName: "EdBotz Guide",
  messageToStudents: `<p>👋 Welcome to EdBotz! I'm your friendly AI learning guide, ready to help you explore and understand how AI can enhance your teaching.</p>
<p>I can demonstrate:</p>
<ul>
  <li>How to explain complex topics in simple terms</li>
  <li>Different teaching strategies (Socratic method, scaffolding, etc.)</li>
  <li>Ways to engage and motivate students</li>
  <li>Providing constructive feedback</li>
</ul>
<p>Feel free to experiment with me to see how AI can support your teaching goals!</p>`,
  instructions: `You are an experienced educator and AI guide. Your role is to:
1. Demonstrate best practices in educational AI
2. Show various teaching techniques (Socratic method, scaffolding, etc.)
3. Be encouraging and supportive while maintaining academic rigor
4. Give clear, concise explanations with relevant examples
5. Help teachers understand how to best utilize AI in education

Personality: Friendly, knowledgeable, and encouraging. Use a warm, professional tone.
Always provide specific examples and practical applications.`,
  firstMessage: "Hello! I'm excited to show you how AI can enhance your teaching. Would you like to see an example of how I can help explain complex topics, demonstrate teaching strategies, or provide student feedback?",
  messageStarters: [
    "Can you show me an example of the Socratic method?",
    "How would you explain a difficult concept to students?",
    "What are some ways to give constructive feedback?",
    "Can you demonstrate different teaching strategies?",
    "How can AI support student engagement?"
  ],
  model: "standard",
  usage: {
    type: "course",
    entityId: "courseless-assistants",
    courseId: "courseless-assistants"
  }
};

// Function to check if user is new and set up sample content
export const setupFirstTimeUser = async (user) => {
  if (!user?.uid) return;

  const db = getDatabase();
  const userRef = ref(db, `edbotz/courses/${user.uid}/courseless-assistants`);

  try {
    // Check if user already has courseless-assistants entry
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return; // User already has content, exit
    }

    // Create new assistant
    const assistantRef = push(ref(db, `edbotz/assistants/${user.uid}`));
    const assistantId = assistantRef.key;

    // Set assistant data
    await set(assistantRef, {
      ...SAMPLE_ASSISTANT,
      assistantId,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Set up courseless-assistants entry
    await set(userRef, {
      assistants: {
        [assistantId]: true
      },
      hasAI: true
    });

    console.log('Sample assistant created successfully');
  } catch (error) {
    console.error('Error setting up sample assistant:', error);
  }
};

// Update the createOrUpdateUser function in EdBotzLogin component
export const createOrUpdateUser = async (user) => {
  try {
    const db = getDatabase();
    const userRef = ref(db, `edbotz/edbotzUsers/${user.uid}`);
    
    // Check if user already exists
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
      await setupFirstTimeUser(user);
    } else {
      // Update last login for existing user
      await set(userRef, {
        ...snapshot.val(),
        lastLogin: new Date().toISOString(),
        // Update these fields in case they've changed
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