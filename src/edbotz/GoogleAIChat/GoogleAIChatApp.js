import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader, Bot, Info, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { AI_MODEL_MAPPING } from '../utils/settings';

// Sample message component
const MessageBubble = ({ message, isStreaming = false, userName = 'You', assistantName = 'Google AI Assistant' }) => {
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
        {isUser ? <Send className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
          {isUser ? userName : assistantName}
          {isStreaming && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              Streaming
            </span>
          )}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none",
          isStreaming && "border border-indigo-200"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser && "[&_*]:text-white"
          )}>
            {message.text}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded"></span>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Main component
const GoogleAIChatApp = ({ firebaseApp = getApp() }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollAreaRef = useRef(null);
  
  // Initialize Firebase Functions
  const functions = getFunctions(firebaseApp, 'us-central1');
  const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
  
  // Scroll to bottom of chat
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
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Reset chat
  const handleReset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  // Send message to Google AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setError(null);
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };
    
    // Create a copy of the input message before clearing it
    const messageToSend = inputMessage;
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Create empty AI message placeholder for streaming
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: Date.now() + 1,
    }]);

    // Set streaming state
    setIsStreaming(true);
    
    try {
      // Call the Cloud Function with message and history
      const history = messages.slice(-10); // Keep last 10 messages for context
      
      // Log what we're sending to help debug
      console.log("Sending to AI:", {
        message: messageToSend,
        history: history,
        model: AI_MODEL_MAPPING.livechat.name,
        streaming: true // Enable streaming mode
      });
      
      // Format the data that we send to match what the Cloud Function expects
      const result = await sendChatMessage({
        message: messageToSend, // The actual text message to send
        history: history.map(msg => ({
          // Convert our internal message format to what the function expects
          sender: msg.sender, // 'user' or 'ai'
          text: msg.text
        })),
        model: AI_MODEL_MAPPING.livechat.name, // Using the live chat model from settings
        systemInstruction: "You are a helpful AI assistant that provides clear, accurate information.",
        streaming: true // Enable streaming mode
      });
      
      // Update the AI message with the response
      const aiResponse = result.data.text;
      
      // Note: In Firebase Functions v2, we can't do true streaming to the client
      // This simulates streaming by displaying the full response
      // For a real streaming experience, SSE or WebSockets would be needed
      
      // If you want to simulate the streaming effect in the UI:
      if (result.data.streaming) {
        // Simulate progressive typing effect
        let displayedText = '';
        const fullText = aiResponse;
        const words = fullText.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          displayedText += words[i] + ' ';
          
          // Update message with current text
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: displayedText } : msg
            )
          );
          
          // Small delay to simulate typing
          // This creates a visual effect of streaming
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      } else {
        // Regular non-streaming update
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
          )
        );
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorDetails = err.message || 'Failed to send message. Please try again.';
      setError(errorDetails);
      
      // Show detailed error information in the UI for debugging
      const errorMessage = err.code === 'functions/invalid-argument' 
        ? `API Error: ${errorDetails}` 
        : `I'm sorry, I encountered an error: ${errorDetails}`;
        
      // Update the AI message with the error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { 
            ...msg, 
            text: errorMessage
          } : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      scrollToBottom();
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full relative">
      <Card className="flex flex-col h-full border-0 rounded-none bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-br from-purple-50 to-indigo-50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-900">
                Google AI Chat
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isLoading || messages.length === 0}
                className="hover:bg-purple-100 text-purple-600"
                title="Reset Chat"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full"
          >
            <div className="p-4 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Welcome to Google AI Chat</p>
                  <p className="text-sm mt-2">This chat uses the Google Generative AI (Gemini) models through Firebase Cloud Functions.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && message === messages[messages.length - 1] && message.sender === 'ai'}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <CardFooter className="flex-shrink-0 border-t bg-white p-4 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2 w-full">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "Initializing..." : "Type your message... (Press Enter to send)"}
              className="resize-none min-h-[80px]"
              disabled={isLoading || isInitializing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isInitializing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0 self-end"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isStreaming ? 'Streaming response...' : 'Loading...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GoogleAIChatApp;