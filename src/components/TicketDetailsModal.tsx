import React from 'react';
import { X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Ticket {
  id: string;
  conversation: Message[];
  status: string;
  created_at: string;
  auth_users_view: {
    email: string;
  };
}

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketDetailsModal({ ticket, onClose }: TicketDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Support Ticket Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              User: {ticket.auth_users_view.email}
            </p>
            <p className="text-sm text-gray-500">
              Created: {new Date(ticket.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Status: {ticket.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {ticket.conversation.map((message, index) => (
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
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}