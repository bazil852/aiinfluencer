import React, { useState } from "react";
import { Users, Star, MessageSquare, Activity, CreditCard, Webhook } from 'lucide-react';
import UsersTable from "../components/UserTable";
import InfluencersPanel from "../components/InfluencersPanel";
import SupportTicketsPanel from "../components/SupportTicketsPanel";
import UsagePanel from "../components/UsagePanel";
import PlansPanel from "../components/PlansPanel";
import WebhookPanel from "../components/WebhookPanel";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'influencers' | 'tickets' | 'usage' | 'plans' | 'webhook'>('users');

  const menuItems = [
    { icon: Users, label: 'Users', id: 'users' },
    { icon: Star, label: 'Influencers', id: 'influencers' },
    { icon: MessageSquare, label: 'Support Tickets', id: 'tickets' },
    { icon: Activity, label: 'Usage', id: 'usage' },
    { icon: CreditCard, label: 'Plans', id: 'plans' },
    { icon: Webhook, label: 'Webhook', id: 'webhook' },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar - Fixed on desktop, slide-out on mobile */}
      <div className="bg-gray-900 md:h-screen md:w-64 md:fixed md:left-0 md:top-16 text-white z-10">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8 mt-4">Admin Dashboard</h1>
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'users' | 'influencers' | 'tickets' | 'usage' | 'plans')}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors whitespace-nowrap md:w-full ${
                  activeTab === item.id
                    ? 'border-2 border-gray-500 bg-blue-600 text-white'
                    : 'border-2 border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 bg-gray-100 min-h-screen md:ml-64 mt-16">
        <div className="p-4 md:p-8">
          {activeTab === 'users' ? (
            <UsersTable />
          ) : activeTab === 'influencers' ? (
            <InfluencersPanel />
          ) : activeTab === 'tickets' ? (
            <SupportTicketsPanel />
          ) : activeTab === 'usage' ? (
            <UsagePanel />
          ) : activeTab === 'plans' ? (
            <PlansPanel />
          ) : activeTab === 'webhook' ? (
            <WebhookPanel />
          ) : null}
        </div>
      </main>
    </div>
  );
}