import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader, Bot, PenLine, ArrowDown, X, RotateCcw, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TeX from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";

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
  });
  return div.innerHTML;
};

// Process text function for markdown and LaTeX
const processText = (text) => {
  if (!text) return null;
  const normalizedText = text.replace(/\\\\([[\(].*?\\\\[\)\]])/g, '\\$1');
  
  const cleanMathContent = (content) => {
    return content
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .trim();
  };
  
  const parts = normalizedText.split(/(\\[\[\(](?:[^[\]()]|\[(?:[^[\]()]|\[[^\]]*\])*\]|\((?:[^[\]()]|\([^)]*\))*\))*[)\]])/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      return <TeX key={index} block>{cleanMathContent(part.slice(2, -2))}</TeX>;
    }
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      return <TeX key={index}>{cleanMathContent(part.slice(2, -2))}</TeX>;
    }
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
                <div className="relative group">
                  <pre className={`bg-gray-50 p-4 rounded-lg border ${className}`}>
                    <code className={className} {...props}>{children}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigator.clipboard.writeText(children.toString())}
                  >
                    Copy
                  </Button>
                </div>
              ) : (
                <code className="bg-gray-50 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                  {children}
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

const MessageBubble = React.memo(({ message, isStreaming, userName, assistantName }) => {
  const isUser = message.sender === 'user';
  
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
        <div className="text-sm font-medium text-gray-500 mb-1">
          {isUser ? userName || 'You' : assistantName || 'AI Assistant'}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}>
          <div className="prose prose-sm max-w-none">
            {processText(message.text)}
            {message.sender === 'ai' && isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </div>
        
        <span className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
});

const AIChatApp = ({ firebaseApp, mode = 'full', assistant, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const [chat, setChat] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(assistant);
  const [isMessageVisible, setIsMessageVisible] = useState(true);

  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const chatSessionRef = useRef(null);

  const cleanup = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsStreaming(false);
    setIsLoading(false);

    if (chatSessionRef.current) {
      try {
        await chatSessionRef.current.endChat();
      } catch (err) {
        console.warn('Error ending chat session:', err);
      }
      chatSessionRef.current = null;
    }

    setChat(null);
    setModel(null);
    setMessages([]);
    setError(null);
    setInputMessage('');
  }, []);

  const initializeAI = useCallback(async (assistantConfig) => {
    if (!assistantConfig) return;
    
    try {
      const vertexAI = getVertexAI(firebaseApp);
      const geminiModel = getGenerativeModel(vertexAI, {
        model: assistantConfig?.model === 'advanced' ? 'gemini-1.5-pro-002' : 'gemini-1.5-flash-002',
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.9,
          topP: 0.95,
        },
        safetySettings: [
          {
            'category': 'HARM_CATEGORY_HATE_SPEECH',
            'threshold': 'BLOCK_LOW_AND_ABOVE',
          },
          {
            'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold': 'BLOCK_LOW_AND_ABOVE',
          },
          {
            'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold': 'BLOCK_LOW_AND_ABOVE',
          },
          {
            'category': 'HARM_CATEGORY_HARASSMENT',
            'threshold': 'BLOCK_LOW_AND_ABOVE',
          }
        ],
        systemInstruction: {
          parts: [{ text: assistantConfig?.instructions || "You are a helpful AI assistant. Be concise and clear in your responses." }]
        }
      });
  
      // Initialize chat without history first
      const initialChat = await geminiModel.startChat();
      chatSessionRef.current = initialChat;
      setChat(initialChat);
      setModel(geminiModel);
  
      // If there's a first message, establish the conversation
      if (assistantConfig?.firstMessage) {
        // Send initial "Hello" message
        await initialChat.sendMessage([{ text: "Hello" }]);
        
        // Send the first message response
        await initialChat.sendMessage([{ text: assistantConfig.firstMessage }]);
  
        // Set the first message in the UI
        setMessages([{
          id: Date.now(),
          sender: 'ai',
          text: assistantConfig.firstMessage,
          timestamp: Date.now(),
        }]);
      }
  
    } catch (err) {
      setError('Error initializing AI: ' + err.message);
      console.error('Chat initialization error:', err);
    }
  }, [firebaseApp]);

  const handleClose = useCallback(async () => {
    await cleanup();
    if (onClose) {
      onClose();
    }
  }, [cleanup, onClose]);

  // Listen for assistant changes in Firebase
  useEffect(() => {
    if (!user?.uid || !assistant?.id) return;
  
    // Initial setup
    initializeAI(assistant);
  
    const db = getDatabase(firebaseApp);
    const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${assistant.id}`);
  
    const unsubscribe = onValue(assistantRef, (snapshot) => {
      const updatedAssistant = snapshot.val();
      if (updatedAssistant) {
        setCurrentAssistant(updatedAssistant);
        // Only reinitialize if resetToggle changed
        if (assistant.resetToggle !== updatedAssistant.resetToggle) {
          cleanup();
          initializeAI(updatedAssistant);
        }
      }
    });
  
    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanup();
    };
  }, [user?.uid, assistant?.id, firebaseApp, cleanup, initializeAI]);

  const handleScroll = useCallback((event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

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

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !chat) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    try {
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: inputMessage,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      const aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        timestamp: Date.now() + 1,
      }]);

      const streamResult = await chat.sendMessageStream([{ text: inputMessage }], {
        signal: abortControllerRef.current.signal,
      });

      let accumulatedText = '';
      for await (const chunk of streamResult.stream) {
        if (abortControllerRef.current?.signal.aborted) break;
        accumulatedText += chunk.candidates[0].content.parts[0].text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
        scrollToBottom();
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Streaming aborted');
      } else {
        setError('Error: ' + err.message);
        console.error('Chat error:', err);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      scrollToBottom();
    }
  }, [inputMessage, chat, scrollToBottom]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleReset = useCallback(async () => {
    if (!user?.uid || !assistant?.id) return;

    try {
      const db = getDatabase(firebaseApp);
      const assistantRef = ref(db, `edbotz/assistants/${user.uid}/${assistant.id}`);
      
      // Toggle the resetToggle value in Firebase
      await update(assistantRef, {
        resetToggle: !currentAssistant.resetToggle
      });
      
    } catch (err) {
      setError('Error resetting chat: ' + err.message);
      console.error('Reset error:', err);
    }
  }, [user?.uid, assistant?.id, firebaseApp, currentAssistant?.resetToggle]);

  return (
    <div className="flex flex-col h-full">
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
          disabled={isLoading || isStreaming}
          className="hover:bg-purple-100 text-purple-600"
          title="Reset Chat"
        >
          <RotateCcw className="w-5 h-5" />
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
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send)"
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />

            <div className="flex justify-between gap-2">
              {currentAssistant?.messageStarters && currentAssistant.messageStarters.length > 0 && (
                <ScrollArea className="w-full max-w-[70%]" orientation="horizontal">
                  <div className="flex gap-2">
                    {currentAssistant.messageStarters.map((starter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => setInputMessage(starter)}
                        disabled={isLoading}
                      >
                        {starter}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      {isStreaming ? 'Processing...' : 'Loading...'}
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
      </Card>
    </div>
  );
};

export default AIChatApp;
