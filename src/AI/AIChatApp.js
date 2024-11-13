import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import MathModal from '../chat/MathModal';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';

// Helper function to process text and convert LaTeX delimiters to JSX components
const processText = (text) => {
  // Normalize double backslashes to single backslashes first
  const normalizedText = text.replace(/\\\\([[\(].*?\\\\[\)\]])/g, '\\$1');
  
  // Helper function to clean math content
  const cleanMathContent = (content) => {
    return content
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .trim();
  };
  
  // Split by both single and double backslash patterns
  const parts = normalizedText.split(/(\\[\[\(](?:[^[\]()]|\[(?:[^[\]()]|\[[^\]]*\])*\]|\((?:[^[\]()]|\([^)]*\))*\))*[)\]])/g);
  
  return parts.map((part, index) => {
    // Check for display math: \[...\]
    if ((part.startsWith('\\[') && part.endsWith('\\]'))) {
      const math = cleanMathContent(part.slice(2, -2));
      return <TeX key={index} block>{math}</TeX>;
    }
    // Check for inline math: \(...\)
    if ((part.startsWith('\\(') && part.endsWith('\\)'))) {
      const math = cleanMathContent(part.slice(2, -2));
      return <TeX key={index}>{math}</TeX>;
    }
    // Regular text - render as markdown if it contains markdown syntax
    if (part.trim()) {
      return (
        <ReactMarkdown 
          key={index}
          className="inline"
          components={{
            p: ({children}) => <span>{children}</span>,
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <pre className={`bg-gray-100 p-2 rounded ${className}`}>
                  <code className={className} {...props}>{children}</code>
                </pre>
              ) : (
                <code className="bg-gray-100 px-1 rounded" {...props}>{children}</code>
              );
            },
            a: ({href, children}) => (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          }}
        >
          {part}
        </ReactMarkdown>
      );
    }
    return null;
  });
};

const AIChatApp = ({ firebaseApp, mode = 'full' }) => {
  const { user } = useAuth();

  // State Variables
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMathModal, setShowMathModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const [chat, setChat] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Initialize the AI Model and Chat
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const vertexAI = getVertexAI(firebaseApp);
        const geminiModel = getGenerativeModel(vertexAI, {
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 1,
            topP: 0.95,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'OFF',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'OFF',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'OFF',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'OFF',
            }
          ],
        });

        // Convert existing messages to chat history format
        const history = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        // Initialize chat with system prompt and history
        const initialChat = await geminiModel.startChat({
          history,
          systemPrompt: "You are a helpful AI assistant. Be concise and clear in your responses."
        });
        setChat(initialChat);
        setModel(geminiModel);
        console.log('AI model and chat initialized');
      } catch (err) {
        setError('Error initializing model: ' + err.message);
        console.error('Model initialization error:', err);
      }
    };

    initializeAI();
  }, [firebaseApp, messages]); 

  // Scroll handler
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle Send Message with Streaming
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !chat) return;

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    try {
      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: inputMessage,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage(''); // Clear input immediately after sending

      // Create placeholder for AI response
      const aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        timestamp: Date.now() + 1,
      }]);

      // Format the message for the API
      const formattedMessage = [{ text: inputMessage }];

      // Get streaming response
      const streamResult = await chat.sendMessageStream(formattedMessage);
      let accumulatedText = '';
      
      // Process the stream in real-time
      for await (const chunk of streamResult.stream) {
        const newText = chunk.candidates[0].content.parts[0].text;
        accumulatedText += newText;
        
        // Update the message with the accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId
            ? { ...msg, text: accumulatedText }
            : msg
        ));
      }

    } catch (err) {
      setError('Error generating response: ' + err.message);
      console.error('Chat API error:', err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
}, [inputMessage, chat]);

  // Handle Input Change
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  // Handle Insert Math
  const handleInsertMath = useCallback((latex) => {
    const latexCode = `\\[${latex}\\]`;
    const cursorPosition = inputRef.current?.selectionStart || inputMessage.length;
    const newMessage = 
      inputMessage.slice(0, cursorPosition) + 
      latexCode + 
      inputMessage.slice(cursorPosition);
    setInputMessage(newMessage);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [inputMessage]);

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Render Message Content
  const renderMessageContent = useMemo(
    () => (message) => {
      return (
        <div className="prose prose-sm max-w-none">
          {processText(message.text)}
          {message.sender === 'ai' && isStreaming && message.text && 
            <span className="animate-pulse">▊</span>}
        </div>
      );
    },
    [isStreaming]
  );

  // Render Chat Messages
  const renderChatMessages = useCallback(() => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${
          message.sender === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[80%] px-4 py-2 rounded-lg ${
            message.sender === 'user' ? 'bg-green-100' : 'bg-purple-100'
          }`}
        >
          <p className="font-semibold mb-1 text-base">
            {message.sender === 'user' ? user?.displayName || 'You' : 'AI Assistant'}
          </p>
          <div className="text-base markdown-content">
            {renderMessageContent(message)}
          </div>
        </div>
      </div>
    ));
  }, [messages, renderMessageContent, user?.displayName]);

  // Render Chat Interface
  const renderChatInterface = useCallback(() => {
    return (
      <div className={`flex flex-col ${mode === 'popup' ? 'h-full' : 'h-full'}`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-0 bg-purple-100">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-purple-800">AI Assistant</h2>
          </div>
        </div>
        
        {/* Messages Section */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            height: 'calc(100% - 160px)',
            minHeight: '150px',
          }}
        >
          {isLoading && !isStreaming && (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin" size={24} />
              <span className="ml-2">Loading...</span>
            </div>
          )}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            {renderChatMessages()}
          </div>
        </div>

        {/* Footer Section */}
        <div
          className={`bg-gray-100 border-t border-gray-200 p-4 ${
            mode === 'popup' ? 'sticky bottom-0' : ''
          }`}
        >
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question here... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 min-h-[80px] resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-2 mt-2 text-base">
            <button
              onClick={() => setShowMathModal(true)}
              className="flex-1 bg-teal-500 text-white rounded-md p-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              Insert Math
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !chat || !inputMessage.trim()}
              className="flex-1 bg-purple-500 text-white rounded-md p-2 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <Send size={24} className="mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    mode,
    renderChatMessages,
    isLoading,
    isStreaming,
    handleSendMessage,
    handleInputChange,
    handleKeyDown,
    inputMessage,
    error,
    chat
  ]);

  return (
    <div
      className={`flex flex-col bg-white text-gray-800 ${
        mode === 'popup' ? 'h-full' : 'h-full'
      }`}
      style={{ maxHeight: '100vh' }}
    >
      {renderChatInterface()}

      {/* Math Modal */}
      <MathModal
        isOpen={showMathModal}
        onClose={() => setShowMathModal(false)}
        onInsert={handleInsertMath}
        initialLatex=""
      />
    </div>
  );
};

export default AIChatApp;