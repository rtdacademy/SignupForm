import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Loader,
  Bot,
  PenLine,
  ArrowDown,
  X,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  Square, 
  MaximizeIcon, 
  MinimizeIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { getDatabase, ref, onValue } from 'firebase/database';
import { ScrollArea } from "../components/ui/scroll-area";
import useEnhancedChatHandler from "./components/useEnhancedChatHandler";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";
import { AI_MODEL_MAPPING } from './utils/settings';
import { textToSpeech } from './ttsUtilities';

// Loading Overlay Component
const LoadingOverlay = ({ assistantName = 'AI Assistant' }) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center max-w-sm text-center space-y-2">
        <h3 className="text-xl font-semibold text-purple-900">
          Initializing {assistantName}
        </h3>
        <p className="text-sm text-purple-600">
          Please wait while I prepare to help you...
        </p>
        <div className="flex space-x-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to enhance links
const enhanceLinks = (htmlContent) => {
  if (!htmlContent) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  const links = div.getElementsByTagName('a');
  Array.from(links).reverse().forEach(link => {
    link.style.fontWeight = 'bold';
    link.style.textDecoration = 'underline';
    link.classList.add('text-blue-600');
    
    // Add these attributes to make links work properly
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  return div.innerHTML;
};

// Process text function for markdown and LaTeX with enhanced math support
const processText = (text) => {
  if (!text) return null;

  // Helper to clean math content
  const cleanMathContent = (content) => {
    return content
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .trim();
  };

  // Split text into parts, handling all math delimiters
  const parts = text.split(/((?:\$\$|\$|\\[\[\(])(?:[^$\\]|\\.)*?(?:\$\$|\$|\\[\]\)])|\\[\[\(](?:[^[\]()]|\[(?:[^[\]()]|\[[^\]]*\])*\]|\((?:[^[\]()]|\([^)]*\))*\))*[)\]])/g);

  return parts.map((part, index) => {
    // Handle block math with $$ or \[...\]
    if (
      (part.startsWith('$$') && part.endsWith('$$')) ||
      (part.startsWith('\\[') && part.endsWith('\\]'))
    ) {
      const mathContent = part.startsWith('$$') 
        ? part.slice(2, -2) 
        : cleanMathContent(part.slice(2, -2));
      return <TeX key={index} block>{mathContent}</TeX>;
    }
    
    // Handle inline math with $ or \(...\)
    if (
      (part.startsWith('\\(') && part.endsWith('\\)'))
    ) {
      const mathContent = part.startsWith('$')
        ? part.slice(1, -1)
        : cleanMathContent(part.slice(2, -2));
      return <TeX key={index}>{mathContent}</TeX>;
    }

    // Handle regular text with markdown
    if (part.trim()) {
      return (
        <ReactMarkdown 
          key={index}
          className="inline"
          components={{
            p: ({children}) => <span>{children}</span>,
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              
              // Clean the code content by removing backticks for inline code
              const codeContent = String(children).replace(/^`|`$/g, '');
              
              return !inline && match ? (
                <div className="relative group">
                  <pre className={cn(
                    "my-4 overflow-x-auto",
                    "bg-gray-900 text-gray-50",
                    "p-4 rounded-lg border border-gray-800",
                    "shadow-lg",
                    className
                  )}>
                    <div className="flex items-center justify-between mb-2 text-gray-400 text-xs">
                      <span className="font-medium">{match[1]}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                        onClick={() => navigator.clipboard.writeText(codeContent)}
                      >
                        <span className="mr-2">Copy</span>
                        <PenLine className="w-3 h-3" />
                      </Button>
                    </div>
                    <code 
                      className={cn(
                        "font-mono text-sm leading-relaxed",
                        "block w-full",
                        className
                      )} 
                      {...props}
                    >
                      {codeContent}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="px-1.5 py-0.5 text-purple-600 bg-purple-50 rounded-md font-mono text-sm" {...props}>
                  {codeContent}
                </code>
              );
            },
            a: ({href, children}) => (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline underline-offset-4" 
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

const MessageBubble = React.memo(({ message, isStreaming, userName, assistantName, firebaseApp }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioInfo, setAudioInfo] = useState(null);
  const audioRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const isUser = message.sender === 'user';
  
  // Clean up function to properly handle audio resources
  const cleanupAudio = useCallback(() => {
    // Clear any ongoing check interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Stop and clean up audio controller
    if (audioRef.current) {
      // Check if it's a streaming controller with stop method
      if (typeof audioRef.current.stop === 'function') {
        audioRef.current.stop();
      } else {
        // Otherwise it's a regular Audio object
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setAudioInfo(null);
  }, []);
 
  const handlePlay = async () => {
    console.log('Play button clicked');
    
    // If already playing, stop playback
    if (isPlaying) {
      cleanupAudio();
      return;
    }
  
    setIsLoadingAudio(true);
    setIsPlaying(true);
    
    try {
      // Determine optimal chunk size based on message length
      let chunkSize = 'medium';
      if (message.text.length > 1000) {
        chunkSize = 'large';
      } else if (message.text.length < 200) {
        chunkSize = 'small';
      }
      
      // Use the unified TTS function with AI preprocessing
      const useStreaming = message.text.length > 100;
      const audioController = await textToSpeech(
        firebaseApp, 
        message.text, 
        useStreaming, 
        false, // Don't skip AI preprocessing
        chunkSize
      );
      
      if (!audioController) {
        cleanupAudio();
        return;
      }
      
      audioRef.current = audioController;
      setIsLoadingAudio(false);
      
      if (useStreaming) {
        // For streaming audio, set up interval to check playback status and update info
        checkIntervalRef.current = setInterval(() => {
          if (!audioRef.current) {
            cleanupAudio();
            return;
          }
          
          // Check if playback has ended
          if (!audioRef.current.isActive()) {
            cleanupAudio();
            return;
          }
          
          // Update audio info if available
          if (typeof audioRef.current.getPlaybackInfo === 'function') {
            setAudioInfo(audioRef.current.getPlaybackInfo());
          }
        }, 500);
      } else {
        // For standard audio
        audioController.addEventListener('canplaythrough', () => {
          setIsLoadingAudio(false);
          audioController.play();
        });
        
        // Wait for the audio to finish
        await new Promise(resolve => {
          // Handle normal end of playback
          audioController.addEventListener('ended', () => {
            cleanupAudio();
            resolve();
          }, { once: true });
          
          // Handle errors
          audioController.addEventListener('error', () => {
            cleanupAudio();
            resolve();
          }, { once: true });
        });
      }
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      cleanupAudio();
    }
  };
 
  // Cleanup on unmount
  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);
 
  return (
    <div className={cn(
      "group flex gap-3 relative transition-all duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
        isUser ? "bg-blue-500" : "bg-gradient-to-br from-purple-600 to-indigo-600"
      )}>
        {isUser ? <PenLine className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
          {isUser ? userName || 'You' : assistantName || 'AI Assistant'}
          {!isUser && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlay}
                className={cn(
                  "h-6 px-2 hover:bg-purple-50",
                  isPlaying ? "text-red-600 hover:text-red-700" : "text-purple-600 hover:text-purple-700"
                )}
                disabled={isLoadingAudio}
                title={isPlaying ? "Stop audio" : "Play text as speech"}
              >
                {isLoadingAudio ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : isPlaying ? (
                  <>
                    <Square className="w-3 h-3" />
                    <span className="sr-only">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    <span className="sr-only">Play</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser && "[&_*]:text-white [&_code]:bg-blue-400 [&_code]:text-white"
          )}>
            {message.text && message.text.includes('<') && message.text.includes('>') ? (
              <div 
                className="prose prose-sm max-w-none prose-a:text-blue-600 prose-a:font-medium"
                dangerouslySetInnerHTML={{ __html: enhanceLinks(message.text) }} 
                onClick={(e) => {
                  // If the click is on a link, allow default behavior
                  if (e.target.tagName === 'A') {
                    e.stopPropagation();
                  }
                }}
              />
            ) : (
              processText(message.text)
            )}
            {message.sender === 'ai' && isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full mt-1">
          <span className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          
          {/* Audio playback info - only shown when audio is playing */}
          {isPlaying && audioInfo && (
            <span className="text-xs text-purple-500 ml-2">
              {`${(audioInfo.bufferedDuration || 0).toFixed(1)}s buffered`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

const MessageStarters = ({ starters, onSelect, isLoading, isInitializing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  
  useEffect(() => {
    const checkHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        setNeedsExpansion(height > 80); // Approximately 2 rows
      }
    };
    
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [starters]);

  return (
    <div className="flex-1">
      <div
        ref={containerRef}
        className={cn(
          "flex flex-wrap gap-2",
          !isExpanded && "max-h-[80px] overflow-hidden"
        )}
      >
        {starters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-normal text-left h-auto"
            onClick={() => onSelect(starter)}
            disabled={isLoading || isInitializing}
          >
            {starter}
          </Button>
        ))}
      </div>
      
      {needsExpansion && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show More
            </>
          )}
        </Button>
      )}
    </div>
  );
};

const AIChatApp = ({ firebaseApp, mode = 'full', assistant, onClose }) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [model, setModel] = useState(null);
  const [chat, setChat] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(assistant);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  // Keep assistantKey for component remounting on assistant change
  const [assistantKey, setAssistantKey] = useState(assistant?.id);

  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const chatSessionRef = useRef(null);

  // Move scrollToBottom declaration before useEnhancedChatHandler
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Updated destructuring with initializeChat, resetState, isChatReady
  const {
    messages,
    isLoading,
    isStreaming,
    error: chatError,
    handleSendMessage: sendMessage,
    setMessages,
    initializeChat,
    resetState,
    isChatReady
  } = useEnhancedChatHandler(scrollToBottom);

  // Simplified cleanup function
  const cleanup = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  
    chatSessionRef.current = null;
    setChat(null);
    setModel(null);
    setMessages([]);
    setInputMessage('');
  }, [setMessages]);

  // Initialize AI function
  const initializeAI = useCallback(async (assistantConfig) => {
    if (!assistantConfig) return;
  
    setIsInitializing(true);
  
    try {
      // Basic delay to prevent rapid initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const vertexAI = getVertexAI(firebaseApp);
      const modelName = AI_MODEL_MAPPING[assistantConfig?.model]?.name || AI_MODEL_MAPPING.standard.name;

  
      // Request tracking logic to handle rate limiting
      const now = Date.now();
      const requestKey = `vertex_ai_${modelName}_last_request`;
      const lastRequest = localStorage.getItem(requestKey);
  
      if (lastRequest) {
        const timeSinceLastRequest = now - parseInt(lastRequest, 10);
        if (timeSinceLastRequest < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastRequest));
        }
      }
  
      localStorage.setItem(requestKey, now.toString());
  
      // Initialize the generative model with appropriate settings
      const geminiModel = getGenerativeModel(vertexAI, {
        model: modelName,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.9,
          topP: 0.95,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
        systemInstruction: {
          parts: [{ text: assistantConfig?.instructions || "You are a helpful AI assistant. Be concise and clear in your responses." }],
        },
      });

      let initialChat;
      try {
        // Include the assistant's first message in the chat history
        const history = assistantConfig?.firstMessage
          ? [
              {
                role: 'user',
                parts: [{ text: 'Hello' }],
              },
              {
                role: 'model',
                parts: [{ text: assistantConfig.firstMessage }],
              },
            ]
          : [];
  
        initialChat = await geminiModel.startChat({ history });
      } catch (err) {
        if (err.message.includes('429')) {
          console.log('Rate limited, falling back to Gemini Flash');
  
          // Fallback to a different model if rate limited
          const fallbackModel = getGenerativeModel(vertexAI, {
            model: AI_MODEL_MAPPING.fallback.name,
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.9,
              topP: 0.95,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_LOW_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_LOW_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_LOW_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_LOW_AND_ABOVE',
              },
            ],
            systemInstruction: {
              parts: [{ text: assistantConfig?.instructions || "You are a helpful AI assistant. Be concise and clear in your responses." }],
            },
          });
  
          // Include the assistant's first message in the chat history
          const history = assistantConfig?.firstMessage
            ? [
                {
                  role: 'model',
                  parts: [{ text: assistantConfig.firstMessage }],
                },
              ]
            : [];
  
          initialChat = await fallbackModel.startChat({ history });
        } else {
          throw err;
        }
      }
  
      // Set up chat session references before initialization
      chatSessionRef.current = initialChat;
      setChat(initialChat);
      setModel(geminiModel);
  
      // Initialize the chat handler with the new chat session
      await initializeChat(initialChat);
  
      // Display the assistant's first message in the UI
      if (assistantConfig?.firstMessage) {
        const initialMessageId = Date.now();
        setMessages([
          {
            id: initialMessageId,
            sender: 'ai',
            text: assistantConfig.firstMessage,
            timestamp: initialMessageId,
          },
        ]);
      }
    } catch (err) {
      console.error('Chat initialization error:', err);
      setError('Failed to initialize chat. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [firebaseApp, setMessages, initializeChat]);

  // Simplified reset handler that directly manages the chat state
  const handleReset = useCallback(async () => {
    if (!currentAssistant) return;
  
    try {
      setIsResetting(true);
      setIsInitializing(true);
      await cleanup();
      await initializeAI(currentAssistant);
    } catch (err) {
      console.error('Reset error:', err);
      setError('Failed to reset chat. Please try again.');
    } finally {
      setIsResetting(false);
    }
  }, [currentAssistant, cleanup, initializeAI]);

  // Modify the Firebase listener effect with resetState
  useEffect(() => {
    if (!assistant?.id) return;
  
    const handleAssistantUpdate = async (updatedAssistant) => {
      if (updatedAssistant) {
        setCurrentAssistant({
          ...updatedAssistant,
          id: assistant.id,
          usage: assistant.usage
        });
      }
    };
  
    // Reset state when changing assistants
    resetState();
    
    // Initialize AI for new assistant
    initializeAI(assistant);
  
    const db = getDatabase(firebaseApp);
    const assistantRef = ref(db, `edbotz/assistants/${assistant.usage.ownerId}/${assistant.id}`);
  
    const unsubscribe = onValue(assistantRef, (snapshot) => {
      const updatedAssistant = snapshot.val();
      if (updatedAssistant) {
        handleAssistantUpdate(updatedAssistant);
      }
    });
  
    return () => {
      unsubscribe();
      cleanup();
    };
  }, [assistant?.id, assistant?.usage?.ownerId, firebaseApp, cleanup, initializeAI, assistant, resetState]);

  // Separate effect for initial AI setup and assistant changes
  useEffect(() => {
    if (!assistant) return;
    
    // Reset the chat when the assistant changes
    if (assistant.id !== assistantKey) {
      setAssistantKey(assistant.id);
      handleReset();
    } else {
      // Initial setup
      initializeAI(assistant);
    }
  }, [assistant, assistantKey, handleReset, initializeAI]);

  // Handle scroll to bottom
  const scrollToBottomHandler = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const handleScroll = useCallback((event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Updated send message handler
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;
    setError(null);

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsInputExpanded(false); // Reset to collapsed state after sending

    await sendMessage(messageToSend);
    
    // Focus back on the input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [inputMessage, sendMessage]);

  const handleStarterSelect = useCallback((text) => {
    setInputMessage(text);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = text.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  }, []);

  // Toggle expansion handler
  const toggleExpansion = useCallback(() => {
    setIsInputExpanded(prev => !prev);
    
    // Focus the input after toggling
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        
        // If expanding, place cursor at end of current text
        if (!isInputExpanded && inputMessage) {
          const length = inputMessage.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }
    }, 0);
  }, [isInputExpanded, inputMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full relative">
      <Card className="flex flex-col h-full border-0 rounded-none bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-br from-purple-50 to-indigo-50 py-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-purple-900">
                  {currentAssistant?.assistantName || 'AI Assistant'}
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                {assistant?.messageToStudents && !isMessageVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMessageVisible(true)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline">Show Message</span>
                  </Button>
                )}
                {assistant?.messageToStudents && isMessageVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMessageVisible(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isLoading || isStreaming || isResetting}
                  className="hover:bg-purple-100 text-purple-600"
                  title="Reset Chat"
                >
                  <RotateCcw className={cn(
                    "w-5 h-5",
                    isResetting && "animate-spin"
                  )} />
                </Button>
              </div>
            </div>
            
            {assistant?.messageToStudents && isMessageVisible && (
              <div className="relative message-enter message-enter-active">
                <div 
                  className="text-sm text-purple-700 prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:font-bold [&_a]:underline [&_a]:decoration-blue-600 transition-all duration-300"
                  dangerouslySetInnerHTML={{ 
                    __html: enhanceLinks(assistant.messageToStudents) 
                  }} 
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full"
            onScroll={handleScroll}
          >
            <div className="p-4 space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming}
                  userName={user?.displayName}
                  assistantName={currentAssistant?.assistantName}
                  firebaseApp={firebaseApp}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <CardFooter className="flex-shrink-0 border-t bg-white p-4 space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "AI Assistant is initializing..." : "Type your message... (Press Enter to send)"}
              className={cn(
                "resize-none transition-all duration-300",
                isInputExpanded ? "min-h-[400px]" : "min-h-[80px]"
              )}
              disabled={isLoading || isInitializing}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleExpansion}
              className="absolute top-2 right-2 h-6 w-6 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title={isInputExpanded ? "Collapse input" : "Expand input"}
            >
              {isInputExpanded ? (
                <MinimizeIcon className="w-4 h-4" />
              ) : (
                <MaximizeIcon className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              {currentAssistant?.messageStarters && currentAssistant.messageStarters.length > 0 && (
                <MessageStarters
                  starters={currentAssistant.messageStarters}
                  onSelect={handleStarterSelect}
                  isLoading={isLoading}
                  isInitializing={isInitializing}
                />
              )}
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isInitializing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isStreaming ? 'Processing...' : 'Loading...'}
                </>
              ) : isInitializing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>

        {showScrollButton && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-32 right-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}

        {(isInitializing || isResetting) && (
          <LoadingOverlay 
            assistantName={currentAssistant?.assistantName || 'AI Assistant'} 
          />
        )}
      </Card>
    </div>
  );
};

export default React.memo(AIChatApp);