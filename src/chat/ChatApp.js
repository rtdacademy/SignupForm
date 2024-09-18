import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import MathModal from './MathModal';  // Import the new MathModal component

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to the class discussion! Today we'll be talking about photosynthesis. Can anyone explain the basic process?",
      sender: 'teacher',
      name: 'Ms. Johnson'
    },
    { 
      text: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.",
      sender: 'student',
      name: 'Alex'
    },
    { 
      text: "Great start, Alex! Let's dive deeper. Can someone explain the light-dependent and light-independent reactions?",
      sender: 'teacher',
      name: 'Ms. Johnson'
    },
    { 
      text: "The light-dependent reactions occur in the thylakoid membrane and require direct light energy. They convert light energy into chemical energy in the form of ATP and NADPH. The light-independent reactions, also known as the Calvin cycle, take place in the stroma and use the products of the light-dependent reactions to convert CO2 into glucose.",
      sender: 'user',
      name: 'Sarah (You)'
    },
    {
      text: "Excellent explanation, Sarah! Can anyone provide an example of how photosynthesis impacts our daily lives?",
      sender: 'teacher',
      name: 'Ms. Johnson'
    },
    {
      text: "Photosynthesis is crucial for producing the oxygen we breathe and the food we eat. It also helps regulate the Earth's climate by absorbing CO2 from the atmosphere.",
      sender: 'student',
      name: 'Emily'
    },
    {
      text: "Great point, Emily! Let's discuss how climate change might affect photosynthesis rates globally.",
      sender: 'teacher',
      name: 'Ms. Johnson'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMathModal, setShowMathModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([
        ...messages,
        { text: inputMessage, sender: 'user', name: 'Sarah (You)' },
      ]);
      setInputMessage('');
    }
  };

  const handleInsertMath = (latex) => {
    const latexCode = `$$${latex}$$`;
    setInputMessage(inputMessage + latexCode);
  };

  const getBubbleStyle = (sender, name) => {
    switch(name) {
      case 'Alex':
        return 'bg-blue-100';
      case 'Sarah (You)':
        return 'bg-green-100';
      case 'Ms. Johnson':
        return 'bg-gray-200';
      case 'Emily':
        return 'bg-purple-100';
      default:
        return 'bg-secondary bg-opacity-20';
    }
  };

  const parseMessageText = (text) => {
    const parts = text.split(/(\$\$.*?\$\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const latex = part.substring(2, part.length - 2);
        return <BlockMath key={index}>{latex}</BlockMath>;
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[calc(100%-180px)] flex flex-col-reverse">
        <div ref={messagesEndRef} />
        {messages.slice().reverse().map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } mb-4`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${getBubbleStyle(
                message.sender,
                message.name
              )} ${message.sender === 'user' ? 'ml-4' : 'mr-4'}`}
            >
              <p className="font-semibold mb-1">{message.name}</p>
              <p className="text-sm">{parseMessageText(message.text)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-highlight border-t border-border">
        <div className="flex flex-col space-y-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="w-full border border-input rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
            placeholder="Type your message or question..."
            rows={4}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMathModal(true)}
              className="flex-1 bg-secondary text-secondary-foreground rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out"
            >
              Insert Math
            </button>
            <button
              onClick={handleSendMessage}
              className="flex-1 bg-primary text-primary-foreground rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out flex items-center justify-center"
            >
              <Send size={24} className="mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>

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

export default ChatApp;