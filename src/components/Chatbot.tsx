import React from 'react';
import { MessageSquare, X, Send, Loader2, Bug, HelpCircle, Wand2, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import OpenAI from 'openai';
import { useState, useRef, useEffect } from 'react';

interface HighlightInfo {
  selector: string;
  message: string;
}

interface NavigationInfo {
  path: string;
  highlight?: HighlightInfo;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationStarter {
  icon: React.ReactNode;
  text: string;
  prompt: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hey, I'm Casper, the friendly ghost... No i am an AI Assistant here to help you navigate the app. How can I assist you today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketButton, setShowTicketButton] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeHighlight, setActiveHighlight] = useState<HighlightInfo | null>(null);
  const { currentUser: user } = useAuthStore();

  // Navigation mappings with highlight information
  const navigationGuides: Record<string, NavigationInfo> = {
    'create-influencer': {
      path: '/dashboard',
      highlight: {
        selector: '[data-tour="create-influencer"]',
        message: 'Click this + button to create a new influencer'
      }
    },
    'settings': {
      path: '/settings',
      highlight: {
        selector: '[data-tour="settings"]',
        message: 'Here you can manage your API keys and account settings'
      }
    },
    'planner': {
      path: '/planner',
      highlight: {
        selector: '[data-tour="calendar"]',
        message: 'Use the content planner to create multiple videos at once'
      }
    }
  };

  // Handle highlight cleanup
  useEffect(() => {
    if (activeHighlight) {
      const element = document.querySelector(activeHighlight.selector);
      if (element) {
        element.classList.add(
          'ring-4',
          'ring-[#c9fffc]',
          'ring-opacity-100',
          'animate-pulse',
          'z-[60]'
        );
      }

      // Remove highlight after 5 seconds
      const timer = setTimeout(() => {
        if (element) {
          element.classList.remove(
            'ring-4',
            'ring-[#c9fffc]',
            'ring-opacity-100',
            'animate-pulse',
            'z-[60]'
          );
        }
        setActiveHighlight(null);
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (element) {
          element.classList.remove(
            'ring-4',
            'ring-[#c9fffc]',
            'ring-opacity-100',
            'animate-pulse',
            'z-[60]'
          );
        }
      };
    }
  }, [activeHighlight]);
  const conversationStarters: ConversationStarter[] = [
    {
      icon: <Bug className="h-5 w-5" />,
      text: "Report a Bug",
      prompt: "I'd like to report a bug I encountered in the app."
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      text: "AI Avatar Help",
      prompt: "I need help with creating or managing AI avatars."
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      text: "App Navigation",
      prompt: "Can you help me navigate through the app's features?"
    },
    {
      icon: <FileQuestion className="h-5 w-5" />,
      text: "General Questions",
      prompt: "I have some general questions about the platform."
    }
  ];

  // ... (keep existing systemPrompt)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show ticket button after 3 messages from user
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 3) {
      setShowTicketButton(true);
    }
  }, [messages]);

  const systemPrompt = `You are Casper, an AI assistant for the AI Influencer platform. You can help users navigate the app and explain features.

  When users ask about specific features, you should:
  1. Provide a clear explanation
  2. Guide them to the relevant page
  3. Explain how to use the feature

  Navigation commands you can use (use exactly these phrases):
  - NAVIGATE_TO: dashboard
  - NAVIGATE_TO: settings
  - NAVIGATE_TO: planner
  - NAVIGATE_TO: admin-panel

  Example: If a user asks "How do I create an influencer?", you should:
  1. Explain that they can create an influencer from the dashboard
  2. Include "NAVIGATE_TO: dashboard" in your response
  3. Explain the steps: "Click the + button in the top right, fill in the name and template ID..."

  Keep responses friendly and helpful. Always offer to explain more if needed.`;

  const handleNavigation = (response: string) => {
    const navigationMatch = response.match(/NAVIGATE_TO: ([\w-]+)/);
    console.log ("Navigate to: ",response);
    if (navigationMatch) {
      const destination = navigationMatch[1];
      const cleanResponse = response.replace(/NAVIGATE_TO: [\w-]+/, '').trim();
      
      // Add message first
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      
      // Navigate and show highlight if available
      setTimeout(() => {
        const path = navigationGuides[destination]?.path || `/${destination}`;
        navigate(path);
        
        // Set highlight after a short delay to ensure navigation is complete
        setTimeout(() => {
          if (navigationGuides[destination]?.highlight) {
            setActiveHighlight(navigationGuides[destination].highlight!);
          }
        }, 500);
      }, 2000);
      
      return;
    }
    
    // If no navigation, just add the message
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user?.openaiApiKey) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: user.openaiApiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';
      handleNavigation(assistantMessage);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleCreateTicket = async () => {
    if (!user) return;
    
    setIsCreatingTicket(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user.id,
            conversation: messages,
            status: 'open'
          }
        ]);

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Support ticket created successfully! Our team will review your conversation and get back to you soon.'
      }]);
      setShowTicketButton(false);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error creating your support ticket. Please try again later.'
      }]);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-tour="chatbot"
          className="fixed bottom-4 right-4 bg-[#c9fffc] text-black rounded-full p-3 shadow-lg hover:bg-[#a0fcf9] transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center p-4 bg-[#c9fffc] rounded-t-lg">
            <h3 className="font-medium text-black">Casper - AI Support</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <img
                    src="https://i.ibb.co/BgtVKG9/LIMITED-TIME-FREE-ACCESS-5.png"
                    alt="AI Assistant"
                    className="h-8 w-8 rounded-full mr-2 object-cover"
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-[#c9fffc] text-black'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {conversationStarters.map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterClick(starter.prompt)}
                    className="flex items-center gap-2 p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {starter.icon}
                    <span>{starter.text}</span>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <img
                  src="https://i.ibb.co/BgtVKG9/LIMITED-TIME-FREE-ACCESS-5.png"
                  alt="AI Assistant"
                  className="h-8 w-8 rounded-full mr-2 object-cover"
                />
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showTicketButton && (
            <div className="px-4 py-2 border-t border-gray-100">
              <button
                onClick={handleCreateTicket}
                disabled={isCreatingTicket}
                className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingTicket ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <FileQuestion className="h-5 w-5" />
                    Create Support Ticket
                  </>
                )}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about the app..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9fffc]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#c9fffc] text-black rounded-lg px-4 py-2 hover:bg-[#a0fcf9] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
      {activeHighlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[59]">
          <div 
            className="fixed bg-white rounded-lg p-4 shadow-lg z-[61]"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <p className="text-gray-900">{activeHighlight.message}</p>
          </div>
        </div>
      )}
    </>
  );
}