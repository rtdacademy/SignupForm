import { useCallback, useRef, useState, useEffect } from 'react';

const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000];

const useEnhancedChatHandler = (scrollToBottom, initialMessage = null) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isChatReady, setIsChatReady] = useState(false);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const currentChatRef = useRef(null);

  // Reset state when chat changes
  const resetState = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
    setIsChatReady(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // Initialize chat session
  const initializeChat = useCallback(async (chat) => {
    if (!chat) return;
    
    resetState();
    currentChatRef.current = chat;
    setIsChatReady(true);

    // Add initial message if provided
    if (initialMessage) {
      setMessages([{
        id: Date.now(),
        sender: 'ai',
        text: initialMessage,
        timestamp: Date.now(),
      }]);
    }
  }, [resetState, initialMessage]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSendMessage = useCallback(async (inputMessage, chat) => {
    if (!inputMessage.trim() || !chat || !isChatReady) return;

    // Ensure we're using the most recent chat instance
    if (chat !== currentChatRef.current) {
      console.warn('Chat instance mismatch - reinitializing');
      await initializeChat(chat);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: Date.now() + 1,
    }]);

    const attemptStream = async (retryCount = 0) => {
      try {
        const streamResult = await chat.sendMessageStream([{ text: inputMessage }], {
          signal: abortControllerRef.current.signal,
        });

        let accumulatedText = '';
        for await (const chunk of streamResult.stream) {
          if (abortControllerRef.current?.signal.aborted) break;
          
          // Safe access of chunk properties
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            accumulatedText += text;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
              )
            );
            scrollToBottom();
          }
        }
        retryCountRef.current = 0;
        return true;
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Streaming aborted');
          return false;
        }

        if (err.message.includes('429') && retryCount < RETRY_DELAYS.length) {
          console.log(`Rate limited. Retrying in ${RETRY_DELAYS[retryCount]}ms`);
          setError(`Rate limit exceeded. Retrying in ${RETRY_DELAYS[retryCount] / 1000} seconds...`);
          await sleep(RETRY_DELAYS[retryCount]);
          return attemptStream(retryCount + 1);
        }

        throw err;
      }
    };

    try {
      await attemptStream();
    } catch (err) {
      console.error('Chat error:', err);
      setError(`Failed to send message. Please try again in a few moments.`);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId 
            ? { ...msg, text: "I apologize, but I'm experiencing technical difficulties. Please try again in a few minutes." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      scrollToBottom();
    }
  }, [scrollToBottom, isChatReady, initializeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      resetState();
    };
  }, [resetState]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    handleSendMessage,
    setMessages,
    initializeChat,
    resetState,
    isChatReady
  };
};

export default useEnhancedChatHandler;