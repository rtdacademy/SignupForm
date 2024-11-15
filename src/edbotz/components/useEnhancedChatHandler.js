import { useCallback, useRef, useState } from 'react';

const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff delays in ms

const useEnhancedChatHandler = (scrollToBottom) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSendMessage = useCallback(async (inputMessage, chat) => {
    if (!inputMessage.trim() || !chat) return;

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
          accumulatedText += chunk.candidates[0].content.parts[0].text;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
            )
          );
          scrollToBottom();
        }
        retryCountRef.current = 0; // Reset retry count on success
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
      setError(`Failed to send message after ${RETRY_DELAYS.length} retries. Please try again later.`);
      console.error('Chat error:', err);
      
      // Update the AI message to indicate the error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId 
            ? { ...msg, text: "I apologize, but I'm experiencing high traffic right now. Please try again in a few minutes." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    handleSendMessage,
    setMessages,
  };
};

export default useEnhancedChatHandler;