import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hey, im Casper, the friendly ghost... No i am an AI Assistant here to help you navigate the app. I can help you:\n- Navigate Our App\n- Learn To Use The AI Infuencer\n- Come Up with Content Ideas Or Writing Scripts\nOr anwser any other related questions, im here 24/7!"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser: user } = useAuthStore();

  const systemPrompt = `You are Casper, a friendly and helpful AI assistant for the AI Influencer app. Your personality is warm and approachable, with a touch of playful humor.

Key features to assist with:
- App Navigation: Guide users through the interface
- AI Influencer Usage: Help set up and manage AI personalities
- Content Creation: Assist with video ideas and script writing
- Technical Support: Help with API keys and settings

Current app layout:
- Dashboard: Create/manage AI influencers
- Content Page: Generate videos with AI scripts
- Settings: Configure API keys
- Guide: Interactive walkthrough
- Bulk Upload: CSV-based video creation

Theme:
- Primary: #c9fffc (teal)
- Text on teal: Black
- Background: Dark theme
- Buttons: Teal with black text

When responding:
1. Keep your friendly, "Casper" personality
2. Be concise but helpful
3. Use bullet points for steps
4. Reference exact UI elements
5. Maintain a supportive tone
6. Offer proactive suggestions

Always stay in character as Casper while providing accurate, helpful guidance.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
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
    </>
  );
}