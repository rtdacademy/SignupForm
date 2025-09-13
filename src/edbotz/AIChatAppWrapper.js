import React, { useMemo } from 'react';
import GoogleAIChatApp from './GoogleAIChat/GoogleAIChatApp';
import { getApp } from 'firebase/app';

/**
 * AIChatAppWrapper - Adapter component that converts EdBotz assistant configuration
 * to GoogleAIChatApp props format
 *
 * This wrapper allows the EdBotz system to use GoogleAIChatApp directly while
 * maintaining compatibility with the existing assistant configuration format.
 */
const AIChatAppWrapper = ({
  assistant,
  mode = 'full',
  firebaseApp = getApp(),
  onClose
}) => {
  // Convert assistant configuration to GoogleAIChatApp props
  const chatProps = useMemo(() => {
    if (!assistant) return null;

    // Map assistant model to AI model key
    const modelMapping = {
      'standard': 'DEFAULT_CHAT_MODEL',
      'advanced': 'FLASH',
      'basic': 'FLASH',
      'premium': 'PRO',
      // Add more mappings as needed
    };

    // Convert firstMessage HTML to plain text for initial conversation
    const stripHtml = (html) => {
      if (!html) return '';
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    // Build conversation history with assistant's first message
    const conversationHistory = [];

    // Only add first message if it exists
    if (assistant.firstMessage) {
      // Add a dummy user message to start the conversation
      conversationHistory.push({
        sender: 'user',
        text: 'Hello',
        timestamp: Date.now() - 2000
      });

      // Add the assistant's first message
      conversationHistory.push({
        sender: 'model',
        text: stripHtml(assistant.firstMessage),
        timestamp: Date.now() - 1000
      });
    }

    // If no first message, use default conversation
    if (conversationHistory.length === 0) {
      conversationHistory.push(
        {
          sender: 'user',
          text: 'Hello',
          timestamp: Date.now() - 2000
        },
        {
          sender: 'model',
          text: `Hello! I'm ${assistant.assistantName || 'your AI assistant'}. How can I help you today?`,
          timestamp: Date.now() - 1000
        }
      );
    }

    return {
      // Core configuration
      firebaseApp,
      instructions: assistant.instructions || "You are a helpful AI assistant that provides clear, accurate information.",
      conversationHistory,

      // AI model configuration
      aiModel: modelMapping[assistant.model] || 'DEFAULT_CHAT_MODEL',
      aiTemperature: 'BALANCED', // Can be made configurable if needed
      aiMaxTokens: 'MEDIUM', // Can be made configurable if needed

      // UI configuration
      showHeader: mode !== 'embedded', // Hide header in embedded mode
      showYouTube: true,
      showUpload: true,

      // Session management
      sessionIdentifier: `edbotz_${assistant.id || 'default'}`, // Unique session per assistant
      forceNewSession: true, // Always start fresh for each assistant

      // Tools configuration
      enabledTools: ['createVisualization'], // Enable JSXGraph visualizations

      // Message starters (if we want to display them)
      // Note: GoogleAIChatApp doesn't have built-in message starters UI,
      // but we could pass them as part of dynamicContext if needed
      dynamicContext: assistant.messageStarters?.length > 0 ? {
        messageStarters: assistant.messageStarters
      } : null,

      // Files and resources
      predefinedFiles: assistant.files || [],
      predefinedFilesDisplayNames: assistant.fileDisplayNames || {},

      // Additional context
      aiChatContext: {
        assistantName: assistant.assistantName,
        assistantId: assistant.id,
        entityType: assistant.entityType,
        contextData: assistant.contextData,
        messageToStudents: assistant.messageToStudents
      }
    };
  }, [assistant, mode, firebaseApp]);

  // Don't render if no assistant or props
  if (!assistant || !chatProps) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <p>No assistant configured</p>
        </div>
      </div>
    );
  }

  // Render GoogleAIChatApp with converted props
  return <GoogleAIChatApp {...chatProps} />;
};

export default AIChatAppWrapper;