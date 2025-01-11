import React, { useState } from "react";
import { Users, Star } from 'lucide-react';
import UsersTable from "../components/UserTable";
import InfluencersPanel from "../components/InfluencersPanel";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'influencers'>('users');

  const menuItems = [
    { icon: Users, label: 'Users', id: 'users' },
    { icon: Star, label: 'Influencers', id: 'influencers' },
  ];

  return (
    <div className="flex">
      <div className="h-full w-64 text-white fixed left-10 top-16">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8 mt-12">Admin Dashboard</h1>
          <nav>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'users' | 'influencers')}
                className={`flex items-center space-x-3 mt-2 p-3 rounded-lg transition-colors w-full ${
                  activeTab === item.id
                    ? 'border-2 border-gray-500 bg-blue-600 text-white'
                    : 'border-2 border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <main className="flex-1 ml-48 bg-gray-100 min-h-screen">
        <div className="p-8">
          {activeTab === 'users' ? <UsersTable /> : <InfluencersPanel />}
        </div>
      </main>
    </div>
  );
}